import { Providers } from 'shared/constants';

export const AWSInfoResponse = {
  general: {
    availability_zones: {
      default: 1,
      max: 3,
      zones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
    },
    datacenter: 'eu-central-1',
    installation_name: 'local',
    provider: Providers.AWS,
  },
  features: { nodepools: { release_version_minimum: '10.0.0' } },
  stats: { cluster_creation_duration: { median: 805, p25: 657, p75: 1031 } },
  workers: {
    count_per_cluster: { max: null, default: 3 },
    instance_type: {
      options: ['m4.xlarge'],
      default: 'm4.xlarge',
    },
  },
};

export const azureInfoResponse = {
  general: {
    availability_zones: { default: 1, max: 1 },
    datacenter: 'westeurope',
    installation_name: 'ghost',
    provider: Providers.AZURE,
  },
  stats: { cluster_creation_duration: { median: 627, p25: 527, p75: 817 } },
  workers: {
    count_per_cluster: { max: null, default: 3 },
    vm_size: {
      options: ['Standard_A2_v2'],
      default: 'Standard_A2_v2',
    },
  },
};

export const KVMInfoResponse = {
  general: {
    availability_zones: { default: 1, max: 1 },
    installation_name: 'geckon',
    provider: Providers.KVM,
  },
  stats: { cluster_creation_duration: { median: 378, p25: 370, p75: 386 } },
  workers: { count_per_cluster: { max: 5, default: 3 } },
};
