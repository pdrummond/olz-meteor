import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { Members } from '../api/members';

export default class MemberItem extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.ui.dropdown').dropdown();
    //setTimeout(() => {$('#member-dropdown').dropdown({action:'nothing'});}, 10);
  }

  render() {
    if(this.props.member.role == 'owner') {
      return (
        <div id="member-dropdown" className="ui icon right pointing dropdown mini basic button">
          <img className="ui avatar image" src={Members.helpers.getUserProfileImage(this.props.member)}/>
          <div className="menu">
            <div className="header" style={{fontSize:'12px'}}>@{this.props.member.username} <span style={{color:'lightgray'}}>({this.props.member.role.toUpperCase()})</span></div>
            <div className="divider"></div>
            <div className="item">Change owner</div>
          </div>
        </div>
      );
    } else {
      return (
        <div id="member-dropdown" className="ui icon right pointing dropdown mini basic button">
          <img className="ui avatar image" src={Members.helpers.getUserProfileImage(this.props.member)}/>
          <div className="menu">
            <div className="header" style={{fontSize:'12px'}}>@{this.props.member.username} <span style={{color:'lightgray'}}>({this.props.member.role.toUpperCase()})</span></div>
            <div className="divider"></div>
            <div className="item" onClick={this.handleUserRoleClicked.bind(this)}>Change role to USER</div>
            <div className="item" onClick={this.handleAdminRoleClicked.bind(this)}>Change role to ADMIN</div>
            <div className="divider"></div>
            <div className="item" onClick={this.handleRemoveClicked.bind(this)}>Remove</div>
          </div>
        </div>
      );
    }
  }

  handleRemoveClicked() {
    Meteor.call('members.remove', this.props.member._id);
  }

  handleUserRoleClicked() {
    Meteor.call('members.updateRole', this.props.member._id, 'user');
  }

  handleAdminRoleClicked() {
    Meteor.call('members.updateRole', this.props.member._id, 'admin');
  }
}
