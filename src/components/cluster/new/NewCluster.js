import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import cmp from 'semver-compare';
import CreateNodePoolsCluster from './CreateNodePoolsCluster';
import CreateRegularCluster from './CreateRegularCluster';
import PropTypes from 'prop-types';
import React from 'react';

class NewCluster extends React.Component {
  state = {
    releaseSelected: '8.3.0', //window.config.firstNodePoolsRelease,
  };

  setReleaseVersion = releaseSelected => {
    this.setState({ releaseSelected });
  };

  renderComponent = props => {
    console.log(
      window.config.firstNodePoolsRelease,
      this.state.releaseSelected,
      cmp(this.state.releaseSelected, window.config.firstNodePoolsRelease) < 0
    );

    const Component =
      cmp(this.state.releaseSelected, window.config.firstNodePoolsRelease) < 0
        ? CreateRegularCluster
        : CreateNodePoolsCluster;

    return <Component {...props} informParent={this.setReleaseVersion} />;
  };

  render() {
    if (this.state.releaseSelected) {
      return (
        <Switch>
          <Route
            exact
            path={`${this.props.match.path}`}
            render={props => this.renderComponent(props)}
          />
        </Switch>
      );
    }
  }
}

NewCluster.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(NewCluster);
