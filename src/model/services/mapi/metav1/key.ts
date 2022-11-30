import { IK8sStatus, IK8sStatusError, K8sStatusErrorReasons } from './';
import { Quantity } from './types';

/**
 * Determine if an object is a K8s status response.
 * @param obj
 */
export function isStatus(obj: unknown): obj is IK8sStatus {
  if (!obj) return false;

  return (obj as IK8sStatus).kind === 'Status';
}

/**
 * Determine if an object is K8s error status response.
 * @param obj
 * @param reason
 */
export function isStatusError<
  T extends K8sStatusErrorReasons = K8sStatusErrorReasons.Unknown
>(obj: unknown, reason: T): obj is IK8sStatusError<T> {
  if (!isStatus(obj)) return false;

  return obj.reason === reason;
}

/**
 * Quantity helper functions copied from the official kubernetes client.
 * {@link https://github.com/kubernetes-client/javascript/blob/ad6e451ce01f698ab18ceb03fb712e014bc93a5b/src/util.ts}
 *
 * All suffixes can be found here.
 * {@link https://github.com/kubernetes/apimachinery/blob/8303750571678b1e7ccef2b8b597b5286aab7eb7/pkg/api/resource/suffix.go#L108}
 */
const floatingPointRegexp = /[\.0-9]/;
export function getQuantitySuffix(quantity: Quantity): string {
  let ix = quantity.length - 1;
  while (ix >= 0 && !floatingPointRegexp.test(quantity.charAt(ix))) {
    ix--;
  }

  return ix === -1 ? '' : quantity.substring(ix + 1);
}

export function quantityToScalar(quantity: Quantity): number | BigInt {
  if (!quantity) {
    return 0;
  }

  const suffix = getQuantitySuffix(quantity);
  switch (suffix) {
    case 'n':
      return (
        // eslint-disable-next-line no-magic-numbers
        Number(quantity.substr(0, quantity.length - 1)).valueOf() / 1000000000.0
      );
    case 'u':
      return (
        // eslint-disable-next-line no-magic-numbers
        Number(quantity.substr(0, quantity.length - 1)).valueOf() / 1000000.0
      );
    case 'm':
      return (
        // eslint-disable-next-line no-magic-numbers
        Number(quantity.substr(0, quantity.length - 1)).valueOf() / 1000.0
      );
    case '': {
      const num = Number(quantity).valueOf();
      if (isNaN(num)) {
        throw new Error(`Unknown quantity ${quantity}`);
      }

      return num;
    }
    case 'k':
      return (
        // eslint-disable-next-line no-magic-numbers
        Number(quantity.substr(0, quantity.length - 1)).valueOf() * 1000.0
      );
    case 'Ki':
      // eslint-disable-next-line no-magic-numbers
      return BigInt(quantity.substr(0, quantity.length - 2)) * BigInt(1024);
    case 'Mi':
      return (
        // eslint-disable-next-line no-magic-numbers
        BigInt(quantity.substr(0, quantity.length - 2)) * BigInt(1024 ** 2)
      );
    case 'Gi':
      return (
        BigInt(quantity.substr(0, quantity.length - 2)) *
        // eslint-disable-next-line no-magic-numbers
        BigInt(1024 ** 3)
      );
    case 'Ti':
      return (
        BigInt(quantity.substr(0, quantity.length - 2)) *
        // eslint-disable-next-line no-magic-numbers
        BigInt(1024 ** 3) *
        // eslint-disable-next-line no-magic-numbers
        BigInt(1024)
      );
    case 'Pi':
      return (
        BigInt(quantity.substr(0, quantity.length - 2)) *
        // eslint-disable-next-line no-magic-numbers
        BigInt(1024 ** 3) *
        // eslint-disable-next-line no-magic-numbers
        BigInt(1024 ** 2)
      );
    case 'Ei':
      return (
        BigInt(quantity.substr(0, quantity.length - 2)) *
        // eslint-disable-next-line no-magic-numbers
        BigInt(1024 ** 3) *
        // eslint-disable-next-line no-magic-numbers
        BigInt(1024 ** 3)
      );
    default:
      throw new Error(`Unknown suffix: ${suffix}`);
  }
}
