import React from 'react';

class ClusterEmptyState extends React.Component {
  render() {
    if (this.props.organizations[this.props.selectedOrganization].errorLoadingClusters) {
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
          <p>We're probably getting things set up for you right now. Come back later or contact our support!</p>
          <p>You can switch to a different organization by using the organization selector at the top right of the page.</p>
        </div>
        <div className="cluster-dashboard--inner">
        </div>
      </div>;
    }
  }
}

ClusterEmptyState.propTypes = {
  organizations: React.PropTypes.object,
  selectedOrganization: React.PropTypes.string
};

export default ClusterEmptyState;