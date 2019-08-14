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
    name: this.props.entity.name,
    // inputFieldValue is what the input field currently holds
    inputFieldValue: this.props.entity.name,
  };

  nameInputRef = React.createRef();

  activateEditMode = () => {
    this.setState({
      editing: true,
      inputFieldValue: this.state.name,
    });

    const { toggleEditingState } = this.props;
    if (toggleEditingState) toggleEditingState(true);
  };

  deactivateEditMode = () => {
    this.setState({
      editing: false,
      // revert input
      inputFieldValue: this.state.name,
    });

    const { toggleEditingState } = this.props;
    if (toggleEditingState) toggleEditingState(false);
  };

  handleChange = () => {
    this.setState({ inputFieldValue: this.nameInputRef.current.value });
  };

  handleSubmit = evt => {
    evt.preventDefault();

    const { entity, onSubmit, dispatch } = this.props;
    const inputFieldValue = this.nameInputRef.current.value;

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
      // We need the object and the change we want to make to it in order to be able
      // to do optimistic updates
      onSubmit(entity, { name: inputFieldValue })
    ).then(() => {
      this.setState({
        editing: false,
        name: inputFieldValue,
      });

      this.props.toggleEditingState(false);
    });
  };

  handleKey = evt => {
    // 27 = Escape key
    if (evt.keyCode === 27) {
      this.deactivateEditMode();
    }
  };

  validate = () => {
    if (this.nameInputRef.current.value.length < 3) {
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
              ref={this.nameInputRef}
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
  dispatch: PropTypes.func,
  entity: PropTypes.object,
  // Used by flash message and tooltip.
  entityType: PropTypes.string,
  onSubmit: PropTypes.func,
  toggleEditingState: PropTypes.func,
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
