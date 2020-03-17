import styled from '@emotion/styled';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import Button from './Button';

const MIN_NAME_LENGTH = 3;

const FormWrapper = styled.div`
  display: inline-block;

  form {
    display: inline-block;
  }

  .btn-group {
    float: none;
    margin-left: 4px;
    top: -2px;
  }
`;

const NameInput = styled.input`
  &[type='text'] {
    display: inline-block;
    padding: 0px 5px;
    width: 320px;
    margin-right: 5px;
    font-size: 85%;
  }
`;

const NameLabel = styled.a`
  &:hover {
    text-decoration-style: dotted;
    color: #fff;
  }
`;

/**
 * A widget to display and edit an entity
 * name in the same place.
 */
class ViewAndEditName extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.value === null && nextProps.name !== prevState.value) {
      return { value: nextProps.name };
    }

    return null;
  }

  state = {
    editing: false,
    value: null,
  };

  componentDidUpdate(prevProps) {
    if (!this.state.editing && this.props.name !== prevProps.name) {
      this.setState({
        value: this.props.name,
      });
    }
  }

  toggleEditMode(state, additionalState) {
    this.setState({
      editing: state,
      ...additionalState,
    });

    const { onToggleEditingState } = this.props;
    // eslint-disable-next-line no-unused-expressions
    onToggleEditingState?.(state);
  }

  activateEditMode = () => {
    this.toggleEditMode(true);
  };

  handleCancel = () => {
    this.toggleEditMode(false, {
      value: this.props.name,
    });
  };

  handleChange = e => {
    this.setState({ value: e.target.value });
  };

  handleSubmit = e => {
    // eslint-disable-next-line no-unused-expressions
    e?.preventDefault();

    const validationResult = this.validate();
    if (!validationResult.valid) {
      new FlashMessage(
        `Error: ${validationResult.error}`,
        messageType.ERROR,
        messageTTL.MEDIUM
      );

      return;
    }

    this.toggleEditMode(false);
    // eslint-disable-next-line no-unused-expressions
    this.props.onSubmit?.(this.state.value);
  };

  handleKey = e => {
    switch (e.key) {
      case 'Escape':
        this.handleCancel();

        break;

      case 'Enter':
        this.handleSubmit();

        break;
    }
  };

  validate() {
    const { value } = this.state;

    const result = {
      valid: true,
      error: '',
    };

    if (value.length < MIN_NAME_LENGTH) {
      result.valid = false;
      result.error = 'Please use a name with at least 3 characters';
    }

    return result;
  }

  render() {
    const { type, name, onSubmit, onToggleEditingState, ...rest } = this.props;

    if (this.state.editing) {
      // Edit mode
      return (
        <FormWrapper {...rest}>
          <form className='form' onSubmit={this.handleSubmit}>
            <NameInput
              type='text'
              autoComplete='off'
              autoFocus={true}
              onChange={this.handleChange}
              onKeyUp={this.handleKey}
              value={this.state.value}
            />
            <div className='btn-group'>
              <Button type='submit'>OK</Button>
              <Button onClick={this.handleCancel}>Cancel</Button>
            </div>
          </form>
        </FormWrapper>
      );
    }

    // View mode
    return (
      <span>
        <OverlayTrigger
          overlay={<Tooltip id='tooltip'>Click to edit {type} name</Tooltip>}
          placement='top'
        >
          <NameLabel onClick={this.activateEditMode}>
            {this.state.value}
          </NameLabel>
        </OverlayTrigger>
      </span>
    );
  }
}

ViewAndEditName.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  onSubmit: PropTypes.func,
  onToggleEditingState: PropTypes.func,
};

ViewAndEditName.defaultProps = {
  name: '',
  type: '',
};

export default React.forwardRef((props, ref) => (
  <ViewAndEditName ref={ref} {...props} />
));
