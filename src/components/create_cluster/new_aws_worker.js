'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../button';
import InputField from '../shared/input_field';

class NewAWSWorker extends React.Component {
  constructor(props) {
    super(props);

    var allInstanceTypes = [
      {name: 'm3.large'   , description: 'M3 General Purpose Large'                 , memory: '7.5 GB'  , cpuCores: '2'                   , storage: '32 GB'}    ,
      {name: 'm3.xlarge'  , description: 'M3 General Purpose Extra Large'           , memory: '15 GB'   , cpuCores: '4'                   , storage: '80 GB'}    ,
      {name: 'm3.2xlarge' , description: 'M3 General Purpose Double Extra Large'    , memory: '30 GB'   , cpuCores: '8'                   , storage: '160 GB'}   ,
      {name: 'r3.large'   , description: 'R3 High-Memory Large'                     , memory: '15.25'   , cpuCores: '2'                   , storage: '32 GB'}    ,
      {name: 'r3.xlarge'  , description: 'R3 High-Memory Extra Large'               , memory: '30.5 GB' , cpuCores: '4'                   , storage: '80 GB'}    ,
      {name: 'r3.2xlarge' , description: 'R3 High-Memory Double Extra Large'        , memory: '61 GB'   , cpuCores: '8'                   , storage: '160 GB'}   ,
      {name: 'r3.4xlarge' , description: 'R3 High-Memory Quadruple Extra Large'     , memory: '122 GB'  , cpuCores: '16'                  , storage: '320 GB'}   ,
      {name: 'r3.8xlarge' , description: 'R3 High-Memory Eight Extra Large'         , memory: '244 GB'  , cpuCores: '32'                  , storage: '640 GB'}   ,
      {name: 'm4.large'   , description: 'M4 General Purpose Large'                 , cpuCores: '2'     , memory: '7.5 GB'                , storage: 'EBS-only'} ,
      {name: 'm4.xlarge'  , description: 'M4 General Purpose Extra Large'           , cpuCores: '4'     , memory: '15 GB'                 , storage: 'EBS-only'} ,
      {name: 'm4.2xlarge' , description: 'M4 General Purpose Double Extra Large'    , memory: '30 GB'   , cpuCores: '8'                   , storage: 'EBS-only'} ,
      {name: 'm4.4xlarge' , description: 'M4 General Purpose Four Extra Large'      , memory: '61 GB'   , cpuCores: '16'                  , storage: 'EBS-only'} ,
      {name: 'm5.large'   , description: 'M5 General Purpose Large'                 , memory: '8'       , cpuCores: '2'                   , storage: 'EBS-Only'} ,
      {name: 'm5.xlarge'  , description: 'M5 General Purpose Extra Large'           , memory: '16'      , cpuCores: '4'                   , storage: 'EBS-Only'} ,
      {name: 'm5.2xlarge' , description: 'M5 General Purpose Double Extra Large'    , memory: '32'      , cpuCores: '8'                   , storage: 'EBS-Only'} ,
      {name: 'm5.4xlarge' , description: 'M5 General Purpose Quadruple Extra Large' , memory: '64'      , cpuCores: '16'                  , storage: 'EBS-Only'} ,
      {name: 't2.large'   , description: 'T2 General Purpose Large'                 , memory: '8'       , cpuCores: '36 credits p/hour'   , storage: 'EBS-Only'} ,
      {name: 't2.xlarge'  , description: 'T2 General Purpose Extra Large'           , memory: '16'      , cpuCores: '54 credits p/hour'   , storage: 'EBS-Only'} ,
      {name: 't2.2xlarge' , description: 'T2 General Purpose Double Extra Large'    , memory: '32'      , cpuCores: '81 credits p/hour'   , storage: 'EBS-Only'} ,
      {name: 'c5.2xlarge' , description: 'C5 Compute Optimized Double Extra Large'  , memory: '16'      , cpuCores: '8'                   , storage: 'EBS-Only'} ,
      {name: 'i3.xlarge'  , description: 'I3 Storage Optimized Extra Large'         , memory: '30.5'    , cpuCores: '4'                   , storage: '1 x 0.95 NVMe SSD'}
    ];

    var availableInstanceTypes = allInstanceTypes.filter(x => props.allowedInstanceTypes.indexOf(x.name) !== -1);

    this.state = {
      modalVisible: false,
      preSelectedInstanceTypeName: props.worker.instanceType,
      instanceTypes: availableInstanceTypes,
    };
  }

  showModal = () => {
    if ( ! this.props.readOnly) {
      this.setState({
        modalVisible: true,
        preSelectedInstanceTypeName: this.props.worker.instanceType
      });
    }
  }

  closeModal = () => {
    this.setState({
      modalVisible: false
    });
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

  preSelect(instanceTypeName) {
    this.setState({
      preSelectedInstanceTypeName: instanceTypeName
    });
  }

  selectInstanceType = () => {
    this.props.worker.instanceType = this.state.preSelectedInstanceTypeName;
    this.props.onWorkerUpdated(this.props.worker);
    this.closeModal();
  }

  validateInstanceType = (instanceTypeName) => {
    var validInstanceTypes = this.state.instanceTypes.map((x) => {
      return x.name;
    });

    if (validInstanceTypes.indexOf(instanceTypeName) != -1) {
      this.props.worker.valid = true;
      this.props.onWorkerUpdated(this.props.worker);

      return {
        valid: true,
        validationError: ''
      };
    }

    this.props.worker.valid = false;
    this.props.onWorkerUpdated(this.props.worker);

    return {
      valid: false,
      validationError: 'Please enter a valid instance type'
    };
  }

  render() {
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
        <div className="new-cluster--worker-setting-label">
          Instance Type
        </div>

        <div className="new-cluster--instance-type-selector">
          <form onSubmit={(e) => {e.preventDefault();}}>
            <InputField ref={(i) => {this.instance_type = i;}}
                   type="text"
                   value={this.props.worker.instanceType}
                   onChange={this.updateInstanceType}
                   validate={this.validateInstanceType}
                   autoFocus
                   readOnly={this.props.readOnly} />

            <span>{this.props.worker.valid}</span>
            <div className={'new-cluster--instance-type-selector-button ' + this.buttonClass()} onClick={this.showModal}>
              <i className='fa fa-bars' />
            </div>
          </form>
        </div>
        <BootstrapModal show={this.state.modalVisible} onHide={this.closeModal} className="new-cluster--instance-type-selector-modal">
          <BootstrapModal.Header closeButton>
            <BootstrapModal.Title>Select an Instance Type</BootstrapModal.Title>
          </BootstrapModal.Header>
          <BootstrapModal.Body>
            <table className='new-cluster--instance-type-selector-table'>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Description</th>
                  <th className="numeric">CPU Cores</th>
                  <th className="numeric">Memory</th>
                  <th className="numeric">Storage</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.instanceTypes.map((instanceType) => {
                    return <tr key={instanceType.name} onClick={this.preSelect.bind(this, instanceType.name)}>
                      <td><input type='radio' readOnly checked={instanceType.name === this.state.preSelectedInstanceTypeName}/></td>
                      <td>{instanceType.name}</td>
                      <td className="description">{instanceType.description}</td>
                      <td className="numeric">{instanceType.cpuCores}</td>
                      <td className="numeric">{instanceType.memory}</td>
                      <td className="numeric">{instanceType.storage}</td>
                    </tr>;
                  })
                }
              </tbody>
            </table>
          </BootstrapModal.Body>
          <BootstrapModal.Footer>
            <Button
              type='submit'
              bsStyle='primary'
              onClick={this.selectInstanceType}>
              Select Instance Type
            </Button>

            <Button
              bsStyle='link'
              onClick={this.closeModal}>
              Cancel
            </Button>
          </BootstrapModal.Footer>
        </BootstrapModal>
      </div>
    );
  }
}

NewAWSWorker.propTypes = {
  allowedInstanceTypes: React.PropTypes.array,
  worker: React.PropTypes.object,
  index: React.PropTypes.number,
  readOnly: React.PropTypes.bool,
  deleteWorker: React.PropTypes.func,
  onWorkerUpdated: React.PropTypes.func
};

export default NewAWSWorker;
