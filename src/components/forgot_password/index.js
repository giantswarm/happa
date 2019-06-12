import * as forgotPasswordActions from '../../actions/forgotPasswordActions';
import { bindActionCreators } from 'redux';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from '../../lib/flash_message';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withTheme } from 'emotion-theming';
import Button from '../shared/button';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import styled from '@emotion/styled';

const ForgotPasswordStyles = styled.div({
  position: 'relative',
  margin: 'auto',
  marginTop: -'40px',
  width: '33%',
  zIndex: 1,
  button: {
    zIndex: 10
  },
  form: {
    marginTop: '20px',
    marginBottom: '40px',
  },
  a: {
    fontSize: '14px'
  },
});



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

            new FlashMessage(
              heading,
              messageType.ERROR,
              messageTTL.LONG,
              message
            );
        }

        this.setState({
          submitting: false,
          tokenRequested: false,
        });
      });
  };

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
          <ForgotPasswordStyles>
            {this.state.tokenRequested ? this.success() : this.form()}
          </ForgotPasswordStyles>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

ForgotPassword.propTypes = {
  actions: PropTypes.object,
  dispatch: PropTypes.func,
  theme: PropTypes.shape({
    color: PropTypes.obj,
    border_radius: PropTypes.string
  })
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(forgotPasswordActions, dispatch),
    dispatch: dispatch,
  };
}

const ForgotPasswordWithTheme = withTheme(ForgotPassword);

export default connect(
  null,
  mapDispatchToProps
)(ForgotPasswordWithTheme);
