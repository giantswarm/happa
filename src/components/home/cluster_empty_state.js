import React from 'react';
import {Link}  from 'react-router';

class ClusterEmptyState extends React.Component {
  render() {
    if (!this.props.selectedOrganization) {
      return <div className='cluster-dashboard well empty-slate'>
        <div className="cluster-dashboard--overlay">
          <h1>Welcome to Giant Swarm!</h1>
          <p>There are no organizations yet in your installation.</p>
          <p>Go to <Link to='organizations'>Manage Organizations</Link> to create your first organization, then come back to this screen to create your first cluster!</p>
        </div>
      </div>;
    } else if (this.props.errorLoadingClusters) {
      return <div className='cluster-dashboard well empty-slate'>
        <div className="cluster-dashboard--overlay">
          <h1>Error loading clusters for organization <code>{this.props.selectedOrganization}</code></h1>
          <p>We're probably getting things set up for you right now. Come back later or contact our support!</p>
          <p>You can switch to a different organization by using the organization selector at the top right of the page.</p>
        </div>
      </div>;
    } else {
      return <div className='cluster-dashboard well empty-slate'>
        <div className="cluster-dashboard--overlay">
          <h1>Couldn't find any clusters in organization <code>{this.props.selectedOrganization}</code></h1>
          <p>Make your first cluster by pressing the green "Launch New Cluster" button above.</p>
          <p>You can switch to a different organization by using the organization selector at the top right of the page.</p>
        </div>
        <div className="cluster-dashboard--inner">
        </div>
      </div>;
    }
  }
}

ClusterEmptyState.propTypes = {
  errorLoadingClusters: React.PropTypes.bool,
  organizations: React.PropTypes.object,
  selectedOrganization: React.PropTypes.string
};

export default ClusterEmptyState;
