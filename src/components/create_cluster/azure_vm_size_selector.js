'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../shared/button';
import InputField from '../shared/input_field';
import PropTypes from 'prop-types';

class AzureVMSizeSelector extends React.Component {
  constructor(props) {
    super(props);

    // devVMSizes are placeholder VM sizes for the dev environment.
    // In the dev environment window.config.azureCapabilitiesJson is not set to anything.
    // It would normally be set by the value in the installations repo.
    var devVMSizes = {
      Standard_A2_v2: {
        additionalProperties: {},
        description: 'This is some description',
        maxDataDiskCount: 4,
        memoryInMb: 4294.967296,
        name: 'Standard_A2_v2',
        numberOfCores: 2,
        osDiskSizeInMb: 1047552,
        resourceDiskSizeInMb: 21474.83648,
      },
      Standard_A4_v2: {
        additionalProperties: {},
        description:
          'Here is a longer description that might be too long for the field',
        maxDataDiskCount: 8,
        memoryInMb: 8589.934592,
        name: 'Standard_A4_v2',
        numberOfCores: 4,
        osDiskSizeInMb: 1047552,
        resourceDiskSizeInMb: 42949.67296,
      },
      Standard_A8_v2: {
        additionalProperties: {},
        description: 'Another VM size description text',
        maxDataDiskCount: 16,
        memoryInMb: 17179.869184,
        name: 'Standard_A8_v2',
        numberOfCores: 8,
        osDiskSizeInMb: 1047552,
        resourceDiskSizeInMb: 85899.34592,
      },
    };

    // Use devVMSizes unless there is something set for window.config.azureCapabilitiesJSON
    var vmSizes = devVMSizes;
    if (window.config.azureCapabilitiesJSON != '') {
      vmSizes = JSON.parse(window.config.azureCapabilitiesJSON);
    }

    var availableVMSizes = [];
    // Create a list of only the allowed VM sizes.
    props.allowedVMSizes.forEach(function(vs) {
      if (typeof vmSizes[vs] === 'object') {
        availableVMSizes.push(vmSizes[vs]);
      }
    });

    this.state = {
      modalVisible: false,
      preSelectedVMSize: props.value,
      vmSizes: availableVMSizes,
    };
  }

  showModal = () => {
    if (!this.props.readOnly) {
      this.setState({
        modalVisible: true,
        preSelectedVMSize: this.props.value,
      });
    }
  };

  closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  };

  updateVMSize = vmSize => {
    this.props.onChange({
      valid: this.state.valid,
      value: vmSize,
    });
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
    this.props.onChange({
      value: this.state.preSelectedVMSize,
      valid: true,
    });
    this.closeModal();
  };

  validateVMSize = vmSize => {
    var valid;
    var validationError;

    var validVMSizes = this.state.vmSizes.map(x => {
      return x.name;
    });

    if (validVMSizes.indexOf(vmSize) != -1) {
      valid = true;
      validationError = '';
    } else {
      valid = false;
      validationError = 'Please enter a valid vm size';
    }

    this.setState({
      valid: valid,
    });

    return {
      valid: valid,
      validationError: validationError,
    };
  };

  render() {
    return (
      <div className='col-4'>
        <div className='new-cluster--instance-type-selector'>
          <form
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <InputField
              type='text'
              value={this.props.value}
              onChange={this.updateVMSize}
              validate={this.validateVMSize}
              autoFocus
              readOnly={this.props.readOnly}
            />

            <div
              className={
                'new-cluster--instance-type-selector-button ' +
                this.buttonClass()
              }
              onClick={this.showModal}
            >
              <i className='fa fa-menu' />
            </div>
          </form>
        </div>
        <BootstrapModal
          show={this.state.modalVisible}
          onHide={this.closeModal}
          className='new-cluster--instance-type-selector-modal aws'
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
                  <th>Description</th>
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
                      <td className='description'>{vmSize.description}</td>
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

AzureVMSizeSelector.propTypes = {
  allowedVMSizes: PropTypes.array,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
};

export default AzureVMSizeSelector;
