import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import RichEditor from './RichEditor.jsx';
import { Cards } from '../api/cards.js';

class CreateCardPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $(".ui.dropdown").dropdown();
  }

  render() {
    if(this.props.loading) {
      return (
        <p>Loading...</p>
      );
    } else {
      return (
        <div className="container feed-page-wrapper">
          {/*<LeftSidebar homeSection={this.props.homeSection} groupFilterId={this.props.groupFilterId} groups={this.props.groups}/>*/}
          <div>
            <div className="ui secondary menu">
              <div className="header item">
                <h1 style={{color:'#f0ad4e'}}><i className="plus icon"></i> Create Card</h1>
              </div>
              <div className="right menu">
              </div>
            </div>
          </div>
          <div className="ui fluid card">
            <div className="content">
              <div className="ui right floated icon top left pointing dropdown button">
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
              <img className="ui avatar image" src="http://semantic-ui.com/images/avatar/large/elliot.jpg"/> <span className="card-header-label"><span className="user-fullname-label">Paul Drummond</span>  is creating a new card...</span>
              </div>
              <div className="content">
                <div className="description">
                  <div className="ui transparent fluid input">
                    <h1 style={{marginLeft:'10px'}}><input ref="titleRef" type="text" placeholder="Title..."/></h1>
                  </div>
                  <RichEditor ref="editorRef" onChange={(rawContent) => {this.setState({rawContent})}} placeholder="Description..."/>
                </div>
              </div>
              <div className="extra content">
                <button className="ui icon button"><i className="privacy icon"></i></button>

                    <label>Only you and the users you choose to add as members will be able to see this.</label>

                <div className="ui right floated buttons">
                  <a href="/" className="ui button">Cancel</a>
                  <div className="or"></div>
                  <button className="ui positive button" onClick={this.handleCreateCardButton.bind(this)}>Create</button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  handleCreateCardButton() {
    const title = ReactDOM.findDOMNode(this.refs.titleRef).value.trim();

    if(this.state.rawContent) {
      Meteor.call('cards.insert', title, this.state.rawContent, function(err, cardId) {
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
