import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import React, { Component, PropTypes } from 'react';
import ProseEditor from './ProseEditor.jsx';
import { Cards } from '../api/cards';

export default class MessageBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            zenMode: false,
            createOnEnter: true,
        };
    }

    render() {
        return (
            <div className="message-box" style={{top: (this.state.zenMode?'10px':'auto')}}>
                <textarea
                    style={{height: (this.state.zenMode?'calc(100% - 40px)':'150px')}}
                    onChange={this.onChange.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)}
                    type="text"
                    name="message"
                    placeholder="Type here to add message..."
                    value={this.state.content}
                    autofocus="autofocus"
                    />
                <div>
                    <div className="ui toggle checkbox" style={{top:'8px'}}>
                        <input
                            type="checkbox"
                            checked={this.state.createOnEnter}
                            onChange={() => { this.setState({createOnEnter: !this.state.createOnEnter}) } }/>
                        <label>Press ENTER to create</label>
                    </div>
                    <div style={{float:'right'}}>
                        <button className="ui icon button" onClick={this.onToggleZenModeClicked.bind(this)}><i className="maximize icon"></i></button>
                        <button className="ui button" onClick={this.handleCreateButtonClicked.bind(this)}>Create</button>
                    </div>
                </div>
            </div>
        );
    }

    onChange(event, value) {
        if (event.target.value !== "\n") {
            this.setState({content: event.target.value});
            //this.props.onUserIsTyping();
        }
    }

    onKeyDown(event) {
        if(this.state.createOnEnter) {
            if (event.keyCode === 13 && event.shiftKey == false) {
                this.createMessageCard();
            }
        }
    }

    handleCreateButtonClicked() {
      this.createMessageCard();
    }

    createMessageCard() {
        const title = null; //title always null for message cards.
        const type = 'comment'; //message cards always default to comments.
        const content = this.state.content.trim();
        if(content.length > 0) {
            Meteor.call('cards.insert', title, content, type, this.props.card._id, function(err) {
                if(err) {
                    alert("Error adding message card: " + err.reason);
                } else {
                    this.setState({content: ''});
                    this.props.onMessageCreated();
                }
            }.bind(this));
        }
    }

    onToggleZenModeClicked() {
        var zenMode = !this.state.zenMode;
        this.setState({'zenMode': zenMode});
    }
}
