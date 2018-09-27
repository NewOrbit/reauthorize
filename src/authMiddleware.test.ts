import { Expect, Test, TestCase, TestFixture, SpyOn, Setup, createFunctionSpy } from "alsatian";
import { configureAuthMiddleware, UNAUTHENTICATED_ERROR, UNAUTHORIZED_ERROR, AuthPayload } from "./authMiddleware";
import { AuthState } from "./model";

@TestFixture("authMiddleware")
export class AuthMiddlewareTests {

    private store: {
        dispatch: () => any;
        getState: () => any;
    };

    private next: () => any;
    private invoke: (action: any) => any;
    private error: Error;

    private unauthorizedAction = { type: "LOCATION_CHANGED", path: "/forbidden" };
    private unauthenticatedAction = { type: "LOCATION_CHANGED", path: "/login" };

    @Setup
    public setup() {
        this.store = {
            dispatch: () => ({}),
            getState: () => ({})
        };

        SpyOn(this.store, "dispatch");

        const authMiddleware = configureAuthMiddleware<AuthState, { payload: { result: AuthPayload } }>({
            actionType: "LOCATION_CHANGED",
            getAuthPayload: action => action.payload.result,
            getUser: state => state.currentUser,
            unauthorizedAction: this.unauthorizedAction,
            unauthenticatedAction: this.unauthenticatedAction
        });

        this.next = createFunctionSpy();
        this.invoke = (action: any) => {
            this.error = null;
            try {
                authMiddleware(this.store)(this.next)(action);
            } catch (error) {
                this.error = error;
            }
        };
    }

    @Test("should pass through actions it cannot handle")
    @TestCase({ type: "SOME_ACTION" })
    @TestCase({ type: "SOME_OTHER_ACTION" })
    public shouldPassThroughActionsItCannotHandle(action: any) {
        this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
    }

    @Test("should allow authorized route")
    public shouldAllowAuthorisedRoute() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @Test("should allow authorized route for string")
    public shouldAllowAuthorisedRouteForString() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: "ADMIN"
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @Test("should not allow unauthorized route")
    public shouldNotAllowUnauthorizedRoute() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["SUPER_ADMIN"]
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
    }

    @Test("should not allow route without authorize")
    public shouldNotAllowRouteWithoutAuthorise() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
    }

    @Test("should allow route with no authorize if set on parent")
    public shouldAllowRouteWithoutAuthoriseIfOnParent() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    parent: {
                        authorize: ["ADMIN"]
                    }
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @Test("should not allow route with authorize on that do not match even if parent does")
    public shouldNotAllowRouteIfAuthoriseDontMatchButParentDoes() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["SUPER_ADMIN"],
                    parent: {
                        authorize: ["ADMIN"]
                    }
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
    }

    @Test("should not allow unauthenticated users")
    public shouldNotAllowUnauthenticatedUsers() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: false, roles: [] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["SUPER_ADMIN"],
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthenticatedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHENTICATED_ERROR);
    }

    @Test("should not allow unauthenticated users with authorize undefined")
    public shouldNotAllowUnauthenticatedUsersWithoutAuthorise() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: false, roles: ["SOMETHING"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthenticatedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHENTICATED_ERROR);
    }

    @Test("should allow unauthenticated users with authorize false")
    public shouldAllowUnauthenticatedUsersWithAuthoriseFalse() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: false, roles: [] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: false
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @Test("should allow authenticated users for any role for authorize true")
    public shouldAllowAuthenticatedUsersWithAnyRoleForAuthoriseTrue() {
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["SOMETHING"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: true
                }
            }
        };

        this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }
}
