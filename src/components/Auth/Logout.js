import { push } from 'connected-react-router';
import { spinner } from 'images';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import MapiAuth from 'lib/MapiAuth/MapiAuth';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthorizationTypes } from 'shared/constants';
import { MainRoutes } from 'shared/constants/routes';
import * as mainActions from 'stores/main/actions';
import BaseTransition from 'styles/transitions/BaseTransition';

class Logout extends React.Component {
  async componentDidMount() {
    try {
      await MapiAuth.getInstance().logout();
    } catch (err) {
      new FlashMessage(
        `Control Plane logout couldn't be executed: ${err}`,
        messageType.WARNING,
        messageTTL.MEDIUM
      );
    }

    if (
      this.props.user &&
      this.props.user.auth &&
      this.props.user.auth.scheme
    ) {
      if (this.props.user.auth.scheme === AuthorizationTypes.BEARER) {
        this.props.dispatch(push(MainRoutes.Login));
        this.props.actions.logoutSuccess();
      } else {
        this.props.actions.giantswarmLogout();
      }
    } else {
      this.props.dispatch(push(MainRoutes.Login));
      this.props.actions.logoutSuccess();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <>
        <BaseTransition
          in={true}
          appear={true}
          timeout={{
            appear: 400,
            enter: 200,
            exit: 200,
          }}
          classNames='logout--mask--transition'
        >
          <div className='logout--mask' />
        </BaseTransition>
        <div className='logout--container'>
          <img className='loader' src={spinner} />
        </div>
      </>
    );
  }
}

Logout.propTypes = {
  actions: PropTypes.object,
  dispatch: PropTypes.func,
  user: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(mainActions, dispatch),
    dispatch: dispatch,
  };
}

function mapStateToProps(state) {
  return {
    user: state.main.loggedInUser,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
