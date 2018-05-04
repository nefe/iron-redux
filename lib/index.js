"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_ERROR_TYPES = -1;
const LOADING_SUFFIX = "_LOADING";
const SUCCESS_SUFFIX = "_SUCCESS";
const ERROR_SUFFIX = "_ERROR";
function composeTypes(config) {
    const { prefix, BasicTypes: actionTypes = {}, FetchTypes: fetchActionTypes = {} } = config;
    const types = Object.assign({}, actionTypes, fetchActionTypes);
    return new Proxy(types, {
        get(target, property) {
            if (fetchActionTypes.hasOwnProperty(property)) {
                let result = [];
                if (fetchActionTypes[property] === exports.NO_ERROR_TYPES) {
                    result = [
                        prefix + property + LOADING_SUFFIX,
                        prefix + property + SUCCESS_SUFFIX,
                        null
                    ];
                    result.loading = result[0];
                    result.success = result[1];
                    return result;
                }
                result = [
                    prefix + property + LOADING_SUFFIX,
                    prefix + property + SUCCESS_SUFFIX,
                    prefix + property + ERROR_SUFFIX
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
function createFetchAction(types, url, method = Method.Get) {
    return (stateKey) => (params, meta) => {
        const action = {
            stateKey,
            types,
            meta,
            params,
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
    static defaultProcess(stateKey, state, action, fetchType) {
        if (fetchType === "loading") {
            return AsyncTuple.handleLoading(stateKey, state);
        }
        else if (fetchType === "success") {
            return AsyncTuple.handleSuccess(stateKey, state, action);
        }
        else if (fetchType === "error") {
            return AsyncTuple.handleError(stateKey, state, action);
        }
        return state;
    }
    static handleAll(state, action, process = AsyncTuple.defaultProcess) {
        if (action.url && action.type && action.stateKey) {
            const actionType = action.type;
            let fetchType = "";
            if (actionType.endsWith(LOADING_SUFFIX)) {
                fetchType = "loading";
            }
            else if (actionType.endsWith(SUCCESS_SUFFIX)) {
                fetchType = "success";
            }
            else if (actionType.endsWith(ERROR_SUFFIX)) {
                fetchType = "error";
            }
            return process(action.stateKey, state, action, fetchType);
        }
        return state;
    }
}
exports.AsyncTuple = AsyncTuple;
