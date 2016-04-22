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
      <a className={(this.props.query === this.props.tab.query)?"active item":"item"} href={this.getTabLink()}>
        <i className={this.props.tab.icon + " icon"}></i> {this.props.tab.title}
      </a>
    );
  }

  getTabLink() {
    if(this.props.tab.type == 'normal') {
      return `/card/${this.props.tab.cardId}?query=${encodeURIComponent(this.props.tab.query)}`;
    } else if(this.props.tab.type == 'user') {
      return `/?query=${encodeURIComponent(this.props.tab.query)}`;
    }
  }
}
