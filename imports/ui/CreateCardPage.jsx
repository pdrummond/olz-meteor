import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import ProseEditor from './ProseEditor.jsx';
import { Cards } from '../api/cards';

class CreateCardPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $(".create-card-dropdown").dropdown();
    $(".create-card-popup").popup();
  }

  componentDidUpdate() {
    $(".create-card-dropdown").dropdown('refresh');
    $(".create-card-popup").popup('refresh');
  }

  render() {
    if(this.props.loading) {
      return (
        <p>Loading...</p>
      );
    } else {
      return (
        <div className="container feed-page-wrapper">
          <div className="ui fluid card">
            <div className="content">
              <div className="ui right floated buttons">
                <a href="/" className="ui button">Cancel</a>
                <div className="or"></div>
                <button className="ui positive button" onClick={this.handleCreateCardButton.bind(this)}>Create</button>
              </div>
              <button style={{marginRight:'10px'}} className="ui right floated basic blue icon button create-card-popup" data-title="This card is private" data-content="Only you and the users you choose to add as members will be able to see this."><i className="privacy icon"></i></button>

              <img className="ui avatar image" src="http://semantic-ui.com/images/avatar/large/elliot.jpg"/> <span className="card-header-label"><span className="user-fullname-label">@{Meteor.user().username}</span>  is creating a new card...</span>
              </div>
              <div className="content">
                <div className="description">
                  <div className="ui transparent fluid input markdown-content">
                    <h1 className="title" style={{width:'100%', marginLeft:'10px'}}><input style={{width:'100%'}} ref="titleRef" type="text" placeholder="Title..."/></h1>
                  </div>
                  <ProseEditor className="markdown-content" onChange={(content) => {this.setState({content})}} placeholder="Description..."/>
                </div>
              </div>
              <div className="extra content">
                <div className="ui icon top left pointing create-card-dropdown dropdown button">
                  <i className="slack icon popup-label" title="Hashtag options"></i>
                  <div className="menu">
                    <div className="item">
                      Add Hashtag
                    </div>
                  </div>
                </div>
                      <div className="ui right floated icon top left pointing create-card-dropdown dropdown button">
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

  handleCreateCardButton() {
    const title = ReactDOM.findDOMNode(this.refs.titleRef).value.trim();
    const type = 'discussion'; //cards always default to discussion

    if(this.state.content) {
      Meteor.call('cards.insert', title, this.state.content, type, function(err, cardId) {
        if(err) {
          alert("Error adding card: " + err.reason);
        } else {
          ReactDOM.findDOMNode(this.refs.titleRef).value = '';
          FlowRouter.go('/');
        }
      }.bind(this));
    }
  }
}

export default createContainer((props) => {
  console.log("CreateCardPage props: " + JSON.stringify(props));
  return props;
}, CreateCardPage);
