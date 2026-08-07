globalThis.process ??= {};
globalThis.process.env ??= {};
/* empty css                                    */
import { c as createComponent, r as renderComponent, a as renderTemplate, f as createAstro, m as maybeRenderHead, g as addAttribute, F as Fragment } from "../../chunks/astro/server_B1Q-Dpks.mjs";
import { j as jsxRuntimeExports, $ as $$Base } from "../../chunks/jsx-runtime_6SzGatPE.mjs";
import { N as Nav, $ as $$Footer } from "../../chunks/Footer_D7ikpgG4.mjs";
import { T as Toast } from "../../chunks/Toast_ZrMhaEK6.mjs";
import { P as Plate } from "../../chunks/Plate_155EoXFk.mjs";
import { r as reactExports, b as requireReact } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
import { a as CONTRACT_ABI, C as CONTRACT_ADDRESS } from "../../chunks/contract_D8gETbvb.mjs";
import { a as WagmiContext, u as useQueryClient } from "../../chunks/QueryClientProvider_D2Fp2Zh2.mjs";
import { B as BaseError$1, S as Subscribable, g as pendingThenable, i as resolveQueryBoolean, j as shallowEqualObjects, r as resolveStaleTime, a as noop, k as environmentManager, l as isValidTimeout, t as timeUntilStale, q as timeoutManager, f as focusManager, u as fetchState, w as replaceData, n as notifyManager, x as replaceEqualDeep, y as shouldThrowError } from "../../chunks/query_BFBeStQP.mjs";
import { D as readContract$1 } from "../../chunks/readContract_C8ppk_Ev.mjs";
import { c as createT } from "../../chunks/index_LvGhOnDK.mjs";
function getAction(client, actionFn, name) {
  const action_implicit = client[actionFn.name];
  if (typeof action_implicit === "function")
    return action_implicit;
  const action_explicit = client[name];
  if (typeof action_explicit === "function")
    return action_explicit;
  return (params) => actionFn(client, params);
}
function getAccount(config) {
  const uid = config.state.current;
  const connection = config.state.connections.get(uid);
  const addresses = connection?.accounts;
  const address = addresses?.[0];
  const chain = config.chains.find((chain2) => chain2.id === connection?.chainId);
  const status = config.state.status;
  switch (status) {
    case "connected":
      return {
        address,
        addresses,
        chain,
        chainId: connection?.chainId,
        connector: connection?.connector,
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
        isReconnecting: false,
        status
      };
    case "reconnecting":
      return {
        address,
        addresses,
        chain,
        chainId: connection?.chainId,
        connector: connection?.connector,
        isConnected: !!address,
        isConnecting: false,
        isDisconnected: false,
        isReconnecting: true,
        status
      };
    case "connecting":
      return {
        address,
        addresses,
        chain,
        chainId: connection?.chainId,
        connector: connection?.connector,
        isConnected: false,
        isConnecting: true,
        isDisconnected: false,
        isReconnecting: false,
        status
      };
    case "disconnected":
      return {
        address: void 0,
        addresses: void 0,
        chain: void 0,
        chainId: void 0,
        connector: void 0,
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
        isReconnecting: false,
        status
      };
  }
}
function readContract(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, readContract$1, "readContract");
  return action(rest);
}
function getChainId(config) {
  return config.state.chainId;
}
function deepEqual(a2, b) {
  if (a2 === b)
    return true;
  if (a2 && b && typeof a2 === "object" && typeof b === "object") {
    if (a2.constructor !== b.constructor)
      return false;
    let length;
    let i;
    if (Array.isArray(a2) && Array.isArray(b)) {
      length = a2.length;
      if (length !== b.length)
        return false;
      for (i = length; i-- !== 0; )
        if (!deepEqual(a2[i], b[i]))
          return false;
      return true;
    }
    if (typeof a2.valueOf === "function" && a2.valueOf !== Object.prototype.valueOf)
      return a2.valueOf() === b.valueOf();
    if (typeof a2.toString === "function" && a2.toString !== Object.prototype.toString)
      return a2.toString() === b.toString();
    const keys = Object.keys(a2);
    length = keys.length;
    if (length !== Object.keys(b).length)
      return false;
    for (i = length; i-- !== 0; )
      if (!Object.hasOwn(b, keys[i]))
        return false;
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (key && !deepEqual(a2[key], b[key]))
        return false;
    }
    return true;
  }
  return a2 !== a2 && b !== b;
}
function watchAccount(config, parameters) {
  const { onChange } = parameters;
  return config.subscribe(() => getAccount(config), onChange, {
    equalityFn(a2, b) {
      const { connector: aConnector, ...aRest } = a2;
      const { connector: bConnector, ...bRest } = b;
      return deepEqual(aRest, bRest) && // check connector separately
      aConnector?.id === bConnector?.id && aConnector?.uid === bConnector?.uid;
    }
  });
}
function watchChainId(config, parameters) {
  const { onChange } = parameters;
  return config.subscribe((state) => state.chainId, onChange);
}
const version = "2.19.5";
const getVersion = () => `wagmi@${version}`;
class BaseError extends BaseError$1 {
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "WagmiError"
    });
  }
  get docsBaseUrl() {
    return "https://wagmi.sh/react";
  }
  get version() {
    return getVersion();
  }
}
class WagmiProviderNotFoundError extends BaseError {
  constructor() {
    super("`useConfig` must be used within `WagmiProvider`.", {
      docsPath: "/api/WagmiProvider"
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "WagmiProviderNotFoundError"
    });
  }
}
function useConfig(parameters = {}) {
  const config = parameters.config ?? reactExports.useContext(WagmiContext);
  if (!config)
    throw new WagmiProviderNotFoundError();
  return config;
}
var withSelector = { exports: {} };
var withSelector_production = {};
var shim = { exports: {} };
var useSyncExternalStoreShim_production = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredUseSyncExternalStoreShim_production;
function requireUseSyncExternalStoreShim_production() {
  if (hasRequiredUseSyncExternalStoreShim_production) return useSyncExternalStoreShim_production;
  hasRequiredUseSyncExternalStoreShim_production = 1;
  var React = requireReact();
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue = React.useDebugValue;
  function useSyncExternalStore$2(subscribe, getSnapshot) {
    var value = getSnapshot(), _useState = useState({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
    useLayoutEffect(
      function() {
        inst.value = value;
        inst.getSnapshot = getSnapshot;
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      },
      [subscribe, value, getSnapshot]
    );
    useEffect(
      function() {
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        return subscribe(function() {
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        });
      },
      [subscribe]
    );
    useDebugValue(value);
    return value;
  }
  function checkIfSnapshotChanged(inst) {
    var latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      var nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch (error) {
      return true;
    }
  }
  function useSyncExternalStore$1(subscribe, getSnapshot) {
    return getSnapshot();
  }
  var shim2 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
  useSyncExternalStoreShim_production.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim2;
  return useSyncExternalStoreShim_production;
}
var hasRequiredShim;
function requireShim() {
  if (hasRequiredShim) return shim.exports;
  hasRequiredShim = 1;
  {
    shim.exports = requireUseSyncExternalStoreShim_production();
  }
  return shim.exports;
}
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredWithSelector_production;
function requireWithSelector_production() {
  if (hasRequiredWithSelector_production) return withSelector_production;
  hasRequiredWithSelector_production = 1;
  var React = requireReact(), shim2 = requireShim();
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim2.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue = React.useDebugValue;
  withSelector_production.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
    var instRef = useRef(null);
    if (null === instRef.current) {
      var inst = { hasValue: false, value: null };
      instRef.current = inst;
    } else inst = instRef.current;
    instRef = useMemo(
      function() {
        function memoizedSelector(nextSnapshot) {
          if (!hasMemo) {
            hasMemo = true;
            memoizedSnapshot = nextSnapshot;
            nextSnapshot = selector(nextSnapshot);
            if (void 0 !== isEqual && inst.hasValue) {
              var currentSelection = inst.value;
              if (isEqual(currentSelection, nextSnapshot))
                return memoizedSelection = currentSelection;
            }
            return memoizedSelection = nextSnapshot;
          }
          currentSelection = memoizedSelection;
          if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
          var nextSelection = selector(nextSnapshot);
          if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
            return memoizedSnapshot = nextSnapshot, currentSelection;
          memoizedSnapshot = nextSnapshot;
          return memoizedSelection = nextSelection;
        }
        var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
        return [
          function() {
            return memoizedSelector(getSnapshot());
          },
          null === maybeGetServerSnapshot ? void 0 : function() {
            return memoizedSelector(maybeGetServerSnapshot());
          }
        ];
      },
      [getSnapshot, getServerSnapshot, selector, isEqual]
    );
    var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
    useEffect(
      function() {
        inst.hasValue = true;
        inst.value = value;
      },
      [value]
    );
    useDebugValue(value);
    return value;
  };
  return withSelector_production;
}
var hasRequiredWithSelector;
function requireWithSelector() {
  if (hasRequiredWithSelector) return withSelector.exports;
  hasRequiredWithSelector = 1;
  {
    withSelector.exports = requireWithSelector_production();
  }
  return withSelector.exports;
}
var withSelectorExports = requireWithSelector();
const isPlainObject$1 = (obj) => typeof obj === "object" && !Array.isArray(obj);
function useSyncExternalStoreWithTracked(subscribe, getSnapshot, getServerSnapshot = getSnapshot, isEqual = deepEqual) {
  const trackedKeys = reactExports.useRef([]);
  const result = withSelectorExports.useSyncExternalStoreWithSelector(subscribe, getSnapshot, getServerSnapshot, (x) => x, (a2, b) => {
    if (isPlainObject$1(a2) && isPlainObject$1(b) && trackedKeys.current.length) {
      for (const key of trackedKeys.current) {
        const equal = isEqual(a2[key], b[key]);
        if (!equal)
          return false;
      }
      return true;
    }
    return isEqual(a2, b);
  });
  return reactExports.useMemo(() => {
    if (isPlainObject$1(result)) {
      const trackedResult = { ...result };
      let properties = {};
      for (const [key, value] of Object.entries(trackedResult)) {
        properties = {
          ...properties,
          [key]: {
            configurable: false,
            enumerable: true,
            get: () => {
              if (!trackedKeys.current.includes(key)) {
                trackedKeys.current.push(key);
              }
              return value;
            }
          }
        };
      }
      Object.defineProperties(trackedResult, properties);
      return trackedResult;
    }
    return result;
  }, [result]);
}
function useAccount(parameters = {}) {
  const config = useConfig(parameters);
  return useSyncExternalStoreWithTracked((onChange) => watchAccount(config, { onChange }), () => getAccount(config));
}
var QueryObserver = class extends Subscribable {
  constructor(client, options) {
    super();
    this.options = options;
    this.#client = client;
    this.#selectError = null;
    this.#currentThenable = pendingThenable();
    this.bindMethods();
    this.setOptions(options);
  }
  #client;
  #currentQuery = void 0;
  #currentQueryInitialState = void 0;
  #currentResult = void 0;
  #currentResultState;
  #currentResultOptions;
  #currentThenable;
  #selectError;
  #selectFn;
  #selectResult;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #lastQueryWithDefinedData;
  #staleTimeoutId;
  #refetchIntervalId;
  #currentRefetchInterval;
  #trackedProps = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.#currentQuery.addObserver(this);
      if (shouldFetchOnMount(this.#currentQuery, this.options)) {
        this.#executeFetch();
      } else {
        this.updateResult();
      }
      this.#updateTimers();
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.#clearStaleTimeout();
    this.#clearRefetchInterval();
    this.#currentQuery.removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = this.#currentQuery;
    this.options = this.#client.defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveQueryBoolean(this.options.enabled, this.#currentQuery) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    this.#updateQuery();
    this.#currentQuery.setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: this.#currentQuery,
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      this.#currentQuery,
      prevQuery,
      this.options,
      prevOptions
    )) {
      this.#executeFetch();
    }
    this.updateResult();
    if (mounted && (this.#currentQuery !== prevQuery || resolveQueryBoolean(this.options.enabled, this.#currentQuery) !== resolveQueryBoolean(prevOptions.enabled, this.#currentQuery) || resolveStaleTime(this.options.staleTime, this.#currentQuery) !== resolveStaleTime(prevOptions.staleTime, this.#currentQuery))) {
      this.#updateStaleTimeout();
    }
    const nextRefetchInterval = this.#computeRefetchInterval();
    if (mounted && (this.#currentQuery !== prevQuery || resolveQueryBoolean(this.options.enabled, this.#currentQuery) !== resolveQueryBoolean(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) {
      this.#updateRefetchInterval(nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = this.#client.getQueryCache().build(this.#client, options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      this.#currentResult = result;
      this.#currentResultOptions = this.options;
      this.#currentResultState = this.#currentQuery.state;
    }
    return result;
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked?.(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && this.#currentThenable.status === "pending") {
            this.#currentThenable.reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    this.#trackedProps.add(key);
  }
  getCurrentQuery() {
    return this.#currentQuery;
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = this.#client.defaultQueryOptions(options);
    const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return this.#executeFetch({
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return this.#currentResult;
    });
  }
  #executeFetch(fetchOptions) {
    this.#updateQuery();
    let promise = this.#currentQuery.fetch(
      this.options,
      fetchOptions
    );
    if (!fetchOptions?.throwOnError) {
      promise = promise.catch(noop);
    }
    return promise;
  }
  #updateStaleTimeout() {
    this.#clearStaleTimeout();
    const staleTime = resolveStaleTime(
      this.options.staleTime,
      this.#currentQuery
    );
    if (environmentManager.isServer() || this.#currentResult.isStale || !isValidTimeout(staleTime)) {
      return;
    }
    const time = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime);
    const timeout = time + 1;
    this.#staleTimeoutId = timeoutManager.setTimeout(() => {
      if (!this.#currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }
  #computeRefetchInterval() {
    return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
  }
  #updateRefetchInterval(nextInterval) {
    this.#clearRefetchInterval();
    this.#currentRefetchInterval = nextInterval;
    if (environmentManager.isServer() || resolveQueryBoolean(this.options.enabled, this.#currentQuery) === false || !isValidTimeout(this.#currentRefetchInterval) || this.#currentRefetchInterval === 0) {
      return;
    }
    this.#refetchIntervalId = timeoutManager.setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.#executeFetch();
      }
    }, this.#currentRefetchInterval);
  }
  #updateTimers() {
    this.#updateStaleTimeout();
    this.#updateRefetchInterval(this.#computeRefetchInterval());
  }
  #clearStaleTimeout() {
    if (this.#staleTimeoutId !== void 0) {
      timeoutManager.clearTimeout(this.#staleTimeoutId);
      this.#staleTimeoutId = void 0;
    }
  }
  #clearRefetchInterval() {
    if (this.#refetchIntervalId !== void 0) {
      timeoutManager.clearInterval(this.#refetchIntervalId);
      this.#refetchIntervalId = void 0;
    }
  }
  createResult(query, options) {
    const prevQuery = this.#currentQuery;
    const prevOptions = this.options;
    const prevResult = this.#currentResult;
    const prevResultState = this.#currentResultState;
    const prevResultOptions = this.#currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.#currentQueryInitialState;
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          this.#lastQueryWithDefinedData?.state.data,
          this.#lastQueryWithDefinedData
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult?.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) {
        data = this.#selectResult;
      } else {
        try {
          this.#selectFn = options.select;
          data = options.select(data);
          data = replaceData(prevResult?.data, data, options);
          this.#selectResult = data;
          this.#selectError = null;
        } catch (selectError) {
          this.#selectError = selectError;
        }
      }
    }
    if (this.#selectError) {
      error = this.#selectError;
      data = this.#selectResult;
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: this.#currentThenable,
      isEnabled: resolveQueryBoolean(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = this.#currentThenable = nextResult.promise = pendingThenable();
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = this.#currentThenable;
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = this.#currentResult;
    const nextResult = this.createResult(this.#currentQuery, this.options);
    this.#currentResultState = this.#currentQuery.state;
    this.#currentResultOptions = this.options;
    if (this.#currentResultState.data !== void 0) {
      this.#lastQueryWithDefinedData = this.#currentQuery;
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    this.#currentResult = nextResult;
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? this.#trackedProps
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(this.#currentResult).some((key) => {
        const typedKey = key;
        const changed = this.#currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    this.#notify({ listeners: shouldNotifyListeners() });
  }
  #updateQuery() {
    const query = this.#client.getQueryCache().build(this.#client, this.options);
    if (query === this.#currentQuery) {
      return;
    }
    const prevQuery = this.#currentQuery;
    this.#currentQuery = query;
    this.#currentQueryInitialState = query.state;
    if (this.hasListeners()) {
      prevQuery?.removeObserver(this);
      query.addObserver(this);
    }
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      this.#updateTimers();
    }
  }
  #notify(notifyOptions) {
    notifyManager.batch(() => {
      if (notifyOptions.listeners) {
        this.listeners.forEach((listener) => {
          listener(this.#currentResult);
        });
      }
      this.#client.getQueryCache().notify({
        query: this.#currentQuery,
        type: "observerResultsUpdated"
      });
    });
  }
};
function shouldLoadOnMount(query, options) {
  return resolveQueryBoolean(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && resolveQueryBoolean(options.retryOnMount, query) === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveQueryBoolean(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveQueryBoolean(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveQueryBoolean(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
function structuralSharing(oldData, newData) {
  return replaceEqualDeep(oldData, newData);
}
function hashFn(queryKey) {
  return JSON.stringify(queryKey, (_, value) => {
    if (isPlainObject(value))
      return Object.keys(value).sort().reduce((result, key) => {
        result[key] = value[key];
        return result;
      }, {});
    if (typeof value === "bigint")
      return value.toString();
    return value;
  });
}
function isPlainObject(value) {
  if (!hasObjectPrototype(value)) {
    return false;
  }
  const ctor = value.constructor;
  if (typeof ctor === "undefined")
    return true;
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot))
    return false;
  if (!prot.hasOwnProperty("isPrototypeOf"))
    return false;
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function filterQueryOptions(options) {
  const {
    // import('@tanstack/query-core').QueryOptions
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    _defaulted,
    behavior,
    gcTime,
    initialData,
    initialDataUpdatedAt,
    maxPages,
    meta,
    networkMode,
    queryFn,
    queryHash,
    queryKey,
    queryKeyHashFn,
    retry,
    retryDelay,
    structuralSharing: structuralSharing2,
    // import('@tanstack/query-core').InfiniteQueryObserverOptions
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    getPreviousPageParam,
    getNextPageParam,
    initialPageParam,
    // import('@tanstack/react-query').UseQueryOptions
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    _optimisticResults,
    enabled,
    notifyOnChangeProps,
    placeholderData,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retryOnMount,
    select,
    staleTime,
    suspense,
    throwOnError,
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // wagmi
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // biome-ignore lint/correctness/noUnusedVariables: tossing
    config,
    connector,
    query,
    ...rest
  } = options;
  return rest;
}
function readContractQueryOptions(config, options = {}) {
  return {
    // TODO: Support `signal` once Viem actions allow passthrough
    // https://tkdodo.eu/blog/why-you-want-react-query#bonus-cancellation
    async queryFn({ queryKey }) {
      const abi = options.abi;
      if (!abi)
        throw new Error("abi is required");
      const { functionName, scopeKey: _, ...parameters } = queryKey[1];
      const addressOrCodeParams = (() => {
        const params = queryKey[1];
        if (params.address)
          return { address: params.address };
        if (params.code)
          return { code: params.code };
        throw new Error("address or code is required");
      })();
      if (!functionName)
        throw new Error("functionName is required");
      return readContract(config, {
        abi,
        functionName,
        args: parameters.args,
        ...addressOrCodeParams,
        ...parameters
      });
    },
    queryKey: readContractQueryKey(options)
  };
}
function readContractQueryKey(options = {}) {
  const { abi: _, ...rest } = options;
  return ["readContract", filterQueryOptions(rest)];
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = query?.state.error && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  client.getDefaultOptions().queries?._experimental_beforeQuery?.(
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  const subscribed = options.subscribed !== false;
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : subscribed ? "optimistic" : void 0;
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && subscribed;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  client.getDefaultOptions().queries?._experimental_afterQuery?.(
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query?.promise
    );
    promise?.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery$1(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
function useQuery(parameters) {
  const result = useQuery$1({
    ...parameters,
    queryKeyHashFn: hashFn
    // for bigint support
  });
  result.queryKey = parameters.queryKey;
  return result;
}
function useChainId(parameters = {}) {
  const config = useConfig(parameters);
  return reactExports.useSyncExternalStore((onChange) => watchChainId(config, { onChange }), () => getChainId(config), () => getChainId(config));
}
function useReadContract(parameters = {}) {
  const { abi, address, functionName, query = {} } = parameters;
  const code = parameters.code;
  const config = useConfig(parameters);
  const chainId = useChainId({ config });
  const options = readContractQueryOptions(config, { ...parameters, chainId: parameters.chainId ?? chainId });
  const enabled = Boolean((address || code) && abi && functionName && (query.enabled ?? true));
  return useQuery({
    ...query,
    ...options,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing
  });
}
function ResaleButton({ designId, tokenId }) {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = reactExports.useState(false);
  const [price, setPrice] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [done, setDone] = reactExports.useState(false);
  const { data: ownerOf } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
    query: { enabled: isConnected && tokenId > 0 }
  });
  const isOwner = address && ownerOf && ownerOf.toLowerCase() === address.toLowerCase();
  if (!isConnected || !isOwner) return null;
  if (done) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-sm font-sora", children: "Listed for resale successfully. Refresh the page to see your listing." });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const askingPrice = Number(price);
    if (!askingPrice || askingPrice <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/resale/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designId,
          tokenId,
          askingPrice,
          sellerWallet: address
        })
      });
      if (res.ok) {
        setDone(true);
        setShowModal(false);
      } else {
        const err = await res.json();
        setError(err.error ?? "Failed to create listing.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setShowModal(true),
        className: "inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]",
        style: { fontSize: 13 },
        children: "List for resale"
      }
    ),
    showModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]",
        onClick: (e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[360px] bg-[#F0EBE1] border border-[#E8E3D8] p-7 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-sora text-[#5A5B55]/60 text-[10px] tracking-[0.2em] uppercase mb-4", children: "List for resale" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "field", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Asking price (THB) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "input",
                  type: "number",
                  min: "0.01",
                  step: "0.01",
                  value: price,
                  onChange: (e) => {
                    setPrice(e.target.value);
                    setError(null);
                  },
                  placeholder: "e.g. 3500",
                  autoFocus: true
                }
              )
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-500", children: error }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "submit",
                  className: "inline-flex items-center justify-center gap-2 flex-1 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-[#E60023] text-white hover:bg-[#C4001F] disabled:opacity-40",
                  disabled: submitting,
                  children: submitting ? "Listing…" : "Confirm listing"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-sora font-semibold text-sm transition-all bg-transparent text-[#1B1C18] border border-[#E8E3D8] hover:border-[#D4CFC4]",
                  onClick: () => setShowModal(false),
                  children: "Cancel"
                }
              )
            ] })
          ] })
        ] })
      }
    )
  ] });
}
const $$Astro = createAstro();
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let design = null;
  let artist = null;
  let moreDesigns = [];
  let resaleListings = [];
  try {
    const db = Astro2.locals.runtime.env.DB;
    design = await db.prepare("SELECT id, n, title, artist_id, style, price, status, placement, seed, drawn, token_id, ipfs_cid, image_url, selling_mode, royalty_pct, reserved_until FROM designs WHERE id = ?").bind(id).first();
    if (design) {
      if (design.status === "reserved" && design.reserved_until) {
        const expired = new Date(design.reserved_until).getTime() < Date.now();
        if (expired) {
          await db.prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?").bind(id).run();
          design.status = "available";
        }
      }
      const [aRow, mRes, rRes] = await Promise.all([
        db.prepare("SELECT id, name, city, style, seed FROM artists WHERE id = ?").bind(design.artist_id).first(),
        db.prepare("SELECT id, n, title, artist_id, style, price, status, placement, seed, drawn, image_url, selling_mode, royalty_pct, token_id FROM designs WHERE artist_id = ? AND id != ? AND status IN ('available','reserved','sold') ORDER BY rowid ASC LIMIT 3").bind(design.artist_id, id).all(),
        db.prepare("SELECT id, seller_wallet, asking_price, created_at, status FROM resale_listings WHERE design_id = ? AND status = 'active' ORDER BY asking_price ASC").bind(id).all()
      ]);
      artist = aRow;
      moreDesigns = mRes.results;
      resaleListings = rRes.results;
    }
  } catch {
  }
  if (!design) {
    return Astro2.redirect("/market");
  }
  function fmtThb(v) {
    if (!v) return "—";
    return `฿${v.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
  }
  function fmtDate(ts) {
    return new Date(ts * 1e3).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }
  const locale = Astro2.locals?.locale ?? "en";
  const t = createT(locale);
  return renderTemplate`${renderComponent($$result, "Base", $$Base, { "title": design.title + " — SAKNID", "description": `${design.title} by ${artist?.name ?? ""}. One-of-one tattoo plate.` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Nav", Nav, { "client:load": true, "currentPath": "/market", "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Nav", "client:component-export": "default" })} ${renderComponent($$result2, "Toast", Toast, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Toast", "client:component-export": "default" })} ${maybeRenderHead()}<section class="py-8 pb-20"> <div class="max-w-container-max mx-auto px-5 md:px-16"> <a href="/market" class="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 font-body text-sm transition-colors duration-200">${t("artistDetail.backToGallery")}</a> <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">  <div class="card-bb aspect-square overflow-hidden !border-outline-variant/20"> ${design.image_url ? renderTemplate`<img${addAttribute(design.image_url, "src")}${addAttribute(design.title, "alt")} style="width:100%;height:100%;object-fit:cover;display:block">` : renderTemplate`${renderComponent($$result2, "Plate", Plate, { "seed": design.seed ?? 0, "label": design.title.toUpperCase(), "index": design.n, "density": 1.3, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Plate", "client:component-export": "default" })}`} </div>  <div class="flex flex-col"> <div class="flex justify-between items-center mb-[22px]"> <span${addAttribute(`tag-bb text-xs border ${design.status === "available" ? "bg-green-600/10 text-green-700 border-green-600/30" : design.status === "reserved" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/30"}`, "class")}> <span class="w-2 h-2 rounded-full bg-current"></span> ${design.status === "available" ? t("artistDetail.available") : design.status === "reserved" ? t("artistDetail.reserved") : t("artistDetail.claimed")} </span> <span class="font-body text-on-surface-variant/60 text-label-sm tracking-wider">№ ${design.n} / 001</span> </div> ${design.status === "sold" && design.selling_mode === "resellable" && design.token_id != null && renderTemplate`<div class="mb-4"> ${renderComponent($$result2, "ResaleButton", ResaleButton, { "client:load": true, "designId": design.id, "tokenId": design.token_id, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/ResaleButton", "client:component-export": "default" })} </div>`} <h1 class="font-display font-semibold text-on-surface text-display-lg-mobile md:text-[46px] leading-none">${design.title}</h1> ${artist && renderTemplate`<a${addAttribute(`/artist/${artist.id}`, "href")} class="flex items-center gap-3 my-5 mb-7 no-underline text-inherit cursor-pointer group/artist"> <div class="w-[38px] h-[38px] rounded-full overflow-hidden flex-shrink-0 ring-1 ring-outline-variant/30"> ${renderComponent($$result2, "Plate", Plate, { "seed": artist.seed ?? 0, "density": 0.6, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Plate", "client:component-export": "default" })} </div> <div> <div class="font-body text-sm text-on-surface group-hover/artist:text-primary-container transition-colors duration-200">${artist.name}</div> <div class="font-body text-xs text-on-surface-variant tracking-wide">${artist.city} · ${design.style}</div> </div> </a>`} <div class="flex items-baseline gap-3.5 py-[22px] border-t border-outline-variant/20 border-b border-outline-variant/20 mb-[26px]"> <span class="font-display text-headline-sm text-on-surface">${fmtThb(design.price)}</span> <span class="font-body text-on-surface-variant/60 text-xs tracking-wide"> ${design.selling_mode === "one-time" ? t("artistDetail.soulbound") : t("artistDetail.resellable").replace("{pct}", String(design.royalty_pct ?? 0))} </span> </div> <div class="flex flex-col gap-3 mb-[26px]"> ${design.status === "available" ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <a${addAttribute(`/checkout/${design.id}`, "href")} class="btn-primary w-full">${t("artistDetail.acquirePlate")}</a> ${artist && renderTemplate`<a${addAttribute(`/booking?designId=${design.id}`, "href")} class="btn-secondary w-full"> ${t("artistDetail.bookArtist").replace("{name}", artist.name.split(" ")[0])} </a>`}` })}` : renderTemplate`<button class="btn-secondary w-full" disabled>
🔒 ${design.status === "reserved" ? t("artistDetail.reserved") : t("artistDetail.claimed")} </button>`} </div> <div class="bg-surface-container rounded-lg border border-outline-variant/30 p-6"> <div class="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/20"> <span class="font-display font-semibold text-on-surface">${t("artistDetail.certificate")}</span> <span class="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-body font-bold text-lg">${design.n}</span> </div> <div class="flex flex-col gap-3"> ${[
    [t("artistDetail.edition"), "№ " + design.n + " / 001"],
    [t("artistDetail.medium"), t("artistDetail.digitalInkPlate")],
    [t("artistDetail.placement"), design.placement ?? "—"],
    [t("artistDetail.watching").replace("{n}", String(design.drawn ?? 0)), String(design.drawn ?? 0) + " collectors"]
  ].map(([key, val]) => renderTemplate`<div class="flex justify-between font-body text-sm"> <span class="text-on-surface-variant">${key}</span> <span class="text-on-surface font-medium">${val}</span> </div>`)} </div> </div> <p class="text-on-surface-variant text-sm mt-[26px] mb-0 leading-relaxed">
Drawn by hand and held in escrow until claimed.
${design.drawn != null && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${design.drawn} collectors are watching this plate.` })}`} ${" "}On purchase it leaves the gallery permanently — the artist will ink it once, for you, and never again.
</p> </div> </div>  ${resaleListings.length > 0 && renderTemplate`<div class="mt-14"> <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 mb-5"> ${t("artistDetail.resaleListings")} </div> <div class="card-bb overflow-x-auto"> <table class="w-full border-collapse"> <thead> <tr> <th class="font-body text-[10px] text-left p-3 px-4 border-b border-outline-variant/20 text-on-surface-variant/60 tracking-wider">${t("artistDetail.seller")}</th> <th class="font-body text-[10px] text-left p-3 px-4 border-b border-outline-variant/20 text-on-surface-variant/60 tracking-wider">${t("artistDetail.price")}</th> <th class="font-body text-[10px] text-left p-3 px-4 border-b border-outline-variant/20 text-on-surface-variant/60 tracking-wider">${t("artistDetail.listed")}</th> <th class="font-body text-[10px] text-left p-3 px-4 border-b border-outline-variant/20 text-on-surface-variant/60 tracking-wider">${t("artistDetail.action")}</th> </tr> </thead> <tbody> ${resaleListings.map((r) => renderTemplate`<tr> <td class="font-body text-xs p-3 px-4 border-b border-outline-variant/20 text-on-surface-variant"> ${r.seller_wallet.slice(0, 6)}…${r.seller_wallet.slice(-4)} </td> <td class="font-display font-semibold text-on-surface text-base p-3 px-4 border-b border-outline-variant/20">
฿${r.asking_price.toLocaleString("th-TH", { minimumFractionDigits: 2 })} </td> <td class="font-body text-xs p-3 px-4 border-b border-outline-variant/20 text-on-surface-variant"> ${fmtDate(r.created_at)} </td> <td class="p-3 px-4 border-b border-outline-variant/20"> <a${addAttribute(`/checkout/${design.id}?resale=${r.id}`, "href")} class="btn-primary text-xs !px-4 !py-2">${t("artistDetail.buyResale")}</a> </td> </tr>`)} </tbody> </table> </div> </div>`}  ${moreDesigns.length > 0 && artist && renderTemplate`<div class="mt-[72px]"> <div class="font-body text-label-sm tracking-wider uppercase text-on-surface-variant/60 mb-6"> ${t("common.by")} ${artist.name} </div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter"> ${moreDesigns.map((m) => renderTemplate`<a${addAttribute(`/design/${m.id}`, "href")} class="card-bb block no-underline group"> <div class="aspect-[3/4] overflow-hidden bg-surface-dim"> ${m.image_url ? renderTemplate`<img${addAttribute(m.image_url, "src")}${addAttribute(m.title, "alt")} style="width:100%;height:100%;object-fit:cover;display:block">` : renderTemplate`${renderComponent($$result2, "Plate", Plate, { "seed": m.seed ?? 0, "density": 1, "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/vscode/codingZone/tattoo-project/src/components/Plate", "client:component-export": "default" })}`} </div> <div class="p-5"> <h3 class="font-display font-semibold text-on-surface text-xl mb-2 group-hover:text-primary transition-colors duration-200">${m.title}</h3> <div class="font-body text-xs text-on-surface-variant">${m.style}</div> <div class="font-display font-semibold text-on-surface text-[22px] mt-3">${fmtThb(m.price)}</div> </div> </a>`)} </div> </div>`} </div> </section> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/home/vscode/codingZone/tattoo-project/src/pages/design/[id].astro", void 0);
const $$file = "/home/vscode/codingZone/tattoo-project/src/pages/design/[id].astro";
const $$url = "/design/[id]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
