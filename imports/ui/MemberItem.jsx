import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { Members } from '../api/members';

export default class MemberItem extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.member-item-dropdown').dropdown({action:'nothing'});
  }

  componentDidUpdate() {
    $('.member-item-dropdown').dropdown('refresh');
  }

  render() {
    if(this.props.member.role == 'owner') {
      return (
        <div className="ui icon right pointing member-item-dropdown dropdown mini basic button">
          <img className="ui avatar image" src={Members.helpers.getUserProfileImage(this.props.member)} style={{width:'1em', height:'1em'}}/>
          <div className="menu">
            <div className="header" style={{fontSize:'12px'}}>@{this.props.member.username} <span style={{color:'lightgray'}}>({this.props.member.role.toUpperCase()})</span></div>
            <div className="divider"></div>
            <div className="item">Change owner</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="ui icon right pointing member-item-dropdown dropdown mini basic button">
          <img className="ui avatar image" src={Members.helpers.getUserProfileImage(this.props.member)}  style={{width:'1em', height:'1em'}}/>
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
