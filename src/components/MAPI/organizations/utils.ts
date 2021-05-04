import { GenericResponse } from 'model/clients/GenericResponse';
import * as metav1 from 'model/services/mapi/metav1';

/**
 * Compute an organization namespace from the given organization name.
 * @param name
 */
export function getOrgNamespaceFromOrgName(name: string) {
  return `org-${name}` as const;
}

/**
 * Extract the error message from a K8s API response.
 * @param fromErr
 * @param fallback - What message to return if the message
 * could not be extracted.
 */
export function extractErrorMessage(
  fromErr: unknown,
  fallback = 'Something went wrong'
): string {
  if (!fromErr) return '';

  let message = '';

  if (metav1.isStatus((fromErr as GenericResponse).data)) {
    message =
      (fromErr as GenericResponse<metav1.IK8sStatus>).data.message ?? '';
  } else if (fromErr instanceof Error) {
    message = fromErr.message;
  }

  message ||= fallback;

  return message;
}
