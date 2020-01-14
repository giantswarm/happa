import {
  AWSInfoResponse,
  getPersistedMockCall,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

const elementIDs = {
  ChangeEmailForm: 'account-settings/change-email',
  ChangePasswordForm: 'account-settings/change-password',
  DeleteAccount: 'account-settings/delete-account',

  EmailLabel: 'account-settings/email-label',
  EmailDescription: 'account-settings/email-description',
};

const requests = {};

describe('AccountSettings', () => {
  beforeAll(() => {
    requests.user = getPersistedMockCall('/v4/user/', userResponse);
    requests.info = getPersistedMockCall('/v4/info/', AWSInfoResponse);
    requests.orgs = getPersistedMockCall('/v4/organizations/');
    requests.clusters = getPersistedMockCall('/v4/clusters/');
    requests.catalogs = getPersistedMockCall('/v4/appcatalogs/');
  });

  afterAll(() => {
    for (const req of Object.values(requests)) {
      req.persist(false);
    }
  });

  it('renders the account settings component on the "/account-settings" route', async () => {
    const { findByText } = renderRouteWithStore('/account-settings', {});

    await findByText('Your Account Settings');
  });

  it('renders the email change form', async () => {
    const { findByTestId } = renderRouteWithStore('/account-settings', {});

    const emailChangeForm = await findByTestId(elementIDs.ChangeEmailForm);

    expect(emailChangeForm).not.toBeNull();
  });

  it('renders the email change form label and description', async () => {
    const { findByTestId } = renderRouteWithStore('/account-settings', {});

    const emailLabel = await findByTestId(elementIDs.EmailLabel);
    expect(emailLabel).not.toBeNull();

    const emailDescription = await findByTestId(elementIDs.EmailDescription);
    expect(emailDescription).not.toBeNull();
  });

  it('renders the password change form', async () => {
    const { findByTestId } = renderRouteWithStore('/account-settings', {});

    const passwordChangeForm = await findByTestId(
      elementIDs.ChangePasswordForm
    );

    expect(passwordChangeForm).not.toBeNull();
  });

  it('renders the account deletion section', async () => {
    const { findByTestId } = renderRouteWithStore('/account-settings', {});

    const passwordChangeForm = await findByTestId(elementIDs.DeleteAccount);

    expect(passwordChangeForm).not.toBeNull();
  });
});
