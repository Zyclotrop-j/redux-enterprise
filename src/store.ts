import { createStore as createReduxStore, applyMiddleware, Reducer, Middleware, ReducersMapObject, Action, Dispatch, AnyAction, Store  } from 'redux';

const isDev = process.env.NODE_ENV === "development";

export const DEFAULTSCOPE = Symbol("redux-enterprise/DEFAULTSCOPE");
export const META = Symbol("redux-enterprise/META");
export const VALUE = Symbol("redux-enterprise/VALUE");
export const NOT_INIT = Symbol("redux-enterprise/NOT_INIT");
export const REDUX_ENTERPRISE_NAMESPACE = Symbol("redux-enterprise/REDUX-ENTERPRISE");

export const globalScopeKey = 'global';

export type Scope = { scope: string, context: Record<string, any> };
export type ScopedAction<A extends AnyAction> = Action<A> & { [META]: Scope };
export type AnyScopedAction = AnyAction & { [META]: Scope };
export type ScopedActionCreator<A extends AnyAction> = (...args: any[]) => ScopedAction<A>;
export type BoundScopedActionCreator<A extends AnyAction> = (...args: any[]) => void;
export type ActionCreatorFactory<K extends string, O, A extends AnyAction> = (arg0: Dispatch, arg1: O) => Record<K, ScopedActionCreator<A>>;

export const defaultGetScope = (props: { scope?: any; id?: any; }) => props.scope ?? props.id ?? globalScopeKey;
export const defaultGetStateSlice = (state: any, slice: { 0: string } & string[]) => slice.reduce((s, p) => s[p] ?? {}, state)[VALUE] ?? NOT_INIT;
const defaultMergeState = (state: any, resolvedScope: { 0: string } & string[], reducerResult: any) => {
    const stateCopy = { ...state };
    let start = stateCopy;
    const lastPart = resolvedScope.pop() as string; // typescript deosn't seem to understand that .pop of an array with at least one element and all elements string, the return value of this is string as well
    for(const part in resolvedScope) {
        start[part] = { ...start[part] };
        start = start[part];
    }
    start[lastPart] = {
        ...start[lastPart],
        [VALUE]: reducerResult
    }
    return stateCopy;
};
export const defaultResolveScope = (scopeKey: string, context: Record<string, any>, defaultValue: any): { 0: string } & string[] => {
    const realScopeKey = scopeKey ?? defaultValue;
    const scopeParts = realScopeKey.replace(']', '').split(/\.|\[/g); // .split returns an array of at least length 1 - typescript doesn't seem to understand that
    return (scopeParts.map(q => q[0] === "@" ? context[q.substring(1)]?.toString() ?? q : q) as ({ 0: string } & string[]));
};

function createStore(reducers: { default: Reducer & { handlesActions?: string[], defaultState?: any } }[], middleware: Middleware): Store {
    const initialState = undefined;
    const actionsPerReducer = Object.fromEntries(reducers.map(({ default: reducer, ...mayBeAction }) => {
        const defaultState = reducer(undefined, { type: "@@INIT" });
        reducer.handlesActions = Object.values(mayBeAction).filter(o => typeof o === 'string' && o.split("/").length >= 2);
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
            const { scope, context } = (action as AnyScopedAction)[META] ?? {};
            const resolvedScope = defaultResolveScope(scope, context, globalScopeKey); // todo: support dot-notation and @-notation; support default via duck
            let stateSlice = defaultGetStateSlice(state, resolvedScope);
            let handled = false;
            let newState = state;
            for(const { default: reducer } of reducers) {
                if(reducer.handlesActions?.includes(action.type)) {
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
export default createStore;
