import { GraphQLError } from './GraphQLError';
import { HttpClientImpl, HttpRequestMethods, IHttpClient } from './HttpClient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphQLExtensions = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphQLVariables = Record<string, any>;

export interface IGraphQLRequest {
  query: string;
  variables?: GraphQLVariables;
}

export interface IGraphQLErrorLocation {
  line: number;
  column: number;
}

export interface IGraphQLError {
  message: string;
  path?: string[];
  extensions?: GraphQLExtensions;
  locations?: IGraphQLErrorLocation[];
}

export interface IGraphQLResponse<T> {
  status: number;
  data: T | null;
  errors?: IGraphQLError[];
  extensions?: GraphQLExtensions;
}

export interface IGraphQLClient {
  executeQuery<T = unknown>(
    query: string,
    variables?: GraphQLVariables
  ): Promise<T>;
}

export class GraphQLClientImpl implements IGraphQLClient {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    protected url: string,
    protected httpClient: IHttpClient = new HttpClientImpl()
  ) {}

  public async executeQuery<T = unknown>(
    query: string,
    variables?: GraphQLVariables
  ): Promise<T> {
    const req: IGraphQLRequest = { query, variables };

    this.httpClient.setRequestConfig({
      timeout: 10000,
      method: HttpRequestMethods.POST,
      url: this.url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: req,
    });

    const res = await this.httpClient.execute<IGraphQLResponse<T>>();

    if (res.data.errors?.length !== 0) {
      return Promise.reject(new GraphQLError(...res.data.errors!));
    }

    if (!res.data.data) {
      return Promise.reject(new Error('Empty response.'));
    }

    return Promise.resolve(res.data.data);
  }
}
