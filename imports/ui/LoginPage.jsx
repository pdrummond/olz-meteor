import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            emailError: false,
            passwordError: false
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        const email = this.refs.email.value;
        const password = this.refs.password.value;
        const errors = {};

        errors.emailError = !email;
        errors.passwordError = !password;

        this.setState(errors);
        if(errors.emailError == false && errors.passwordError == false) {
            Meteor.loginWithPassword(email, password, err => {
                if (err) {
                    this.setState({errorMessage: err.reason });
                } else {
                    FlowRouter.go('/');
                }
            });
        }
    }

    render() {
        return (
            <div className="ui container" style={{width:'400px', marginTop:'50px'}}>
                <h1 className="ui teal image header">
                    Login.
                </h1>
                <form className="ui form"  onSubmit={this.handleSubmit.bind(this)}>
                    <div className="ui segment">
                        <div className={this.state.emailError?'field error':'field'}>
                            <div className="ui left icon fluid input">
                                <i className="at icon"></i>
                                <input autoFocus ref="email" type="email" name="email" placeholder="E-mail address"/>
                            </div>
                        </div>
                        <div className={this.state.passwordError?'field error':'field'}>
                            <div className="ui left icon fluid input">
                                <i className="lock icon"></i>
                                <input ref="password" type="password" name="password" placeholder="Password"/>
                            </div>
                        </div>
                        <button type='submit' className="ui fluid large teal submit button">Login</button>
                        <p style={{marginTop:'20px', color:'red'}}>{this.state.errorMessage}</p>
                    </div>
                </form>
                <p style={{color:'lightgray', padding:'20px'}}>If you don't have an account yet, you can join us <a href="/join">here</a>.</p>
            </div>
        );
    }
}

LoginPage.contextTypes = {
    router: React.PropTypes.object,
};
