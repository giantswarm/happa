import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import {
  PasswordStatusMessage,
  validatePassword,
} from 'lib/passwordValidation';
import PropTypes from 'prop-types';
import React, { createRef } from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';
import Section from 'UI/Layout/Section';

interface IChangePasswordPropsUser {
  email: string;
}

interface IChangePasswordProps {
  user: IChangePasswordPropsUser;
  giantswarmLogin: (email: string, password: string) => {};
}

interface IChangePasswordState {
  buttonVisible: boolean;
  error: boolean;
  formValid: boolean;
  newPassworConfirmationValidationMessage: string;
  newPasswordValidationMessage: string;
  submitting: boolean;
  success: boolean;
}

class ChangePassword extends React.Component<
  IChangePasswordProps,
  IChangePasswordState
> {
  public static propTypes = {
    user: PropTypes.object,
    giantswarmLogin: PropTypes.func,
  };

  private currentPassword = createRef<HTMLInputElement>();
  private newPassword = createRef<HTMLInputElement>();
  private newPasswordConfirmation = createRef<HTMLInputElement>();

  state = {
    buttonVisible: false,
    error: false,
    formValid: false,
    newPassworConfirmationValidationMessage: '',
    newPasswordValidationMessage: '',
    submitting: false,
    success: false,
  };

  currentPasswordValid = () => {
    return this.currentPassword.current?.value;
  };

  newPasswordValid = () => {
    const password = this.newPassword.current?.value;

    const validationResult = validatePassword(password || '');

    let validationMessage = '';
    if (validationResult.statusMessage === PasswordStatusMessage.TooShort) {
      validationMessage = 'Your new password is too short';
    } else if (
      validationResult.statusMessage === PasswordStatusMessage.JustNumbers
    ) {
      validationMessage = 'Please pick a new password that is not just numbers';
    } else if (
      validationResult.statusMessage === PasswordStatusMessage.JustLetters
    ) {
      validationMessage =
        'Please pick a new password that is not just upper case / lower case letters';
    }

    this.setState({
      newPasswordValidationMessage: validationMessage,
    });

    return validationResult.valid;
  };

  newPasswordConfirmationValid = () => {
    const password = this.newPassword.current?.value;
    const passwordConfirmation = this.newPasswordConfirmation.current?.value;

    if (password !== passwordConfirmation && password && passwordConfirmation) {
      this.setState({
        newPassworConfirmationValidationMessage:
          'Password confirmation does not match',
      });
    } else {
      this.setState({
        newPassworConfirmationValidationMessage: '',
      });
    }

    return (
      this.newPassword.current?.value &&
      this.newPassword.current?.value ===
        this.newPasswordConfirmation.current?.value
    );
  };

  validate = () => {
    if (this.currentPassword.current?.value) {
      this.setState({
        buttonVisible: true,
        error: false,
      });
    } else {
      this.setState({
        buttonVisible: false,
        error: false,
      });
    }

    if (
      this.currentPasswordValid() &&
      this.newPasswordValid() &&
      this.newPasswordConfirmationValid()
    ) {
      this.setState({
        formValid: true,
        success: false,
        error: false,
      });
    } else {
      this.setState({
        formValid: false,
        success: false,
        error: false,
      });
    }
  };

  submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    this.setState({
      submitting: true,
      error: false,
    });

    const usersApi = new GiantSwarm.UsersApi();
    const currentPassword = this.currentPassword.current?.value;
    const newPassword = this.newPassword.current?.value;

    if (currentPassword && newPassword) {
      usersApi
        .modifyPassword(this.props.user.email, {
          current_password_base64: Base64.encode(currentPassword),
          new_password_base64: Base64.encode(newPassword),
        })
        .then(() => {
          new FlashMessage(
            'Your password has been updated',
            messageType.SUCCESS,
            messageTTL.LONG
          );

          this.setState({
            success: true,
            submitting: false,
            error: false,
            buttonVisible: false,
          });
        })
        .then(() => {
          return this.props.giantswarmLogin(this.props.user.email, newPassword);
        })
        .catch((error) => {
          let errorMessage = null;

          if (
            error.body &&
            error.body.code &&
            // eslint-disable-next-line no-magic-numbers
            error.body.code === 'PERMISSION_DENIED'
          ) {
            errorMessage = `Your current password doesn't seem to be right.`;
          } else {
            errorMessage =
              'Something went wrong while trying to set your password. Could you try again later, or contact support at support@giantswarm.io';
          }

          new FlashMessage(errorMessage, messageType.ERROR, messageTTL.LONG);

          this.setState({
            error: true,
            submitting: false,
            buttonVisible: false,
          });

          ErrorReporter.getInstance().notify(error);
        });
    }
  };

  render() {
    const { user, giantswarmLogin, ...rest } = this.props;

    return (
      <Section flat={false} title='Password' {...rest}>
        <>
          <p>Use this form to change your password.</p>

          <form onSubmit={this.submit}>
            <TextInput
              id='current_password'
              label='Current Password'
              onChange={this.validate}
              ref={this.currentPassword}
              type='password'
            />

            <TextInput
              id='new_password'
              label='New Password'
              onChange={this.validate}
              ref={this.newPassword}
              error={this.state.newPasswordValidationMessage}
              type='password'
            />

            <TextInput
              id='new_password_confirmation'
              label='New Password (once more)'
              onChange={this.validate}
              ref={this.newPasswordConfirmation}
              error={this.state.newPassworConfirmationValidationMessage}
              type='password'
              margin={{ bottom: 'medium' }}
            />

            <div>
              <SlideTransition in={this.state.buttonVisible} direction='down'>
                <Button
                  bsStyle='primary'
                  disabled={!this.state.formValid}
                  loading={this.state.submitting}
                  type='submit'
                >
                  Set New Password
                </Button>
              </SlideTransition>
            </div>
          </form>
        </>
      </Section>
    );
  }
}

export default ChangePassword;
