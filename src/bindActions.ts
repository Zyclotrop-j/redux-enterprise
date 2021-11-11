import { Dispatch, ActionCreator, AnyAction } from "redux";
import { globalScopeKey, ScopedAction, META, ScopedActionCreator, BoundScopedActionCreator, ActionCreatorFactory } from "./store";

const defaultGetScope = (props: { scope?: any; id?: any; }) => props.scope ?? props.id ?? globalScopeKey;
const defaultGetContext = (props: { reduxEnterpriseContext?: any }) => props.reduxEnterpriseContext ?? {}; 

function bindActions<K extends string, A extends AnyAction, O>(actions: Record<K, ActionCreator<A>>, getScope = defaultGetScope, getContext = defaultGetContext): ActionCreatorFactory<K, O, A> {
    function innerFunction<K extends string, O, A extends AnyAction>(dispatch: Dispatch, ownProps: O): Record<K, BoundScopedActionCreator<A>> {
        const scope = getScope(ownProps);
        const context = getContext(ownProps);
        dispatch({ type: "redux-enterprise/REGISTER_ACTION_SCOPE", payload: { scope, actions: Object.values(actions).map(i => (i  as ActionCreator<A>)().type) } });
        return (Object.fromEntries(Object.entries(actions).map(([k, v]) => [
            k, (...args: any[]) => {
                const action = (v as ActionCreator<A>)(...args);
                dispatch({
                    ...action,
                    [META]: {
                        scope,
                        context
                    }
                });
                return;
            }
        ])) as (Record<K, BoundScopedActionCreator<A>>));
    };
    return innerFunction as ActionCreatorFactory<K, O, A>;
}
export default bindActions;
