import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import {moment} from 'meteor/momentjs:moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards.jsx';

export default class HashtagLabel extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.ui.dropdown').dropdown({action:'nothing'});
  }

  render() {
    return (
      <div className="ui inline dropdown hashtag-label item">
        <div className="text">#{this.props.hashtag.name}</div>
        <div className="menu">
          <div className="item">Change hashtag</div>
          <div className="item" onClick={this.handleRemoveClicked.bind(this)}>Remove hashtag</div>
          <div className="divider"></div>
          <div className="header">SUGGESTIONS</div>
          <div className="item">Change to #now</div>
          <div className="item">Change to #next</div>
          <div className="item">Change to #soon</div>
        </div>
      </div>
    );
  }

  handleRemoveClicked(e) {
    e.preventDefault();
    Meteor.call('hashtags.remove', this.props.hashtag._id);
  }
}
