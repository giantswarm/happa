'use strict';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import View from './view';
import { Route, Switch } from 'react-router-dom';

class Organizations extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={`${this.props.match.path}`} component={View} />
      </Switch>
    );
  }
}

Organizations.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Organizations);
