import { HttpClientImpl, IHttpClient } from 'model/clients/HttpClient';
import { useCallback } from 'react';

export type HttpClientFactory = () => IHttpClient;

export function useHttpClientFactory(): HttpClientFactory {
  const factory = useCallback(() => new HttpClientImpl(), []);

  return factory;
}
