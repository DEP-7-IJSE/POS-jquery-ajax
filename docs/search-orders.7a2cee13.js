// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"ts/dto/pagination.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pagination = void 0;

var Pagination = function () {
  function Pagination(elm, pageSize, totalRecords, callFn, selectedPage) {
    if (pageSize === void 0) {
      pageSize = 6;
    }

    if (selectedPage === void 0) {
      selectedPage = 1;
    }

    this.elm = elm;
    this.pageSize = pageSize;
    this.totalRecords = totalRecords;
    this.callFn = callFn;
    this.selectedPage = selectedPage;
    this.pageCount = 1;
    this.reInitialize(totalRecords, selectedPage, pageSize);
  }

  Pagination.prototype.reInitialize = function (totalRecords, selectedPage, pageSize) {
    var _this = this;

    if (selectedPage === void 0) {
      selectedPage = 1;
    }

    if (pageSize === void 0) {
      pageSize = 6;
    }

    this.pageCount = Math.ceil(totalRecords / pageSize);
    this.showOrHidePagination();
    if (this.pageCount <= 1) return;
    var html = "<li class=\"page-item\"><a class=\"page-link\" href=\"#!\">\xAB</a></li>";

    for (var i = 0; i < this.pageCount; i++) {
      html += "<li class=\"page-item " + (selectedPage === i + 1 ? 'active' : '') + "\"><a class=\"page-link\" href=\"javascript:void(0);\">" + (i + 1) + "</a></li>";
    }

    html += "<li class=\"page-item\"><a class=\"page-link\" href=\"javascript:void(0);\">\xBB</a></li>";
    this.elm.html(html);

    if (selectedPage === 1) {
      this.elm.find(".page-item:first-child").addClass('disabled');
    } else if (selectedPage === this.pageCount) {
      this.elm.find(".page-item:last-child").addClass('disabled');
    }

    this.elm.find(".page-item:first-child").on('click', function () {
      return _this.navigateToPage(selectedPage - 1);
    });
    this.elm.find(".page-item:last-child").on('click', function () {
      return _this.navigateToPage(selectedPage + 1);
    });
    var self = this;
    this.elm.find(".page-item:not(.page-item:first-child, .page-item:last-child)").on('click', function () {
      self.navigateToPage(+$(this).text());
    });
  };

  Pagination.prototype.showOrHidePagination = function () {
    this.pageCount > 1 ? this.elm.show() : this.elm.hide();
  };

  Pagination.prototype.navigateToPage = function (page) {
    if (page < 1 || page > this.pageCount) return;
    this.selectedPage = page;
    this.callFn();
  };

  return Pagination;
}();

exports.Pagination = Pagination;
},{}],"ts/search-orders.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var pagination_1 = require("./dto/pagination");

var BASE_API = 'http://localhost:8080/pos';
var ORDERS_SERVICE_API = BASE_API + "/orders";
var PAGE_SIZE = 6;
var PAGINATION = new pagination_1.Pagination($('.pagination'), PAGE_SIZE, 0, searchOrders);
searchOrders();
$('#btn-search').on('click', function (eventData) {
  eventData.preventDefault();
  searchOrders();
});
$("#txt-search").on('input', function () {
  searchOrders();
});

function searchOrders() {
  $.get(ORDERS_SERVICE_API, {
    page: PAGINATION.selectedPage,
    size: PAGE_SIZE,
    q: $('#txt-search').val()
  }).then(function (data, statusText, xhr) {
    $('#tbl-orders tbody tr').remove();
    var orders = data;
    orders.forEach(function (o) {
      var rowHtml = "<tr>\n            <td>" + o.orderId + "</td>\n            <td>" + o.orderDate + "</td>\n            <td>" + o.customerId + "</td>\n            <td>" + o.customerName + "</td>\n            <td>" + o.orderTotal.toFixed(2) + "</td>\n            </tr>\n            ";
      $('#tbl-orders tbody').append(rowHtml);
    });
    PAGINATION.reInitialize(+xhr.getResponseHeader('X-Total-Count').split('/')[0], PAGINATION.selectedPage, PAGE_SIZE);
  }).catch(function (xhr) {
    alert("Failed to search, something is wrong");
    console.error(xhr.responseText);
  });
}
},{"./dto/pagination":"ts/dto/pagination.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "42157" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","ts/search-orders.ts"], null)
//# sourceMappingURL=/search-orders.7a2cee13.js.map