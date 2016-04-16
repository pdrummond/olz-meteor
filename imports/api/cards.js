import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Cards = new Mongo.Collection('Cards');

if (Meteor.isServer) {
    Meteor.publish('cards', function() {
        return Cards.find();
    });
}

Meteor.methods({

    'cards.insert'(content) {
        check(content, String);
        check(subjectId, String);

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authenticated');
        }

        const now = new Date();
        var cardId = Cards.insert({
            content,
            createdAt: now,
            updatedAt: now,
            userId: Meteor.userId(),
            username: Meteor.user().username,
        });
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
    }
});
