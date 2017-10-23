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
import NewAWSWorker from './new_aws_worker.js';

class CreateCluster extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availableVersions: ['1.4.6', '1.4.7', '1.5.0', '1.5.1', '1.5.2', '1.6.4', '1.7.3', '1.7.5', '1.8.1'],
      selectedVersion: '1.8.1',
      clusterName: 'My cluster',
      workerCount: 3,
      syncWorkers: true,
      workers: [
        { id: 1, cpu: 1, memory: 1, storage: 10, instanceType: 'm3.large', valid: true },
        { id: 2, cpu: 1, memory: 1, storage: 10, instanceType: 'm3.large', valid: true },
        { id: 3, cpu: 1, memory: 1, storage: 10, instanceType: 'm3.large', valid: true }
      ],
      submitting: false,
      valid: true,
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
        instanceType: this.state.workers[0].instanceType,
        valid: this.state.workers[0].valid
      };
    } else {
      newDefaultWorker = {
        id: Date.now(),
        cpu: 1,
        memory: 1,
        storage: 20,
        instanceType: 'm3.large',
        valid: true
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
          instanceType: worker1.instanceType,
          valid: worker1.valid,
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
      workers = this.state.workers.map((worker) => {
        return {
          aws: {
            instance_type: worker.instanceType
          }
        };
      });
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

  valid = () => {
    var workers = this.state.workers;
    for (var i = 0; i < workers.length; i++) {
      if (! workers[i].valid) {
        return false;
      }
    }

    return true;
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

          <div>
            <div className='row section'>
              <div className='col-12'>
                <h3 className='table-label'>Worker Node Configuration</h3>
                {
                  window.config.createClusterWorkerType === 'kvm' ?
                    <div className='checkbox'>
                      <label htmlFor='syncWorkers'>
                        <input type='checkbox' ref='syncWorkers' id='syncWorkers' onChange={this.syncWorkersChanged} checked={this.state.syncWorkers}/>
                        Use same configuration for all worker nodes
                      </label>
                    </div>
                  :
                    undefined
                }
              </div>
            </div>
            <div className='row'>
              {
                this.state.workers.map((worker, index) => {
                  if (window.config.createClusterWorkerType === 'aws') {
                    return <NewAWSWorker key={'Worker ' + worker.id}
                                       worker={worker}
                                       index={index}
                                       readOnly={this.state.syncWorkers && index !== 0}
                                       deleteWorker={this.deleteWorker.bind(this, index)}
                                       onWorkerUpdated={this.updateWorker.bind(this, index)} />;
                  } else if (window.config.createClusterWorkerType === 'kvm') {
                    return <NewKVMWorker key={'Worker ' + worker.id}
                                       worker={worker}
                                       index={index}
                                       readOnly={this.state.syncWorkers && index !== 0}
                                       deleteWorker={this.deleteWorker.bind(this, index)}
                                       onWorkerUpdated={this.updateWorker.bind(this, index)} />;
                  }
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

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Kubernetes Version</h3>
            </div>
            <div className='col-9'>
              <p>1.8.1 (Default)</p>
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

          <div className='row section new-cluster--launch'>
            <div className='col-12'>
              <p>Create this cluster now and it will be available for you to use as soon as possible</p>
              <Button type='button'
                      bsSize='large'
                      bsStyle='primary'
                      onClick={this.createCluster}
                      loading={this.state.submitting}
                      disabled={!this.valid()}>Create Cluster
              </Button>
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
