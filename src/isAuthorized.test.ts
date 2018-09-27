import { AsyncTest, Expect, Test, TestCase, TestFixture, SpyOn } from "alsatian";

import { isAuthorized } from "./isAuthorized";

@TestFixture("authorize")
export class AuthorizeTests {

    @Test("should return authorized for matching roles")
    public shouldReturnAuthorized() {
        const result = isAuthorized({ authenticated: true, roles: ["ADMIN"] }, ["ADMIN"]);
        Expect(result).toBe("Authorized");
    }

    @Test("should return authorized for matching string")
    public shouldReturnAuthorizedForString() {
        const result = isAuthorized({ authenticated: true, roles: ["ADMIN"] }, "ADMIN");
        Expect(result).toBe("Authorized");
    }

    @Test("should return unauthorized for non matching roles")
    public shouldReturnUnauthorizedForNonMatchingRoles() {
        const result = isAuthorized({ authenticated: true, roles: ["ADMIN"] }, "SUPER_ADMIN");
        Expect(result).toBe("Unauthorized");
    }

    @Test("should return unauthorized for undefined")
    public shouldReturnUnauthorizedForUndefined() {
        const result = isAuthorized({ authenticated: true, roles: ["ADMIN"] }, undefined);
        Expect(result).toBe("Unauthorized");
    }

    @Test("should return unauthenticated if unauthenticated user")
    public shouldReturnUnauthenticated() {
        const result = isAuthorized({ authenticated: false, roles: ["ADMIN"] }, "ANYTHING");
        Expect(result).toBe("Unauthenticated");
    }

    @Test("should return unauthenticated with authorize undefined")
    public shouldReturnUnauthenticatedForUndefined() {
        const result = isAuthorized({ authenticated: false, roles: ["ADMIN"] }, undefined);
        Expect(result).toBe("Unauthenticated");
    }

    @Test("should allow unauthenticated users with authorize false")
    public shouldAllowUnauthenticatedUsersWithAuthorizeFalse() {
        const result = isAuthorized({ authenticated: false, roles: ["ADMIN"] }, false);
        Expect(result).toBe("Authorized");
    }

    @Test("should allow authenticated users for any role for authorize true")
    public shouldAllowAuthenticatedUsersWithAnyRoleForAuthorizeTrue() {
        const result = isAuthorized({ authenticated: true, roles: ["ADMIN"] }, true);
        Expect(result).toBe("Authorized");
    }
}
