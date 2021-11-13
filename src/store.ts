import { createStore as createReduxStore, applyMiddleware, Reducer, Middleware, ReducersMapObject, Action, Dispatch, AnyAction, Store  } from 'redux';
import {
    Scope,
    ScopedAction,
    AnyScopedAction,
    ScopedActionCreator,
    BoundScopedActionCreator,
    ActionCreatorFactory,
} from "./index";

const isDev = process.env.NODE_ENV === "development";

export default ({
    DEFAULTSCOPE,
    META,
    VALUE,
    NOT_INIT,
    REDUX_ENTERPRISE_NAMESPACE,
    globalScopeKey,
    defaultGetScope,
    defaultGetStateSlice,
    defaultGetContext,
    defaultMergeState,
    defaultResolveScope,
}: {
    DEFAULTSCOPE: symbol | string,
    META: symbol | string,
    VALUE: symbol | string,
    NOT_INIT: symbol | string,
    REDUX_ENTERPRISE_NAMESPACE: symbol | string,
    globalScopeKey: string,
    defaultGetScope: (props: { scope?: any; id?: any; }, defaultScope?: string) => string, // get scope string from props
    defaultGetStateSlice: (state: any, path: ({ 0: string } & string[])) => any,
    defaultGetContext: (props: { reduxEnterpriseContext?: any }) => any,
    defaultMergeState: (state: any, path: ({ 0: string } & string[]), newvalue: any) => string,
    defaultResolveScope: (scope: string, arg2: any, arg3: string) => ({ 0: string } & string[]), // scope string to scope path,
}) => {
    function createStore(reducers: { default: Reducer & { handlesActions?: string[], defaultState?: any }, defaultScope?: any }[], middleware: Middleware): Store {
        const initialState = undefined;
        const actionsPerReducer = Object.fromEntries(reducers.map(({ default: reducer, defaultScope, ...mayBeAction }) => {
            const defaultState = reducer(undefined, { type: "@@INIT" });
            reducer.handlesActions = Object.values(mayBeAction).map(i => {
                // perform side-effect
                if(i && {}.toString.call(i) === '[object Function]') {
                    // this is a function, not a proxy, not async -> assume action-creator
                    i.defaultScope = defaultScope; // assign the default scope of the reducer to the action-creator
                    i.defaultState = defaultState;
                }
                return i;
            }).filter(o => typeof o === 'string' && o.split("/").length >= 2);
            reducer.defaultState = isDev ? Object.freeze(defaultState) : defaultState;
            return reducer.handlesActions.map(action => ([action, {
                reducer, defaultState
            }]));
        }).flat());
        const rootReducer = ((state: any = {}, action: AnyAction) => {
            if(action.type.startsWith('redux-enterprise/')) {
                switch (action.type) {
                    case 'redux-enterprise/REGISTER_ACTION_SCOPE': {
                        const { scope, actions } = action.payload as ({ scope: string, actions: string[] });
                        const scopeDef = {
                            scope
                        };
                        return {
                            ...state,
                            [REDUX_ENTERPRISE_NAMESPACE]: {
                                ...state[REDUX_ENTERPRISE_NAMESPACE],
                                ...Object.fromEntries(actions.map(i => [i, {
                                    ...scopeDef,
                                    defaultState: actionsPerReducer[i]
                                }]))
                            }
                        };
                    }
                    default:
                        return state;
                }
            }
            try {
                // @ts-ignore
                const { scope, context } = (action as (AnyScopedAction & { [META]: Scope }))[META] ?? {};
                const resolvedScope = defaultResolveScope(scope, context, globalScopeKey);
                let stateSlice = defaultGetStateSlice(state, resolvedScope);
                let handled = false;
                let newState = state;
                for(const { default: reducer } of reducers) {
                    if(action.type.startsWith('@@redux')) {
                        newState = reducer(newState, action);
                        handled = true;
                    } else if(reducer.handlesActions?.includes(action.type)) {
                        if(handled) {
                            console.warn(`Another reducer matched the action '${action.type}' - there must be only one reducer per action! The second reducer will not be invoked!`)
                            continue;
                        }
                        if(stateSlice === NOT_INIT) {
                            stateSlice = reducer.defaultState;
                        }
                        newState = defaultMergeState(state, resolvedScope, reducer(stateSlice, action));
                        if(!isDev) { // in prod skip all further matches
                            return newState;
                        }
                        handled = true;
                    }
                }
                if(!handled) {
                    console.warn(`No reducer handled action '${action.type}'! Have you forgotten to export the actions from the duck?`)
                }
                return newState;
                
            } catch(e) {
                console.log(e);
                return state;
            }
        });
        const store = createReduxStore(rootReducer, initialState /* , applyMiddleware(middleware) */);
        type storetype = typeof store.getState;
        type dispatchtype = typeof store.dispatch;
        
        return store;
    };
    return createStore;
}

