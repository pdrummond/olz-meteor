import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import React, { Component, PropTypes } from 'react';
import { check, Match } from 'meteor/check';
import { slugify } from 'underscore.string';
import { Members } from './members';
import { Hashtags } from './hashtags';
import { Tabs } from './tabs';
import SearchUtils from '../utils/SearchUtils';

export const Cards = new Mongo.Collection('Cards');

if (Meteor.isServer) {
  Meteor.publish('homeCards', function(opts) {
    return SearchUtils.filterCards(this.userId, opts, 'homeCards');
  });

  Meteor.publish('messageCards', function(opts) {
    return SearchUtils.filterCards(this.userId, opts, 'messagesCards');
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
    let idealKey = title && title.length > 3 ? title.substring(0, 5) : (content && content.length > 3 ? content.substring(0, 10) : 'CARD'); //CARD is default key if there isn't enough title or content (which is unlikely but possible so we have to consider it here!)
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

    let owner = null;
    if(!parentCardId) {
      owner = Meteor.user().username;
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
      isOpen:true,
      outerCardId,
      parentCardId,
      owner,
      createdAt: now,
      updatedAt: now,
      userId: Meteor.userId(),
      username: Meteor.user().username
    });
    //Update the parent card when a child is added so it appears at the top home list - but earlier than the newly added innercard, hence the need to tweak the date a bit ;-)
    //UPDATE: Decided to not do this for now to see if it's better without it.
    /*if( cardId != null && parentCardId != null) {
        let parentUpdatedAt = new Date(now.getTime() - 5);
        console.log("-- updating parent card with timestamp of " + parentUpdatedAt);
        Cards.update(parentCardId, { $set: {updatedAt: parentUpdatedAt}});
    }*/
    //If this is an outercard, then add the owner as a member.
    if(cardId != null && parentCardId == null) {
      Members.insert({
          userId: Meteor.userId(),
          username: Meteor.user().username,
          role:'owner',
          cardId,
          createdAt: now,
          updatedAt: now
      });
    }
    //Add default tabs for card
    if(cardId != null) {
      console.log("-- addeding default tabs");
      let allTabOptions = {showMessageBox: true, showCreateButton:true, messageButtonLabel:'Add Message', createButtonLabel:'Create'};
      let commentTabOptions = {showMessageBox: true, showCreateButton:false, messageButtonLabel:'Add Comment', createButtonLabel:'Create'};

      Tabs.insert({cardId,title:'All',type:'normal',description:'', icon:'circle',query:'', tabOptions: allTabOptions, userId: Meteor.userId(), username: Meteor.user().username, createdAt: now,updatedAt: now});
      Tabs.insert({cardId,title:'Comments',type:'normal',description:'', icon:'comments',query:'type:comment', tabOptions: commentTabOptions, userId: Meteor.userId(),username: Meteor.user().username, createdAt: now,updatedAt: now});
    }
    console.log("< cards.insert");
    return cardId;
  },

  'cards.update'(cardId, title, content, type) {
    console.log("> cards.update");
    check(cardId, String);
    check(title, Match.Optional(String));
    check(content, String);
    check(type, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    Cards.update(cardId, { $set: {
      title,
      content,
      type,
      updatedAt: new Date(),
      updatedByUserId: Meteor.userId(),
      updatedByUsername: Meteor.user().username
    }});
  },

  'cards.toggleOpen'(cardId) {
    check(cardId, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    var card = Cards.findOne(cardId);
    if(card == null) {
      throw new Meteor.Error('card-not-found', 'No card found with id=' + cardId);
    }

    Cards.update(cardId, { $set: {
      isOpen: !card.isOpen,
      updatedAt: new Date(),
      updatedByUserId: Meteor.userId(),
      updatedByUsername: Meteor.user().username
    }});
  },

  'cards.updateKey'(cardId, key) {
    console.log("> cards.updateKey");
    check(cardId, String);
    check(key, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    key = slugify(key.trim()).replace('-', '').toUpperCase();

    if(Cards.findOne({key}) != null) {
      throw new Meteor.Error('key-exists', 'Sorry, "' + key + '" has already been taken');
    }

    Cards.update(cardId, { $set: {
      key,
      updatedAt: new Date(),
      updatedByUserId: Meteor.userId(),
      updatedByUsername: Meteor.user().username
    }});

    console.log("< cards.updateKey");
  },

  'cards.remove'(cardId) {
    check(cardId, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    var card = Cards.findOne(cardId);
    if(card.userId !== this.userId) {
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

      Cards.update(cardId, { $set: { type, updatedAt: new Date() } });
  },

  'cards.getHandle'(cardId) {
    let card = Cards.findOne(cardId);
    let outerCard = Cards.findOne(card.outerCardId);
    return `#${outerCard.key}-${card.seq}`;
  },

  'cards.move'(cardId, parentHandle) {
    console.log("> cards.move");
    check(cardId, String);
    check(parentHandle, String);

    if (! Meteor.userId()) {
        throw new Meteor.Error('not-authenticated');
    }

    parentHandle = parentHandle.trim();
    if(parentHandle.length == 0 || parentHandle.indexOf('-') == -1 || parentHandle.split("-").length != 2) {
      throw new Meteor.Error('invalid-handle', '"' + parentHandle + '" is not a valid card handle');
    }
    let split = parentHandle.split("-");
    let key = split[0].replace('#', '').toUpperCase();
    let seq = parseInt(split[1].replace('-', ''));

    if(isNaN(seq)) {
      throw new Meteor.Error('invalid-seq', '"' + parentHandle + '" is not a valid card number');
    }

    console.log("-- key for new parent card is: " + key);
    console.log("-- seq for new parent card is: " + seq);

    var card = Cards.findOne(cardId);
    console.log("card: " + JSON.stringify(card, null, 2));
    var outerCard = Cards.findOne(card.outerCardId);
    console.log('outerCard:' + JSON.stringify(outerCard, null, 2));
    if(outerCard.key !== key) {
      throw new Meteor.Error('keys-mismatch', "Cannot move a card to a different outercard");

      /*
        For now, we don't allow moving cards to different outercards, but adding
        this feature woudln't be too hard as long as the user is aware the seq
        of the card would have to change.

        To do this, we need to get the latest sew for the new outer card, so
        we need to get the newOuterCard somehow, then just get the count like
        so:
      */
      //seq = Cards.find({newOuterCard._id}).count()+1;
    }

    var newParentCard = Cards.findOne({outerCardId: outerCard._id, seq});

    console.log("OLS-1: " + JSON.stringify(Cards.findOne('kjz2Re66igYRJKGsk'), null, 2));

    if(newParentCard != null) {
      console.log('-- found parent with id ' + newParentCard._id);
      Cards.update(cardId, { $set: { parentCardId:newParentCard._id, updatedAt: new Date() } });
    } else {
      throw new Meteor.Error('parent-card-not-found', "Could not find card for key=" + key + ", seq=" + seq);
    }

    console.log("< cards.move");
  },

  'cards.getDefaultTab'(cardId) {
    let tab = null;
    const tabs = Tabs.find({cardId}, {sort: {createdAt:1}}).fetch();
    if(tabs.length > 0) {
      tab = tabs[0];
    }
    console.log("default tab: " + JSON.stringify(tab, null, 2));
    return tab;
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
      case 'organisation': typeClassName = 'building outline'; break;
      case 'repo': typeClassName = 'code'; break;
      case 'project': typeClassName = 'adjust'; break;
      case 'milestone': typeClassName = 'flag'; break;
      case 'discussion': typeClassName = 'comments'; break;
      case 'story': typeClassName = 'newspaper'; break;
      case 'journal': typeClassName = 'book'; break;
      case 'card': typeClassName = 'square'; break;

      case 'comment': typeClassName = 'comment'; break;
      case 'task': typeClassName = 'warning circle'; break;
      case 'feature': typeClassName = 'bullseye'; break;
      case 'problem': typeClassName = 'bomb'; break;
      case 'bug': typeClassName = 'bug'; break;

      case 'question': typeClassName = 'help circle'; break;
      case 'idea': typeClassName = 'idea'; break;

      case 'announcement': typeClassName = 'announcement'; break;

      case 'channel': typeClassName = 'square'; break;

    }
    return "icon " + typeClassName;
  },

  getCardTypeIconColor(type) {
    let color = 'black';
    switch(type) {
      case 'discussion': color = '#026AA7'; break;
      case 'project': color = '#2196F3'; break;
      case 'story': color = '#00BCD4'; break;
      case 'journal': color = '#375BC8'; break;
      case 'card': color = 'black'; break;

      case 'comment': color = '#009688'; break;
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
