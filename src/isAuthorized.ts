import { User, AuthorizationSetting, AuthorizationResult } from "./model";

export const isAuthorized = (user: User, setting: AuthorizationSetting): AuthorizationResult => {

    if (setting !== false) {
        if (!user.authenticated) {
            return "Unauthenticated";
        } else {
            let authorized = false;

            if (setting === true) {
                authorized = true;
            } else if (setting instanceof Array) {
                authorized = setting.some(a => user.roles.indexOf(a) > -1);
            } else {
                authorized = user.roles.indexOf(setting) > -1;
            }

            if (!authorized) {
                return "Unauthorized";
            }
        }
    }

    return "Authorized";
};
