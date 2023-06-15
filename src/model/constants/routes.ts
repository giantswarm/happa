const MainRoutes = {
  Home: '/',
  AdminLogin: '/admin-login',
  Login: '/login',
  Logout: '/logout',
  ForgotPassword: '/forgot_password',
  SetPassword: '/forgot_password/:token',
  SignUp: '/signup/:token',
  StyleGuide: '/styleguide',
};

const AppsRoutes = {
  Home: '/apps',
  AppDetail: '/apps/:catalogName/:app/:version',
};

const UsersRoutes = {
  Home: '/users',
};

const AccountSettingsRoutes = {
  Home: '/account-settings',
  Experiments: {
    Home: '/account-settings/experiments',
    ClusterAppSchemaTester:
      '/account-settings/experiments/cluster-app-schema-tester',
    ClusterAppSchemaTesterProviderBranch:
      '/account-settings/experiments/cluster-app-schema-tester/:provider/:branch',
  },
  Permissions: '/account-settings/permissions',
};

const ExceptionNotificationTestRoutes = {
  Home: '/exception-notification-test',
};

const OrganizationsRoutes = {
  Home: '/organizations',
  List: '/organizations',
  Detail: '/organizations/:orgId',
  AccessControl: '/organizations/:orgId/access-control',
  Clusters: {
    Home: '/organizations/:orgId/clusters',
    New: '/organizations/:orgId/clusters/new',
    NewStatus: '/organizations/:orgId/clusters/new/:clusterId?',
    Detail: {
      Home: '/organizations/:orgId/clusters/:clusterId',
      KeyPairs: '/organizations/:orgId/clusters/:clusterId/keypairs',
      ClientCertificates:
        '/organizations/:orgId/clusters/:clusterId/client-certificates',
      Apps: '/organizations/:orgId/clusters/:clusterId/apps',
      Ingress: '/organizations/:orgId/clusters/:clusterId/ingress',
      WorkerNodes: '/organizations/:orgId/clusters/:clusterId/worker-nodes',
      Actions: '/organizations/:orgId/clusters/:clusterId/actions',
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
  AppsRoutes,
  OrganizationsRoutes,
  MainRoutes,
  UsersRoutes,
  ExceptionNotificationTestRoutes,
};
