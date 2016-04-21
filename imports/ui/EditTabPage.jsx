import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { Tabs } from '../api/tabs';

class EditTabPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.edit-tab-page-toggle').checkbox();
  }

  componentDidUpdate() {
    $('.edit-tab-page-toggle').checkbox();
  }

  render() {
    if(this.props.loading) {
      return (<p>Loading...</p>);
    } else {
      return (
        <div className="ui container" style={{width:'800px', marginTop:'50px'}}>
          <h1 className="ui teal image header">
            Edit Tab.
          </h1>
          <form className="ui form">
            <div className="field">
              <label>Title</label>
              <input ref="titleInput" type="text" placeholder="Title" defaultValue={this.props.tab.title}/>
            </div>
            <div className="field">
              <label>Query</label>
              <input ref="queryInput" type="text" placeholder="Query" defaultValue={this.props.tab.query}/>
            </div>
            <div className="field">
              <label>Icon</label>
              <input ref="iconInput" type="text" placeholder="Icon"  defaultValue={this.props.tab.icon}/>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea ref="descriptionTextArea" rows="2"  defaultValue={this.props.tab.description} placeholder="Description"></textarea>
            </div>
            <h4 className="ui dividing header">Message Box Options</h4>
            <div className="ui segment">
              <div class="fields">
                <div className="field">
                  <div className="ui edit-tab-page-toggle toggle checkbox">
                    <input ref="showMessageBoxInput" type="checkbox" className="hidden" defaultChecked={this.props.tab.tabOptions?this.props.tab.tabOptions.showMessageBox:true}/>
                    <label>Show Message Box / Message Box Button</label>
                  </div>
                </div>
                <div className="field">
                  <label>Message Button Label</label>
                  <input ref="messageButtonLabelInput" defaultValue={this.props.tab.tabOptions?this.props.tab.tabOptions.messageButtonLabel:'Add Message'} placeholder="Add Message"/>
                </div>
              </div>
            </div>
            <h4 className="ui dividing header">Create Button Options</h4>
            <div className="ui segment">
              <div class="fields">
                <div className="field">
                  <div className="ui edit-tab-page-toggle toggle checkbox">
                    <input ref="showCreateButtonInput" type="checkbox" className="hidden" defaultChecked={this.props.tab.tabOptions?this.props.tab.tabOptions.showCreateButton:false}/>
                    <label>Show Create Button</label>
                  </div>
                </div>
                <div className="field">
                  <label>Create Button Label</label>
                  <input ref="createButtonLabelInput" defaultValue={this.props.tab.tabOptions?this.props.tab.tabOptions.createButtonLabel:'Create'} placeholder="Create"/>
                </div>
              </div>
            </div>
            <h4 className="ui dividing header">Misc Options</h4>
            <div className="ui segment">
              <div class="fields">
                <div className="field">
                  <div className="ui edit-tab-page-toggle toggle checkbox">
                    <input ref="showReadMoreInput" type="checkbox" className="hidden" defaultChecked={this.props.tab.tabOptions?this.props.tab.tabOptions.showReadMore:true}/>
                    <label>Show Read More for longform content</label>
                  </div>
                  <div className="ui edit-tab-page-toggle toggle checkbox">
                    <input ref="autoScrollBottomInput" type="checkbox" className="hidden" defaultChecked={this.props.tab.tabOptions?this.props.tab.tabOptions.autoScrollBottom:true}/>
                    <label>Automatic Scroll Bottom</label>
                  </div>
                </div>
                <div className="field">
                  <label>New Card Type</label>
                  <input ref="newCardTypeInput" defaultValue={this.props.tab.tabOptions?this.props.tab.tabOptions.newCardType:'comment'} placeholder="comment"/>
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
      createButtonLabel: ReactDOM.findDOMNode(this.refs.createButtonLabelInput).value.trim(),
      showReadMore: ReactDOM.findDOMNode(this.refs.showReadMoreInput).checked,
      autoScrollBottom: ReactDOM.findDOMNode(this.refs.autoScrollBottomInput).value.trim(),
      newCardType: ReactDOM.findDOMNode(this.refs.newCardTypeInput).value.trim()
    }

    if(title.length) {
      Meteor.call('tabs.update', this.props.tab._id, title, 'normal', description, icon, query, tabOptions);
      window.history.back();
    }
  }
}


export default createContainer(() => {
  let tabId = FlowRouter.getParam('tabId')
  let tabHandle = Meteor.subscribe('currentTab', tabId);
  return {
    loading: !(tabHandle.ready()),
    tab: Tabs.findOne(tabId)
  };
}, EditTabPage);
