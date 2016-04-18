import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Cards } from '../api/cards';

import FeedItem from './FeedItem';

class FeedPage extends Component {

  constructor(props) {
    super(props);
  }

  renderCards() {
    if(this.props.cards.length > 0) {
      return this.props.cards.map((card) => (
        <FeedItem users={this.props.users} key={card._id} card={card}/>
      ));
    } else {
      if(Meteor.userId()) {
        return (
          <h2 className="ui center aligned icon disabled header" style={{marginTop:'20px'}}>
            <i className="circular comments outline icon"></i>
            No Cards Found.
          </h2>
        );
      } else {
        return (
          <h2 className="ui center aligned icon disabled header" style={{marginTop:'20px'}}>
            <i className="circular comments outline icon"></i>
            All your cards will appear here when you sign in.
          </h2>
        );
      }
    }
  }

  componentDidUpdate() {
    $('.ui.dropdown').dropdown('refresh');
  }

  render() {
      return (
        <div id="feed-page-wrapper" className="container">
          {/*<LeftSidebar homeSection={this.props.homeSection} groupFilterId={this.props.groupFilterId} groups={this.props.groups}/>*/}
          <div>
            <div className="ui secondary menu">
              <div className="header item">
                <h1 style={{color:'#f0ad4e'}}><i className="home icon"></i></h1>
              </div>
              <div className="item" style={{flexGrow:1}}>
                <div className="ui icon input">
                  <input type="text" placeholder="Search..."/>
                  <i className="search icon"></i>
                </div>
              </div>
              <div className="right menu">
                <div className="ui dropdown item">
                  All Users <i className="dropdown icon"></i>
                <div className="menu">
                  <a className="item">@pdrummond</a>
                  <a className="item">@harold</a>
                  <div className="divider"></div>
                  <a className="item">All Users</a>
                </div>
              </div>
              <div className="ui dropdown item">
                All Types <i className="dropdown icon"></i>
              <div className="menu">
                <a className="item">Projects</a>
                <a className="item">Tasks</a>
                <a className="item">Comments</a>
                <div className="divider"></div>
                <a className="item">All Types</a>
              </div>
            </div>
                <div className="item">
                  <a href="/cards/create" className="ui teal button"><i className="plus icon"></i> Create</a>
                </div>
              </div>
            </div>
          </div>
          {this.renderSignUpMessage()}
          <div className={this.props.loading?"feed-page ui vertical loading segment":"feed-page vertical segment"}>
              {!this.props.loading?this.renderCards():''}
          </div>
        </div>
      );
  }

  renderSignUpMessage() {
    if(!Meteor.userId()) {
      return (
        <div className="ui icon info message">
          <i className="sign in icon"></i>
          <div className="content">
            <div className="header">
              Welcome to OpenLoops
            </div>
            <p>Want to join in?</p>
            <div className="ui buttons">
              <a href="/join" className="ui positive button">Sign-up for FREE!</a>
              <div className="or"></div>
              <a href="/login" className="ui button">Login if you already have an account</a>
            </div>

          </div>
        </div>
      );
    }
  }

  renderHeader() {
    switch(this.props.homeSection) {
      case 'inbox': return (<h1><i className="inbox icon"></i> Inbox</h1>);
      case 'open': return (<h1><i className="comments outline icon"></i> Open</h1>);
      case 'closed': return (<h1><i className="check circle outline icon"></i> Closed </h1>);
      case 'drafts': return (<h1><i className="edit icon"></i> Drafts</h1>);
      case 'group': {
        var group = Groups.findOne(this.props.groupFilterId);
        if(group.type == 'group') {
          return (<h1><i className="ui block layout icon"></i> {group.domain} / {group.name} </h1>);
        } else {
          return (<h1><i className="ui user icon"></i> {group.domain}</h1>);
        }
      }
    }
  }
}

FeedPage.propTypes = {
  cards: PropTypes.array.isRequired
};

export default createContainer((props) => {
  var cardsHandle = Meteor.subscribe('cards');
  var data = {
    loading: !(cardsHandle.ready()),
    currentUser: Meteor.user()
  };
  let selector = {};
  data.cards = Cards.find(selector, { sort: { updatedAt: -1 } }).fetch();
  return data;
}, FeedPage);
