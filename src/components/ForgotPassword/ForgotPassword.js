import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { MainRoutes } from 'shared/constants/routes';
import ShadowMask from 'shared/ShadowMask';
import * as mainActions from 'stores/main/actions';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';
import LoginFormContainer from 'UI/Layout/LoginFormContainer';

class ForgotPassword extends React.Component {
  state = {
    submitting: false,
    tokenRequested: false,
    email: '',
  };

  componentDidMount() {
    this.setState({ email: localStorage.getItem('user.email') || '' });
  }

  submit = (event) => {
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
      .catch((error) => {
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
            let message = `Something went wrong. Our servers might be down, or perhaps you've made too many requests in a row. Please try again in 5 minutes.`;

            if (error.message?.includes('Access-Control-Allow-Origin')) {
              message =
                'Please ensure you have installed the required certificates to talk to the API server.';
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

        ErrorReporter.getInstance().notify(error);
      });
  };

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    clearQueues();
  }

  updateEmail = (event) => {
    clearQueues();
    this.setState({
      email: event.target.value,
    });
  };

  success = () => {
    return (
      <div>
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
          <Link to={MainRoutes.Login}>Back to login form</Link>
        </small>
      </div>
    );
  };

  form = () => {
    return (
      <>
        <h1>Forgot your password?</h1>
        <p>
          Enter the email you used to sign-up and submit the form. We&apos;ll
          send you a link you can use to set a new password.
        </p>
        <form noValidate='novalidate' onSubmit={this.submit}>
          <TextInput
            autoFocus={true}
            label='Email'
            id='email'
            onChange={this.updateEmail}
            type='email'
            value={this.state.email}
            margin={{ bottom: 'medium' }}
          />
          <Box direction='row' gap='small' align='center'>
            <Button
              primary={true}
              loading={this.state.submitting}
              onClick={this.submit}
              type='submit'
            >
              {this.state.submitting ? 'Submitting ...' : 'Submit'}
            </Button>
            <Link to={MainRoutes.Login}>Back to login form</Link>
          </Box>
        </form>
      </>
    );
  };

  render() {
    return (
      <>
        <ShadowMask />

        <SlideTransition in={true} appear={true} direction='down'>
          <LoginFormContainer>
            {this.state.tokenRequested ? this.success() : this.form()}
          </LoginFormContainer>
        </SlideTransition>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(mainActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(ForgotPassword);
