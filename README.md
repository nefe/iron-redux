<div align="center">
  <img src="https://img.alicdn.com/tfs/TB1olCdDAzoK1RjSZFlXXai4VXa-275-183.png" height="64">
  <h2>iron-redux - Make your redux code completely typesafe and extremely tidy!  </h2>
</div>

[![npm version](https://badge.fury.io/js/iron-redux.png)](https://badge.fury.io/js/iron-redux)
[![npm downloads](https://img.shields.io/npm/dt/iron-redux.svg?style=flat-square)](https://www.npmjs.com/package/iron-redux)
[![Gitter](https://badges.gitter.im/nefe/iron-redux.svg)](https://gitter.im/nefe/iron-redux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## features

- Iron-redux provides helper functions to create type-safe redux types, redux actions and redux state without any extra type difinitions power by the type infer ability of typescript. Try the [example code](https://github.com/nefe/iron-redux/blob/master/examples/redux.tsx) in vscode.
- The type of store (The state of your whole application) will be inferred by `ReturnState<your root reducer map>` in iron-redux.
- Every action type case in reducer can get different corresponding payload type.
- vscode IDE [extension](https://github.com/nefe/vscode-toolkits) support.
- The source code is only 300 lines! Zero dependence!
- iron-redux is not only a library, it's also a best practise in Typescript Redux code. There are some rules you may must be obeyed

## install

npm:

```sh
npm i -S iron-redux
```

yarn:

```sh
yarn add iron-redux
```

## usage

install vscode extension: nelfe-toolkits.

nelfe-toolkits provide a

# API

## action types

There are two species of action types in iron-redux. Fetch action type(FetchTypes) and simple action type(BasicTypes).

add a type name in enum is enough for action type define:

```typescript
enum BasicTypes {
  changeId
}
enum FetchTypes {
  loadData
}
```

Then use `composeTypes` function to get a type-safe Types object:

```
const prefix = "test/";
const Types = composeTypes({
  prefix,
  BasicTypes,
  FetchTypes
});

console.log(Types.changeId); // 'test/changeId';

console.log(Types.loadData.success); // test/changeId_SUCCESS';
console.log(Types.loadData.loading); // test/changeId_LOADING';
console.log(Types.loadData.error); // 'test/changeId_ERROR';
```

## 2、action creators

iron-redux provide `createAction` and `createFetchAction` functions to create actions.

### createAction

provide a payload type, it's equals to the action creator argument type:

```js
const actions = {
  changeId: createAction(Types.changeId)<number>()
};

console.log(actions.changeId(3));  // { type: 'test/chagneId', payload: 3 };
```

if the action creator arguments and payload is not equal, you car define a custom arguments => payload transfer function. Both the argument and the return action object are type-safe, the return action object type will be inferred.

```js
const actions = {
  changeId: createAction(Types.changeId)((arg: { id: number, pre: string }) => {
    return arg.pre + arg.id;
  })
};

console.log(actions.changeId({ id: 3, pre: '_' }));
// { type: 'test/changeId', paylaod: '_3' }
```

Also, if you don't like createAction, you can define action creator by yourself. But remember don't forget to define the arguments type!

```js
const actions = {
  changeId(id: number) {
    return { type: Types.changeId, payload: id };
  }
};
```

### createFetchAction

background:

FetchMiddleware in redux is very common. Dispatch a action as below:

```js
{
  types: [loadingType, successType, failureType],
  url: '/api/data',
  method: 'GET',

}
```

FetchMiddleware will auto dispatch the loading action, success action and failure action depends on the API response.

usage:

```
const actions = {
  fetchData: createFetchAction(Types.fetchData, '/api/data', Method.Get)<Params, Response>(),
};
```

Note: if you are using [pont](https://github.com/nefe/pont), then all the fetch action will be auto generated.

## 3、initial state

- 1、using comment specs as below
- 2、use `AsyncTuple` to manage fetch data. Don't put any loading or error property in `State` class
- 3、define initial state in `State`, it will generate the initial state and a state type.

```typescript
class State {
  /** comment the property here */
  isDialogVisible = false;
  detailFuncInfo = new AsyncTuple(API.ideFunction.getDetailById.init);
  id = 0;
}
```

## 4、reducer

The snippets in IDE extension [toolkits](https://github.com/nefe/vscode-toolkits) will generate all the redux code for you.

```js
function reducer(
  state = new InitialState(),
  action: ActionType<typeof actions>
): InitialState {
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

note: in every action type case, you can enjoy the different corresponding action payload type.

## 5、AsyncTuple

`AsyncTuple` will manage the loading、error、message、data status for you.

```
class InitialState {
  data = new AsyncTuple(someResponse);
}
```

And there are some static method like `AsyncTuple.handleLoading`, `AsyncTuple.handleLoading`, `AsyncTuple.handleLoading` which will process the API fetch logic for you.

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

`AsyncTuple` provide a powerful function named `handleAll` to process all the API fetch logic for you. But only you must define the state field in fetch action and you are using `AsyncTuple` manage the field.

```
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

## get the Redux global state type

There must be a root reducer map which are combined by all the reducers in your App.

iron-redux provide a type infer interface called `ReturnState`, it will generate the fully type-safe global state type for you.

```
const rootReducers = {
  a: AReducer,
  b: BReducer,
};
const rootReducer = combineReducer(rootReducers);

export type RootState = ReturnState<typeof rootReducers>;
```

note: if it's not worked, check your Redux version! The old version Redux code define a totally wrong `combineReducer` type.
