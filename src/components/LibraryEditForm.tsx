import * as React from "react";
import EditableInput from "./EditableInput";
import ProtocolFormField from "./ProtocolFormField";
import { handleSubmit, findDefault, clearForm } from "./sharedFunctions";
import { LibrariesData, LibraryData } from "../interfaces";
import { Panel, Button } from "library-simplified-reusable-components";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface LibraryEditFormProps {
  data: LibrariesData;
  item?: LibraryData;
  additionalData?: any;
  disabled: boolean;
  save: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
  error?: FetchErrorData;
}

/** Form for editing a library's configuration, on the libraries tab of the
    system configuration page. */
export default class LibraryEditForm extends React.Component<LibraryEditFormProps, void> {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.responseBody && !nextProps.fetchError) {
      clearForm(this.refs);
    }
  }

  render(): JSX.Element {
    let basicInfo = [];
    let otherFields = [];

    if (this.props.data && this.props.data.settings) {
      basicInfo = this.props.data.settings.filter(setting => (setting.required || setting.category === "Basic Information"));
      otherFields = this.props.data.settings.filter(setting => !(new Set(basicInfo).has(setting)));
    }

    let categories = this.separateCategories(otherFields);

    return (
      <form ref="form" onSubmit={this.submit} className="edit-form">
        <input
          type="hidden"
          name="uuid"
          value={this.props.item && this.props.item.uuid}
          />
        <Panel
          headerText="Basic Information"
          openByDefault={true}
          content={
            <fieldset>
              <legend className="visuallyHidden">Basic Information</legend>
              <EditableInput
                elementType="input"
                type="text"
                disabled={this.props.disabled}
                required={true}
                name="name"
                ref="name"
                label="Name"
                value={this.props.item && this.props.item.name}
                description="The human-readable name of this library."
                error={this.props.error}
                />
              <EditableInput
                elementType="input"
                type="text"
                disabled={this.props.disabled}
                required={true}
                name="short_name"
                ref="short_name"
                label="Short name"
                value={this.props.item && this.props.item.short_name}
                description="A short name of this library, to use when identifying it in scripts or URLs, e.g. 'NYPL'."
                error={this.props.error}
                />
              { basicInfo.map(setting =>
                <ProtocolFormField
                  key={setting.key}
                  ref={setting.key}
                  setting={setting}
                  disabled={this.props.disabled}
                  value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
                  default={findDefault(setting)}
                  error={this.props.error}
                  />
                )
              }
            </fieldset>
          }
        />

        { this.renderForms(categories) }

        <Button
          disabled={this.props.disabled}
          callback={this.submit}
        />
      </form>
    );
  }

  separateCategories(nonRequiredFields) {
    let categories = {};
    nonRequiredFields.forEach((setting) => {
      categories[setting.category] = categories[setting.category] ? categories[setting.category].concat(setting) : [setting];
    });
    return categories;
  }

  renderForms(categories) {
    let forms = [];
    let categoryNames = Object.keys(categories);
    categoryNames.forEach((name) => {
      let form = (
        <Panel
          headerText={`${name} (Optional)`}
          content={this.renderFieldset(categories[name])}
        />
      );
      forms.push(form);
    });
    return forms;
  }

  renderFieldset(fields) {
    return (
      <fieldset>
        <legend className="visuallyHidden">Additional Fields</legend>
        { fields.map(setting =>
          <ProtocolFormField
            key={setting.key}
            ref={setting.key}
            setting={setting}
            additionalData={this.props.additionalData}
            disabled={this.props.disabled}
            value={this.props.item && this.props.item.settings && this.props.item.settings[setting.key]}
            default={findDefault(setting)}
            error={this.props.error}
            />
          )
        }
      </fieldset>
    );
  }

  submit(event) {
    event.preventDefault();
    handleSubmit(this);
  }

}
