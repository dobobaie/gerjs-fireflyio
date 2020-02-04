const fs = require('fs');

const getContentTypeFromExtension = extension => {
  switch (extension)
  {
    case 'yml':
      return 'mime-types/mime-types-data';
    break;
    case 'png':
      return 'image/png';
    break;
    case 'css':
      return 'text/css';
    break;
    case 'js':
      return 'application/javascript';
    break;
    case 'map':
      return 'application/octet-stream';
    break;
    default:
      return '*';
  }
};

const retrieveContentType = (type, metas) => {
  switch (type)
  {
    case 'array':
    case 'object':
      return 'application/json';
    break;
    default:
      const meta = metas.find(meta => meta['Content-Type']);
      return (meta && meta['Content-Type']) || 'text/plain';
  }
}

const exportDirectory = (directory_source, directory_dest) => {
  const listFiles = fs.readdirSync(directory_source)
    .map(file => '/' + file);
  if (!fs.existsSync(directory_dest)) {
    fs.mkdirSync(directory_dest);
  }
  listFiles.map(file =>
    fs.copyFileSync(
      directory_source + '/' + file,
      directory_dest + '/' + file
    )
  );
};

const matchRoute = listRoutes => ({ method, path }) => {
  const paths = path.substring(1).split('/');
  return listRoutes.map((route, key) => {
    const routes = route.split('/');
    const _method = routes.shift().toUpperCase();
    return _method === method
      && routes.length === paths.length
      && routes.reduce((result, elemRoute, index) =>
          result && (elemRoute[0] === ':' || elemRoute === paths[index])
        , true)
      ? key
      : undefined
  })
  .filter(r => r !== undefined)
  .shift();
};

const _f = (...args) => args
  .filter(elem => elem !== undefined)
  .shift();

module.exports = ({
  getContentTypeFromExtension,
  retrieveContentType,
  exportDirectory,
  matchRoute,
  _f
});
