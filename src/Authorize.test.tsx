import * as React from "react";
import { Expect, Test, TestFixture } from "alsatian";
import { configure, shallow, ShallowWrapper } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

import { AuthorizeUnconnected } from "./Authorize";
import { User } from "./model";

@TestFixture("Authorize")
export class AuthorizeTests {

    @Test("should render children for authorized user")
    public shouldRenderChildren() {
        const user: User = { authenticated: true, roles: ["TestRole"] };
        const wrapper: ShallowWrapper = shallow(
            <AuthorizeUnconnected authorize={"TestRole"} currentUser={user}>
                <div>child element</div>
            </AuthorizeUnconnected>
        );

        Expect(wrapper.children().matchesElement(<div>child element</div>)).toBeTruthy();
    }

    @Test("should hide children for unauthorized user")
    public shouldHideChildren() {
        const user: User = { authenticated: true, roles: ["TestRole"] };
        const wrapper: ShallowWrapper = shallow(
            <AuthorizeUnconnected authorize={"AnotherRole"} currentUser={user}>
                <div>child element</div>
            </AuthorizeUnconnected>
        );

        Expect(wrapper.children().length).toBe(0);
    }

    @Test("should hide children for authorized user that does not meet condition")
    public shouldHideChildrenForCondition() {
        type MyUser = User & { somethingElse: boolean };
        const user: MyUser = { authenticated: true, roles: ["TestRole"], somethingElse: false };
        const condition = (u: User) => (u as MyUser).somethingElse;

        const wrapper: ShallowWrapper = shallow(
            <AuthorizeUnconnected authorize={"TestRole"} currentUser={user} condition={condition}>
                <div>child element</div>
            </AuthorizeUnconnected>
        );

        Expect(wrapper.children().length).toBe(0);
    }

    @Test("should show children for authorized user that does meet condition")
    public shouldShowChildrenForCondition() {
        type MyUser = User & { somethingElse: boolean };
        const user: MyUser = { authenticated: true, roles: ["TestRole"], somethingElse: true };
        const condition = (u: User) => (u as MyUser).somethingElse;

        const wrapper: ShallowWrapper = shallow(
            <AuthorizeUnconnected authorize={"TestRole"} currentUser={user} condition={condition}>
                <div>child element</div>
            </AuthorizeUnconnected>
        );

        Expect(wrapper.children().matchesElement(<div>child element</div>)).toBeTruthy();
    }
}
