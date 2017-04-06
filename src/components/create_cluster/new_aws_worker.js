'use strict';

import React from 'react';

class NewAWSWorker extends React.Component {
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
    // var worker = this.props.worker;
    var index = this.props.index;
    return (
      <div className='col-4 new-cluster--worker'>
        <div className="new-cluster--worker-title">
          { 'AWS Worker #' + (index + 1) }
          {
            index > 0
              ?

              <span className="new-cluster--delete" onClick={this.props.deleteWorker}><i className='fa fa-times' /></span>
              :
              undefined
          }
        </div>
      </div>
    );
  }
}

NewAWSWorker.propTypes = {
  worker: React.PropTypes.object,
  index: React.PropTypes.number,
  readOnly: React.PropTypes.bool,
  deleteWorker: React.PropTypes.func,
  onWorkerUpdated: React.PropTypes.func
};

export default NewAWSWorker;