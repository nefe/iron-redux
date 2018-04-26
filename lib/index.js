"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_ERROR_TYPES = -1;
function composeTypes(config) {
    const { prefix, BasicTypes: actionTypes = {}, FetchTypes: fetchActionTypes = {} } = config;
    const loading = "_LOADING";
    const success = "_SUCCESS";
    const error = "_ERROR";
    const types = Object.assign({}, actionTypes, fetchActionTypes);
    return new Proxy(types, {
        get(target, property) {
            if (fetchActionTypes.hasOwnProperty(property)) {
                let result = [];
                if (fetchActionTypes[property] === exports.NO_ERROR_TYPES) {
                    result = [
                        prefix + property + loading,
                        prefix + property + success,
                        null
                    ];
                    result.loading = result[0];
                    result.success = result[1];
                    return result;
                }
                result = [
                    prefix + property + loading,
                    prefix + property + success,
                    prefix + property + error
                ];
                result.loading = result[0];
                result.success = result[1];
                result.error = result[2];
                return result;
            }
            return prefix + property;
        }
    });
}
exports.composeTypes = composeTypes;
const identify = arg => arg;
function createAction(type) {
    return (fn = identify) => (params, ...args) => {
        return {
            type,
            payload: fn(params, ...args)
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
function createFetchAction(types, url, method = Method.Get, meta) {
    return (fn = identify) => (params, ...args) => {
        const action = {
            types,
            meta,
            params: fn(params, ...args),
            url,
            method
        };
        return action;
    };
}
exports.createFetchAction = createFetchAction;
function getActionDefinition(actions) {
    return {};
}
exports.getActionDefinition = getActionDefinition;
function getMergedDefinetion(map) {
    return;
}
exports.getMergedDefinetion = getMergedDefinetion;
class AsyncTuple {
    constructor(initLoading, initData) {
        this.loading = true;
        this.error = false;
        this.message = "";
        if (typeof initLoading === "boolean") {
            this.loading = initLoading;
        }
        if (typeof initLoading === "object") {
            this.data = initLoading;
        }
        if (typeof initData === "object") {
            this.data = initData;
        }
    }
    static handleLoading(stateKey, state, extraProps = {}) {
        const localState = state;
        const localKey = stateKey;
        return Object.assign({}, localState, { [localKey]: Object.assign({}, localState[localKey], { loading: true, error: false }, extraProps) });
    }
    static handleSuccess(stateKey, state, action, extraProps = {}) {
        const localState = state;
        const localKey = stateKey;
        return Object.assign({}, localState, { [localKey]: Object.assign({}, localState[localKey], { loading: false, error: false, data: action.payload }, extraProps) });
    }
    static handleError(stateKey, state, action, extraProps = {}) {
        const localState = state;
        const localKey = stateKey;
        return Object.assign({}, localState, { [localKey]: Object.assign({}, localState[localKey], { loading: false, error: true, message: action.payload.message || localState[localKey].message }, extraProps) });
    }
}
exports.AsyncTuple = AsyncTuple;
