"use strict";

exports.__esModule = true;
exports.default = undefined;

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

var _importBuilder = require("./import-builder");

var _importBuilder2 = _interopRequireDefault(_importBuilder);

var _isModule = require("./is-module");

var _isModule2 = _interopRequireDefault(_isModule);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImportInjector = function () {
  function ImportInjector(path, importedSource, opts) {
    this._defaultOpts = {
      importedSource: null,
      importedType: "commonjs",
      importedInterop: "babel",
      importingInterop: "babel",
      ensureLiveReference: false,
      ensureNoContext: false
    };
    var programPath = path.find(function (p) {
      return p.isProgram();
    });
    this._programPath = programPath;
    this._programScope = programPath.scope;
    this._file = programPath.hub.file;
    this._defaultOpts = this._applyDefaults(importedSource, opts, true);
  }

  ImportInjector.prototype.addDefault = function addDefault(importedSourceIn, opts) {
    return this.addNamed("default", importedSourceIn, opts);
  };

  ImportInjector.prototype.addNamed = function addNamed(importName, importedSourceIn, opts) {
    (0, _assert2.default)(typeof importName === "string");
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), importName);
  };

  ImportInjector.prototype.addNamespace = function addNamespace(importedSourceIn, opts) {
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), null);
  };

  ImportInjector.prototype.addSideEffect = function addSideEffect(importedSourceIn, opts) {
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), false);
  };

  ImportInjector.prototype._applyDefaults = function _applyDefaults(importedSource, opts, isInit) {
    if (isInit === void 0) {
      isInit = false;
    }

    var optsList = [];

    if (typeof importedSource === "string") {
      optsList.push({
        importedSource: importedSource
      });
      optsList.push(opts);
    } else {
      (0, _assert2.default)(!opts, "Unexpected secondary arguments.");
      optsList.push(importedSource);
    }

    var newOpts = Object.assign({}, this._defaultOpts);

    var _loop = function _loop(_opts) {
      if (!_opts) return "continue";
      Object.keys(newOpts).forEach(function (key) {
        if (_opts[key] !== undefined) newOpts[key] = _opts[key];
      });

      if (!isInit) {
        if (_opts.nameHint !== undefined) newOpts.nameHint = _opts.nameHint;
        if (_opts.blockHoist !== undefined) newOpts.blockHoist = _opts.blockHoist;
      }
    };

    for (var _i = 0; _i < optsList.length; _i++) {
      var _opts = optsList[_i];

      var _ret = _loop(_opts);

      if (_ret === "continue") continue;
    }

    return newOpts;
  };

  ImportInjector.prototype._generateImport = function _generateImport(opts, importName) {
    var isDefault = importName === "default";
    var isNamed = !!importName && !isDefault;
    var isNamespace = importName === null;
    var importedSource = opts.importedSource,
        importedType = opts.importedType,
        importedInterop = opts.importedInterop,
        importingInterop = opts.importingInterop,
        ensureLiveReference = opts.ensureLiveReference,
        ensureNoContext = opts.ensureNoContext,
        _opts$nameHint = opts.nameHint,
        nameHint = _opts$nameHint === undefined ? importName : _opts$nameHint,
        blockHoist = opts.blockHoist;
    var isMod = (0, _isModule2.default)(this._programPath, true);
    var isModuleForNode = isMod && importingInterop === "node";
    var isModuleForBabel = isMod && importingInterop === "babel";
    var builder = new _importBuilder2.default(importedSource, this._programScope, this._file);

    if (importedType === "es6") {
      if (!isModuleForNode && !isModuleForBabel) {
        throw new Error("Cannot import an ES6 module from CommonJS");
      }

      builder.import();

      if (isNamespace) {
        builder.namespace("namespace");
      } else if (isDefault || isNamed) {
        builder.named(nameHint, importName);
      }
    } else if (importedType !== "commonjs") {
      throw new Error("Unexpected interopType \"" + importedType + "\"");
    } else if (importedInterop === "babel") {
      if (isModuleForNode) {
        builder.import();

        if (isNamespace) {
          builder.default("es6Default").var(nameHint || "namespace").wildcardInterop();
        } else if (isDefault) {
          if (ensureLiveReference) {
            builder.default("es6Default").var("namespace").defaultInterop().read("default");
          } else {
            builder.default("es6Default").var(nameHint).defaultInterop().prop(importName);
          }
        } else if (isNamed) {
          builder.default("es6Default").read(importName);
        }
      } else if (isModuleForBabel) {
        builder.import();

        if (isNamespace) {
          builder.namespace("namespace");
        } else if (isDefault || isNamed) {
          builder.named(nameHint, importName);
        }
      } else {
        builder.require();

        if (isNamespace) {
          builder.var("namespace").wildcardInterop();
        } else if ((isDefault || isNamed) && ensureLiveReference) {
          builder.var("namespace").read(importName);
          if (isDefault) builder.defaultInterop();
        } else if (isDefault) {
          builder.var(nameHint).defaultInterop().prop(importName);
        } else if (isNamed) {
          builder.var(nameHint).prop(importName);
        }
      }
    } else if (importedInterop === "compiled") {
      if (isModuleForNode) {
        builder.import();

        if (isNamespace) {
          builder.default("namespace");
        } else if (isDefault || isNamed) {
          builder.default("namespace").read(importName);
        }
      } else if (isModuleForBabel) {
        builder.import();

        if (isNamespace) {
          builder.namespace("namespace");
        } else if (isDefault || isNamed) {
          builder.named(nameHint, importName);
        }
      } else {
        builder.require();

        if (isNamespace) {
          builder.var("namespace");
        } else if (isDefault || isNamed) {
          if (ensureLiveReference) {
            builder.var("namespace").read(importName);
          } else {
            builder.prop(importName).var(nameHint);
          }
        }
      }
    } else if (importedInterop === "uncompiled") {
      if (isDefault && ensureLiveReference) {
        throw new Error("No live reference for commonjs default");
      }

      if (isModuleForNode) {
        builder.import();

        if (isNamespace) {
          builder.default("namespace");
        } else if (isDefault) {
          builder.default(nameHint);
        } else if (isNamed) {
          builder.default("namespace").read(importName);
        }
      } else if (isModuleForBabel) {
        builder.import();

        if (isNamespace) {
          builder.default("namespace");
        } else if (isDefault) {
          builder.default(nameHint);
        } else if (isNamed) {
          builder.named(nameHint, importName);
        }
      } else {
        builder.require();

        if (isNamespace) {
          builder.var("namespace");
        } else if (isDefault) {
          builder.var(nameHint);
        } else if (isNamed) {
          if (ensureLiveReference) {
            builder.var("namespace").read(importName);
          } else {
            builder.var(nameHint).prop(importName);
          }
        }
      }
    } else {
      throw new Error("Unknown importedInterop \"" + importedInterop + "\".");
    }

    var _builder$done = builder.done(),
        statements = _builder$done.statements,
        resultName = _builder$done.resultName;

    this._insertStatements(statements, blockHoist);

    if ((isDefault || isNamed) && ensureNoContext && resultName.type !== "Identifier") {
      return t.sequenceExpression([t.numericLiteral(0), resultName]);
    }

    return resultName;
  };

  ImportInjector.prototype._insertStatements = function _insertStatements(statements, blockHoist) {
    if (blockHoist === void 0) {
      blockHoist = 3;
    }

    statements.forEach(function (node) {
      node._blockHoist = blockHoist;
    });

    var targetPath = this._programPath.get("body").filter(function (p) {
      var val = p.node._blockHoist;
      return Number.isFinite(val) && val < 4;
    })[0];

    if (targetPath) {
      targetPath.insertBefore(statements);
    } else {
      this._programPath.unshiftContainer("body", statements);
    }
  };

  return ImportInjector;
}();

exports.default = ImportInjector;