import { loadReleases } from 'actions/releaseActions';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import LoadingOverlay from 'UI/LoadingOverlay';

import NewClusterWrapper from './NewClusterWrapper';

class NewCluster extends React.Component {
  state = {
    selectableReleases: [],
    loading: true,
  };

  componentDidMount() {
    // TODO move this to batchedActions
    // & trash this component. Almost every other
    // functionality has moved to `NewClusterWrapper.tsx`
    this.props.dispatch(loadReleases()).then(() => {
      this.setSelectableReleases();

      this.setState({
        loading: false,
      });
    });
  }

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
      (version) => this.props.releases[version]
    );

    this.setState({ selectableReleases: selectableReleases });
  }

  // Lets non admin users know that creating a cluster will probably fail for them,
  // since all releases are WIP and only admins can create clusters from WIP releases.
  informWIP() {
    if (!this.props.user.isAdmin) {
      new FlashMessage(
        'No active releases available at the moment.',
        messageType.INFO,
        messageTTL.FOREVER,
        'There is no active release yet. To create a cluster you will need admin permissions.'
      );
    }
  }

  renderComponent = (props) => {
    const route = RoutePath.parseWithTemplate(
      OrganizationsRoutes.Clusters.New,
      props.location.pathname
    );

    return (
      <NewClusterWrapper
        selectedOrganization={route.params.orgId}
        breadcrumbPathname={props.match.url}
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
            render={(props) => this.renderComponent(props)}
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
  activeSortedReleases: PropTypes.array,
  user: PropTypes.object,
};

function mapStateToProps(state) {
  const { items, activeSortedReleases } = state.entities.releases;

  return {
    releases: items,
    activeSortedReleases,
    user: state.main.loggedInUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCluster);
