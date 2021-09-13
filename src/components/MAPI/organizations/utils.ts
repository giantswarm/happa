import { Cluster } from 'MAPI/types';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';

export enum OrganizationNameStatusMessage {
  TooShort = `Must be at least 4 characters long`,
  StartAndEndWithAlphaNumeric = 'Must start and end with an alphanumeric character (a-z, 0-9)',
  CharacterSet = 'Must contain only a-z, 0-9, and hyphens and underscores',
  TooLong = 'Must not be longer than 249 characters',
  Ok = '',
}

const minLength = 4;
const maxLength = 249;

const startAndEndWithAlphanumericRegExp = /^[a-z0-9].*[a-z0-9]$/;
const characterSetRegExp = /^[a-z0-9\-\_]+$/;

export function validateOrganizationName(orgName: string): {
  valid: boolean;
  statusMessage: OrganizationNameStatusMessage;
} {
  switch (true) {
    case orgName.length < minLength:
      return {
        valid: false,
        statusMessage: OrganizationNameStatusMessage.TooShort,
      };

    case orgName.length > maxLength:
      return {
        valid: false,
        statusMessage: OrganizationNameStatusMessage.TooLong,
      };

    case !startAndEndWithAlphanumericRegExp.test(orgName):
      return {
        valid: false,
        statusMessage:
          OrganizationNameStatusMessage.StartAndEndWithAlphaNumeric,
      };

    case !characterSetRegExp.test(orgName):
      return {
        valid: false,
        statusMessage: OrganizationNameStatusMessage.CharacterSet,
      };

    default:
      return {
        valid: true,
        statusMessage: OrganizationNameStatusMessage.Ok,
      };
  }
}

export function computeClusterCountersForOrganizations(clusters?: Cluster[]) {
  return clusters?.reduce((acc: Record<string, number>, cluster: Cluster) => {
    const clusterOrg = capiv1alpha3.getClusterOrganization(cluster);
    if (!clusterOrg) return acc;

    acc[clusterOrg] ??= 0;
    acc[clusterOrg]++;

    return acc;
  }, {});
}
