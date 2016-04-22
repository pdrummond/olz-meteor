import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Tabs } from '../api/tabs';

class CreateUserTabPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.create-user-tab-page-toggle').checkbox();
  }

  componentDidUpdate() {
    $('.create-user-tab-page-toggle').checkbox();
  }

  render() {
    if(this.props.loading) {
      return (<p>Loading...</p>);
    } else {
      return (
        <div className="ui container" style={{width:'800px', marginTop:'50px'}}>
          <h1 className="ui teal image header">
            New Tab.
          </h1>
          <form className="ui form">
            <div className="field">
              <label>Title</label>
              <input ref="titleInput" type="text" placeholder="Title"/>
            </div>
            <div className="field">
              <label>Query</label>
              <input ref="queryInput" type="text" placeholder="Query"/>
            </div>
            <div className="field">
              <label>Icon</label>
              <input ref="iconInput" type="text" placeholder="Icon"/>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea ref="descriptionTextArea" rows="2" placeholder="Description"></textarea>
            </div>
          </form>

          <div className="actions" style={{marginTop:'30px'}}>
            <div className="ui button" onClick={this.handleCancelButtonClicked.bind(this)}>Cancel</div>
            <div className="ui teal button" onClick={this.handleCreateButtonClicked.bind(this)}>Create</div>
          </div>

        </div>
      );
    }
  }

  handleCancelButtonClicked() {
    window.history.back();
  }

  handleCreateButtonClicked() {
    const title = ReactDOM.findDOMNode(this.refs.titleInput).value.trim();
    const query = ReactDOM.findDOMNode(this.refs.queryInput).value.trim();
    const icon = ReactDOM.findDOMNode(this.refs.iconInput).value.trim();
    const description = ReactDOM.findDOMNode(this.refs.descriptionTextArea).value.trim();

    if(title.length) {
      Meteor.call('tabs.insert', title, 'user', description, icon, query);
      window.history.back();
    }
  }
}


export default createContainer(() => {
  let cardId = FlowRouter.getParam('cardId')
  return {
    cardId,
  };
}, CreateUserTabPage);
