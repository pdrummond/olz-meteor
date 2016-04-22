import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards';
import { prune } from 'underscore.string';
import MemberItem from './MemberItem';
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
      <div id="message-item" className={this.props.card.isOpen?"open event":"closed event"}>

        <div className="label">
          <img className="card-avatar" src={Cards.helpers.getUserProfileImage(this.props.card)}>
          </img>
        </div>
        <div className="content">
          <div className="summary">
            <div className="card-header-label" style={{position:'relative'}}>
              <i title={this.props.card.type} style={{cursor:'pointer'}} onClick={this.handleTypeIconClicked.bind(this)} className={Cards.helpers.getCardTypeIconClassName(this.props.card.type)} style={{color:Cards.helpers.getCardTypeIconColor(this.props.card.type)}}></i>
              <span id="type-icon-text">{this.props.card.type}</span>
              <span className="user-fullname-label">@{this.props.card.username}</span>
              <span style={{marginLeft:'5px'}} className="date">{moment(this.props.card.createdAt).fromNow()}</span>
              {this.props.card.isOpen == false ? <span className="ui mini label" style={{marginLeft:'5px'}}>CLOSED</span> : ''}
              {this.renderAssignee()}
              <div className="ui icon top left pointing message-item-dropdown dropdown mini basic button right floated">
                <i className="vertical ellipsis icon popup-label" title="Hashtag options"></i>
                <div className="menu">
                  <a href={`/card/${this.props.card._id}/edit`} className="item">Edit Card</a>
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
                  {this.props.card.parentCardId == null ? <div className="divider"></div> : ''}
                  {this.props.card.parentCardId == null ? <div className="header" style={{fontSize:'12px'}}>ADD MEMBER</div> : ''}
                  {this.props.card.parentCardId == null ? <div className="ui left huge labeled input">
                    <div className="ui label">@</div>
                    <input ref="memberInput" onKeyDown={this.onMemberKeyDown.bind(this)} placeholder="Type username here"/>
                  </div> : ''}
                  <div className="divider"></div>
                  <div className="header" style={{fontSize:'12px'}}>ADD HASHTAG</div>
                  <div className="ui left huge labeled input">
                    <div className="ui label">#</div>
                    <input ref="hashtagInput" onKeyDown={this.onHashtagKeyDown.bind(this)} placeholder="Type hashtag here"/>
                  </div>
                </div>
              </div>
              {this.props.context == 'innercard' ? Cards.helpers.renderCardKeySpan(this.props.card, 1) : Cards.helpers.renderCardKeySpan(this.props.card) }
            </div>
          </div>
          <div className="markdown-content" style={{cursor:this.props.context != 'card-detail-item'?'pointer':'default'}} onClick={this.handleCardSelected.bind(this)}>
            {this.props.card.title && this.props.card.title.length > 0 ?
              <div className="ui transparent fluid input">
                <h1 className="title">{this.props.card.title}</h1>
              </div> : ''}
              <div className="extra text" dangerouslySetInnerHTML={ MarkdownUtils.markdownToHTML( prune(this.props.card.content, 300 )) }>
              </div>
              {this.props.card.content.length > 300 ? <a href="" className="read-more"><i className="right arrow icon"></i> Read More...</a> : ''}
            </div>

            <div className="meta" style={{display:'flex', justifyContent:'space-between'}}>
              <span className="hashtags">
                {this.renderHashtags()}
              </span>
              <span className="members" >
                {this.renderMembers()}
              </span>
            </div>
          </div>
        </div>
      );
    }

    renderMembers() {
      if(this.props.members && this.props.members.length > 0) {
        return this.props.members.map((member) => (
          <MemberItem key={member._id} member={member}/>
        ));
      }
    }

    renderAssignee() {
      if(this.props.card.assignee) {
        var assigneeUser = Meteor.users.findOne({username:this.props.card.assignee});
        return (
          <img title={"Assigned to @" + this.props.card.assignee} style={{position:'relative', top:'2px', left: '5px', width:'1.3em', height:'1.3em', borderRadius:'10px'}} src={assigneeUser.profileImage}/>
        );
      }
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

    handleCardSelected() {
      Meteor.call('cards.getDefaultTab', this.props.card._id, function(err, defaultTab) {
        if(err) {
          alert(err.reason);
        } else {
          if(defaultTab == null) {
            FlowRouter.go(`/card/${this.props.card._id}`);
          } else {
            FlowRouter.go(`/card/${this.props.card._id}?query=${encodeURIComponent(defaultTab.query)}`);
          }
        }
      }.bind(this));
    }

    renderHashtags() {
      if(this.props.hashtags) {
        let hashtags = this.props.hashtags.filter( hashtag => hashtag.cardId === this.props.card._id);
        return hashtags.map((hashtag) => (
          <HashtagLabel key={hashtag._id} hashtag={hashtag}/>
        ));
      }
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

    onMemberKeyDown(event) {
      if (event.keyCode === 13 && event.shiftKey == false) {
        let username = event.target.value.trim().replace('@', '');
        if(username.length > 0) {
          Meteor.call('members.insert', username, this.props.card._id, function(err) {
              if(err) {
                  alert("Error adding member: " + err.reason);
              } else {
                  this.refs.memberInput.value = '';
              }
          }.bind(this));
        }
      }
    }

    handleMoveCardClicked() {
      Meteor.call('cards.getHandle', this.props.card.parentCardId, function(err, handle) {
        let newParentHandle = prompt("Enter handle of card to move this card to (i.e #OLS-42): ", handle);
        if(newParentHandle != null) {
          Meteor.call('cards.move', this.props.card._id, newParentHandle, function(err) {
            if(err) {
              alert("Error moving card: " + err.reason);
            }
          });
        }
      }.bind(this));
    }

    handleChangeCardKeyClicked() {
      var key = prompt("Enter key", this.props.card.key);
      if(key != null) {
        Meteor.call('cards.updateKey', this.props.card._id, key, function(err) {
            if(err) {
                alert(err.reason);
            }
        }.bind(this));
      }
    }

    handleRemoveFavouriteClicked() {
      Meteor.call('favourites.remove', this.props.card._id, function(err) {
        if(err) {
          alert("Error removing favourite: " + err.reason);
        }
      });
    }

    handleToggleOpenClicked() {
      Meteor.call('cards.toggleOpen', this.props.card._id, function(err) {
        if(err) {
          alert("Error opening/closing card: " + err.reason);
        }
      });
    }

    handleAssignToMeClicked() {
        Meteor.call('cards.updateAssignee', this.props.card._id, Meteor.user().username);
    }

    handleRemoveAssigneeClicked() {
        Meteor.call('cards.removeAssignee', this.props.card._id);
    }

    handleSetAssigneeClicked() {
        let assignee = prompt("Enter assignee username:");
        if(assignee && assignee.trim().length > 0) {
            assignee = assignee.trim();
            Meteor.call('cards.updateAssignee', this.props.card._id, assignee);
        }
    }

    handleDeleteCardClicked() {
      if(confirm("Are you sure you want to delete this card?")) {
        Meteor.call('cards.remove', this.props.card._id, function(err) {
          if(err) {
            alert("Error deleting card: " + err.reason);
          } else {
            FlowRouter.go('/');
          }
        });
      }
    }


  }
