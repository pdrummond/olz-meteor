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

    'cards.insert'(title, content) {
        check(title, String)
        check(content, String);

        if (! Meteor.userId()) {
            throw new Meteor.Error('not-authenticated');
        }

        const now = new Date();
        var cardId = Cards.insert({
            title,
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

Cards.helpers = {
    getCardTypeIconClassName(type) {
        var typeClassName = 'discussion';
        switch(type) {
            case 'discussion': typeClassName = 'comments'; break;
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
        let color = 'black';
        switch(type) {
            case 'discussion': color = '#026AA7'; break;
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
    }
}
