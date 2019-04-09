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
  ActionType,
  safeGet
} from '../index';

/**
 * 定义 types
 */
const prefix = 'prefix/';
enum BasicTypes {
  addNum,
  changeKeyword
}
enum FetchTypes {
  fetchData
}
const Types = composeTypes({
  prefix,
  BasicTypes,
  FetchTypes
});

/**
 * actions 和 InitialState
 */
const actions = {
  addNum: createAction(Types.addNum, 'num')<number>(),
  changeKeyword: createAction(Types.changeKeyword, 'keyword')<string>()
};

class InitialState {
  num = 0;
  keyword = '';
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
      return AsyncTuple.handleAll(prefix, state, action);
    }
  }
}

export { actions, reducer, InitialState };