import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect, bindSelectors, bindActions } from '../src/index';

import './countdown.css';
import {
  tick,
  start,
  stop,
} from "./Countdown.duck";

const MillitSecondDisplay = ({ milliseconds }) => {
  return (<span>{milliseconds}</span>);
};

export const ConnectedMillitSecondDisplay = connect(bindSelectors(stateSlice => ({
  milliseconds: (new Date(stateSlice.time)).getMilliseconds().toString().padStart(3, '0'),
})))(MillitSecondDisplay);

MillitSecondDisplay.propTypes = {
  milliseconds: PropTypes.string.isRequired,
};

MillitSecondDisplay.defaultProps = {};

export const Countdown = ({ hours, minutes, seconds, tick, start, stop, scope, milliseconds, MsDisplay }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      tick(Date.now());
    }, 10);
    return () => clearInterval(interval);
  }, []);
  return (
    <header>
      <div className="wrapper">
        <div>
          <span>{hours}</span><span>:</span><span>{minutes}</span><span>:</span><span>{seconds}</span><span>:</span><MsDisplay milliseconds={milliseconds} scope={scope} />
        </div>
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
      </div>
    </header>
  );
};

export default connect(bindSelectors(stateSlice => ({
  minutes: (new Date(stateSlice.time)).getMinutes().toString().padStart(2, '0'),
  hours: (new Date(stateSlice.time)).getHours().toString().padStart(2, '0'),
  seconds: (new Date(stateSlice.time)).getSeconds().toString().padStart(2, '0'),
})), bindActions({
  tick,
  start,
  stop,
}))(Countdown);

Countdown.propTypes = {
  hours: PropTypes.string.isRequired,
  minutes: PropTypes.string.isRequired,
  seconds: PropTypes.string.isRequired,
  milliseconds: PropTypes.string,
  tick: PropTypes.func.isRequired,
  start: PropTypes.func.isRequired,
  stop: PropTypes.func.isRequired,
  MsDisplay: PropTypes.elementType
};

Countdown.defaultProps = {
  MsDisplay: MillitSecondDisplay
};


