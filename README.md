# neworbit-redux-authorisation

This package provides a number of tools to help you implement authorisation in your front end application.

## Key principals

This package defines an interface `User` which all of the authorisation tools expect.
```ts
interface User {
  authenticated: boolean;
  roles: string[];
}
```

You can extend this for your own user object.

All of the below tools use an `AuthorisationSetting` type which is equivalent to: `bool | string | string[]`.  These have the following meanings:
 - `true` - will return `Authorised` for any authenticated user
 - `false` - will return `Authorised` for any user
 - `string` - will return `Authorised` for any authenticated user with a role which matches this string
 - `string[]` - will return `Authorised` for any authenticated user with a role which matches one of the roles in this array
 - `undefined` - will return `Unauthorised` for any user

## `authMiddleware`

## `Authorise` component

## `authorise` higher order component

## `isAuthorised` function

This is the backbone to all of the above tools.  It takes in a `User` and  an `AuthorisationSetting` and will return one of the following results:
 - `"Authorised"` - the user is authorised
 - `"Unauthorised"` - the user is not authorised
 - `"Unauthenticated"` - the user is not authenticated
