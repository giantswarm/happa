export interface IK8sLabelSelector {
  matchingLabels?: Record<string, string>;
}

export interface IK8sFieldSelector {
  matchingFields?: Record<string, string>;
}

export interface IK8sBaseOptions {
  baseUrl: string;
  apiVersion: string;
  kind: string;
}

export interface IK8sGetOptions extends IK8sBaseOptions {
  name: string;
  namespace: string;
}

export interface IK8sListOptions extends IK8sBaseOptions {
  labelSelector?: IK8sLabelSelector;
  fieldSelector?: IK8sFieldSelector;
}

export interface IK8sWatchOptions extends IK8sBaseOptions {
  name: string;
  namespace: string;
  watch: true;
}

export interface IK8sCreateOptions extends IK8sBaseOptions {
  namespace: string;
  dryRun?: boolean;
}

export interface IK8sUpdateOptions extends IK8sBaseOptions {
  name: string;
  namespace: string;
  dryRun?: boolean;
}

export interface IK8sPatchOptions extends IK8sBaseOptions {
  name: string;
  namespace: string;
  dryRun?: boolean;
}

export interface IK8sDeleteOptions extends IK8sBaseOptions {
  namespace: string;
  name?: string;
  labelSelector?: IK8sLabelSelector;
  fieldSelector?: IK8sFieldSelector;
}

// TODO(axbarsan): Take into account core types (api/v1 prefix).

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
  } = options;

  const url = new URL(baseUrl);

  // Compute the pathname.
  const pathnameParts = [];

  if (apiVersion) {
    pathnameParts.push(apiVersion);
  }

  if (namespace) {
    pathnameParts.push(`namespaces/${namespace}`);
  }

  if (kind) {
    pathnameParts.push(kind);
  }

  if (name) {
    pathnameParts.push(name);
  }

  if (pathnameParts.length > 0) {
    url.pathname += `apis/${pathnameParts.join('/')}/`;
  }

  // Compute the search parameters.
  if (dryRun) {
    url.searchParams.set('dryRun', 'true');
  }

  if (watch) {
    if (!name) {
      throw new Error(
        `The option 'watch' can only be set when 'name' is present.`
      );
    }

    url.searchParams.set('watch', 'true');
  }

  if (labelSelector) {
    if (name) {
      throw new Error(
        `The option 'labelSelector' cannot be set when 'name' is present.`
      );
    }

    const labels = serializeLabelSelector(labelSelector);
    if (labels) {
      url.searchParams.set('labelSelector', labels);
    }
  }

  if (fieldSelector) {
    if (name) {
      throw new Error(
        `The option 'fieldSelector' cannot be set when 'name' is present.`
      );
    }

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
