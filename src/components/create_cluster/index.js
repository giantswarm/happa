'use strict';

import React from 'react';
import {connect} from 'react-redux';
import DocumentTitle from 'react-document-title';
import Button from '../button';
import NumberPicker from './number_picker.js';
import { WithContext as ReactTags } from 'react-tag-input';
import _ from 'underscore';
// import update from 'react-addons-update';

class CreateCluster extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      availableVersions: ['1.4.6', '1.4.7', '1.5.0', '1.5.1'],
      clusterName: 'My cluster',
      workers: [
        {
          id: Date.now(),
          cpu: '1',
          memory: '1',
          storage: '200',
          tags: [],
          suggestions: ['Banana', 'Mango', 'Pear', 'Apricot']
        }
      ],
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
    var newDefaultWorker = {
      id: Date.now(),
      cpu: '1',
      memory: '1',
      storage: '200',
      tags: [],
      suggestions: ['Banana', 'Mango', 'Pear', 'Apricot']
    };

    var workers = [].concat(this.state.workers, newDefaultWorker);

    this.setState({
      workers: workers
    });
  }

  deleteTag = (worker, i) => {
    let tags = worker.tags;
    tags.splice(i, 1);

    worker.tags = tags;
  }

  addTag = (worker, tag) => {
    let tags = worker.tags;

    tags.push({
      id: tags.length + 1,
      text: tag
    });

    worker.tags = tags;
  }

  dragTag = (worker, tag, currPos, newPos) => {
    let tags = this.state.tags;

    // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: tags });
  }

  createCluster = () => {

  }

  render() {
    return (
      <DocumentTitle title={'Create Cluster | ' + this.props.selectedOrganization + ' | Giant Swarm'}>
        <div>
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
                <input ref='cluster_name' type="text" value={this.state.clusterName} onChange={this.updateClusterName} />
              </form>
            </div>
          </div>

          <div className='row section'>
            <div className='col-12'>
              <h3 className='table-label'>Worker Configuration</h3>
            </div>
          </div>
          <div className='row'>
            {
              this.state.workers.map((worker, index) => {
                return <div className='col-4 new-cluster--worker' key={'Worker ' + worker.id}>
                  <div className="new-cluster--worker-title">
                    { 'Worker ' + (index + 1) }
                    {
                      index > 0
                        ?
                        <span className="new-cluster--delete" onClick={this.deleteWorker.bind(this, index)}>x</span>
                        :
                        undefined
                    }
                  </div>

                  <NumberPicker label="CPU" stepSize={1} initialValue={1} min={1} max={10} />
                  <NumberPicker label="Memory" unit="GB" stepSize={1} initialValue={1} min={1} max={100} />
                  <NumberPicker label="Storage" unit="GB" stepSize={10} initialValue={20} min={20} max={100} />

                  <div className="new-cluster--worker-setting-row">
                    <div className="new-cluster--worker-setting-label">
                      Labels
                    </div>
                    <div className="new-cluster--worker-setting-label-control">
                     <ReactTags tags={worker.tags}
                          suggestions={worker.suggestions}
                          placeholder="Add a label"
                          autofocus={false}
                          handleDelete={this.deleteTag.bind(this, worker)}
                          handleAddition={this.addTag.bind(this, worker)}
                          handleDrag={this.dragTag.bind(this, worker)} />
                    </div>
                  </div>
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
              <p>1.4.6 (Default)</p>
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

          <div className='row section'>
            <div className='col-12'>
              <p>Create this cluster now and it will be available for you to use as soon as possible</p>
              <Button type='button'
                      bsSize='large'
                      bsStyle='primary'
                      onClick={this.createCluster}>Create Cluster</Button>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

CreateCluster.propTypes = {
  selectedOrganization: React.PropTypes.string
};

function mapStateToProps(state) {
  var selectedOrganization = state.app.selectedOrganization;

  return {
    selectedOrganization: selectedOrganization
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCluster);