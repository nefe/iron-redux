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
  ThunkAction
} from "../index";

/**
 * 定义 types
 */
const prefix = "prefix/";
enum BasicTypes {
  add
}
enum FetchTypes {}
const Types = composeTypes({
  prefix,
  BasicTypes,
  FetchTypes
});

/**
 * actions 和 InitialState
 */
const actions = {
  add: createAction(Types.add)<number>(),
  t(): ThunkAction {
    return d => {};
  }
};

type ActionTypes<T> = {
  [key in keyof T]: T[key] extends (
    ...args: any[]
  ) => { type: infer T2; payload: infer T3 }
    ? { type: T2; payload: T3 }
    : never
}[keyof T];

type as = ActionTypes<typeof actions>;

const ActionDefinition = getActionDefinition(actions);

class InitialState {}

/**
 * reducer
 */
function reducer(
  state = new InitialState(),
  action: typeof ActionDefinition
): InitialState {
  switch (action.type) {
    default: {
      return state;
    }
  }
}

export { actions, reducer, InitialState };
