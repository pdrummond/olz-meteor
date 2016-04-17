import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import {moment} from 'meteor/momentjs:moment';

import { Cards } from '../api/cards.js';

export default class FeedItem extends Component {

    deleteThisCard() {
        Meteor.call('cards.remove', this.props.card._id);
    }

    render() {
        return (
          <div className="ui fluid card ols-card">
            <div className="content">
              <div className="ui right floated icon top left pointing dropdown mini basic button">
                <i className="vertical ellipsis icon"></i>
                <div className="menu">
                  <div className="item">Edit Card</div>
                  <div className="item">Archive Card</div>
                  <div className="divider"></div>
                  <div className="item">Delete Card</div>
                </div>
              </div>

              <img className="ui avatar image" src={Cards.helpers.getUserProfileImage(this.props.users, this.props.card)}/>
              <span className="card-header-label">
                <i className={Cards.helpers.getCardTypeIconClassName(this.props.card.type)} style={{position:'relative', top:'1px', marginLeft:'10px', color:Cards.helpers.getCardTypeIconColor(this.props.card.type), fontSize:'16px'}}></i>
                <span className="user-fullname-label">@{this.props.card.username}</span>
                <span className="date" style={{marginLeft:'5px'}}>{moment(this.props.card.createdAt).fromNow()}</span>
              </span>
              </div>
              <div className="content">
                <div className="description markdown-content">
                  <div className="ui transparent fluid input">
                    <h1>{this.props.card.title}</h1>
                  </div>
                  <div>
                    {this.props.card.content}
                  </div>
                </div>
              </div>
              <div className="extra content footer">
                <div className="ui icon top left pointing dropdown mini basic button">
                  <i className="slack icon popup-label" title="Hashtag options"></i>
                  <div className="menu">
                    <div className="item">
                      Add Hashtag
                    </div>
                    <div className="divider"></div>
                    <div className="ui left large icon input">
                      <i className="slack icon"></i>
                      <input type="text" placeholder="Add tag here"/>
                    </div>
                  </div>
                </div>
                      <div className="ui right floated icon top left pointing dropdown mini basic button">
                        <i className="users icon" title="Add Members"></i>
                        <div className="menu">
                          <div className="item">Jenny Hess</div>
                          <div className="item">Harold Tester</div>
                          <div className="divider"></div>
                          <div className="ui left large icon input">
                            <i className="users icon"></i>
                            <input type="text" placeholder="Add member here"/>
                          </div>
                        </div>
                      </div>
              </div>
            </div>
        );
    }
}

FeedItem.propTypes = {
    card: PropTypes.object.isRequired
};
