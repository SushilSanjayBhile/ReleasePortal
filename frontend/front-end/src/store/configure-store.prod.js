import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from '../reducers';
import rootSaga from '../sagas';

export default function configureStore() {
    const sagaMiddleware = createSagaMiddleware();

    const middlewares = [sagaMiddleware];
    const store = createStore(
        reducer,
        applyMiddleware(...middlewares)
    );

    sagaMiddleware.run(rootSaga);

    return store;
}
