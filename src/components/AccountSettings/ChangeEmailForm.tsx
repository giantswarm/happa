import GiantSwarm from 'giantswarm';
import { Form } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import React from 'react';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';

const emailRegexp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// ButtonPlaceholder avoids the page from jumping in height when the hidden
// button is revealed.
const ButtonPlaceholder = styled('div')`
  height: 45px;
`;

interface IChangeEmailFormPropsUser {
  email: string;
}

interface IChangeEmailFormProps {
  user: IChangeEmailFormPropsUser;
  refreshUserInfo: () => {};
}

interface IChangeEmailFormState {
  emailValue: string;
  error: boolean;
  isValid: boolean;
  isButtonVisible: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
}

class ChangeEmailForm extends React.Component<
  IChangeEmailFormProps,
  IChangeEmailFormState
> {
  state = {
    emailValue: this.props.user.email,
    error: false,
    isValid: false,
    isButtonVisible: false,
    isSubmitting: false,
    isSuccess: false,
  };

  resetForm() {
    this.setState({});
  }

  validateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;

    this.setState({
      isSuccess: false,
      isValid:
        emailRegexp.test(email) && this.props.user.email !== e.target.value,
      error: false,
      emailValue: email,
      isButtonVisible: true,
    });
  };

  submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit the form if nothing changed.
    if (this.props.user.email !== this.state.emailValue) {
      const usersApi = new GiantSwarm.UsersApi();

      this.setState({
        isSubmitting: true,
        error: false,
      });

      usersApi
        // @ts-ignore: modifyUser wants 'expire' param, but only admins can set it.
        .modifyUser(this.props.user.email, {
          email: this.state.emailValue,
        })
        .then(() => {
          this.setState({
            isSubmitting: false,
            isButtonVisible: false,
            isSuccess: true,
            isValid: false,
          });
        })
        .then(() => {
          return this.props.refreshUserInfo();
        })
        .then(() => {
          new FlashMessage(
            'Your email has been updated',
            messageType.SUCCESS,
            messageTTL.LONG
          );
        })
        .catch((error) => {
          let errorMessage = null;

          if (
            error.body &&
            error.body.status_code &&
            // eslint-disable-next-line no-magic-numbers
            error.body.status_code === 10009
          ) {
            errorMessage =
              'This e-mail is in already in use by a different user. Please choose a different e-mail address';
          } else {
            errorMessage =
              'Something went wrong while trying to update your e-mail address. Could you try again later, or contact support at: support@giantswarm.io';
          }

          this.setState({
            isSubmitting: false,
            error: true,
          });

          new FlashMessage(errorMessage, messageType.ERROR, messageTTL.SHORT);

          ErrorReporter.getInstance().notify(error as Error);
        });
    }
  };

  render() {
    const { user, refreshUserInfo, ...rest } = this.props;

    return (
      <div {...rest}>
        <Form onSubmit={this.submit}>
          <TextInput
            onChange={this.validateEmail}
            type='email'
            value={this.state.emailValue}
          />

          <ButtonPlaceholder>
            <SlideTransition direction='left' in={this.state.isButtonVisible}>
              <Button
                primary={true}
                disabled={!this.state.isValid}
                loading={this.state.isSubmitting}
                type='submit'
              >
                Set new email
              </Button>
            </SlideTransition>
          </ButtonPlaceholder>
        </Form>
      </div>
    );
  }
}

export default ChangeEmailForm;
