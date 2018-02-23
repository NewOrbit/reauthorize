import * as React from "react";
import { connect } from "react-redux";
import { AuthState, User, AuthorisationSetting } from "./model";
import { isAuthorised } from "./isAuthorised";

export interface AuthoriseStateProps {
    currentUser: User;
}

export interface AuthoriseProps {
    authorise: AuthorisationSetting;
}

const Authorise: React.SFC<AuthoriseStateProps & AuthoriseProps> = (props) =>
    isAuthorised(props.currentUser, props.authorise) === "Authorised" && <>{props.children}</>;

const mapStateToProps = ({ currentUser }: AuthState): AuthoriseStateProps => ({ currentUser });

export default connect(mapStateToProps)(Authorise);
