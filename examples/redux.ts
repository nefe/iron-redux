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
} from "redux-ts-helper";

/**
 * 定义 types
 */
const prefix = "prefix/";
enum BasicTypes {}
enum FetchTypes {}
const Types = composeTypes({
  prefix,
  BasicTypes,
  FetchTypes
});

/**
 * actions 和 InitialState
 */
const actions = {};

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
