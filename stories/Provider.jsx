
import { Provider } from 'react-redux';

import { createStore } from '../src/index';
import * as countdownDuck from "./Countdown.duck";

const reducers = [countdownDuck];
const middleware = () => null;

const store = createStore(reducers, middleware);

export default ({ children }) => <Provider store={store}>{children}</Provider>;
