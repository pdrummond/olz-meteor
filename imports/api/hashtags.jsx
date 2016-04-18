import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import React, { Component, PropTypes } from 'react';
import { check, Match } from 'meteor/check';
import { slugify } from 'underscore.string';

export const Hashtags = new Mongo.Collection('Hashtags');

if (Meteor.isServer) {
  Meteor.publish('hashtags', function() {
    return Hashtags.find();
  });
}

Meteor.methods({

  'hashtags.insert'(hashtag, cardId) {
    console.log("> hashtags.insert");
    check(hashtag, String);
    check(cardId, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }
    let name = slugify(hashtag);
    let type = 'basic';
    let value = null;
    let intValue = null;
    let floatValue = null;
    if(hashtag.indexOf(':') != -1) {
      type = 'value-string';
      let split = hashtag.split(':');
      name = split[0];
      value = split[1];
      floatValue = parseFloat(value);
      if(isNan(floatValue)) {
        floatValue = null;
        intValue = parseInt(value);
        if(isNan(intValue)) {
          intValue = null;
        } else {
          type = 'value-int';
        }
      } else {
        type = 'value-float';
      }
    }
    const now = new Date();
    var tag = {
      cardId,
      name,
      type,
      value,
      intValue,
      floatValue,
      userId: Meteor.userId(),
      username: Meteor.user().username,
      createdAt: now
    };
    console.log("--- tag: " + JSON.stringify(tag, null, 2));
    var hashtagId = Hashtags.insert(tag);
    console.log("< hashtags.insert");
    return hashtagId;
  },

  'hashtags.remove'(hashtagId) {
    check(hashtagId, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    var hashtag = Hashtags.findOne(hashtagId);
    if(hashtag.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'Only the owner of the hashtag can delete it');
    }

    Hashtags.remove(hashtagId);
  }
});
