import React from 'react';
import { Accounts } from 'meteor/accounts-base';

export default class JoinPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: '',
            usernameError: false,
            emailError: false,
            passwordError: false,
            confirmError: false
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        const username = this.refs.username.value;
        const email = this.refs.email.value;
        const password = this.refs.password.value;
        const confirm = this.refs.confirm.value;
        const errors = {};

        errors.usernameError = !username;
        errors.emailError = !email;
        errors.passwordError = !password;
        errors.confirmError = confirm !== password;

        this.setState(errors);
        if(errors.usernameError == false && errors.emailError == false && errors.passwordError == false && errors.confirmError == false ) {
            Accounts.createUser({
                username,
                email,
                password
            }, err => {
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
                    Join us.
                </h1>
                <form className="ui form"  onSubmit={this.handleSubmit.bind(this)}>
                    <div className="ui segment">
                        <div className={this.state.usernameError?'field error':'field'}>
                            <div className="ui left icon fluid input">
                                <i className="user icon"></i>
                                <input ref="username" type="text" name="username" placeholder="Username" autoFocus/>
                            </div>
                        </div>
                        <div className={this.state.emailError?'field error':'field'}>
                            <div className="ui left icon fluid input">
                                <i className="at icon"></i>
                                <input ref="email" type="email" name="email" placeholder="E-mail address"/>
                            </div>
                        </div>
                        <div className={this.state.passwordError?'field error':'field'}>
                            <div className="ui left icon fluid input">
                                <i className="lock icon"></i>
                                <input ref="password" type="password" name="password" placeholder="Password"/>
                            </div>
                        </div>
                        <div className={this.state.confirmError?'field error':'field'}>
                            <div className="ui left icon fluid input">
                                <i className="lock icon"></i>
                                <input ref="confirm" type="password" name="password" placeholder="Confirm Password"/>
                            </div>
                        </div>
                        <button type='submit' className="ui fluid large teal submit button">Join</button>
                        <p style={{marginTop:'20px', color:'red'}}>{this.state.errorMessage}</p>
                    </div>
                </form>
                <p style={{color:'lightgray', padding:'20px'}}>If you already have an account with us then you can login <a href="/login">here</a>.</p>
            </div>
        );
    }
}

JoinPage.contextTypes = {
    router: React.PropTypes.object,
};
