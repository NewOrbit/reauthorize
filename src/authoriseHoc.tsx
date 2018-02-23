import * as React from "react";
import Authorise from "./Authorise";
import { AuthorisationSetting } from "./model";

export const authorise = (authoriseSetting: AuthorisationSetting) =>
    <TProps extends {}>(Component: React.ComponentClass<TProps> | React.StatelessComponent<TProps>) => {
        return (props: TProps) => (
            <Authorise authorise={authoriseSetting}>
                <Component {...props} />
            </Authorise>
        );
};
