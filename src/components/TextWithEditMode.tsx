import * as React from "react";
import EditableInput from "./EditableInput";

export interface TextWithEditModeProps extends React.Props<TextWithEditMode> {
  text?: string;
  placeholder: string;
}

export interface TextWithEditModeState {
  editMode: boolean;
  text: string | null;
}

export default class TextWithEditMode extends React.Component<TextWithEditModeProps, TextWithEditModeState> {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text,
      editMode: !this.props.text
    };

    this.updateText = this.updateText.bind(this);
    this.startEditMode = this.startEditMode.bind(this);
    this.reset = this.reset.bind(this);
  }

  render(): JSX.Element {
    return (
      <div>
        { this.state.editMode &&
          <h3>
            <EditableInput
              type="text"
              placeholder={this.props.placeholder}
              value={this.state.text}
              ref="text"
              />
            <a
              href="#"
              onClick={this.updateText}
              >Save {this.props.placeholder}</a>
          </h3>
        }
        { !this.state.editMode &&
          <h3>
            { this.state.text }
            <a
              href="#"
              onClick={this.startEditMode}
              >Edit {this.props.placeholder}</a>
          </h3>
        }
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.text && nextProps.text !== this.props.text) {
      this.setState({ text: nextProps.text, editMode: !nextProps.text });
    }
  }

  updateText() {
    const text = (this.refs["text"] as EditableInput).getValue();
    this.setState({ text, editMode: false });
  }

  startEditMode() {
    this.setState({ text: this.state.text, editMode: true });
  }

  getText() {
    if (this.state.editMode) {
      let value = (this.refs["text"] as EditableInput).getValue();
      this.updateText();
      return value;
    } else {
      return this.state.text;
    }
  }

  reset() {
    this.setState({ text: this.props.text, editMode: !this.props.text });
  }
}