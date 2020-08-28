import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  getAllowedInstanceTypeNames,
  getProvider,
} from 'selectors/mainInfoSelectors';
import { Providers } from 'shared/constants';

interface IUseInstanceTypeSelectionLabels {
  (): {
    singular: string;
    plural: string;
  };
}

export const useInstanceTypeSelectionLabels: IUseInstanceTypeSelectionLabels = () => {
  const provider = useSelector(getProvider);

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
    }

    // make typescript & eslint happy
    return { singular: '', plural: '' };
  }, [provider]);
};

export interface IInstanceType {
  cpu: string;
  ram: string;
  description: string;
  name: string;
}

interface IInstanceTypes {
  [instanceType: string]: IInstanceType;
}

interface IUseNormalizedCapabilities {
  (): IInstanceTypes;
}

const useNormalizedCapabilities: IUseNormalizedCapabilities = () => {
  const provider = useSelector(getProvider);

  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rawCaps: any = {};
    const normalizedCapabilities: IInstanceTypes = {};
    switch (provider) {
      case Providers.AWS:
        rawCaps = JSON.parse(window.config.awsCapabilitiesJSON);
        for (const instanceType of Object.keys(rawCaps)) {
          const instance = rawCaps[instanceType];

          normalizedCapabilities[instanceType] = {
            cpu: instance.cpu_cores.toFixed(0),
            ram: instance.memory_size_gb.toFixed(0),
            description: instance.description,
            name: instanceType,
          };
        }
        break;
      case Providers.AZURE:
        rawCaps = JSON.parse(window.config.azureCapabilitiesJSON);
        for (const instanceType of Object.keys(rawCaps)) {
          const instance = rawCaps[instanceType];

          normalizedCapabilities[instanceType] = {
            cpu: instance.numberOfCores.toFixed(0),
            // eslint-disable-next-line no-magic-numbers
            ram: (instance.memoryInMb / 1000).toFixed(2),
            description: instance.description,
            name: instanceType,
          };
        }
        break;
    }

    // make typescript & eslint happy
    return normalizedCapabilities;
  }, [provider]);
};

interface IUseInstanceTypeCapabilities {
  (instanceType: string): {
    cpu: string;
    ram: string;
  };
}

export const useInstanceTypeCapabilities: IUseInstanceTypeCapabilities = (
  instanceType
) => {
  const capabilities = useNormalizedCapabilities();

  return useMemo(() => {
    if (Object.keys(capabilities).includes(instanceType)) {
      return capabilities[instanceType];
    }

    return { cpu: 'n/a', ram: 'n/a' };
  }, [capabilities, instanceType]);
};

interface IUseAllowedInstanceTypes {
  (): IInstanceType[];
}

export const useAllowedInstanceTypes: IUseAllowedInstanceTypes = () => {
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
};
