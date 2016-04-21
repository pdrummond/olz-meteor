import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import { Cards } from './cards';

export const Favourites = new Mongo.Collection('Favourites');

if (Meteor.isServer) {
    Meteor.publish('favourites', function() {
      return Favourites.find({userId:this.userId});
    });
}

Meteor.methods({

    'favourites.insert'(cardId) {
      console.log("> favourites.insert");
        check(cardId, String);

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        var card = Cards.findOne(cardId);
        if(card == null) {
            throw new Meteor.Error('card-not-found', 'Cannot find card for id=' + cardId);
        }

        var user = Meteor.user();

        var now = new Date();
        var favouriteId = Favourites.insert({
            cardId,
            title: card.title,
            type: card.type,
            userId: user._id,
            username: user.username,
            createdAt: now,
            updatedAt: now
        });
        console.log(" -- added favourite " + favouriteId);
        console.log("< favourites.insert");
    },

    'favourites.remove'(cardId) {
        check(cardId, String);

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Favourites.remove({cardId: cardId});
    }
});
