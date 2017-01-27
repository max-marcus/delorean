import mobx from 'mobx';
import spy from './spy';
import getDecorator from './getDecorator';

function dev(store, config) {
  if (
    (!config || !config.remote) && (typeof window === 'undefined')
  ) {
    return store;
  }

  if (mobx.isObservable(store)) {
    spy(store, config);
  } else if (typeof store === 'function') {
    /* eslint-disable no-param-reassign */
    if (!config) config = {};
    if (!config.name) config.name = store.name;
    store = class extends store {
      console.log('before constructor');
      constructor(...args) {
        console.log('in constructor')
        super(...args);
        spy(this, config);
      }
    };
    /* eslint-enable */
  } else {
    console.warn(`Passed ${typeof store} to BRASCO, which is not an observable.`);
  }
  console.log('returning store')
  return store;
}

export default getDecorator(dev);
