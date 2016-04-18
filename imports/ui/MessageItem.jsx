import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards';

import MarkdownUtils from './utils/MarkdownUtils';

export default class MessageItem extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.ui.dropdown').dropdown();
  }

  render() {
    return (
      <div id="message-item" className="event">
    <div className="label">
      <img className="avatar" src={Cards.helpers.getUserProfileImage(this.props.card)}>
      </img>
    </div>
    <div className="content">
      <div className="summary">
        <div className="card-header-label">
        <i className={Cards.helpers.getCardTypeIconClassName(this.props.card.type)} style={{position:'relative', top:'1px', color:Cards.helpers.getCardTypeIconColor(this.props.card.type), fontSize:'16px'}}></i>
        <span className="user-fullname-label">@{this.props.card.username}</span>
        <span style={{marginLeft:'5px'}} className="date">{moment(this.props.card.createdAt).fromNow()}</span>        
        {Cards.helpers.renderCardKeySpan(this.props.card, 1)}
        </div>
      </div>
      <div className="extra text markdown-content" dangerouslySetInnerHTML={ MarkdownUtils.markdownToHTML( this.props.card.content ) }>
      </div>
    </div>
  </div>
);
}
}
