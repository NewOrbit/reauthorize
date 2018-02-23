import { User, AuthorisationSetting, AuthorisationResult } from "./model";

export const isAuthorised = (user: User, setting: AuthorisationSetting): AuthorisationResult => {

    if (setting !== false) {
        if (!user.authenticated) {
            return "Unauthenticated";
        } else {
            let authorised = false;

            if (setting === true) {
                authorised = true;
            } else if (setting instanceof Array) {
                authorised = setting.some(a => user.roles.indexOf(a) > -1);
            } else {
                authorised = user.roles.indexOf(setting) > -1;
            }

            if (!authorised) {
                return "Unauthorised";
            }
        }
    }

    return "Authorised";
};
