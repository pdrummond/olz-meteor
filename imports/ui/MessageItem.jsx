import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards';
import { prune } from 'underscore.string';

import MarkdownUtils from '../utils/MarkdownUtils';
import HashtagLabel from './HashtagLabel';

export default class MessageItem extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.message-item-dropdown').dropdown({action:'nothing'});
  }

  componentDidUpdate() {
    $('.message-item-dropdown').dropdown('refresh');
  }

  render() {
    return (
      <div id="message-item" className={this.props.card.parentCardId==null?"outercard event":"innercard event"}>
        <div className="label">
          <img className="avatar" src={Cards.helpers.getUserProfileImage(this.props.card)}>
          </img>
        </div>
        <div className="content">
          <div className="summary">
            <div className="card-header-label">
              <i title={this.props.card.type} style={{cursor:'pointer'}} onClick={this.handleTypeIconClicked.bind(this)} className={Cards.helpers.getCardTypeIconClassName(this.props.card.type)} style={{position:'relative', top:'1px', color:Cards.helpers.getCardTypeIconColor(this.props.card.type), fontSize:'16px'}}></i>
              <span className="user-fullname-label">@{this.props.card.username}</span>
              <span style={{marginLeft:'5px'}} className="date">{moment(this.props.card.createdAt).fromNow()}</span>
                <div className="ui icon top left pointing message-item-dropdown dropdown mini basic button right floated">
                  <i className="vertical ellipsis icon popup-label" title="Hashtag options"></i>
                  <div className="menu">
                    <div className="item">Edit Card</div>
                    <div className="item">Delete Card</div>
                    <div className="divider"></div>
                    <div className="header" style={{fontSize:'12px'}}>ADD HASHTAG</div>
                    <div className="ui left huge labeled input">
                      <div className="ui label">#</div>
                      <input ref="hashtagInput" onKeyDown={this.onHashtagKeyDown.bind(this)} placeholder="Type hashtag here"/>
                    </div>
                  </div>
                </div>
                {Cards.helpers.renderCardKeySpan(this.props.card, 1)}
            </div>
            </div>
            <div className="markdown-content" style={{cursor:'pointer'}} onClick={() => {FlowRouter.go(`/card/${this.props.card._id}`);}}>
            {this.props.card.title && this.props.card.title.length > 0 ?
            <div className="ui transparent fluid input">
              <h1 className="title">{this.props.card.title}</h1>
            </div> : ''}
            <div className="extra text" dangerouslySetInnerHTML={ MarkdownUtils.markdownToHTML( prune(this.props.card.content, 300 )) }>
            </div>
            {this.props.card.content.length > 300 ? <a href="" className="read-more"><i className="right arrow icon"></i> Read More...</a> : ''}
            </div>

          <div className="meta" style={{display:this.props.hashtags.length>0?'block':'none'}}>
            <span className="hashtags">
              {this.renderHashtags()}
            </span>
        </div>
        </div>
      </div>
      );
  }

  handleTypeIconClicked() {
    let newType = this.props.card.type;
    switch(newType) {
      case 'comment': newType = 'task'; break;
      case 'task': newType = 'feature'; break;
      case 'feature': newType = 'bug'; break;
      case 'bug': newType = 'question'; break;
      case 'question': newType = 'comment'; break;

      case 'discussion': newType = 'project'; break;
      case 'project': newType = 'discussion'; break;
    }
    Meteor.call('cards.updateType', this.props.card._id, newType);
  }

  renderHashtags() {
    let hashtags = this.props.hashtags.filter( hashtag => hashtag.cardId === this.props.card._id);
    return hashtags.map((hashtag) => (
      <HashtagLabel key={hashtag._id} hashtag={hashtag}/>
    ));
  }

  onHashtagKeyDown(event) {
    if (event.keyCode === 13 && event.shiftKey == false) {
      let hashtag = event.target.value.trim().replace('#', '');
      if(hashtag.length > 0) {
        Meteor.call('hashtags.insert', hashtag, this.props.card._id, function(err) {
            if(err) {
                alert("Error adding hashtag: " + err.reason);
            } else {
                this.refs.hashtagInput.value = '';
            }
        }.bind(this));
      }
    }
  }
}
