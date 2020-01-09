import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Button';
import InputField from 'shared/InputField';
import PropTypes from 'prop-types';
import React from 'react';

class AzureVMSizeSelector extends React.Component {
  constructor(props) {
    super(props);

    let vmSizes = {};
    if (window.config.azureCapabilitiesJSON !== '') {
      vmSizes = JSON.parse(window.config.azureCapabilitiesJSON);
    }

    const availableVMSizes = [];
    // Create a list of only the allowed VM sizes.
    props.allowedVMSizes.forEach(vs => {
      if (typeof vmSizes[vs] === 'object') {
        availableVMSizes.push(vmSizes[vs]);
      }
    });

    // eslint-disable-next-line react/state-in-constructor
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
    }

    return '';
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
    let valid = false;
    let validationError = 'Please enter a valid vm size';

    const validVMSizes = this.state.vmSizes.map(x => {
      return x.name;
    });

    if (validVMSizes.indexOf(vmSize) !== -1) {
      valid = true;
      validationError = '';
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
              autoFocus
              onChange={this.updateVMSize}
              readOnly={this.props.readOnly}
              type='text'
              validate={this.validateVMSize}
              value={this.props.value}
            />

            <div
              className={`new-cluster--instance-type-selector-button ${this.buttonClass()}`}
              onClick={this.showModal}
            >
              <i className='fa fa-menu' />
            </div>
          </form>
        </div>
        <BootstrapModal
          className='new-cluster--instance-type-selector-modal aws'
          onHide={this.closeModal}
          show={this.state.modalVisible}
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
                      className={
                        vmSize.name === this.state.preSelectedVMSize
                          ? 'selected'
                          : ''
                      }
                      key={vmSize.name}
                      onClick={this.preSelect.bind(this, vmSize.name)}
                    >
                      <td>
                        <input
                          checked={vmSize.name === this.state.preSelectedVMSize}
                          readOnly
                          type='radio'
                        />
                      </td>
                      <td>{vmSize.name}</td>
                      <td className='description'>{vmSize.description}</td>
                      <td className='numeric'>{vmSize.numberOfCores}</td>
                      <td className='numeric'>
                        {/* eslint-disable-next-line no-magic-numbers */}
                        {(vmSize.memoryInMb / 1000).toFixed(2)} GB
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </BootstrapModal.Body>
          <BootstrapModal.Footer>
            <Button bsStyle='primary' onClick={this.selectVMSize} type='submit'>
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
