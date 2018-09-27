# neworbit-redux-authorisation

This package provides a number of tools to help you implement authorization in your front end application.

## Installation

`npm install @neworbit/redux-authorisation`

## Key principals

This package defines an interface `User` which all of the authorization tools expect.
```ts
interface User {
  authenticated: boolean;
  roles: string[];
}
```

You can extend this for your own user object.

All of the below tools use an `AuthorizationSetting` type which is equivalent to: `bool | string | string[]`.  The possible values have the following meanings:
 - `true` - will return `Authorized` for any authenticated user
 - `false` - will return `Authorized` for any user
 - `string` - will return `Authorized` for any authenticated user with a role which matches this string
 - `string[]` - will return `Authorized` for any authenticated user with a role which matches one of the roles in this array
 - `undefined` - will return `Unauthorized` for any user

## `authMiddleware`

This is a middleware that allows you to authorize based on redux actions.

Its configured with the following options:

```ts
export interface AuthMiddlewareOptions<TState, TAction> {
    actionType: string;                                      // name of action to monitor
    getUser: (state: TState) => User;                        // method to get the current user from the state
    getAuthPayload: (action: TAction) => AuthPayload;        // method to get the payload from the action
    unauthorizedAction: any;                                 // action to dispatch if unauthorized
    unauthenticatedAction?: any;                             // action to dispatch if unauthenticated (unauthorized will be used if not provided)
    unauthorizedError?: string;                              // error message to throw when unauthorized
    unauthenticatedError?: string;                           // error message to throw when authenticated
}
```

The `AuthPayload` type is defined as:
```ts
export type AuthPayload = {
    authorize: AuthorizationSetting,
    parent?: AuthPayload
};
```

So if parent is defined it will recurse and inherit authorization settings if not defined at the current level.

For example to use with redux-little-router to authorize your location changes:
```ts
import { LOCATION_CHANGED, replace, Location } from "redux-little-router";
import { configureAuthMiddleware, AuthState, AuthPayload } from "@neworbit/redux-authorisation";

const authMiddleware = configureAuthMiddleware<AuthState, { payload: Location }>({
    actionType: LOCATION_CHANGED,
    getAuthPayload: action => (action.payload || {}).result as AuthPayload,
    getUser: state => state.currentUser,
    unauthorizedAction: replace("/forbidden")
});

// add authorize to your routes:
const routes = {
  "/home": {
    authorize: false
  },
  "/admin": {
    authorize: "ADMIN"
  }
};
```

## `Authorize` component

This is a component you can use to hide parts of a component based on authorization.

> Note: if you need to hide an entire component a better solution is to use the higher order component described below

```ts
import * as React from "react";
import { Authorize } from "@neworbit/redux-authorisation";

class MyComponent extends React.Component<{}> {
  public render() {
    return (
      <div>
        <h1>My component</h1>
        <p>Some non sensitive information</p>
        <Authorize authorize="ADMIN">
          <p>Some sensitive information</p>
        </Authorize>
      </div>
    );
  }
}
```

## `authorize` higher order component

This is a higher order component, connected to the redux store which allows you to show or hide an entire component based on an authorization setting:

```ts
import * as React from "react";
import { authorize } from "@neworbit/redux-authorisation";

class MyComponent extends React.Component<{}> {
  public render() {
    return <div>Some sensitive information</div>;
  }
}

export default authorize("ADMIN")(MyComponent);
```

## `isAuthorized` function

This is the backbone to all of the above tools.  It takes in a `User` and  an `AuthorizationSetting` and will return one of the following results:
 - `"Authorized"` - the user is authorized
 - `"Unauthorized"` - the user is not authorized
 - `"Unauthenticated"` - the user is not authenticated

## License

Made with :sparkling_heart: by [NewOrbit](https://www.neworbit.co.uk/) in Oxfordshire, and licensed under the [MIT Licence](LICENSE)
