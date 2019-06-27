import NumberPicker from './number_picker.js';
import PropTypes from 'prop-types';
import React from 'react';

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
              <i className='fa fa-close' />
            </span>
          ) : (
            undefined
          )}
        </div>

        <NumberPicker
          key={'worker-cpu-' + index + this.props.readOnly}
          label='CPU Cores'
          max={999}
          min={1}
          onChange={this.updateWorkerCPU}
          readOnly={this.props.readOnly}
          stepSize={1}
          value={worker.cpu}
          workerId={worker.id}
        />

        <NumberPicker
          key={'worker-memory-' + index + this.props.readOnly}
          label='Memory'
          max={999}
          min={1}
          onChange={this.updateWorkerMemory}
          readOnly={this.props.readOnly}
          stepSize={1}
          unit='GB'
          value={worker.memory}
          workerId={worker.id}
        />

        <NumberPicker
          key={'worker-storage-' + index + this.props.readOnly}
          label='Storage'
          max={999}
          min={10}
          onChange={this.updateWorkerStorage}
          readOnly={this.props.readOnly}
          stepSize={10}
          unit='GB'
          value={worker.storage}
          workerId={worker.id}
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
