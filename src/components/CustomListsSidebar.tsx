import * as React from "react";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import { Button } from "library-simplified-reusable-components";
import { CustomListData, LibraryData } from "../interfaces";
import EditableInput from "./EditableInput";
import { Link } from "react-router";

export interface CustomListsSidebarProps {
  lists: CustomListData[];
  library: string;
  identifier?: string;
  isLibraryManager: boolean;
  deleteCustomList: (list: CustomListData) => Promise<void>;
  changeSort: () => void;
  sortOrder: string;
}


export default class CustomListsSidebar extends React.Component<CustomListsSidebarProps, void> {
  render(): JSX.Element {
    return(
      <div className="custom-lists-sidebar">
        <h2>List Manager</h2>
        <Link
          className="btn btn-default create-button"
          to={"/admin/web/lists/" + this.props.library + "/create"}>
            Create New List
        </Link>

        {
          this.props.lists && this.props.lists.length > 0 &&
          <div>
            {this.renderSortButtons()}
            <ul>
              {this.props.lists.map(list => this.renderListInfo(list))}
            </ul>
          </div>
        }
      </div>
    );
  }

  renderSortButtons(): JSX.Element {
    let sortOrders = [["A-Z", "asc"], ["Z-A", "desc"]];
    return(
      <fieldset>
        <legend className="visuallyHidden">Select list sort type</legend>
        {
          sortOrders.map((order) => {
            let isChecked = this.props.sortOrder === order[1];
            return (<EditableInput
              key={order[1]}
              type="radio"
              label={`Sort ${order[0]}`}
              name="sort"
              onChange={this.props.changeSort}
              checked={isChecked}
              disabled={false}
            />);
          })
        }
      </fieldset>
    );
  }

  renderListInfo(list: CustomListData): JSX.Element {
    let isActive = this.props.identifier && this.props.identifier.toString() === list.id.toString();
    return (
      <li key={list.id} className={isActive ? "active" : "" }>
        <div className="custom-list-info">
          <p>{ list.name }</p>
          <p>Books in list: { list.entry_count }</p>
          <p>ID-{ list.id }</p>
        </div>
        <div className = "custom-list-buttons">
          {
            isActive ?
              <Button disabled={true} content="Editing" /> :
              <Link
                to={"/admin/web/lists/" + this.props.library + "/edit/" + list.id}
                className="btn btn-default"
              >
                <span>Edit<PencilIcon /></span>
              </ Link>
          }
          {
            this.props.isLibraryManager &&
              <Button
                callback={() => this.props.deleteCustomList(list)}
                content={<span>Delete<TrashIcon /></span>}
              />
          }
        </div>
      </li>
    );
  }
}
