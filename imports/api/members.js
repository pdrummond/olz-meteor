import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Cards } from './cards';

export const Members = new Mongo.Collection('Members');

if (Meteor.isServer) {
    Meteor.publish('members', function(cardId) {
      //The members are taken from the outercard, even if the cardId is a child.
      var card = Cards.findOne(cardId);
      return Members.find({cardId:card.outerCardId});
    });
}

Meteor.methods({

    'members.insert'(username, cardId) {
      console.log("> members.insert");
        check(username, String);
        check(cardId, String);

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        if(Members.findOne({cardId, username}) != null) {
          throw new Meteor.Error('member-exists', username + " is already a member");
        }

        console.log("-- finding user with username: '" + username + "''");
        var user = Meteor.users.findOne({username});
        console.log("user: " + user);
        if(user == null) {
            throw new Meteor.Error('cannot-find-user', 'There is no account with the username: ' + username);
        }
        console.log(" -- user is: " + JSON.stringify(user));


        var now = new Date();
        var memberId = Members.insert({
            userId: user._id,
            username,
            role:'user',
            cardId,
            createdAt: now,
            updatedAt: now
        });
        console.log(" -- inserted member " + memberId);
        console.log("< members.insert");
    },

    'members.updateRole'(memberId, role) {
        console.log("> member.updateRole");
        check(memberId, String);
        check(role, String);

        if (! Meteor.userId()) {
          throw new Meteor.Error('not-authenticated');
        }

        Members.update(memberId, {$set: {
          role,
          updatedAt: new Date()
        }});
        console.log("< members.update");
    },

    'members.remove'(memberId) {
        check(memberId, String);

        var member = Members.findOne(memberId);
        var card = Cards.findOne(member.cardId);
        if(card.owner && card.owner == member.username) {
          throw new Meteor.Error('cannot-remove-owner', username + " is the card owner. Cannot remove the owner of a card");
        }

        Members.remove(memberId);
    }
});

Members.helpers = {

  getUserProfileImage(member) {
    let profileImage = '/images/user-placeholder.png';
    if(member) {
      var user = Meteor.users.findOne(member.userId);
      if(user) {
        profileImage = user.profileImage;
      }
    }
    return profileImage;
  },
}
