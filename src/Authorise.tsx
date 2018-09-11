import * as React from "react";
import { connect } from "react-redux";
import { AuthState, User, AuthorisationSetting, AuthorisationCondition } from "./model";
import { isAuthorised } from "./isAuthorised";

export interface AuthoriseStateProps {
    currentUser: User;
}

export interface AuthoriseProps {
    authorise: AuthorisationSetting;
    condition?: AuthorisationCondition;
}

export const AuthoriseUnconnected: React.SFC<AuthoriseStateProps & AuthoriseProps> = ({ authorise, currentUser, condition, children }) =>
    isAuthorised(currentUser, authorise) === "Authorised"
    && (condition === undefined || condition(currentUser))
    && <>{children}</>;

const mapStateToProps = ({ currentUser }: AuthState): AuthoriseStateProps => ({ currentUser });

export const Authorise = connect(mapStateToProps)(AuthoriseUnconnected);
