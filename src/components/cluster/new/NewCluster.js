import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import cmp from 'semver-compare';
import CreateNodePoolsCluster from './CreateNodePoolsCluster';
import CreateRegularCluster from './CreateRegularCluster';
import LoadingOverlay from 'UI/loading_overlay';
import PropTypes from 'prop-types';
import React from 'react';

class NewCluster extends React.Component {
  state = {
    releaseSelected: window.config.firstNodePoolsRelease,
  };

  setReleaseVersion = releaseSelected => {
    this.setState({ releaseSelected });
  };

  renderComponent = props => {
    const Component =
      cmp(this.state.releaseSelected, window.config.firstNodePoolsRelease) <
        0 || window.config.environment !== 'development'
        ? CreateRegularCluster
        : CreateNodePoolsCluster;

    return <Component {...props} informParent={this.setReleaseVersion} />;
  };

  render() {
    return (
      <LoadingOverlay loading={!this.state.releaseSelected}>
        <Switch>
          <Route
            exact
            path={`${this.props.match.path}`}
            render={props => this.renderComponent(props)}
          />
        </Switch>
      </LoadingOverlay>
    );
  }
}

NewCluster.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(NewCluster);
