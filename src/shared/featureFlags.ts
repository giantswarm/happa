export interface IFeatureFlag {
  /**
   * The value of the flag.
   */
  enabled: boolean;
  /**
   * Instantiate the flag with a value from the environment.
   */
  init?: () => boolean;
  /**
   * When this is set, the feature will be configurable
   * through the admin `Experiments` page.
   */
  experimentName?: string;
  /**
   * Whether the value should be persisted between
   * sessions or not.
   */
  persist?: boolean;
}

export type Feature = 'CustomerSSO' | 'NextGenClusters';

export const flags: Record<Feature, IFeatureFlag> = {
  CustomerSSO: {
    enabled: false,
    init: () => window.featureFlags.FEATURE_MAPI_AUTH,
    experimentName: 'Customer Single Sign-On',
    persist: true,
  },
  NextGenClusters: {
    enabled: false,
    init: () => window.featureFlags.FEATURE_MAPI_CLUSTERS,
    experimentName: 'Next-Gen Clusters',
    persist: true,
  },
};

export function init() {
  for (const [flagName, flagValue] of Object.entries(flags)) {
    let restoredValue: string | null = null;

    // Try to restore the existing value if persistent storage is required.
    if (flagValue.persist) {
      restoredValue = restoreFlagValue(flagName);
    }

    if (restoredValue === null && flagValue.hasOwnProperty('init')) {
      flagValue.enabled = flagValue.init!();
    } else {
      flagValue.enabled = restoredValue === 'true';
    }

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
