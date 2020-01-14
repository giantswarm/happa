import { StatusCodes } from 'shared/constants';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';

export const API_ENDPOINT = 'http://1.2.3.4';
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
export const getMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .get(endpoint)
    .reply(StatusCodes.Ok, response);

export const getMockCallTimes = (endpoint, response = [], times = 1) =>
  nock(API_ENDPOINT)
    .get(endpoint)
    .times(times)
    .reply(StatusCodes.Ok, response);

export const getPersistedMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .persist()
    .get(endpoint)
    .reply(StatusCodes.Ok, response);

export const postMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .post(endpoint)
    .reply(StatusCodes.Ok, response);

export const postPayloadMockCall = (
  endpoint,
  payload = {},
  response = [],
  statusCode = StatusCodes.Ok
) =>
  nock(API_ENDPOINT)
    .post(endpoint, payload)
    .reply(statusCode, response);

// https://gist.github.com/6174/6062387#gistcomment-2651745
/* eslint-disable no-magic-numbers */
export const generateRandomString = (length = 8) =>
  Array.from({ length }, () => (~~(Math.random() * 36)).toString(36)).join('');
/* eslint-enable no-magic-numbers */
