import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

class MainLayout extends Component {
  constructor(props) {
    super(props);
  }

  render() {
      return (
        <div id="main-layout-wrapper" className="full-height">
          <div id="cover-image-wrapper">
            <div id="cover-image-front" className="cover-image"></div>
            <div id="cover-image-back" className="cover-image"></div>
          </div>
          <div id="main-layout-content" className="full-height">
            <a href="/" style={{position:'fixed', zIndex:'999', top:'5px', left: '5px'}}><img src="/images/logo.png" style={{width:'30px'}}></img></a>
            <div id="top-banner">

              {this.renderUserButtons()}
            </div>

            <div id="main-content" className={this.props.loading?"ui loading segment":"ui segment"}>
              {!this.props.loading?this.props.main():''}
            </div>
          </div>
        </div>
      );
  }

  renderUserButtons() {
    if(this.props.currentUser) {
      return (
        <div className="ui right pointing dropdown item">
          <img className="ui avatar image" src={this.props.currentUser.profileImage}/>
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
