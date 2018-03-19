# redux-ts-helper

# 工具

vscode IDE 可以安装 nelfe-toolkits。

* 1、支持 redux 文件的 snippets
* 2、可以按 cmd + ctrl + a，然后根据提示创建 action。
* 3、持续添加中...

# 代码规范

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
const prefix = "test/";
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

* 1、复杂的属性可以尽量写些注释，方便调用的时候可以辨识。
* 2、接口返回类型如果要处理 loading、error。请使用 AsyncTuple。使用 API 中的 init 一方面提供了类型，一方面提供了接口的初始值，该初始值可以防止复杂对象后端返回 undefined
* 3、InitialState 里不要有各种 loading、error 字段，代码阅读者无法区分这是哪个请求的 loading 或者 error。建议都使用 AsyncTuple 来做。

```typescript
class InitialState {
  isDialogVisible = false;
  detailFuncInfo = new AsyncTuple(API.ideFunction.getDetailById.init);
  id = 0;
}
```

## 4、reducer

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

## 衍生数据和原生数据

碰到接口返回结果不能直接在 View 中使用，需要加工的情况下，在 mapStateToProps 中加工，不要在 Reducer 中加工。

优势：InitialState 数据只保留原生数据，不会有衍生数据的冗余，Reducer 中也可以保持简单，不会因为衍生数据的存在而导致一份数据在多个 Reducer 中都需要加工的 case。
