import { fireEvent, wait } from '@testing-library/react';
import { renderWithTheme } from 'testUtils/renderUtils';

import ChangePasswordForm from '../ChangePasswordForm';

const elementIDs = {
  label: 'change-password/label',
  explanatoryText: 'change-password/explanatory-text',
  currPassword: 'change-password/curr-pwd-input',
  newPassword: 'change-password/new-pwd-input',
  confirmNewPassword: 'change-password/confirm-new-pwd-input',
  setPasswordButton: 'change-password/set-password-button',
};

const textInputsIDs = [
  elementIDs.currPassword,
  elementIDs.newPassword,
  elementIDs.confirmNewPassword,
];

const validationErrors = {
  TooShort: 'Your new password is too short',
  JustNumbers: 'Please pick a new password that is not just numbers',
  JustLetters:
    'Please pick a new password that is not just upper case / lower case letters',
  NoMatch: 'Password confirmation does not match',
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

  it('has label', () => {
    const { getByTestId } = renderWithProps();
    const label = getByTestId(elementIDs.label);

    expect(label).not.toBe(null);
    expect(label.textContent.length).toBeGreaterThan(0);
  });

  it('has explanatory text', () => {
    const { getByTestId } = renderWithProps();
    const explText = getByTestId(elementIDs.explanatoryText);

    expect(explText).not.toBe(null);
    expect(explText.textContent.length).toBeGreaterThan(0);
  });

  it('renders 3 password inputs', () => {
    let validPasswordInputs = 0;

    const { getByTestId } = renderWithProps();
    const inputs = textInputsIDs.map(id => {
      const inputElement = getByTestId(id).querySelector('input');

      if (inputElement.type === 'password') validPasswordInputs++;

      return inputElement;
    });

    // eslint-disable-next-line no-magic-numbers
    expect(inputs.length).toBe(3);

    // eslint-disable-next-line no-magic-numbers
    expect(validPasswordInputs).toBe(3);
  });

  it('has set button initially hidden', () => {
    const { queryByTestId } = renderWithProps();
    const setButton = queryByTestId(elementIDs.setPasswordButton);

    expect(setButton).toBe(null);
  });

  it('typing in the current password input makes the set button appear', async () => {
    const { getByTestId, findByTestId } = renderWithProps();
    const inputWrapper = getByTestId(elementIDs.currPassword);
    const firstInputElement = inputWrapper.querySelector('input');

    triggerInputChange(firstInputElement, 'abcdefg');

    const setButton = await findByTestId(elementIDs.setPasswordButton);

    expect(setButton).not.toBe(null);
  });

  it('validates the new password input', async () => {
    const {
      getByTestId,
      findByText,
      queryByTestId,
      queryByText,
    } = renderWithProps();
    let errorElement = null;

    // Find current password input
    const inputWrapper = getByTestId(elementIDs.currPassword);
    const firstInputElement = inputWrapper.querySelector('input');

    // Find the new password input
    const newPasswordInputWrapper = getByTestId(elementIDs.newPassword);
    const newPasswordInputElement = newPasswordInputWrapper.querySelector(
      'input'
    );

    // Set the current input value
    triggerInputChange(firstInputElement, 'abcdefg');

    // Check if the new password length has a minimum value
    triggerInputChange(newPasswordInputElement, 'abc');

    errorElement = await findByText(validationErrors.TooShort);
    expect(errorElement).not.toBe(null);

    // Check if set button is present and disabled
    await wait(() => {
      const setButton = queryByTestId(elementIDs.setPasswordButton);
      const setButtonElement = setButton.querySelector('button');

      expect(setButton).not.toBe(null);
      expect(setButtonElement.disabled).toBe(true);
    });

    // Check if the new password cannot be just numbers
    triggerInputChange(newPasswordInputElement, '1231319810112');

    errorElement = await findByText(validationErrors.JustNumbers);
    expect(errorElement).not.toBe(null);

    // Check if set button is present and disabled
    await wait(() => {
      const setButton = queryByTestId(elementIDs.setPasswordButton);
      const setButtonElement = setButton.querySelector('button');

      expect(setButton).not.toBe(null);
      expect(setButtonElement.disabled).toBe(true);
    });

    // Check if the new password cannot be just letters
    triggerInputChange(newPasswordInputElement, 'aaaaaaaadasdasda');

    errorElement = await findByText(validationErrors.JustLetters);
    expect(errorElement).not.toBe(null);

    // Check if set button is present and disabled
    await wait(() => {
      const setButton = queryByTestId(elementIDs.setPasswordButton);
      const setButtonElement = setButton.querySelector('button');

      expect(setButton).not.toBe(null);
      expect(setButtonElement.disabled).toBe(true);
    });

    triggerInputChange(newPasswordInputElement, 'AAAAAAAASDASDASDAS');

    errorElement = await findByText(validationErrors.JustLetters);
    expect(errorElement).not.toBe(null);

    // Check if set button is present and disabled
    await wait(() => {
      const setButton = queryByTestId(elementIDs.setPasswordButton);
      const setButtonElement = setButton.querySelector('button');

      expect(setButton).not.toBe(null);
      expect(setButtonElement.disabled).toBe(true);
    });

    triggerInputChange(newPasswordInputElement, 'aaasAAA11231aasdaA');

    // Check if set button is present and disabled
    await wait(() => {
      const setButton = queryByTestId(elementIDs.setPasswordButton);
      const setButtonElement = setButton.querySelector('button');

      expect(setButton).not.toBe(null);
      expect(setButtonElement.disabled).toBe(true);

      // Check if error text is still present
      errorElement = queryByText(validationErrors.JustLetters);
      expect(errorElement).toBe(null);
    });
  });

  it('validates the confirm new password input', async () => {
    const {
      getByTestId,
      findByText,
      queryByTestId,
      queryByText,
    } = renderWithProps();
    let errorElement = null;
    const newPassword = 'abasdasdas2312312312c';

    // Find current password input
    const inputWrapper = getByTestId(elementIDs.currPassword);
    const firstInputElement = inputWrapper.querySelector('input');

    // Find the new password input
    const newPasswordInputWrapper = getByTestId(elementIDs.newPassword);
    const newPasswordInputElement = newPasswordInputWrapper.querySelector(
      'input'
    );

    // Find the confirm new password input
    const confirmNewPasswordInputWrapper = getByTestId(
      elementIDs.confirmNewPassword
    );
    const confirmNewPasswordInputElement = confirmNewPasswordInputWrapper.querySelector(
      'input'
    );

    // Set the input values
    triggerInputChange(firstInputElement, 'abcdefg');
    triggerInputChange(newPasswordInputElement, newPassword);
    triggerInputChange(confirmNewPasswordInputElement, 'aaasdaadsa');

    errorElement = await findByText(validationErrors.NoMatch);
    expect(errorElement).not.toBe(null);

    // Check if set button is present and disabled
    await wait(() => {
      const setButton = queryByTestId(elementIDs.setPasswordButton);
      const setButtonElement = setButton.querySelector('button');

      expect(setButton).not.toBe(null);
      expect(setButtonElement.disabled).toBe(true);
    });

    triggerInputChange(confirmNewPasswordInputElement, newPassword);

    // Check if set button is present and enabled
    await wait(() => {
      const setButton = queryByTestId(elementIDs.setPasswordButton);
      const setButtonElement = setButton.querySelector('button');

      expect(setButton).not.toBe(null);
      expect(setButtonElement.disabled).toBe(false);

      // Check if error text is still present
      errorElement = queryByText(validationErrors.NoMatch);
      expect(errorElement).toBe(null);
    });
  });

  // it('disables ')
});
