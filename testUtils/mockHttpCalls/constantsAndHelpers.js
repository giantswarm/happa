import nock from 'nock';

export const API_ENDPOINT = 'http://localhost:8000';
export const USER_EMAIL = 'developer@giantswarm.io';
export const ORGANIZATION = 'acme';
export const V4_CLUSTER = {
  id: '7ccr6',
  name: 'My v4 cluster',
  releaseVersion: '8.5.0',
  AWSInstanceType: 'm4.xlarge',
  AzureInstanceType: 'Standard_A2_v2',
};
export const V5_CLUSTER = {
  id: 'm0ckd',
  name: 'All purpose cluster',
  releaseVersion: '10.0.0',
};

/***** Helper functions *****/
/* eslint-disable no-magic-numbers */
export const getMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .get(endpoint)
    .reply(200, response);

export const getPersistedMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .persist()
    .get(endpoint)
    .reply(200, response);

export const postMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .post(endpoint)
    .reply(200, response);
/* eslint-enable no-magic-numbers */
