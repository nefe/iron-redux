type F<T> = {
  [key in keyof T]: { success: key; error: "error"; loading: "loading" }
};
type B<T> = { [key in keyof T]: key };

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
        const result = [
          prefix + property + loading,
          prefix + property + success,
          prefix + property + error
        ] as any;

        result.loading = result[0];
        result.success = result[1];
        result.error = result[2];

        return result;
      }

      return prefix + property;
    }
  });
}

type Action<key, T> = {
  type: key;
  payload: T;
  meta?: any;
};

type Actions<T> = {
  [key in keyof T]: (payload?: T[key], meta?: any) => Action<key, T[key]>
};

export type ActionCreator<T> = <S>(
  type: S
) => (params?: T) => { type: S; payload: T };

const identify = <T>(arg: T) => arg;

export function createAction<T>(type: T) {
  return <P>(fn = identify) => (params?: P, ...args: any[]) => {
    return {
      type: type,
      payload: fn(params, ...args)
    };
  };
}

type ActionMap<T> = {
  [key in keyof T]?: ((payload?: any, arg2?, arg3?, arg4?) => T[key])
};
type ValueOf<T> = T[keyof T];

export function getActionDefinition<Actions>(actions: ActionMap<Actions>) {
  type Action =
    | ValueOf<Actions>
    | { type: "error"; payload: { message: string; [key: string]: any } }
    | { type: "loading"; payload: any };

  return {} as Action;
}

/**
 * 把 path 中的 `{ appName }` 替换成 `params` 中的值
 */
export function getUrl(path: string, params: any) {
  return path.replace(/\{([^\\}]*(?:\\.[^\\}]*)*)\}/gm, function(match, key) {
    key = key.trim();

    if (params[key] !== undefined) {
      return params[key];
    } else {
      console.warn("Please set value for template key: ", key);
      return "";
    }
  });
}

export class AsyncTuple<T> {
  /** 是否在加载中 */
  loading = true;
  /** 是否加载出错 */
  error = false;
  /** 出错的 message */
  message? = "";
  /** 具体的 data */
  data?: T;

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
