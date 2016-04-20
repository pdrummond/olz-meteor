import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import ProseEditor from './ProseEditor.jsx';
import { Cards } from '../api/cards';

class EditCardPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: ''
    }
  }

  componentDidMount() {
    if(this.props.card) {
      this.setState({content: this.props.card.content});
    }
    $(".edit-card-dropdown").dropdown();
    $(".edit-card-popup").popup();

  }

  componentDidUpdate() {
    $(".edit-card-dropdown").dropdown('refresh');
    $(".edit-card-popup").popup('refresh');
  }

  render() {
    if(this.props.loading) {
      return (
        <p>Loading...</p>
      );
    } else {
      console.log("CONTENT: " + this.state.content);
      return (
        <div className="container edit-card-page-wrapper outercard">
          <div className="ui fluid card">
            <div className="content" style={{flexGrow:'0'}}>
              <div className="ui right floated buttons">
                <a href="/" className="ui button">Cancel</a>
                <div className="or"></div>
                <button className="ui positive button" onClick={this.handleSaveCardButton.bind(this)}>Save</button>
              </div>
              <button style={{marginRight:'10px'}} className="ui right floated basic blue icon button edit-card-popup" data-title="This card is private" data-content="Only you and the users you choose to add as members will be able to see this."><i className="privacy icon"></i></button>
                <div className="ui icon top left pointing edit-card-dropdown dropdown basic button right floated">
                    <i className="slack icon" title="Add Hashtag"></i>
                  <div className="menu">
                    <div className="item"></div>
                    <div className="divider"></div>
                    <div className="header" >ADD HASHTAG</div>
                    <div className="ui left labeled input">
                      <div className="ui label">#</div>
                      <input ref="hashtagInput" onKeyDown={this.onHashtagKeyDown.bind(this)} placeholder="Type hashtag here"/>
                    </div>
                  </div>
                </div>
                <div className="ui icon top left pointing edit-card-dropdown dropdown basic button right floated">
                    <i className="users icon" title="Add Member"></i>
                  <div className="menu">
                    <div className="item"></div>
                    <div className="divider"></div>
                    <div className="header" >ADD MEMBER</div>
                    <div className="ui left labeled input">
                      <div className="ui label">@</div>
                      <input ref="hashtagInput" onKeyDown={this.onMemberKeyDown.bind(this)} placeholder="Type username here"/>
                    </div>
                  </div>
                </div>
                <div id="type-dropdown" className="ui right floated selection edit-card-dropdown dropdown">
                  <input ref='typeInput' type="hidden" defaultValue={this.props.card.type}/>
                    <i className="dropdown icon"></i>
                    <div className="default text">Select Card Type...</div>
                      {this.renderCardTypeItems()}
                  </div>
              <img className="ui avatar image" src={Cards.helpers.getUserProfileImage(this.props.card)}/> <span className="card-header-label"><span className="user-fullname-label">@{Meteor.user().username}</span>  is editing {Cards.helpers.renderCardKeySpan(this.props.card, 1)}...</span>
              </div>
              <div className="content full-height">
                <div className="description " style={{height:'calc(100% - 80px)'}}>
                  <div className="ui transparent fluid input markdown-content">
                    <h1 className="title" style={{width:'100%', marginLeft:'10px'}}><input style={{width:'100%'}} defaultValue={this.props.card.title} ref="titleRef" type="text" placeholder="Title..."/></h1>
                  </div>
                  {/*}<ProseEditor className="markdown-content" content={this.state.content} onChange={(content) => {this.setState({content})}} placeholder="Description..."/>*/}
                  <textarea className="card-content-textarea markdown-content" value={this.state.content} onChange={(e) => {this.setState({content:e.target.value})}} placeholder="Description..."></textarea>
                </div>
              </div>
              <div className="extra content">
              </div>
            </div>
          </div>
        );
    }
  }

  renderCardTypeItems() {
      return (
        <div className="menu">
          <div className="item" data-value="project"><i className="adjust icon"></i> Project</div>
          <div className="item" data-value="repo"><i className="code icon"></i> Code Repository</div>
          <div className="item" data-value="organisation"><i className="building outline icon"></i> Organisation</div>
          <div className="item" data-value="discussion"><i className="comments icon"></i> Discussion</div>
          <div className="item" data-value="story"><i className="newspaper icon"></i> Story</div>
          <div className="item" data-value="journal"><i className="book icon"></i> Journal</div>
          <div className="item" data-value="card"><i className="square icon"></i> Card</div>
          <div className="divider"></div>
          <div className="item" data-value="comment"><i className="comment icon"></i> Comment</div>
          <div className="item" data-value="task"><i className="warning circle icon"></i> Task</div>
          <div className="item" data-value="feature"><i className="bullseye icon"></i> Feature</div>
          <div className="item" data-value="bug"><i className="bug icon"></i> Bug</div>
          <div className="item" data-value="problem"><i className="bomb icon"></i> Problem</div>
          <div className="item" data-value="question"><i className="help circle icon"></i> Question</div>
          <div className="item" data-value="idea"><i className="idea icon"></i> Idea</div>
          <div className="item" data-value="announcement"><i className="announcement icon"></i> Announcement</div>
        </div>
      );
  }

  onHashtagKeyDown(event) {
    /*if (event.keyCode === 13 && event.shiftKey == false) {
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
    }*/
  }

  onMemberKeyDown(event) {
    /*if (event.keyCode === 13 && event.shiftKey == false) {
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
    }*/
  }

  handleSaveCardButton() {
    const title = ReactDOM.findDOMNode(this.refs.titleRef).value.trim();
    const type = $('#type-dropdown').dropdown('get value');

    if(title || this.state.content) {
      Meteor.call('cards.update', this.props.card._id, title, this.state.content, type, function(err) {
        if(err) {
          alert("Error editing card: " + err.reason);
        } else {
          FlowRouter.go(`/card/${this.props.card._id}`);
        }
      }.bind(this));
    }
  }
}

export default createContainer(() => {
  const cardId = FlowRouter.getParam('cardId');
  const cardHandle = Meteor.subscribe('currentCard', cardId);
  return {
    loading: !(cardHandle.ready()),
    card: Cards.findOne(cardId)
  };
}, EditCardPage);
