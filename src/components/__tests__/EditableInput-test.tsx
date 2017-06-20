import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import EditableInput from "../EditableInput";

describe("EditableInput", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={false}
        checked={true}
        value="initial value">
        <option>option</option>
      </EditableInput>
    );
  });

  it("shows label from props", () => {
    let label = wrapper.find("label");
    expect(label.text()).to.contain("label");
  });

  it("shows initial value from props", () => {
    expect(wrapper.state().value).to.equal("initial value");
    let input = wrapper.find("input");
    expect(input.prop("value")).to.equal("initial value");
    expect(input.prop("checked")).to.equal(true);
  });

  it("shows children from props", () => {
    let option = wrapper.find("option");
    expect(option.text()).to.equal("option");
  });

  it("updates state and value when props change", () => {
    wrapper.setProps({ value: "new value", checked: false });
    expect(wrapper.state().value).to.equal("new value");
    expect(wrapper.state().checked).to.equal(false);
    let input = wrapper.find("input");
    expect(input.prop("value")).to.equal("new value");
    expect(input.prop("checked")).to.equal(false);
  });

  it("updates value in state when input changes", () => {
    let wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.value = "new value";
    input.simulate("change");
    expect(wrapper.state().value).to.equal("new value");

    // This also works with a checkbox.
    wrapper = mount(
      <EditableInput
        elementType="input"
        type="checkbox"
        label="label"
        name="name"
        disabled={false}
        checked={true}
        />
    );
    input = wrapper.find("input");
    inputElement = input.get(0) as any;
    inputElement.checked = false;
    input.simulate("change");
    expect(wrapper.state().checked).to.equal(false);
  });

  it("disables", () => {
    let wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        />
    );
    let input = wrapper.find("input");
    expect(input.prop("disabled")).to.equal(true);
  });

  it("calls provided onChange", () => {
    let onChange = stub();
    let wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        onChange={onChange}
        />
    );

    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.value = "new value";
    input.simulate("change");
    expect(onChange.callCount).to.equal(1);
  });

  it("clears input", () => {
    wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );

    (wrapper.instance() as EditableInput).clear();
    expect(wrapper.state("value")).to.equal("");
    expect(wrapper.state("checked")).to.equal(false);
    let inputElement = wrapper.find("input").get(0) as any;
    expect(inputElement.value).to.equal("");
    expect(inputElement.checked).to.equal(false);
  });
});