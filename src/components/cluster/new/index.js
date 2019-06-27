import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import View from './view';

class Cluster extends React.Component {
  render() {
    return (
      <Switch>
        <Route component={View} exact path={`${this.props.match.path}`} />
      </Switch>
    );
  }
}

Cluster.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Cluster);
