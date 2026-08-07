globalThis.process ??= {};
globalThis.process.env ??= {};
import { j as jsxRuntimeExports } from "./jsx-runtime_6SzGatPE.mjs";
import { r as reactExports } from "./_@astro-renderers_B6-rS8YJ.mjs";
import { i as isSafeUrlScheme, g as getBaseURL, c as createFetch, d as defu, t as toKebabCase, a as capitalizeFirstLetter } from "./string_U9QDfbCf.mjs";
const BASE64_URL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function base64EncodeInternal(data, chars) {
  const len = data.length;
  let result = "";
  for (let i = 0; i < len; i += 3) {
    const b0 = data[i];
    const b1 = i + 1 < len ? data[i + 1] : 0;
    const b2 = i + 2 < len ? data[i + 2] : 0;
    result += chars[b0 >> 2];
    result += chars[(b0 & 3) << 4 | b1 >> 4];
    result += chars[(b1 & 15) << 2 | b2 >> 6];
    result += chars[b2 & 63];
  }
  const pad = len % 3;
  if (pad === 1) {
    result = result.slice(0, -2);
  } else if (pad === 2) {
    result = result.slice(0, -1);
  }
  return result;
}
function base64DecodeInternal(str, chars) {
  const cleaned = str.replace(/=+$/, "");
  if (cleaned.length === 0) return new Uint8Array(0);
  const lookup = {};
  for (let i = 0; i < chars.length; i++) lookup[chars[i]] = i;
  for (let i = 0; i < cleaned.length; i++) {
    if (lookup[cleaned[i]] === void 0) {
      throw new Error(`Invalid base64 character at position ${i}: "${cleaned[i]}"`);
    }
  }
  const len = cleaned.length;
  const outLen = Math.floor(len * 3 / 4);
  const out = new Uint8Array(outLen);
  let j = 0;
  for (let i = 0; i < len; i += 4) {
    const c0 = lookup[cleaned[i]];
    const c1 = i + 1 < len ? lookup[cleaned[i + 1]] : 0;
    const c2 = i + 2 < len ? lookup[cleaned[i + 2]] : 0;
    const c3 = i + 3 < len ? lookup[cleaned[i + 3]] : 0;
    out[j++] = c0 << 2 | c1 >> 4;
    if (j < outLen) out[j++] = (c1 & 15) << 4 | c2 >> 2;
    if (j < outLen) out[j++] = (c2 & 3) << 6 | c3;
  }
  return out;
}
function base64urlEncode(data) {
  return base64EncodeInternal(data, BASE64_URL_CHARS);
}
function base64urlDecode(str) {
  return base64DecodeInternal(str, BASE64_URL_CHARS);
}
function generateRandomBytes(length) {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return buf;
}
function generateRandomSecret() {
  return base64urlEncode(generateRandomBytes(32));
}
async function aesGcmEncrypt(data, key) {
  const iv = generateRandomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return combined;
}
async function aesGcmDecrypt(combined, key) {
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new Uint8Array(plaintext);
}
const kBroadcastChannel = Symbol.for("better-auth:broadcast-channel");
const now$1 = () => Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
  listeners = /* @__PURE__ */ new Set();
  name;
  constructor(name = "better-auth.message") {
    this.name = name;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  post(message) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.name, JSON.stringify({
        ...message,
        timestamp: now$1()
      }));
    } catch {
    }
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const handler = (event) => {
      if (event.key !== this.name) return;
      const message = JSON.parse(event.newValue ?? "{}");
      if (message?.event !== "session" || !message?.data) return;
      this.listeners.forEach((listener) => listener(message));
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
  if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
  return globalThis[kBroadcastChannel];
}
let listenerQueue = [];
let lqIndex = 0;
const QUEUE_ITEMS_PER_LISTENER = 4;
const nanostoresGlobal = globalThis.nanostoresGlobal ||= { epoch: 0 };
let drainQueue = () => {
  for (lqIndex = 0; lqIndex < listenerQueue.length; lqIndex += QUEUE_ITEMS_PER_LISTENER) {
    listenerQueue[lqIndex](
      listenerQueue[lqIndex + 1].value,
      listenerQueue[lqIndex + 2],
      listenerQueue[lqIndex + 3]
    );
  }
  listenerQueue.length = 0;
};
const atom = /* @__NO_SIDE_EFFECTS__ */ (initialValue) => {
  let listeners = [];
  let $atom = {
    get() {
      if (!$atom.lc) {
        $atom.listen(() => {
        })();
      }
      return $atom.value;
    },
    init: initialValue,
    lc: 0,
    listen(listener) {
      $atom.lc = listeners.push(listener);
      return () => {
        for (let i = lqIndex + QUEUE_ITEMS_PER_LISTENER; i < listenerQueue.length; ) {
          if (listenerQueue[i] === listener) {
            listenerQueue.splice(i, QUEUE_ITEMS_PER_LISTENER);
          } else {
            i += QUEUE_ITEMS_PER_LISTENER;
          }
        }
        let index = listeners.indexOf(listener);
        if (~index) {
          listeners.splice(index, 1);
          if (!--$atom.lc) $atom.off();
        }
      };
    },
    notify(oldValue, changedKey) {
      nanostoresGlobal.epoch++;
      let runListenerQueue = !listenerQueue.length && true;
      for (let listener of listeners) {
        listenerQueue.push(
          listener,
          $atom,
          oldValue,
          changedKey
        );
      }
      if (runListenerQueue) {
        drainQueue();
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(newValue) {
      let oldValue = $atom.value;
      if (oldValue !== newValue) {
        $atom.value = newValue;
        $atom.notify(oldValue);
      }
    },
    subscribe(listener) {
      let unbind = $atom.listen(listener);
      listener($atom.value);
      return unbind;
    },
    value: initialValue
  };
  return $atom;
};
const SET = 2;
const MOUNT = 5;
const UNMOUNT = 6;
const REVERT_MUTATION = 10;
let on = (object, listener, eventKey, mutateStore) => {
  object.events = object.events || {};
  if (!object.events[eventKey + REVERT_MUTATION]) {
    object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
      object.events[eventKey].reduceRight((event, l) => (l(event), event), {
        shared: {},
        ...eventProps
      });
    });
  }
  object.events[eventKey] = object.events[eventKey] || [];
  object.events[eventKey].push(listener);
  return () => {
    let currentListeners = object.events[eventKey];
    let index = currentListeners.indexOf(listener);
    currentListeners.splice(index, 1);
    if (!currentListeners.length) {
      delete object.events[eventKey];
      object.events[eventKey + REVERT_MUTATION]();
      delete object.events[eventKey + REVERT_MUTATION];
    }
  };
};
let onSet = ($store, listener) => on($store, listener, SET, (runListeners) => {
  let originSet = $store.set;
  let originSetKey = $store.setKey;
  if ($store.setKey) {
    $store.setKey = (changed, changedValue) => {
      let isAborted;
      let abort = () => {
        isAborted = true;
      };
      runListeners({
        abort,
        changed,
        newValue: { ...$store.value, [changed]: changedValue }
      });
      if (!isAborted) return originSetKey(changed, changedValue);
    };
  }
  $store.set = (newValue) => {
    let isAborted;
    let abort = () => {
      isAborted = true;
    };
    runListeners({ abort, newValue });
    if (!isAborted) return originSet(newValue);
  };
  return () => {
    $store.set = originSet;
    $store.setKey = originSetKey;
  };
});
const STORE_UNMOUNT_DELAY = 1e3;
let onMount = ($store, initialize) => {
  let listener = (payload) => {
    let destroy = initialize(payload);
    if (destroy) $store.events[UNMOUNT].push(destroy);
  };
  return on($store, listener, MOUNT, (runListeners) => {
    let originListen = $store.listen;
    $store.listen = (...args) => {
      if (!$store.lc && !$store.active) {
        $store.active = true;
        runListeners();
      }
      return originListen(...args);
    };
    let originOff = $store.off;
    $store.events[UNMOUNT] = [];
    $store.off = () => {
      originOff();
      setTimeout(() => {
        if ($store.active && !$store.lc) {
          $store.active = false;
          for (let destroy of $store.events[UNMOUNT]) destroy();
          $store.events[UNMOUNT] = [];
        }
      }, STORE_UNMOUNT_DELAY);
    };
    return () => {
      $store.listen = originListen;
      $store.off = originOff;
    };
  });
};
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function isJsonEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!isJsonEqual(a[i], b[i])) return false;
    return true;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) if (!(key in b) || !isJsonEqual(a[key], b[key])) return false;
    return true;
  }
  return false;
}
function withEquality(store, isEqual) {
  return onSet(store, ({ newValue, abort }) => {
    if (isEqual(store.value, newValue)) abort();
  });
}
const kFocusManager = Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setFocused(focused) {
    this.listeners.forEach((listener) => listener(focused));
  }
  setup() {
    if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") this.setFocused(true);
    };
    document.addEventListener("visibilitychange", visibilityHandler, false);
    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler, false);
    };
  }
};
function getGlobalFocusManager() {
  if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
  return globalThis[kFocusManager];
}
const kOnlineManager = Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
  listeners = /* @__PURE__ */ new Set();
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setOnline(online) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const onOnline = () => this.setOnline(true);
    const onOffline = () => this.setOnline(false);
    window.addEventListener("online", onOnline, false);
    window.addEventListener("offline", onOffline, false);
    return () => {
      window.removeEventListener("online", onOnline, false);
      window.removeEventListener("offline", onOffline, false);
    };
  }
};
function getGlobalOnlineManager() {
  if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
  return globalThis[kOnlineManager];
}
const PROTO_POLLUTION_PATTERNS = {
  proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
  constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
  protoShort: /"__proto__"\s*:/,
  constructorShort: /"constructor"\s*:/
};
const JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
const SPECIAL_VALUES = {
  true: true,
  false: false,
  null: null,
  undefined: void 0,
  nan: NaN,
  infinity: Number.POSITIVE_INFINITY,
  "-infinity": Number.NEGATIVE_INFINITY
};
const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
  const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
  if (offsetSign) {
    const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
    date.setUTCMinutes(date.getUTCMinutes() + offset);
  }
  return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
  const { strict = false, warnings = false, reviver, parseDates = true } = options;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  const lowerValue = trimmed.toLowerCase();
  if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
  if (!JSON_SIGNATURE.test(trimmed)) {
    if (strict) throw new SyntaxError("[better-json] Invalid JSON");
    return value;
  }
  if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern]) => {
    const matches = pattern.test(trimmed);
    if (matches && warnings) console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
    return matches;
  }) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
  try {
    const secureReviver = (key, value2) => {
      if (key === "__proto__" || key === "constructor" && value2 && typeof value2 === "object" && "prototype" in value2) {
        if (warnings) console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
        return;
      }
      if (parseDates && typeof value2 === "string") {
        const date = parseISODate(value2);
        if (date) return date;
      }
      return reviver ? reviver(key, value2) : value2;
    };
    return JSON.parse(trimmed, secureReviver);
  } catch (error) {
    if (strict) throw error;
    return value;
  }
}
function parseJSON(value, options = { strict: true }) {
  return betterJSONParse(value, options);
}
const now = () => Math.floor(Date.now() / 1e3);
const FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
  const { fetchSession, shouldPollSession = () => true, sessionSignal, options = {} } = opts;
  const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
  const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
  const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
  const state = {
    isInitialized: false,
    lastSessionRequest: 0
  };
  const shouldRefetch = () => {
    return refetchWhenOffline || getGlobalOnlineManager().isOnline;
  };
  const triggerRefetch = (event) => {
    if (!shouldRefetch()) return;
    if (event?.event === "storage") {
      fetchSession();
      return;
    }
    if (event?.event === "poll") {
      state.lastSessionRequest = now();
      fetchSession();
      return;
    }
    if (event?.event === "visibilitychange") {
      if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS) return;
      state.lastSessionRequest = now();
      fetchSession();
      return;
    }
    fetchSession();
  };
  const broadcastSessionUpdate = (trigger) => {
    getGlobalBroadcastChannel().post({
      event: "session",
      data: { trigger },
      clientId: Math.random().toString(36).substring(7)
    });
  };
  const setupPolling = () => {
    if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(() => {
      if (shouldPollSession()) triggerRefetch({ event: "poll" });
    }, refetchInterval * 1e3);
  };
  const setupBroadcast = () => {
    state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
      triggerRefetch({ event: "storage" });
    });
  };
  const setupFocusRefetch = () => {
    if (!refetchOnWindowFocus) return;
    state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
      triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupOnlineRefetch = () => {
    state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
      if (online) triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupSignalSubscription = () => {
    state.unsubscribeSignal = sessionSignal.listen(() => {
      fetchSession();
    });
  };
  const init = () => {
    if (state.isInitialized) return;
    state.isInitialized = true;
    setupPolling();
    setupBroadcast();
    setupFocusRefetch();
    setupOnlineRefetch();
    setupSignalSubscription();
    state.cleanupBroadcastSetup = getGlobalBroadcastChannel().setup();
    state.cleanupFocusSetup = getGlobalFocusManager().setup();
    state.cleanupOnlineSetup = getGlobalOnlineManager().setup();
  };
  const cleanup = () => {
    if (!state.isInitialized) return;
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
      state.pollInterval = void 0;
    }
    if (state.unsubscribeBroadcast) {
      state.unsubscribeBroadcast();
      state.unsubscribeBroadcast = void 0;
    }
    if (state.unsubscribeFocus) {
      state.unsubscribeFocus();
      state.unsubscribeFocus = void 0;
    }
    if (state.unsubscribeOnline) {
      state.unsubscribeOnline();
      state.unsubscribeOnline = void 0;
    }
    if (state.unsubscribeSignal) {
      state.unsubscribeSignal();
      state.unsubscribeSignal = void 0;
    }
    if (state.cleanupBroadcastSetup) {
      state.cleanupBroadcastSetup();
      state.cleanupBroadcastSetup = void 0;
    }
    if (state.cleanupFocusSetup) {
      state.cleanupFocusSetup();
      state.cleanupFocusSetup = void 0;
    }
    if (state.cleanupOnlineSetup) {
      state.cleanupOnlineSetup();
      state.cleanupOnlineSetup = void 0;
    }
    state.isInitialized = false;
    state.lastSessionRequest = 0;
  };
  return {
    init,
    cleanup,
    triggerRefetch,
    broadcastSessionUpdate
  };
}
const redirectPlugin = {
  id: "redirect",
  name: "Redirect",
  hooks: { onSuccess(context) {
    if (context.data?.url && context.data?.redirect && isSafeUrlScheme(context.data.url)) {
      if (typeof window !== "undefined" && window.location) {
        if (window.location) try {
          window.location.href = context.data.url;
        } catch {
        }
      }
    }
  } }
};
const isServer = () => typeof window === "undefined";
function normalizeSessionResponse(res) {
  if (typeof res === "object" && res !== null && "data" in res && "error" in res) return res;
  return {
    data: res,
    error: null
  };
}
function normalizeSessionData(data) {
  if (!data) return null;
  if (data.session === null && data.user === null) return null;
  return data;
}
function isSessionAtomEqual(a, b) {
  return isJsonEqual(a.data, b.data) && a.error === b.error && a.isPending === b.isPending && a.isRefetching === b.isRefetching && a.refetch === b.refetch;
}
function getSessionAtom($fetch, options) {
  const $signal = /* @__PURE__ */ atom(false);
  let abortController;
  const refetch = (queryParams) => fetchSession(queryParams);
  const session = /* @__PURE__ */ atom({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch
  });
  withEquality(session, isSessionAtomEqual);
  const settleAbortedFetch = (controller) => {
    if (abortController !== controller) return;
    const current = session.get();
    abortController = void 0;
    if (!current.isPending && !current.isRefetching) return;
    session.set({
      ...current,
      isPending: false,
      isRefetching: false,
      refetch
    });
  };
  const fetchSession = async (queryParams) => {
    abortController?.abort();
    const controller = new AbortController();
    abortController = controller;
    const current = session.get();
    session.set({
      ...current,
      isPending: current.data === null,
      isRefetching: true,
      error: null,
      refetch
    });
    try {
      const res = await $fetch("/get-session", {
        method: "GET",
        query: queryParams?.query,
        signal: controller.signal
      });
      if (controller.signal.aborted) {
        settleAbortedFetch(controller);
        return;
      }
      let { data, error } = normalizeSessionResponse(res);
      if (data?.needsRefresh) try {
        const refreshRes = await $fetch("/get-session", {
          method: "POST",
          signal: controller.signal
        });
        if (controller.signal.aborted) {
          settleAbortedFetch(controller);
          return;
        }
        ({ data, error } = normalizeSessionResponse(refreshRes));
      } catch {
        if (controller.signal.aborted) {
          settleAbortedFetch(controller);
          return;
        }
      }
      if (error) {
        const latest = session.get();
        const isUnauthorized = error?.status === 401;
        session.set({
          data: isUnauthorized ? null : latest.data,
          error,
          isPending: false,
          isRefetching: false,
          refetch
        });
        return;
      }
      const sessionData = normalizeSessionData(data);
      const current2 = session.get();
      const stableData = current2.data != null && sessionData != null && isJsonEqual(current2.data, sessionData) ? current2.data : sessionData;
      session.set({
        data: stableData,
        error: null,
        isPending: false,
        isRefetching: false,
        refetch
      });
    } catch (fetchError) {
      if (controller.signal.aborted) {
        settleAbortedFetch(controller);
        return;
      }
      const latest = session.get();
      session.set({
        data: latest.data,
        error: fetchError,
        isPending: false,
        isRefetching: false,
        refetch
      });
    }
  };
  let broadcastSessionUpdate = () => {
  };
  onMount(session, () => {
    let timeoutId;
    if (!isServer()) timeoutId = setTimeout(() => {
      fetchSession();
    }, 0);
    const refreshManager = createSessionRefreshManager({
      fetchSession,
      shouldPollSession: () => session.get().data != null,
      sessionSignal: $signal,
      options
    });
    refreshManager.init();
    broadcastSessionUpdate = refreshManager.broadcastSessionUpdate;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      const controller = abortController;
      controller?.abort();
      if (controller) settleAbortedFetch(controller);
      refreshManager.cleanup();
    };
  });
  return {
    session,
    $sessionSignal: $signal,
    broadcastSessionUpdate: (trigger) => broadcastSessionUpdate(trigger)
  };
}
const resolvePublicAuthUrl = (basePath) => {
  if (typeof process === "undefined") return void 0;
  const path = basePath ?? "/api/auth";
  if (process.env.NEXT_PUBLIC_AUTH_URL) return process.env.NEXT_PUBLIC_AUTH_URL;
  if (typeof window === "undefined") {
    if (process.env.NEXTAUTH_URL) try {
      return process.env.NEXTAUTH_URL;
    } catch {
    }
    if (process.env.VERCEL_URL) try {
      const protocol = process.env.VERCEL_URL.startsWith("http") ? "" : "https://";
      return `${new URL(`${protocol}${process.env.VERCEL_URL}`).origin}${path}`;
    } catch {
    }
  }
};
const getClientConfig = (options, loadEnv) => {
  const isCredentialsSupported = "credentials" in Request.prototype;
  const baseURL = getBaseURL(options?.baseURL, options?.basePath, void 0) ?? resolvePublicAuthUrl(options?.basePath) ?? "/api/auth";
  const pluginsFetchPlugins = options?.plugins?.flatMap((plugin) => plugin.fetchPlugins).filter((pl) => pl !== void 0) || [];
  const lifeCyclePlugin = {
    id: "lifecycle-hooks",
    name: "lifecycle-hooks",
    hooks: {
      onSuccess: options?.fetchOptions?.onSuccess,
      onError: options?.fetchOptions?.onError,
      onRequest: options?.fetchOptions?.onRequest,
      onResponse: options?.fetchOptions?.onResponse
    }
  };
  const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
  const $fetch = createFetch({
    baseURL,
    ...isCredentialsSupported ? { credentials: "include" } : {},
    method: "GET",
    jsonParser(text) {
      if (!text) return null;
      return parseJSON(text, { strict: false });
    },
    customFetchImpl: fetch,
    ...restOfFetchOptions,
    plugins: [
      lifeCyclePlugin,
      ...restOfFetchOptions.plugins || [],
      ...options?.disableDefaultFetchPlugins ? [] : [redirectPlugin],
      ...pluginsFetchPlugins
    ]
  });
  const { $sessionSignal, session, broadcastSessionUpdate } = getSessionAtom($fetch, options);
  const plugins = options?.plugins || [];
  let pluginsActions = {};
  const pluginsAtoms = {
    $sessionSignal,
    session
  };
  const pluginPathMethods = {
    "/sign-out": "POST",
    "/revoke-sessions": "POST",
    "/revoke-other-sessions": "POST",
    "/delete-user": "POST"
  };
  const atomListeners = [{
    signal: "$sessionSignal",
    matcher(path) {
      return path === "/sign-out" || path === "/update-user" || path === "/update-session" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/revoke-other-sessions" || path === "/change-email" || path === "/change-password";
    },
    callback(path) {
      if (path === "/sign-out") broadcastSessionUpdate("signout");
      else if (path === "/update-user" || path === "/update-session") broadcastSessionUpdate("updateUser");
    }
  }];
  for (const plugin of plugins) {
    if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
    if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
    if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
  }
  const $store = {
    notify: (signal) => {
      pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
    },
    listen: (signal, listener) => {
      pluginsAtoms[signal].subscribe(listener);
    },
    atoms: pluginsAtoms
  };
  for (const plugin of plugins) if (plugin.getActions) pluginsActions = defu(plugin.getActions?.($fetch, $store, options) ?? {}, pluginsActions);
  return {
    get baseURL() {
      return baseURL;
    },
    pluginsActions,
    pluginsAtoms,
    pluginPathMethods,
    atomListeners,
    $fetch,
    $store
  };
};
function isAtom(value) {
  return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
function getMethod(path, knownPathMethods, args) {
  const method = knownPathMethods[path];
  const { fetchOptions, query: _query, ...body } = args || {};
  if (method) return method;
  if (fetchOptions?.method) return fetchOptions.method;
  if (body && Object.keys(body).length > 0) return "POST";
  return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
  function createProxy(path = []) {
    return new Proxy(function() {
    }, {
      get(_, prop) {
        if (typeof prop !== "string") return;
        if (prop === "then" || prop === "catch" || prop === "finally") return;
        const fullPath = [...path, prop];
        let current = routes;
        for (const segment of fullPath) if (current && typeof current === "object" && segment in current) current = current[segment];
        else {
          current = void 0;
          break;
        }
        if (typeof current === "function") return current;
        if (isAtom(current)) return current;
        return createProxy(fullPath);
      },
      apply: async (_, __, args) => {
        const routePath = "/" + path.map(toKebabCase).join("/");
        const arg = args[0] || {};
        const fetchOptions = args[1] || {};
        const { query, fetchOptions: argFetchOptions, ...body } = arg;
        const options = {
          ...fetchOptions,
          ...argFetchOptions
        };
        const method = getMethod(routePath, knownPathMethods, arg);
        return await client(routePath, {
          ...options,
          body: method === "GET" ? void 0 : {
            ...body,
            ...options?.body || {}
          },
          query: query || options?.query,
          method,
          async onSuccess(context) {
            await options?.onSuccess?.(context);
            if (!atomListeners || options.disableSignal) return;
            const matches = atomListeners.filter((s) => s.matcher(routePath));
            if (!matches.length) return;
            const visited = /* @__PURE__ */ new Set();
            for (const match of matches) {
              const signal = atoms[match.signal];
              if (!signal) return;
              if (visited.has(match.signal)) continue;
              visited.add(match.signal);
              const val = signal.get();
              setTimeout(() => {
                signal.set(!val);
              }, 10);
              match.callback?.(routePath);
            }
          }
        });
      }
    });
  }
  return createProxy();
}
function createAuthClient(options) {
  const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, atomListeners, $store } = getClientConfig(options);
  const resolvedHooks = {};
  for (const [key, value] of Object.entries(pluginsAtoms)) resolvedHooks[`use${capitalizeFirstLetter(key)}`] = value;
  return createDynamicPathProxy({
    ...pluginsActions,
    ...resolvedHooks,
    $fetch,
    $store
  }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : ""
});
const PBKDF2_ITERATIONS = 1e5;
async function deriveKeyFromPassword(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function encryptWithRecoveryPassword(secret, password) {
  const salt = generateRandomBytes(16);
  const key = await deriveKeyFromPassword(password, salt);
  const encoded = new TextEncoder().encode(secret);
  const combined = await aesGcmEncrypt(encoded, key);
  return { encrypted: base64urlEncode(combined), salt: base64urlEncode(salt) };
}
async function decryptWithRecoveryPassword(encrypted, password, salt) {
  const saltBytes = base64urlDecode(salt);
  const key = await deriveKeyFromPassword(password, saltBytes);
  const combined = base64urlDecode(encrypted);
  const plaintext = await aesGcmDecrypt(combined, key);
  return new TextDecoder().decode(plaintext);
}
function isWalletBackupData(value) {
  if (typeof value !== "object" || value === null) return false;
  const obj = value;
  if (obj.version !== 1) return false;
  if (typeof obj.address !== "string" || !obj.address.startsWith("0x")) return false;
  if (typeof obj.daccPublicKey !== "string") return false;
  if (typeof obj.encryptedPasswordSecretKey !== "string") return false;
  if (typeof obj.prfSalt !== "string") return false;
  if (typeof obj.credentialId !== "string") return false;
  return true;
}
async function parseBackupFile(blob) {
  const text = await blob.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Backup file is not valid JSON");
  }
  if (!isWalletBackupData(parsed)) {
    throw new Error("Backup file has invalid or missing fields");
  }
  return parsed;
}
async function uploadBackupToD1(wallet, recoveryPassword) {
  const json = JSON.stringify(wallet);
  const { encrypted, salt } = await encryptWithRecoveryPassword(json, recoveryPassword);
  const res = await fetch("/api/wallet/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: wallet.address,
      encryptedBlob: encrypted,
      prfSalt: wallet.prfSalt,
      credentialId: wallet.credentialId,
      recoverySalt: salt
    })
  });
  if (!res.ok) {
    let errMsg = "Failed to upload backup";
    try {
      const err = await res.json();
      if (typeof err === "object" && err !== null && "error" in err && typeof err.error === "string") {
        errMsg = err.error;
      }
    } catch {
    }
    throw new Error(errMsg);
  }
}
async function downloadBackupFromD1(recoveryPassword) {
  const res = await fetch("/api/wallet/backup");
  if (!res.ok) {
    if (res.status === 404) throw new Error("No backup found");
    throw new Error("Failed to download backup");
  }
  const raw = await res.json();
  if (typeof raw !== "object" || raw === null || typeof raw.encryptedBlob !== "string" || typeof raw.recoverySalt !== "string") {
    throw new Error("Server returned invalid backup format");
  }
  const data = raw;
  const decrypted = await decryptWithRecoveryPassword(
    data.encryptedBlob,
    recoveryPassword,
    data.recoverySalt
  );
  let parsed;
  try {
    parsed = JSON.parse(decrypted);
  } catch {
    throw new Error("Decrypted backup is not valid JSON");
  }
  if (!isWalletBackupData(parsed)) {
    throw new Error("Backup data is corrupted or invalid");
  }
  return parsed;
}
const LS_DACC = "saknid_wallet_daccPublickey";
const LS_ADDR = "saknid_wallet_address";
const LS_SECRET = "saknid_wallet_secret";
function readStorage() {
  if (typeof window === "undefined") return null;
  const pk = localStorage.getItem(LS_DACC);
  const addr = localStorage.getItem(LS_ADDR);
  const secret = localStorage.getItem(LS_SECRET) ?? void 0;
  if (pk && addr) return { daccPublickey: pk, address: addr, secret };
  return null;
}
function persistWallet(pk, addr, secret) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_DACC, pk);
  localStorage.setItem(LS_ADDR, addr);
}
function persistSecret(secret) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_SECRET, secret);
}
function getOrCreateSecret() {
  const stored = localStorage.getItem(LS_SECRET);
  if (stored) return stored;
  const secret = generateRandomSecret();
  localStorage.setItem(LS_SECRET, secret);
  return secret;
}
const PasskeyWalletContext = reactExports.createContext(null);
function PasskeyWalletProvider({ children }) {
  const restored = readStorage();
  const [status, setStatus] = reactExports.useState(restored ? "locked" : "none");
  const [address, setAddress] = reactExports.useState(restored?.address ?? null);
  const walletRef = reactExports.useRef(restored?.daccPublickey ?? null);
  const [daccPublickey, setDaccPublickey] = reactExports.useState(restored?.daccPublickey ?? null);
  const createWallet = reactExports.useCallback(async () => {
    if (walletRef.current) return;
    setStatus("loading");
    try {
      const { createDaccWallet } = await import("./index_JBFjlWvQ.mjs");
      const secret = getOrCreateSecret();
      const wallet = await createDaccWallet({ passwordSecretkey: secret });
      walletRef.current = wallet.daccPublickey;
      setAddress(wallet.address);
      setDaccPublickey(wallet.daccPublickey);
      persistWallet(wallet.daccPublickey, wallet.address);
      setStatus("unlocked");
      const session = await authClient.getSession();
      if (session.data?.user) {
        const recoveryPassword = window.prompt(
          "Set a recovery password to back up your wallet to the cloud. You'll need it to restore on a new device."
        );
        if (recoveryPassword) {
          try {
            await uploadBackupToD1(
              {
                version: 1,
                address: wallet.address,
                daccPublicKey: wallet.daccPublickey,
                encryptedPasswordSecretKey: secret,
                prfSalt: "",
                credentialId: ""
              },
              recoveryPassword
            );
          } catch (e) {
            console.error("Failed to upload backup:", e);
          }
        }
      }
    } catch (e) {
      setStatus("none");
      throw e;
    }
  }, []);
  const unlock = reactExports.useCallback(() => {
    if (!walletRef.current || !address) return;
    setStatus("unlocked");
  }, [address]);
  const lock = reactExports.useCallback(() => {
    if (!walletRef.current) return;
    setStatus("locked");
  }, []);
  const importBackup = reactExports.useCallback(
    (data) => {
      walletRef.current = data.daccPublickey;
      setAddress(data.address);
      setDaccPublickey(data.daccPublickey);
      persistWallet(data.daccPublickey, data.address);
      if (data.encryptedPasswordSecretKey) {
        persistSecret(data.encryptedPasswordSecretKey);
      }
      setStatus("unlocked");
    },
    []
  );
  const value = {
    status,
    address,
    daccPublickey,
    createWallet,
    unlock,
    lock,
    importBackup,
    isReady: status === "unlocked"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PasskeyWalletContext.Provider, { value, children });
}
function usePasskeyWallet() {
  const ctx = reactExports.useContext(PasskeyWalletContext);
  if (!ctx) {
    return {
      status: "none",
      address: null,
      daccPublickey: null,
      createWallet: async () => {
      },
      unlock: () => {
      },
      lock: () => {
      },
      importBackup: () => {
      },
      isReady: false
    };
  }
  return ctx;
}
export {
  PasskeyWalletProvider as P,
  authClient as a,
  downloadBackupFromD1 as d,
  parseBackupFile as p,
  usePasskeyWallet as u
};
