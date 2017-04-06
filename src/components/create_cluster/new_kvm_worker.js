'use strict';

import React from 'react';
import NumberPicker from './number_picker.js';

class NewKVMWorker extends React.Component {
  updateWorkerCPU = (cpu) => {
    this.props.worker.cpu = cpu;
    this.props.onWorkerUpdated(this.props.worker);
  }

  updateWorkerMemory = (memory) => {
    this.props.worker.memory = memory;
    this.props.onWorkerUpdated(this.props.worker);
  }

  updateWorkerStorage = (storage) => {
    this.props.worker.storage = storage;
    this.props.onWorkerUpdated(this.props.worker);
  }

  render() {
    var worker = this.props.worker;
    var index = this.props.index;
    return (
      <div className='col-4 new-cluster--worker'>
        <div className="new-cluster--worker-title">
          { 'Worker #' + (index + 1) }
          {
            index > 0
              ?

              <span className="new-cluster--delete" onClick={this.props.deleteWorker}><i className='fa fa-times' /></span>
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
                      readOnly={this.props.readOnly && index !== 0}
        />

        <NumberPicker label="Memory"
                      unit="GB"
                      stepSize={1}
                      value={worker.memory}
                      min={1} max={16}
                      workerId={worker.id}
                      onChange={this.updateWorkerMemory}
                      readOnly={this.props.readOnly && index !== 0}
        />

        <NumberPicker label="Storage"
                      unit="GB"
                      stepSize={10}
                      value={worker.storage}
                      min={10} max={100}
                      workerId={worker.id}
                      onChange={this.updateWorkerStorage}
                      readOnly={this.props.readOnly && index !== 0}
        />
      </div>
    );
  }
}

NewKVMWorker.propTypes = {
  worker: React.PropTypes.object,
  index: React.PropTypes.number,
  readOnly: React.PropTypes.bool,
  deleteWorker: React.PropTypes.func,
  onWorkerUpdated: React.PropTypes.func
};

export default NewKVMWorker;