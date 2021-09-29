import { Box, Keyboard } from 'grommet';
import { hasAppropriateLength } from 'lib/helpers';
import React, { Component, FormEvent, GetDerivedStateFromProps } from 'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { Constants } from 'shared/constants';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

import TextInput from './TextInput';

export enum ViewAndEditNameVariant {
  Name = 'name',
  Description = 'description',
}
interface IViewAndEditNameProps extends React.ComponentPropsWithRef<'span'> {
  value: string;
  typeLabel: string;
  onSave(value: string): void;
  onToggleEditingState?(editing: boolean): void;
  variant?: ViewAndEditNameVariant;
  readOnly?: boolean;
}

interface IViewAndEditNameState {
  editing: boolean;
  errorMessage: string;
  value: string;
}

const FormWrapper = styled.span`
  display: inline-block;

  form {
    display: flex;
    align-items: center;
  }
`;

const NameInput = styled(TextInput)`
  padding: 0px 5px;
  font-size: 85%;
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
    variant: ViewAndEditNameVariant.Name,
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

  static validate(
    value: string,
    variant: ViewAndEditNameVariant
  ): { valid: boolean; error: string } {
    const capitalizedVariant = variant[0].toUpperCase() + variant.slice(1);

    const { isValid, message } = hasAppropriateLength(
      value,
      Constants.MIN_NAME_LENGTH,
      Constants.MAX_NAME_LENGTH,
      capitalizedVariant
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
    const validationResult = ViewAndEditName.validate(
      value,
      this.props.variant!
    );

    this.setState({
      value: value,
      errorMessage: validationResult.error,
    });
  };

  handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    const { value } = this.state;

    // Validate here, also, in case we're calling this method directly
    const validationResult = ViewAndEditName.validate(
      value,
      this.props.variant!
    );
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

  handleKey = (e: React.KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case 'Escape':
        this.handleCancel();

        break;

      case 'Enter':
        this.handleSubmit();

        break;
    }
  };

  handleFocusKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    ((e.target as HTMLElement).firstChild as HTMLElement)?.click();
  };

  render() {
    const {
      typeLabel,
      value,
      onSave,
      onToggleEditingState,
      variant,
      readOnly,
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
              autoComplete='off'
              autoFocus={true}
              onChange={this.handleChange}
              onKeyDown={this.handleKey}
              value={this.state.value}
              formFieldProps={{
                margin: {
                  bottom: 'none',
                  right: 'small',
                },
              }}
              contentProps={{ width: 'medium' }}
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
            <Box direction='row' gap='small'>
              <Button
                type='submit'
                primary={true}
                disabled={hasError}
                size='small'
              >
                OK
              </Button>
              <Button onClick={this.handleCancel} size='small'>
                Cancel
              </Button>
            </Box>
          </form>
        </FormWrapper>
      );
    }

    // View mode
    return (
      <Keyboard
        onSpace={this.handleFocusKeyDown}
        onEnter={this.handleFocusKeyDown}
      >
        <span tabIndex={0} {...rest}>
          {readOnly && this.state.value}

          {!readOnly && (
            <OverlayTrigger
              overlay={
                <Tooltip id='tooltip'>
                  Click to edit {typeLabel} {variant}
                </Tooltip>
              }
              placement='top'
            >
              <NameLabel onClick={this.activateEditMode}>
                {this.state.value}
              </NameLabel>
            </OverlayTrigger>
          )}
        </span>
      </Keyboard>
    );
  }
}

export default ViewAndEditName;
