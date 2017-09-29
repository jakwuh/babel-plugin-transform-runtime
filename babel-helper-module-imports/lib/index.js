"use strict";

exports.__esModule = true;
exports.isModule = exports.ImportInjector = undefined;

var _isModule = require("./is-module");

Object.defineProperty(exports, "isModule", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_isModule).default;
  }
});
exports.addDefault = addDefault;
exports.addNamed = addNamed;
exports.addNamespace = addNamespace;
exports.addSideEffect = addSideEffect;

var _importInjector = require("./import-injector");

var _importInjector2 = _interopRequireDefault(_importInjector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.ImportInjector = _importInjector2.default;

function addDefault(path, importedSource, opts) {
  return new _importInjector2.default(path).addDefault(importedSource, opts);
}

function addNamed(path, name, importedSource, opts) {
  return new _importInjector2.default(path).addNamed(name, importedSource, opts);
}

function addNamespace(path, importedSource, opts) {
  return new _importInjector2.default(path).addNamespace(importedSource, opts);
}

function addSideEffect(path, importedSource, opts) {
  return new _importInjector2.default(path).addSideEffect(importedSource, opts);
}