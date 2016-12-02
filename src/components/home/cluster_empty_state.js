import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Button as BsButton, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';
import Button from '../button';
import Gadget from './gadget';
import DonutGadget from './donut_gadget';
import NodeRow from './node_row';
import ClusterDashboard from './cluster_dashboard';


var ClusterEmptyState = React.createClass({
  getInitialState: function() {
    return {};
  },

  render: function() {
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
    };
  }
});

module.exports = ClusterEmptyState;