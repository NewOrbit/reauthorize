import * as React from "react";
import { connect } from "react-redux";
import { AuthState, User, AuthorizationSetting, UserAuthorizationCondition } from "./model";
import { isAuthorized } from "./isAuthorized";

export interface AuthorizeStateProps {
    currentUser: User;
}

export interface AuthorizeProps {
    authorize: AuthorizationSetting;
    condition?: UserAuthorizationCondition;
}

export const AuthorizeUnconnected: React.SFC<AuthorizeStateProps & AuthorizeProps> = ({ authorize, currentUser, condition, children }) =>
    isAuthorized(currentUser, authorize) === "Authorized"
    && (condition === undefined || condition(currentUser))
    && <>{children}</>;

const mapStateToProps = ({ currentUser }: AuthState): AuthorizeStateProps => ({ currentUser });

export const Authorize = connect(mapStateToProps)(AuthorizeUnconnected);
