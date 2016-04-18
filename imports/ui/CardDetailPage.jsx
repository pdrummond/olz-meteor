import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards.js';

import MessageBox from './MessageBox';

class CardDetailPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.ui.dropdown').dropdown();
  }

  render() {
    if(this.props.loading) {
      return (
        <p>Loading...</p>
      );
    } else {
      return (
        <div id="card-detail-page">          
          <div className="ui fluid card ols-card-detail">
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

              <img className="ui avatar image" src={Cards.helpers.getUserProfileImage(this.props.currentCard)}/>
              <span className="card-header-label">
                <i className={Cards.helpers.getCardTypeIconClassName(this.props.currentCard.type)} style={{position:'relative', top:'1px', marginLeft:'10px', color:Cards.helpers.getCardTypeIconColor(this.props.currentCard.type), fontSize:'16px'}}></i>
                <span className="user-fullname-label">@{this.props.currentCard.username}</span>
                <span className="date" style={{marginLeft:'5px'}}>{moment(this.props.currentCard.createdAt).fromNow()}</span>
              </span>
            </div>
            <div className="content">
              <div className="description markdown-content">
                <div className="ui transparent fluid input">
                  <h1>{this.props.currentCard.title}</h1>
                </div>
                <div>
                  {this.props.currentCard.content}
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
          <MessageBox card={this.props.currentCard}/>
        </div>
      );
    }
  }
}

export default createContainer(() => {
  var cardId = FlowRouter.getParam('cardId');
  var cardHandle = Meteor.subscribe('currentCard', cardId);
  return {
    loading: !(cardHandle.ready()),
    currentCard: Cards.findOne(cardId),
  };
}, CardDetailPage);
