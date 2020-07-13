import * as userActions from 'actions/userActions';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthorizationTypes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import BaseTransition from 'styles/transitions/BaseTransition';

class Logout extends React.Component {
  componentDidMount() {
    if (
      this.props.user &&
      this.props.user.auth &&
      this.props.user.auth.scheme
    ) {
      if (this.props.user.auth.scheme === AuthorizationTypes.BEARER) {
        this.props.dispatch(push(AppRoutes.Login));
        this.props.actions.logoutSuccess();
      } else {
        this.props.actions.giantswarmLogout();
      }
    } else {
      this.props.dispatch(push(AppRoutes.Login));
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
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch,
  };
}

function mapStateToProps(state) {
  return {
    user: state.main.loggedInUser,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
