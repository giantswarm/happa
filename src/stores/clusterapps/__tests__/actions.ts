import nock from 'nock';
import { IState } from 'reducers/types';
import { StatusCodes } from 'shared/constants';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { API_ENDPOINT } from 'testUtils/mockHttpCalls';
import { V5_CLUSTER } from 'testUtils/mockHttpCalls';

import { updateClusterApp } from '../actions';

describe('updateClusterApp', () => {
  it('correctly composes the request payload', async () => {
    const appName = 'nginx-ingress-controller-app';
    const clusterId = V5_CLUSTER.id;
    const version = '1.9.2';

    const request = nock(API_ENDPOINT)
      .patch(`/v5/clusters/${clusterId}/apps/${appName}/`, {
        spec: { version: version },
      })
      .reply(StatusCodes.Ok);

    const dispatch: IAsynchronousDispatch<{}> = ((() => {}) as unknown) as IAsynchronousDispatch<{}>;

    await updateClusterApp({ appName, clusterId, version }).doPerform(
      ({
        entities: {
          clusters: {
            v5Clusters: [clusterId],
          },
        },
      } as unknown) as IState,
      dispatch
    );

    // expect the request mock has been used
    expect(request.isDone());
  });
});
