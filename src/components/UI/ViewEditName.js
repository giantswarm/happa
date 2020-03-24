import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import Button from './Button';

const MIN_NAME_LENGTH = 3;

const validationMessages = {
  TooShort: `Please use a name with at least ${MIN_NAME_LENGTH} characters`,
};

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

    &,
    &:focus {
      border-color: ${({ hasError, theme }) => hasError && theme.colors.error};
    }
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

  static validate(value) {
    const result = {
      valid: true,
      error: '',
    };

    if (value.length < MIN_NAME_LENGTH) {
      result.valid = false;
      result.error = validationMessages.TooShort;
    }

    return result;
  }

  inputRef = React.createRef();

  state = {
    editing: false,
    value: null,
    errorMessage: '',
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
      errorMessage: '',
    });
  };

  handleChange = (e) => {
    const { value } = e.target;
    const validationResult = ViewAndEditName.validate(value);

    this.setState({
      value: value,
      errorMessage: validationResult.error,
    });
  };

  handleSubmit = (e) => {
    // eslint-disable-next-line no-unused-expressions
    e?.preventDefault();

    const { value } = this.state;

    // Validate here, also, in case we're calling this method directly
    const validationResult = ViewAndEditName.validate(value);
    if (!validationResult.valid) return;

    this.toggleEditMode(false, {
      errorMessage: '',
    });

    if (value !== this.props.name) {
      // eslint-disable-next-line no-unused-expressions
      this.props.onSubmit?.(value);
    }
  };

  handleKey = (e) => {
    switch (e.key) {
      case 'Escape':
        this.handleCancel();

        break;

      case 'Enter':
        this.handleSubmit();

        break;
    }
  };

  render() {
    const { type, name, onSubmit, onToggleEditingState, ...rest } = this.props;
    const { errorMessage } = this.state;
    const hasError = errorMessage !== '';

    if (this.state.editing) {
      // Edit mode
      return (
        <FormWrapper {...rest}>
          <form className='form' onSubmit={this.handleSubmit}>
            <NameInput
              ref={this.inputRef}
              type='text'
              autoComplete='off'
              autoFocus={true}
              onChange={this.handleChange}
              onKeyUp={this.handleKey}
              value={this.state.value}
              hasError={hasError}
            />
            <Overlay
              target={this.inputRef.current}
              placement='bottom'
              show={hasError}
              shouldUpdatePosition={true}
              animation={false}
            >
              <Tooltip id='name-form-error'>{errorMessage}</Tooltip>
            </Overlay>
            <div className='btn-group'>
              <Button type='submit' bsStyle='primary' disabled={hasError}>
                OK
              </Button>
              <Button onClick={this.handleCancel}>Cancel</Button>
            </div>
          </form>
        </FormWrapper>
      );
    }

    // View mode
    return (
      <span {...rest}>
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
