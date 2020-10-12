import { AxiosError } from 'axios';
import { ResponseError } from 'superagent';

/**
 * Extract error messages from any type of error object.
 * This supports JavaScript errors, `superagent` Errors and
 * `axios` errors.
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

    case Boolean((error as AxiosError).response?.data?.message):
      return (error as AxiosError).response?.data.message;

    case Boolean((error as Error).message):
      return (error as Error).message;

    default:
      return fallbackMessage;
  }
}
