"use strict";

exports.__esModule = true;
exports.definitions = undefined;

exports.default = function (_ref) {
  var t = _ref.types;

  function getRuntimeModuleName(opts) {
    return opts.moduleName || "babel-runtime";
  }

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  var HEADER_HELPERS = ["interopRequireWildcard", "interopRequireDefault"];
  return {
    pre: function pre(file) {
      var _this = this;

      var moduleName = getRuntimeModuleName(this.opts);

      if (this.opts.helpers !== false) {
        var baseHelpersDir = this.opts.useBuiltIns ? "helpers/builtin" : "helpers";
        var helpersDir = this.opts.useESModules ? baseHelpersDir + "/es6" : baseHelpersDir;
        file.set("helperGenerator", function (name) {
          var isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;
          var blockHoist = isInteropHelper && !(0, _babelHelperModuleImports.isModule)(file.path) ? 4 : undefined;
          return _this.addDefaultImport(moduleName + "/" + helpersDir + "/" + name, name, blockHoist);
        });
      }

      if (this.opts.polyfill && this.opts.useBuiltIns) {
        throw new Error("The polyfill option conflicts with useBuiltIns; use one or the other");
      }

      this.moduleName = moduleName;
      var cache = new Map();

      this.addDefaultImport = function (source, nameHint, blockHoist) {
        var cacheKey = (0, _babelHelperModuleImports.isModule)(file.path);
        var key = source + ":" + nameHint + ":" + (cacheKey || "");
        var cached = cache.get(key);

        if (cached) {
          cached = t.cloneDeep(cached);
        } else {
          cached = (0, _babelHelperModuleImports.addDefault)(file.path, source, {
            importedInterop: "uncompiled",
            nameHint: nameHint,
            blockHoist: blockHoist
          });
          cache.set(key, cached);
        }

        return cached;
      };
    },
    visitor: {
      ReferencedIdentifier: function ReferencedIdentifier(path, state) {
        var node = path.node,
            parent = path.parent,
            scope = path.scope;

        if (node.name === "regeneratorRuntime" && state.opts.regenerator !== false) {
          path.replaceWith(this.addDefaultImport(this.moduleName + "/regenerator", "regeneratorRuntime"));
          return;
        }

        if (state.opts.polyfill === false || state.opts.useBuiltIns) return;
        if (t.isMemberExpression(parent)) return;
        if (!has(_definitions2.default.builtins, node.name)) return;
        if (scope.getBindingIdentifier(node.name)) return;
        var moduleName = getRuntimeModuleName(state.opts);
        path.replaceWith(this.addDefaultImport(moduleName + "/core-js/" + _definitions2.default.builtins[node.name], node.name));
      },
      CallExpression: function CallExpression(path, state) {
        if (state.opts.polyfill === false || state.opts.useBuiltIns) return;
        if (path.node.arguments.length) return;
        var callee = path.node.callee;
        if (!t.isMemberExpression(callee)) return;
        if (!callee.computed) return;

        if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
          return;
        }

        var moduleName = getRuntimeModuleName(state.opts);
        path.replaceWith(t.callExpression(this.addDefaultImport(moduleName + "/core-js/get-iterator", "getIterator"), [callee.object]));
      },
      BinaryExpression: function BinaryExpression(path, state) {
        if (state.opts.polyfill === false || state.opts.useBuiltIns) return;
        if (path.node.operator !== "in") return;
        if (!path.get("left").matchesPattern("Symbol.iterator")) return;
        var moduleName = getRuntimeModuleName(state.opts);
        path.replaceWith(t.callExpression(this.addDefaultImport(moduleName + "/core-js/is-iterable", "isIterable"), [path.node.right]));
      },
      MemberExpression: {
        enter: function enter(path, state) {
          if (state.opts.polyfill === false || state.opts.useBuiltIns) return;
          if (!path.isReferenced()) return;
          var node = path.node;
          var obj = node.object;
          var prop = node.property;
          if (!t.isReferenced(obj, node)) return;
          if (node.computed) return;
          if (!has(_definitions2.default.methods, obj.name)) return;
          var methods = _definitions2.default.methods[obj.name];
          if (!has(methods, prop.name)) return;
          if (path.scope.getBindingIdentifier(obj.name)) return;

          if (obj.name === "Object" && prop.name === "defineProperty" && path.parentPath.isCallExpression()) {
            var call = path.parentPath.node;

            if (call.arguments.length === 3 && t.isLiteral(call.arguments[1])) {
              return;
            }
          }

          var moduleName = getRuntimeModuleName(state.opts);
          path.replaceWith(this.addDefaultImport(moduleName + "/core-js/" + methods[prop.name], obj.name + "$" + prop.name));
        },
        exit: function exit(path, state) {
          if (state.opts.polyfill === false || state.opts.useBuiltIns) return;
          if (!path.isReferenced()) return;
          var node = path.node;
          var obj = node.object;
          if (!has(_definitions2.default.builtins, obj.name)) return;
          if (path.scope.getBindingIdentifier(obj.name)) return;
          var moduleName = getRuntimeModuleName(state.opts);
          path.replaceWith(t.memberExpression(this.addDefaultImport(moduleName + "/core-js/" + _definitions2.default.builtins[obj.name], obj.name), node.property, node.computed));
        }
      }
    }
  };
};

var _babelHelperModuleImports = require("../babel-helper-module-imports");

var _definitions = require("./definitions");

var _definitions2 = _interopRequireDefault(_definitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.definitions = _definitions2.default;
