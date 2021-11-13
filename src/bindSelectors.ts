export default ({ globalScopeKey, defaultGetStateSlice, defaultResolveScope, NOT_INIT, defaultGetScope }: {
    globalScopeKey: string,
    defaultGetScope: (ownProps: Record<string, any>, defaultscope?: string) => string, // get scope string from props
    defaultResolveScope: (scope: string, arg2: any, arg3: string) => ({ 0: string } & string[]), // scope string to scope path
    defaultGetStateSlice: (state: any, path: ({ 0: string } & string[])) => any,
    NOT_INIT: symbol | string,
}) => {
    return (rootSelector: any, globalScope: any, otherScopes = {}, getScope = defaultGetScope) => {
        // todo: other scopes
        interface F { (state: any, ownProps: any): any; defaultScope?: string; defaultState?: any };
        const boundSelector = <F>function boundSelectorFunction(state: any, ownProps: any) {
            try {
                const scope = getScope(ownProps, boundSelector.defaultScope);
                const resolvedScope = defaultResolveScope(scope, ownProps.context, globalScopeKey);
                let stateSlice = defaultGetStateSlice(state, resolvedScope);
                const defaultStateIfAny = boundSelector?.defaultState ?? {};
                if(stateSlice === NOT_INIT) {
                    stateSlice = { [NOT_INIT]: true, ...defaultStateIfAny };
                }
                const selected = rootSelector(stateSlice, ownProps);
                return selected;
            } catch(e) {
                console.error(e);
                return {};
            }
        };
        return boundSelector;
    };
}
