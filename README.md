# [BETA] gerjs-fireflyio
Use gerJs library with Joi models validation + reformat input/ouput payload to API

Example : Soon...  

Help us to improve the project by contributing 👥  

## ☁️ Installation

```
$ Soon...
```

## 📝 Usage

Use [gerjs-core](https://github.com/dobobaie/gerjs) documentation to create `modelsAPI` file. 

### Initialization

Create a new instance :
  
Then create the models. [`Joi`](https://hapi.dev/family/joi/) is required.  

``` js
const modelsAPI = require("./models/models");
const gerJs = require("gerjs-fireflyio")({
  // same gerjs-core options | except `destinationPath` is not available
  exportTo: 'path/doc', // string ; optional
})(modelsAPI);
```

## ⚙️ GerJs initialization in Fireflyio side

``` js
const Fireflyio = require("fireflyio");
const FireflyioRouter = require("fireflyio-router");

const app = new Fireflyio();
app.extend(FireflyioRouter);

// please use all the middlewares before
app.use(gerJs.middleware(app.router)); // middleware to validate payload and reformat reponse | required

app.router
    // routes...
    .get("/swagger", gerJs.expose()) // expose the swagger documentation | optional
    .get("*", ctx => ctx.throw(boom.notFound()))
  ;

```

## 👥 Contributing

Please help us to improve the project by contributing :)  

## ❓️ Testing

Clone the repo and run from the project root:

```
$ npm install
$ npm test
```
