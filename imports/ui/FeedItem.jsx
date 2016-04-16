import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';

import { Cards } from '../api/cards.js';

export default class FeedItem extends Component {

    deleteThisCard() {
        Meteor.call('cards.remove', this.props.card._id);
    }

    render() {
        const cardClassName = this.props.card.status == 'closed' ? 'checked' : '';

        return (
            <li  id="card-item" className={cardClassName}>
                <button className="delete" onClick={this.deleteThisCard.bind(this)}>
                    &times;
                </button>

                <input
                    type="checkbox"
                    readOnly
                    checked={this.props.card.status == 'closed'}
                    />
                <i className={Cards.helpers.getCardTypeIconClassName(this.props.card.type)} style={{marginLeft:'10px', color:Cards.helpers.getCardTypeIconColor(this.props.card.type), fontSize:'16px'}}></i>

                <a href={`/card/${this.props.card._id}`}>
                    <span className="text">
                        <strong>{this.props.card.content}</strong>
                    </span>
                </a>
            </li>
        );
    }
}

FeedItem.propTypes = {
    card: PropTypes.object.isRequired
};
