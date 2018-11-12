import { Middleware, MiddlewareAPI, Dispatch } from "redux";
import { AuthorizationSetting, User } from "./model";
import { isAuthorized } from "./isAuthorized";

export const UNAUTHORIZED_ERROR = "Not authorized to view this route";
export const UNAUTHENTICATED_ERROR = "Not authenticated";

export type AuthPayload = {
    authorize: AuthorizationSetting,
    parent?: AuthPayload
};

export type ShouldHandleError = (error: any) => boolean;

export interface AuthMiddlewareOptions<TState, TAction> {
    actionType: string;
    getUser: (state: TState) => User;
    getAuthPayload: (action: TAction) => AuthPayload;
    unauthorizedAction: any;
    unauthenticatedAction?: any;
    unauthorizedError?: string;
    unauthenticatedError?: string;
    handleUnauthenticatedApiErrors?: boolean | ShouldHandleError;
    handleUnauthorizedApiErrors?: boolean | ShouldHandleError;
}

export const configureAuthMiddleware = <TState, TAction>(options: AuthMiddlewareOptions<TState, TAction>): Middleware => {

    const {
        actionType,
        getAuthPayload,
        getUser,
        unauthenticatedAction,
        unauthorizedAction,
        handleUnauthenticatedApiErrors,
        handleUnauthorizedApiErrors
    } = options;

    const unauthorizedError = options.unauthorizedError || UNAUTHORIZED_ERROR;
    const unauthenticatedError = options.unauthenticatedError || UNAUTHENTICATED_ERROR;

    const isUnauthenticatedError = typeof handleUnauthenticatedApiErrors === "function"
        ? handleUnauthenticatedApiErrors
        : handleUnauthenticatedApiErrors && ((error: any) => error.response.status === 401);

    const isUnauthorizedError = typeof handleUnauthorizedApiErrors === "function"
        ? handleUnauthorizedApiErrors
        : handleUnauthorizedApiErrors && ((error: any) => error.response.status === 403);

    const handleUnauthenticated = (api: MiddlewareAPI<any>) => {
        api.dispatch(unauthenticatedAction || unauthorizedAction);
        throw new Error(unauthenticatedError);
    };

    const handleUnauthorized = (api: MiddlewareAPI<any>) => {
        api.dispatch(unauthorizedAction);
        throw new Error(unauthorizedError);
    };

    return (api: MiddlewareAPI<any>) => (next: Dispatch) => async (action: any) => {

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
                handleUnauthenticated(api);
            }

            if (authResult === "Unauthorized") {
                handleUnauthorized(api);
            }
        }

        try {
            return await next(action);
        } catch (e) {
            if (isUnauthenticatedError && isUnauthenticatedError(e)) {
                handleUnauthenticated(api);
            }

            if (isUnauthorizedError && isUnauthorizedError(e)) {
                handleUnauthorized(api);
            }

            throw e;
        }
    };
};
