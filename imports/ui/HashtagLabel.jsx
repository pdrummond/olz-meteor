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
          {this.renderSuggestions()}
        </div>
      </div>
    );
  }

  renderSuggestions() {
    let suggestions = [];
    const tag = this.props.hashtag.name;
    switch(tag) {
      case 'open': suggestions.push('done', 'closed'); break;
      case 'closed': suggestions.push('open', 'done'); break;
      case 'done': suggestions.push('todo', 'open', 'now', 'next');break;
      case 'todo': suggestions.push('done'); break;
      case 'now':  suggestions.push('next', 'soon', 'done'); break;
      case 'next': suggestions.push('now', 'soon', 'done'); break;
      case 'soon': suggestions.push('now', 'next', 'done'); break;
      case 'task': suggestions.push('todo', 'question', 'bug', 'feature'); break;
      case 'todo': suggestions.push('task', 'question', 'bug', 'feature', 'done'); break;
      case 'bug': suggestions.push('task', 'question', 'todo', 'feature'); break;
      case 'question': suggestions.push('task', 'bug', 'todo', 'feature'); break;
      case 'feature': suggestions.push('task', 'bug', 'todo', 'question'); break;
      case 'foo': suggestions.push('bar'); break;
      case 'daft': suggestions.push('punk'); break;
      case 'purple': suggestions.push('owl'); break;
      case 'flux': suggestions.push('capacitor', 'delorean'); break;
      case 'time-machine': suggestions.push('delorean'); break;
      case 'recursion': suggestions.push('recursion'); break;
      case 'OpenLoopzRocks': suggestions.push('TheBestProductivityAppEver', 'OpenLoopzRocksHarder', 'OpenLoopzIsTehAwesome'); break;
      case 'doge': suggestions.push('teh-awesome'); break;
    }
    if(suggestions.length > 0) {
      return suggestions.map((s, idx) => (<div key={idx} data-tag={s} onClick={this.handleTagClicked.bind(this)} className="item">#{s}</div>));
    } else {
      return (<div key={1} className="item"><i>No Suggestions</i></div>);
    }
  }

  handleTagClicked(e) {
    Meteor.call('hashtags.update', this.props.hashtag._id, $(e.target).attr('data-tag'));
  }

  handleRemoveClicked(e) {
    e.preventDefault();
    Meteor.call('hashtags.remove', this.props.hashtag._id);
  }
}
