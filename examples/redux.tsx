/**
 * @author author
 * @description description
 */

import {
  composeTypes,
  createAction,
  ActionCreator,
  AsyncTuple,
  NO_ERROR_TYPES,
  createFetchAction,
  ThunkAction,
  ActionType
} from "../index";

/**
 * 定义 types
 */
const prefix = "prefix/";
enum BasicTypes {
  add,
  remove
}
enum FetchTypes {
  fetchData
}
const Types = composeTypes({
  prefix,
  BasicTypes,
  FetchTypes
});

class Response {
  cn: string;
  en: number;
}

class Params {
  index: number;
}

/**
 * actions 和 InitialState
 */
const actions = {
  _add: createAction(Types.add)<number>(),
  _add2: createAction(Types.add)((s1: string, s2: number) => {
    return { s1, s2 };
  }),
  fetchData: createFetchAction(Types.fetchData, "/fetchData.json")<
    Params,
    Response
  >("data"),
  add(): ThunkAction {
    return dispatch => {
      dispatch(actions._add(3));
    };
  }
};

class InitialState {
  data = new AsyncTuple(Response);
}

/**
 * reducer
 */
function reducer(
  state = new InitialState(),
  action: ActionType<typeof actions>
): InitialState {
  switch (action.type) {
    default: {
      return AsyncTuple.handleAll(state, action);
    }
  }
}

export { actions, reducer, InitialState };
