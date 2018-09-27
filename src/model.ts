export type AuthorizationSetting = boolean | string | string[];
export type AuthorizationResult = "Authorized" | "Unauthorized" | "Unauthenticated";
export type UserAuthorizationCondition = (currentUser: User) => boolean;

export interface User {
    authenticated: boolean;
    roles: string[];
}

export interface AuthState {
    currentUser: User;
}
