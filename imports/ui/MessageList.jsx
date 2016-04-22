import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import MessageItem from './MessageItem';

import { Cards } from '../api/cards';

class MessageList extends Component {

  constructor(props) {
    super(props);
    this.firstUpdate = true;
  }

  componentDidMount() {
  }

  componentDidUpdate() {
    //console.log("MessageList.componentDidUpdate() - scrolling to bottom");
    if(this.firstUpdate) {
      this.scrollBottom();
      this.firstUpdate = false;
    }
  }

  render() {
    return (
      <div id="message-list" ref="messageList" className="ui feed full-height">
        {this.renderLoadMore()}
        {this.renderMessageItems()}
      </div>
    )
  }

  renderLoadMore() {
    if(this.props.loading) {
      return (<div style={{marginLeft:'20px', marginTop:'-20px'}} className="ui active small inline loader"></div>);
    } else {
      return (<a style={{marginLeft:'20px', position:'relative', top:'-10px'}} onClick={this.handleScrollBackClicked.bind(this)} href=""><i className="up arrow icon"></i> Load older...</a>);      
    }
  }

  renderMessageItems() {
    if(this.props.messageCards.length == 0) {
      return (
        <h2 className="ui center aligned icon disabled header" style={{marginTop:'40px', width:'380px'}}>
          <i className="circular warning outline icon"></i>
          There is nothing to show here yet!
          <small style={{fontSize:"14px"}}>
              <p> Click <a href={!this.props.loading?`/cards/create?parentCardId=${this.props.card._id}`:""}>here</a> to create a new card.</p>
          </small>
        </h2>

      )
    } else {
      return this.props.messageCards.map((card) => (
        <MessageItem context="innercard" hashtags={this.props.hashtags} key={card._id} card={card}/>
      ));
    }
  }

  handleScrollBackClicked() {
    if(!this.props.loading) {
      let node = ReactDOM.findDOMNode(this.refs.messageList);
      if(node.scrollTop == 0) {
        let newLimit = MessageList.pageLimit.get() + 10;
        console.log("SCROLL TOP: " + newLimit);
        MessageList.pageLimit.set(newLimit);
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
    }, 1);
  }
}

MessageList.pageLimit = new ReactiveVar(10);

export default createContainer((props) => {
  let cardId = FlowRouter.getParam('cardId');
  var query = decodeURIComponent(FlowRouter.getQueryParam('query'));
  if(query === "undefined") {
    query = "";
  }
  let querySelector = SearchUtils.getFilterQuery(query);
  querySelector.limit = MessageList.pageLimit.get();
  querySelector.filter.parentCardId = cardId;
  var messageCardsHandle = Meteor.subscribe('messageCards', querySelector);
  var data = {
    loading: !(messageCardsHandle.ready()),
    messageCards: Cards.find({parentCardId: cardId}, { sort: { createdAt: 1}}).fetch()//SearchUtils.filterMessageCards(Meteor.userId(), querySelector, false).fetch()
  };
  return data;
}, MessageList);
