import { globalScopeKey, defaultGetStateSlice, defaultResolveScope, NOT_INIT, defaultGetScope } from "./store";

export default (rootSelector: any, globalScope: any, otherScopes = {}, getScope = defaultGetScope) => (state: any, ownProps: any) => {
    try {
        const scope = getScope(ownProps);
        const resolvedScope = defaultResolveScope(scope, ownProps.context, globalScopeKey);
        let stateSlice = defaultGetStateSlice(state, resolvedScope);
        const defaultStateIfAny = state["redux-enterprise/ACTIONS"]?.[scope]?.defaultState ?? {}; // todo: register this on 'redux-enterprise/REGISTER_ACTION_SCOPE' (scope, actions[])
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
