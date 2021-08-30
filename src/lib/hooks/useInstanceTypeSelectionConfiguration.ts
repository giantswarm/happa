import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Providers } from 'shared/constants';
import { getAllowedInstanceTypeNames } from 'stores/main/selectors';

export function useInstanceTypeSelectionLabels(): {
  singular: string;
  plural: string;
} {
  const provider = window.config.info.general.provider;

  return useMemo(() => {
    switch (provider) {
      case Providers.AWS:
        return {
          singular: 'Instance type',
          plural: 'Instance types',
        };
      case Providers.AZURE:
        return {
          singular: 'VM size',
          plural: 'VM sizes',
        };
      default:
        return { singular: '', plural: '' };
    }
  }, [provider]);
}

export interface IInstanceType {
  cpu: string;
  ram: string;
  description: string;
  name: string;
}

function useNormalizedCapabilities(): Record<string, IInstanceType> {
  const provider = window.config.info.general.provider;

  return useMemo(() => {
    let rawCaps: Record<string, IRawInstanceType> = {};
    const normalizedCapabilities: Record<string, IInstanceType> = {};
    switch (provider) {
      case Providers.AWS:
        rawCaps = JSON.parse(window.config.awsCapabilitiesJSON);
        for (const [instanceType, instanceProperties] of Object.entries(
          rawCaps as Record<string, IRawAWSInstanceType>
        )) {
          normalizedCapabilities[instanceType] = {
            cpu: instanceProperties.cpu_cores.toFixed(0),
            ram: instanceProperties.memory_size_gb.toFixed(0),
            description: instanceProperties.description,
            name: instanceType,
          };
        }

        break;

      case Providers.AZURE:
        rawCaps = JSON.parse(window.config.azureCapabilitiesJSON);
        for (const [instanceType, instanceProperties] of Object.entries(
          rawCaps as Record<string, IRawAzureInstanceType>
        )) {
          normalizedCapabilities[instanceType] = {
            cpu: instanceProperties.numberOfCores.toFixed(0),
            // eslint-disable-next-line no-magic-numbers
            ram: (instanceProperties.memoryInMb / 1000).toFixed(2),
            description: instanceProperties.description,
            name: instanceType,
          };
        }

        break;
    }

    return normalizedCapabilities;
  }, [provider]);
}

export function useInstanceTypeCapabilities(
  instanceType: string
): {
  cpu: string;
  ram: string;
} {
  const capabilities = useNormalizedCapabilities();

  return useMemo(() => {
    if (Object.keys(capabilities).includes(instanceType)) {
      return capabilities[instanceType];
    }

    return { cpu: 'n/a', ram: 'n/a' };
  }, [capabilities, instanceType]);
}

export function useAllowedInstanceTypes(): IInstanceType[] {
  const allowedInstanceTypeNames = useSelector(getAllowedInstanceTypeNames);
  const capabilities = useNormalizedCapabilities();

  return useMemo(() => {
    const allowedInstanceTypes: IInstanceType[] = [];

    for (const instanceType of allowedInstanceTypeNames) {
      allowedInstanceTypes.push(
        capabilities[instanceType] ?? {
          name: instanceType,
          description: 'n/a',
          cpu: 'n/a',
          ram: 'n/a',
        }
      );
    }

    return allowedInstanceTypes;
  }, [allowedInstanceTypeNames, capabilities]);
}
