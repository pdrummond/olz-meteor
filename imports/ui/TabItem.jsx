import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tabs } from '../api/tabs';

export default class TabItem extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <a className={(this.props.query === this.props.tab.query)?"active item":"item"} href={`/card/${this.props.tab.cardId}?query=${encodeURIComponent(this.props.tab.query)}`}>
        <i className={this.props.tab.icon + " icon"}></i> {this.props.tab.title}
      </a>
    );
  }
}
