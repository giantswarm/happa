'use strict';

import React from 'react';
import {connect} from 'react-redux';
import DocumentTitle from 'react-document-title';
import Button from '../button';
import _ from 'underscore';
import { browserHistory } from 'react-router';
import { flashAdd } from '../../actions/flashMessageActions';
import GiantSwarm from '../../lib/giantswarm_client_wrapper';
import update from 'react-addons-update';
import NewKVMWorker from './new_kvm_worker.js';

class CreateCluster extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availableVersions: ['1.4.6', '1.4.7', '1.5.0', '1.5.1', '1.5.2'],
      selectedVersion: '1.5.2',
      clusterName: 'My cluster',
      workerCount: 3,
      syncWorkers: true,
      workers: [
        { id: 1, cpu: 1, memory: 1, storage: 10, instanceType: 'm3.large' },
        { id: 2, cpu: 1, memory: 1, storage: 10, instanceType: 'm3.large' },
        { id: 3, cpu: 1, memory: 1, storage: 10, instanceType: 'm3.large' }
      ],
      submitting: false,
      error: false
    };
  }

  updateClusterName = (event) => {
    this.setState({
      clusterName: event.target.value
    });
  }

  updateWorkerCount = (e) => {
    this.setState({
      workerCount: e.target.value
    });
  }

  deleteWorker = (workerIndex) => {
    var workers = _.without(this.state.workers, this.state.workers[workerIndex]);

    this.setState({
      workers: workers
    });
  }

  addWorker = () => {
    var newDefaultWorker;

    if (this.state.syncWorkers) {
      newDefaultWorker = {
        id: Date.now(),
        cpu: this.state.workers[0].cpu,
        memory: this.state.workers[0].memory,
        storage: this.state.workers[0].storage,
        instanceType: this.state.workers[0].instanceType
      };
    } else {
      newDefaultWorker = {
        id: Date.now(),
        cpu: 1,
        memory: 1,
        storage: 20
      };
    }

    var workers = [].concat(this.state.workers, newDefaultWorker);

    this.setState({
      workers: workers
    });
  }

  syncWorkersChanged = (e) => {
    var workers = this.state.workers;
    var worker1 = this.state.workers[0];

    if (e.target.checked) {
      workers = workers.map((worker) => {
        return {
          id: worker.id,
          cpu: worker1.cpu,
          memory: worker1.memory,
          storage: worker1.storage,
          instanceType: worker1.instanceType
        };
      });
    }

    this.setState({
      syncWorkers: e.target.checked,
      workers: workers
    });
  }

  createCluster = () => {
    this.setState({
      submitting: true
    });

    var giantSwarm = new GiantSwarm.Client(this.props.authToken);

    var workers = [];

    // TODO/FYI: This IF / ELSE on window.config.createClusterWorkerType is a antipattern
    // that will spread throughout the codebase if we are not careful.
    // I am waiting for the 'third' cluster type that we support to be able to make
    // decisions about a meaningful abstraction. For now, going with a easy solution.

    if (window.config.createClusterWorkerType === 'aws') {
      for(var i=0; i < this.state.workerCount; i++){
        workers.push({}); // We don't support instance type selection yet for AWS Clusters.
                          // So just send an array of empty objects, one for each
                          // worker we want to create so that our backend will
                          // spawn the correct number of workers with default
                          // settings.
      }
    } else {
      workers = this.state.workers.map((worker) => {
        return {
          memory: {size_gb: worker.memory},
          storage: {size_gb: worker.storage},
          cpu: {cores: worker.cpu}
        };
      });
    }

    giantSwarm.createCluster({
      clusterName: this.state.clusterName,
      owner: this.props.selectedOrganization,
      workers: workers
    })
    .then(() => {
      browserHistory.push('/organizations/' + this.props.selectedOrganization);
      this.props.dispatch(flashAdd({
        message: <div>Your new cluster is being created!</div>,
        class: 'success',
        ttl: 3000
      }));
    })
    .catch((error) => {
      this.setState({
        submitting: false,
        error: error
      });
    });
  }

  componentDidMount() {
    this.refs.cluster_name.select();
  }

  updateWorker(index, newWorker) {
    var newState;

    if (this.state.syncWorkers) {
      var workers = this.state.workers.map((worker) => {
        worker.storage = newWorker.storage;
        worker.cpu = newWorker.cpu;
        worker.memory = newWorker.memory;
        worker.instanceType = newWorker.instanceType;
        return worker;
      });
      newState = update(this.state, {
        workers: {$set: workers}
      });
    } else {
      newState = update(this.state, {
        workers: {$splice: [[index, 1, newWorker]]}
      });
    }

    this.setState(newState);
  }

  render() {
    return (
      <DocumentTitle title={'Create Cluster | ' + this.props.selectedOrganization + ' | Giant Swarm'}>
        <div className='new-cluster'>
          <div className='row'>
            <div className='col-12'>
              <h1>Create a Cluster</h1>
            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Cluster Name</h3>
            </div>
            <div className='col-9'>
              <form onSubmit={(e) => {e.preventDefault();}}>
                <p>Give your cluster a name so you can recognize it in a crowd.</p>
                <input ref='cluster_name' type="text" value={this.state.clusterName} onChange={this.updateClusterName} autoFocus />
              </form>
            </div>
          </div>
          {
            window.config.createClusterWorkerType === 'aws'
            ?
            <div className='row section new-cluster--worker-count'>
              <div className='col-3'>
                <h3 className='table-label'>Worker Nodes</h3>
              </div>
              <div className='col-9'>
                <form onSubmit={(e) => {e.preventDefault();}}>
                  <p>Currently all worker nodes will use instance type <code>m3.large</code>, which provides 2 vCPUs, 7.5 GB RAM, and 32 GB of SSD storage.</p>
                  <input ref='worker_count' min='1' max='16' type="number" value={this.state.workerCount} onChange={this.updateWorkerCount} autoFocus />
                  workers
                </form>
              </div>
            </div>
            :
            <div>
              <div className='row section'>
                <div className='col-12'>
                  <h3 className='table-label'>Worker Node Configuration</h3>
                  <div className='checkbox'>
                    <label htmlFor='syncWorkers'>
                      <input type='checkbox' ref='syncWorkers' id='syncWorkers' onChange={this.syncWorkersChanged} checked={this.state.syncWorkers}/>
                      Use same configuration for all worker nodes
                    </label>
                  </div>
                </div>
              </div>
              <div className='row'>
                {
                  this.state.workers.map((worker, index) => {
                    return <NewKVMWorker key={'Worker ' + worker.id}
                                         worker={worker}
                                         index={index}
                                         readOnly={this.state.syncWorkers && index !== 0}
                                         deleteWorker={this.deleteWorker.bind(this, index)}
                                         onWorkerUpdated={this.updateWorker.bind(this, index)} />;
                  })
                }
                <div className={'col-4 new-cluster--add-worker-button ' + (this.state.workers.length < 3 ? 'warning' : '')} onClick={this.addWorker}>
                  <div className="new-cluster--add-worker-button-title">
                    Add a worker
                  </div>
                  {
                    this.state.workers.length < 3 ?
                      <div className="new-cluster--low-worker-warning">
                        We recommend that you have at least three worker nodes in a cluster
                      </div>
                      : ''
                  }
                </div>
              </div>
            </div>
          }
          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Kubernetes Version</h3>
            </div>
            <div className='col-9'>
              <p>1.5.2 (Default)</p>
            </div>
          </div>

          <div className='row'>
            <div className='col-3'>
              <h3 className='table-label'>Master Sizing</h3>
            </div>
            <div className='col-9'>
              <p>Auto Sized (Default)</p>
            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Monthly Cost Preview</h3>
            </div>
            <div className='col-9'>
              <p>We're still working on our pricing.</p>
            </div>
          </div>

          <div className='row section new-cluster--launch'>
            <div className='col-12'>
              <p>Create this cluster now and it will be available for you to use as soon as possible</p>
              <Button type='button'
                      bsSize='large'
                      bsStyle='primary'
                      onClick={this.createCluster}
                      loading={this.state.submitting}>Create Cluster</Button>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

CreateCluster.propTypes = {
  selectedOrganization: React.PropTypes.string,
  dispatch: React.PropTypes.func,
  authToken: React.PropTypes.string
};

function mapStateToProps(state) {
  var selectedOrganization = state.app.selectedOrganization;

  return {
    selectedOrganization: selectedOrganization,
    authToken: state.app.loggedInUser.authToken
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCluster);