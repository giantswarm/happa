import { ResponseError } from 'superagent';

/**
 * Extract error messages from any type of error object.
 * This supports JavaScript errors and `superagent` Errors.
 * @param error
 * @param fallbackMessage - The message to return if no message
 * could be extracted from the error object.
 */
export function extractMessageFromError(
  error: unknown,
  fallbackMessage: string
): string {
  switch (true) {
    case Boolean((error as ResponseError).response?.body?.message):
      return (error as ResponseError).response?.body.message;

    case Boolean((error as Error).message):
      return (error as Error).message;

    default:
      return fallbackMessage;
  }
}
