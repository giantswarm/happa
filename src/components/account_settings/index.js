'use strict';

import React from 'react';
import { Link } from 'react-router';
import Gravatar from 'react-gravatar';
import {connect} from 'react-redux';
import Button from '../button';

var AccountSettings = React.createClass({
  getInitialState: function() {
    return {
      changeEmailFormVisible: false,
      changeEmailFormValid: false,
      changeEmailFormSubmitting: false,
      changeEmailSuccess: false
    };
  },

  revealChangeEmailForm: function() {
    this.setState({
      changeEmailFormVisible: true
    }, () => {
      this.refs.new_email.focus();
    });
  },

  validateEmail: function(e) {
    var email = e.target.value;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)) {
      this.setState({
        changeEmailFormValid: true,
        newEmail: email
      });
    } else {
      this.setState({
        changeEmailFormValid: false,
        newEmail: email
      });
    };
  },

  changeEmail: function(e) {
    e.preventDefault();

    this.setState({
      changeEmailFormSubmitting: true
    });

    setTimeout(function() {
      this.setState({
        changeEmailFormSubmitting: false,
        changeEmailSuccess: true
      });
    }.bind(this), 1000);

    console.log('Changing email!');
  },

  render: function() {
    return (
      <div>
        <div className='row'>
          <div className='col-12'>
            <h1>Your Account Settings</h1>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Email</h3>
          </div>
          <div className='col-9'>
            <p>
              This address is used for logging in and for all communication. Be
              aware that it is also visible to other members of your organization.
            </p>

            {
              (() => {
                if (this.state.changeEmailSuccess) {
                  return (
                    <p className='success'>We have just sent an email to <b>{this.state.newEmail}</b> with a confirmation link.
                    Please click that link to confirm the email change. Until then, your old address
                    will remain in place.</p>
                  )
                } else if (this.state.changeEmailFormVisible) {
                  return (
                    <div>
                      <form onSubmit={this.changeEmail}>
                        <div className='textfield'>
                          <label>New Email</label>
                          <input ref='new_email' onChange={this.validateEmail} type="text"/>
                          <Button type='submit'
                                  bsStyle='primary'
                                  disabled={!this.state.changeEmailFormValid}
                                  loading={this.state.changeEmailFormSubmitting}>Confirm New Email</Button>
                        </div>
                      </form>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <p>
                        <span className='email-gravatar'><Gravatar email='brad@example.com' https size={100} default='mm' /></span>
                        <span className='email-email'>brad@example.com</span>
                      </p>
                      <Button bsStyle='primary' onClick={this.revealChangeEmailForm}>Replace Email</Button>
                    </div>
                  );
                }
              })()
            }

          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Name</h3>
          </div>
          <div className='col-9'>
            <p>
              Your name, for our communication with you.
            </p>

            <form>
              <div className='textfield small'>
                <label>First Name</label>
                <input id='first_name' ref='first_name'/>
              </div>

              <div className='textfield small'>
                <label>Last Name</label>
                <input id='last_name' ref='first_name'/>
              </div>
            </form>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Username</h3>
          </div>
          <div className='col-9'>
            <p>
              The username will be displayed to other members of your organizations.
              You can also use it for signing in, to avoid typing your email
              address.
            </p>

            <form>
              <div className='textfield small'>
                <label>Username</label>
                <input id='username' ref='username'/>
              </div>
            </form>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Password</h3>
          </div>
          <div className='col-9'>
            <p>
              Use this form to change your password.
            </p>

            <form>
              <div className='textfield small'>
                <label>Current Password</label>
                <input id='current_password' ref='current_password'/>
              </div>

              <div className='textfield small'>
                <label>New Password</label>
                <input id='new_password' ref='new_password'/>
              </div>

              <div className='textfield small'>
                <label>New Password (once more)</label>
                <input id='new_password_confirmation' ref='new_password_confirmation'/>
              </div>
            </form>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Subscriptions</h3>
          </div>
          <div className='col-9'>
            <p>
              Configure here which type of email you want to recieve from us.
            </p>

            <form>
              <div className='textfield small'>
                <label>Current Password</label>
                <input id='current_password' ref='current_password'/>
              </div>

              <div className='textfield small'>
                <label>New Password</label>
                <input id='new_password' ref='new_password'/>
              </div>

              <div className='textfield small'>
                <label>New Password (once more)</label>
                <input id='new_password_confirmation' ref='new_password_confirmation'/>
              </div>
            </form>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Delete Account</h3>
          </div>
          <div className='col-9'>
            <p>
              Please send an email to <a href='mailto:support@giantswarm.io?subject=Please delete my account'>support@giantswarm.io</a> to delete your account.
            </p>
          </div>
        </div>
      </div>
    );
  }
});

function mapStateToProps(state, ownProps) {
  return {
    user: state.app.loggedInUser
  };
}

module.exports = connect(mapStateToProps)(AccountSettings);