import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

class MainLayout extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if(this.props.loading) {
      return (<p>Loading...</p>);
    } else {
      console.log("currentUser:" + JSON.stringify(this.props.currentUser, null, 4));
      console.log("users:" + JSON.stringify(this.props.users));
      return (
        <div id="main-layout-wrapper" className="full-height">
          <div id="cover-image-wrapper">
            <div id="cover-image-front" className="cover-image"></div>
            <div id="cover-image-back" className="cover-image"></div>
          </div>
          <div id="main-layout-content" className="full-height">

            <div id="top-banner">
              {this.renderUserButtons()}
            </div>

            <div id="main-content">
              {this.props.main()}
            </div>
          </div>
        </div>
      );
    }
  }

  renderUserButtons() {
    if(this.props.currentUser) {
      return (
        <div className="ui dropdown item">
          <img className="ui avatar image" src={this.props.currentUser.profileImage}/>
          <span style={{color:'white', fontWeight:'bold'}}>{this.props.currentUser.username}</span>
          <div className="menu">
            <div className="item" onClick={() => {Meteor.logout()}}>Logout</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="ui item">
          <div className="ui buttons">
            <button className="ui button" onClick={()=>{FlowRouter.go('/login');}}>Login</button>
            <div className="or"></div>
            <button className="ui positive button" onClick={()=>{FlowRouter.go('/join');}}>Sign-up</button>
          </div>
        </div>
      );
    }
  }
}

export default createContainer(() => {
  var userDataHandle = Meteor.subscribe('userData');
  return {
    loading: !(userDataHandle.ready()),
    currentUser: Meteor.user(),
    users: Meteor.users.find().fetch()
  };
}, MainLayout);
