globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as reactExports } from "./_@astro-renderers_B6-rS8YJ.mjs";
import { j as jsxRuntimeExports } from "./jsx-runtime_6SzGatPE.mjs";
let isReconnecting = false;
async function reconnect(config, parameters = {}) {
  if (isReconnecting)
    return [];
  isReconnecting = true;
  config.setState((x) => ({
    ...x,
    status: x.current ? "reconnecting" : "connecting"
  }));
  const connectors = [];
  if (parameters.connectors?.length) {
    for (const connector_ of parameters.connectors) {
      let connector;
      if (typeof connector_ === "function")
        connector = config._internal.connectors.setup(connector_);
      else
        connector = connector_;
      connectors.push(connector);
    }
  } else
    connectors.push(...config.connectors);
  let recentConnectorId;
  try {
    recentConnectorId = await config.storage?.getItem("recentConnectorId");
  } catch {
  }
  const scores = {};
  for (const [, connection] of config.state.connections) {
    scores[connection.connector.id] = 1;
  }
  if (recentConnectorId)
    scores[recentConnectorId] = 0;
  const sorted = Object.keys(scores).length > 0 ? (
    // .toSorted()
    [...connectors].sort((a, b) => (scores[a.id] ?? 10) - (scores[b.id] ?? 10))
  ) : connectors;
  let connected = false;
  const connections = [];
  const providers = [];
  for (const connector of sorted) {
    const provider = await connector.getProvider().catch(() => void 0);
    if (!provider)
      continue;
    if (providers.some((x) => x === provider))
      continue;
    const isAuthorized = await connector.isAuthorized();
    if (!isAuthorized)
      continue;
    const data = await connector.connect({ isReconnecting: true }).catch(() => null);
    if (!data)
      continue;
    connector.emitter.off("connect", config._internal.events.connect);
    connector.emitter.on("change", config._internal.events.change);
    connector.emitter.on("disconnect", config._internal.events.disconnect);
    config.setState((x) => {
      const connections2 = new Map(connected ? x.connections : /* @__PURE__ */ new Map()).set(connector.uid, { accounts: data.accounts, chainId: data.chainId, connector });
      return {
        ...x,
        current: connected ? x.current : connector.uid,
        connections: connections2
      };
    });
    connections.push({
      accounts: data.accounts,
      chainId: data.chainId,
      connector
    });
    providers.push(provider);
    connected = true;
  }
  if (config.state.status === "reconnecting" || config.state.status === "connecting") {
    if (!connected)
      config.setState((x) => ({
        ...x,
        connections: /* @__PURE__ */ new Map(),
        current: null,
        status: "disconnected"
      }));
    else
      config.setState((x) => ({ ...x, status: "connected" }));
  }
  isReconnecting = false;
  return connections;
}
function hydrate(config, parameters) {
  const { initialState, reconnectOnMount } = parameters;
  if (initialState && !config._internal.store.persist.hasHydrated())
    config.setState({
      ...initialState,
      chainId: config.chains.some((x) => x.id === initialState.chainId) ? initialState.chainId : config.chains[0].id,
      connections: reconnectOnMount ? initialState.connections : /* @__PURE__ */ new Map(),
      status: reconnectOnMount ? "reconnecting" : "disconnected"
    });
  return {
    async onMount() {
      if (config._internal.ssr) {
        await config._internal.store.persist.rehydrate();
        if (config._internal.mipd) {
          config._internal.connectors.setState((connectors) => {
            const rdnsSet = /* @__PURE__ */ new Set();
            for (const connector of connectors ?? []) {
              if (connector.rdns) {
                const rdnsValues = Array.isArray(connector.rdns) ? connector.rdns : [connector.rdns];
                for (const rdns of rdnsValues) {
                  rdnsSet.add(rdns);
                }
              }
            }
            const mipdConnectors = [];
            const providers = config._internal.mipd?.getProviders() ?? [];
            for (const provider of providers) {
              if (rdnsSet.has(provider.info.rdns))
                continue;
              const connectorFn = config._internal.connectors.providerDetailToConnector(provider);
              const connector = config._internal.connectors.setup(connectorFn);
              mipdConnectors.push(connector);
            }
            return [...connectors, ...mipdConnectors];
          });
        }
      }
      if (reconnectOnMount)
        reconnect(config);
      else if (config.storage)
        config.setState((x) => ({
          ...x,
          connections: /* @__PURE__ */ new Map()
        }));
    }
  };
}
function Hydrate(parameters) {
  const { children, config, initialState, reconnectOnMount = true } = parameters;
  const { onMount } = hydrate(config, {
    initialState,
    reconnectOnMount
  });
  if (!config._internal.ssr)
    onMount();
  const active = reactExports.useRef(true);
  reactExports.useEffect(() => {
    if (!active.current)
      return;
    if (!config._internal.ssr)
      return;
    onMount();
    return () => {
      active.current = false;
    };
  }, []);
  return children;
}
const WagmiContext = reactExports.createContext(void 0);
function WagmiProvider(parameters) {
  const { children, config } = parameters;
  const props = { value: config };
  return reactExports.createElement(Hydrate, parameters, reactExports.createElement(WagmiContext.Provider, props, children));
}
var QueryClientContext = reactExports.createContext(
  void 0
);
var useQueryClient = (queryClient) => {
  const client = reactExports.useContext(QueryClientContext);
  if (!client) {
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  }
  return client;
};
var QueryClientProvider = ({
  client,
  children
}) => {
  reactExports.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientContext.Provider, { value: client, children });
};
export {
  QueryClientProvider as Q,
  WagmiProvider as W,
  WagmiContext as a,
  useQueryClient as u
};
