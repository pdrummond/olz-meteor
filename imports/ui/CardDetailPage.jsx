import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Cards } from '../api/cards';

import MessageBox from './MessageBox';
import MessageItem from './MessageItem';

class CardDetailPage extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $('.ui.dropdown').dropdown();
  }

  render() {
    return (
      <div id="card-detail-page" className="full-height">
        <div className={this.props.loading?"ui vertical loading segment full-height":"ui vertical segment full-height"} style={{padding:'0px'}}>
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
              {!this.props.loading?
                <span className="card-header-label">
                  <i className={Cards.helpers.getCardTypeIconClassName(this.props.currentCard.type)} style={{position:'relative', top:'1px', marginLeft:'10px', color:Cards.helpers.getCardTypeIconColor(this.props.currentCard.type), fontSize:'16px'}}></i>
                  <span className="user-fullname-label">@{this.props.currentCard.username}</span>
                  <span className="date" style={{marginLeft:'5px'}}>{moment(this.props.currentCard.createdAt).fromNow()}</span>
                  {Cards.helpers.renderCardKeySpan(this.props.currentCard)}
                </span>:''}
              </div>
              <div className="content">
                <div className="description markdown-content">
                  <div className="ui transparent fluid input">
                    <h1>{!this.props.loading?this.props.currentCard.title:""}</h1>
                  </div>
                  <div>
                    {!this.props.loading?this.props.currentCard.content:""}
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
            <div id="message-list" ref="messageList" className="ui feed">
              {this.renderMessageItems()}
            </div>
            <MessageBox card={this.props.currentCard} onMessageCreated={this.scrollBottom.bind(this)}/>
        </div>
      </div>
      );
    }

    renderMessageItems() {
      return this.props.messageCards.map((card) => (
        <MessageItem key={card._id} card={card}/>
      ));
    }

    scrollBottom(callback) {
        var self = this;
        setTimeout(function() {
            let node = ReactDOM.findDOMNode(self.refs.messageList);
            node.scrollTop = node.scrollHeight;
            if(callback) {
                callback();
            }
        }, 20);
    }
  }

  export default createContainer(() => {
    var cardId = FlowRouter.getParam('cardId');
    var cardHandle = Meteor.subscribe('currentCard', cardId);
    var messageCardsHandle = Meteor.subscribe('messageCards', cardId);
    var data = {
      loading: !(cardHandle.ready() && messageCardsHandle.ready()),
      currentCard: Cards.findOne(cardId),
      messageCards: Cards.find({parentCardId: cardId}).fetch()
    };
    return data;
  }, CardDetailPage);
