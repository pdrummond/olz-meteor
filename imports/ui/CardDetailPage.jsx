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
import MessageList from './MessageList';
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
  }

  render() {
    return (
      <div id="card-detail-page" className="full-height">
        <div id="card-detail-page-segment" className="ui vertical segment full-height" style={{padding:'0px'}}>
          <div className="ui feed" style={{marginBottom:'0px'}}>
          {!this.props.loading? <MessageItem context="card-detail-item" hashtags={this.props.hashtags} members={this.props.members} users={this.props.users} key={this.props.card._id} card={this.props.card}/>:''}
          </div>
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
            <div id="message-list-wrapper" className="ui feed full-height" style={{marginTop:'0px'}}>
              <MessageList card={this.props.card}/>
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
            <MessageBox card={this.props.card}/>
          );
        }
      }
    }

    showEditTabDialog() {
      $(window).trigger('#edit-tab-dialog.visible');
    }

    renderTabs() {
      return this.props.tabs.map((tab) => (
        <TabItem key={tab._id} tab={tab} selectedTabId={this.props.selectedTabId} query={this.props.query}/>
      ));
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
    var cardHandle = Meteor.subscribe('currentCard', cardId);
    var hashtagsHandle = Meteor.subscribe('hashtags');
    var tabsHandle = Meteor.subscribe('tabs', cardId);
    var membersHandle = Meteor.subscribe('members', cardId);
    var data = {
      loading: !(cardHandle.ready() && hashtagsHandle.ready() && tabsHandle.ready() && membersHandle.ready()),
      card: Cards.findOne(cardId),
      hashtags: Hashtags.find().fetch(),
      tabs: Tabs.find({cardId}).fetch(),
      members: Members.find().fetch()
    };
    return data;
  }, CardDetailPage);
