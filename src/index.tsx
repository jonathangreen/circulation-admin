import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";
import ContextProvider from "./components/ContextProvider";
import { TOSContextProvider } from "./components/TOSContext";
import CatalogPage from "./components/CatalogPage";
import CustomListPage from "./components/CustomListPage";
import LanePage from "./components/LanePage";
import DashboardPage from "./components/DashboardPage";
import ConfigPage from "./components/ConfigPage";
import AccountPage from "./components/AccountPage";
import SetupPage from "./components/SetupPage";
import ManagePatrons from "./components/ManagePatrons";
import TroubleshootingPage from "./components/TroubleshootingPage";

interface ConfigurationSettings {
  /** A token generated by the server to prevent Cross-Site Request Forgery.
      The token should be included in an 'X-CSRF-Token' header in any non-GET
      requests. */
  csrfToken: string;

  /** `showCircEventsDownload` controls whether the dashboard will have an
      option to download a CSV of circulation events. This should be false if
      circulation events are not available for download. */
  showCircEventsDownload: boolean;

  /** `settingUp` will be true if this is a new circulation manager and the
      admin interface has never been used before. The interface will show a page
      for configuring admin authentication. The admin will need to set that up
      and log in before accessing the rest of the interface. */
  settingUp: boolean;

  /** `email` will be the email address of the currently logged in admin. */
  email?: string;

  /** `roles` contains the logged in admin's roles: system admininstrator,
      or library manager or librarian for one or more libraries. */
  roles?: {
    role: string;
    library?: string;
  }[];

  tos_link_text?: string;
  tos_link_href?: string;
}

/** The main admin interface application. Create an instance of this class
    to render the app and set up routing. */
class CirculationAdmin {
  constructor(config: ConfigurationSettings) {
    const div = document.createElement("div");
    div.id = "opds-catalog";
    div.className = "palace";
    document.getElementsByTagName("body")[0].appendChild(div);

    const catalogEditorPath =
      "/admin/web(/collection/:collectionUrl)(/book/:bookUrl)(/tab/:tab)";
    const customListPagePath =
      "/admin/web/lists(/:library)(/:editOrCreate)(/:identifier)";
    const lanePagePath =
      "/admin/web/lanes(/:library)(/:editOrCreate)(/:identifier)";

    const appElement = "opds-catalog";
    const app = config.settingUp ? (
      <ContextProvider {...config}>
        <SetupPage />
      </ContextProvider>
    ) : (
      <ContextProvider {...config}>
        <TOSContextProvider
          value={...[config.tos_link_text, config.tos_link_href]}
        >
          <Router history={browserHistory}>
            <Route path={catalogEditorPath} component={CatalogPage} />
            <Route path={customListPagePath} component={CustomListPage} />
            <Route path={lanePagePath} component={LanePage} />
            <Route
              path="/admin/web/dashboard(/:library)"
              component={DashboardPage}
            />
            <Route
              path="/admin/web/config(/:tab)(/:editOrCreate)(/:identifier)"
              component={ConfigPage}
            />
            <Route path="/admin/web/account" component={AccountPage} />
            <Route
              path="/admin/web/patrons/:library(/:tab)"
              component={ManagePatrons}
            />
            <Route
              path="/admin/web/troubleshooting(/:tab)(/:subtab)"
              component={TroubleshootingPage}
            />
          </Router>
        </TOSContextProvider>
      </ContextProvider>
    );

    // `react-axe` should only run in development and testing mode.
    // Running this is resource intensive and should only be used to test
    // for accessibility and not during active development.
    if (process.env.TEST_AXE === "true") {
      import("react-axe").then((axe) => {
        axe(React, ReactDOM, 1000);
        ReactDOM.render(app, document.getElementById(appElement));
      });
    } else {
      ReactDOM.render(app, document.getElementById(appElement));
    }
  }
}

export = CirculationAdmin;
