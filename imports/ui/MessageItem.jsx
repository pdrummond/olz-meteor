import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards';

export default class MessageItem extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.ui.dropdown').dropdown();
  }

  render() {
    return (<div className="event">
    <div className="label">
      <img src={Cards.helpers.getUserProfileImage(this.props.card)}>
      </img>
    </div>
    <div className="content">
      <div className="summary">
        <a>{this.props.card.username}</a>
        <div className="date">
          {moment(this.props.card.createdAt).fromNow()}
        </div>
        {Cards.helpers.renderCardKeySpan(this.props.card, 1)}
      </div>
      <div className="extra text">
        {this.props.card.content}
      </div>
    </div>
  </div>
);
}
}
