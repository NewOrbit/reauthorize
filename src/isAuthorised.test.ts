import { AsyncTest, Expect, Test, TestCase, TestFixture, SpyOn } from "alsatian";

import { isAuthorised } from "./isAuthorised";

@TestFixture("authorise")
export class AuthoriseTests {

    @Test("should return authorised for matching roles")
    public shouldReturnAuthorised() {
        const result = isAuthorised({ authenticated: true, roles: ["ADMIN"] }, ["ADMIN"]);
        Expect(result).toBe("Authorised");
    }

    @Test("should return authorised for matching string")
    public shouldReturnAuthorisedForString() {
        const result = isAuthorised({ authenticated: true, roles: ["ADMIN"] }, "ADMIN");
        Expect(result).toBe("Authorised");
    }

    @Test("should return unauthorised for non matching roles")
    public shouldReturnUnauthorisedForNonMatchingRoles() {
        const result = isAuthorised({ authenticated: true, roles: ["ADMIN"] }, "SUPER_ADMIN");
        Expect(result).toBe("Unauthorised");
    }

    @Test("should return unauthorised for undefined")
    public shouldReturnUnauthorisedForUndefined() {
        const result = isAuthorised({ authenticated: true, roles: ["ADMIN"] }, undefined);
        Expect(result).toBe("Unauthorised");
    }

    @Test("should return unauthenticated if unauthenticated user")
    public shouldReturnUnauthenticated() {
        const result = isAuthorised({ authenticated: false, roles: ["ADMIN"] }, "ANYTHING");
        Expect(result).toBe("Unauthenticated");
    }

    @Test("should return unauthenticated with authorise undefined")
    public shouldReturnUnauthenticatedForUndefined() {
        const result = isAuthorised({ authenticated: false, roles: ["ADMIN"] }, undefined);
        Expect(result).toBe("Unauthenticated");
    }

    @Test("should allow unauthenticated users with authorise false")
    public shouldAllowUnauthenticatedUsersWithAuthoriseFalse() {
        const result = isAuthorised({ authenticated: false, roles: ["ADMIN"] }, false);
        Expect(result).toBe("Authorised");
    }

    @Test("should allow authenticated users for any role for authorise true")
    public shouldAllowAuthenticatedUsersWithAnyRoleForAuthoriseTrue() {
        const result = isAuthorised({ authenticated: true, roles: ["ADMIN"] }, true);
        Expect(result).toBe("Authorised");
    }
}
