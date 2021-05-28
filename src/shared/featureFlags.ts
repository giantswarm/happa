export interface IFeatureFlag {
  init: () => boolean;
  enabled: boolean;
  name?: string;
  persist?: boolean;
}

export type Feature = 'CustomerSSO';

export const flags: Record<Feature, IFeatureFlag> = {
  CustomerSSO: {
    init: () => window.featureFlags.FEATURE_MAPI_AUTH,
    enabled: true,
    name: 'Customer Single Sign-On',
    persist: true,
  },
};

export function init() {
  for (const [flagName, flagValue] of Object.entries(flags)) {
    let value: boolean | null = null;

    // Try to restore the existing value if persistent storage is required.
    if (flagValue.persist) {
      value = restoreFlagValue(flagName)?.toLowerCase() === 'true';
    }

    if (value === null) {
      value = flagValue.init();
    }

    flagValue.enabled = value;

    flags[flagName as Feature] = makeFlagProxy(flagName, flagValue);
  }
}

function makeFlagProxy(
  flagName: string,
  flagValue: IFeatureFlag
): IFeatureFlag {
  const proxy = new Proxy(flagValue, {
    get(target: IFeatureFlag, propertyName: keyof IFeatureFlag) {
      return target[propertyName];
    },
    set(
      target: IFeatureFlag,
      propertyName: keyof IFeatureFlag,
      value: IFeatureFlag[keyof IFeatureFlag]
    ) {
      // Prevent editing anything but the `enabled` key.
      if (propertyName !== 'enabled') return false;

      // Persist the value if required.
      if (target.persist) {
        persistFlagValue(flagName, value as boolean);
      }

      target[propertyName] = value as boolean;

      return true;
    },
  });

  return proxy;
}

function getStorageKey(flagName: string) {
  return `featureFlag.${flagName}`;
}

function persistFlagValue(flagName: string, value: boolean) {
  const key = getStorageKey(flagName);
  localStorage.setItem(key, String(value));
}

function restoreFlagValue(flagName: string) {
  const key = getStorageKey(flagName);

  return localStorage.getItem(key);
}
