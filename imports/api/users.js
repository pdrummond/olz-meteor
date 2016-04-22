import { Accounts } from 'meteor/accounts-base';
import {Gravatar} from 'meteor/jparker:gravatar';
import { Tabs } from '../api/tabs';

if(Meteor.isServer) {
    Meteor.publish("userData", function () {
        return Meteor.users.find({}, {fields: {
            "username": 1,
            "profileImage": 1
        }});
    });
}

Accounts.onCreateUser(function(options, user) {
    // Generate a user ID ourselves as we will be using it for the group member.
    user._id = Random.id();

    var email;
    if(user.emails) {
        email = user.emails[0].address;
    }

    //TODO: This is temporarily.  Eventually we will support custom profile images
    //where users can upload their own pics or we will take the pic from google/fb account
    //if user has connected their accounts.  For now, during MVP - gravatar will do.
    user.profileImage = Gravatar.imageUrl(email, {size: 50, default: 'wavatar'});

    if (options.profile) {
        user.profile = options.profile;
    }

    //Add a default user tab.
    let now = new Date();
    Tabs.insert({null, title:'All',type:'user',description:'', icon:'circle',query:'', null, userId: user._id, username: user.username, createdAt: now, updatedAt: now});

    return user;
});
