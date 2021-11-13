import { memo, useMemo, useRef } from "react";
import { connect } from "react-redux";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]); 
    return ref.current;
}

const atRegex = /@[a-zA-Z0-9]+/g;

export default ({
    defaultGetStateSlice, defaultGetScope, globalScopeKey, contextKey, contextHooks
}) => {
    const connectFunction = (mapStateToProps, mapDispatchToProps, mergeProps, options) => {
        mapStateToProps.defaultScope = mapDispatchToProps?.defaultScope;
        mapStateToProps.defaultState = mapDispatchToProps?.defaultState;
        const connectCall = connect(mapStateToProps, mapDispatchToProps, mergeProps, options);
        return Component => {
            const ConnectedComponent = connectCall(Component);
            return props => {
                const scope = (options?.getScope ?? defaultGetScope)(props, mapStateToProps.defaultScope);
                const context = Object.fromEntries(Object.entries(options?.contextHooks ?? contextHooks).map(([k, v]) => [k, v()])); // todo: run hooks
                const dependendContexts = memo(() => scope.match(atRegex).map(i => i.substring(1)), [scope]);
                const previousContexts = Object.fromEntries(Object.keys(context).map(key => [key, usePrevious(context[key])]));
                const isSame = Object.keys(context).every((key) => context[key] === previousContexts[key]);
                const ref = useRef();
                if(!isSame || !ref.current) {
                    ref.current = context; 
                }
                const spreadArg = { [contextKey]: ref.current };
                return <ConnectedComponent {...props} {...spreadArg} />;
            };
        };
    };
    return connectFunction;   
}
