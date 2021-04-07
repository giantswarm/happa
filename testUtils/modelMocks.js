jest.mock('model/services/giantSwarm/info');
jest.mock('model/services/metadata/configuration');

jest.mock('model/services/mapi/authorizationv1/createSelfSubjectAccessReview');
jest.mock('model/services/mapi/authorizationv1/createSelfSubjectRulesReview');
jest.mock('model/services/mapi/securityv1alpha1/getOrganizationList');
jest.mock('model/services/mapi/securityv1alpha1/getOrganization');
