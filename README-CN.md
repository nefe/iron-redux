<div align="center">
  <img src="https://img.alicdn.com/tfs/TB1olCdDAzoK1RjSZFlXXai4VXa-275-183.png" height="64">
  <h2>iron-redux - 一个类型完美的 Redux 去形式化的库。</h2>
</div>

[![npm version](https://badge.fury.io/js/iron-redux.png)](https://badge.fury.io/js/iron-redux)
[![npm downloads](https://img.shields.io/npm/dt/iron-redux.svg?style=flat-square)](https://www.npmjs.com/package/iron-redux)
[![Gitter](https://badges.gitter.im/nefe/iron-redux.svg)](https://gitter.im/nefe/iron-redux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## 安装

npm:

```sh
npm i -S iron-redux
```

yarn:

```sh
yarn add iron-redux
```

## 特性

- 巧妙利用 Typescript 的类型推导能力，不需要额外定义任何类型，可以使 redux 整体流程类型完美。
- 让 Redux 代码极其精简！去除任何冗余的、形式化的代码！参看 [example](https://github.com/nefe/iron-redux/blob/master/examples/redux.tsx)。
- 自动推导出整个项目的 Redux 全局状态树的类型。
- 让 reducer 每个 case 都能获取不同的 action 类型，可在 vscode 中参看 [example](https://github.com/nefe/iron-redux/blob/master/examples/redux.tsx)；
- vscode IDE [插件](https://github.com/nefe/vscode-toolkits)支持。
- 非常轻量级！源码只有 300 行！零依赖！

# 使用文档

## 1、action type

简单的 action type 可以增加至 enum BasicTypes。复杂的 action type 可以增加到 enum FetchTypes。所有的 action type 可以在 Types 中获取：

```typescript
enum BasicTypes {
  changeId
}
enum FetchTypes {
  fetchId,
  // 这样拿到的 Types.loadData 相当于没有 Error Type。因此 View中可以 .catch
  loadData = NO_ERROR_TYPES
}
const prefix = 'test/';
const Types = composeTypes({
  prefix,
  BasicTypes,
  FetchTypes
});

// Types.changeId === 'test/changeId';
// Types.fetchId.success === 'test/changeId_SUCCESS';
// Types.fetchId.loading === 'test/changeId_LOADING';
// Types.fetchId.error === 'test/changeId_ERROR';
```

## 2、actionCreators

### 简单的 actionCreator

增加简单的 actionCreator，可以调用 createAction(actionType)<payload 类型>(payload 转换函数)

```typescript
const actions = {
  changeId: createAction(Types.changeId)<number>()
};

// 调用
// actions.changeId(3);  返回： { type: 'test/chagneId', payload: 3 };
```

### createAction 也可以传入 payload 转换函数

```
const actions = {
  changeId: createAction(Types.changeId)((id: number) => {
    return {
      id,
    };
  }),
};

// 调用
// action.changeId(3); 返回： { type: 'test/changeId', payload: { id: 3} }
```

当然你也可以不用 createAction，自己手写 action。但是记得一定要完善类型不要使用 any。如：

```
const actions = {
    changeId(id: number) {
      return { type: Types.changeId, payload: id };
    },
};
```

### thunkAction

thunkAction 的返回类型请使用 ThunkAction 来声明。dispatch 已经拥有类型。getState 请使用已经定义好的 GetState 类型。

```typescript
const actions = {
  putUdf: some action,
  updateFunc(params: Params): ThunkAction {
    return async (dispatch, getState: GetState) => {
      // 此处可以拿到 result 的类型为 putUdf 这个接口的返回类型
      const result = await dispatch(actions.putUdf(params));
    };
  },
}
```

ThunkAction 返回 Promise：

```typescript
const actions = {
  updateFunc(params: Params): ThunkAction<Response> {
    return async (dispatch, getState: GetState) => {
      // 此处可以拿到 result 的类型为 putUdf 这个接口的返回类型
      const result = await dispatch(actions.putUdf(params));

      // const state = getState();
      // 返回这个Promise，供view中使用
      return dispatch(actions.loadDetailFuncInfo(params.udfId));
    };
  }
};

// view 中
this.props.updateFunc.then(data => {});
```

## 3、InitialState

- 1、复杂的属性可以尽量写些注释，方便调用的时候可以辨识。
- 2、接口返回类型如果要处理 loading、error。请使用 AsyncTuple。使用 API 中的 init 一方面提供了类型，一方面提供了接口的初始值，该初始值可以防止复杂对象后端返回 undefined
- 3、InitialState 里不要有各种 loading、error 字段，代码阅读者无法区分这是哪个请求的 loading 或者 error。建议都使用 AsyncTuple 来做。

```typescript
class InitialState {
  isDialogVisible = false;
  detailFuncInfo = new AsyncTuple(API.ideFunction.getDetailById.init);
  id = 0;
}
```

## 4、AsyncTuple

存储某个数据及其 loading error 状态的类。包含静态方法 `handleLoading`, `handleError`, `handleSuccess`。

```
class InitialState {
  data = new AsyncTuple(someResponse);
}
```

使用静态方法

```
case Types.loadData.loading: {
  return AsyncTuple.handleLoading("data", state);
}
case Types.loadData.success: {
  return AsyncTuple.handleSuccess("data", state, action);
}
case Types.loadData.error: {
  return AsyncTuple.handleError("data", state, action);
}
```

使用数据：

```
const state: InitialState;

state.data.loading
stata.data.data
state.data.error
```

## 5、reducer

reducer 没有什么好说的。根据自己的需求写就好了。AsyncTuple 的 case 可以使用如下方法调用。

```typescript
    case Types.loadUdfFuncInfo.loading: {
      return AsyncTuple.handleLoading("udfFuncInfo", state);
    }
    case Types.loadUdfFuncInfo.success: {
      return AsyncTuple.handleSuccess("udfFuncInfo", state, action);
    }
    case Types.loadUdfFuncInfo.error: {
      return AsyncTuple.handleError("udfFuncInfo", state, action);
    }
```

## 6、handleAll

为了避免在 reducer 的各种 case 中处理冗余而啰嗦的 AsyncTuple 逻辑（包括 handleError、handleLoading、handleSuccess）。可以在 default 中使用 handleAll 方法。

```
const actions = {
  // 注意在action处要指定字段名： listData
  fetch: ApI.xx.xx.createFetchAction(Types.fetch, 'listData'),
};

class InitialState {
  // 注意该对应字段默认应该是 AsyncTuple。
  listData = new AsyncTuple();
}

/**
 * reducer
 */
function reducer(
  state = new InitialState(),
  action: ActionType<typeof actions>
): InitialState {
  switch (action.type) {
    // 这里可以避免写各种 AsyncTuple。
    default: {
      return AsyncTuple.handleAll(prefix, state, action);
    }
  }
}
```

其中 AsyncTuple.handleAll 是可以由用户来自定义的：

```
// 自定义处理函数
function process<K extends keyof T, T extends Object>(
    stateKey: K,
    state: T,
    action,
    fetchType: "loading" | "success" | "error"
  ): T {
    if (fetchType === "loading") {
      return AsyncTuple.handleLoading(stateKey, state);
    } else if (fetchType === "success") {
      return AsyncTuple.handleSuccess(stateKey, state, action);
    } else if (fetchType === "error") {
      return AsyncTuple.handleError(stateKey, state, action);
    }

    return state;
}

/**
 * reducer
 */
function reducer(
  state = new InitialState(),
  action: ActionType<typeof actions>
): InitialState {
  switch (action.type) {
    // 这里可以避免写各种 AsyncTuple。
    default: {
        AsyncTuple.handleAll(prefix, state, action, process)
    }
  }
}
```

## 衍生数据

如果，mapStateToProps 进行数据加工，则会产生一些衍生数据。衍生数据类型可以用如下方法产生：

```
function mapStateToProps(state: GlobalState, props: Props) {
  return ...;
}

type ReactProps = ReturnType<typeof mapStateToProps> & Props & typeof actions;
```

## 获取 Redux 全局 State 类型

```
const rootReducers = {
  a: AReducer,
  b: BReducer,
};
const rootReducer = combineReducer(rootReducers);

export type RootState = ReturnState<typeof rootReducers>;
```

# 工具

vscode IDE 可以安装 nelfe-toolkits。

- 1、支持 redux 文件的 snippets
- 2、可以按 cmd + ctrl + a，然后根据提示创建 action。
- 3、持续添加中...

# 建议

除了用 handleAll 来避免异步 action 的冗余代码，简单的 action 也可以用如下方式避免冗余代码：

```typescript
const actions = {
  // 同时传入 key 和 value。
  setConfig<Key extends keyof Config>(key: Key, value: Config[Key]) {
    return {
      type: Types.setConfig,
      payload: {
        key,
        value
      }
    };
  },
};

reducer:
    case Types.setConfig: {
      const { payload } = action;

      return {
        ...state,
        config: {
          ...state.config,
          [payload.key]: payload.value
        }
      };
    }

```
