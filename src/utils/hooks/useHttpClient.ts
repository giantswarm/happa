import { HttpClientImpl, IHttpClient } from 'model/clients/HttpClient';
import { useRef } from 'react';

/**
 * Create an instance of an HTTP client, which stays
 * the same between re-renders.
 */
export function useHttpClient(): IHttpClient {
  const clientRef = useRef(new HttpClientImpl());

  return clientRef.current;
}
