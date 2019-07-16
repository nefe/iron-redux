<div align="center">
  <img src="https://img.alicdn.com/tfs/TB1olCdDAzoK1RjSZFlXXai4VXa-275-183.png" height="64">
  <h2>iron-redux - 一个类型完美的 Redux 去形式化的库。</h2>
</div>

[![npm version](https://badge.fury.io/js/iron-redux.png)](https://badge.fury.io/js/iron-redux)
[![npm downloads](https://img.shields.io/npm/dt/iron-redux.svg?style=flat-square)](https://www.npmjs.com/package/iron-redux)
[![Gitter](https://badges.gitter.im/nefe/iron-redux.svg)](https://gitter.im/nefe/iron-redux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## 特性

- iron-redux 提供了有效的方法来创建类型安全的 redux 类型，巧妙利用 Typescript 的类型推导能力，不需要额外定义任何类型，可以使 redux 整体流程类型完美。
- 让 Redux 代码极其精简！去除任何冗余的、形式化的代码！参看 [example](https://github.com/nefe/iron-redux/blob/master/examples/redux.tsx)。
- `ReturnState<your root reducer map>`自动推导出整个项目的 Redux 全局状态树的类型。
- 让 reducer 每个 case 都能获取不同的 action 类型，可在 vscode 中参看 [example](https://github.com/nefe/iron-redux/blob/master/examples/redux.tsx)；
- vscode IDE [插件](https://github.com/nefe/vscode-toolkits)支持。
- 非常轻量级！源码只有 300 行！零依赖！
- iron-redux 不仅仅是一个库，同样也是使用 Typescript 编写 Redux 代码的最佳实践，有些规则你必须严格遵守。

## 安装

npm:

```sh
npm i -S iron-redux
```

yarn:

```sh
yarn add iron-redux
```

## 使用方法

## 1. action types

在 iron-redux 中有两种 action 类型：`FetchTypes` 与 `BasicTypes`。

在 enum 中添加一个类型名称就足以定义动作类型:

```js
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

## 2. action types

iron-redux 提供了两种创建 actions 的方法：`createAction`和`createFetchAction`。

### createAction

提供 payload 类型，当它等于 actionCreator 的参数类型时：

```js
const actions = {
  changeId: createAction(Types.changeId)<number>()
};

console.log(actions.changeId(3));  // { type: 'test/chagneId', payload: 3 };
```

当 actionCreator 的参数类型与 payload 类型不相等时，你可以自定义 payload 转换函数。此时参数和返回操作对象都是类型安全的，返回操作对象类型会被自动推断。

```js
const actions = {
  changeId: createAction(Types.changeId)((arg: { id: number, pre: string }) => {
    return arg.pre + arg.id;
  })
};

console.log(actions.changeId({ id: 3, pre: '_' }));
// { type: 'test/changeId', paylaod: '_3' }
```

你也可以在 createAction 里指定 state 的属性名，reducer 中提供一个默认的 handleAll 函数，会自动帮你处理 action。

```js
const actions = {
  changeId: createAction(Types.changeId, 'id')<number>(),
};

class InitialState {
  id = 3;
}

// 这样你不需要在reducer中再来处理这个action
```

当然，如果你不喜欢用 createAction，也可以手写 action。但是记得一定要完善类型不要使用 any

```js
const actions = {
  changeId(id: number) {
    return { type: Types.changeId, payload: id };
  }
};
```

### createFetchAction

背景：`FetchMiddleware`在 redux 中时非常常见的，如下所示：

```js
{
  types: [loadingType, successType, failureType],
  url: '/api/data',
  method: 'GET',

}
```

`FetchMiddleware`同样会根据 API 的返回结果自动处理 loading、success、failure 等 action。

使用如下：

```js
const actions = {
  fetchData: createFetchAction(Types.fetchData, '/api/data', Method.Get)<Params, Response>(),
};
```

友情提示: 如果你在使用 [pont](https://github.com/nefe/pont)，那么所有的 fetch action 都将会自动生存。

## 3、initial state

- 1、复杂的属性可以尽量写些注释，方便调用的时候可以辨识
- 2、使用 `AsyncTuple` 来管理异步获取的数据. InitialState 里不要有各种 loading、error 字段
- 3、将 initial state 命名为 `State`，这样可以同时产生 state 的初始值以及 state 的类型定义。

```typescript
class State {
  /** comment the property here */
  isDialogVisible = false;
  detailFuncInfo = new AsyncTuple(API.ideFunction.getDetailById.init);
  id = 0;
}
```

## 4、reducer

[toolkits](https://github.com/nefe/vscode-toolkits) VSCode 插件会帮助你生成以上所有的 snippets 代码

```js
function reducer(state = new InitialState(), action: ActionType<typeof actions>): InitialState {
  switch (action.type) {
    case Types.addNum: {
      const num = action.payload;

      return {
        ...state,
        num
      };
    }
    default: {
      return AsyncTuple.handleAll(prefix, state, action);
    }
  }
}
```

友情提示：在每一种 case 中，你都可以针对不同的常见尝试不同的 payload 类型。

## 5、AsyncTuple

`AsyncTuple` 会帮助你管理所有的 loading，error，message，data 等类型数据。

```js
class InitialState {
  data = new AsyncTuple(someResponse);
}
```

同时`AsyncTuple`提供了 `AsyncTuple.handleLoading`, `AsyncTuple.handleError`, `AsyncTuple.handleSuccess`等静态方法，帮助你处理 API 请求过程中的不同逻辑。

```js
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

`AsyncTuple` 提供了一个强大的方法 `handleAll`来帮助你处理所有的 API 请求逻辑。但前提是你必须使用`AsyncTuple` 初始化你的 state。

```js
const actions = {
  // define state field
  fetchData: createFetchAction(Types.fetchData, '/api/data', Method.Get)<Params, Response>('listData'),
};

class InitialState {
  // using AsyncTuple
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
    // you don't need write any API fetch logic here!
    default: {
      return AsyncTuple.handleAll(prefix, state, action);
    }
  }
}
```

## 获取 redux 全局状态类型

项目中所有的 reducers 文件都会有一个根 reducer 文件。iron-redux 提供了一个自动推断类型的接口`ReturnState`，它会自动推导出整个项目的 Redux 全局状态树的类型。

```js
const rootReducers = {
  a: AReducer,
  b: BReducer
};
const rootReducer = combineReducer(rootReducers);

export type RootState = ReturnState<typeof rootReducers>;
```

友情提示：如果该方法不生效，请检查你的 redux 版本。老的 redux 版本会出现一个`combineReducer`类型错误。

## safeGet

与 lodash.get 方法一样，但类型完美。

```js
const deepObj = {
  obj: {
    arr: [
      {
        num: 3
      }
    ]
  },
  obj2: {
    str: ''
  }
};

// get data path is type safe
const num = safeGet(deepObj, ['obj', 'arr', 0, 'num'], defaultValueHere);
const str = safeGet(deepObj, ['obj2', 'str']);
// return type is type safe
```
