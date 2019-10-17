import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { loadReleases } from 'actions/releaseActions';
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
    selectedRelease: window.config.firstNodePoolsRelease,
    selectableReleases: [],
    loading: true,
  };

  componentDidMount() {
    this.props.dispatch(loadReleases()).then(() => {
      this.setSelectableReleases();
      this.setState({
        selectedRelease: this.props.activeSortedReleases[0],
        loading: false,
      });
    });

    if (!this.state.selectedRelease) {
      new FlashMessage(
        'Something went wrong while trying to fetch active releases',
        messageType.ERROR,
        messageTTL.MEDIUM,
        'Please try again later or contact support: support@giantswarm.io'
      );
    }
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

  // Lets non admin users know that creating a cluster will probably fail for them,
  // since all releases are WIP and only admins can create clusters from WIP releases.
  //
  // TODO: Remove this, as there are releases for Azure now.
  informWIP() {
    if (!this.props.user.isAdmin) {
      if (this.props.provider === 'azure') {
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

  renderComponent = props => {
    // TODO Remove CreateClusterOld when we release NPs
    const Component =
      window.config.environment !== 'development'
        ? CreateClusterOld // Old form
        : cmp(this.state.selectedRelease, window.config.firstNodePoolsRelease) <
          0
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
  user: PropTypes.object,
};

function mapStateToProps(state) {
  const { items, activeSortedReleases } = state.entities.releases;
  return {
    releases: items,
    activeSortedReleases,
    provider: state.app.info.general.provider,
    user: state.app.loggedInUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewCluster);
