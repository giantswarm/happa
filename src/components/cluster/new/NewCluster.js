import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { Route, Switch } from 'react-router-dom';
import cmp from 'semver-compare';
import CreateClusterOld from './CreateClusterOld';
import CreateNodePoolsCluster from './CreateNodePoolsCluster';
import CreateRegularCluster from './CreateRegularCluster';
import LoadingOverlay from 'UI/loading_overlay';
import PropTypes from 'prop-types';
import React from 'react';

class NewCluster extends React.Component {
  state = {
    releaseSelected: window.config.firstNodePoolsRelease,
  };

  componentDidMount() {
    if (!this.state.releaseSelected) {
      new FlashMessage(
        'Something went wrong while trying to fetch active releases',
        messageType.ERROR,
        messageTTL.MEDIUM,
        'Please try again later or contact support: support@giantswarm.io'
      );
    }
  }

  setReleaseVersion = releaseSelected => {
    this.setState({ releaseSelected });
  };

  renderComponent = props => {
    // TODO Remove CreateClusterOld when we release NPs
    const Component =
      window.config.environment !== 'development'
        ? CreateClusterOld // Old form
        : cmp(this.state.releaseSelected, window.config.firstNodePoolsRelease) <
          0
        ? CreateRegularCluster // new v4 form
        : CreateNodePoolsCluster; // new v5 form

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
