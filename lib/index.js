const fs = require('fs');
const gerJsCore = require('gerjs-core');
const {
  getContentTypeFromExtension,
  retrieveContentType,
  exportDirectory,
  matchRoute,
  _f
} = require('./utils');

const swaggerConfig = {
  directory: __dirname + '/../swagger/'
};

const executeGerJsCore = (options, models) =>
  gerJsCore(
    Object.assign({}, options, {
      destinationPath: swaggerConfig.directory
    })
  )(models).then(() =>
    options.exportTo
      ? exportDirectory(swaggerConfig.directory, options.exportTo)
      : true
  );

const renderSwaggerFile = ctx => {
  const extension = ctx.url.split('.').pop();
  ctx.set('Content-Type', getContentTypeFromExtension(extension));
  ctx.body = fs.createReadStream(swaggerConfig.directory + ctx.url);  
};

const reformatLastStep = options => (response, lastStep) => async ctx => {
  let body = response.type === 'object' ? {} : undefined;
  if (typeof(lastStep) === 'function') {
    let emptyNextData = undefined;
    const emptyNext = function(data) {
      emptyNextData = _f(data, body);
    };
    await lastStep(ctx, emptyNext);
    body = _f(emptyNextData, ctx.body, body);
  }
  const { value, error } = response
    .options({ stripUnknown: true, abortEarly: false })
    .validate(body);
  if (error) {
    throw new Error(error);
  }
  const contentType = retrieveContentType(response.type, response['$_terms'].metas);
  ctx.set('Content-Type', contentType);
  ctx.body = value;
};

const configFireflyioRouter = options => (router, models) => {
  router.modules.route._push = router.modules.route.push;
  router.modules.route.push = function(method, path, ...middlewares) {
    const route = method + path;
    if (models[route]) {
      const lastStep = middlewares.pop();
      middlewares.push(
        reformatLastStep(options)(models[route].response, lastStep)
      );
    }
    return router.modules.route._push(method, path, ...middlewares);
  };
};

const swaggerListFiles = fs.readdirSync(swaggerConfig.directory).map(file => '/' + file);
const middleware = options => models => router =>  {
  const listModels = Object.keys(models);
  configFireflyioRouter(options)(router, models);
  return async (ctx, next) => {
    if (swaggerListFiles.includes(ctx.url)) {
      return renderSwaggerFile(ctx);
    }

    const routeKey = matchRoute(listModels)({
      method: ctx.method,
      path: ctx.url.split('?').shift()
    });
    if (routeKey === undefined) {
      return await next();
    }

    const route = listModels[routeKey];
    
    if (models[route].queries) {
      const { value, error } = models[route].queries.validate(ctx.queries);
      if (error) {
        throw new Error(error);
      }
      ctx.queries = Object.assign({}, value);
    }

    if (models[route].body) {
      const payload = ctx.request.body || {};
      const { value, error } = models[route].body.validate(payload);
      if (error) {
        throw new Error(error);
      }
      ctx.request.body = Object.assign({}, value);
    }

    await next();
  };
};

const expose = (options, gerJs) => () => ctx => 
  gerJs
    .then(() => {
      ctx.set('Content-Type', 'text/html');
      ctx.body = fs.createReadStream(swaggerConfig.directory + '/index.html');
    });

module.exports = options => models => {
  const opt = options || {};
  const gerJs = executeGerJsCore(options, models);
  return {
    middleware: middleware(options)(models),
    expose: expose(options, gerJs)
  };
};
