import { memo, useMemo, useRef } from "react";
import { connect } from "react-redux";
import { defaultGetStateSlice, defaultGetScope, globalScopeKey } from "./store";

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]); 
    return ref.current;
}

const atRegex = /@[a-zA-Z0-9]+/g;
const connectFunction = (mapStateToProps, mapDispatchToProps, mergeProps, options) => {
    const connectCall = connect(mapStateToProps, mapDispatchToProps, mergeProps, options);
    return Component => {
        const ConnectedComponent = connectCall(Component);
        return props => {
            const scope = (options?.getScope ?? defaultGetScope)(props);
            const context = {}; // todo: run hooks
            const dependendContexts = memo(() => scope.match(atRegex).map(i => i.substring(1)), [scope]);
            const previousContexts = Object.fromEntries(Object.keys(context).map(key => [key, usePrevious(context[key])]));
            const isSame = Object.keys(context).every((key) => context[key] === previousContexts[key]);
            const ref = useRef();
            if(!isSame || !ref.current) {
                ref.current = context; 
            }
            return <ConnectedComponent {...props} reduxEnterpriseContext={ref.current} />;
        };
    };
};


export default connectFunction;
