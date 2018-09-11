export type AuthorisationSetting = boolean | string | string[];
export type AuthorisationResult = "Authorised" | "Unauthorised" | "Unauthenticated";
export type AuthorisationCondition = (currentUser: User) => boolean;

export interface User {
    authenticated: boolean;
    roles: string[];
}

export interface AuthState {
    currentUser: User;
}
