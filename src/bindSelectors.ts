const noop = () => ({});

export default ({ globalScopeKey, defaultGetStateSlice, defaultResolveScope, NOT_INIT, defaultGetScope }: {
    globalScopeKey: string,
    defaultGetScope: (ownProps: Record<string, any>, defaultscope?: string) => string, // get scope string from props
    defaultResolveScope: (scope: string, arg2: any, arg3: string) => ({ 0: string } & string[]), // scope string to scope path
    defaultGetStateSlice: (state: any, path: ({ 0: string } & string[])) => any,
    NOT_INIT: symbol | string,
}) => {
    type Selector = (stateSlice: any, ownProps: any) => Record<string, any>;
    return (rootSelector: Selector = noop, globalScopeSelector: Selector = noop, otherScopeSelectors: Record<string, Selector> = {}, getScope = defaultGetScope) => {
        let cache: Record<string, any> = {};
        const getSliceFromScope = (scope: string, state: any, ownProps: any, defaultStateIfAny: any) => {
            if(cache[scope]?.state === state && cache[scope]?.context === ownProps.context) {
                console.log("from cache");
                cache[scope].stale = false;
                return cache[scope].value;
            }
            try {
                const resolvedScope = defaultResolveScope(scope, ownProps.context, globalScopeKey);
                let stateSlice = defaultGetStateSlice(state, resolvedScope);
                if(stateSlice === NOT_INIT) {
                    if(cache[scope]?.value) {
                        return cache[scope].value;
                    }
                    stateSlice = { [NOT_INIT]: true, ...defaultStateIfAny };
                }
                cache[scope] = {
                    value: stateSlice,
                    stale: false,
                    state, 
                    context: ownProps.context
                };
                return stateSlice;
            } catch(e) {
                console.error(e);
                return {};
            }
        }
        interface F { (state: any, ownProps: any): any;
            defaultScope?: string; defaultState?: any;
            globalsDefaultScope?: string; globalsDefaultState?: any;
            perSelectorDefaultScope?: Record<string, string>; perSelectorDefaultState?: Record<string, any>;
        };
        const boundSelector = <F>function boundSelectorFunction(state: any, ownProps: any) {
            cache = Object.fromEntries(Object.entries(cache).map(([k, v]) => [k, { stale: true, ...v }]));
            const ownScope = getScope(ownProps, boundSelector.defaultScope);
            const ownSelected = rootSelector(getSliceFromScope(ownScope, state, ownProps, boundSelector?.defaultState ?? {}), ownProps);
            const globalSelectorState = globalScopeSelector(getSliceFromScope(boundSelector.globalsDefaultScope ?? globalScopeKey, state, ownProps, boundSelector?.globalsDefaultState ?? {}), ownProps) ?? {};
            const otherSelectorStates = Object.fromEntries(Object.entries(otherScopeSelectors).map(([k, selector]) => [
                k,
                selector(getSliceFromScope(k, state, ownProps, boundSelector?.perSelectorDefaultState?.[k] ?? {}), ownProps)
            ]));
            cache = Object.fromEntries(Object.entries(cache).filter(([__, v]) => v.stale === true));
            return {
                ...ownSelected,
                ...globalSelectorState,
                ...otherSelectorStates,
            };
        };
        return boundSelector;
    };
}
