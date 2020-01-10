import * as forgotPasswordActions from 'actions/forgotPasswordActions';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';
import LoginFormContainer from 'UI/LoginFormContainer';

class ForgotPassword extends React.Component {
  state = {
    submitting: false,
    tokenRequested: false,
    email: '',
  };

  componentDidMount() {
    this.setState({ email: localStorage.getItem('user.email') || '' });
  }

  submit = event => {
    event.preventDefault();
    clearQueues();

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
            new FlashMessage(
              'Please provide a (valid) email address',
              messageType.ERROR,
              messageTTL.MEDIUM
            );
            break;
          default: {
            const heading = 'Unable to reset password';
            let message =
              'Something went wrong. Our servers might be down, or perhaps you&apos;ve made too many requests in a row. Please try again in 5 minutes.';

            if (error.message) {
              if (error.message.includes('Access-Control-Allow-Origin')) {
                message =
                  'Please ensure you have installed the required certificates to talk to the API server.';
              }
            }

            new FlashMessage(
              heading,
              messageType.ERROR,
              messageTTL.LONG,
              message
            );
          }
        }

        this.setState({
          submitting: false,
          tokenRequested: false,
        });
      });
  };

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    clearQueues();
  }

  updateEmail = event => {
    clearQueues();
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
        <form noValidate='novalidate' onSubmit={this.submit}>
          <div className='textfield'>
            <label htmlFor='email'>Email</label>
            <input
              autoFocus
              id='email'
              onChange={this.updateEmail}
              ref={i => {
                this.email = i;
              }}
              type='text'
              value={this.state.email}
            />
          </div>
          <Button
            bsStyle='primary'
            loading={this.state.submitting}
            onClick={this.submit}
            type='submit'
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

        <SlideTransition in={true} appear={true} direction='down'>
          <LoginFormContainer>
            {this.state.tokenRequested ? this.success() : this.form()}
          </LoginFormContainer>
        </SlideTransition>
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

export default connect(null, mapDispatchToProps)(ForgotPassword);
