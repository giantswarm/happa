import { hasAppropriateLength } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, {
  Component,
  FormEvent,
  GetDerivedStateFromProps,
  KeyboardEventHandler,
} from 'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Constants } from 'shared/constants';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ValidityStyledInputElement from 'UI/Inputs/ValidityStyledInputElement';

interface IViewAndEditNameProps extends React.ComponentPropsWithRef<'span'> {
  value: string;
  typeLabel: string;
  onSave(value: string): void;
  onToggleEditingState?(editing: boolean): void;
}

interface IViewAndEditNameState {
  editing: boolean;
  errorMessage: string;
  value: string;
}

const FormWrapper = styled.span`
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

const NameInput = styled(ValidityStyledInputElement)`
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
class ViewAndEditName extends Component<
  IViewAndEditNameProps,
  IViewAndEditNameState
> {
  static defaultProps = {
    onSave: () => {},
  };

  static propTypes = {
    value: PropTypes.string,
    typeLabel: PropTypes.string,
    onSave: PropTypes.func,
    onToggleEditingState: PropTypes.func,
  };

  static getDerivedStateFromProps: GetDerivedStateFromProps<
    IViewAndEditNameProps,
    IViewAndEditNameState
  > = (nextProps, prevState) => {
    if (prevState.value === 'init' && nextProps.value !== prevState.value) {
      return { value: nextProps.value };
    }

    return null;
  };

  static validate(value: string): { valid: boolean; error: string } {
    const { isValid, message } = hasAppropriateLength(
      value,
      Constants.MIN_NAME_LENGTH,
      Constants.MAX_NAME_LENGTH
    );

    return {
      valid: isValid,
      error: message,
    };
  }

  private inputRef: React.RefObject<HTMLInputElement> = React.createRef();

  state = {
    editing: false,
    value: 'init',
    errorMessage: '',
  };

  componentDidUpdate(prevProps: IViewAndEditNameProps) {
    if (!this.state.editing && this.props.value !== prevProps.value) {
      this.setState({
        value: this.props.value,
      });
    }
  }

  toggleEditMode(state: boolean, additionalState?: IViewAndEditNameState) {
    this.setState({
      editing: state,
      ...additionalState,
    } as IViewAndEditNameState);

    const { onToggleEditingState } = this.props;
    onToggleEditingState?.(state);
  }

  activateEditMode = () => {
    this.toggleEditMode(true);
  };

  handleCancel = () => {
    this.toggleEditMode(false, {
      value: this.props.value,
      errorMessage: '',
      editing: false,
    });
  };

  handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    const validationResult = ViewAndEditName.validate(value);

    this.setState({
      value: value,
      errorMessage: validationResult.error,
    });
  };

  handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    const { value } = this.state;

    // Validate here, also, in case we're calling this method directly
    const validationResult = ViewAndEditName.validate(value);
    if (!validationResult.valid) return;

    this.toggleEditMode(false, {
      editing: false,
      value,
      errorMessage: '',
    });

    if (value !== this.props.value) {
      this.props.onSave(value);
    }
  };

  handleKey: KeyboardEventHandler<HTMLInputElement> = (e) => {
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
    const {
      typeLabel,
      value,
      onSave,
      onToggleEditingState,
      ...rest
    } = this.props;
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
              isValid={!hasError}
            />
            <Overlay
              target={this.inputRef.current as HTMLInputElement}
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
          overlay={
            <Tooltip id='tooltip'>Click to edit {typeLabel} name</Tooltip>
          }
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

export default ViewAndEditName;
