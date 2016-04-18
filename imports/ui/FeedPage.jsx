import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Cards } from '../api/cards';
import { Hashtags } from '../api/hashtags';

import FeedItem from './FeedItem';

class FeedPage extends Component {

  constructor(props) {
    super(props);
  }

  renderCards() {
    if(this.props.cards.length > 0) {
      return this.props.cards.map((card) => (
        <FeedItem hashtags={this.props.hashtags} users={this.props.users} key={card._id} card={card}/>
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
                  <input type="text" onKeyDown={this.handleSearchKeyDown.bind(this)} placeholder="Search..."/>
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

  handleSearchKeyDown(e) {
    e.persist();
    if(this.searchInputKeyTimer) {
      clearTimeout(this.searchInputKeyTimer);
    }
    this.searchInputKeyTimer = setTimeout(function() {
      Session.set('query', this.getFilterQuery(e.target.value));
    }.bind(this), 500);
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

  getFilterQuery(filterString) {
    console.log("> getFilterQuery");
    let hashtags = [];
    var filter = {};
    var remainingText = filterString;
    //var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
    var re = new RegExp("([\\w\\.@#-]+)\\s*([ :]\\s*([\\w\\.-]+))?", "g");
    var match = re.exec(filterString);
    while (match != null) {
      var field = match[1].trim();
      var value = match.length > 2 && match[2] != null ? match[2].trim() : null;
      console.log("-- field: " + field);
      console.log("-- value: " + value);
      remainingText = remainingText.replace(field, '');
      if(value != null) {
        remainingText = remainingText.replace(value, '');
      }
      remainingText = remainingText.replace(/:/g, '');
      if(field.startsWith('#')) {
        hashtags.push(field.replace('#', ''));
      } else if(field == 'open') {
        field = "isOpen";
      } else if(field == 'closed') {
        field = "isOpen";
        value = (value=="true" ? "false" : "true");
      }

      if(value) {
        if(value == "true") {
          value = true;
        } else if(value == "false") {
          value = false;
        }
        filter[field] = value;
      }
      match = re.exec(filterString);
    }
    if(remainingText && remainingText.length > 0) {
      filter["$or"] = [{title: {$regex:remainingText}}, {content: {$regex:remainingText}}];
    }
    console.log("getFilterQuery: Current client-side item filter is: " + JSON.stringify(filter));
    let result = {
      filter,
      hashtags
    }
    console.log(" -- result:" + JSON.stringify(result, null, 2));
    console.log("< getFilterQuery");
    return result;
  }
}

FeedPage.propTypes = {
  cards: PropTypes.array.isRequired
};

export default createContainer((props) => {
  var query = Session.get('query') || {};
  console.log("QUERY: " + JSON.stringify(query));
  var cardsHandle = Meteor.subscribe('cards', query);
  var hashtagsHandle = Meteor.subscribe('hashtags');
  var data = {
    loading: !(cardsHandle.ready() && hashtagsHandle.ready()),
    currentUser: Meteor.user()
  };
  data.cards = Cards.find({}, { sort: { updatedAt: -1 } }).fetch();
  data.hashtags = Hashtags.find().fetch();
  console.log("hashtags:" + JSON.stringify(data.hashtags));
  return data;
}, FeedPage);
