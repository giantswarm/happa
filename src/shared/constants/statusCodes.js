/**
 * *2xx* Success
 */
export const Ok = 200;
export const Created = 201;
export const NoContent = 204;

/**
 * *3xx* Redirection
 */
export const MovedPermanently = 301;
export const Found = 302; // Also known as "Moved temporarily"
export const SeeOther = 303;

/**
 * *4xx* Client Errors
 */
export const BadRequest = 400;
export const Unauthorized = 401;
export const Forbidden = 403;
export const NotFound = 404;
export const Timeout = 408;
export const Conflict = 409;

/**
 * *5xx* Server Errors
 */
export const InternalServerError = 500;
export const NotImplemented = 501;
export const BadGateway = 502;
export const ServiceUnavailable = 503;
