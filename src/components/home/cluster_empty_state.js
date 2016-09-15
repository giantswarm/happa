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
    return <div>
      <ClusterDashboard cluster={{id: 'example'}} animate={false} className='cluster-dashboard--empty-slate'>
        <h1>Couldn't find any clusters in organization <code>{this.props.selectedOrganization}</code></h1>
        <p>We're probably getting things set up for you right now. Come back later or contact our support!</p>
        <p>You can switch to a different organization by using the organization selector at the top right of the page.</p>
      </ClusterDashboard>
    </div>;
  }
});

module.exports = ClusterEmptyState;