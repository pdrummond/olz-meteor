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
        <div className="container feed-page-wrapper">
          <div className="ui fluid card">
            <div className="content">
              <div className="ui right floated buttons">
                <a href="/" className="ui button">Cancel</a>
                <div className="or"></div>
                <button className="ui positive button" onClick={this.handleSaveCardButton.bind(this)}>Save</button>
              </div>
              <button style={{marginRight:'10px'}} className="ui right floated basic blue icon button edit-card-popup" data-title="This card is private" data-content="Only you and the users you choose to add as members will be able to see this."><i className="privacy icon"></i></button>

              <img className="ui avatar image" src={Cards.helpers.getUserProfileImage(this.props.card)}/> <span className="card-header-label"><span className="user-fullname-label">@{Meteor.user().username}</span>  is editing {Cards.helpers.renderCardKeySpan(this.props.card, 1)}...</span>
              </div>
              <div className="content">
                <div className="description">
                  <div className="ui transparent fluid input markdown-content">
                    <h1 className="title" style={{width:'100%', marginLeft:'10px'}}><input style={{width:'100%'}} defaultValue={this.props.card.title} ref="titleRef" type="text" placeholder="Title..."/></h1>
                  </div>
                  {/*}<ProseEditor className="markdown-content" content={this.state.content} onChange={(content) => {this.setState({content})}} placeholder="Description..."/>*/}
                  <textarea className="card-content-textarea markdown-content" value={this.state.content} onChange={(e) => {this.setState({content:e.target.value})}} placeholder="Description..."></textarea>
                </div>
              </div>
              <div className="extra content">
                <div className="ui icon top left pointing edit-card-dropdown dropdown button">
                  <i className="slack icon popup-label" title="Hashtag options"></i>
                  <div className="menu">
                    <div className="item">
                      Add Hashtag
                    </div>
                  </div>
                </div>
                      <div className="ui right floated icon top left pointing edit-card-dropdown dropdown button">
                        <i className="users icon" title="Add Members"></i>
                        <div className="menu">
                          <div className="item">
                            Jenny Hess
                          </div>
                          <div className="item">
                            Harold Tester
                          </div>
                        </div>
                      </div>
              </div>
            </div>
          </div>
        );
    }
  }

  handleSaveCardButton() {
    const title = ReactDOM.findDOMNode(this.refs.titleRef).value.trim();

    if(this.state.content) {
      Meteor.call('cards.update', this.props.card._id, title, this.state.content, this.props.card.type, function(err) {
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
