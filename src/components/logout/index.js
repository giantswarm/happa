'use strict';

import Reflux from 'reflux';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { flashAdd, flashClearAll } from '../../actions/flashMessageActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as userActions from '../../actions/userActions';

var Logout = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },


  componentDidMount: function() {
    this.props.actions.logout()
  },

  //TODO: turn progressbutton into a component
  render: function() {
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
});

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch
  };
}


module.exports = connect(null, mapDispatchToProps)(Logout);