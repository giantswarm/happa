import { IGraphQLClient } from 'model/clients/GraphQLClient';

import CreateAnalyticsEventMutation from './mutations/CreateAnalyticsEvent.graphql';
import {
  AthenaAnalyticsPayload,
  IAthenaAnalyticsEvent,
  IAthenaAnalyticsEventInput,
} from './types';

export async function createAnalyticsEvent<T extends AthenaAnalyticsPayload>(
  client: IGraphQLClient,
  input: IAthenaAnalyticsEventInput<T>
): Promise<Record<'createAnalyticsEvent', IAthenaAnalyticsEvent<T>>> {
  //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return client.executeQuery(CreateAnalyticsEventMutation, {
    input: { ...input, payload: JSON.stringify(input.payload) },
  });
}
