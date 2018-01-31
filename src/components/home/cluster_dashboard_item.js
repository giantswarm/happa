import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import ClusterIDLabel from '../shared/cluster_id_label';
import { Link } from 'react-router';
import { relativeDate } from '../../lib/helpers.js';
import { ButtonGroup } from 'react-bootstrap';
import Button from '../button/index';

class ClusterDashboardItem extends React.Component {
  constructor(props) {
    super(props);
  }

  getMemoryTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var m = 0.0;
    for (var i=0; i<this.props.cluster.workers.length; i++) {
      m += this.props.cluster.workers[i].memory.size_gb;
    }
    return m;
  }

  getStorageTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var s = 0.0;
    for (var i=0; i<this.props.cluster.workers.length; i++) {
      s += this.props.cluster.workers[i].storage.size_gb;
    }
    return s;
  }

  getCpusTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var c = 0;
    for (var i=0; i<this.props.cluster.workers.length; i++) {
      c += this.props.cluster.workers[i].cpu.cores;
    }
    return c;
  }

  accessCluster() {
    this.props.actions.clusterSelect(this.props.cluster.id);
    this.context.router.push('/getting-started/');
  }

  goToClusterDetails() {
    var url = '/organizations/'+ this.props.selectedOrganization +'/clusters/' + this.props.cluster.id;
    this.context.router.push(url);
  }

  render() {
    var memory = this.getMemoryTotal();
    var storage = this.getStorageTotal();
    var cpus = this.getCpusTotal();
    return (
      <div className='cluster-dashboard-item row well'>

            <div className='col-1 cluster-dashboard-item--title'>
              <Link to={'/organizations/'+ this.props.selectedOrganization +'/clusters/' + this.props.cluster.id}>
                <ClusterIDLabel clusterID={this.props.cluster.id} />
              </Link>
            </div>

            <div className='col-8'>
              <div className='cluster-dashboard-item--title'>
                <Link to={'/organizations/'+ this.props.selectedOrganization +'/clusters/' + this.props.cluster.id}>
                  <span className="cluster-dashboard-item--name" style={{fontWeight: 'bold'}}>{this.props.cluster.name}</span>
                </Link>
              </div>

              <div>Organization: <b>{this.props.selectedOrganization}</b> ·
                Created <b>{relativeDate(this.props.cluster.create_date)}</b> ·
                {
                  this.props.cluster.release_version && this.props.cluster.release_version !== '' ?
                  <span> Release Version <b>{this.props.cluster.release_version}</b></span>
                  :
                  <span> Kubernetes <b>{this.props.cluster.kubernetes_version}</b></span>
                }
              </div>
              <div>
                <b>{this.props.cluster.workers ? this.props.cluster.workers.length : 'n/a'}</b> nodes · <b>{memory ? memory : 'n/a'}</b> GB RAM · <b>{cpus ? cpus : 'n/a'}</b> CPUs · <b>{storage ? storage: 'n/a'}</b> GB storage
              </div>
            </div>

            <div className='col-3 pull-right'>
              <ButtonGroup className='pull-right'>
                <Button onClick={this.goToClusterDetails.bind(this)}>Details</Button>
                <Button onClick={this.accessCluster.bind(this)}>Access</Button>
              </ButtonGroup>
            </div>

      </div>
    );
  }
}

ClusterDashboardItem.contextTypes = {
  router: React.PropTypes.object
};

ClusterDashboardItem.propTypes = {
  cluster: React.PropTypes.object,
  actions: React.PropTypes.object,
  className: React.PropTypes.string,
  children: React.PropTypes.array,
  selectedOrganization: React.PropTypes.string,
  animate: React.PropTypes.bool
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}


export default connect(null, mapDispatchToProps)(ClusterDashboardItem);
