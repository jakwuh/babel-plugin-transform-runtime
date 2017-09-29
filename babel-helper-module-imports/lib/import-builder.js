"use strict";

exports.__esModule = true;
exports.default = undefined;

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImportBuilder = function () {
  function ImportBuilder(importedSource, scope, file) {
    this._statements = [];
    this._resultName = null;
    this._scope = null;
    this._file = null;
    this._scope = scope;
    this._file = file;
    this._importedSource = importedSource;
  }

  ImportBuilder.prototype.done = function done() {
    return {
      statements: this._statements,
      resultName: this._resultName
    };
  };

  ImportBuilder.prototype.import = function _import() {
    var importedSource = this._file.resolveModuleSource(this._importedSource);

    this._statements.push(t.importDeclaration([], t.stringLiteral(importedSource)));

    return this;
  };

  ImportBuilder.prototype.require = function require() {
    var importedSource = this._file.resolveModuleSource(this._importedSource);

    this._statements.push(t.expressionStatement(t.callExpression(t.identifier("require"), [t.stringLiteral(importedSource)])));

    return this;
  };

  ImportBuilder.prototype.namespace = function namespace(name) {
    name = this._scope.generateUidIdentifier(name);
    var statement = this._statements[this._statements.length - 1];
    (0, _assert2.default)(statement.type === "ImportDeclaration");
    (0, _assert2.default)(statement.specifiers.length === 0);
    statement.specifiers = [t.importNamespaceSpecifier(name)];
    this._resultName = t.clone(name);
    return this;
  };

  ImportBuilder.prototype.default = function _default(name) {
    name = this._scope.generateUidIdentifier(name);
    var statement = this._statements[this._statements.length - 1];
    (0, _assert2.default)(statement.type === "ImportDeclaration");
    (0, _assert2.default)(statement.specifiers.length === 0);
    statement.specifiers = [t.importDefaultSpecifier(name)];
    this._resultName = t.clone(name);
    return this;
  };

  ImportBuilder.prototype.named = function named(name, importName) {
    if (importName === "default") return this.default(name);
    name = this._scope.generateUidIdentifier(name);
    var statement = this._statements[this._statements.length - 1];
    (0, _assert2.default)(statement.type === "ImportDeclaration");
    (0, _assert2.default)(statement.specifiers.length === 0);
    statement.specifiers = [t.importSpecifier(name, t.identifier(importName))];
    this._resultName = t.clone(name);
    return this;
  };

  ImportBuilder.prototype.var = function _var(name) {
    name = this._scope.generateUidIdentifier(name);
    var statement = this._statements[this._statements.length - 1];

    if (statement.type !== "ExpressionStatement") {
      (0, _assert2.default)(this._resultName);
      statement = t.expressionStatement(this._resultName);

      this._statements.push(statement);
    }

    this._statements[this._statements.length - 1] = t.variableDeclaration("var", [t.variableDeclarator(name, statement.expression)]);
    this._resultName = t.clone(name);
    return this;
  };

  ImportBuilder.prototype.defaultInterop = function defaultInterop() {
    return this._interop(this._file.addHelper("interopRequireDefault"));
  };

  ImportBuilder.prototype.wildcardInterop = function wildcardInterop() {
    return this._interop(this._file.addHelper("interopRequireWildcard"));
  };

  ImportBuilder.prototype._interop = function _interop(callee) {
    var statement = this._statements[this._statements.length - 1];

    if (statement.type === "ExpressionStatement") {
      statement.expression = t.callExpression(callee, [statement.expression]);
    } else if (statement.type === "VariableDeclaration") {
      (0, _assert2.default)(statement.declarations.length === 1);
      statement.declarations[0].init = t.callExpression(callee, [statement.declarations[0].init]);
    } else {
      _assert2.default.fail("Unexpected type.");
    }

    return this;
  };

  ImportBuilder.prototype.prop = function prop(name) {
    var statement = this._statements[this._statements.length - 1];

    if (statement.type === "ExpressionStatement") {
      statement.expression = t.memberExpression(statement.expression, t.identifier(name));
    } else if (statement.type === "VariableDeclaration") {
      (0, _assert2.default)(statement.declarations.length === 1);
      statement.declarations[0].init = t.memberExpression(statement.declarations[0].init, t.identifier(name));
    } else {
      _assert2.default.fail("Unexpected type:" + statement.type);
    }

    return this;
  };

  ImportBuilder.prototype.read = function read(name) {
    this._resultName = t.memberExpression(this._resultName, t.identifier(name));
  };

  return ImportBuilder;
}();

exports.default = ImportBuilder;