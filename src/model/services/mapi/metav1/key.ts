import { IK8sStatus, IK8sStatusError, K8sStatusErrorReasons } from './';

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
