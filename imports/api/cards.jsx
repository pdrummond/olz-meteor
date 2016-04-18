import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import React, { Component, PropTypes } from 'react';
import { check, Match } from 'meteor/check';
import { slugify } from 'underscore.string';

import { Hashtags } from './hashtags';
import SearchUtils from '../utils/SearchUtils';

export const Cards = new Mongo.Collection('Cards');

if (Meteor.isServer) {
  Meteor.publish('cards', function(opts) {
    return SearchUtils.filterCards(opts);
  });

  //Publish card and all its children
  Meteor.publish('currentCard', function(cardId) {
    var card = Cards.findOne(cardId);
    if(card) {
      return Cards.find({outerCardId: card.outerCardId});
    } else {
      this.ready();
    }
  });
}

Meteor.methods({

  'cards.insert'(title, content, type, parentCardId) {
    console.log("> cards.insert");
    check(title, Match.Optional(String));
    check(content, String);
    check(type, String);
    check(parentCardId, Match.Optional(String));

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    /*
      Firstly, we need to set up all the IDs.  We explicitly generate a random card id here (_id)
      so we can set the outerCardId to the card id if this is the outer card.  If this card isn't
      the outer card, then we need to get the outercard ID from the parent card.
    */
    let _id = Random.id();
    let outerCardId = _id;
    if(parentCardId) {
      var parentCard = Cards.findOne(parentCardId);
      outerCardId = parentCard.outerCardId;
    }

    /*
    If this is an outercard, then we need to generate a key from the
    title or the content then set the seq to 1 (outercard is always 1).

    If this is an innercard, then we just need to set the 'seq' which is
    the count of all the cards belonging to the same outercard.
    */
    let key = null;
    let seq = null;
    let idealKey = title && title.length > 3 ? title : (content && content.length > 3 ? content.substring(0, 10) : 'CARD'); //CARD is default key if there isn't enough title or content (which is unlikely but possible so we have to consider it here!)
    idealKey = slugify(idealKey).replace('-', '').toUpperCase();
    if(!parentCardId) {
      //Generate a unique key for the card
      let nextNumber = 2;
      key = idealKey;
      while (!!Cards.findOne({key})) {
        key = `${idealKey}${nextNumber}`;
        nextNumber++;
      }
      seq = 1;  //The outer card is always the first seq.
    } else {
      seq = Cards.find({outerCardId}).count()+1;
    }

    console.log("-- parentCardId: " + parentCardId);
    console.log("-- outerCardId: " + outerCardId);

    const now = new Date();
    var cardId = Cards.insert({
      _id,
      title,
      content,
      type,
      key,
      seq,
      outerCardId,
      parentCardId,
      createdAt: now,
      updatedAt: now,
      userId: Meteor.userId(),
      username: Meteor.user().username
    });
    console.log("< cards.insert");
    return cardId;
  },

  'cards.remove'(cardId) {
    check(cardId, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    var card = Cards.findOne(cardId);
    if(card.owner !== this.userId) {
      throw new Meteor.Error('not-authorized', 'Only the owner of the card can delete it');
    }

    Cards.remove(cardId);
  },

  'cards.updateType'(cardId, type) {
      check(cardId, String);
      check(type, String);

      if (! Meteor.userId()) {
          throw new Meteor.Error('not-authenticated');
      }

      Cards.update(cardId, { $set: { type } });
  }

});

Cards.helpers = {

  getUserProfileImage(card) {
    let profileImage = '/images/user-placeholder.png';
    if(card) {
      var user = Meteor.users.findOne(card.userId);
      if(user) {
        profileImage = user.profileImage;
      }
    }
    return profileImage;
  },

  getCardTypeIconClassName(type) {
    var typeClassName = 'comments';
    switch(type) {
      case 'discussion': typeClassName = 'comments'; break;
      case 'comment': typeClassName = 'comment'; break;
      case 'story': typeClassName = 'newspaper'; break;
      case 'journal': typeClassName = 'book'; break;

      case 'task': typeClassName = 'warning circle'; break;
      case 'feature': typeClassName = 'bullseye'; break;
      case 'problem': typeClassName = 'bomb'; break;
      case 'bug': typeClassName = 'bug'; break;

      case 'question': typeClassName = 'help circle'; break;
      case 'idea': typeClassName = 'lightning'; break;

      case 'announcement': typeClassName = 'announcement'; break;

      case 'channel': typeClassName = 'square'; break;

    }
    return "icon " + typeClassName;
  },

  getCardTypeIconColor(type) {
    let color = '#BABABA';
    switch(type) {
      case 'discussion': color = '#026AA7'; break;
      case 'comment': color = '#009688'; break;
      case 'story': color = '#00BCD4'; break;
      case 'journal': color = '#375BC8'; break;

      case 'task': color = '#8BC34A'; break;
      case 'feature': color = '#9C27B0'; break;
      case 'problem': color = '#EB0000'; break;
      case 'bug': color = '#FF5722'; break;

      case 'question': color = '#A89B2F'; break;
      case 'idea': color = '#795548'; break;

      case 'announcement': color = '#AC2AAC'; break;

      case 'channel': color = 'black'; break;
    }
    return color;
  },

  getCardKey(card) {
    var outerCard = Cards.findOne(card.outerCardId);
    if(outerCard) {
      return outerCard.key;
    } else {
      return '???';
    }
  },

  renderCardKeySpan(card, level) {
    var key = this.getCardKey(card);
    var keySpans = [];
    var currentLevel = 0;
    level = level || 10;
    do {
      keySpans.unshift(<a key={Random.id()} href={`/card/${card._id}`} className="card-key">#{key}-{card.seq}</a>);
      card = Cards.findOne(card.parentCardId);
      currentLevel++;
      if(card && currentLevel < level) {
        keySpans.unshift(<span key={Random.id()}> → </span>);
      }

    } while(card && currentLevel < level);

    return <span style={{marginLeft:'5px'}} className="card-key-wrapper">{keySpans} </span>;
  }
}
