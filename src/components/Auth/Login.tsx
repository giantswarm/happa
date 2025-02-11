import { Box, Heading, Paragraph } from 'grommet';
import * as featureFlags from 'model/featureFlags';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import * as mainActions from 'model/stores/main/actions';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { IState } from 'model/stores/state';
import React, { ReactNode } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import ShadowMask from 'shared/ShadowMask';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
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
  mapiAuthenticating: boolean;
}

class Login extends React.Component<ILoginProps, ILoginState> {
  public readonly state: ILoginState = {
    mapiAuthenticating: false,
  };

  // eslint-disable-next-line class-methods-use-this
  public onAuthenticateFailed = (message: string) => {
    new FlashMessage(message, messageType.ERROR, messageTTL.LONG);
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
    const { mapiAuthenticating } = this.state;

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
                >
                  Proceed to login
                </Button>
                <Paragraph fill={true} margin={{ top: 'large' }}>
                  The above option will use a central authentication provider to
                  log you in.
                </Paragraph>
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
