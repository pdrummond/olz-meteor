import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { prune } from 'underscore.string';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Cards } from '../api/cards';
import { Hashtags } from '../api/hashtags';
import { Tabs } from '../api/tabs';
import { Members } from '../api/members';
import MessageBox from './MessageBox';
import MessageItem from './MessageItem';
import TabItem from './TabItem';
import MarkdownUtils from '../utils/MarkdownUtils';
import SearchUtils from '../utils/SearchUtils';

var Modal = require('react-modal');

const MAX_CONTENT_LENGTH = 200;

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class CardDetailPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      longFormMode: false,
      openEditModal: true
    }
  }

  componentDidMount() {
    $('.card-detail-dropdown').dropdown({action:'hide'});
  }

  componentDidUpdate() {
    $('.card-detail-dropdown').dropdown('refresh');
    let searchInput = ReactDOM.findDOMNode(this.refs.searchInput);
    searchInput.value=this.props.query;
  }

  render() {
    return (
      <div id="card-detail-page" className={this.props.loading==false && this.props.card.parentCardId==null?"outercard full-height":"innercard full-height"}>
        <div id="card-detail-page-segment" className={this.props.loading?"ui vertical loading segment full-height":"ui vertical segment full-height"} style={{padding:'0px'}}>
          <div className="ui feed" style={{marginBottom:'0px'}}>
          {!this.props.loading? <MessageItem context="card-detail-item" hashtags={this.props.hashtags} members={this.props.members} users={this.props.users} key={this.props.card._id} card={this.props.card}/>:''}
          </div>
          {/*}<div className="ui fluid card ols-card-detail">
            <div className="content" style={{padding:'10px 20px'}}>
              <div className="ui right floated icon top left pointing card-detail-dropdown dropdown mini basic button">
                <i className="vertical ellipsis icon"></i>
                {!this.props.loading && this.props.card.parentCardId == null ?
                <div className="menu">
                  <a href={!this.props.loading?`/card/${this.props.card._id}/edit`:''} className="item">Edit Card</a>
                  <div onClick={this.handleToggleOpenClicked.bind(this)} className="item">{!this.props.loading && this.props.card.isOpen?"Close Card":"Reopen Card"}</div>
                  <div className="item" onClick={this.handleMoveCardClicked.bind(this)}>Move Card</div>
                  {this.props.card.parentCardId == null ? <div className="item" onClick={this.handleChangeCardKeyClicked.bind(this)}>Change Card Key</div> : ''}
                  <div className="divider"></div>
                  <div className="item" onClick={this.handleSetAssigneeClicked.bind(this)}>Set Assignee</div>
                  <div className="item" onClick={this.handleAssignToMeClicked.bind(this)}>Assign to Me</div>
                  <div className="item" onClick={this.handleRemoveAssigneeClicked.bind(this)}>Remove Assignee</div>
                  <div className="divider"></div>
                  <div className="item" onClick={this.handleRemoveFavouriteClicked.bind(this)}>Remove Favourite</div>
                  <div className="item" onClick={this.handleDeleteCardClicked.bind(this)}>Delete Card</div>
                  <div className="divider"></div>
                  <div className="header" style={{fontSize:'12px'}}>ADD MEMBER</div>
                  <div className="ui left huge labeled input">
                    <div className="ui label">@</div>
                    <input ref="memberInput" onKeyDown={this.onMemberKeyDown.bind(this)} placeholder="Type username here"/>
                  </div>
                </div>
                    :
                  <div className="menu">
                    <a href={!this.props.loading?`/card/${this.props.card._id}/edit`:''} className="item">Edit Card</a>
                    <div onClick={this.handleToggleOpenClicked.bind(this)} className="item">{!this.props.loading && this.props.card.isOpen?"Close Card":"Reopen Card"}</div>
                    <div className="item" onClick={this.handleMoveCardClicked.bind(this)}>Move Card</div>
                      <div className="divider"></div>
                      <div className="item" onClick={this.handleSetAssigneeClicked.bind(this)}>Set Assignee</div>
                      <div className="item" onClick={this.handleAssignToMeClicked.bind(this)}>Assign to Me</div>
                      <div className="item" onClick={this.handleRemoveAssigneeClicked.bind(this)}>Remove Assignee</div>
                    <div className="divider"></div>
                    <div className="item" onClick={this.handleRemoveFavouriteClicked.bind(this)}>Remove Favourite</div>
                    <div className="item" onClick={this.handleDeleteCardClicked.bind(this)}>Delete Card</div>
                  </div>
                }

              </div>

              <img className="ui avatar image" src={Cards.helpers.getUserProfileImage(this.props.card)} style={{width:'1.5em', height:'1.5em'}}/>
              {!this.props.loading?
                <span className="card-header-label">
                  <i className={Cards.helpers.getCardTypeIconClassName(this.props.card.type)} style={{position:'relative', top:'1px', marginLeft:'10px', color:Cards.helpers.getCardTypeIconColor(this.props.card.type), fontSize:'16px'}}></i>
                  <span className="user-fullname-label">@{this.props.card.username}</span>
                  <span className="date" style={{marginLeft:'5px'}}>{moment(this.props.card.createdAt).fromNow()}</span>
                  {this.props.card.isOpen == false ? <span className="ui mini label" style={{marginLeft:'5px'}}>CLOSED</span> : ''}
                  {this.renderAssignee()}
                  {Cards.helpers.renderCardKeySpan(this.props.card)}
                </span>:''}
              </div>
              <div className="content" style={{padding: '0px 20px 10px 20px', borderTop:'none'}}>
                <div id="card-detail-content" className={this.state.longFormMode?"longform description markdown-content":"description markdown-content"}>
                  <div className="ui transparent fluid input">
                    <h1 className="title">{!this.props.loading?this.props.card.title:""}</h1>
                  </div>
                  {!this.props.loading?<div dangerouslySetInnerHTML={this.getCardContent()}></div>:""}
                  {!this.props.loading && this.props.card.content.length > MAX_CONTENT_LENGTH && !this.state.longFormMode ? <a className="read-more" href="" onClick={() => {this.setState({longFormMode:true})}}><i className="expand icon"></i> Read More...</a> : ''}
                  {!this.props.loading && this.props.card.content.length > MAX_CONTENT_LENGTH && this.state.longFormMode ? <a className="read-less" href="" onClick={() => {this.setState({longFormMode:false})}}><i className="compress icon"></i> Read Less...</a> : ''}
                </div>
              </div>
              <div className="extra content footer">
                <div className="ui right floated" >
                  {this.renderMembers()}
                </div>
              </div>
            </div>*/}
            <div className="ui secondary pointing small menu" style={{backgroundColor:'whitesmoke', padding:'0px', margin:'0px'}}>
              {this.renderTabs()}
              <div className="right menu">
                {this.renderCreateButton()}
                <div className="item">
                  <div className="ui icon small input">
                    <input ref="searchInput" type="text" onKeyDown={this.handleSearchKeyDown.bind(this)} placeholder="Search..." />
                    <i className="search link icon"></i>
                  </div>
                </div>
                <div className="ui card-detail-dropdown dropdown item">
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

            <div id="message-list" ref="messageList" className="ui feed" style={{height: this.getCurrentTab().tabOptions.showMessageBox===true?'calc(100% - 275px)':'calc(100% - 150px)'}}>
              {this.renderMessageItems()}
            </div>
            {this.renderMessageBox()}
          </div>
        </div>
      );
    }

    renderCreateButton() {
      let tabOptions = this.getCurrentTab().tabOptions;
      if(tabOptions.showCreateButton === true) {
        return (
          <div className="item">
            <a href={!this.props.loading?`/cards/create?parentCardId=${this.props.card._id}`:""} className="ui small teal button" style={{fontSize:'0.9em'}}><i className="plus icon"></i> {tabOptions.createButtonLabel}</a>
          </div>
        );
      }
    }

    renderMessageBox() {
      let tabOptions = this.getCurrentTab().tabOptions;
      if(tabOptions.showMessageBox === true) {
        if(this.state.longFormMode === true) {
          return (
            <button style={{margin:'20px 50px'}} className="ui teal button" onClick={()=>{this.setState({longFormMode:!this.state.longFormMode})}}><i className="comment icon"></i> {tabOptions.messageButtonLabel}</button>
          );
        } else {
          return (
            <MessageBox card={this.props.card} onMessageCreated={this.scrollBottom.bind(this)}/>
          );
        }
      }
    }

    showEditTabDialog() {
      $(window).trigger('#edit-tab-dialog.visible');
    }

    getCardContent() {
      if(this.state.longFormMode) {
        return MarkdownUtils.markdownToHTML(this.props.card.content);
      } else {
        return MarkdownUtils.markdownToHTML( prune(this.props.card.content, MAX_CONTENT_LENGTH));
      }
    }

    renderTabs() {
      return this.props.tabs.map((tab) => (
        <TabItem key={tab._id} tab={tab} selectedTabId={this.props.selectedTabId} query={this.props.query}/>
      ));
    }

    renderMessageItems() {
      if(this.props.messageCards.length == 0) {
        return (
          <h2 className="ui center aligned icon disabled header" style={{marginTop:'40px', width:'380px'}}>
              <i className="circular warning outline icon"></i>
              There is nothing to show here yet!
              <small style={{fontSize:"14px"}}>
                {this.getCurrentTab().tabOptions.showMessageBox?
                <p>You can add messages directly using the message box below or click <a href={!this.props.loading?`/cards/create?parentCardId=${this.props.card._id}`:""}>here</a> to create different types of card such as a task for example.</p>
                  :
                  <p> Click <a href={!this.props.loading?`/cards/create?parentCardId=${this.props.card._id}`:""}>here</a> to create a new card.
                  </p>
                  }
              </small>


          </h2>

        )
      } else {
        return this.props.messageCards.map((card) => (
          <MessageItem context="innercard" hashtags={this.props.hashtags} key={card._id} card={card}/>
        ));
      }
    }

    handleNewTabClicked() {
      FlowRouter.go(`/card/${this.props.card._id}/tab/create`);
    }

    getCurrentTab() {
      const defaultTabOptions = {
        showMessageBox:true,
        messageBoxLabel:'Add Message',
        showCreateButton: false,
        createButtonLabel: 'Create',
        autoScrollBottom: true,
        showClosedCards: false,
        newCardType: 'comment',
        showReadMore: true
      };

      let tab = _.findWhere(this.props.tabs, {query: this.props.query});
      if(tab == null) {
        tab = {
          tabOptions: defaultTabOptions
        };
      } else if(tab.tabOptions == null) {
        tab.tabOptions = defaultTabOptions;
      }
      return tab;
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
        FlowRouter.go('cardDetailPage', {cardId: this.props.card._id}, {'query': encodeURIComponent(e.target.value)});
      }.bind(this), 500);
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
      card: Cards.findOne(cardId),
      messageCards: SearchUtils.filterCards(Meteor.userId(), querySelector, 'messageCards').fetch(),
      hashtags: Hashtags.find().fetch(),
      tabs: Tabs.find().fetch(),
      members: Members.find().fetch(),
      query
    };
    return data;
  }, CardDetailPage);
