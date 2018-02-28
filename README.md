# neworbit-redux-authorisation

This package provides a number of tools to help you implement authorisation in your front end application.

## Installation

`npm install @neworbit/redux-authorisation`

## Key principals

This package defines an interface `User` which all of the authorisation tools expect.
```ts
interface User {
  authenticated: boolean;
  roles: string[];
}
```

You can extend this for your own user object.

All of the below tools use an `AuthorisationSetting` type which is equivalent to: `bool | string | string[]`.  The possible values have the following meanings:
 - `true` - will return `Authorised` for any authenticated user
 - `false` - will return `Authorised` for any user
 - `string` - will return `Authorised` for any authenticated user with a role which matches this string
 - `string[]` - will return `Authorised` for any authenticated user with a role which matches one of the roles in this array
 - `undefined` - will return `Unauthorised` for any user

## `authMiddleware`

This is a middleware that allows you to authorise based on redux actions.

Its configured with the following options:

```ts
export interface AuthMiddlewareOptions<TState, TAction> {
    actionType: string;                                      // name of action to monitor
    getUser: (state: TState) => User;                        // method to get the current user from the state
    getAuthPayload: (action: TAction) => AuthPayload;        // method to get the payload from the action
    unauthorisedAction: any;                                 // action to dispatch if unauthorised
    unauthenticatedAction?: any;                             // action to dispatch if unauthenticated (unauthorised will be used if not provided)
    unauthorisedError?: string;                              // error message to throw when unauthorised
    unauthenticatedError?: string;                           // error message to throw when authenticated
}
```

The `AuthPayload` type is defined as:
```ts
export type AuthPayload = {
    authorise: AuthorisationSetting,
    parent?: AuthPayload
};
```

So if parent is defined it will recurse and inherit authorisation settings if not defined at the current level.

For example to use with redux-little-router to authorise your location changes:
```ts
import { LOCATION_CHANGED, replace, Location } from "redux-little-router";
import { configureAuthMiddleware, AuthState, AuthPayload } from "@neworbit/redux-authorisation";

const authMiddleware = configureAuthMiddleware<AuthState, { payload: Location }>({
    actionType: LOCATION_CHANGED,
    getAuthPayload: action => (action.payload || {}).result as AuthPayload,
    getUser: state => state.currentUser,
    unauthorisedAction: replace("/forbidden")
});

// add authorise to your routes:
const routes = {
  "/home": {
    authorise: false
  },
  "/admin": {
    authorise: "ADMIN"
  }
};
```

## `Authorise` component

This is a component you can use to hide parts of a component based on authorisation.

> Note: if you need to hide an entire component a better solution is to use the higher order component described below

```ts
import * as React from "react";
import { Authorise } from "@neworbit/redux-authorisation";

class MyComponent extends React.Component<{}> {
  public render() {
    return (
      <div>
        <h1>My component</h1>
        <p>Some non sensitive information</p>
        <Authorise authorise="ADMIN">
          <p>Some sensitive information</p>
        </Authorise>
      </div>
    );
  }
}
```

## `authorise` higher order component

This is a higher order component, connected to the redux store which allows you to show or hide an entire component based on an authorisation setting:

```ts
import * as React from "react";
import { authorise } from "@neworbit/redux-authorisation";

class MyComponent extends React.Component<{}> {
  public render() {
    return <div>Some sensitive information</div>;
  }
}

export default authorise("ADMIN")(MyComponent);
```

## `isAuthorised` function

This is the backbone to all of the above tools.  It takes in a `User` and  an `AuthorisationSetting` and will return one of the following results:
 - `"Authorised"` - the user is authorised
 - `"Unauthorised"` - the user is not authorised
 - `"Unauthenticated"` - the user is not authenticated
