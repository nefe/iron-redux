/**
 * @author 定岳
 * @description 处理Sequence
 */
import * as get from 'lodash.get';

export default class Sequence {
  constructor(opts: { actions?: any; prefix: string }) {
    this.actions = opts.actions;
    this.prefix = opts.prefix;
  }
  actions: any;

  prefix: string;

  createSequenceAction = (callback): any => {
    return (...seqArgs) => (dispatch, getState) => {
      const proxy = new Proxy(this, {
        get(target, prop) {
          const state = get(getState(), target.prefix);
          if (!state) {
            throw new Error('invalid state, please check the [prefix]');
          }
          // State
          if (Reflect.has(state, prop)) {
            return Reflect.get(state, prop);
          }
          if (!target.actions) {
            throw new Error('invalid actions, please check the [actions]');
          }
          // actions
          if (Reflect.has(target.actions, prop)) {
            const action = Reflect.get(target.actions, prop);
            return (...actionArgs) => dispatch(action(...actionArgs));
          }
        },
        set() {
          return false;
        }
      });
      return callback.call(proxy, ...seqArgs);
    };
  };

  setActions = (actions: any) => {
    this.actions = actions;
  };
}
