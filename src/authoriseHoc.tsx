import * as React from "react";
import { Authorise } from "./Authorise";
import { AuthorisationSetting, UserAuthorisationCondition } from "./model";

export const authorise = (authoriseSetting: AuthorisationSetting, condition?: UserAuthorisationCondition) =>
    <TProps extends {}>(Component: React.ComponentClass<TProps> | React.StatelessComponent<TProps>) => {
        return (props: TProps) => (
            <Authorise authorise={authoriseSetting} condition={condition}>
                <Component {...props} />
            </Authorise>
        );
};
