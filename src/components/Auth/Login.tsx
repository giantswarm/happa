import { push } from 'connected-react-router';
import { Box } from 'grommet';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import MapiAuth from 'lib/MapiAuth/MapiAuth';
import PropTypes from 'prop-types';
import React, { ReactNode } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { MainRoutes } from 'shared/constants/routes';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import * as mainActions from 'stores/main/actions';
import { IState } from 'stores/state';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';

import { parseErrorMessages } from './parseErrorMessages';

// The props coming from the global state (AKA: `mapStateToProps`)
interface IStateProps {
  user: IUser;
}

// The props coming from injected actions (AKA: `mapDispatchToProps`)
interface IDispatchProps extends DispatchProp {
  actions: typeof mainActions;
  dispatch: IAsynchronousDispatch<IState>;
}

interface ILoginProps extends IStateProps, IDispatchProps {}

interface ILoginState {
  email: string;
  password: string;
  authenticating: boolean;
}

class Login extends React.Component<ILoginProps, ILoginState> {
  public static propTypes: IStateProps & IDispatchProps = {
    /**
     * We skip typechecking because we don't want to define the whole object
     * structure (for now)
     */
    // @ts-ignore
    dispatch: PropTypes.func,
    // @ts-ignore
    actions: PropTypes.object,
  };

  public readonly state: ILoginState = {
    email: '',
    password: '',
    authenticating: false,
  };

  public email: HTMLInputElement | null = null;

  public password: HTMLInputElement | null = null;

  public onAuthenticateFailed = (message: string) => {
    new FlashMessage(message, messageType.ERROR, messageTTL.LONG);
  };

  public updateEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clear flash messages if there are any.
    clearQueues();

    this.setState({
      email: event.target.value,
    });
  };

  public updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clear flash messages if there are any.
    clearQueues();

    this.setState({
      password: event.target.value,
    });
  };

  public logIn = (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearQueues();

    if (!this.state.email) {
      new FlashMessage(
        'Please provide the email address that you used for registration.',
        messageType.ERROR,
        messageTTL.LONG
      );
    } else if (!this.state.password) {
      new FlashMessage(
        'Please enter your password.',
        messageType.ERROR,
        messageTTL.LONG
      );
    }

    if (this.state.email && this.state.password) {
      this.setState({
        authenticating: true,
      });

      this.props.actions
        .giantswarmLogin(this.state.email, this.state.password)
        // @ts-expect-error
        .then(() => {
          this.props.dispatch(push(MainRoutes.Home));

          return null;
        })
        .catch((error: Error) => {
          this.setState({
            authenticating: false,
          });

          const [heading, message] = parseErrorMessages(error);

          new FlashMessage(
            heading,
            messageType.ERROR,
            messageTTL.LONG,
            message
          );
        });
    }
  };

  public mapiLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    this.setState(
      {
        authenticating: true,
      },
      () => {
        const auth = MapiAuth.getInstance();
        this.props.actions.mapiLogin(auth);
      }
    );
  };

  public render(): ReactNode {
    return (
      <>
        <div className='login_form--mask' />

        <SlideTransition appear={true} in={true} direction='down'>
          <div className='login_form--container'>
            <h1>Log in to Giant&nbsp;Swarm</h1>
            <form onSubmit={this.logIn}>
              <Box margin={{ bottom: 'small' }}>
                <TextInput
                  autoComplete='username'
                  autoFocus={true}
                  label='Email'
                  id='email'
                  onChange={this.updateEmail}
                  type='email'
                  value={this.state.email}
                />
                <TextInput
                  autoComplete='current-password'
                  label='Password'
                  id='password'
                  onChange={this.updatePassword}
                  type='password'
                  value={this.state.password}
                />
              </Box>

              <Button
                bsStyle='primary'
                loading={this.state.authenticating}
                onClick={this.logIn}
                type='submit'
              >
                Log in
              </Button>
              <Link to={MainRoutes.ForgotPassword}>Forgot your password?</Link>
            </form>

            <Box margin={{ vertical: 'large' }}>
              <Button
                bsStyle='primary'
                loading={this.state.authenticating}
                onClick={this.mapiLogin}
              >
                Login using OIDC
              </Button>
            </Box>

            <div className='login_form--legal'>
              By logging in you acknowledge that we track your activities in
              order to analyze your product usage and improve your experience.
              See our{' '}
              <a href='https://giantswarm.io/privacypolicy/'>Privacy Policy</a>.
              <br />
              <br />
              Trouble logging in? Please contact us via{' '}
              <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a>
            </div>
          </div>
        </SlideTransition>
      </>
    );
  }
}

/**
 * If we had the type of the whole state, the type of `state` would be something like
 * `state: Partial<IAppState>`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStateToProps(state: Record<string, any>): IStateProps {
  return {
    user: state.main.loggedInUser,
  };
}

function mapDispatchToProps(dispatch: Dispatch): IDispatchProps {
  return {
    // Skipping check as we don't have a valid type for mainActions yet
    // @ts-ignore
    actions: bindActionCreators(mainActions, dispatch),
    dispatch: dispatch,
  };
}

// This is complaining about our prop types not having the EXACT same structure as our Props interface
// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(Login);
