'use strict';

import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../shared/button';
import InputField from '../shared/input_field';
import PropTypes from 'prop-types';

class AWSInstanceTypeSelector extends React.Component {
  constructor(props) {
    super(props);

    // devInstanceTypes are placeholder instance types for the dev environment.
    // In the dev environment window.config.awsCapabilitiesJson is not set to anything.
    // It would normally be set by the value in the installations repo.
    var devInstanceTypes = {
      'm3.large': {
        description: 'M3 General Purpose Large',
        memory_size_gb: '7.5',
        cpu_cores: '2',
        storage_size_gb: '32',
      },
      'm3.xlarge': {
        description: 'M3 General Purpose Extra Large',
        memory_size_gb: '15',
        cpu_cores: '4',
        storage_size_gb: '80',
      },
      'm3.2xlarge': {
        description: 'M3 General Purpose Double Extra Large',
        memory_size_gb: '30',
        cpu_cores: '8',
        storage_size_gb: '160',
      },
    };

    // Use devInstanceTypes unless there is something set for window.config.awsCapabilitiesJSON
    var instanceTypes = devInstanceTypes;
    if (window.config.awsCapabilitiesJSON != '') {
      instanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);
    }

    var availableInstanceTypes = [];
    // Create a list of only the allowed instance types
    props.allowedInstanceTypes.forEach(function(it) {
      if (typeof instanceTypes[it] === 'object') {
        availableInstanceTypes.push(
          Object.assign({}, instanceTypes[it], { name: it })
        );
      }
    });

    this.state = {
      modalVisible: false,
      selectedInstanceType: props.value,
      instanceTypes: availableInstanceTypes,
    };
  }

  showModal = () => {
    if (!this.props.readOnly) {
      this.setState({
        modalVisible: true,
        selectedInstanceType: this.props.value,
      });
    }
  };

  closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  };

  updateInstanceType = instanceType => {
    this.props.onChange({
      valid: this.state.valid,
      value: instanceType,
    });
  };

  buttonClass() {
    if (this.props.readOnly) {
      return 'disabled';
    } else {
      return '';
    }
  }

  preSelect(instanceTypeName) {
    this.setState({
      preSelectedInstanceTypeName: instanceTypeName,
    });
  }

  selectInstanceType = () => {
    this.props.onChange({
      value: this.state.preSelectedInstanceTypeName,
      valid: true,
    });
    this.closeModal();
  };

  validateInstanceType = instanceTypeName => {
    var valid;
    var validationError;

    var validInstanceTypes = this.state.instanceTypes.map(x => {
      return x.name;
    });

    if (validInstanceTypes.indexOf(instanceTypeName) != -1) {
      valid = true;
      validationError = '';
    } else {
      valid = false;
      validationError = 'Please enter a valid instance type';
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
              ref={i => {
                this.instance_type = i;
              }}
              type='text'
              value={this.props.value}
              onChange={this.updateInstanceType}
              validate={this.validateInstanceType}
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
            <BootstrapModal.Title>Select an Instance Type</BootstrapModal.Title>
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
                {this.state.instanceTypes.map(instanceType => {
                  return (
                    <tr
                      key={instanceType.name}
                      onClick={this.preSelect.bind(this, instanceType.name)}
                    >
                      <td>
                        <input
                          type='radio'
                          readOnly
                          checked={
                            instanceType.name ===
                            this.state.preSelectedInstanceTypeName
                          }
                        />
                      </td>
                      <td>{instanceType.name}</td>
                      <td className='description'>
                        {instanceType.description}
                      </td>
                      <td className='numeric'>{instanceType.cpu_cores}</td>
                      <td className='numeric'>
                        {instanceType.memory_size_gb} GB
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </BootstrapModal.Body>
          <BootstrapModal.Footer>
            <Button
              type='submit'
              bsStyle='primary'
              onClick={this.selectInstanceType}
            >
              Select Instance Type
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

AWSInstanceTypeSelector.propTypes = {
  allowedInstanceTypes: PropTypes.array,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
};

export default AWSInstanceTypeSelector;
