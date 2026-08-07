globalThis.process ??= {};
globalThis.process.env ??= {};
function escapeRegExpChar(char) {
  if (char === "-" || char === "^" || char === "$" || char === "+" || char === "." || char === "(" || char === ")" || char === "|" || char === "[" || char === "]" || char === "{" || char === "}" || char === "*" || char === "?" || char === "\\") return `\\${char}`;
  else return char;
}
function escapeRegExpString(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) result += escapeRegExpChar(str[i]);
  return result;
}
function transform(pattern, separator = true) {
  if (Array.isArray(pattern)) return `(?:${pattern.map((p) => `^${transform(p, separator)}$`).join("|")})`;
  let separatorSplitter = "";
  let separatorMatcher = "";
  let wildcard = ".";
  if (separator === true) {
    separatorSplitter = "/";
    separatorMatcher = "[/\\\\]";
    wildcard = "[^/\\\\]";
  } else if (separator) {
    separatorSplitter = separator;
    separatorMatcher = escapeRegExpString(separatorSplitter);
    if (separatorMatcher.length > 1) {
      separatorMatcher = `(?:${separatorMatcher})`;
      wildcard = `((?!${separatorMatcher}).)`;
    } else wildcard = `[^${separatorMatcher}]`;
  }
  const requiredSeparator = separator ? `${separatorMatcher}+?` : "";
  const optionalSeparator = separator ? `${separatorMatcher}*?` : "";
  const segments = separator ? pattern.split(separatorSplitter) : [pattern];
  let result = "";
  for (let s = 0; s < segments.length; s++) {
    const segment = segments[s];
    const nextSegment = segments[s + 1];
    let currentSeparator = "";
    if (!segment && s > 0) continue;
    if (separator) if (s === segments.length - 1) currentSeparator = optionalSeparator;
    else if (nextSegment !== "**") currentSeparator = requiredSeparator;
    else currentSeparator = "";
    if (separator && segment === "**") {
      if (currentSeparator) {
        result += s === 0 ? "" : currentSeparator;
        result += `(?:${wildcard}*?${currentSeparator})*?`;
      }
      continue;
    }
    for (let c = 0; c < segment.length; c++) {
      const char = segment[c];
      if (char === "\\") {
        if (c < segment.length - 1) {
          result += escapeRegExpChar(segment[c + 1]);
          c++;
        }
      } else if (char === "?") result += wildcard;
      else if (char === "*") result += `${wildcard}*?`;
      else result += escapeRegExpChar(char);
    }
    result += currentSeparator;
  }
  return result;
}
function isMatch(regexp, sample) {
  if (typeof sample !== "string") throw new TypeError(`Sample must be a string, but ${typeof sample} given`);
  return regexp.test(sample);
}
function wildcardMatch(pattern, options) {
  if (typeof pattern !== "string" && !Array.isArray(pattern)) throw new TypeError(`The first argument must be a single pattern string or an array of patterns, but ${typeof pattern} given`);
  if (typeof options === "string" || typeof options === "boolean") options = { separator: options };
  if (arguments.length === 2 && !(typeof options === "undefined" || typeof options === "object" && options !== null && !Array.isArray(options))) throw new TypeError(`The second argument must be an options object or a string/boolean separator, but ${typeof options} given`);
  options = options || {};
  if (options.separator === "\\") throw new Error("\\ is not a valid separator because it is used for escaping. Try setting the separator to `true` instead");
  const regexpPattern = transform(pattern, options.separator);
  const regexp = new RegExp(`^${regexpPattern}$`, options.flags);
  const fn = isMatch.bind(null, regexp);
  fn.options = options;
  fn.pattern = pattern;
  fn.regexp = regexp;
  return fn;
}
var define_globalThis_process_env_default = {};
const _envShim = /* @__PURE__ */ Object.create(null);
const _getEnv = (useShim) => define_globalThis_process_env_default || globalThis.Deno?.env.toObject() || globalThis.__env__ || (useShim ? _envShim : globalThis);
const env = new Proxy(_envShim, {
  get(_, prop) {
    return _getEnv()[prop] ?? _envShim[prop];
  },
  has(_, prop) {
    return prop in _getEnv() || prop in _envShim;
  },
  set(_, prop, value) {
    const env2 = _getEnv(true);
    env2[prop] = value;
    return true;
  },
  deleteProperty(_, prop) {
    if (!prop) return false;
    const env2 = _getEnv(true);
    delete env2[prop];
    return true;
  },
  ownKeys() {
    const env2 = _getEnv(true);
    return Object.keys(env2);
  }
});
function toBoolean(val) {
  return val ? val !== "false" : false;
}
const nodeENV = env.NODE_ENV ?? "";
const isProduction = nodeENV === "production";
const isDevelopment = () => nodeENV === "dev" || nodeENV === "development";
const isTest = () => nodeENV === "test" || toBoolean(env.TEST);
function getEnvVar(key, fallback) {
  if (typeof process !== "undefined" && process.env) return process.env[key] ?? fallback;
  if (typeof Deno !== "undefined") return Deno.env.get(key) ?? fallback;
  if (typeof Bun !== "undefined") return Bun.env[key] ?? fallback;
  return fallback;
}
function getBooleanEnvVar(key, fallback = true) {
  const value = getEnvVar(key);
  if (!value) return fallback;
  return value !== "0" && value.toLowerCase() !== "false" && value !== "";
}
const ENV = Object.freeze({
  get BETTER_AUTH_SECRET() {
    return getEnvVar("BETTER_AUTH_SECRET");
  },
  get AUTH_SECRET() {
    return getEnvVar("AUTH_SECRET");
  },
  get BETTER_AUTH_TELEMETRY() {
    return getEnvVar("BETTER_AUTH_TELEMETRY");
  },
  get BETTER_AUTH_TELEMETRY_ID() {
    return getEnvVar("BETTER_AUTH_TELEMETRY_ID");
  },
  get NODE_ENV() {
    return getEnvVar("NODE_ENV", "development");
  },
  get PACKAGE_VERSION() {
    return getEnvVar("PACKAGE_VERSION", "0.0.0");
  },
  get BETTER_AUTH_TELEMETRY_ENDPOINT() {
    return getEnvVar("BETTER_AUTH_TELEMETRY_ENDPOINT", "");
  }
});
function isErrorStackTraceLimitWritable() {
  const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
  if (desc === void 0) return Object.isExtensible(Error);
  return Object.prototype.hasOwnProperty.call(desc, "writable") ? desc.writable : desc.set !== void 0;
}
function hideInternalStackFrames(stack) {
  const lines = stack.split("\n    at ");
  if (lines.length <= 1) return stack;
  lines.splice(1, 1);
  return lines.join("\n    at ");
}
function makeErrorForHideStackFrame(Base, clazz) {
  class HideStackFramesError extends Base {
    #hiddenStack;
    constructor(...args) {
      if (isErrorStackTraceLimitWritable()) {
        const limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        super(...args);
        Error.stackTraceLimit = limit;
      } else super(...args);
      const stack = (/* @__PURE__ */ new Error()).stack;
      if (stack) this.#hiddenStack = hideInternalStackFrames(stack.replace(/^Error/, this.name));
    }
    get errorStack() {
      return this.#hiddenStack;
    }
  }
  Object.defineProperty(HideStackFramesError.prototype, "constructor", {
    get() {
      return clazz;
    },
    enumerable: false,
    configurable: true
  });
  return HideStackFramesError;
}
const statusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  "I'M_A_TEAPOT": 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
var InternalAPIError = class extends Error {
  constructor(status = "INTERNAL_SERVER_ERROR", body = void 0, headers = {}, statusCode = typeof status === "number" ? status : statusCodes[status]) {
    super(body?.message, body?.cause ? { cause: body.cause } : void 0);
    this.status = status;
    this.body = body;
    this.headers = headers;
    this.statusCode = statusCode;
    this.name = "APIError";
    this.status = status;
    this.headers = headers;
    this.statusCode = statusCode;
    this.body = body;
  }
};
var ValidationError$1 = class ValidationError extends InternalAPIError {
  constructor(message, issues) {
    super(400, {
      message,
      code: "VALIDATION_ERROR"
    });
    this.message = message;
    this.issues = issues;
    this.issues = issues;
  }
};
var BetterCallError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "BetterCallError";
  }
};
const kAPIErrorHeaderSymbol = Symbol.for("better-call:api-error-headers");
const APIError$1 = makeErrorForHideStackFrame(InternalAPIError, Error);
var BetterAuthError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "BetterAuthError";
    this.message = message;
    this.stack = "";
  }
};
var APIError = class APIError2 extends APIError$1 {
  constructor(...args) {
    super(...args);
  }
  static fromStatus(status, body) {
    return new APIError2(status, body);
  }
  static from(status, error) {
    return new APIError2(status, {
      message: error.message,
      code: error.code
    });
  }
};
const SLASH_CHAR_CODE = "/".charCodeAt(0);
function isLoopbackForDevScheme(host) {
  const hostname = host.replace(/:\d+$/, "").replace(/^\[|\]$/g, "").toLowerCase();
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "::1" || hostname.startsWith("127.");
}
function trimTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === SLASH_CHAR_CODE) end--;
  return end === value.length ? value : value.slice(0, end);
}
function checkHasPath(url) {
  try {
    return (trimTrailingSlashes(new URL(url).pathname) || "/") !== "/";
  } catch {
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`);
  }
}
function assertHasProtocol(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new BetterAuthError(`Invalid base URL: ${url}. URL must include 'http://' or 'https://'`);
  } catch (error) {
    if (error instanceof BetterAuthError) throw error;
    throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`, { cause: error });
  }
}
function withPath(url, path = "/api/auth") {
  assertHasProtocol(url);
  if (checkHasPath(url)) return url;
  const trimmedUrl = trimTrailingSlashes(url);
  if (!path || path === "/") return trimmedUrl;
  path = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedUrl}${path}`;
}
function validateProxyHeader(header, type) {
  if (!header || header.trim() === "") return false;
  if (type === "proto") return header === "http" || header === "https";
  if (type === "host") {
    if ([
      /\.\./,
      /\0/,
      /[\s]/,
      /^[.]/,
      /[<>'"]/,
      /javascript:/i,
      /file:/i,
      /data:/i
    ].some((pattern) => pattern.test(header))) return false;
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(:[0-9]{1,5})?$/.test(header) || /^(\d{1,3}\.){3}\d{1,3}(:[0-9]{1,5})?$/.test(header) || /^\[[0-9a-fA-F:]+\](:[0-9]{1,5})?$/.test(header) || /^localhost(:[0-9]{1,5})?$/i.test(header);
  }
  return false;
}
function getBaseURL(url, path, request, loadEnv, trustedProxyHeaders) {
  if (url) return withPath(url, path);
  {
    const fromEnv = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BETTER_AUTH_URL || env.PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_AUTH_URL || (env.BASE_URL !== "/" ? env.BASE_URL : void 0);
    if (fromEnv) return withPath(fromEnv, path);
  }
  const fromRequest = request?.headers.get("x-forwarded-host");
  const fromRequestProto = request?.headers.get("x-forwarded-proto");
  if (fromRequest && fromRequestProto && trustedProxyHeaders) {
    if (validateProxyHeader(fromRequestProto, "proto") && validateProxyHeader(fromRequest, "host")) try {
      return withPath(`${fromRequestProto}://${fromRequest}`, path);
    } catch (_error) {
    }
  }
  if (request) {
    const url2 = getOrigin(request.url);
    if (!url2) throw new BetterAuthError("Could not get origin from request. Please provide a valid base URL.");
    return withPath(url2, path);
  }
  if (typeof window !== "undefined" && window.location) return withPath(window.location.origin, path);
}
function getOrigin(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin === "null" ? null : parsedUrl.origin;
  } catch {
    return null;
  }
}
function getProtocol(url) {
  try {
    return new URL(url).protocol;
  } catch {
    return null;
  }
}
function getHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
function isDynamicBaseURLConfig(config) {
  return typeof config === "object" && config !== null && "allowedHosts" in config && Array.isArray(config.allowedHosts);
}
function isRequestLike(value) {
  if (value instanceof Request) return true;
  if (typeof value !== "object" || value === null || Object.prototype.toString.call(value) !== "[object Request]") return false;
  const v = value;
  return typeof v.url === "string" && typeof v.headers === "object" && v.headers !== null && typeof v.headers.get === "function";
}
function getHostFromSource(source, trustedProxyHeaders) {
  const headers = isRequestLike(source) ? source.headers : source;
  if (trustedProxyHeaders) {
    const forwardedHost = headers.get("x-forwarded-host");
    if (forwardedHost && validateProxyHeader(forwardedHost, "host")) return forwardedHost;
  }
  const host = headers.get("host");
  if (host && validateProxyHeader(host, "host")) return host;
  if (isRequestLike(source)) try {
    return new URL(source.url).host;
  } catch {
    return null;
  }
  return null;
}
function getProtocolFromSource(source, configProtocol, trustedProxyHeaders) {
  if (configProtocol === "http" || configProtocol === "https") return configProtocol;
  const headers = isRequestLike(source) ? source.headers : source;
  if (trustedProxyHeaders) {
    const forwardedProto = headers.get("x-forwarded-proto");
    if (forwardedProto && validateProxyHeader(forwardedProto, "proto")) return forwardedProto;
  }
  if (isRequestLike(source)) try {
    const url = new URL(source.url);
    if (url.protocol === "http:" || url.protocol === "https:") return url.protocol.slice(0, -1);
  } catch {
  }
  const host = getHostFromSource(source, trustedProxyHeaders);
  if (host && isLoopbackForDevScheme(host)) return "http";
  return "https";
}
const matchesHostPattern = (host, pattern) => {
  if (!host || !pattern) return false;
  const normalizedHost = host.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  const normalizedPattern = pattern.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  if (normalizedPattern.includes("*") || normalizedPattern.includes("?")) return wildcardMatch(normalizedPattern)(normalizedHost);
  return normalizedHost.toLowerCase() === normalizedPattern.toLowerCase();
};
function resolveDynamicBaseURL(config, source, basePath, trustedProxyHeaders) {
  const host = getHostFromSource(source, trustedProxyHeaders);
  if (!host) {
    if (config.fallback) return withPath(config.fallback, basePath);
    throw new BetterAuthError("Could not determine host from request headers. Please provide a fallback URL in your baseURL config.");
  }
  if (config.allowedHosts.some((pattern) => matchesHostPattern(host, pattern))) return withPath(`${getProtocolFromSource(source, config.protocol, trustedProxyHeaders)}://${host}`, basePath);
  if (config.fallback) return withPath(config.fallback, basePath);
  throw new BetterAuthError(`Host "${host}" is not in the allowed hosts list. Allowed hosts: ${config.allowedHosts.join(", ")}. Add this host to your allowedHosts config or provide a fallback URL.`);
}
function resolveBaseURL(config, basePath, source, loadEnv, trustedProxyHeaders) {
  if (isDynamicBaseURLConfig(config)) {
    if (source) return resolveDynamicBaseURL(config, source, basePath, trustedProxyHeaders);
    if (config.fallback) return withPath(config.fallback, basePath);
    return getBaseURL(void 0, basePath, void 0, loadEnv, trustedProxyHeaders);
  }
  const request = isRequestLike(source) ? source : void 0;
  if (typeof config === "string") return getBaseURL(config, basePath, request, loadEnv, trustedProxyHeaders);
  return getBaseURL(void 0, basePath, request, loadEnv, trustedProxyHeaders);
}
function normalizePathname(requestUrl, basePath) {
  let pathname;
  try {
    pathname = new URL(requestUrl).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return "/";
  }
  const normalizedBasePath = basePath.replace(/\/+$/, "");
  if (normalizedBasePath === "") return pathname;
  if (pathname === normalizedBasePath) return "/";
  if (pathname.startsWith(normalizedBasePath + "/")) return pathname.slice(normalizedBasePath.length).replace(/\/+$/, "") || "/";
  return pathname;
}
const DANGEROUS_URL_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:"
];
function isSafeUrlScheme(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return true;
  }
  return !DANGEROUS_URL_SCHEMES.includes(parsed.protocol);
}
function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}
function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = { ...defaults };
  for (const key of Object.keys(baseObject)) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var BetterFetchError = class extends Error {
  constructor(status, statusText, error) {
    super(statusText || status.toString(), {
      cause: error
    });
    this.status = status;
    this.statusText = statusText;
    this.error = error;
    Error.captureStackTrace(this, this.constructor);
  }
};
var initializePlugins = async (url, options) => {
  var _a, _b, _c, _d, _e, _f;
  let opts = options || {};
  const hooks = {
    onRequest: [options == null ? void 0 : options.onRequest],
    onResponse: [options == null ? void 0 : options.onResponse],
    onSuccess: [options == null ? void 0 : options.onSuccess],
    onError: [options == null ? void 0 : options.onError],
    onRetry: [options == null ? void 0 : options.onRetry]
  };
  if (!options || !(options == null ? void 0 : options.plugins)) {
    return {
      url,
      options: opts,
      hooks
    };
  }
  for (const plugin of (options == null ? void 0 : options.plugins) || []) {
    if (plugin.init) {
      const pluginRes = await ((_a = plugin.init) == null ? void 0 : _a.call(plugin, url.toString(), options));
      opts = pluginRes.options || opts;
      url = pluginRes.url;
    }
    hooks.onRequest.push((_b = plugin.hooks) == null ? void 0 : _b.onRequest);
    hooks.onResponse.push((_c = plugin.hooks) == null ? void 0 : _c.onResponse);
    hooks.onSuccess.push((_d = plugin.hooks) == null ? void 0 : _d.onSuccess);
    hooks.onError.push((_e = plugin.hooks) == null ? void 0 : _e.onError);
    hooks.onRetry.push((_f = plugin.hooks) == null ? void 0 : _f.onRetry);
  }
  return {
    url,
    options: opts,
    hooks
  };
};
var LinearRetryStrategy = class {
  constructor(options) {
    this.options = options;
  }
  shouldAttemptRetry(attempt, response) {
    if (this.options.shouldRetry) {
      return Promise.resolve(
        attempt < this.options.attempts && this.options.shouldRetry(response)
      );
    }
    return Promise.resolve(attempt < this.options.attempts);
  }
  getDelay() {
    return this.options.delay;
  }
};
var ExponentialRetryStrategy = class {
  constructor(options) {
    this.options = options;
  }
  shouldAttemptRetry(attempt, response) {
    if (this.options.shouldRetry) {
      return Promise.resolve(
        attempt < this.options.attempts && this.options.shouldRetry(response)
      );
    }
    return Promise.resolve(attempt < this.options.attempts);
  }
  getDelay(attempt) {
    const delay = Math.min(
      this.options.maxDelay,
      this.options.baseDelay * 2 ** attempt
    );
    return delay;
  }
};
function createRetryStrategy(options) {
  if (typeof options === "number") {
    return new LinearRetryStrategy({
      type: "linear",
      attempts: options,
      delay: 1e3
    });
  }
  switch (options.type) {
    case "linear":
      return new LinearRetryStrategy(options);
    case "exponential":
      return new ExponentialRetryStrategy(options);
    default:
      throw new Error("Invalid retry strategy");
  }
}
var getAuthHeader = async (options) => {
  const headers = {};
  const getValue = async (value) => typeof value === "function" ? await value() : value;
  if (options == null ? void 0 : options.auth) {
    if (options.auth.type === "Bearer") {
      const token = await getValue(options.auth.token);
      if (!token) {
        return headers;
      }
      headers["authorization"] = `Bearer ${token}`;
    } else if (options.auth.type === "Basic") {
      const [username, password] = await Promise.all([
        getValue(options.auth.username),
        getValue(options.auth.password)
      ]);
      if (!username || !password) {
        return headers;
      }
      headers["authorization"] = `Basic ${btoa(`${username}:${password}`)}`;
    } else if (options.auth.type === "Custom") {
      const [prefix, value] = await Promise.all([
        getValue(options.auth.prefix),
        getValue(options.auth.value)
      ]);
      if (!value) {
        return headers;
      }
      headers["authorization"] = `${prefix != null ? prefix : ""} ${value}`;
    }
  }
  return headers;
};
var JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(request) {
  const _contentType = request.headers.get("content-type");
  const textTypes = /* @__PURE__ */ new Set([
    "image/svg",
    "application/xml",
    "application/xhtml",
    "application/html"
  ]);
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function isJSONParsable(value) {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
function jsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}
function isFunction(value) {
  return typeof value === "function";
}
function getFetch(options) {
  if (options == null ? void 0 : options.customFetchImpl) {
    return options.customFetchImpl;
  }
  if (typeof globalThis !== "undefined" && isFunction(globalThis.fetch)) {
    return globalThis.fetch;
  }
  if (typeof window !== "undefined" && isFunction(window.fetch)) {
    return window.fetch;
  }
  throw new Error("No fetch implementation found");
}
function mergeHeaders(...sources) {
  const merged = {};
  for (const source of sources) {
    if (!source) {
      continue;
    }
    if (source instanceof Headers) {
      source.forEach((value, key) => {
        merged[key] = value;
      });
    } else {
      const entries = Array.isArray(source) ? source : Object.entries(source);
      for (const [key, value] of entries) {
        if (value !== null && value !== void 0) {
          merged[key] = value;
        }
      }
    }
  }
  return merged;
}
async function getHeaders(opts) {
  const headers = new Headers(mergeHeaders(opts == null ? void 0 : opts.headers, await getAuthHeader(opts)));
  if (!headers.has("content-type")) {
    const contentType = detectContentType(opts == null ? void 0 : opts.body);
    if (contentType) {
      headers.set("content-type", contentType);
    }
  }
  return headers;
}
function detectContentType(body) {
  if (isJSONSerializable(body)) {
    return "application/json";
  }
  return null;
}
function getMediaType(headers) {
  const contentType = headers.get("content-type");
  return contentType ? contentType.split(";")[0].trim().toLowerCase() : null;
}
function getBody(options, headers) {
  const { body } = options;
  if (!body) {
    return null;
  }
  if (!isJSONSerializable(body)) {
    return body;
  }
  if (typeof body === "string") {
    return body;
  }
  if (getMediaType(headers) === "application/x-www-form-urlencoded") {
    return new URLSearchParams(body).toString();
  }
  return JSON.stringify(body);
}
function getMethod(url, options) {
  var _a;
  if (options == null ? void 0 : options.method) {
    return options.method.toUpperCase();
  }
  if (url.startsWith("@")) {
    const pMethod = (_a = url.split("@")[1]) == null ? void 0 : _a.split("/")[0];
    if (!methods.includes(pMethod)) {
      return (options == null ? void 0 : options.body) ? "POST" : "GET";
    }
    return pMethod.toUpperCase();
  }
  return (options == null ? void 0 : options.body) ? "POST" : "GET";
}
function getTimeout(options, controller) {
  let abortTimeout;
  if (!(options == null ? void 0 : options.signal) && (options == null ? void 0 : options.timeout)) {
    abortTimeout = setTimeout(() => controller == null ? void 0 : controller.abort(), options == null ? void 0 : options.timeout);
  }
  return {
    abortTimeout,
    clearTimeout: () => {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
  };
}
var ValidationError2 = class _ValidationError extends Error {
  constructor(issues, message) {
    super(message || JSON.stringify(issues, null, 2));
    this.issues = issues;
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};
async function parseStandardSchema(schema, input) {
  const result = await schema["~standard"].validate(input);
  if (result.issues) {
    throw new ValidationError2(result.issues);
  }
  return result.value;
}
var methods = ["get", "post", "put", "patch", "delete"];
var applySchemaPlugin = (config) => ({
  id: "apply-schema",
  name: "Apply Schema",
  version: "1.0.0",
  async init(url, options) {
    var _a, _b, _c, _d;
    const schema = ((_b = (_a = config.plugins) == null ? void 0 : _a.find(
      (plugin) => {
        var _a2;
        return ((_a2 = plugin.schema) == null ? void 0 : _a2.config) ? url.startsWith(plugin.schema.config.baseURL || "") || url.startsWith(plugin.schema.config.prefix || "") : false;
      }
    )) == null ? void 0 : _b.schema) || config.schema;
    if (schema) {
      let urlKey = url;
      if ((_c = schema.config) == null ? void 0 : _c.prefix) {
        if (urlKey.startsWith(schema.config.prefix)) {
          urlKey = urlKey.replace(schema.config.prefix, "");
          if (schema.config.baseURL) {
            url = url.replace(schema.config.prefix, schema.config.baseURL);
          }
        }
      }
      if ((_d = schema.config) == null ? void 0 : _d.baseURL) {
        if (urlKey.startsWith(schema.config.baseURL)) {
          urlKey = urlKey.replace(schema.config.baseURL, "");
        }
      }
      if (urlKey.startsWith("/") && urlKey.charAt(1) === "@") {
        urlKey = urlKey.substring(1);
      }
      const keySchema = schema.schema[urlKey];
      if (keySchema) {
        let validatedHeaders = options == null ? void 0 : options.headers;
        if (keySchema.headers && !(options == null ? void 0 : options.disableValidation)) {
          const normalizedHeaders = {};
          if (options == null ? void 0 : options.headers) {
            if (options.headers instanceof Headers) {
              options.headers.forEach((value, key) => {
                normalizedHeaders[key.toLowerCase()] = value;
              });
            } else if (typeof options.headers === "object") {
              for (const [key, value] of Object.entries(options.headers)) {
                if (value !== null && value !== void 0) {
                  normalizedHeaders[key.toLowerCase()] = value;
                }
              }
            }
          }
          const validated = await parseStandardSchema(
            keySchema.headers,
            normalizedHeaders
          );
          const finalHeaders = {};
          for (const [key, value] of Object.entries(validated)) {
            finalHeaders[key.toLowerCase()] = value;
          }
          validatedHeaders = finalHeaders;
        }
        let opts = __spreadProps(__spreadValues({}, options), {
          method: keySchema.method,
          output: keySchema.output,
          headers: validatedHeaders
        });
        if (!(options == null ? void 0 : options.disableValidation)) {
          opts = __spreadProps(__spreadValues({}, opts), {
            body: keySchema.input ? await parseStandardSchema(keySchema.input, options == null ? void 0 : options.body) : options == null ? void 0 : options.body,
            params: keySchema.params ? await parseStandardSchema(keySchema.params, options == null ? void 0 : options.params) : options == null ? void 0 : options.params,
            query: keySchema.query ? await parseStandardSchema(keySchema.query, options == null ? void 0 : options.query) : options == null ? void 0 : options.query
          });
        }
        return {
          url,
          options: opts
        };
      }
    }
    return {
      url,
      options
    };
  }
});
var createFetch = (config) => {
  async function $fetch(url, options) {
    const opts = __spreadProps(__spreadValues(__spreadValues({}, config), options), {
      headers: mergeHeaders(config == null ? void 0 : config.headers, options == null ? void 0 : options.headers),
      plugins: [...(config == null ? void 0 : config.plugins) || [], applySchemaPlugin(config || {}), ...(options == null ? void 0 : options.plugins) || []]
    });
    if (config == null ? void 0 : config.catchAllError) {
      try {
        return await betterFetch(url, opts);
      } catch (error) {
        return {
          data: null,
          error: {
            status: 500,
            statusText: "Fetch Error",
            message: "Fetch related error. Captured by catchAllError option. See error property for more details.",
            error
          }
        };
      }
    }
    return await betterFetch(url, opts);
  }
  return $fetch;
};
var isReservedPathSegment = (value) => value === "." || value === "..";
function encodePathSegment(segment, pathParams) {
  let pathSegment = segment;
  for (const [key, value] of pathParams) {
    pathSegment = pathSegment.replace(key, value);
  }
  if (isReservedPathSegment(pathSegment)) {
    throw new TypeError("Path parameters cannot be reserved path segments");
  }
  return encodeURIComponent(pathSegment);
}
function getURL2(url, option) {
  const { baseURL, params, query } = option || {
    query: {},
    params: {},
    baseURL: ""
  };
  let basePath = url.startsWith("http") ? url.split("/").slice(0, 3).join("/") : baseURL || "";
  if (url.startsWith("@")) {
    const m = url.toString().split("@")[1].split("/")[0];
    if (methods.includes(m)) {
      url = url.replace(`@${m}/`, "/");
    }
  }
  if (!basePath.endsWith("/")) basePath += "/";
  let [path, urlQuery] = url.replace(basePath, "").split("?");
  const queryParams = new URLSearchParams(urlQuery);
  for (const [key, value] of Object.entries(query || {})) {
    if (value == null) continue;
    let serializedValue;
    if (typeof value === "string") {
      serializedValue = value;
    } else if (Array.isArray(value)) {
      for (const val of value) {
        queryParams.append(key, val);
      }
      continue;
    } else {
      serializedValue = JSON.stringify(value);
    }
    queryParams.set(key, serializedValue);
  }
  const pathParams = /* @__PURE__ */ new Map();
  if (params) {
    if (Array.isArray(params)) {
      const paramPaths = path.split("/").filter((p) => p.startsWith(":"));
      for (const [index, key] of paramPaths.entries()) {
        const value = params[index];
        pathParams.set(key, String(value));
      }
    } else {
      for (const [key, value] of Object.entries(params)) {
        pathParams.set(`:${key}`, String(value));
      }
    }
  }
  path = path.split("/").map((segment) => encodePathSegment(segment, pathParams)).join("/");
  path = path.replace(/^\/+/, "");
  let queryParamString = queryParams.toString();
  queryParamString = queryParamString.length > 0 ? `?${queryParamString}`.replace(/\+/g, "%20") : "";
  if (!basePath.startsWith("http")) {
    return `${basePath}${path}${queryParamString}`;
  }
  const _url = new URL(`${path}${queryParamString}`, basePath);
  return _url;
}
var betterFetch = async (url, options) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const {
    hooks,
    url: __url,
    options: opts
  } = await initializePlugins(url, options);
  const fetch = getFetch(opts);
  const controller = new AbortController();
  const signal = (_a = opts.signal) != null ? _a : controller.signal;
  const _url = getURL2(__url, opts);
  const headers = await getHeaders(opts);
  const body = getBody(opts, headers);
  const method = getMethod(__url, opts);
  const context = __spreadProps(__spreadValues({}, opts), {
    url: _url,
    headers,
    body,
    method,
    signal
  });
  for (const onRequest of hooks.onRequest) {
    if (onRequest) {
      const res = await onRequest(context);
      if (typeof res === "object" && res !== null) {
        Object.assign(context, res);
      }
    }
  }
  if ("pipeTo" in context && typeof context.pipeTo === "function" || typeof ((_b = options == null ? void 0 : options.body) == null ? void 0 : _b.pipe) === "function") {
    if (!("duplex" in context)) {
      context.duplex = "half";
    }
  }
  const { clearTimeout: clearTimeout2 } = getTimeout(opts, controller);
  let response = await fetch(context.url, context);
  clearTimeout2();
  const responseContext = {
    response,
    request: context
  };
  for (const onResponse of hooks.onResponse) {
    if (onResponse) {
      const r = await onResponse(__spreadProps(__spreadValues({}, responseContext), {
        response: ((_c = options == null ? void 0 : options.hookOptions) == null ? void 0 : _c.cloneResponse) ? response.clone() : response
      }));
      if (r instanceof Response) {
        response = r;
      } else if (typeof r === "object" && r !== null) {
        response = r.response;
      }
    }
  }
  if (response.ok) {
    const hasBody = context.method !== "HEAD";
    if (!hasBody) {
      return {
        data: "",
        error: null
      };
    }
    const responseType = detectResponseType(response);
    const successContext = {
      data: null,
      response,
      request: context
    };
    if (responseType === "json" || responseType === "text") {
      const text = await response.text();
      const parser2 = (_d = context.jsonParser) != null ? _d : jsonParse;
      successContext.data = await parser2(text);
    } else {
      successContext.data = await response[responseType]();
    }
    if (context == null ? void 0 : context.output) {
      if (context.output && !context.disableValidation) {
        successContext.data = await parseStandardSchema(
          context.output,
          successContext.data
        );
      }
    }
    for (const onSuccess of hooks.onSuccess) {
      if (onSuccess) {
        await onSuccess(__spreadProps(__spreadValues({}, successContext), {
          response: ((_e = options == null ? void 0 : options.hookOptions) == null ? void 0 : _e.cloneResponse) ? response.clone() : response
        }));
      }
    }
    if (options == null ? void 0 : options.throw) {
      return successContext.data;
    }
    return {
      data: successContext.data,
      error: null
    };
  }
  const parser = (_f = options == null ? void 0 : options.jsonParser) != null ? _f : jsonParse;
  const responseText = await response.text();
  const isJSONResponse = isJSONParsable(responseText);
  const errorObject = isJSONResponse ? await parser(responseText) : null;
  const errorContext = {
    response,
    responseText,
    request: context,
    error: __spreadProps(__spreadValues({}, errorObject), {
      status: response.status,
      statusText: response.statusText
    })
  };
  for (const onError of hooks.onError) {
    if (onError) {
      await onError(__spreadProps(__spreadValues({}, errorContext), {
        response: ((_g = options == null ? void 0 : options.hookOptions) == null ? void 0 : _g.cloneResponse) ? response.clone() : response
      }));
    }
  }
  if (options == null ? void 0 : options.retry) {
    const retryStrategy = createRetryStrategy(options.retry);
    const _retryAttempt = (_h = options.retryAttempt) != null ? _h : 0;
    if (await retryStrategy.shouldAttemptRetry(_retryAttempt, response)) {
      for (const onRetry of hooks.onRetry) {
        if (onRetry) {
          await onRetry(responseContext);
        }
      }
      const delay = retryStrategy.getDelay(_retryAttempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return await betterFetch(url, __spreadProps(__spreadValues({}, options), {
        retryAttempt: _retryAttempt + 1
      }));
    }
  }
  if (options == null ? void 0 : options.throw) {
    throw new BetterFetchError(
      response.status,
      response.statusText,
      isJSONResponse ? errorObject : responseText
    );
  }
  return {
    data: null,
    error: __spreadProps(__spreadValues({}, errorObject), {
      status: response.status,
      statusText: response.statusText
    })
  };
};
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const WORD_PATTERN = /[\p{Ll}\d]+|\p{Lu}+(?!\p{Ll})|\p{Lu}[\p{Ll}\d]+|\p{Lo}+/gu;
const APOSTROPHE_PATTERN = /['\u2019]/g;
function splitWords(input) {
  return input.replace(APOSTROPHE_PATTERN, "").match(WORD_PATTERN) ?? [];
}
function toKebabCase(input) {
  return splitWords(input).map((word) => word.toLowerCase()).join("-");
}
export {
  APIError as A,
  BetterCallError as B,
  ENV as E,
  ValidationError$1 as V,
  capitalizeFirstLetter as a,
  getEnvVar as b,
  createFetch as c,
  defu as d,
  env as e,
  APIError$1 as f,
  getBaseURL as g,
  isProduction as h,
  isSafeUrlScheme as i,
  isDynamicBaseURLConfig as j,
  kAPIErrorHeaderSymbol as k,
  BetterAuthError as l,
  getOrigin as m,
  getHost as n,
  getProtocol as o,
  normalizePathname as p,
  isTest as q,
  isDevelopment as r,
  resolveBaseURL as s,
  toKebabCase as t,
  isRequestLike as u,
  betterFetch as v,
  wildcardMatch as w,
  createDefu as x,
  getBooleanEnvVar as y
};
