import * as React from "react";
import { Expect, Test, TestFixture } from "alsatian";
import { configure, shallow, ShallowWrapper } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

import { AuthoriseUnconnected } from "./Authorise";
import { User } from "./model";

@TestFixture("Authorise")
export class AuthoriseTests {

    @Test("should render children for authorised user")
    public shouldRenderChildren() {
        const user: User = { authenticated: true, roles: ["TestRole"] };
        const wrapper: ShallowWrapper = shallow(
            <AuthoriseUnconnected authorise={"TestRole"} currentUser={user}>
                <div>child element</div>
            </AuthoriseUnconnected>
        );

        Expect(wrapper.children().matchesElement(<div>child element</div>)).toBeTruthy();
    }

    @Test("should hide children for unauthorised user")
    public shouldHideChildren() {
        const user: User = { authenticated: true, roles: ["TestRole"] };
        const wrapper: ShallowWrapper = shallow(
            <AuthoriseUnconnected authorise={"AnotherRole"} currentUser={user}>
                <div>child element</div>
            </AuthoriseUnconnected>
        );

        Expect(wrapper.children().length).toBe(0);
    }

    @Test("should hide children for authorised user that does not meet condition")
    public shouldHideChildrenForCondition() {
        type MyUser = User & { somethingElse: boolean };
        const user: MyUser = { authenticated: true, roles: ["TestRole"], somethingElse: false };
        const condition = (u: User) => (u as MyUser).somethingElse;

        const wrapper: ShallowWrapper = shallow(
            <AuthoriseUnconnected authorise={"TestRole"} currentUser={user} condition={condition}>
                <div>child element</div>
            </AuthoriseUnconnected>
        );

        Expect(wrapper.children().length).toBe(0);
    }

    @Test("should show children for authorised user that does meet condition")
    public shouldShowChildrenForCondition() {
        type MyUser = User & { somethingElse: boolean };
        const user: MyUser = { authenticated: true, roles: ["TestRole"], somethingElse: true };
        const condition = (u: User) => (u as MyUser).somethingElse;

        const wrapper: ShallowWrapper = shallow(
            <AuthoriseUnconnected authorise={"TestRole"} currentUser={user} condition={condition}>
                <div>child element</div>
            </AuthoriseUnconnected>
        );

        Expect(wrapper.children().matchesElement(<div>child element</div>)).toBeTruthy();
    }
}
