import mobx from 'mobx';
import { createAction, getName, isFiltered } from './utils';
import { dispatchMonitorAction } from './monitorActions';
import { emitter } from './emitter';

let isSpyEnabled = false;
let fallbackStoreName;
const stores = {};
const onlyActions = {};
const filters = {};
const monitors = {};
const scheduled = [];

function configure(name, config = {}) {
  if (typeof config.onlyActions === 'undefined') {
    onlyActions[name] = mobx.isStrictModeEnabled && mobx.isStrictModeEnabled();
  } else onlyActions[name] = config.onlyActions;
  if (config.filters) filters[name] = config.filters;
  if (config.global) {
    if (fallbackStoreName) throw Error('Global store already defined');
    fallbackStoreName = name;
  }
}

function init(store, config) {
  const name = mobx.extras.getDebugName(store);
  configure(name, config);
  stores[name] = store;

  const emitTool = emitter(config);
  emitTool.subscribe(dispatchMonitorAction(store, emitTool, onlyActions[name]));
  monitors[name] = emitTool;
}

export function schedule(name, action) {
  let toSend;
  if (action && !isFiltered(action, filters[name])) {
    toSend = () => { monitors[name].send(action, mobx.toJS(stores[name])); };
  }
  scheduled.push(toSend);
}

function send() {
  if (scheduled.length) {
    const toSend = scheduled.pop();
    if (toSend) toSend();
  }
}

export default function spy(store, config) {
  init(store, config);
  if (isSpyEnabled) return;
  isSpyEnabled = true;
  let objName;

  mobx.spy((change) => {
    if (change.spyReportStart) {
      objName = getName(change.object || change.target);
      if (change.type === 'reaction') {
        schedule(objName);
        return;
      }
      if (!stores[objName]) objName = fallbackStoreName;
      if (!stores[objName] || stores[objName].__isDeloreanAction) {
        schedule(objName);
        return;
      }
      if (change.fn && change.fn.__isDeloreanAction) {
        schedule(objName);
        return;
      }
      if (change.type === 'action') {
        const action = createAction(change.name);
        if (change.arguments && change.arguments.length) action.arguments = change.arguments;
        if (!onlyActions[objName]) {
          schedule(objName, { ...action, type: `${action.type}` });
          send();
          schedule(objName, { ...action, type: `${action.type}` });
        } else {
          schedule(objName, action);
        }
      } else if (change.type && mobx.isObservable(change.object)) {
        schedule(objName, !onlyActions[objName] && createAction(change.type, change));
      }
    } else if (change.spyReportEnd) {
      send();
    }
  });
}
