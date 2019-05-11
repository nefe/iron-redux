import * as get from 'lodash.get';

/** fetch 中间件的 types */
type F<T> = { [key in keyof T]: { success: key; error: 'error'; loading: 'loading' } };
type B<T> = { [key in keyof T]: key };

export const NO_ERROR_TYPES = -1;

const LOADING_SUFFIX = '_LOADING';
const SUCCESS_SUFFIX = '_SUCCESS';
const ERROR_SUFFIX = '_ERROR';

declare let Proxy: any;

/** 创建 Types */
export function composeTypes<T1, T2>(config: { prefix: string; BasicTypes: T1; FetchTypes: T2 }): B<T1> & F<T2> {
  const { prefix, BasicTypes: actionTypes = {}, FetchTypes: fetchActionTypes = {} } = config;

  const types = { ...(actionTypes as any), ...(fetchActionTypes as any) };
  const target = types;

  const res = {} as any;

  Object.keys(types).forEach(property => {
    if (fetchActionTypes.hasOwnProperty(property)) {
      let result = [] as any;

      if (fetchActionTypes[property] === NO_ERROR_TYPES) {
        result = [prefix + property + LOADING_SUFFIX, prefix + property + SUCCESS_SUFFIX, null];
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

interface Action<key, T> {
  type: key;
  payload: T;
  meta?: any;
  params?: any;
}

export type ActionCreator<T> = <S>(type: S) => (params?: T) => { type: S; payload: T };

const identify = arg => arg;

/**
 * 创建单个 action
 */
export function createAction<T>(type: T, stateKey = '') {
  return <P, R = P>(fn: (params?: P, ...args: any[]) => R = identify) => (params?: P, ...args: any[]) => {
    if (stateKey) {
      return {
        type,
        stateKey,
        payload: fn(params, ...args)
      };
    }

    return {
      type,
      payload: fn(params, ...args)
    };
  };
}

interface IFetchTypes<key> {
  error: 'error';
  success: key;
  loading: 'loading';
}

export enum Method {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE'
}

/**
 * 创建 fetch action
 */
export function createFetchAction<Key>(types: IFetchTypes<Key>, url: string, method = Method.Get) {
  return <Params, Response>(stateKey?: string) => (params?: Params, meta?) => {
    const action = {
      stateKey,
      types,
      meta,
      params,
      url,
      method
    };

    return action as typeof action & { type: Key; payload: Response } & Partial<Promise<Response>>;
  };
}

/** 根据 Reducer Map 返回 全局 State */
export type ReturnState<
  ReducerMap extends { [key: string]: (state: any, action: any) => any }
> = { [key in keyof ReducerMap]: ReturnType<ReducerMap[key]> };

type ValueOf<T> = T[keyof T];

/**
 *
 * 获取 action 类型
 */
export type ActionType<
  Actions extends { [key: string]: (...args: any[]) => any }
> =
  | ValueOf<{ [key in keyof Actions]: ReturnType<Actions[key]> }>
  | {
      type: 'error';
      payload?: { message: string; [key: string]: any };
      params?: any;
      meta?: any;
    }
  | { type: 'loading'; payload?: any; params?: any; meta?: any };

/**
 *
 * 获取 mapStateToProps 的返回结果类型
 */
export function getMergedDefinetion<Result>(map: (state) => Result): Result {
  return;
}

export type Dispatch = <Payload>(action: { type?: string; payload?: Payload }) => Promise<Payload>;

export type ThunkAction<Payload = never> = {
  type?: '@thunkAction';
  payload?: never;
  (dispatch: Dispatch, getState?: any): any;
} & Partial<Promise<Payload>>;

export class AsyncTuple<T> {
  /** 是否在加载中 */
  loading = true;
  /** 是否加载出错 */
  error = false;
  /** 出错的 message */
  message? = '';
  /** 具体的 data */
  data?: T;

  [x: string]: any;

  constructor(initLoading?: boolean | T, initData?: T) {
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

  static handleLoading<K extends keyof T, T extends Object>(stateKey: K, state: T, extraProps: Object = {}): T {
    const localState = state as any;
    const localKey = stateKey as string;

    return {
      ...localState,
      [localKey]: {
        ...localState[localKey],
        loading: true,
        error: false,
        ...extraProps
      }
    };
  }

  static handleSuccess<K extends keyof T, T extends Object>(stateKey: K, state: T, action, extraProps: Object = {}): T {
    const localState = state as any;
    const localKey = stateKey as string;

    return {
      ...localState,
      [localKey]: {
        ...localState[localKey],
        loading: false,
        error: false,
        data: action.payload,
        ...extraProps
      }
    };
  }

  static handleError<K extends keyof T, T extends Object>(stateKey: K, state: T, action, extraProps: Object = {}): T {
    const localState = state as any;
    const localKey = stateKey as string;

    return {
      ...localState,
      [localKey]: {
        ...localState[localKey],
        loading: false,
        error: true,
        message: action.payload.message || localState[localKey].message,
        ...extraProps
      }
    };
  }

  static defaultProcess<K extends keyof T, T extends Object>(
    stateKey: K,
    state: T,
    action,
    fetchType: 'loading' | 'success' | 'error' | 'normal'
  ): T {
    if (fetchType === 'loading') {
      return AsyncTuple.handleLoading(stateKey, state);
    } else if (fetchType === 'success') {
      return AsyncTuple.handleSuccess(stateKey, state, action);
    } else if (fetchType === 'error') {
      return AsyncTuple.handleError(stateKey, state, action);
    } else if (fetchType === 'normal') {
      return {
        ...(state as any),
        [stateKey]: action.payload
      };
    }

    return state;
  }

  static handleAll<State>(prefix: string, state: State, action, process = AsyncTuple.defaultProcess) {
    if (action.url && action.type && action.stateKey && action.type.startsWith(prefix)) {
      const actionType = action.type as any;
      let fetchType = '' as 'loading' | 'success' | 'error';

      if (actionType.endsWith(LOADING_SUFFIX)) {
        fetchType = 'loading';
      } else if (actionType.endsWith(SUCCESS_SUFFIX)) {
        fetchType = 'success';
      } else if (actionType.endsWith(ERROR_SUFFIX)) {
        fetchType = 'error';
      }

      return process(action.stateKey, state, action, fetchType);
    } else if (action.type && action.stateKey && action.type.startsWith(prefix)) {
      return process(action.stateKey, state, action, 'normal');
    }

    return state;
  }
}

export function safeGet<T, K1 extends keyof T>(data: T, keys: [K1], defaultValue): T[K1];
export function safeGet<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  data: T,
  keys: [K1, K2],
  defaultValue
): T[K1][K2];
export function safeGet<T, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
  data: T,
  keys: [K1, K2, K3],
  defaultValue
): T[K1][K2][K3];
export function safeGet<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(data: T, keys: [K1, K2, K3, K4], defaultValue): T[K1][K2][K3][K4];
export function safeGet<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4]
>(data: T, keys: [K1, K2, K3, K4, K5], defaultValue): T[K1][K2][K3][K4][K5];
export function safeGet<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
  K5 extends keyof T[K1][K2][K3][K4],
  K6 extends keyof T[K1][K2][K3][K4][K5]
>(data: T, keys: [K1, K2, K3, K4, K5, K6], defaultValue): T[K1][K2][K3][K4][K5][K6];
export function safeGet<T>(data: T, keys: any[], defaultValue) {
  return keys.reduce((obj, key) => {
    return get(obj, key, defaultValue);
  }, data);
}
