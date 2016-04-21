import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Favourites } from '../api/favourites';

import FavouriteItem from './FavouriteItem';

class LeftSidebar extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="left-sidebar-wrapper" style={{width:this.props.open?'220px':'0px'}}>
        <div id="sidebar-logo-wrapper">
          <img id="sidebar-logo" src="/images/logo-white.png" style={{display: this.props.open?'inline':'none'}} onClick={this.props.onLogoClicked.bind(this)}/>
        </div>
        <div className="sidebar-content" style={{display: this.props.open?'inline':'none'}}>
          <ul className="sidebar-nav">
            <a href="/"><li className={FlowRouter.current().path == "/"?"active":""}><i className="home icon"></i>Home</li></a>
            <a href="/users"><li className=""><i className="users icon"></i>Users</li></a>
            <a href="/profile"><li className=""><i className="user icon"></i>Profile</li></a>
          </ul>
          <div className="left-sidebar-header">Favourite Cards</div>
          <ul className="sidebar-nav">
            {this.renderFavourites()}
          </ul>
            {this.renderAddFavouriteLink()}
        </div>
      </div>
    );
  }

  renderFavourites() {
    return this.props.favourites.map((favourite) => {
      return <FavouriteItem key={favourite._id} favourite={favourite} cardId={this.props.cardId}/>
    });
  }

  renderAddFavouriteLink() {
    if(this.props.cardId && _.findWhere(this.props.favourites, {cardId:this.props.cardId}) == null) {
      return (
        <a onClick={this.handleAddFavourite.bind(this)} href="" style={{marginLeft:'20px', fontSize:'12px'}}><i className="plus icon"></i> Add Favourite</a>
      );
    }
  }

  handleAddFavourite() {
    Meteor.call('favourites.insert', this.props.cardId, function(err) {
      if(err) {
        alert("Error adding favourite: " + err.reason);
      }
    });
  }
}

export default createContainer(() => {
  console.log("PATH:" + FlowRouter.current().path);
  var cardId = FlowRouter.getParam('cardId');
  var favouritesHandle = Meteor.subscribe('favourites');
  return {
    loading: !(favouritesHandle.ready()),
    favourites: Favourites.find().fetch(),
    cardId
  };
}, LeftSidebar);
