const MainRoutes = {
  Home: '/',
  AdminLogin: '/admin-login',
  Login: '/login',
  Logout: '/logout',
  ForgotPassword: '/forgot_password',
  SetPassword: '/forgot_password/:token',
  SignUp: '/signup/:token',
  OAuthCallback: '/oauth/callback',
  CPAccess: '/cp-access',
  CPAccessCallback: '/cp-access/callback',
  StyleGuide: '/styleguide',
};

const AppsRoutes = {
  Home: '/apps',
  AppDetail: '/apps/:catalogName/:app/:version',
};

const AppCatalogRoutes = {
  Home: '/app-catalogs',
  AppList: '/app-catalogs/:catalogName',
  AppDetail: '/app-catalogs/:catalogName/:app/:version',
};

const UsersRoutes = {
  Home: '/users',
};

const AccountSettingsRoutes = {
  Home: '/account-settings',
};

const ExceptionNotificationTestRoutes = {
  Home: '/exception-notification-test',
};

const OrganizationsRoutes = {
  Home: '/organizations',
  List: '/organizations',
  Detail: '/organizations/:orgId',
  Clusters: {
    Home: '/organizations/:orgId/clusters',
    New: '/organizations/:orgId/clusters/new',
    Detail: {
      Home: '/organizations/:orgId/clusters/:clusterId',
      KeyPairs: '/organizations/:orgId/clusters/:clusterId/keypairs',
      Apps: '/organizations/:orgId/clusters/:clusterId/apps',
      Ingress: '/organizations/:orgId/clusters/:clusterId/ingress',
    },
    GettingStarted: {
      Overview: '/organizations/:orgId/clusters/:clusterId/getting-started',
      ConfigureKubeCtl:
        '/organizations/:orgId/clusters/:clusterId/getting-started/configure',
      InstallIngress:
        '/organizations/:orgId/clusters/:clusterId/getting-started/ingress',
      SimpleExample:
        '/organizations/:orgId/clusters/:clusterId/getting-started/example',
      NextSteps:
        '/organizations/:orgId/clusters/:clusterId/getting-started/next-steps',
    },
  },
};

export {
  AccountSettingsRoutes,
  AppCatalogRoutes,
  AppsRoutes,
  OrganizationsRoutes,
  MainRoutes,
  UsersRoutes,
  ExceptionNotificationTestRoutes,
};
