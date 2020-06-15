import * as React from "react";
import { SettingData } from "../interfaces";
import AnnouncementForm from "./AnnouncementForm";
import Announcement from "./Announcement";

export interface AnnouncementsSectionProps {
  setting: SettingData;
  value?: Array<any>;
}
export interface AnnouncementData {
  id?: number;
  content: string;
  start: string;
  finish: string;
}
export interface AnnouncementsSectionState {
  currentAnnouncements: Array<AnnouncementData>;
  editing?: any;
}

export default class AnnouncementsSection extends React.Component<AnnouncementsSectionProps, AnnouncementsSectionState> {
  constructor(props) {
    super(props);
    this.addAnnouncement = this.addAnnouncement.bind(this);
    this.deleteAnnouncement = this.deleteAnnouncement.bind(this);
    this.editAnnouncement = this.editAnnouncement.bind(this);
    this.getValue = this.getValue.bind(this);
    this.state = { currentAnnouncements: Array.isArray(this.props.value) ? this.props.value : [] };
  }
  addAnnouncement(announcement) {
    let announcements = this.state.currentAnnouncements;
    this.setState({ currentAnnouncements: announcements.concat(announcement) });
  }
  deleteAnnouncement(id: number) {
    if (window.confirm("This will remove this announcement from your list. Are you sure you want to continue?")) {
      this.setState({ currentAnnouncements: this.state.currentAnnouncements.filter(a => a.id !== id), editing: null});
    }
  }
  async editAnnouncement(id: number) {
    await this.setState({ editing: this.state.currentAnnouncements.find(a => a.id === id), currentAnnouncements: this.state.currentAnnouncements.filter(a => a.id !== id) });
  }
  renderAnnouncement(a) {
    return (
      <Announcement
        key={a.content}
        content={a.content}
        start={a.start}
        finish={a.finish}
        id={a.id}
        delete={this.deleteAnnouncement}
        edit={this.editAnnouncement}
      />
    );
  }
  renderList() {
    return (
      <ul className="announcements-ul">
        {
          Array.isArray(this.state.currentAnnouncements) && this.state.currentAnnouncements.map(a =>
              <li key={a.content}>
                {this.renderAnnouncement(a)}
              </li>
          )
        }
      </ul>
    );
  }
  render() {
    return (
      <div className="announcements-section">
        { this.state.currentAnnouncements.length > 0 && this.renderList() }
        { this.state.currentAnnouncements.length < 3 && <AnnouncementForm add={this.addAnnouncement} content={this.state.editing?.content} start={this.state.editing?.start} finish={this.state.editing?.finish} /> }
      </div>
    );
  }
  getValue() {
    return this.state.currentAnnouncements;
  }
}
