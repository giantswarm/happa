import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Button as BsButton, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';
import Button from '../button';
import Gadget from './gadget';
import DonutGadget from './donut_gadget';
import NodeRow from './node_row';


var ClusterDashboard = React.createClass({
  render: function() {
    return <div className={'cluster-dashboard well'}>
      { this.props.children ?
        <div className="cluster-dashboard--overlay">
          {this.props.children}
        </div>
        :
        undefined
      }
      <div className={this.props.className}>
        <h1>
          Cluster: {this.props.cluster.id}

          <ButtonGroup>
            <DropdownButton title="" id="add_node_dropdown" className="outline">
              <MenuItem componentClass={Link} href='/docs/configure/clusterIdHere' to='/docs/configure/clusterIdHere'>Access Via kubectl</MenuItem>
              {/*
                <MenuItem>Open in Kubernetes Dashboard</MenuItem>
                <MenuItem>Configure Persistent Storage</MenuItem>
                <MenuItem>Launch Cluster Like This</MenuItem>
                <MenuItem>Rename cluster</MenuItem>
              */}
            </DropdownButton>
          </ButtonGroup>
        </h1>

        <div className='gadgets'>
          <Gadget label='Status' value="OK" backgroundColor="#1a8735"/>
          <DonutGadget label='RAM' bottom_label='3.6GB free' large_label="64%" color="#003c78" percentage={0.64} />
          <DonutGadget label='CPU' bottom_label='10 cores total' large_label="12%" color="#3ab6c7" percentage={0.12} />
          <DonutGadget label='Persistant Storage' bottom_label='72.1 GB free' large_label="28%" color="#b9aa0c" percentage={0.28} />
          <DonutGadget label='Node Storage'  bottom_label='23.4 GB free' large_label="42%" color="#d68a10" percentage={0.42}/>
          <Gadget label='Network In'  bottom_label='MB/Sec' value="12.2"/>
          <Gadget label='Network Out' bottom_label='MB/Sec' value="23.1"/>
          <Gadget label='Nodes' value="4"/>
          <Gadget label='Pods' value="78"/>
          <Gadget label='Services' value="14"/>
        </div>

        <div className='seperator'></div>

        <h3>
          Nodes

          {/*
          <ButtonGroup>
            <BsButton className="outline">ADD NODE</BsButton>
            <DropdownButton title="" id="add_node_dropdown" className="outline">
              <MenuItem>Some</MenuItem>
              <MenuItem>Node</MenuItem>
              <MenuItem>Actions?</MenuItem>
            </DropdownButton>
          </ButtonGroup>
          */}
        </h3>

        <table className='table node-table'>
          <thead>
            <tr>
              <th>IP</th>
              <th>STATUS</th>
              <th>RAM USED</th>
              <th>CPU USAGE</th>
              <th>STORAGE USED</th>
              <th className="node-table--net-in-header">NET IN</th>
              <th className="node-table--net-out-header">NET OUT</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.cluster.nodes.map((node_internal_ip) => {
                return <NodeRow key={node_internal_ip} node_internal_ip={node_internal_ip} animate={this.props.animate} />;
              })
            }
          </tbody>
        </table>
      </div>
    </div>;
  }
});

module.exports = ClusterDashboard;