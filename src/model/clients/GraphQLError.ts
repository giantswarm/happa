import { IGraphQLError } from './GraphQLClient';

export class GraphQLError extends Error {
  public readonly entries: IGraphQLError[] = [];

  public constructor(...fromEntries: IGraphQLError[]) {
    super(GraphQLError.formatErrorMessage(fromEntries));

    this.entries = fromEntries;
  }

  private static formatErrorMessage(fromEntries: IGraphQLError[]): string {
    if (fromEntries.length < 1) return '';
    if (fromEntries.length === 1) return fromEntries[0].message;

    return `${fromEntries[0].message} (+ ${fromEntries.length - 1} more)`;
  }
}
