import { getInfo } from 'model/gateways/ControlPlaneGateway';
import nock from 'nock';
import { AccountSettingsRoutes } from 'shared/constants/routes';
import {
  AWSInfoResponse,
  getMockCall,
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

describe('AccountSettings', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    getInfo.mockResolvedValueOnce(AWSInfoResponse);
    getMockCall('/v4/user/', userResponse);
    getMockCall('/v4/organizations/');
    getMockCall('/v4/clusters/');
    getMockCall('/v4/appcatalogs/');
  });

  afterEach(() => {
    expect(nock.isDone());
    nock.cleanAll();
  });

  it('renders the account settings component on the "/account-settings" route', async () => {
    const { findByText } = renderRouteWithStore(AccountSettingsRoutes.Home, {});

    await findByText('Your Account Settings');
  });

  it('renders the email change form', async () => {
    const { findByTestId } = renderRouteWithStore(
      AccountSettingsRoutes.Home,
      {}
    );

    await findByTestId(elementIDs.ChangeEmailForm);
  });

  it('renders the email change form label and description', async () => {
    const { findByText } = renderRouteWithStore(AccountSettingsRoutes.Home, {});

    await findByText(elementLabels.Email);
    await findByText(elementLabels.EmailExplanatoryText);
  });

  it('renders the password change form', async () => {
    const { findByTestId } = renderRouteWithStore(
      AccountSettingsRoutes.Home,
      {}
    );

    await findByTestId(elementIDs.ChangePasswordForm);
  });

  it('renders the account deletion section', async () => {
    const { findByText } = renderRouteWithStore(AccountSettingsRoutes.Home, {});

    await findByText(elementLabels.DeleteAccount);
  });
});
