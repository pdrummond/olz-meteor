import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import React, { Component, PropTypes } from 'react';
import { check, Match } from 'meteor/check';

export const Tabs = new Mongo.Collection('Tabs');

if (Meteor.isServer) {
  Meteor.publish('tabs', function(cardId) {
    return Tabs.find({cardId});
  });

  Meteor.publish('userTabs', function() {
    return Tabs.find({userId: this.userId, type:'user'});
  });

  Meteor.publish('currentTab', function(tabId) {
    return Tabs.find({_id: tabId});
  });
}

Meteor.methods({

  'tabs.insert'(title, type, description, icon, query, cardId, tabOptions) {
    console.log("> tabs.insert");
    check(title, String);
    check(type, String);
    check(description, String);
    check(icon, String);
    check(query, String);
    check(cardId, Match.Optional(String));
    check(tabOptions, Match.Optional(Object));

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }
    const now = new Date();
    var tabId = Tabs.insert({
      cardId,
      title,
      type,
      description,
      icon,
      query,
      tabOptions,
      userId: Meteor.userId(),
      username: Meteor.user().username,
      createdAt: now,
      updatedAt: now
    });
    console.log("< tabs.insert");
    return tabId;
  },

  'tabs.update'(tabId, title, type, description, icon, query, tabOptions) {
    console.log("> tabs.update");
    check(tabId, String);
    check(title, String);
    check(type, String);
    check(description, String);
    check(icon, String);
    check(query, String);
    check(tabOptions, Object);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }
    const now = new Date();
    Tabs.update(tabId, {$set: {
      title,
      type,
      description,
      icon,
      query,
      tabOptions,
      updatedAt: now
    }});
    console.log("< tabs.update");
  },

  'tabs.remove'(tabId) {
    check(tabId, String);

    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authenticated');
    }

    var tab = Tabs.findOne(tabId);
    if(tab.userId !== this.userId) {
      throw new Meteor.Error('not-authorized', 'Only the owner of the tab can delete it');
    }

    Tabs.remove(tabId);
  }
});
