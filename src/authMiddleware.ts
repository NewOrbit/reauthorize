import { Middleware, MiddlewareAPI, Dispatch } from "redux";
import { AuthorizationSetting, User } from "./model";
import { isAuthorized } from "./isAuthorized";

export const UNAUTHORIZED_ERROR = "Not authorized to view this route";
export const UNAUTHENTICATED_ERROR = "Not authenticated";

export type AuthPayload = {
    authorize: AuthorizationSetting,
    parent?: AuthPayload
};

export interface AuthMiddlewareOptions<TState, TAction> {
    actionType: string;
    getUser: (state: TState) => User;
    getAuthPayload: (action: TAction) => AuthPayload;
    unauthorizedAction: any;
    unauthenticatedAction?: any;
    unauthorizedError?: string;
    unauthenticatedError?: string;
}

export const configureAuthMiddleware = <TState, TAction>(options: AuthMiddlewareOptions<TState, TAction>): Middleware => {

    const {
        actionType,
        getAuthPayload,
        getUser,
        unauthenticatedAction,
        unauthorizedAction,
    } = options;

    const unauthorizedError = options.unauthorizedError || UNAUTHORIZED_ERROR;
    const unauthenticatedError = options.unauthenticatedError || UNAUTHENTICATED_ERROR;

    return (api: MiddlewareAPI<any>) => (next: Dispatch<TState>) => (action: any) => {

        if (action.type === actionType) {

            const user = getUser(api.getState());
            const result = getAuthPayload(action);

            let authorize = result.authorize;
            let parent = result.parent;

            while (authorize === undefined && parent !== undefined) {
                authorize = parent.authorize;
                parent = parent.parent;
            }

            const authResult = isAuthorized(user, authorize);

            if (authResult === "Unauthenticated") {
                api.dispatch(unauthenticatedAction || unauthorizedAction);
                throw new Error(unauthenticatedError);
            }

            if (authResult === "Unauthorized") {
                api.dispatch(unauthorizedAction);
                throw new Error(unauthorizedError);
            }
        }

        return next(action);
    };
};
