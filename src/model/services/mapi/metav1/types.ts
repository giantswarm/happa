export interface IObjectMeta {
  name: string;
  namespace: string;
  resourceVersion: string;
  selfLink: string;
  uid: string;
  creationTimestamp: string;
  finalizers: string[];
  generation: number;
  annotations?: Record<string, string>;
  deletionTimestamp?: string;
  labels?: Record<string, string>;
}

export interface ITypeMeta {
  resourceVersion: string;
  selfLink: string;
}

export interface IList<T> {
  apiVersion: string;
  kind: string;
  metadata: ITypeMeta;
  items: T[];
}

export enum K8sStatusErrorReasons {
  /**
   * The server has declined to indicate a specific reason.
   */
  Unknown = '',
  /**
   * The server can be reached and understood the request, but requires
   * the user to present appropriate authorization credentials
   * in order for the action to be completed.
   * If the user has specified credentials on the request, the
   * server considers them insufficient.
   */
  Unauthorized = 'Unauthorized',
  /**
   * The server can be reached and understood the request, but refuses
   * to take any further action. It is the result of the server being
   * configured to deny access for some reason to the requested
   * resource by the client.
   */
  Forbidden = 'Forbidden',
  /**
   * One or more resources required for this operation could not be found.
   */
  NotFound = 'NotFound',
  /**
   * The resource you are creating already exists.
   */
  AlreadyExists = 'AlreadyExists',
  /**
   * The requested operation cannot be completed due to a conflict
   * in the operation. The client may need to alter the request.
   */
  Conflict = 'Conflict',
  /**
   * The item is no longer available at the server and no forwarding address is known.
   */
  Gone = 'Gone',
  /**
   * The requested create or update operation cannot be completed
   * due to invalid data provided as part of the request. The client may
   * need to alter the request.
   */
  Invalid = 'Invalid',
  /**
   * The server can be reached and understood the request, but cannot
   * complete the action in a reasonable time. The client should retry the request.
   * This is may be due to temporary server load or a transient
   * communication issue with another server.
   */
  ServerTimeout = 'ServerTimeout',
  /**
   * The request could not be completed within the given time.
   * Clients can get this response only when they specified a
   * timeout param in the request, or if the server cannot complete
   * the operation within a reasonable amount of time.
   * The request might succeed with an increased value of timeout param.
   */
  Timeout = 'Timeout',
  /**
   * The server experienced too many requests within a
   * given window and that the client must wait to perform the action again.
   */
  TooManyRequests = 'TooManyRequests',
  /**
   * The request itself was invalid, because the request doesn't
   * make any sense, for example deleting a read-only object. This is different than
   * `Invalid` above which indicates that the
   * API call could possibly succeed, but the data was invalid.
   */
  BadRequest = 'BadRequest',
  /**
   * The action the client attempted to perform on the resource
   * was not supported by the code - for instance, attempting to
   * delete a resource that can only be created.
   */
  NotAllowed = 'NotAllowed',
  /**
   * The accept types indicated by the client were not acceptable
   * to the server - for instance, attempting to receive protobuf
   * for a resource that supports only json and yaml.
   */
  NotAcceptable = 'NotAcceptable',
  /**
   * The request entity is too large.
   */
  EntityTooLarge = 'EntityTooLarge',
  /**
   * The content type sent by the client is not acceptable
   * to the server - for instance, attempting to send protobuf
   * for a resource that supports only json and yaml.
   */
  UnsupportedMediaType = 'UnsupportedMediaType',
  /**
   * An internal error occurred, it is unexpected
   * and the outcome of the call is unknown.
   */
  InternalError = 'InternalError',
  /**
   * The request is invalid because the content you are requesting
   * has expired and is no longer available. It is typically
   * associated with watches that can't be serviced.
   */
  Expired = 'Expired',
  /**
   * The request itself was valid, but the requested
   * service is unavailable at this time.
   */
  ServiceUnavailable = 'ServiceUnavailable',
}

export enum K8sStatuses {
  Success = 'Success',
  Failure = 'Failure',
}

export enum K8sStatusDetailsCauseTypes {
  FieldValueNotFound = 'FieldValueNotFound',
  FieldValueRequired = 'FieldValueRequired',
  FieldValueDuplicate = 'FieldValueDuplicate',
  FieldValueInvalid = 'FieldValueInvalid',
  FieldValueNotSupported = 'FieldValueNotSupported',
  UnexpectedServerResponse = 'UnexpectedServerResponse',
  FieldManagerConflict = 'FieldManagerConflict',
  ResourceVersionTooLarge = 'ResourceVersionTooLarge',
}

/**
 * Provides more information about an `IK8sStatus` failure, including
 * cases when multiple errors are encountered.
 */
export interface IK8sStatusDetailsCause {
  type?: K8sStatusDetailsCauseTypes;
  message?: string;
  field?: string;
}

/**
 * A set of additional properties that MAY be set by the
 * server to provide additional information about a response. The `reason`
 * field of a `IK8sStatus` object defines what attributes will be set.
 */
export interface IK8sStatusDetails {
  name?: string;
  group?: string;
  kind?: string;
  uid?: string;
  retryAfterSeconds?: number;
  causes?: IK8sStatusDetailsCause[];
}

/**
 * A return value for calls that don't return other objects.
 */
export interface IK8sStatus {
  apiVersion: string;
  kind: 'Status';
  message?: string;
  status?: K8sStatuses;
  reason?: K8sStatusErrorReasons;
  code?: number;
  details?: IK8sStatusDetails;
}

export interface IK8sStatusError<
  R extends K8sStatusErrorReasons,
  C extends number = IK8sStatusErrorCodeMapping[R]
> extends IK8sStatus {
  status: K8sStatuses.Failure;
  reason: R;
  code: C;
}

/* eslint-disable no-magic-numbers */
export interface IK8sStatusErrorCodeMapping {
  [key: string]: number;

  [K8sStatusErrorReasons.Unknown]: 500;
  [K8sStatusErrorReasons.Unauthorized]: 401;
  [K8sStatusErrorReasons.Forbidden]: 403;
  [K8sStatusErrorReasons.NotFound]: 404;
  [K8sStatusErrorReasons.AlreadyExists]: 409;
  [K8sStatusErrorReasons.Conflict]: 409;
  [K8sStatusErrorReasons.Invalid]: 422;
  [K8sStatusErrorReasons.ServerTimeout]: 500;
  [K8sStatusErrorReasons.Timeout]: 504;
  [K8sStatusErrorReasons.TooManyRequests]: 429;
  [K8sStatusErrorReasons.BadRequest]: 400;
  [K8sStatusErrorReasons.NotAllowed]: 405;
  [K8sStatusErrorReasons.NotAcceptable]: 406;
  [K8sStatusErrorReasons.EntityTooLarge]: 413;
  [K8sStatusErrorReasons.UnsupportedMediaType]: 415;
  [K8sStatusErrorReasons.InternalError]: 500;
  [K8sStatusErrorReasons.Expired]: 410;
  [K8sStatusErrorReasons.ServiceUnavailable]: 503;
}
/* eslint-enable no-magic-numbers */
