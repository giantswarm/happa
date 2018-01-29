'use strict';

import React from 'react';
import InputField from '../shared/input_field';

class NewAzureWorker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  updateInstanceType = (value) => {
    this.props.worker.instanceType = value;
    this.props.onWorkerUpdated(this.props.worker);
  }

  buttonClass() {
    if (this.props.readOnly) {
      return 'disabled';
    } else {
      return '';
    }
  }

  render() {
    var index = this.props.index;
    return (
      <div className='col-4 new-cluster--worker'>
        <div className="new-cluster--worker-title">
          { 'Azure Worker #' + (index + 1) }
          {
            index > 0
              ?

              <span className="new-cluster--delete" onClick={this.props.deleteWorker}><i className='fa fa-times' /></span>
              :
              undefined
          }
        </div>

        <div className="new-cluster--worker-setting-label">
          VM Size
        </div>

        <div className="new-cluster--azure-instance-type-selector">
          <form onSubmit={(e) => {e.preventDefault();}}>
            <InputField ref={(i) => {this.instance_type = i;}}
                   type="text"
                   value="Standard_DS2_v2"
                   autoFocus
                   disabled={true}
                   readOnly={true} />
          </form>
        </div>
      </div>
    );
  }
}

NewAzureWorker.propTypes = {
  worker: React.PropTypes.object,
  index: React.PropTypes.number,
  readOnly: React.PropTypes.bool,
  deleteWorker: React.PropTypes.func,
  onWorkerUpdated: React.PropTypes.func
};

export default NewAzureWorker;
