import { renderWithTheme } from 'testUtils/renderUtils';

import ChangePasswordForm from '../ChangePasswordForm';

const labelID = 'account-settings/label';
const explTextID = 'account-settings/explanatory-text';
const textInputID = 'account-settings/text-input';
const setPasswordButtonID = 'account-settings/set-password-button';

const renderWithProps = (props = {}) =>
  renderWithTheme(ChangePasswordForm, props);

describe('ChangePasswordForm', () => {
  it('renders without crashing', () => {
    renderWithProps();
  });

  it('has label', () => {
    const { getByTestId } = renderWithProps();
    const label = getByTestId(labelID);

    expect(label).not.toBe(null);
    expect(label.textContent.length).toBeGreaterThan(0);
  });

  it('has explanatory text', () => {
    const { getByTestId } = renderWithProps();
    const explText = getByTestId(explTextID);

    expect(explText).not.toBe(null);
    expect(explText.textContent.length).toBeGreaterThan(0);
  });

  it('renders 3 text inputs', () => {
    const { getAllByTestId } = renderWithProps();
    const inputs = getAllByTestId(textInputID);

    // eslint-disable-next-line no-magic-numbers
    expect(inputs.length).toBe(3);
  });

  it('has set button initially hidden', () => {
    const { queryByTestId } = renderWithProps();
    const setButton = queryByTestId(setPasswordButtonID);

    expect(setButton).toBe(null);
  });
});
