'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../button';
import InputField from '../shared/input_field';
import AzureCapabilities from './azure_capabilities.js';
import PropTypes from 'prop-types';

class NewAzureWorker extends React.Component {
  constructor(props) {
    super(props);

    var allVMSizes = AzureCapabilities;
    var availableVMSizes = allVMSizes.filter(
      x => props.allowedVMSizes.indexOf(x.name) !== -1
    );

    this.state = {
      modalVisible: false,
      preSelectedVMSize: props.worker.vmSize,
      vmSizes: availableVMSizes,
    };
  }

  showModal = () => {
    if (!this.props.readOnly) {
      this.setState({
        modalVisible: true,
        preSelectedVMSize: this.props.worker.vmSize,
      });
    }
  };

  closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  };

  updateVMSize = value => {
    this.props.worker.vmSize = value;
    this.props.onWorkerUpdated(this.props.worker);
  };

  buttonClass() {
    if (this.props.readOnly) {
      return 'disabled';
    } else {
      return '';
    }
  }

  preSelect(vmSize) {
    this.setState({
      preSelectedVMSize: vmSize,
    });
  }

  selectVMSize = () => {
    this.props.worker.vmSize = this.state.preSelectedVMSize;
    this.props.onWorkerUpdated(this.props.worker);
    this.closeModal();
  };

  validateVMSize = vmSize => {
    var validVMSizes = this.state.vmSizes.map(x => {
      return x.name;
    });

    if (validVMSizes.indexOf(vmSize) != -1) {
      this.props.worker.valid = true;
      this.props.onWorkerUpdated(this.props.worker);

      return {
        valid: true,
        validationError: '',
      };
    }

    this.props.worker.valid = false;
    this.props.onWorkerUpdated(this.props.worker);

    return {
      valid: false,
      validationError: 'Please enter a valid vm size',
    };
  };

  render() {
    var index = this.props.index;
    return (
      <div className='col-4 new-cluster--worker'>
        <div className='new-cluster--worker-title'>
          {'Azure Worker #' + (index + 1)}
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
        <div className='new-cluster--worker-setting-label'>VM Size</div>

        <div className='new-cluster--instance-type-selector'>
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <InputField
              ref={i => {
                this.vmSize = i;
              }}
              type='text'
              value={this.props.worker.vmSize}
              onChange={this.updateVMSize}
              validate={this.validateVMSize}
              autoFocus
              readOnly={this.props.readOnly}
            />

            <span>{this.props.worker.valid}</span>
            <div
              className={
                'new-cluster--instance-type-selector-button ' +
                this.buttonClass()
              }
              onClick={this.showModal}
            >
              <i className='fa fa-bars' />
            </div>
          </form>
        </div>
        <BootstrapModal
          show={this.state.modalVisible}
          onHide={this.closeModal}
          className='new-cluster--instance-type-selector-modal'
        >
          <BootstrapModal.Header closeButton>
            <BootstrapModal.Title>Select a VM Size</BootstrapModal.Title>
          </BootstrapModal.Header>
          <BootstrapModal.Body>
            <table className='new-cluster--instance-type-selector-table'>
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th className='numeric'>CPU Cores</th>
                  <th className='numeric'>Memory</th>
                </tr>
              </thead>
              <tbody>
                {this.state.vmSizes.map(vmSize => {
                  return (
                    <tr
                      key={vmSize.name}
                      onClick={this.preSelect.bind(this, vmSize.name)}
                    >
                      <td>
                        <input
                          type='radio'
                          readOnly
                          checked={vmSize.name === this.state.preSelectedVMSize}
                        />
                      </td>
                      <td>{vmSize.name}</td>
                      <td className='numeric'>{vmSize.numberOfCores}</td>
                      <td className='numeric'>
                        {(vmSize.memoryInMb / 1000).toFixed(2)} GB
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </BootstrapModal.Body>
          <BootstrapModal.Footer>
            <Button type='submit' bsStyle='primary' onClick={this.selectVMSize}>
              Select VM Size
            </Button>

            <Button bsStyle='link' onClick={this.closeModal}>
              Cancel
            </Button>
          </BootstrapModal.Footer>
        </BootstrapModal>
      </div>
    );
  }
}

NewAzureWorker.propTypes = {
  allowedVMSizes: PropTypes.array,
  worker: PropTypes.object,
  index: PropTypes.number,
  readOnly: PropTypes.bool,
  deleteWorker: PropTypes.func,
  onWorkerUpdated: PropTypes.func,
};

export default NewAzureWorker;
