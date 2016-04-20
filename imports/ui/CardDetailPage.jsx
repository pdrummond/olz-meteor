import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards';
import { Hashtags } from '../api/hashtags';
import { Tabs } from '../api/tabs';
import { Members } from '../api/members';
import MessageBox from './MessageBox';
import MessageItem from './MessageItem';
import TabItem from './TabItem';
import MemberItem from './MemberItem';
import { prune } from 'underscore.string';

import MarkdownUtils from '../utils/MarkdownUtils';
import SearchUtils from '../utils/SearchUtils';

class CardDetailPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      longFormMode: false
    }
  }

  componentDidMount() {
    $('.card-detail-dropdown').dropdown({action:'hide'});
  }

  componentDidUpdate() {
    $('.card-detail-dropdown').dropdown('refresh');
    let searchInput = ReactDOM.findDOMNode(this.refs.searchInput);
    searchInput.value=this.props.query;
    console.log("componentDidUpdate searchInput is: " + searchInput.value);
  }

  render() {
    return (
      <div id="card-detail-page" className="full-height">
        <div id="card-detail-page-segment" className={this.props.loading?"ui vertical loading segment full-height":"ui vertical segment full-height"} style={{padding:'0px'}}>
          <div className="ui fluid card ols-card-detail">

            <div className="content" style={{padding:'10px 20px'}}>
              <div className="ui right floated icon top left pointing card-detail-dropdown dropdown mini basic button">
                <i className="vertical ellipsis icon"></i>
                {!this.props.loading && this.props.currentCard.parentCardId == null ?
                <div className="menu">
                  <a href={!this.props.loading?`/card/${this.props.currentCard._id}/edit`:''} className="item">Edit Card</a>
                  <div className="item">Archive Card</div>
                  {this.props.currentCard.parentCardId == null ? <div className="item" onClick={this.handleChangeCardKeyClicked.bind(this)}>Change Card Key</div> : ''}
                  <div className="divider"></div>
                  <div className="item">Delete Card</div>
                  <div className="divider"></div>
                  <div className="header" style={{fontSize:'12px'}}>ADD MEMBER</div>
                  <div className="ui left huge labeled input">
                    <div className="ui label">@</div>
                    <input ref="memberInput" onKeyDown={this.onMemberKeyDown.bind(this)} placeholder="Type username here"/>
                  </div>
                </div>
                    :
                  <div className="menu">
                    <a href={!this.props.loading?`/card/${this.props.currentCard._id}/edit`:''} className="item">Edit Card</a>
                    <div className="item">Archive Card</div>
                    <div className="divider"></div>
                    <div className="item">Delete Card</div>
                  </div>
                }

              </div>

              <img className="ui avatar image" src={Cards.helpers.getUserProfileImage(this.props.currentCard)} style={{width:'1.5em', height:'1.5em'}}/>
              {!this.props.loading?
                <span className="card-header-label">
                  <i className={Cards.helpers.getCardTypeIconClassName(this.props.currentCard.type)} style={{position:'relative', top:'1px', marginLeft:'10px', color:Cards.helpers.getCardTypeIconColor(this.props.currentCard.type), fontSize:'16px'}}></i>
                  <span className="user-fullname-label">@{this.props.currentCard.username}</span>
                  <span className="date" style={{marginLeft:'5px'}}>{moment(this.props.currentCard.createdAt).fromNow()}</span>
                  {Cards.helpers.renderCardKeySpan(this.props.currentCard)}
                </span>:''}
              </div>
              <div className="content" style={{padding: '0px 20px 10px 20px', borderTop:'none'}}>
                <div id="card-detail-content" className={this.state.longFormMode?"longform description markdown-content":"description markdown-content"}>
                  <div className="ui transparent fluid input">
                    <h1 className="title">{!this.props.loading?this.props.currentCard.title:""}</h1>
                  </div>
                  {!this.props.loading?<div dangerouslySetInnerHTML={this.getCardContent()}></div>:""}
                  {!this.props.loading && this.props.currentCard.content.length > 500 && !this.state.longFormMode ? <a className="read-more" href="" onClick={() => {this.setState({longFormMode:true})}}><i className="expand icon"></i> Read More...</a> : ''}
                  {!this.props.loading && this.props.currentCard.content.length > 500 && this.state.longFormMode ? <a className="read-less" href="" onClick={() => {this.setState({longFormMode:false})}}><i className="compress icon"></i> Read Less...</a> : ''}
                </div>
              </div>
              <div className="extra content footer">
                <div className="ui right floated" >
                  {this.renderMembers()}
                </div>
              </div>
            </div>
            <div className="ui secondary pointing small menu" style={{padding:'0px', margin:'0px'}}>
              {this.renderTabs()}
              <div className="right menu">
                <div className="item">
                  <div className="ui icon mini input">
                    <input ref="searchInput" type="text" onKeyDown={this.handleSearchKeyDown.bind(this)} placeholder="Search..."/>
                    <i className="search link icon"></i>
                  </div>
                </div>
                <div className="ui card-detail-dropdown dropdown item">
                  <i className="vertical ellipsis icon"></i>
                  <div className="menu">
                    <a className="item" onClick={this.handleEditTabClicked.bind(this)}>Edit Tab</a>
                    <div className="divider"></div>
                    <a className="item" onClick={this.handleNewTabClicked.bind(this)}>New Tab</a>
                    <a className="item">Remove Tab</a>
                  </div>
                </div>
              </div>
            </div>

            <div id="message-list" ref="messageList" className="ui feed">
              {this.renderMessageItems()}
              {this.state.longFormMode ? <button style={{marginLeft:'20px'}} className="ui teal button" onClick={()=>{this.setState({longFormMode:!this.state.longFormMode})}}><i className="comment icon"></i> Add Message</button> :''}
            </div>
            {this.state.longFormMode?'':<MessageBox card={this.props.currentCard} onMessageCreated={this.scrollBottom.bind(this)}/>}
          </div>
        </div>
      );
    }

    getCardContent() {
      if(this.state.longFormMode) {
        return MarkdownUtils.markdownToHTML(this.props.currentCard.content);
      } else {
        return MarkdownUtils.markdownToHTML( prune(this.props.currentCard.content, 500));
      }
    }

    renderTabs() {
      return this.props.tabs.map((tab) => (
        <TabItem key={tab._id} tab={tab} selectedTabId={this.props.selectedTabId} query={this.props.query}/>
      ));
    }

    renderMessageItems() {
      return this.props.messageCards.map((card) => (
        <MessageItem hashtags={this.props.hashtags} key={card._id} card={card}/>
      ));
    }

    renderMembers() {
      return this.props.members.map((member) => (
        <MemberItem key={member._id} member={member}/>
      ));
    }

    handleNewTabClicked() {
      let title = prompt('Enter tab title');
      let query = prompt('Enter query:');
      let icon = prompt('Enter icon:');
      if(title != null) {
        icon = icon || 'circle';
        Meteor.call('tabs.insert', title, 'no description', 'normal', icon, query, this.props.currentCard._id);
      }
    }

    handleEditTabClicked() {
      let tab = _.findWhere(this.props.tabs, {query: this.props.query});
      if(tab) {
        let title = prompt('Enter tab title', tab.title);
        if(title != null) {
          let query = prompt('Enter query:', tab.query);
          if(query != null) {
            let icon = prompt('Enter icon:', tab.icon);
            if(icon != null) {
                icon = icon || 'circle';
                Meteor.call('tabs.update', tab._id, title, 'no description', 'normal', icon, query);
            }
          }
        }
      }
    }

    scrollBottom(callback) {
      var self = this;
      setTimeout(function() {
        let node = ReactDOM.findDOMNode(self.refs.messageList);
        node.scrollTop = node.scrollHeight;
        if(callback) {
          callback();
        }
      }, 20);
    }

    handleSearchKeyDown(e) {
      e.persist();
      if(this.searchInputKeyTimer) {
        clearTimeout(this.searchInputKeyTimer);
      }
      this.searchInputKeyTimer = setTimeout(function() {
        FlowRouter.go('cardDetailPage', {cardId: this.props.currentCard._id}, {'query': encodeURIComponent(e.target.value)});
      }.bind(this), 500);
    }

    onMemberKeyDown(event) {
      if (event.keyCode === 13 && event.shiftKey == false) {
        let username = event.target.value.trim().replace('@', '');
        if(username.length > 0) {
          Meteor.call('members.insert', username, this.props.currentCard._id, function(err) {
              if(err) {
                  alert("Error adding member: " + err.reason);
              } else {
                  this.refs.memberInput.value = '';
              }
          }.bind(this));
        }
      }
    }

    handleChangeCardKeyClicked() {
      var key = prompt("Enter key", this.props.currentCard.key);
      if(key != null) {
        Meteor.call('cards.updateKey', this.props.currentCard._id, key, function(err) {
            if(err) {
                alert(err.reason);
            }
        }.bind(this));
      }
    }
  }

  export default createContainer(() => {
    var cardId = FlowRouter.getParam('cardId');
    var query = decodeURIComponent(FlowRouter.getQueryParam('query'));
    if(query === "undefined") {
      query = "";
    }
    console.log("query: " + query);

    let querySelector = SearchUtils.getFilterQuery(query);
    querySelector.filter.parentCardId = cardId;

    var cardHandle = Meteor.subscribe('currentCard', cardId);
    var hashtagsHandle = Meteor.subscribe('hashtags');
    var tabsHandle = Meteor.subscribe('tabs', cardId);
    var messageCardsHandle = Meteor.subscribe('messageCards', querySelector);
    var membersHandle = Meteor.subscribe('members', cardId);

    var data = {
      loading: !(cardHandle.ready() && messageCardsHandle.ready() && hashtagsHandle.ready() && tabsHandle.ready() && membersHandle.ready()),
      currentCard: Cards.findOne(cardId),
      messageCards: SearchUtils.filterCards(Meteor.userId(), querySelector, 'messageCards').fetch(),
      hashtags: Hashtags.find().fetch(),
      tabs: Tabs.find().fetch(),
      members: Members.find().fetch(),
      query
    };
    return data;
  }, CardDetailPage);
