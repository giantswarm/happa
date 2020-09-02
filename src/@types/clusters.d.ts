interface IClusterCapabilities {
  hasOptionalIngress: boolean;
  supportsHAMasters: boolean;
}

interface IBaseCluster {
  id: string;
  api_endpoint: string;
  create_date: string | null;
  owner: string;
  name: string;
  release_version: string;

  credential_id?: string;
  delete_date?: string | null;

  // Injected by client-side.
  capabilities?: IClusterCapabilities;
  keyPairs?: import('shared/types').IKeyPair[];
  lastUpdated?: number;
  // FIXME(axbarsan): Write proper app type.
  apps?: Record<string, unknown>[];
}

interface IRawInstanceType {
  description: string;
}

interface IRawAWSInstanceType extends IRawInstanceType {
  cpu_cores: number;
  memory_size_gb: number;
}

interface IRawAzureInstanceType extends IRawInstanceType {
  numberOfCores: number;
  memoryInMb: number;
}
