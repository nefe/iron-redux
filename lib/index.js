"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var get = require("lodash.get");
exports.NO_ERROR_TYPES = -1;
var LOADING_SUFFIX = '_LOADING';
var SUCCESS_SUFFIX = '_SUCCESS';
var ERROR_SUFFIX = '_ERROR';
function composeTypes(config) {
    var prefix = config.prefix, _a = config.BasicTypes, actionTypes = _a === void 0 ? {} : _a, _b = config.FetchTypes, fetchActionTypes = _b === void 0 ? {} : _b;
    var types = __assign({}, actionTypes, fetchActionTypes);
    var target = types;
    var res = {};
    Object.keys(types).forEach(function (property) {
        if (fetchActionTypes.hasOwnProperty(property)) {
            var result = [];
            if (fetchActionTypes[property] === exports.NO_ERROR_TYPES) {
                result = [
                    prefix + property + LOADING_SUFFIX,
                    prefix + property + SUCCESS_SUFFIX,
                    null
                ];
                result.loading = result[0];
                result.success = result[1];
                res[property] = result;
                return;
            }
            result = [
                prefix + property + LOADING_SUFFIX,
                prefix + property + SUCCESS_SUFFIX,
                prefix + property + ERROR_SUFFIX
            ];
            result.loading = result[0];
            result.success = result[1];
            result.error = result[2];
            res[property] = result;
            return;
        }
        res[property] = prefix + property;
    });
    return res;
}
exports.composeTypes = composeTypes;
var identify = function (arg) { return arg; };
function createAction(type, stateKey) {
    if (stateKey === void 0) { stateKey = ''; }
    return function (fn) {
        if (fn === void 0) { fn = identify; }
        return function (params) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return {
                type: type,
                stateKey: stateKey,
                payload: fn.apply(void 0, [params].concat(args))
            };
        };
    };
}
exports.createAction = createAction;
var Method;
(function (Method) {
    Method["Get"] = "GET";
    Method["Post"] = "POST";
    Method["Put"] = "PUT";
    Method["Delete"] = "DELETE";
})(Method = exports.Method || (exports.Method = {}));
function createFetchAction(types, url, method) {
    if (method === void 0) { method = Method.Get; }
    return function (stateKey) { return function (params, meta) {
        var action = {
            stateKey: stateKey,
            types: types,
            meta: meta,
            params: params,
            url: url,
            method: method
        };
        return action;
    }; };
}
exports.createFetchAction = createFetchAction;
function getMergedDefinetion(map) {
    return;
}
exports.getMergedDefinetion = getMergedDefinetion;
var AsyncTuple = (function () {
    function AsyncTuple(initLoading, initData) {
        this.loading = true;
        this.error = false;
        this.message = '';
        if (typeof initLoading === 'boolean') {
            this.loading = initLoading;
        }
        if (typeof initLoading === 'object') {
            this.data = initLoading;
        }
        if (typeof initData === 'object') {
            this.data = initData;
        }
    }
    AsyncTuple.handleLoading = function (stateKey, state, extraProps) {
        if (extraProps === void 0) { extraProps = {}; }
        var _a;
        var localState = state;
        var localKey = stateKey;
        return __assign({}, localState, (_a = {}, _a[localKey] = __assign({}, localState[localKey], { loading: true, error: false }, extraProps), _a));
    };
    AsyncTuple.handleSuccess = function (stateKey, state, action, extraProps) {
        if (extraProps === void 0) { extraProps = {}; }
        var _a;
        var localState = state;
        var localKey = stateKey;
        return __assign({}, localState, (_a = {}, _a[localKey] = __assign({}, localState[localKey], { loading: false, error: false, data: action.payload }, extraProps), _a));
    };
    AsyncTuple.handleError = function (stateKey, state, action, extraProps) {
        if (extraProps === void 0) { extraProps = {}; }
        var _a;
        var localState = state;
        var localKey = stateKey;
        return __assign({}, localState, (_a = {}, _a[localKey] = __assign({}, localState[localKey], { loading: false, error: true, message: action.payload.message || localState[localKey].message }, extraProps), _a));
    };
    AsyncTuple.defaultProcess = function (stateKey, state, action, fetchType) {
        var _a;
        if (fetchType === 'loading') {
            return AsyncTuple.handleLoading(stateKey, state);
        }
        else if (fetchType === 'success') {
            return AsyncTuple.handleSuccess(stateKey, state, action);
        }
        else if (fetchType === 'error') {
            return AsyncTuple.handleError(stateKey, state, action);
        }
        else if (fetchType === 'normal') {
            return __assign({}, state, (_a = {}, _a[stateKey] = action.payload, _a));
        }
        return state;
    };
    AsyncTuple.handleAll = function (prefix, state, action, process) {
        if (process === void 0) { process = AsyncTuple.defaultProcess; }
        if (action.url &&
            action.type &&
            action.stateKey &&
            action.type.startsWith(prefix)) {
            var actionType = action.type;
            var fetchType = '';
            if (actionType.endsWith(LOADING_SUFFIX)) {
                fetchType = 'loading';
            }
            else if (actionType.endsWith(SUCCESS_SUFFIX)) {
                fetchType = 'success';
            }
            else if (actionType.endsWith(ERROR_SUFFIX)) {
                fetchType = 'error';
            }
            return process(action.stateKey, state, action, fetchType);
        }
        else if (action.type &&
            action.stateKey &&
            action.type.startsWith(prefix)) {
            return process(action.stateKey, state, action, 'normal');
        }
        return state;
    };
    return AsyncTuple;
}());
exports.AsyncTuple = AsyncTuple;
function safeGet(data, keys) {
    return keys.reduce(function (obj, key) {
        return get(obj, key);
    }, data);
}
exports.safeGet = safeGet;
