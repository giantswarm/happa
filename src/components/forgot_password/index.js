'use strict';

import FlashMessages from '../flash_messages/index.js';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from 'react-router-dom';
import { flashAdd, flashClearAll } from '../../actions/flashMessageActions';
import { connect } from 'react-redux';
import Button from '../shared/button';
import * as forgotPasswordActions from '../../actions/forgotPasswordActions';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      tokenRequested: false,
      email: localStorage.getItem('user.email') || '',
    };
  }

  submit = event => {
    event.preventDefault();
    this.props.dispatch(flashClearAll());

    this.setState({
      submitting: true,
    });

    this.props.actions
      .requestPasswordRecoveryToken(this.state.email)
      .then(() => {
        localStorage.setItem('user.email', this.state.email);
        this.setState({
          submitting: false,
          tokenRequested: true,
        });
      })
      .catch(error => {
        switch (error.name) {
          case 'TypeError':
            this.props.dispatch(
              flashAdd({
                message: 'Please provide a (valid) email address',
                class: 'danger',
              })
            );
            break;
          default:
            var heading = 'Unable to reset password';
            var message =
              'Something went wrong. Our servers might be down, or perhaps you&apos;ve made too many requests in a row. Please try again in 5 minutes.';

            if (error.message) {
              if (error.message.includes('Access-Control-Allow-Origin')) {
                message =
                  'Please ensure you have installed the required certificates to talk to the API server.';
              }
            }

            this.props.dispatch(
              flashAdd({
                message: (
                  <div>
                    <b>{heading}</b>
                    <br />
                    {message}
                  </div>
                ),
                class: 'danger',
              })
            );
        }

        this.setState({
          submitting: false,
          tokenRequested: false,
        });
      });
  };

  componentWillUnmount() {
    this.props.dispatch(flashClearAll());
  }

  updateEmail = event => {
    this.props.dispatch(flashClearAll());
    this.setState({
      email: event.target.value,
    });
  };

  success = () => {
    return (
      <div className='forgot-password--token-sent'>
        <h1>
          <i className='fa fa-email' /> Check your mail!
        </h1>
        <p>
          If you have an account, we&apos;ve sent an email to {this.state.email}
          .
        </p>

        <small>
          <p>
            Having trouble? Please contact us via{' '}
            <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a>
          </p>
        </small>

        <small>
          <Link to='/login'>Back to login form</Link>
        </small>
      </div>
    );
  };

  form = () => {
    return (
      <div>
        <h1>Forgot your password?</h1>
        <p>
          Enter the email you used to sign-up and submit the form. We&apos;ll
          send you a link you can use to set a new password.
        </p>
        <form onSubmit={this.submit} noValidate='novalidate'>
          <div className='textfield'>
            <label>Email</label>
            <input
              value={this.state.email}
              type='text'
              id='email'
              ref={i => {
                this.email = i;
              }}
              onChange={this.updateEmail}
              autoFocus
            />
          </div>
          <Button
            type='submit'
            bsStyle='primary'
            loading={this.state.submitting}
            onClick={this.submit}
          >
            {this.state.submitting ? 'Submitting ...' : 'Submit'}
          </Button>
          <Link to='/login'>Back to login form</Link>
        </form>
      </div>
    );
  };

  render() {
    return (
      <div>
        <div className='login_form--mask' />

        <ReactCSSTransitionGroup
          transitionName={`login_form--transition`}
          transitionAppear={true}
          transitionAppearTimeout={200}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
        >
          <div className='login_form--container col-4'>
            <div className='login_form--flash-container'>
              <FlashMessages />
            </div>
            {this.state.tokenRequested ? this.success() : this.form()}
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

ForgotPassword.propTypes = {
  actions: PropTypes.object,
  dispatch: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(forgotPasswordActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ForgotPassword);
