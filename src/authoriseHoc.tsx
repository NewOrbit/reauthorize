import * as React from "react";
import { Authorise } from "./Authorise";
import { AuthorisationSetting, AuthorisationCondition } from "./model";

export const authorise = (authoriseSetting: AuthorisationSetting, condition?: AuthorisationCondition) =>
    <TProps extends {}>(Component: React.ComponentClass<TProps> | React.StatelessComponent<TProps>) => {
        return (props: TProps) => (
            <Authorise authorise={authoriseSetting} condition={condition}>
                <Component {...props} />
            </Authorise>
        );
};
