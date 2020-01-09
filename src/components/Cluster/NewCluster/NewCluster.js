import { loadReleases } from 'actions/releaseActions';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import cmp from 'semver-compare';
import { Providers } from 'shared/constants';
import LoadingOverlay from 'UI/LoadingOverlay';

import CreateNodePoolsCluster from './CreateNodePoolsCluster';
import CreateRegularCluster from './CreateRegularCluster';

class NewCluster extends React.Component {
  state = {
    selectedRelease: this.props.firstNodePoolsRelease,
    selectableReleases: [],
    loading: true,
    clusterName: 'Unnamed cluster',
  };

  componentDidMount() {
    this.props.dispatch(loadReleases()).then(() => {
      this.setSelectableReleases();
      const selectedRelease = this.props.activeSortedReleases[0];

      this.setState({
        selectedRelease,
        loading: false,
      });
    });
  }

  setSelectedRelease = selectedRelease => {
    this.setState({ selectedRelease });
  };

  setSelectableReleases() {
    let releaseVersions = [];
    if (this.props.activeSortedReleases.length > 0) {
      releaseVersions = this.props.activeSortedReleases;
    } else {
      releaseVersions = Object.entries(this.props.releases).map(
        ([, release]) => release.version
      );

      this.informWIP();
    }

    const selectableReleases = releaseVersions.map(
      version => this.props.releases[version]
    );

    this.setState({ selectableReleases: selectableReleases });
  }

  updateClusterName = clusterName => this.setState({ clusterName });

  // Lets non admin users know that creating a cluster will probably fail for them,
  // since all releases are WIP and only admins can create clusters from WIP releases.
  //
  // TODO: Remove this, as there are releases for Azure now.
  informWIP() {
    if (!this.props.user.isAdmin) {
      if (this.props.provider === Providers.AZURE) {
        new FlashMessage(
          'Support for Microsoft Azure is still in an early stage.',
          messageType.INFO,
          messageTTL.FOREVER,
          'There is no active release yet. To create a cluster you will need admin permissions.'
        );
      } else {
        new FlashMessage(
          'No active releases available at the moment.',
          messageType.INFO,
          messageTTL.FOREVER,
          'There is no active release yet. To create a cluster you will need admin permissions.'
        );
      }
    }
  }

  semVerCompare = () => {
    if (this.state.selectedRelease && this.props.firstNodePoolsRelease) {
      return cmp(this.state.selectedRelease, this.props.firstNodePoolsRelease);
    }
    
return -1;
  };

  renderComponent = props => {
    const Component =
      this.semVerCompare() < 0 ||
      this.props.provider === Providers.AZURE ||
      this.props.provider === Providers.KVM
        ? CreateRegularCluster // new v4 form
        : CreateNodePoolsCluster; // new v5 form

    return (
      <Component
        {...props}
        informParent={this.setSelectedRelease}
        selectedRelease={this.state.selectedRelease}
        selectableReleases={this.state.selectableReleases}
        releases={this.props.releases}
        activeSortedReleases={this.props.activeSortedReleases}
        clusterName={this.state.clusterName}
        updateClusterNameInParent={this.updateClusterName}
      />
    );
  };

  render() {
    return (
      <LoadingOverlay loading={this.state.loading}>
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
  releases: PropTypes.object,
  selectedRelease: PropTypes.string,
  activeSortedReleases: PropTypes.array,
  provider: PropTypes.string,
  firstNodePoolsRelease: PropTypes.string,
  user: PropTypes.object,
};

function mapStateToProps(state) {
  const { items, activeSortedReleases } = state.entities.releases;
  
return {
    releases: items,
    activeSortedReleases,
    provider: state.app.info.general.provider,
    firstNodePoolsRelease: state.app.info.features
      ? state.app.info.features.nodepools.release_version_minimum
      : '10.0.0',
    user: state.app.loggedInUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCluster);
