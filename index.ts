/** fetch 中间件的 types */
type F<T> = {
  [key in keyof T]: { success: key; error: "error"; loading: "loading" }
};
type B<T> = { [key in keyof T]: key };

export const NO_ERROR_TYPES = -1;

/** 创建 Types */
export function composeTypes<T1, T2>(config: {
  prefix: string;
  BasicTypes: T1;
  FetchTypes: T2;
}): B<T1> & F<T2> {
  const {
    prefix,
    BasicTypes: actionTypes = {},
    FetchTypes: fetchActionTypes = {}
  } = config;
  const loading = "_LOADING";
  const success = "_SUCCESS";
  const error = "_ERROR";

  const types = { ...(actionTypes as any), ...(fetchActionTypes as any) };

  return new Proxy(types, {
    get(target, property: string) {
      if (fetchActionTypes.hasOwnProperty(property)) {
        let result = [] as any;

        if (fetchActionTypes[property] === NO_ERROR_TYPES) {
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

interface Action<key, T> {
  type: key;
  payload: T;
  meta?: any;
  params?: any;
}

export type ActionCreator<T> = <S>(
  type: S
) => (params?: T) => { type: S; payload: T };

const identify = arg => arg;

/**
 * 创建单个 action
 */
export function createAction<T>(type: T) {
  return <P, R = P>(fn: (params?: P, ...args: any[]) => R = identify) => (
    params?: P,
    ...args: any[]
  ) => {
    return {
      type,
      payload: fn(params, ...args)
    };
  };
}

interface IFetchTypes<key> {
  error: "error";
  success: key;
  loading: "loading";
}

export enum Method {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE"
}

/**
 * 创建 fetch action
 */
export function createFetchAction<Key>(
  types: IFetchTypes<Key>,
  url: string,
  method = Method.Get,
  meta?
) {
  return <Params, Response, R = Params>(
    fn: (params?: Params, ...args: any[]) => Params = identify
  ) => (params?: Params, ...args: any[]) => {
    const action = {
      types,
      meta,
      params: fn(params, ...args),
      url,
      method
    };

    return action as typeof action & { type: Key; payload: Response } & Partial<
        Promise<Response>
      >;
  };
}

type ActionMap<T> = {
  [key in keyof T]?: ((payload?: any, arg2?, arg3?, arg4?) => T[key])
};
type ValueOf<T> = T[keyof T];

/** 根据 Reducer Map 返回 全局 State */
export type ReturnState<ReducerMap> = {
  [key in keyof ReducerMap]: ReducerMap[key] extends (
    state: any,
    action: any
  ) => infer R
    ? R
    : any
};

/**
 *
 * 获取 actions 类型
 */
export function getActionDefinition<Actions>(actions: ActionMap<Actions>) {
  type ActionEnums =
    | ValueOf<Actions>
    | {
        type: "error";
        payload?: { message: string; [key: string]: any };
        params?: any;
        meta?: any;
      }
    | { type: "loading"; payload?: any; params?: any; meta?: any };

  return {} as ActionEnums;
}

/**
 *
 * 获取 mapStateToProps 的返回结果类型
 */
export function getMergedDefinetion<Result>(map: (state) => Result): Result {
  return;
}

export type Dispatch = <Payload>(
  action: { type?: string; payload?: Payload }
) => Promise<Payload>;

export type ThunkAction<Payload = never> = {
  type?: "@thunkAction";
  payload?: never;
  (dispatch: Dispatch, getState?: any): any;
} & Partial<Promise<Payload>>;

export class AsyncTuple<T> {
  /** 是否在加载中 */
  loading = true;
  /** 是否加载出错 */
  error = false;
  /** 出错的 message */
  message? = "";
  /** 具体的 data */
  data?: T;

  [x: string]: any;

  constructor(initLoading?: boolean | T, initData?: T) {
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

  static handleLoading<K extends keyof T, T extends Object>(
    stateKey: K,
    state: T,
    extraProps: Object = {}
  ): T {
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

  static handleSuccess<K extends keyof T, T extends Object>(
    stateKey: K,
    state: T,
    action,
    extraProps: Object = {}
  ): T {
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

  static handleError<K extends keyof T, T extends Object>(
    stateKey: K,
    state: T,
    action,
    extraProps: Object = {}
  ): T {
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
}

export type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
