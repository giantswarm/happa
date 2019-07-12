import * as userActions from '../../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { spinner } from '../../images';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Logout extends React.Component {
  componentDidMount() {
    if (
      this.props.user &&
      this.props.user.auth &&
      this.props.user.auth.scheme
    ) {
      if (this.props.user.auth.scheme === 'Bearer') {
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
        <ReactCSSTransitionGroup
          transitionAppear={true}
          transitionAppearTimeout={400}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
          transitionName='logout--mask--transition'
        >
          <div className='logout--mask' />
        </ReactCSSTransitionGroup>
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
