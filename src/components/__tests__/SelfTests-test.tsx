import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { SelfTests } from "../SelfTests";
import {
  CheckSoloIcon,
  XIcon,
} from "@nypl/dgx-svg-icons";

const collections = [
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
    self_test_results: {
      duration: 1.75,
      start: "2018-08-07T19:34:54Z",
      end: "2018-08-07T19:34:55Z",
      results: [
        {
          duration: 0.000119,
          end: "2018-08-07T19:34:54Z",
          exception: null,
          name: "Initial setup.",
          result: null,
          start: "2018-08-07T19:34:54Z",
          success: true
        },
      ]
    }
  },
  {
    id: 1,
    name: "collection 1",
    protocol: "protocol",
    libraries: [{ short_name: "library" }],
    settings: {
      external_account_id: "nypl",
    },
    self_test_results: {
      duration: 1.75,
      start: "2018-08-07T19:34:54Z",
      end: "2018-08-07T19:34:55Z",
      results: [
        {
          duration: 0.000119,
          end: "2018-08-07T19:34:54Z",
          exception: null,
          name: "Initial setup.",
          result: null,
          start: "2018-08-07T19:34:54Z",
          success: true
        },
        {
          duration: 0,
          end: "2018-08-07T19:34:55Z",
          exception: {
            class: "IntegrationException",
            debug_message: "Add the collection to a library that has a patron authentication service.",
            message: "Collection is not associated with any libraries."
          },
          name: "Acquiring test patron credentials.",
          result: null,
          start: "2018-08-07T19:34:55Z",
          success: false
        }
      ]
    }
  },
];

describe("SelfTests", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <SelfTests
        item={collections[0]}
      />
    );
  });

  it("should not render the SelfTests component", () => {
    wrapper = shallow(
      <SelfTests item={{} as any} />
    );
    expect(wrapper.hasClass("collection-selftests")).to.equal(false);
  });

  it("should render the SelfTests component", () => {
    expect(wrapper.hasClass("collection-selftests")).to.equal(true);
  });

  describe("Successful self tests", () => {
    it("should display information about the whole self test result", () => {
      const passSVGIcon = wrapper.find(CheckSoloIcon);
      const failSVGIcon = wrapper.find(XIcon);
      const description = wrapper.find(".description");

      // There's only on self test result in the collection and it passes.
      expect(failSVGIcon.length).to.equal(0);
      expect(passSVGIcon.length).to.equal(1);

      expect(description.text()).to.equal("Tests last ran on Tue Aug 07 2018 15:34:54 and lasted 1.75s.");
    });

    it("should display detail information for each self test result for the collection", () => {
      const list = wrapper.find("ul");
      const selfTestResults = list.find("li");

      expect(selfTestResults.length).to.equal(1);
      expect(selfTestResults.hasClass("success")).to.equal(true);
      expect(selfTestResults.find("h4").text()).to.equal("Initial setup.");
      expect(selfTestResults.find("p").text()).to.equal("success: true");
    });
  });

  describe("Unsuccessful self tests", () => {
    beforeEach(() => {
      wrapper = shallow(
        <SelfTests
          item={collections[1]}
        />
      );
    });

    it("should display information about the whole self test result", () => {
      const passSVGIcon = wrapper.find(CheckSoloIcon);
      const failSVGIcon = wrapper.find(XIcon);
      const description = wrapper.find(".description");

      // There are two self tests but one of them failed.
      expect(failSVGIcon.length).to.equal(1);
      expect(passSVGIcon.length).to.equal(0);

      expect(description.text()).to.equal("Tests last ran on Tue Aug 07 2018 15:34:54 and lasted 1.75s.");
    });

    it("should display detail information for each self test result for the collection", () => {
      const list = wrapper.find("ul");
      const selfTestResults = list.find("li");

      expect(selfTestResults.length).to.equal(2);

      expect(list.childAt(0).hasClass("success")).to.equal(true);
      expect(list.childAt(0).find("h4").text()).to.equal("Initial setup.");
      expect(list.childAt(0).find(".success-description").text()).to.equal("success: true");
      expect(list.childAt(0).find(".exception-description").length).to.equal(0);

      expect(list.childAt(1).hasClass("failure")).to.equal(true);
      expect(list.childAt(1).find("h4").text()).to.equal("Acquiring test patron credentials.");
      expect(list.childAt(1).find(".success-description").text()).to.equal("success: false");
      expect(list.childAt(1).find(".exception-description").text()).to.equal("exception: Collection is not associated with any libraries.");
    });
  });

  describe("Get new results", async () => {
    let runSelfTests;

    beforeEach(() => {
      runSelfTests = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = shallow(
        <SelfTests
          item={collections[0]}
          runSelfTests={runSelfTests}
        />
      );
    });

    it("should run new self tests", () => {
      const runSelfTestsBtn = wrapper.find(".runSelfTests");

      expect(runSelfTests.callCount).to.equal(0);

      runSelfTestsBtn.simulate("click");

      expect(runSelfTests.callCount).to.equal(1);
    });
  });
});
