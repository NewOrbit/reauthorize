import { Middleware, MiddlewareAPI, Dispatch } from "redux";
import { AuthorisationSetting, User } from "./model";
import { isAuthorised } from "./isAuthorised";

export const UNAUTHORISED_ERROR = "Not authorised to view this route";
export const UNAUTHENTICATED_ERROR = "Not authenticated";

export type RouteResult = {
    authorise: AuthorisationSetting,
    parent?: RouteResult
};

export interface AuthMiddlewareOptions<TState, TAction> {
    locationChangeActionType: string;
    getUser: (state: TState) => User;
    getRouteResult: (action: TAction) => RouteResult;
    unauthorisedAction: any;
    unauthenticatedAction?: any;
    unauthorisedError?: string;
    unauthenticatedError?: string;
}

export const configureAuthMiddleware = <TState, TAction>(options: AuthMiddlewareOptions<TState, TAction>): Middleware => {

    const {
        locationChangeActionType,
        getRouteResult,
        getUser,
        unauthenticatedAction,
        unauthorisedAction,
    } = options;

    const unauthorisedError = options.unauthorisedError || UNAUTHORISED_ERROR;
    const unauthenticatedError = options.unauthenticatedError || UNAUTHENTICATED_ERROR;

    return (api: MiddlewareAPI<any>) => (next: Dispatch<TState>) => (action: any) => {

        if (action.type === locationChangeActionType) {

            const user = getUser(api.getState());
            const result = getRouteResult(action);

            let authorise = result.authorise;
            let parent = result.parent;

            while (authorise === undefined && parent !== undefined) {
                authorise = parent.authorise;
                parent = parent.parent;
            }

            const authResult = isAuthorised(user, authorise);

            if (authResult === "Unauthenticated") {
                api.dispatch(unauthenticatedAction || unauthorisedAction);
                throw new Error(unauthenticatedError);
            }

            if (authResult === "Unauthorised") {
                api.dispatch(unauthorisedAction);
                throw new Error(unauthorisedError);
            }
        }

        return next(action);
    };
};
