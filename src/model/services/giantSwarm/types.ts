import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export enum GiantSwarmPaths {
  Info = '/v4/info/',
}

export interface IInstallationInfoAvailabilityZones {
  default: number;
  max: number;
  zones?: string[];
}

export interface IInstallationInfoGeneral {
  provider: PropertiesOf<typeof Providers>;
  installation_name: string;
  availability_zones: IInstallationInfoAvailabilityZones | null;
  datacenter?: string;
}

export interface IInstallationInfoFeature {
  release_version_minimum: string;
}

export interface IInstallationInfoFeatures {
  nodepools?: IInstallationInfoFeature;
  spot_instances?: IInstallationInfoFeature;
  ha_masters?: IInstallationInfoFeature;
}

export interface IInstallationInfoStatsSummarizingStat {
  median: number;
  p25: number;
  p75: number;
}

export interface IInstallationInfoStats {
  cluster_creation_duration: IInstallationInfoStatsSummarizingStat | null;
}

export interface IInstallationInfoWorkersCountPerCluster {
  max: number | null;
  default: number;
}

export interface IInstallationInfoWorkersInstanceType {
  options: string[] | null;
  default: string;
}

export interface IInstallationInfoWorkersVMSize {
  options: string[] | null;
  default: string;
}

export interface IInstallationInfoWorkers {
  count_per_cluster: IInstallationInfoWorkersCountPerCluster;
  instance_type?: IInstallationInfoWorkersInstanceType;
  vm_size?: IInstallationInfoWorkersVMSize;
}

export interface IInstallationInfo {
  general: IInstallationInfoGeneral;
  stats: IInstallationInfoStats;
  workers: IInstallationInfoWorkers;
  features?: IInstallationInfoFeatures;
}
