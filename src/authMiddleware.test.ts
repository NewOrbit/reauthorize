import { Expect, Test, TestCase, TestFixture, SpyOn, Setup, createFunctionSpy, AsyncTest } from "alsatian";
import { configureAuthMiddleware, UNAUTHENTICATED_ERROR, UNAUTHORIZED_ERROR, AuthPayload, AuthMiddlewareOptions } from "./authMiddleware";
import { AuthState } from "./model";
import { ISpiedFunction } from "alsatian/core/spying/spied-function.i";

interface TestAction {
    payload: {
        result: AuthPayload
    };
}

@TestFixture("authMiddleware")
export class AuthMiddlewareTests {

    private store: {
        dispatch: () => any;
        getState: () => any;
    };

    private next: ISpiedFunction<any, any>;
    private invoke: (action: any) => any;
    private error: Error;

    private unauthorizedAction = { type: "LOCATION_CHANGED", path: "/forbidden" };
    private unauthenticatedAction = { type: "LOCATION_CHANGED", path: "/login" };

    public setup(options: Partial<AuthMiddlewareOptions<AuthState, TestAction>> = {}) {
        this.store = {
            dispatch: () => ({}),
            getState: () => ({})
        };

        SpyOn(this.store, "dispatch");

        const defaultOptions = {
            actionType: "LOCATION_CHANGED",
            getAuthPayload: action => action.payload.result,
            getUser: state => state.currentUser,
            unauthorizedAction: this.unauthorizedAction,
            unauthenticatedAction: this.unauthenticatedAction
        };

        const authMiddleware = configureAuthMiddleware<AuthState, TestAction>({ ...defaultOptions, ...options });

        this.next = createFunctionSpy();
        this.invoke = async (action: any) => {
            this.error = null;
            try {
                await authMiddleware(this.store)(this.next)(action);
            } catch (error) {
                this.error = error;
            }
        };
    }

    @AsyncTest("should pass through actions it cannot handle")
    @TestCase({ type: "SOME_ACTION" })
    @TestCase({ type: "SOME_OTHER_ACTION" })
    public async shouldPassThroughActionsItCannotHandle(action: any) {
        this.setup();
        await this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
    }

    @AsyncTest("should allow authorized route")
    public async shouldAllowAuthorisedRoute() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @AsyncTest("should allow authorized route for string")
    public async shouldAllowAuthorisedRouteForString() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: "ADMIN"
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @AsyncTest("should not allow unauthorized route")
    public async shouldNotAllowUnauthorizedRoute() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["SUPER_ADMIN"]
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
    }

    @AsyncTest("should not allow route without authorize")
    public async shouldNotAllowRouteWithoutAuthorise() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
    }

    @AsyncTest("should allow route with no authorize if set on parent")
    public async shouldAllowRouteWithoutAuthoriseIfOnParent() {
        this.setup();
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

        await this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @AsyncTest("should not allow route with authorize on that do not match even if parent does")
    public async shouldNotAllowRouteIfAuthoriseDontMatchButParentDoes() {
        this.setup();
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

        await this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
    }

    @AsyncTest("should not allow unauthenticated users")
    public async shouldNotAllowUnauthenticatedUsers() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: false, roles: [] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["SUPER_ADMIN"],
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthenticatedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHENTICATED_ERROR);
    }

    @AsyncTest("should not allow unauthenticated users with authorize undefined")
    public async shouldNotAllowUnauthenticatedUsersWithoutAuthorise() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: false, roles: ["SOMETHING"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthenticatedAction);
        Expect(this.next).not.toHaveBeenCalled();
        Expect(this.error.message).toBe(UNAUTHENTICATED_ERROR);
    }

    @AsyncTest("should allow unauthenticated users with authorize false")
    public async shouldAllowUnauthenticatedUsersWithAuthoriseFalse() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: false, roles: [] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: false
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @AsyncTest("should allow authenticated users for any role for authorize true")
    public async shouldAllowAuthenticatedUsersWithAnyRoleForAuthoriseTrue() {
        this.setup();
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["SOMETHING"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: true
                }
            }
        };

        await this.invoke(action);
        Expect(this.store.dispatch).not.toHaveBeenCalled();
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error).toBeNull();
    }

    @AsyncTest("should dispatch unauthenticated action if api responds with a 401 and configured")
    public async shouldDispatchUnauthenticatedFor401() {
        this.setup({
            handleUnauthenticatedApiErrors: true
        });
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.next.andCall(() => {
            throw {
                message: "Request failed with status code 401",
                response: {
                    status: 401,
                    statusText: "Unauthorized"
                }
            };
        });

        await this.invoke(action);
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error.message).toBe(UNAUTHENTICATED_ERROR);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthenticatedAction);
    }

    @AsyncTest("should dispatch unauthenticated action if error matches configured function")
    public async shouldDispatchUnauthenticatedForCustomError() {
        this.setup({
            handleUnauthenticatedApiErrors: error => error.message === "bad error"
        });
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.next.andCall(() => {
            throw {
                message: "bad error"
            };
        });

        await this.invoke(action);
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error.message).toBe(UNAUTHENTICATED_ERROR);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthenticatedAction);
    }

    @AsyncTest("should not dispatch unauthenticated action if error matches configured function")
    public async shouldNotDispatchUnauthenticatedForCustomError() {
        this.setup({
            handleUnauthenticatedApiErrors: error => error.message === "bad error"
        });
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.next.andCall(() => {
            throw {
                message: "another error"
            };
        });

        await this.invoke(action);
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error.message).toBe("another error");
        Expect(this.store.dispatch).not.toHaveBeenCalled();
    }

    @AsyncTest("should dispatch unauthorized action if api responds with a 403 and configured")
    public async shouldDispatchUnauthorizedFor403() {
        this.setup({
            handleUnauthorizedApiErrors: true
        });
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.next.andCall(() => {
            throw {
                message: "Request failed with status code 401",
                response: {
                    status: 403,
                    statusText: "Unauthorized"
                }
            };
        });

        await this.invoke(action);
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
    }

    @AsyncTest("should dispatch unauthorized action if error matches configured function")
    public async shouldDispatchUnauthorizedForCustomError() {
        this.setup({
            handleUnauthorizedApiErrors: error => error.message === "bad error"
        });
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.next.andCall(() => {
            throw {
                message: "bad error"
            };
        });

        await this.invoke(action);
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error.message).toBe(UNAUTHORIZED_ERROR);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthorizedAction);
    }

    @AsyncTest("should not dispatch unauthorized action if error matches configured function")
    public async shouldNotDispatchUnauthorizedForCustomError() {
        this.setup({
            handleUnauthorizedApiErrors: error => error.message === "bad error"
        });
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.next.andCall(() => {
            throw {
                message: "another error"
            };
        });

        await this.invoke(action);
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error.message).toBe("another error");
        Expect(this.store.dispatch).not.toHaveBeenCalled();
    }

    @AsyncTest("should dispatch unauthenticated action if api responds asynchronously with a 401 and configured")
    public async shouldDispatchUnauthenticatedForAsync401() {
        this.setup({
            handleUnauthenticatedApiErrors: true
        });
        SpyOn(this.store, "getState").andReturn({ currentUser: { authenticated: true, roles: ["ADMIN"] }});

        const action = {
            type: "LOCATION_CHANGED",
            payload: {
                result: {
                    authorize: ["ADMIN"]
                }
            }
        };

        this.next.andCall(() => {
            return Promise.reject({
                message: "Request failed with status code 401",
                response: {
                    status: 401,
                    statusText: "Unauthorized"
                }
            });
        });

        await this.invoke(action);
        Expect(this.next).toHaveBeenCalledWith(action);
        Expect(this.error.message).toBe(UNAUTHENTICATED_ERROR);
        Expect(this.store.dispatch).toHaveBeenCalledWith(this.unauthenticatedAction);
    }
}
