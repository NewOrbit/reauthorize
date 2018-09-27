import * as React from "react";
import { Authorize } from "./Authorize";
import { AuthorizationSetting, UserAuthorizationCondition } from "./model";

export const authorize = (authorizeSetting: AuthorizationSetting, condition?: UserAuthorizationCondition) =>
    <TProps extends {}>(Component: React.ComponentClass<TProps> | React.StatelessComponent<TProps>) => {
        return (props: TProps) => (
            <Authorize authorize={authorizeSetting} condition={condition}>
                <Component {...props} />
            </Authorize>
        );
};
