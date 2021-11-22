import '@testing-library/jest-dom/extend-expect';

import { fireEvent, waitFor } from '@testing-library/react';
import { Base64 } from 'js-base64';
import { StatusCodes } from 'model/constants';
import { postPayloadMockCall, USER_EMAIL } from 'test/mockHttpCalls';
import { renderWithTheme } from 'test/renderUtils';

import ChangePasswordForm from '../ChangePasswordForm';

const elementLabels = {
  Section: 'Password',
  ExplanatoryText: 'Use this form to change your password.',
  CurrPassword: 'Current Password',
  NewPassword: 'New Password',
  ConfirmNewPassword: 'New Password (once more)',
  SetButton: 'Set new password',
};

const textInputLabels = [
  elementLabels.CurrPassword,
  elementLabels.NewPassword,
  elementLabels.ConfirmNewPassword,
];

const validationErrors = {
  TooShort: 'Your new password is too short',
  JustNumbers: 'Please pick a new password that is not just numbers',
  JustLetters:
    'Please pick a new password that is not just upper case / lower case letters',
  NoMatch: 'Password confirmation does not match',
};

const statusMessages = {
  Success: 'Your password has been updated',
  CurrPwdWrong: `Your current password doesn't seem to be right.`,
  ServerError: 'Something went wrong while trying to set your password.',
};

const renderWithProps = (props = {}) =>
  renderWithTheme(ChangePasswordForm, props);

const triggerInputChange = (inputElement, newValue) => {
  fireEvent.change(inputElement, {
    target: {
      value: newValue,
    },
  });
};

describe('ChangePasswordForm', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });

  it('has section label', () => {
    const { getByText } = renderWithProps();
    const sectionLabel = getByText(elementLabels.Section);

    expect(sectionLabel).toBeInTheDocument();
  });

  it('has explanatory text', () => {
    const { getByText } = renderWithProps();
    const explText = getByText(elementLabels.ExplanatoryText);

    expect(explText).toBeInTheDocument();
  });

  it('renders 3 password inputs', () => {
    let validPasswordInputs = 0;

    const { getByLabelText } = renderWithProps();

    for (const label of textInputLabels) {
      const inputElement = getByLabelText(label);

      if (inputElement.type === 'password') validPasswordInputs++;
    }

    // eslint-disable-next-line no-magic-numbers
    expect(validPasswordInputs).toBe(3);
  });

  it('has set button initially hidden', () => {
    const { queryByText } = renderWithProps();
    const setButton = queryByText(elementLabels.SetButton);

    expect(setButton).toBeNull();
  });

  it('makes the set button appear after typing in the current password input', async () => {
    const { getByLabelText, findByText } = renderWithProps();
    const firstInput = getByLabelText(elementLabels.CurrPassword);

    triggerInputChange(firstInput, 'abcdefg');

    const setButton = await findByText(elementLabels.SetButton);

    expect(setButton).toBeInTheDocument();
  });

  it('validates the new password input', async () => {
    const { findByText, queryByText, getByLabelText } = renderWithProps();
    let errorElement = null;
    let setButton = null;

    const currPasInput = getByLabelText(elementLabels.CurrPassword);
    const newPasswordInput = getByLabelText(elementLabels.NewPassword);

    // Set the current input value
    triggerInputChange(currPasInput, 'abcdefg');

    // Check if the new password length has a minimum value
    triggerInputChange(newPasswordInput, 'abc');

    // Ensure that error is visible
    errorElement = await findByText(validationErrors.TooShort);

    // Check if set button is present and disabled
    setButton = await findByText(elementLabels.SetButton);
    expect(setButton.disabled).toBeTruthy();

    // Check if the new password cannot be just numbers
    triggerInputChange(newPasswordInput, '1231319810112');

    // Ensure that error is visible
    errorElement = await findByText(validationErrors.JustNumbers);

    // Check if set button is present and disabled
    setButton = await findByText(elementLabels.SetButton);
    expect(setButton.disabled).toBeTruthy();

    // Check if the new password cannot be just letters
    triggerInputChange(newPasswordInput, 'aaaaaaaadasdasda');

    // Ensure that error is visible
    errorElement = await findByText(validationErrors.JustLetters);

    // Check if set button is present and disabled
    setButton = await findByText(elementLabels.SetButton);
    expect(setButton.disabled).toBeTruthy();

    triggerInputChange(newPasswordInput, 'AAAAAAAASDASDASDAS');

    // Ensure that error is visible
    errorElement = await findByText(validationErrors.JustLetters);

    // Check if set button is present and disabled
    setButton = await findByText(elementLabels.SetButton);
    expect(setButton.disabled).toBeTruthy();

    triggerInputChange(newPasswordInput, 'aaasAAA11231aasdaA');

    // Check if set button is present and disabled
    setButton = await findByText(elementLabels.SetButton);
    expect(setButton.disabled).toBeTruthy();

    // Ensure that error text is gone
    await waitFor(() => {
      errorElement = queryByText(validationErrors.JustLetters);
      expect(errorElement).toBeNull();
    });
  });

  it('validates the confirm new password input', async () => {
    const { findByText, queryByText, getByLabelText } = renderWithProps();
    let setButton = null;
    let errorElement = null;

    const newPassword = 'abasdasdas2312312312c';

    const currPasswordInput = getByLabelText(elementLabels.CurrPassword);
    const newPasswordInput = getByLabelText(elementLabels.NewPassword);
    const confirmNewPasswordInput = getByLabelText(
      elementLabels.ConfirmNewPassword
    );

    // Set the input values
    triggerInputChange(currPasswordInput, 'abcdefg');
    triggerInputChange(newPasswordInput, newPassword);
    triggerInputChange(confirmNewPasswordInput, 'aaasdaadsa');

    // Ensure that error is visible
    errorElement = await findByText(validationErrors.NoMatch);

    // Check if set button is present and disabled
    setButton = await findByText(elementLabels.SetButton);
    expect(setButton.disabled).toBeTruthy();

    triggerInputChange(confirmNewPasswordInput, newPassword);

    // Check if set button is present and enabled
    setButton = await findByText(elementLabels.SetButton);
    expect(setButton.disabled).toBeFalsy();

    // Ensure that error text is gone
    errorElement = queryByText(validationErrors.JustLetters);
    expect(errorElement).toBeNull();
  });

  it('sends the correct password change request, and logs in after', async () => {
    const newPassword = 'abasdasdas2312312312c';
    const newPasswordBase64 = Base64.encode(newPassword);
    const encodedEmail = encodeURIComponent(USER_EMAIL);

    const loginFn = jest.fn();

    postPayloadMockCall(`/v4/users/${encodedEmail}/password/`, {
      current_password_base64: newPasswordBase64,
      new_password_base64: newPasswordBase64,
    });

    const { findByText, getByLabelText } = renderWithProps({
      user: {
        email: USER_EMAIL,
      },
      giantswarmLogin: loginFn,
    });

    const currPasswordInput = getByLabelText(elementLabels.CurrPassword);
    const newPasswordInput = getByLabelText(elementLabels.NewPassword);
    const confirmNewPasswordInput = getByLabelText(
      elementLabels.ConfirmNewPassword
    );

    // Set the input values
    triggerInputChange(currPasswordInput, newPassword);
    triggerInputChange(newPasswordInput, newPassword);
    triggerInputChange(confirmNewPasswordInput, newPassword);

    // Simulate form submit
    const setButton = await findByText(elementLabels.SetButton);
    fireEvent.click(setButton);

    // Ensure that success message is visible
    await findByText(statusMessages.Success);

    // Ensure that login was called
    expect(loginFn).toBeCalledWith(USER_EMAIL, newPassword);
  });

  it('shows error messages if any request fails', async () => {
    const newPassword = 'abasdasdas2312312312c';
    const newPasswordBase64 = Base64.encode(newPassword);
    const encodedEmail = encodeURIComponent(USER_EMAIL);

    const loginFn = jest.fn();

    postPayloadMockCall(
      `/v4/users/${encodedEmail}/password/`,
      {
        current_password_base64: newPasswordBase64,
        new_password_base64: newPasswordBase64,
      },
      {},
      StatusCodes.BadRequest
    );

    const { findByText, getByLabelText } = renderWithProps({
      user: {
        email: USER_EMAIL,
      },
      actions: {
        giantswarmLogin: loginFn,
      },
    });

    const currPasswordInput = getByLabelText(elementLabels.CurrPassword);
    const newPasswordInput = getByLabelText(elementLabels.NewPassword);
    const confirmNewPasswordInput = getByLabelText(
      elementLabels.ConfirmNewPassword
    );

    // Set the input values
    triggerInputChange(currPasswordInput, newPassword);
    triggerInputChange(newPasswordInput, newPassword);
    triggerInputChange(confirmNewPasswordInput, newPassword);

    // Simulate form submit
    const setButton = await findByText(elementLabels.SetButton);
    fireEvent.click(setButton);

    // Ensure that error is visible
    await findByText(new RegExp(statusMessages.ServerError));

    // Ensure that login was not called
    expect(loginFn).toHaveBeenCalledTimes(0);
  });
});
