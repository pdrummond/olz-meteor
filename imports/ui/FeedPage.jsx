import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Cards } from '../api/cards';
import { Hashtags } from '../api/hashtags';
import { Tabs } from '../api/tabs';
import TabItem from './TabItem';
import MessageItem from './MessageItem';
import SearchUtils from '../utils/SearchUtils';

class FeedPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.feed-page-dropdown').dropdown({action:'hide'});
  }

  componentDidUpdate() {
    $('.feed-page-dropdown').dropdown('refresh');
    let feedSearchInput = ReactDOM.findDOMNode(this.refs.feedSearchInput);
    feedSearchInput.value=this.props.query;
  }

  renderCards() {
    if(this.props.cards.length > 0) {
      return this.props.cards.map((card) => (
        <MessageItem context="outercard" hashtags={this.props.hashtags} users={this.props.users} key={card._id} card={card}/>
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

  render() {
    return (
      <div id="feed-page-wrapper" className="container">
        {/*<LeftSidebar homeSection={this.props.homeSection} groupFilterId={this.props.groupFilterId} groups={this.props.groups}/>*/}
        <div>
          <div className="ui secondary menu" style={{marginBottom:'0px'}}>
            <div className="header item">
              <h1 style={{color:'#f0ad4e'}}><i className="home icon"></i></h1>
            </div>
            <div className="item" style={{flexGrow:1}}>
              <div className="ui icon input">
                <input ref="feedSearchInput" type="text" onKeyDown={this.handleSearchKeyDown.bind(this)} placeholder="Search..."/>
                <i className="search icon"></i>
              </div>
            </div>
            <div className="right menu">
              <div className="item">
                <div className="ui teal buttons">
                  <a href="/cards/create" className="ui teal button"><i className="plus icon"></i> Create</a>
                  <div className="ui floating feed-page-dropdown dropdown icon button">
                    <i className="dropdown icon"></i>
                    <div className="menu">
                      <div className="item"><i className="adjust icon"></i> Create Project...</div>
                      <div className="item"><i className="comments icon"></i> Create Discussion... </div>
                      <div className="item"><i className="book icon"></i> Create Story... </div>
                      <div className="divider"></div>
                      <div className="item"><i className="square icon"></i>Create Generic Card...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="ui secondary right pointing small menu" style={{padding:'0px', margin:'0px'}}>
            {this.renderTabs()}
            <div className="right menu">
              <div className="ui feed-page-dropdown dropdown item">
                <i className="vertical ellipsis icon"></i>
                <div className="menu">
                  <a className="item" onClick={this.handleEditTabClicked.bind(this)}>Edit Tab</a>
                  <div className="divider"></div>
                  <a className="item" onClick={this.handleNewTabClicked.bind(this)}>New Tab</a>
                  <a className="item" onClick={this.handleRemoveTabClicked.bind(this)}>Remove Tab</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.renderSignUpMessage()}
        <div className="feed-page ui vertical segment full-height">
          <div id="message-list" ref="messageList" className="ui feed full-height" onScroll={this.handleScroll.bind(this)}>
            {this.renderCards()}
            <div style={{marginTop:'20px'}} className={this.props.loading?"ui active centered small inline loader":"ui centered small inline loader"}></div>
          </div>
        </div>
      </div>
    );
  }

  handleScroll() {
    if(!this.props.loading) {
      let node = ReactDOM.findDOMNode(this.refs.messageList);
      //console.log("SCROLLING scrollTop=" + (node.scrollTop+node.clientHeight) + ', scrollHeight=' + node.scrollHeight);
      if((node.scrollTop + node.clientHeight) >= (node.scrollHeight-30)) {
        console.log("SCROLL BOTTOM");
        FeedPage.pageLimit.set(FeedPage.pageLimit.get() + 30);
      }
    }
  }

  handleSearchKeyDown(e) {
    e.persist();
    if(this.searchInputKeyTimer) {
      clearTimeout(this.searchInputKeyTimer);
    }
    this.searchInputKeyTimer = setTimeout(function() {
      FlowRouter.go('feedPage', null, {'query': encodeURIComponent(e.target.value)});
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

  renderTabs() {
    if(this.props.tabs && this.props.tabs.length > 0) {
      return this.props.tabs.map((tab) => (
        <TabItem key={tab._id} tab={tab} selectedTabId={this.props.selectedTabId} query={this.props.query}/>
      ));
    }
  }

  handleNewTabClicked() {
    FlowRouter.go(`/tabs/create`);
  }

  handleEditTabClicked() {
    let tab = this.getCurrentTab();
    if(tab) {
      FlowRouter.go(`/tab/${tab._id}/edit`);
    }
  }

  handleRemoveTabClicked() {
    if(confirm("Are you sure you want to remove the current tab?")) {
      let tab = this.getCurrentTab();
      if(tab) {
        Meteor.call('tabs.remove', tab._id, function(err) {
          if(err) {
            alert("Error removing tab: " + err.reason);
          }
        });
      }
    }
  }

  getCurrentTab() {
    let tab = _.findWhere(this.props.tabs, {query: this.props.query});
    return tab;
  }
}

FeedPage.propTypes = {
  cards: PropTypes.array.isRequired
};

FeedPage.pageLimit = new ReactiveVar(10);

export default createContainer((props) => {
  var query = decodeURIComponent(FlowRouter.getQueryParam('query'));
  if(query === "undefined") {
    query = "";
  }
  let querySelector = SearchUtils.getFilterQuery(query);
  querySelector.limit = FeedPage.pageLimit.get(0);

  var cardsHandle = Meteor.subscribe('homeCards', querySelector);
  var hashtagsHandle = Meteor.subscribe('hashtags');
  var tabsHandle = Meteor.subscribe('userTabs');
  var data = {
    loading: !(cardsHandle.ready() && hashtagsHandle.ready() && tabsHandle.ready()),
    currentUser: Meteor.user(),
    query
  };
  data.cards = Cards.find({}, { sort: { updatedAt: -1 } }).fetch();
  data.hashtags = Hashtags.find().fetch();
  data.tabs = Tabs.find().fetch();
  return data;
}, FeedPage);
