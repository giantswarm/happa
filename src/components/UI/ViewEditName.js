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
  input[type='text'] {
    display: inline-block;
    padding: 0px 5px;
    width: 320px;
    margin-right: 5px;
    font-size: 85%;
  }
  .btn[type='submit'] {
    display: inline;
  }
  .btn-group {
    float: none;
    margin-left: 4px;
    top: -2px;
  }
  /* Node Pools specific styles */
  &.np {
    input[type='text'] {
      font-size: 15px;
      line-height: 1.8em;
      margin-bottom: 0;
    }
    .btn-group {
      top: 0;
    }
    button {
      font-size: 13px;
      padding: 4px 10px;
    }
  }
`;

const LinkWrapper = styled.span`
  a:hover {
    text-decoration-style: dotted;
    color: #fff;
  }
`;

/**
 * ViewAndEditName is a widget to display and edit an entity (cluster or node pool)
 *  name in the same place. It renders as inline-block.
 */
class ViewAndEditName extends React.Component {
  state = {
    // editing is true while the widget is in edit mode.
    editing: false,
    // name is a copy of the actual entity name and the value rendered
    name: this.props.entity.name,
    // inputFieldValue is what the input field currently holds
    inputFieldValue: this.props.entity.name,
  };

  componentDidUpdate(prevProps) {
    const { name } = this.props.entity;

    // If the name provided by the parent component is different than the name in
    // local state, it means that the patch call has failed, so we revert this.state.name
    // TODO Is this too convoluted? Should we remove optimistic update?
    if (prevProps.entity.name !== name) {
      this.setState({
        name,
        inputFieldValue: name,
      });
    }
  }

  activateEditMode = () => {
    this.setState({
      editing: true,
    });

    const { toggleEditingState } = this.props;
    if (toggleEditingState) toggleEditingState(true);
  };

  deactivateEditMode = () => {
    this.setState({
      editing: false,
    });

    const { toggleEditingState } = this.props;
    if (toggleEditingState) toggleEditingState(false);
  };

  handleChange = e => {
    this.setState({ inputFieldValue: e.target.value });
  };

  handleSubmit = evt => {
    evt.preventDefault();

    const { onSubmit, toggleEditingState } = this.props;

    const validationResult = this.validate();
    if (!validationResult.valid) {
      new FlashMessage(
        `Error: ${validationResult.error}`,
        messageType.ERROR,
        messageTTL.MEDIUM
      );

      return;
    }

    this.setState(
      prevState => ({
        editing: false,
        name: prevState.inputFieldValue,
      }),
      () => {
        // eslint-disable-next-line no-unused-expressions
        toggleEditingState?.(false);
        onSubmit(this.state.inputFieldValue);
      }
    );
  };

  handleKey = evt => {
    // 27 = Escape key
    // eslint-disable-next-line no-magic-numbers
    if (evt.keyCode === 27) {
      this.deactivateEditMode();
    }
  };

  validate = () => {
    const { inputFieldValue } = this.state;

    const result = {
      valid: true,
      error: '',
    };

    if (inputFieldValue.length < MIN_NAME_LENGTH) {
      result.valid = false;
      result.error = 'Please use a name with at least 3 characters';
    }

    return result;
  };

  render = () => {
    if (this.state.editing) {
      // edit mode
      return (
        <FormWrapper className={this.props.cssClass}>
          <form className='form' onSubmit={this.handleSubmit}>
            <input
              autoComplete='off'
              autoFocus
              onChange={this.handleChange}
              onKeyUp={this.handleKey}
              type='text'
              value={this.state.inputFieldValue}
            />
            <div className='btn-group'>
              <Button type='submit'>OK</Button>
              <Button onClick={this.deactivateEditMode}>Cancel</Button>
            </div>
          </form>
        </FormWrapper>
      );
    }

    // view mode
    return (
      <LinkWrapper>
        <OverlayTrigger
          overlay={
            <Tooltip id='tooltip'>
              Click to edit {this.props.entityType} name
            </Tooltip>
          }
          placement='top'
        >
          <a onClick={this.activateEditMode}>{this.state.name}</a>
        </OverlayTrigger>
      </LinkWrapper>
    );
  };
}

ViewAndEditName.propTypes = {
  cssClass: PropTypes.string,
  dispatch: PropTypes.func,
  entity: PropTypes.object,
  // Used by flash message and tooltip.
  entityType: PropTypes.string,
  onSubmit: PropTypes.func,
  toggleEditingState: PropTypes.func,
};

export default ViewAndEditName;
