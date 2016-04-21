import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Tabs } from '../api/tabs';

class CreateTabPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.create-tab-page-toggle').checkbox();
  }

  componentDidUpdate() {
    $('.create-tab-page-toggle').checkbox();
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
            <h4 className="ui dividing header">Message Box Options</h4>
            <div className="ui segment">
              <div class="fields">
                <div className="field">
                  <div className="ui create-tab-page-toggle toggle checkbox">
                    <input ref="showMessageBoxInput" type="checkbox" className="hidden" defaultChecked={true}/>
                    <label>Show Message Box / Message Box Button</label>
                  </div>
                </div>
                <div className="field">
                  <label>Message Button Label</label>
                  <input ref="messageButtonLabelInput" placeholder="Add Message" defaultValue={"Add Message"}/>
                </div>
              </div>
            </div>
            <h4 className="ui dividing header">Create Button Options</h4>
            <div className="ui segment">
              <div class="fields">
                <div className="field">
                  <div className="ui create-tab-page-toggle toggle checkbox">
                    <input ref="showCreateButtonInput" type="checkbox" className="hidden" defaultChecked={false}/>
                    <label>Show Create Button</label>
                  </div>
                </div>
                <div className="field">
                  <label>Create Button Label</label>
                  <input ref="createButtonLabelInput" placeholder="Create" defaultValue={"Create"}/>
                </div>
              </div>
            </div>
          </form>

          <div className="actions" style={{marginTop:'30px'}}>
            <div className="ui button" onClick={this.handleCancelButtonClicked.bind(this)}>Cancel</div>
            <div className="ui button" onClick={this.handleOkButtonClicked.bind(this)}>Save</div>
          </div>

        </div>
      );
    }
  }

  handleCancelButtonClicked() {
    window.history.back();
  }

  handleOkButtonClicked() {
    const title = ReactDOM.findDOMNode(this.refs.titleInput).value.trim();
    const query = ReactDOM.findDOMNode(this.refs.queryInput).value.trim();
    const icon = ReactDOM.findDOMNode(this.refs.iconInput).value.trim();
    const description = ReactDOM.findDOMNode(this.refs.descriptionTextArea).value.trim();
    const tabOptions = {
      showMessageBox: ReactDOM.findDOMNode(this.refs.showMessageBoxInput).checked,
      messageButtonLabel: ReactDOM.findDOMNode(this.refs.messageButtonLabelInput).value.trim(),
      showCreateButton: ReactDOM.findDOMNode(this.refs.showCreateButtonInput).checked,
      createButtonLabel: ReactDOM.findDOMNode(this.refs.createButtonLabelInput).value.trim()
    }

    if(title.length) {
      Meteor.call('tabs.insert', title, 'normal', description, icon, query, this.props.cardId, tabOptions);
      window.history.back();
    }
  }
}


export default createContainer(() => {
  let cardId = FlowRouter.getParam('cardId')
  return {
    cardId,
  };
}, CreateTabPage);
