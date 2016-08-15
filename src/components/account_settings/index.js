"use strict";

var React               = require('react');
var {Link}              = require('react-router');
var flashMessageActions = require('../../actions/flash_message_actions');
var FlashMessage = require("../flash_messages/flash_message");
var Gravatar = require("react-gravatar");

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-3">
          </div>
          <div className="col-9">
            <h1>Your Account Settings</h1>
          </div>
        </div>

        <div className="row section">
          <div className="col-3">
            <h3 className="table-label">Email</h3>
          </div>
          <div className="col-9">
            <p>
              This address is used for logging in and for all communication. Be
              aware that it is also visible to other members of your organization.
            </p>

            <p>
              <span className="email-gravatar"><Gravatar email="brad@example.com" https size={100} default="mm" /></span>
              <span className="email-email">brad@example.com</span>
            </p>
            <button>Replace Email</button>
          </div>
        </div>

        <div className="row section">
          <div className="col-3">
            <h3 className="table-label">Name</h3>
          </div>
          <div className="col-9">
            <p>
              Your name, for our communication with you.
            </p>

            <form>
              <div className="textfield small">
                <label>First Name</label>
                <input id="first_name" ref="first_name"/>
              </div>

              <div className="textfield small">
                <label>Last Name</label>
                <input id="last_name" ref="first_name"/>
              </div>
            </form>
          </div>
        </div>

        <div className="row section">
          <div className="col-3">
            <h3 className="table-label">Username</h3>
          </div>
          <div className="col-9">
            <p>
              The username will be displayed to other members of your organizations.
              You can also use it for signing in, to avoid typing your email
              address.
            </p>

            <form>
              <div className="textfield small">
                <label>Username</label>
                <input id="username" ref="username"/>
              </div>
            </form>
          </div>
        </div>

        <div className="row section">
          <div className="col-3">
            <h3 className="table-label">Password</h3>
          </div>
          <div className="col-9">
            <p>
              Use this form to change your password.
            </p>

            <form>
              <div className="textfield small">
                <label>Current Password</label>
                <input id="current_password" ref="current_password"/>
              </div>

              <div className="textfield small">
                <label>New Password</label>
                <input id="new_password" ref="new_password"/>
              </div>

              <div className="textfield small">
                <label>New Password (once more)</label>
                <input id="new_password_confirmation" ref="new_password_confirmation"/>
              </div>
            </form>
          </div>
        </div>

        <div className="row section">
          <div className="col-3">
            <h3 className="table-label">Subscriptions</h3>
          </div>
          <div className="col-9">
            <p>
              Configure here which type of email you want to recieve from us.
            </p>

            <form>
              <div className="textfield small">
                <label>Current Password</label>
                <input id="current_password" ref="current_password"/>
              </div>

              <div className="textfield small">
                <label>New Password</label>
                <input id="new_password" ref="new_password"/>
              </div>

              <div className="textfield small">
                <label>New Password (once more)</label>
                <input id="new_password_confirmation" ref="new_password_confirmation"/>
              </div>
            </form>
          </div>
        </div>

        <div className="row section">
          <div className="col-3">
            <h3 className="table-label">Delete Account</h3>
          </div>
          <div className="col-9">
            <p>
              Please send an email to <a href="mailto:support@giantswarm.io?subject=Please delete my account">support@giantswarm.io</a> to delete your account.
            </p>
          </div>
        </div>
      </div>
    );
  }
});