'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as userActions from '../../actions/userActions';

class Logout extends React.Component {
  componentDidMount() {
    this.props.actions.logout();
  }

  render() {
    return (
      <div>
        <ReactCSSTransitionGroup transitionName='logout--mask--transition' transitionAppear={true} transitionAppearTimeout={400} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className='logout--mask'></div>
        </ReactCSSTransitionGroup>
        <div className='logout--container'>
          <img className='loader' src='/images/loader_oval_light.svg' />
        </div>
      </div>
    );
  }
}

Logout.contextTypes = {
  router: React.PropTypes.object
};

Logout.propTypes = {
  actions: React.PropTypes.object
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(null, mapDispatchToProps)(Logout);