export interface IK8sLabelSelector {
  /**
   * Find all the resources that have
   * these labels set to these values.
   */
  matchingLabels?: Record<string, string>;
}

export interface IK8sFieldSelector {
  /**
   * Find all the resources that have
   * these fields set to these values.
   */
  matchingFields?: Record<string, string>;
}

export interface IK8sBaseOptions {
  /**
   * The Kubernetes API URL.
   */
  baseUrl: string;
  /**
   * The kind of resource that we need to fetch (e.g. `clusters`).
   * It must be in plural form.
   */
  kind: string;
  /**
   * The required resource group and version (e.g. `cluster.x-k8s.io/v1alpha3`).
   * This field must not be set when `isCore` is set to true.
   */
  apiVersion?: string;
  /**
   * Set this to `true` if you want to fetch core K8s resources (e.g. `pods`).s
   */
  isCore?: boolean;
}

export interface IK8sGetOptions extends IK8sBaseOptions {
  /**
   * The resource's name.
   */
  name: string;
  /**
   * The namespace that the resource lives in.
   */
  namespace?: string;
}

export interface IK8sListOptions extends IK8sBaseOptions {
  /**
   * The namespace that the resources live in.
   */
  namespace?: string;
  /**
   * Find a specific resource based on label values.
   */
  labelSelector?: IK8sLabelSelector;
  /**
   * Find a specific resourec based on field values.
   */
  fieldSelector?: IK8sFieldSelector;
}

export interface IK8sWatchOptions extends IK8sBaseOptions {
  /**
   * The resource's name.
   */
  name: string;
  /**
   * The namespace that the resource lives in.
   */
  namespace: string;
  /**
   * This field must be set to `true` when watching resources.
   */
  watch: true;
}

export interface IK8sCreateOptions extends IK8sBaseOptions {
  /**
   * The namespace that the resource lives in.
   */
  namespace: string;
  /**
   * If set to `true`, it indicates that modifications
   * will not be persisted.
   */
  dryRun?: boolean;
}

export interface IK8sUpdateOptions extends IK8sBaseOptions {
  /**
   * The resource's name.
   */
  name: string;
  /**
   * The namespace that the resource lives in.
   */
  namespace: string;
  /**
   * If set to `true`, it indicates that modifications
   * will not be persisted.
   */
  dryRun?: boolean;
}

export interface IK8sPatchOptions extends IK8sBaseOptions {
  /**
   * The resource's name.
   */
  name: string;
  /**
   * The namespace that the resource lives in.
   */
  namespace: string;
  /**
   * If set to `true`, it indicates that modifications
   * will not be persisted.
   */
  dryRun?: boolean;
}

export interface IK8sDeleteOptions extends IK8sBaseOptions {
  /**
   * The namespace that the resource lives in.
   */
  namespace: string;
  /**
   * The resource's name. This can be omitted when trying
   * to delete multiple resources at the same time.
   * This cannot be set when `labelSelector` or `fieldSelector`
   * are set.
   */
  name?: string;
  /**
   * Find a specific resource based on label values.
   * This cannot be used when`name` is set.
   */
  labelSelector?: IK8sLabelSelector;
  /**
   * Find a specific resourec based on field values.
   * This cannot be used when`name` is set.
   */
  fieldSelector?: IK8sFieldSelector;
}

/**
 * Create a URL that can be used to fetch information from the
 * Kubernetes API.
 * @param options - Different common settings for writing the URL
 * in the correct shape.
 */
export function create(options: IK8sGetOptions): URL;
export function create(options: IK8sListOptions): URL;
export function create(options: IK8sWatchOptions): URL;
export function create(options: IK8sCreateOptions): URL;
export function create(options: IK8sUpdateOptions): URL;
export function create(options: IK8sPatchOptions): URL;
export function create(options: IK8sDeleteOptions): URL;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function create(options: any): URL {
  const {
    baseUrl,
    apiVersion,
    kind,
    name,
    namespace,
    dryRun,
    watch,
    labelSelector,
    fieldSelector,
    isCore,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const url = new URL(baseUrl);

  // Compute the pathname.
  const pathnameParts = [];

  if (apiVersion) {
    if (isCore) {
      throw new Error(
        `The option 'apiVersion' cannot be set when 'isCore' is set to true.`
      );
    }

    pathnameParts.push(apiVersion);
  } else if (!isCore) {
    throw new Error(
      `The option 'apiVersion' must be set when 'isCore' is set to false.`
    );
  }

  if (namespace) {
    pathnameParts.push(`namespaces/${namespace}`);
  }

  if (kind) {
    pathnameParts.push(kind);
  }

  if (name) {
    if (labelSelector) {
      throw new Error(
        `The option 'labelSelector' cannot be set when 'name' is present.`
      );
    }

    if (fieldSelector) {
      throw new Error(
        `The option 'fieldSelector' cannot be set when 'name' is present.`
      );
    }

    pathnameParts.push(name);
  } else if (watch) {
    throw new Error(
      `The option 'watch' can only be set when 'name' is present.`
    );
  }

  if (pathnameParts.length > 0) {
    let pathPrefix = 'apis';
    if (isCore) {
      pathPrefix = 'api/v1';
    }

    url.pathname += `${pathPrefix}/${pathnameParts.join('/')}/`.toLowerCase();
  }

  // Compute the search parameters.
  if (dryRun) {
    url.searchParams.set('dryRun', 'true');
  }

  if (watch) {
    url.searchParams.set('watch', 'true');
  }

  if (labelSelector) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const labels = serializeLabelSelector(labelSelector);
    if (labels) {
      url.searchParams.set('labelSelector', labels);
    }
  }

  if (fieldSelector) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const fields = serializeFieldSelector(fieldSelector);
    if (fields) {
      url.searchParams.set('fieldSelector', fields);
    }
  }

  return url;
}

function serializeLabelSelector(labelSelector: IK8sLabelSelector): string {
  if (labelSelector.matchingLabels) {
    return serializeKeyValuePairs(labelSelector.matchingLabels);
  }

  return '';
}

function serializeFieldSelector(fieldSelector: IK8sFieldSelector): string {
  if (fieldSelector.matchingFields) {
    return serializeKeyValuePairs(fieldSelector.matchingFields);
  }

  return '';
}

function serializeKeyValuePairs(from: Record<string, string>): string {
  return Object.entries(from).reduce<string>((acc, [labelKey, labelValue]) => {
    if (!labelKey || !labelValue) return acc;

    let newAcc = acc;
    if (acc.length > 0) {
      newAcc += ',';
    }
    newAcc += `${labelKey}=${labelValue}`;

    return newAcc;
  }, '');
}
