'use strict';

import React from 'react';
import NumberPicker from './number_picker.js';
import PropTypes from 'prop-types';

class NewKVMWorker extends React.Component {
  updateWorkerCPU = numberPicker => {
    this.props.worker.cpu = numberPicker.value;
    this.props.onWorkerUpdated(this.props.worker);
  };

  updateWorkerMemory = numberPicker => {
    this.props.worker.memory = numberPicker.value;
    this.props.onWorkerUpdated(this.props.worker);
  };

  updateWorkerStorage = numberPicker => {
    this.props.worker.storage = numberPicker.value;
    this.props.onWorkerUpdated(this.props.worker);
  };

  render() {
    var worker = this.props.worker;
    var index = this.props.index;
    return (
      <div className='col-4 new-cluster--worker'>
        <div className='new-cluster--worker-title'>
          {'Worker #' + (index + 1)}
          {index > 0 ? (
            <span
              className='new-cluster--delete'
              onClick={this.props.deleteWorker}
            >
              <i className='fa fa-times' />
            </span>
          ) : (
            undefined
          )}
        </div>

        <NumberPicker
          label='CPU Cores'
          stepSize={1}
          value={worker.cpu}
          min={1}
          max={999}
          workerId={worker.id}
          onChange={this.updateWorkerCPU}
          readOnly={this.props.readOnly}
          key={'worker-cpu-'+index+this.props.readOnly}
        />

        <NumberPicker
          label='Memory'
          unit='GB'
          stepSize={1}
          value={worker.memory}
          min={1}
          max={999}
          workerId={worker.id}
          onChange={this.updateWorkerMemory}
          readOnly={this.props.readOnly}
          key={'worker-memory-'+index+this.props.readOnly}
        />

        <NumberPicker
          label='Storage'
          unit='GB'
          stepSize={10}
          value={worker.storage}
          min={10}
          max={999}
          workerId={worker.id}
          onChange={this.updateWorkerStorage}
          readOnly={this.props.readOnly}
          key={'worker-storage-'+index+this.props.readOnly}
        />
      </div>
    );
  }
}

NewKVMWorker.propTypes = {
  worker: PropTypes.object,
  index: PropTypes.number,
  readOnly: PropTypes.bool,
  deleteWorker: PropTypes.func,
  onWorkerUpdated: PropTypes.func,
};

export default NewKVMWorker;
