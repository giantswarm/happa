'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../button';

class NewAWSWorker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      preSelectedInstanceTypeName: props.worker.instanceType,
      instanceTypes: [
        {name: 'm3.large', description: 'M3 General Purpose Large', cpuCores: '2', memory: '7.5 GB', storage: '32 GB'},
        {name: 'm3.xlarge', description: 'M3 General Purpose Extra Large', cpuCores: '4', memory: '15 GB', storage: '80 GB'},
        {name: 'm3.2xlarge', description: 'M3 General Purpose Double Extra Large', 'memory': '30 GB', cpuCores: '8', storage: '160 GB'},
        {name: 'r3.large', description: 'R3 High-Memory Large', 'memory': '15.25', cpuCores: '2', storage: '32 GB'},
        {name: 'r3.xlarge', description: 'R3 High-Memory Extra Large', 'memory': '30.5 GB',  cpuCores: '4', storage: '80 GB'},
        {name: 'r3.2xlarge', description: 'R3 High-Memory Double Extra Large', 'memory': '61 GB',  cpuCores: '8', storage: '160 GB'},
        {name: 'r3.4xlarge', description: 'R3 High-Memory Quadruple Extra Large', 'memory': '122 GB', cpuCores: '16',  storage: '320 GB'},
        {name: 'r3.8xlarge', description: 'R3 High-Memory Eight Extra Large', 'memory': '244 GB', cpuCores: '32', storage: '640 GB'}
      ]
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

  updateInstanceType = (event) => {
    var value = event.target.value;
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

        <div className="new-cluster--aws-instance-type-selector">
          <form onSubmit={(e) => {e.preventDefault();}}>
            <input ref='instance_type'
                   type="text"
                   value={this.props.worker.instanceType}
                   onChange={this.updateInstanceType}
                   autoFocus
                   readOnly={this.props.readOnly} />


            <div className={'new-cluster--aws-instance-type-selector-button ' + this.buttonClass()} onClick={this.showModal}>
              <i className='fa fa-bars' />
            </div>
          </form>
        </div>
        <BootstrapModal show={this.state.modalVisible} onHide={this.closeModal}>
          <BootstrapModal.Header closeButton>
            <BootstrapModal.Title>Select an Instance Type</BootstrapModal.Title>
          </BootstrapModal.Header>
          <BootstrapModal.Body>
            <table className='new-cluster--aws-instance-type-selector-table'>
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
  worker: React.PropTypes.object,
  index: React.PropTypes.number,
  readOnly: React.PropTypes.bool,
  deleteWorker: React.PropTypes.func,
  onWorkerUpdated: React.PropTypes.func
};

export default NewAWSWorker;