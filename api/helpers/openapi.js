'use strict';

const YAML = require('js-yaml');
const JsonRefs = require('json-refs')
const log = require('../../api/helpers/log')('helpers:openapi')
const { baseUri } = require('../../config/config');

const resolveYamlRefs = async (swaggerFilePath) => {
  const resolverOptions = {
    // Resolve all remote references
    filter: ['relative', 'remote'],
    loaderOptions: {
      processContent: (res, cb) => cb(undefined, YAML.load(res.text))
    },
    onWarning: (err) => { log.warn(err) }
  };
  const { resolved } = await JsonRefs.resolveRefsAt(swaggerFilePath, resolverOptions);
  // Replace server with current env server.
  // for (let server of resolved.servers) {
  //   server.url = baseUri + server.url; 
  // }

  return resolved;
}

module.exports = { resolveYamlRefs };