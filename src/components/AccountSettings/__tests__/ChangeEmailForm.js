import { fireEvent, wait } from '@testing-library/react';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { API_ENDPOINT, USER_EMAIL } from 'testUtils/mockHttpCalls';
import { renderWithTheme } from 'testUtils/renderUtils';

import ChangeEmailForm from '../ChangeEmailForm';

const elementIDs = {
  input: 'change-email/input',
  button: 'change-email/button',
};

const statusMessages = {
  Success: 'Saved Succesfully',
  EmailAlreadyInUse:
    'This e-mail is in already in use by a different user. Please choose a different e-mail address',
  ServerError:
    'Something went wrong while trying to update your e-mail address.',
};

const renderWithProps = (props = {}) => {
  const propsWithEmail = Object.assign({}, props, {
    user: {
      email: USER_EMAIL,
    },
  });

  return renderWithTheme(ChangeEmailForm, propsWithEmail);
};

const triggerInputChange = (inputElement, newValue) => {
  fireEvent.change(inputElement, {
    target: {
      value: newValue,
    },
  });
};

describe('ChangeEmailForm', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });

  it('renders a text input', () => {
    const { getByTestId } = renderWithProps();
    const inputElement = getByTestId(elementIDs.input);

    expect(inputElement.type).toBe('text');
  });

  it('has set button initially hidden', () => {
    const { queryByTestId } = renderWithProps();
    const setButton = queryByTestId(elementIDs.button);

    expect(setButton).toBeNull();
  });

  it('makes the set button appear after typing in the text input', async () => {
    const { getByTestId, findByTestId } = renderWithProps();
    const inputElement = getByTestId(elementIDs.input);

    triggerInputChange(inputElement, 'test@example.com');

    const setButton = await findByTestId(elementIDs.button);

    expect(setButton).not.toBeNull();
  });

  it('makes the set button disappear if it has the same email as the current one in the text input', async () => {
    const { getByTestId, queryByTestId } = renderWithProps();
    const inputElement = getByTestId(elementIDs.input);

    triggerInputChange(inputElement, 'test@example.com');
    triggerInputChange(inputElement, USER_EMAIL);

    await wait(() => {
      expect(queryByTestId(elementIDs.button)).toBeNull();
    });
  });

  it('validates the text input on value change, by disabling the set button', async () => {
    const { getByTestId, findByTestId } = renderWithProps();
    const inputElement = getByTestId(elementIDs.input);

    triggerInputChange(inputElement, 'test');

    const setButton = await findByTestId(elementIDs.button);
    expect(setButton.disabled).toBeTruthy();

    triggerInputChange(inputElement, 'test@example');
    expect(setButton.disabled).toBeTruthy();

    triggerInputChange(inputElement, 'test@example@example.com');
    expect(setButton.disabled).toBeTruthy();

    triggerInputChange(inputElement, '<>test@example.com');
    expect(setButton.disabled).toBeTruthy();

    triggerInputChange(inputElement, 'test@example.com');
    expect(setButton.disabled).toBeFalsy();

    triggerInputChange(inputElement, 'test@example.co.uk');
    expect(setButton.disabled).toBeFalsy();
  });

  it('sends the correct email change request, and then refreshes the user info', async () => {
    const encodedEmail = encodeURIComponent(USER_EMAIL);
    const refreshUserInfoFn = jest.fn();
    const newEmail = 'test@example.com';

    const emailChangeRequest = nock(API_ENDPOINT)
      .intercept(`/v4/users/${encodedEmail}/`, 'PATCH', {
        email: newEmail,
      })
      .reply(StatusCodes.Ok, {});

    const { getByTestId, findByTestId, findByText } = renderWithProps({
      actions: {
        refreshUserInfo: refreshUserInfoFn,
      },
    });
    const inputElement = getByTestId(elementIDs.input);

    triggerInputChange(inputElement, newEmail);

    const setButton = await findByTestId(elementIDs.button);
    fireEvent.click(setButton);

    const succesMessageElement = await findByText(statusMessages.Success);
    expect(succesMessageElement).not.toBeNull();

    expect(refreshUserInfoFn).toHaveBeenCalled();

    emailChangeRequest.done();
  });

  it('shows error messages if the request fails', async () => {
    const encodedEmail = encodeURIComponent(USER_EMAIL);
    const refreshUserInfoFn = jest.fn();
    const newEmail = 'test@example.com';

    const emailChangeRequest = nock(API_ENDPOINT)
      .intercept(`/v4/users/${encodedEmail}/`, 'PATCH', {
        email: newEmail,
      })
      .reply(StatusCodes.BadRequest, {});

    const { getByTestId, findByTestId, findByText } = renderWithProps({
      actions: {
        refreshUserInfo: refreshUserInfoFn,
      },
    });
    const inputElement = getByTestId(elementIDs.input);

    triggerInputChange(inputElement, newEmail);

    const setButton = await findByTestId(elementIDs.button);
    fireEvent.click(setButton);

    const succesMessageElement = await findByText(
      new RegExp(statusMessages.ServerError)
    );
    expect(succesMessageElement).not.toBeNull();

    expect(refreshUserInfoFn).not.toHaveBeenCalled();

    emailChangeRequest.done();
  });
});
