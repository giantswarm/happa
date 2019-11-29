import * as userActions from 'actions/userActions';
import { AuthorizationTypes } from 'shared/constants';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import BaseTransition from 'styles/transitions/BaseTransition';
import PropTypes from 'prop-types';
import React from 'react';

class Logout extends React.Component {
  componentDidMount() {
    if (
      this.props.user &&
      this.props.user.auth &&
      this.props.user.auth.scheme
    ) {
      if (this.props.user.auth.scheme === AuthorizationTypes.BEARER) {
        this.props.dispatch(push('/login'));
        this.props.actions.logoutSuccess();
      } else {
        this.props.actions.giantswarmLogout();
      }
    } else {
      this.props.dispatch(push('/login'));
      this.props.actions.logoutSuccess();
    }
  }

  render() {
    return (
      <div>
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
      </div>
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
    user: state.app.loggedInUser,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Logout);
