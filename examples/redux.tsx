/**
 * @author author
 * @description description
 */

import {
  composeTypes,
  createAction,
  getActionDefinition,
  ActionCreator,
  AsyncTuple,
  NO_ERROR_TYPES,
  createFetchAction,
  ThunkAction
} from "../index";

/**
 * 定义 types
 */
const prefix = "prefix/";
enum BasicTypes {
  add
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

const ActionDefinition = getActionDefinition(actions);

class InitialState {
  data = new AsyncTuple(Response);
}

/**
 * reducer
 */
function reducer(
  state = new InitialState(),
  action: typeof ActionDefinition
): InitialState {
  switch (action.type) {
    default: {
      return AsyncTuple.handleAll(state, action);
    }
  }
}

export { actions, reducer, InitialState };
