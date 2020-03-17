import React, { useContext } from "react"

export const InjectContext = (contextDefenition: {[key: string]: React.Context<any>}): ClassDecorator => {
    return function (Class: Function) {
        return function(props) {
            const keys = Object.keys(contextDefenition);
            const injectionProps: any = {};
            for(const propKey of keys) {
                injectionProps[propKey] = useContext(contextDefenition[propKey]);
            }
            return <Class {...props} {...injectionProps}/>;
        } as any;
    }
}