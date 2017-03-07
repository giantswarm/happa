'use strict';

import React from 'react';
import {connect} from 'react-redux';
import DocumentTitle from 'react-document-title';
import Button from '../button';
import NumberPicker from './number_picker.js';
import _ from 'underscore';
import { browserHistory } from 'react-router';
import { flashAdd } from '../../actions/flashMessageActions';
import GiantSwarm from '../../lib/giantswarm_client_wrapper';
import update from 'react-addons-update';

class CreateCluster extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availableVersions: ['1.4.6', '1.4.7', '1.5.0', '1.5.1', '1.5.2'],
      selectedVersion: '1.5.2',
      clusterName: 'My cluster',
      syncWorkers: true,
      workers: [
        { id: 1, cpu: 1, memory: 1, storage: 10 },
        { id: 2, cpu: 1, memory: 1, storage: 10 },
        { id: 3, cpu: 1, memory: 1, storage: 10 }
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
        storage: this.state.workers[0].storage
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
          storage: worker1.storage
        };
      });
    }

    this.setState({
      syncWorkers: e.target.checked,
      workers: workers
    });
  }

  updateWorkerCPU = (workerId, cpu) => {
    var worker = this.state.workers.find((worker) => {
      return worker.id === workerId;
    });

    var index = this.state.workers.indexOf(worker);

    worker.cpu = cpu;
    var newState;

    if (this.state.syncWorkers) {
      var workers = this.state.workers.map((worker) => {
        worker.cpu = cpu;
        return worker;
      });
      newState = update(this.state, {
        workers: {$set: workers}
      });
    } else {
      newState = update(this.state, {
        workers: {$splice: [[index, 1, worker]]}
      });
    }

    this.setState(newState);
  }

  updateWorkerMemory = (workerId, memory) => {
    var worker = this.state.workers.find((worker) => {
      return worker.id === workerId;
    });

    var index = this.state.workers.indexOf(worker);

    worker.memory = memory;
    var newState;

    if (this.state.syncWorkers) {
      var workers = this.state.workers.map((worker) => {
        worker.memory = memory;
        return worker;
      });
      newState = update(this.state, {
        workers: {$set: workers}
      });
    } else {
      newState = update(this.state, {
        workers: {$splice: [[index, 1, worker]]}
      });
    }

    this.setState(newState);
  }

  updateWorkerStorage = (workerId, storage) => {
    var worker = this.state.workers.find((worker) => {
      return worker.id === workerId;
    });

    var index = this.state.workers.indexOf(worker);

    worker.storage = storage;
    var newState;

    if (this.state.syncWorkers) {
      var workers = this.state.workers.map((worker) => {
        worker.storage = storage;
        return worker;
      });
      newState = update(this.state, {
        workers: {$set: workers}
      });
    } else {
      newState = update(this.state, {
        workers: {$splice: [[index, 1, worker]]}
      });
    }

    this.setState(newState);
  }

  createCluster = () => {
    this.setState({
      submitting: true
    });

    var giantSwarm = new GiantSwarm.Client(this.props.authToken);

    giantSwarm.createCluster({
      clusterName: this.state.clusterName,
      owner: this.props.selectedOrganization,
      workers: this.state.workers.map((worker) => {
        return {
          memory: {size_gb: String(worker.memory)},
          storage: {size_gb: String(worker.storage)},
          cpu: {cores: worker.cpu}
        };
      })
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

    setTimeout(() => {

    }, 1000);
  }

  componentDidMount() {
    this.refs.cluster_name.select();
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
              <form>
                <p>Give your cluster a name so you can recognize it in a crowd.</p>
                <input ref='cluster_name' type="text" value={this.state.clusterName} onChange={this.updateClusterName} autoFocus />
              </form>
            </div>
          </div>

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
                return <div className='col-4 new-cluster--worker' key={'Worker ' + worker.id}>
                  <div className="new-cluster--worker-title">
                    { 'Worker #' + (index + 1) }
                    {
                      index > 0
                        ?

                        <span className="new-cluster--delete" onClick={this.deleteWorker.bind(this, index)}><i className='fa fa-times' /></span>
                        :
                        undefined
                    }
                  </div>

                  <NumberPicker label="CPU Cores"
                                stepSize={1}
                                value={worker.cpu}
                                min={1} max={10}
                                workerId={worker.id}
                                onChange={this.updateWorkerCPU}
                                readOnly={this.state.syncWorkers && index !== 0}
                  />

                  <NumberPicker label="Memory"
                                unit="GB"
                                stepSize={1}
                                value={worker.memory}
                                min={1} max={16}
                                workerId={worker.id}
                                onChange={this.updateWorkerMemory}
                                readOnly={this.state.syncWorkers && index !== 0}
                  />

                  <NumberPicker label="Storage"
                                unit="GB"
                                stepSize={10}
                                value={worker.storage}
                                min={10} max={100}
                                workerId={worker.id}
                                onChange={this.updateWorkerStorage}
                                readOnly={this.state.syncWorkers && index !== 0}
                  />
                </div>;
              })
            }
            <div className='col-4 new-cluster--add-worker' onClick={this.addWorker}>
              Add a worker
            </div>
          </div>

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