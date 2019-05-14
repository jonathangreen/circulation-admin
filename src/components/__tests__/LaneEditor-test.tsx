import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { Button } from "library-simplified-reusable-components";
import LaneEditor from "../LaneEditor";
import TextWithEditMode from "../TextWithEditMode";
import EditableInput from "../EditableInput";
import LaneCustomListsEditor from "../LaneCustomListsEditor";

describe("LaneEditor", () => {
  let wrapper;
  let editLane;
  let deleteLane;
  let showLane;
  let hideLane;
  let findParentOfLane;
  let toggleLaneVisibility;

  let customListsData = [
    { id: 1, name: "list 1", entries: [] },
  ];

  let laneData = {
    id: 1,
    display_name: "lane",
    visible: true,
    count: 5,
    sublanes: [{
      id: 2,
      display_name: "sublane",
      visible: true,
      count: 3,
      sublanes: [],
      custom_list_ids: [1],
      inherit_parent_restrictions: false
    }],
    custom_list_ids: [1],
    inherit_parent_restrictions: true
  };

  beforeEach(() => {
    editLane = stub().returns(new Promise<void>(resolve => resolve()));
    deleteLane = stub().returns(new Promise<void>(resolve => resolve()));
    hideLane = stub().returns(new Promise<void>(resolve => resolve()));
    findParentOfLane = stub().returns(laneData);
    toggleLaneVisibility = stub();
    wrapper = shallow(
      <LaneEditor
        library="library"
        lane={laneData}
        customLists={customListsData}
        editLane={editLane}
        deleteLane={deleteLane}
        findParentOfLane={findParentOfLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );
  });

  it("shows lane name", () => {
    let name = wrapper.find(TextWithEditMode);
    expect(name.length).to.equal(1);
    expect(name.props().text).to.equal("lane");
    expect(name.props().placeholder).to.equal("name");
  });

  it("shows lane id", () => {
    let laneId = wrapper.find(".lane-editor-header h4");
    expect(laneId.length).to.be.at.least(1);
    expect(laneId.at(0).text()).to.contain("1");
  });

  it("shows visibility status", () => {
    let h3 = wrapper.find(".lane-details h3");
    expect(h3.length).to.equal(1);
    expect(h3.text()).to.contain("visible");
    expect(h3.text()).not.to.contain("hidden");

    let hiddenLane = Object.assign({}, laneData, { visible: false });
    wrapper.setProps({ lane: hiddenLane });
    h3 = wrapper.find(".lane-details h3");
    expect(h3.length).to.equal(1);
    expect(h3.text()).not.to.contain("visible");
    expect(h3.text()).to.contain("hidden");

    wrapper.setProps({ findParentOfLane: stub().returns(hiddenLane) });
    h3 = wrapper.find(".lane-editor-header h3");
    expect(h3.length).to.equal(1);
    expect(h3.text()).not.to.contain("visible");
    expect(h3.text()).to.contain("hidden");
    expect(h3.text()).to.contain("parent");
  });

  it("shows parent of new lane", () => {
    wrapper.setProps({ lane: null, findParentOfLane: stub().returns(null) });
    let parentInfo = wrapper.find(".lane-details h3");
    expect(parentInfo.length).to.equal(1);
    expect(parentInfo.text()).to.contain("top-level lane");

    wrapper.setProps({ findParentOfLane: stub().returns(laneData) });
    parentInfo = wrapper.find(".lane-details h3");
    expect(parentInfo.length).to.equal(1);
    expect(parentInfo.text()).to.contain("sublane of lane");
  });

  it("doesn't show the inherit parent restrictions setting on a new lane", () => {
    wrapper.setProps({ findParentOfLane: stub().returns(null) });
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(0);
  });

  it("shows and changes inherit parent restrictions setting on a child lane", () => {
    wrapper = mount(
      <LaneEditor
        library="library"
        lane={laneData}
        findParentOfLane={findParentOfLane}
        customLists={customListsData}
        editLane={editLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );

    let input = wrapper.find(EditableInput);
    expect(input.props().checked).to.be.true;
    expect(input.props().label).to.contain("restrictions");

    let onChange = input.props().onChange;
    onChange();
    input = wrapper.find(EditableInput);
    expect(input.props().checked).to.be.false;
  });

  it("shows custom lists editor", () => {
    let listsEditor = wrapper.find(LaneCustomListsEditor);
    expect(listsEditor.length).to.equal(1);
    expect(listsEditor.props().allCustomLists).to.deep.equal(customListsData);
    expect(listsEditor.props().customListIds).to.deep.equal([1]);
  });

  it("deletes lane", () => {
    wrapper = mount(
      <LaneEditor
        library="library"
        lane={laneData}
        findParentOfLane={findParentOfLane}
        customLists={customListsData}
        editLane={editLane}
        deleteLane={deleteLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );
    let deleteButton = wrapper.find(Button).at(1);
    expect(deleteButton.hasClass("delete-lane")).to.be.true;
    deleteButton.simulate("click");

    expect(deleteLane.callCount).to.equal(1);
    expect(deleteLane.args[0][0]).to.deep.equal(laneData);

    // The delete button doesn't show for a new lane.
    wrapper.setProps({ lane: null });
    deleteButton = wrapper.find(".delete-lane");
    expect(deleteButton.length).to.equal(0);
  });

  it("shows lane", () => {
    wrapper = mount(
      <LaneEditor
        library="library"
        lane={laneData}
        customLists={customListsData}
        editLane={editLane}
        deleteLane={deleteLane}
        findParentOfLane={findParentOfLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );
    let toggle = stub().returns(() => wrapper.setProps({lane: {...laneData, ...{visible: !laneData.visible}}}));
    wrapper.setProps({ toggleLaneVisibility: toggle });

    let showButton = wrapper.find(Button).at(2);
    expect(showButton.hasClass("show-lane")).to.be.false;

    let hiddenLane = Object.assign({}, laneData, { visible: false });
    wrapper.setProps({ lane: hiddenLane });
    showButton = wrapper.find(Button).at(2);
    expect(showButton.hasClass("show-lane")).to.be.true;

    showButton.simulate("click");

    expect(toggle.callCount).to.equal(1);
    expect(toggle.args[0][0]).to.deep.equal(hiddenLane);

    let hiddenParent = Object.assign({}, hiddenLane, { id : 5, display_name: "parent" });
    wrapper.setProps({ findParentOfLane: stub().returns(hiddenParent) });
    showButton = wrapper.find(".show-lane");
    expect(showButton.length).to.equal(0);
  });

  it("hides lane", () => {
    wrapper = mount(
      <LaneEditor
        library="library"
        lane={laneData}
        customLists={customListsData}
        editLane={editLane}
        deleteLane={deleteLane}
        findParentOfLane={findParentOfLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );
    let toggle = stub().returns(() => wrapper.setProps({lane: {...laneData, ...{visible: !laneData.visible}}}));
    wrapper.setProps({ toggleLaneVisibility: toggle });

    let hideButton = wrapper.find(Button).at(2);
    expect(hideButton.hasClass("hide-lane")).to.be.true;

    hideButton.simulate("click");
    expect(toggle.callCount).to.equal(1);
    expect(toggle.args[0][0]).to.deep.equal(laneData);

    let hiddenLane = Object.assign({}, laneData, { visible: false });
    wrapper.setProps({ findParentOfLane: stub().returns(hiddenLane) });
    hideButton = wrapper.find(".hide-lane");
    expect(hideButton.length).to.equal(0);
  });

  it("saves lane", () => {
    wrapper = mount(
      <LaneEditor
        library="library"
        lane={laneData}
        findParentOfLane={findParentOfLane}
        customLists={customListsData}
        editLane={editLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );
    let getTextStub = stub(TextWithEditMode.prototype, "getText").returns("new lane name");
    let getCustomListIdsStub = stub(LaneCustomListsEditor.prototype, "getCustomListIds").returns([1, 2]);
    (wrapper.instance() as LaneEditor).changeInheritParentRestrictions();

    let saveButton = wrapper.find(".save-lane");
    saveButton.simulate("click");

    expect(editLane.callCount).to.equal(1);
    let formData = editLane.args[0][0];
    expect(formData.get("id")).to.equal("1");
    expect(formData.get("parent_id")).to.equal("1");
    expect(formData.get("display_name")).to.equal("new lane name");
    expect(formData.get("custom_list_ids")).to.equal(JSON.stringify([1, 2]));
    expect(formData.get("inherit_parent_restrictions")).to.equal("false");

    getTextStub.restore();
    getCustomListIdsStub.restore();
  });

  it("navigates to edit page after a new lane is created", async () => {
    // Set window.location.href to be writable, jsdom doesn't normally allow changing it but browsers do.
    // Start on the create page.
    Object.defineProperty(window.location, "href", { writable: true, value: "/admin/web/lanes/library/create" });

    wrapper = mount(
      <LaneEditor
        library="library"
        customLists={customListsData}
        editLane={editLane}
        findParentOfLane={findParentOfLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );
    let getTextStub = stub(TextWithEditMode.prototype, "getText").returns("new lane name");
    let getCustomListIdsStub = stub(LaneCustomListsEditor.prototype, "getCustomListIds").returns([1, 2]);

    let saveButton = wrapper.find(".save-lane");
    saveButton.simulate("click");
    expect(editLane.callCount).to.equal(1);
    getTextStub.restore();
    getCustomListIdsStub.restore();

    wrapper.setProps({ responseBody: 5 });
    // Let the call stack clear so the callback after editLane will run.
    const pause = (): Promise<void> => {
        return new Promise<void>(resolve => setTimeout(resolve, 0));
    };
    await pause();
    expect(window.location.href).to.contain("edit");
    expect(window.location.href).to.contain("5");
  });

  it("cancels changes", () => {
    let nameResetStub = stub(TextWithEditMode.prototype, "reset");
    let customListsResetStub = stub(LaneCustomListsEditor.prototype, "reset");

    wrapper = mount(
      <LaneEditor
        library="library"
        lane={laneData}
        customLists={customListsData}
        editLane={editLane}
        findParentOfLane={findParentOfLane}
        toggleLaneVisibility={toggleLaneVisibility}
      />
    );

    // the cancel button isn't shown when there are no changes.
    let cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    (wrapper.instance() as LaneEditor).changeName("new name");
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");

    expect(nameResetStub.callCount).to.equal(1);
    expect(customListsResetStub.callCount).to.equal(1);

    (wrapper.instance() as LaneEditor).changeName(laneData.display_name);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    (wrapper.instance() as LaneEditor).changeCustomLists([1, 2]);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");

    expect(nameResetStub.callCount).to.equal(2);
    expect(customListsResetStub.callCount).to.equal(2);

    (wrapper.instance() as LaneEditor).changeCustomLists(laneData.custom_list_ids);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    (wrapper.instance() as LaneEditor).changeInheritParentRestrictions();
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(1);
    cancelButton.simulate("click");

    expect(nameResetStub.callCount).to.equal(3);
    expect(customListsResetStub.callCount).to.equal(3);
    cancelButton = wrapper.find(".cancel-changes");
    expect(cancelButton.length).to.equal(0);

    nameResetStub.restore();
    customListsResetStub.restore();
  });
});
