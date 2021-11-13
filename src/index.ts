import { Reducer, Middleware, ReducersMapObject, Action, Dispatch, AnyAction, Store  } from 'redux';

import { default as createStoreFactory } from "./store";
import { default as connectFactory } from "./connect";
import { default as bindActionsFactory } from "./bindActions";
import { default as bindSelectorsFactory } from "./bindSelectors";


export type Scope = { scope: string, context: Record<string, any> };
export type ScopedAction<A extends AnyAction> = Action<A>;
export type AnyScopedAction = AnyAction;
export type ScopedActionCreator<A extends AnyAction> = (...args: any[]) => ScopedAction<A>;
export type BoundScopedActionCreator<A extends AnyAction> = (...args: any[]) => void;
export type ActionCreatorFactory<K extends string, O, A extends AnyAction> = (arg0: Dispatch, arg1: O) => Record<K, ScopedActionCreator<A>>;

export const DEFAULTSCOPE = Symbol("redux-enterprise/DEFAULTSCOPE");
export const META = Symbol("redux-enterprise/META");
export const VALUE = Symbol("redux-enterprise/VALUE");
export const NOT_INIT = Symbol("redux-enterprise/NOT_INIT");
export const REDUX_ENTERPRISE_NAMESPACE = Symbol("redux-enterprise/REDUX-ENTERPRISE");
export const globalScopeKey = 'global';
export const contextKey = 'reduxEnterpriseContext';
export const defaultContextHooks = {};
export const defaultGetScope = (props: { scope?: any; id?: any; }, defaultScope?: string) => props.scope ?? props.id ?? defaultScope ?? globalScopeKey;
export const defaultGetStateSlice = (state: any, slice: { 0: string } & string[]) => slice.reduce((s, p) => s[p] ?? {}, state)[VALUE] ?? NOT_INIT;
export const defaultGetContext = (props: { reduxEnterpriseContext?: any }) => props.reduxEnterpriseContext ?? {};
export const defaultMergeState = (state: any, resolvedScope: { 0: string } & string[], reducerResult: any) => {
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

export type path = ({ 0: string } & string[]);
export type scopestring = string;
export type reduxFactoryParams<STATE, I_CONNECT> = {
    DEFAULTSCOPE?: symbol | string,
    META?: symbol | string,
    VALUE?: symbol | string,
    NOT_INIT?: symbol | string,
    REDUX_ENTERPRISE_NAMESPACE?: symbol | string,
    globalScopeKey?: string,
    contextKey?: string,
    contextHooks?: Record<string, () => string>,
    defaultGetScope?: (props: Record<string, any> & I_CONNECT, defaultScope?: string) => scopestring, // get scope string from props
    defaultGetContext?: (props: Record<string, any>) => any, // get context from props; has contextKey's value as key in the props arg
    defaultResolveScope?: (scope: scopestring, arg2: any, arg3: string) => path, // scope string to scope path,
    defaultGetStateSlice?: (state: STATE, path: path) => any,
    defaultMergeState?: (state: STATE, path: path, newvalue: any) => string,
};

export const reduxFactory = function<STATE = any, I_CONNECT = ({ scope?: any; id?: any; })>({
    DEFAULTSCOPE: _DEFAULTSCOPE,
    META: _META,
    VALUE: _VALUE,
    NOT_INIT: _NOT_INIT,
    REDUX_ENTERPRISE_NAMESPACE: _REDUX_ENTERPRISE_NAMESPACE,
    globalScopeKey: _globalScopeKey,
    defaultGetScope: _defaultGetScope,
    defaultGetStateSlice: _defaultGetStateSlice,
    defaultGetContext: _defaultGetContext,
    defaultMergeState: _defaultMergeState,
    defaultResolveScope: _defaultResolveScope,
    contextKey: _contextKey,
    contextHooks: _contextHooks,
}: reduxFactoryParams<STATE, I_CONNECT> = {} ) {
    const R_DEFAULTSCOPE = _DEFAULTSCOPE ?? DEFAULTSCOPE;
    const R_META = _META ?? META;
    const R_VALUE = _VALUE ?? VALUE;
    const R_NOT_INIT = _NOT_INIT ?? NOT_INIT;
    const R_REDUX_ENTERPRISE_NAMESPACE = _REDUX_ENTERPRISE_NAMESPACE ?? REDUX_ENTERPRISE_NAMESPACE;
    const R_globalScopeKey = _globalScopeKey ?? globalScopeKey;
    const R_defaultGetScope = _defaultGetScope ?? defaultGetScope;
    const R_defaultGetStateSlice = _defaultGetStateSlice ?? defaultGetStateSlice;
    const R_defaultGetContext = _defaultGetContext ?? defaultGetContext;
    const R_defaultMergeState = _defaultMergeState ?? defaultMergeState;
    const R_defaultResolveScope = _defaultResolveScope ?? defaultResolveScope;
    const R_contextKey = _contextKey ?? contextKey;
    const R_contextHooks = _contextHooks ?? defaultContextHooks; 
    const createStore = createStoreFactory({
        DEFAULTSCOPE: R_DEFAULTSCOPE,
        META: R_META,
        VALUE: R_VALUE,
        NOT_INIT: R_NOT_INIT,
        REDUX_ENTERPRISE_NAMESPACE: R_REDUX_ENTERPRISE_NAMESPACE,
        globalScopeKey: R_globalScopeKey,
        // @ts-ignore
        defaultGetScope: R_defaultGetScope,
        defaultGetStateSlice: R_defaultGetStateSlice,
        // @ts-ignore
        defaultGetContext: R_defaultGetContext,
        defaultMergeState: R_defaultMergeState,
        defaultResolveScope: R_defaultResolveScope,
    });
    const connect = connectFactory({
        defaultGetStateSlice: R_defaultGetStateSlice,
        defaultGetScope: R_defaultGetScope,
        globalScopeKey: R_globalScopeKey,
        contextKey: R_contextKey,
        contextHooks: R_contextHooks,
    });
    const bindActions = bindActionsFactory({
        globalScopeKey: R_globalScopeKey,
        // @ts-ignore
        defaultGetScope: R_defaultGetScope,
        META: R_META,
        // @ts-ignore
        defaultGetContext: R_defaultGetContext
    });
    const bindSelectors = bindSelectorsFactory({
        globalScopeKey: R_globalScopeKey,
        defaultGetStateSlice: R_defaultGetStateSlice,
        defaultResolveScope: R_defaultResolveScope,
        NOT_INIT: R_NOT_INIT,
        // @ts-ignore
        defaultGetScope: R_defaultGetScope
    });
    return {
        createStore,
        connect,
        bindActions,
        bindSelectors,
    }
}
const defaultRedux = reduxFactory();
export const createStore = defaultRedux.createStore;
export const connect = defaultRedux.connect;
export const bindActions = defaultRedux.bindActions;
export const bindSelectors = defaultRedux.bindSelectors;
export default defaultRedux;

