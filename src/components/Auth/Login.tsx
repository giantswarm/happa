import { push } from 'connected-react-router';
import { Anchor, Box, Heading, Paragraph } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
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
import * as featureFlags from 'shared/featureFlags';
import ShadowMask from 'shared/ShadowMask';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import * as mainActions from 'stores/main/actions';
import { getLoggedInUser } from 'stores/main/selectors';
import { IState } from 'stores/state';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';

import {
  IPropsWithAuthProvider,
  withAuthProvider,
} from './MAPI/MapiAuthProvider';
import { parseErrorMessages } from './parseErrorMessages';

const StyledBox = styled(Box)`
  position: relative;
`;

// The props coming from the global state (AKA: `mapStateToProps`)
interface IStateProps {
  user: ILoggedInUser | null;
}

// The props coming from injected actions (AKA: `mapDispatchToProps`)
interface IDispatchProps extends DispatchProp {
  actions: typeof mainActions;
  dispatch: IAsynchronousDispatch<IState>;
}

interface ILoginProps
  extends IStateProps,
    IDispatchProps,
    IPropsWithAuthProvider {}

interface ILoginState {
  email: string;
  password: string;
  authenticating: boolean;
  mapiAuthenticating: boolean;
  loginFormVisible: boolean;
}

class Login extends React.Component<ILoginProps, ILoginState> {
  public static propTypes: IStateProps & IDispatchProps = {
    /**
     * We skip typechecking because we don't want to define the whole object
     * structure (for now)
     */
    // @ts-expect-error
    dispatch: PropTypes.func,
    // @ts-expect-error
    actions: PropTypes.object,
    authProvider: PropTypes.object,
  };

  public readonly state: ILoginState = {
    email: '',
    password: '',
    authenticating: false,
    mapiAuthenticating: false,
    loginFormVisible: !featureFlags.flags.CustomerSSO.enabled,
  };

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

          ErrorReporter.getInstance().notify(error);
        });
    }
  };

  public mapiLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    this.setState(
      {
        mapiAuthenticating: true,
      },
      () => {
        clearQueues();

        const auth = this.props.authProvider as MapiAuth;
        this.props.actions.mapiLogin(auth);
      }
    );
  };

  public showLoginForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    this.setState({ loginFormVisible: true });
  };

  public render(): ReactNode {
    const {
      authenticating,
      mapiAuthenticating,
      email,
      password,
      loginFormVisible,
    } = this.state;

    const isLoading = authenticating || mapiAuthenticating;

    return (
      <>
        <ShadowMask />

        <SlideTransition appear={true} in={true} direction='down'>
          <StyledBox width='large' margin='auto'>
            <Heading level={1} margin={{ bottom: 'large' }}>
              Welcome to Giant Swarm
            </Heading>

            {featureFlags.flags.CustomerSSO.enabled && (
              <Box margin={{ bottom: 'medium' }}>
                <Button
                  bsStyle='primary'
                  bsSize='lg'
                  loading={mapiAuthenticating}
                  onClick={this.mapiLogin}
                  disabled={authenticating}
                >
                  Proceed to login
                </Button>
                <Paragraph fill={true} margin={{ top: 'large' }}>
                  The above option will use a central authentication provider to
                  log you in. If you have logged in using email and password
                  before, and want to continue to do so, you can still do it for
                  a transitional period.
                </Paragraph>
              </Box>
            )}

            {loginFormVisible ? (
              <Box direction='column' gap='medium'>
                <form onSubmit={this.logIn}>
                  <Box margin={{ bottom: 'small' }}>
                    <TextInput
                      autoComplete='username'
                      autoFocus={true}
                      label='Email'
                      id='email'
                      onChange={this.updateEmail}
                      type='email'
                      value={email}
                      readOnly={isLoading}
                    />
                    <TextInput
                      autoComplete='current-password'
                      label='Password'
                      id='password'
                      onChange={this.updatePassword}
                      type='password'
                      value={password}
                      readOnly={isLoading}
                    />
                  </Box>

                  <Button
                    bsStyle='default'
                    loading={authenticating}
                    type='submit'
                    disabled={mapiAuthenticating}
                  >
                    Log in
                  </Button>
                  <Link to={MainRoutes.ForgotPassword}>
                    Forgot your password?
                  </Link>
                </form>
                <div className='login_form--legal'>
                  By logging in you acknowledge that we track your activities in
                  order to analyze your product usage and improve your
                  experience. See our{' '}
                  <a href='https://giantswarm.io/privacypolicy/'>
                    Privacy Policy
                  </a>
                  .
                  <br />
                  <br />
                  Trouble logging in? Please contact us via{' '}
                  <a href='mailto:support@giantswarm.io'>
                    support@giantswarm.io
                  </a>
                </div>
              </Box>
            ) : (
              <Box>
                <Anchor onClick={this.showLoginForm}>
                  Log in using email and password
                </Anchor>
              </Box>
            )}
          </StyledBox>
        </SlideTransition>
      </>
    );
  }
}

function mapStateToProps(state: IState): IStateProps {
  return {
    user: getLoggedInUser(state),
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-expect-error
)(withAuthProvider(Login));
