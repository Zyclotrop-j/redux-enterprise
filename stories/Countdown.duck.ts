import { Action } from "redux";

export const TICK = "countdown/tick";
export const START = "countdown/start";
export const STOP = "countdown/stop";
export const SYNC = "countdown/sync";

export default (state = { time: Date.now(), running: false }, action: Action<typeof TICK | typeof START | typeof STOP | typeof SYNC> & { payload?: string }) => {
    switch (action.type) {
        case TICK:
            if(!state.running) return state;
            return {
                ...state,
                time: action.payload
            };
        case START:
            return {
                ...state,
                running: true
            };
        case STOP:
            return {
                ...state,
                running: false
            };
        default:
            return state;
    }
};

export const tick = (time: any) => ({
    type: TICK,
    payload: time
});
export const start = (time: any) => ({
    type: START,
    payload: time
});
export const stop = (time: any) => ({
    type: STOP,
    payload: time
});



