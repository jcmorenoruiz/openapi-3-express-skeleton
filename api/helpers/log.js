'use strict';
var globalNamespace = 'openapi';

function createLog(subNamespace) {
  function getStderrLogger(namespace) {
    return require('debug')(namespace);
  }

  function getStdoutLogger(namespace) {
    var logger = getStderrLogger(namespace);
    logger.log = console.log.bind(console); // bind to stdout
    return logger;
  }

  function getNamespace(loglevel, subNamespace) {
    return globalNamespace + ':' + loglevel + ':' + subNamespace;
  }

  var debug = function() {
    var logger = getStdoutLogger(getNamespace('debug', subNamespace));
    logger.color = 6;
    logger.apply(null, arguments);
  };

  var info;
  var log = info = function() { // jshint ignore: line
    var logger = getStdoutLogger(getNamespace('info', subNamespace));
    logger.color = 2;
    logger.apply(null, arguments);
  };

  var error = function() {
    var logger = getStderrLogger(getNamespace('error', subNamespace));
    logger.color = 1;
    logger.apply(null, arguments);
  };

  var warning;
  var warn = warning = function() { // jshint ignore: line
    var logger = getStdoutLogger(getNamespace('warn', subNamespace));
    logger.color = 3;
    logger.apply(null, arguments);
  };

  var audit = function() {
    var logger = getStdoutLogger(getNamespace('audit', subNamespace));
    logger.color = 4;
    logger.apply(null, arguments);
  };

  return {
    debug: debug,
    log: log,
    info: info,
    error: error,
    warning: warning,
    warn: warn,
    audit: audit
  };
}

exports = module.exports = createLog;
