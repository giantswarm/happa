import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import Button from './button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import Tooltip from 'react-bootstrap/lib/Tooltip';

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
    // name is a copy of the actual entity name
    name: this.props.name,
    // inputFieldValue is what the input field currently holds
    inputFieldValue: this.props.name,
  };

  activateEditMode = () => {
    this.setState({
      editing: true,
      inputFieldValue: this.state.name,
    });

    // Notify parent
    if (this.props.toggleEditingState) {
      this.props.toggleEditingState(true);
    }
  };

  deactivateEditMode = () => {
    this.setState({
      editing: false,
      // revert input
      inputFieldValue: this.state.name,
    });

    // Notify parent
    if (this.props.toggleEditingState) {
      this.props.toggleEditingState(false);
    }
  };

  handleChange = evt => {
    this.setState({ inputFieldValue: evt.target.value });
  };

  handleSubmit = evt => {
    evt.preventDefault();

    const { entity, onSubmit, id, dispatch } = this.props;
    const { inputFieldValue } = this.state;

    var validate = this.validate();
    if (typeof validate === 'object') {
      new FlashMessage(
        'Error: ' + validate.error,
        messageType.ERROR,
        messageTTL.MEDIUM
      );
      return;
    }

    dispatch(
      onSubmit({
        id,
        name: inputFieldValue,
      })
    ).then(() => {
      this.setState({
        editing: false,
        name: inputFieldValue,
      });

      new FlashMessage(
        // Capitalize first letter.
        `${entity.charAt(0).toUpperCase() + entity.slice(1)} name changed`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    });
  };

  handleKey = evt => {
    // 27 = Escape key
    if (evt.keyCode === 27) {
      this.deactivateEditMode();
    }
  };

  validate = () => {
    if (this.state.name.length < 3) {
      return {
        valid: false,
        error: 'Please use a name with at least 3 characters',
      };
    }

    return true;
  };

  render = () => {
    if (this.state.editing) {
      // edit mode
      return (
        <FormWrapper>
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
              Click to edit {this.props.entity} name
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
  dispatch: PropTypes.func,
  // Used by flash message and tooltip.
  entity: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  onSubmit: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  undefined,
  mapDispatchToProps
)(ViewAndEditName);
