import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Favourites } from '../api/favourites';

import { Cards } from '../api/cards';

export default class FavouriteItem extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <a href={`/card/${this.props.favourite.cardId}`}>
        <li className={this.props.cardId == this.props.favourite.cardId?'active':''}><i className={Cards.helpers.getCardTypeIconClassName(this.props.favourite.type)}></i>{this.props.favourite.title}</li>
      </a>
    );
  }
}
