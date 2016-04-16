import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { Component, PropTypes } from 'react';
import { mount } from 'react-mounter';

import MainLayout from '../../ui/MainLayout.jsx';

import FeedPage from '../../ui/FeedPage.jsx';
import CreateCardPage from '../../ui/CreateCardPage.jsx';

import JoinPage from '../../ui/JoinPage.jsx';
import LoginPage from '../../ui/LoginPage.jsx';

FlowRouter.route('/', {
    name: 'feedPage',
    action() {
        mount(MainLayout, {
            main: () => <FeedPage/>
        });
    },
});

FlowRouter.route('/card/create', {
    name: 'feedPage',
    action() {
        mount(MainLayout, {
            main: () => <CreateCardPage/>
        });
    },
});


FlowRouter.route('/join', {
    name: 'join',
    action() {
        mount(JoinPage, {
            main: () => <JoinPage/>
        });
    }
});

FlowRouter.route('/login', {
    name: 'login',
    action() {
        mount(LoginPage, {
            main: () => <LoginPage/>
        });
    }
});
