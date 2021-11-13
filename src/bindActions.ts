import { Dispatch, ActionCreator, AnyAction } from "redux";

import { ScopedAction, ScopedActionCreator, BoundScopedActionCreator, ActionCreatorFactory, } from "./index";

type ScopedActionCreatorType<A> = ActionCreator<A> & { defaultScope?: string, defaultState?: string };

export default ({
    globalScopeKey,
    defaultGetScope,
    META: _META,
    defaultGetContext
}: {
    globalScopeKey: string,
    defaultGetScope: (ownProps: Record<string, any>, defaultscope?: string) => string, // get scope string from props
    META: (symbol | string),
    defaultGetContext: (props: { reduxEnterpriseContext?: any }) => any;
}) => {
    function bindActions<K extends string, A extends AnyAction, O>(
        actions: Record<K, ScopedActionCreatorType<A>>,
        globalActions?: Record<K, ScopedActionCreatorType<A>>,
        otherBoundActions?: Record<string, (Record<K & string, ScopedActionCreatorType<A>>)>,
        getScope = defaultGetScope,
        getContext = defaultGetContext
    ): ActionCreatorFactory<K, O, A> {
        const META = _META as (symbol | string);
        const bindAction = (actions: Record<string, ActionCreator<AnyAction>>, context: any, scope: string | null, dispatch: Dispatch<AnyAction>) => {
            return Object.fromEntries(Object.entries(actions).map(([k, v]) => [
                k, (...args: any[]) => {
                    const action = (v as ActionCreator<A>)(...args);
                    // @ts-ignore
                    action[META] = {
                        scope,
                        context
                    };
                    dispatch(action);
                    return;
                }
            ]));
        }
        // @ts-ignore
        interface F { (state: any, ownProps: any): any; [META]: { types: string[] };
            defaultScope?: string; defaultState?: any; 
            globalsDefaultScope?: string; globalsDefaultState?: any;
            perSelectorDefaultScope?: Record<string, string | undefined>; perSelectorDefaultState?: Record<string, any>;
        };
        const boundAction = <F>function boundActionFunction<K extends string, O, A extends AnyAction>(dispatch: Dispatch, ownProps: O): Record<K, BoundScopedActionCreator<A>> {
            const scope = getScope(ownProps, boundAction.defaultScope);
            const context = getContext(ownProps);
            // dispatch({ type: "redux-enterprise/REGISTER_ACTION_SCOPE", payload: { scope, actions: Object.values(actions).map(i => (i  as ActionCreator<A>)().type) } });
            return Object.assign(
                {
                    ...bindAction(actions, context, scope, dispatch),
                    ...bindAction(globalActions ?? {}, context, null, dispatch),
                }, 
                ...Object.entries((otherBoundActions ?? {})).map(([xscope, xactions]) => bindAction(xactions, context, xscope, dispatch))
            ) as (Record<K, BoundScopedActionCreator<A>>)
        };
        const types = Object.values(actions).map(function(i) {
            return (i as ActionCreator<A>)().type;
        });
        // @ts-ignore
        boundAction[META] = { types };
        boundAction.defaultScope = (Object.values(actions)[0] as ((ActionCreator<A> & { defaultScope: string }) | undefined))?.defaultScope;
        boundAction.defaultState = (Object.values(actions)[0] as ((ActionCreator<A> & { defaultState: string }) | undefined))?.defaultState;
        boundAction.globalsDefaultScope = (Object.values(globalActions ?? {})[0] as ((ActionCreator<A> & { defaultScope: string }) | undefined))?.defaultScope;
        boundAction.globalsDefaultState = (Object.values(globalActions ?? {})[0] as ((ActionCreator<A> & { defaultState: string }) | undefined))?.defaultState;
        boundAction.perSelectorDefaultScope = Object.fromEntries(Object.entries(otherBoundActions ?? {}).map(([k, v]) => {
            const t = Object.values<ScopedActionCreatorType<any>>(v);
            return  [k, t?.[0]?.defaultScope];
        }));
        boundAction.perSelectorDefaultState =  Object.fromEntries(Object.entries(otherBoundActions ?? {}).map(([k, v]) => {
            const t = Object.values<ScopedActionCreatorType<any>>(v);
            return  [k, t?.[0]?.defaultState];
        }));

        return boundAction as ActionCreatorFactory<K, O, A>;
    }
    return bindActions;
};
