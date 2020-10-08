interface IInstallationInfoAvailabilityZones {
  default: number;
  max: number;
  zones?: string[];
}

interface IInstallationInfoKubernetesVersion {
  minor_version: string;
  eol_date: string;
}

interface IInstallationInfoGeneral {
  provider: import('shared/types').PropertiesOf<
    typeof import('shared/constants').Providers
  >;
  installation_name: string;
  availability_zones: IInstallationInfoAvailabilityZones | null;
  kubernetes_versions?: IInstallationInfoKubernetesVersion[];
  datacenter?: string;
}

interface IInstallationInfoFeature {
  release_version_minimum: string;
}

interface IInstallationInfoFeatures {
  nodepools?: IInstallationInfoFeature;
  spot_instances?: IInstallationInfoFeature;
  ha_masters?: IInstallationInfoFeature;
}

interface IInstallationInfoStatsSummarizingStat {
  median: number;
  p25: number;
  p75: number;
}

interface IInstallationInfoStats {
  cluster_creation_duration: IInstallationInfoStatsSummarizingStat | null;
}

interface IInstallationInfoWorkersCountPerCluster {
  max: number | null;
  default: number;
}

interface IInstallationInfoWorkersInstanceType {
  options: string[] | null;
  default: string;
}

interface IInstallationInfoWorkersVMSize {
  options: string[] | null;
  default: string;
}

interface IInstallationInfoWorkers {
  count_per_cluster: IInstallationInfoWorkersCountPerCluster;
  instance_type?: IInstallationInfoWorkersInstanceType;
  vm_size?: IInstallationInfoWorkersVMSize;
}

interface IInstallationInfo {
  general: IInstallationInfoGeneral;
  stats: IInstallationInfoStats;
  workers: IInstallationInfoWorkers;
  features?: IInstallationInfoFeatures;
}
