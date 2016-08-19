"use strict";

import actions from '../../actions/user_actions';
import store from '../../stores/user_store';
import FlashMessages from '../flash_messages/index.js';
import Reflux from 'reflux';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from 'react-router';
import Button from '../button';
import {connect} from 'react-redux';
import { flashAdd, flashClearAll } from '../../actions/flashMessageActions';

var Login = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  mixins: [Reflux.connect(store,'user'), Reflux.listenerMixin],

  componentDidMount: function() {
    this.listenTo(actions.authenticate.completed, this.onAuthenticateCompleted);
    this.listenTo(actions.authenticate.failed, this.onAuthenticateFailed);
  },

  componentWillUnmount: function() {
    this.props.dispatch(flashClearAll());
  },

  onAuthenticateCompleted: function() {
    this.props.dispatch(flashClearAll());

    this.context.router.push('/');

    this.props.dispatch(flashAdd({
      message: 'Signed in succesfully.',
      class: "success",
      ttl: 3000
    }));
  },

  onAuthenticateFailed: function(message) {
    this.props.dispatch(flashAdd({
      message: message,
      class: "danger"
    }));
  },

  updateEmail(event) {
    this.props.dispatch(flashClearAll());
    actions.updateEmail(event.target.value);
  },

  updatePassword(event) {
    this.props.dispatch(flashClearAll());
    actions.updatePassword(event.target.value);
  },

  logIn(e) {
    e.preventDefault();

    this.props.dispatch(flashClearAll());

    if ( ! this.state.user.email) {
      this.props.dispatch(flashAdd({
        message: 'Please provide the email address that you used for registration.',
        class: "danger"
      }));
    } else if ( ! this.state.user.password) {
      this.props.dispatch(flashAdd({
        message: 'Please enter your password.',
        class: "danger"
      }));
    }

    if (this.state.user.email && this.state.user.password) {
      actions.authenticate(this.state.user.email, this.state.user.password);
    }
  },

  //TODO: turn progressbutton into a component
  render: function() {
    return (
      <div>
        <div className="login_form--mask"></div>

        <ReactCSSTransitionGroup transitionName={`login_form--transition`} transitionAppear={true} transitionAppearTimeout={200} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className="login_form--container col-4">
            <div className="login_form--flash-container">
              <FlashMessages />
            </div>

            <h1>Log in to Giant&nbsp;Swarm</h1>
            <form onSubmit={this.logIn}>
              <div className="textfield">
                <label>Email</label>
                <input value={this.state.user.email}
                       type="text"
                       id="email"
                       ref="email"
                       onChange={this.updateEmail} autoFocus />
              </div>

              <div className="textfield">
                <label>Password</label>
                <input value={this.state.user.password}
                       type="password"
                       id="password"
                       ref="password"
                       onChange={this.updatePassword} />
              </div>

              <div className="progress_button--container">
                <Button type="submit" bsStyle="primary" loading={this.state.user.authenticating} onClick={this.logIn}>Log in</Button>
              </div>
              <Link to="/forgot_password">Forgot your password?</Link>
            </form>

            <div className="login_form--legal">
            By logging in you acknowledge that we track your activities in order to analyze your product usage and improve your experience. See our <a href="https://giantswarm.io/privacypolicy/">Privacy Policy</a>.
            <br/>
            <br/>
            Trouble logging in? Please contact us via <a href="mailto:support@giantswarm.io">support@giantswarm.io</a>
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});

module.exports = connect()(Login);