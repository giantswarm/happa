import {
  AWSInfoResponse,
  getPersistedMockCall,
  userResponse,
} from 'testUtils/mockHttpCalls';
import { renderRouteWithStore } from 'testUtils/renderUtils';

const elementIDs = {
  ChangeEmailForm: 'account-settings/change-email',
  ChangePasswordForm: 'account-settings/change-password',
};

const elementLabels = {
  Email: 'Email',
  EmailExplanatoryText:
    'This address is used for logging in and for all communication. Be aware that it is also visible to other members of your organization.',
  DeleteAccount: 'Delete Account',
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

    await findByTestId(elementIDs.ChangeEmailForm);
  });

  it('renders the email change form label and description', async () => {
    const { findByText } = renderRouteWithStore('/account-settings', {});

    await findByText(elementLabels.Email);
    await findByText(elementLabels.EmailExplanatoryText);
  });

  it('renders the password change form', async () => {
    const { findByTestId } = renderRouteWithStore('/account-settings', {});

    await findByTestId(elementIDs.ChangePasswordForm);
  });

  it('renders the account deletion section', async () => {
    const { findByText } = renderRouteWithStore('/account-settings', {});

    await findByText(elementLabels.DeleteAccount);
  });
});
