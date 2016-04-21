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
import MemberItem from './MemberItem';

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
      <div id="card-detail-page" className={this.props.loading==false && this.props.currentCard.parentCardId==null?"outercard full-height":"innercard full-height"}>
        <div id="card-detail-page-segment" className={this.props.loading?"ui vertical loading segment full-height":"ui vertical segment full-height"} style={{padding:'0px'}}>
          <div className="ui fluid card ols-card-detail">
            <div className="content" style={{padding:'10px 20px'}}>
              <div className="ui right floated icon top left pointing card-detail-dropdown dropdown mini basic button">
                <i className="vertical ellipsis icon"></i>
                {!this.props.loading && this.props.currentCard.parentCardId == null ?
                <div className="menu">
                  <a href={!this.props.loading?`/card/${this.props.currentCard._id}/edit`:''} className="item">Edit Card</a>
                  <div onClick={this.handleToggleOpenClicked.bind(this)} className="item">{!this.props.loading && this.props.currentCard.isOpen?"Close Card":"Reopen Card"}</div>
                  <div className="item" onClick={this.handleMoveCardClicked.bind(this)}>Move Card</div>
                  {this.props.currentCard.parentCardId == null ? <div className="item" onClick={this.handleChangeCardKeyClicked.bind(this)}>Change Card Key</div> : ''}
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
                    <a href={!this.props.loading?`/card/${this.props.currentCard._id}/edit`:''} className="item">Edit Card</a>
                    <div onClick={this.handleToggleOpenClicked.bind(this)} className="item">{!this.props.loading && this.props.currentCard.isOpen?"Close Card":"Reopen Card"}</div>
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

              <img className="ui avatar image" src={Cards.helpers.getUserProfileImage(this.props.currentCard)} style={{width:'1.5em', height:'1.5em'}}/>
              {!this.props.loading?
                <span className="card-header-label">
                  <i className={Cards.helpers.getCardTypeIconClassName(this.props.currentCard.type)} style={{position:'relative', top:'1px', marginLeft:'10px', color:Cards.helpers.getCardTypeIconColor(this.props.currentCard.type), fontSize:'16px'}}></i>
                  <span className="user-fullname-label">@{this.props.currentCard.username}</span>
                  <span className="date" style={{marginLeft:'5px'}}>{moment(this.props.currentCard.createdAt).fromNow()}</span>
                  {this.props.currentCard.isOpen == false ? <span className="ui mini label" style={{marginLeft:'5px'}}>CLOSED</span> : ''}
                  {this.renderAssignee()}
                  {Cards.helpers.renderCardKeySpan(this.props.currentCard)}
                </span>:''}
              </div>
              <div className="content" style={{padding: '0px 20px 10px 20px', borderTop:'none'}}>
                <div id="card-detail-content" className={this.state.longFormMode?"longform description markdown-content":"description markdown-content"}>
                  <div className="ui transparent fluid input">
                    <h1 className="title">{!this.props.loading?this.props.currentCard.title:""}</h1>
                  </div>
                  {!this.props.loading?<div dangerouslySetInnerHTML={this.getCardContent()}></div>:""}
                  {!this.props.loading && this.props.currentCard.content.length > MAX_CONTENT_LENGTH && !this.state.longFormMode ? <a className="read-more" href="" onClick={() => {this.setState({longFormMode:true})}}><i className="expand icon"></i> Read More...</a> : ''}
                  {!this.props.loading && this.props.currentCard.content.length > MAX_CONTENT_LENGTH && this.state.longFormMode ? <a className="read-less" href="" onClick={() => {this.setState({longFormMode:false})}}><i className="compress icon"></i> Read Less...</a> : ''}
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

            <div id="message-list" ref="messageList" className="ui feed" style={{height: this.getCurrentTab().tabOptions.showMessageBox===true?'calc(100% - 271px)':'calc(100% - 150px)'}}>
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
            <a href={!this.props.loading?`/cards/create?parentCardId=${this.props.currentCard._id}`:""} className="ui small teal button" style={{fontSize:'0.9em'}}><i className="plus icon"></i> {tabOptions.createButtonLabel}</a>
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
            <MessageBox card={this.props.currentCard} onMessageCreated={this.scrollBottom.bind(this)}/>
          );
        }
      }
    }

    showEditTabDialog() {
      $(window).trigger('#edit-tab-dialog.visible');
    }

    getCardContent() {
      if(this.state.longFormMode) {
        return MarkdownUtils.markdownToHTML(this.props.currentCard.content);
      } else {
        return MarkdownUtils.markdownToHTML( prune(this.props.currentCard.content, MAX_CONTENT_LENGTH));
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
                <p>You can add messages directly using the message box below or click <a href={!this.props.loading?`/cards/create?parentCardId=${this.props.currentCard._id}`:""}>here</a> to create different types of card such as a task for example.</p>
                  :
                  <p> Click <a href={!this.props.loading?`/cards/create?parentCardId=${this.props.currentCard._id}`:""}>here</a> to create a new card.
                  </p>
                  }
              </small>


          </h2>

        )
      } else {
        return this.props.messageCards.map((card) => (
          <MessageItem context="card-detail" hashtags={this.props.hashtags} key={card._id} card={card}/>
        ));
      }
    }

    renderMembers() {
      return this.props.members.map((member) => (
        <MemberItem key={member._id} member={member}/>
      ));
    }

    handleNewTabClicked() {
      FlowRouter.go(`/card/${this.props.currentCard._id}/tab/create`);
    }

    handleMoveCardClicked() {
      Meteor.call('cards.getHandle', this.props.currentCard.parentCardId, function(err, handle) {
        let newParentHandle = prompt("Enter handle of card to move this card to (i.e #OLS-42): ", handle);
        if(newParentHandle != null) {
          Meteor.call('cards.move', this.props.currentCard._id, newParentHandle, function(err) {
            if(err) {
              alert("Error moving card: " + err.reason);
            }
          });
        }
      }.bind(this));
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

    handleRemoveFavouriteClicked() {
      Meteor.call('favourites.remove', this.props.currentCard._id, function(err) {
        if(err) {
          alert("Error removing favourite: " + err.reason);
        }
      });
    }

    handleToggleOpenClicked() {
      Meteor.call('cards.toggleOpen', this.props.currentCard._id, function(err) {
        if(err) {
          alert("Error opening/closing card: " + err.reason);
        }
      });
    }

    handleAssignToMeClicked() {
        Meteor.call('cards.updateAssignee', this.props.currentCard._id, Meteor.user().username);
    }

    handleRemoveAssigneeClicked() {
        Meteor.call('cards.removeAssignee', this.props.currentCard._id);
    }

    handleSetAssigneeClicked() {
        let assignee = prompt("Enter assignee username:");
        if(assignee && assignee.trim().length > 0) {
            assignee = assignee.trim();
            Meteor.call('cards.updateAssignee', this.props.currentCard._id, assignee);
        }
    }

    handleDeleteCardClicked() {
      if(confirm("Are you sure you want to delete this card?")) {
        Meteor.call('cards.remove', this.props.currentCard._id, function(err) {
          if(err) {
            alert("Error deleting card: " + err.reason);
          } else {
            FlowRouter.go('/');
          }
        });
      }
    }

    renderAssignee() {
      if(this.props.currentCard.assignee) {
        var assigneeUser = Meteor.users.findOne({username:this.props.currentCard.assignee});
        return (
          <img title={"Assigned to @" + this.props.currentCard.assignee} style={{position:'relative', top:'2px', left: '5px', width:'1.3em', height:'1.3em', borderRadius:'10px'}} src={assigneeUser.profileImage}/>
        );
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
