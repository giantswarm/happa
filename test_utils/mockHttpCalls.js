import nock from 'nock';

export const getMockCall = (endpoint, response = []) =>
  nock('http://localhost:8000')
    .get(endpoint)
    .reply(200, response);

export const postMockCall = (endpoint, response = []) =>
  nock('http://localhost:8000')
    .post(endpoint)
    .reply(200, response);

// Responses for reuse.
export const infoResponse = {
  general: {
    availability_zones: { default: 1, max: 3 },
    installation_name: 'local',
    provider: 'aws',
  },
  stats: {
    cluster_creation_duration: { median: 805, p25: 657, p75: 1031 },
  },
  workers: {
    count_per_cluster: { max: null, default: 3 },
    instance_type: {
      options: [
        'm5.large',
        'm3.large',
        'm3.xlarge',
        'm3.2xlarge',
        'r3.large',
        'r3.xlarge',
        'r3.2xlarge',
        'r3.4xlarge',
        'r3.8xlarge',
      ],
      default: 'm3.large',
    },
  },
};

export const userResponse = {
  email: 'developer@giantswarm.io',
  created: '2019-09-19T12:40:16.2231629Z',
  expiry: '2020-01-01T00:00:00Z',
};

export const authTokenResponse = {
  auth_token: 'efeb3f94-8deb-41a0-84cc-713801ff165e',
};
