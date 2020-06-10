import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import InputField from 'shared/InputField';
import Button from 'UI/Button';

const WrapperDiv = styled.div`
  max-width: 200px;
  .textfield,
  input[type='text'] {
    margin-bottom: 0;
    label {
      display: none;
    }
  }
`;

class AWSInstanceTypeSelector extends React.Component {
  constructor(props) {
    super(props);

    let instanceTypes = {};

    if (window.config.awsCapabilitiesJSON !== '') {
      instanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);
    }

    const availableInstanceTypes = [];
    // Create a list of only the allowed instance types
    props.allowedInstanceTypes.forEach((it) => {
      if (typeof instanceTypes[it] === 'object') {
        availableInstanceTypes.push(
          Object.assign({}, instanceTypes[it], { name: it })
        );
      }
    });

    // eslint-disable-next-line react/state-in-constructor
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

  updateInstanceType = (instanceType) => {
    this.props.onChange({
      valid: this.state.valid,
      value: instanceType,
    });
  };

  buttonClass() {
    if (this.props.readOnly) {
      return 'disabled';
    }

    return '';
  }

  preSelect(instanceTypeName) {
    this.setState({
      selectedInstanceType: instanceTypeName,
    });
  }

  selectInstanceType = () => {
    this.props.onChange({
      value: this.state.selectedInstanceType,
      valid: true,
    });
    this.closeModal();
  };

  validateInstanceType = (instanceTypeName) => {
    let valid = false;
    let validationError = 'Please enter a valid instance type';

    const validInstanceTypes = this.state.instanceTypes.map((x) => {
      return x.name;
    });

    if (validInstanceTypes.includes(instanceTypeName)) {
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
      <WrapperDiv>
        <div className='new-cluster--instance-type-selector'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <InputField
              autoFocus
              onChange={this.updateInstanceType}
              readOnly={this.props.readOnly}
              disabled={true}
              ref={(i) => {
                this.instance_type = i;
              }}
              type='text'
              validate={this.validateInstanceType}
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
                {this.state.instanceTypes.map((instanceType) => {
                  return (
                    <tr
                      className={
                        instanceType.name === this.state.selectedInstanceType
                          ? 'selected'
                          : ''
                      }
                      key={instanceType.name}
                      onClick={this.preSelect.bind(this, instanceType.name)}
                    >
                      <td>
                        <input
                          checked={
                            instanceType.name ===
                            this.state.selectedInstanceType
                          }
                          readOnly
                          type='radio'
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
              bsStyle='primary'
              onClick={this.selectInstanceType}
              type='submit'
            >
              Select Instance Type
            </Button>

            <Button bsStyle='link' onClick={this.closeModal}>
              Cancel
            </Button>
          </BootstrapModal.Footer>
        </BootstrapModal>
      </WrapperDiv>
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
