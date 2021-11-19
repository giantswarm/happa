import { push } from 'connected-react-router';
import { Box, Heading, Paragraph } from 'grommet';
import { MainRoutes } from 'model/constants/routes';
import * as featureFlags from 'model/featureFlags';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import * as mainActions from 'model/stores/main/actions';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { IState } from 'model/stores/state';
import React, { ReactNode } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import ShadowMask from 'shared/ShadowMask';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';
import ErrorReporter from 'utils/errors/ErrorReporter';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'utils/flashMessage';
import MapiAuth from 'utils/MapiAuth/MapiAuth';

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
}

class Login extends React.Component<ILoginProps, ILoginState> {
  public readonly state: ILoginState = {
    email: '',
    password: '',
    authenticating: false,
    mapiAuthenticating: false,
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

  public mapiLogin = (e: React.MouseEvent<HTMLElement>) => {
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

  public render(): ReactNode {
    const { authenticating, mapiAuthenticating, email, password } = this.state;

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
                  primary={true}
                  size='large'
                  loading={mapiAuthenticating}
                  onClick={this.mapiLogin}
                  disabled={authenticating}
                >
                  Proceed to login
                </Button>
                <Paragraph fill={true} margin={{ top: 'large' }}>
                  The above option will use a central authentication provider to
                  log you in.
                </Paragraph>
              </Box>
            )}

            {!featureFlags.flags.CustomerSSO.enabled && (
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

                  <Box direction='row' gap='small' align='center'>
                    <Button
                      loading={authenticating}
                      type='submit'
                      disabled={mapiAuthenticating}
                    >
                      Log in
                    </Button>
                    <Link to={MainRoutes.ForgotPassword}>
                      Forgot your password?
                    </Link>
                  </Box>
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
    actions: bindActionCreators(mainActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withAuthProvider(Login));
