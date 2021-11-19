import { GenericResponse } from 'model/clients/GenericResponse';
import { StatusCodes } from 'model/constants';
import nock from 'nock';

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
  nock(API_ENDPOINT).get(endpoint).reply(StatusCodes.Ok, response);

export const getMockCallTimes = (endpoint, response = [], times = 1) =>
  nock(API_ENDPOINT).get(endpoint).times(times).reply(StatusCodes.Ok, response);

export const getPersistedMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT).persist().get(endpoint).reply(StatusCodes.Ok, response);

export const postMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT).post(endpoint).reply(StatusCodes.Ok, response);

export const postPayloadMockCall = (
  endpoint,
  payload = {},
  response = [],
  statusCode = StatusCodes.Ok
) => nock(API_ENDPOINT).post(endpoint, payload).reply(statusCode, response);

export const mockCall = (method, endpoint, response = []) =>
  nock(API_ENDPOINT)[method](endpoint).reply(StatusCodes.Ok, response);

// https://gist.github.com/6174/6062387#gistcomment-2651745
/* eslint-disable no-magic-numbers */
export const generateRandomString = (length = 8) =>
  Array.from({ length }, () => (~~(Math.random() * 36)).toString(36)).join('');
/* eslint-enable no-magic-numbers */

// eslint-disable-next-line no-magic-numbers
export const mockAPIResponse = (apiResponse, status = 200) => {
  const response = new GenericResponse(status, apiResponse);

  return response;
};
