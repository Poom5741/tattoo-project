globalThis.process ??= {};
globalThis.process.env ??= {};
import { randomUUID } from "crypto";
import { V as VoucherRequestSchema } from "../../chunks/schemas_Dq2rX-Tk.mjs";
import { C as CONTRACT_ADDRESS, a as CONTRACT_ABI, b as CHAIN_ID } from "../../chunks/contract_D8gETbvb.mjs";
import { o as observe, p as poll, w as waitForTransactionReceipt, s as sendRawTransactionSync, a as getTypesForEIP712Domain, v as validateTypedData, b as serializeTypedData, h as hashTypedData, g as getChainClient, z as zeroAddress } from "../../chunks/chain-client_BHoaUBbE.mjs";
import { B as BaseError, P as numberToHex, h as hexToBigInt, e as hexToNumber, Q as trim, d as checksumAddress, g as getAddress, O as LruMap, s as stringToHex, t as toHex, i as isAddress, I as InvalidAddressError, a as isHex, R as hexToBytes, k as keccak256, S as toBytes } from "../../chunks/isAddress_CvPYbxIx.mjs";
import { s as secp256k1 } from "../../chunks/secp256k1_CT1iL2OC.mjs";
import { p as publicKeyToAddress } from "../../chunks/recoverAddress_DCfK7WXD.mjs";
import { c as getTransactionError, l as receiptStatuses, g as getChainId, m as getTransactionCount, r as recoverAuthorizationAddress, b as prepareTransactionRequest, d as defaultParameters, s as sendRawTransaction, n as fillTransaction, o as serializeSignature, q as hashAuthorization } from "../../chunks/verifyHash_CGN_bz2z.mjs";
import { h as hashMessage } from "../../chunks/hashMessage_Bn4YmYfL.mjs";
import { s as sendTransaction, A as AccountNotFoundError, a as assertCurrentChain, b as AccountTypeNotSupportedError, w as writeContract, c as serializeTransaction } from "../../chunks/serializeAuthorizationList_BX8v-c1f.mjs";
import { w as withRetry, c as createClient, h as http } from "../../chunks/http_BBpHswub.mjs";
import { r as encodeFunctionData, z as sliceHex, o as getAction, B as encodeDeployData, n as assertRequest, p as formatTransactionRequest, q as extract, T as TransactionReceiptRevertedError } from "../../chunks/readContract_C8ppk_Ev.mjs";
import { f as UnsupportedNonOptionalCapabilityError, A as AtomicityNotSupportedError, p as parseAccount, s as stringify, w as withResolvers } from "../../chunks/createBatchScheduler_DvXUs0rZ.mjs";
import { c as concat, i as isAddressEqual } from "../../chunks/isAddressEqual_cc58LofG.mjs";
import { b as bscTestnet } from "../../chunks/bscTestnet_BdMT0G5N.mjs";
import { a } from "../../chunks/_@astro-renderers_B6-rS8YJ.mjs";
class BundleFailedError extends BaseError {
  constructor(result) {
    super(`Call bundle failed with status: ${result.statusCode}`, {
      name: "BundleFailedError"
    });
    Object.defineProperty(this, "result", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.result = result;
  }
}
const fallbackMagicIdentifier = "0x5792579257925792579257925792579257925792579257925792579257925792";
const fallbackTransactionErrorMagicIdentifier = numberToHex(0, {
  size: 32
});
async function sendCalls(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, experimental_fallback, experimental_fallbackDelay = 32, forceAtomic = false, id, version = "2.0.0" } = parameters;
  const account = account_ ? parseAccount(account_) : null;
  let capabilities = parameters.capabilities;
  if (client.dataSuffix && !parameters.capabilities?.dataSuffix) {
    if (typeof client.dataSuffix === "string")
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: { value: client.dataSuffix, optional: true }
      };
    else
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: {
          value: client.dataSuffix.value,
          ...client.dataSuffix.required ? {} : { optional: true }
        }
      };
  }
  const calls = parameters.calls.map((call_) => {
    const call = call_;
    const data = call.abi ? encodeFunctionData({
      abi: call.abi,
      functionName: call.functionName,
      args: call.args
    }) : call.data;
    return {
      data: call.dataSuffix && data ? concat([data, call.dataSuffix]) : data,
      to: call.to,
      value: call.value ? numberToHex(call.value) : void 0
    };
  });
  try {
    const response = await client.request({
      method: "wallet_sendCalls",
      params: [
        {
          atomicRequired: forceAtomic,
          calls,
          capabilities,
          chainId: numberToHex(chain.id),
          from: account?.address,
          id,
          version
        }
      ]
    }, { retryCount: 0 });
    if (typeof response === "string")
      return { id: response };
    return response;
  } catch (err) {
    const error = err;
    if (experimental_fallback && (error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError" || error.name === "UnknownRpcError" || error.details.toLowerCase().includes("does not exist / is not available") || error.details.toLowerCase().includes("missing or invalid. request()") || error.details.toLowerCase().includes("did not match any variant of untagged enum") || error.details.toLowerCase().includes("account upgraded to unsupported contract") || error.details.toLowerCase().includes("eip-7702 not supported") || error.details.toLowerCase().includes("unsupported wc_ method") || // magic.link
    error.details.toLowerCase().includes("feature toggled misconfigured") || // Trust Wallet
    error.details.toLowerCase().includes("jsonrpcengine: response has no error or result for request"))) {
      if (capabilities) {
        const hasNonOptionalCapability = Object.values(capabilities).some((capability) => !capability.optional);
        if (hasNonOptionalCapability) {
          const message = "non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.";
          throw new UnsupportedNonOptionalCapabilityError(new BaseError(message, {
            details: message
          }));
        }
      }
      if (forceAtomic && calls.length > 1) {
        const message = "`forceAtomic` is not supported on fallback to `eth_sendTransaction`.";
        throw new AtomicityNotSupportedError(new BaseError(message, {
          details: message
        }));
      }
      const results = [];
      for (const call of calls) {
        try {
          const value = await sendTransaction(client, {
            account,
            chain,
            data: call.data,
            to: call.to,
            value: call.value ? hexToBigInt(call.value) : void 0
          });
          results.push({ status: "fulfilled", value });
        } catch (reason) {
          results.push({ reason, status: "rejected" });
        }
        if (experimental_fallbackDelay > 0)
          await new Promise((resolve) => setTimeout(resolve, experimental_fallbackDelay));
      }
      if (results.every((r) => r.status === "rejected"))
        throw results[0].reason;
      const hashes = results.map((result) => {
        if (result.status === "fulfilled")
          return result.value;
        return fallbackTransactionErrorMagicIdentifier;
      });
      return {
        id: concat([
          ...hashes,
          numberToHex(chain.id, { size: 32 }),
          fallbackMagicIdentifier
        ])
      };
    }
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain
    });
  }
}
async function getCallsStatus(client, parameters) {
  async function getStatus(id) {
    const isTransactions = id.endsWith(fallbackMagicIdentifier.slice(2));
    if (isTransactions) {
      const chainId2 = trim(sliceHex(id, -64, -32));
      const hashes = sliceHex(id, 0, -64).slice(2).match(/.{1,64}/g);
      const receipts2 = await Promise.all(hashes.map((hash) => fallbackTransactionErrorMagicIdentifier.slice(2) !== hash ? client.request({
        method: "eth_getTransactionReceipt",
        params: [`0x${hash}`]
      }, { dedupe: true }) : void 0));
      const status2 = (() => {
        if (receipts2.some((r) => r === null))
          return 100;
        if (receipts2.every((r) => r?.status === "0x1"))
          return 200;
        if (receipts2.every((r) => r?.status === "0x0"))
          return 500;
        return 600;
      })();
      return {
        atomic: false,
        chainId: hexToNumber(chainId2),
        receipts: receipts2.filter(Boolean),
        status: status2,
        version: "2.0.0"
      };
    }
    return client.request({
      method: "wallet_getCallsStatus",
      params: [id]
    });
  }
  const { atomic = false, chainId, receipts, version = "2.0.0", ...response } = await getStatus(parameters.id);
  const [status, statusCode] = (() => {
    const statusCode2 = response.status;
    if (statusCode2 >= 100 && statusCode2 < 200)
      return ["pending", statusCode2];
    if (statusCode2 >= 200 && statusCode2 < 300)
      return ["success", statusCode2];
    if (statusCode2 >= 300 && statusCode2 < 700)
      return ["failure", statusCode2];
    if (statusCode2 === "CONFIRMED")
      return ["success", 200];
    if (statusCode2 === "PENDING")
      return ["pending", 100];
    return [void 0, statusCode2];
  })();
  return {
    ...response,
    atomic,
    // @ts-expect-error: for backwards compatibility
    chainId: chainId ? hexToNumber(chainId) : void 0,
    receipts: receipts?.map((receipt) => ({
      ...receipt,
      blockNumber: hexToBigInt(receipt.blockNumber),
      gasUsed: hexToBigInt(receipt.gasUsed),
      status: receiptStatuses[receipt.status]
    })) ?? [],
    statusCode,
    status,
    version
  };
}
async function waitForCallsStatus(client, parameters) {
  const {
    id,
    pollingInterval = client.pollingInterval,
    status = ({ statusCode }) => statusCode === 200 || statusCode >= 300,
    retryCount = 4,
    retryDelay = ({ count }) => ~~(1 << count) * 200,
    // exponential backoff
    timeout = 6e4,
    throwOnFailure = false
  } = parameters;
  const observerId = stringify(["waitForCallsStatus", client.uid, id]);
  const { promise, resolve, reject } = withResolvers();
  let timer;
  const unobserve = observe(observerId, { resolve, reject }, (emit) => {
    const unpoll = poll(async () => {
      const done = (fn) => {
        clearTimeout(timer);
        unpoll();
        fn();
        unobserve();
      };
      try {
        const result = await withRetry(async () => {
          const result2 = await getAction(client, getCallsStatus, "getCallsStatus")({ id });
          if (throwOnFailure && result2.status === "failure")
            throw new BundleFailedError(result2);
          return result2;
        }, {
          retryCount,
          delay: retryDelay
        });
        if (!status(result))
          return;
        done(() => emit.resolve(result));
      } catch (error) {
        done(() => emit.reject(error));
      }
    }, {
      interval: pollingInterval,
      emitOnBegin: true
    });
    return unpoll;
  });
  timer = timeout ? setTimeout(() => {
    unobserve();
    clearTimeout(timer);
    reject(new WaitForCallsStatusTimeoutError({ id }));
  }, timeout) : void 0;
  return await promise;
}
class WaitForCallsStatusTimeoutError extends BaseError {
  constructor({ id }) {
    super(`Timed out while waiting for call bundle with id "${id}" to be confirmed.`, { name: "WaitForCallsStatusTimeoutError" });
  }
}
class InvalidDecimalNumberError extends BaseError {
  constructor({ value }) {
    super(`Number \`${value}\` is not a valid decimal number.`, {
      name: "InvalidDecimalNumberError"
    });
  }
}
function parseUnits(value, decimals) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
    throw new InvalidDecimalNumberError({ value });
  let [integer, fraction = "0"] = value.split(".");
  const negative = integer.startsWith("-");
  if (negative)
    integer = integer.slice(1);
  fraction = fraction.replace(/(0+)$/, "");
  if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals)
    ];
    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    else
      fraction = `${left}${rounded}`;
    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }
    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }
  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}
async function addChain(client, { chain }) {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain;
  await client.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers ? Object.values(blockExplorers).map(({ url }) => url) : void 0
      }
    ]
  }, { dedupe: true, retryCount: 0 });
}
function deployContract(walletClient, parameters) {
  const { abi, args, bytecode, ...request } = parameters;
  const calldata = encodeDeployData({ abi, args, bytecode });
  return sendTransaction(walletClient, {
    ...request,
    ...request.authorizationList ? { to: null } : {},
    data: calldata
  });
}
async function getAddresses(client) {
  if (client.account?.type === "local")
    return [client.account.address];
  const addresses = await client.request({ method: "eth_accounts" }, { dedupe: true });
  return addresses.map((address) => checksumAddress(address));
}
async function getCapabilities(client, parameters = {}) {
  const { account = client.account, chainId } = parameters;
  const account_ = account ? parseAccount(account) : void 0;
  const params = chainId ? [account_?.address, [numberToHex(chainId)]] : [account_?.address];
  const capabilities_raw = await client.request({
    method: "wallet_getCapabilities",
    params
  });
  const capabilities = {};
  for (const [chainId2, capabilities_] of Object.entries(capabilities_raw)) {
    capabilities[Number(chainId2)] = {};
    for (let [key, value] of Object.entries(capabilities_)) {
      if (key === "addSubAccount")
        key = "unstable_addSubAccount";
      capabilities[Number(chainId2)][key] = value;
    }
  }
  return typeof chainId === "number" ? capabilities[chainId] : capabilities;
}
async function getPermissions(client) {
  const permissions = await client.request({ method: "wallet_getPermissions" }, { dedupe: true });
  return permissions;
}
async function prepareAuthorization(client, parameters) {
  const { account: account_ = client.account, chainId, nonce } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/prepareAuthorization"
    });
  const account = parseAccount(account_);
  const executor = (() => {
    if (!parameters.executor)
      return void 0;
    if (parameters.executor === "self")
      return parameters.executor;
    return parseAccount(parameters.executor);
  })();
  const authorization = {
    address: parameters.contractAddress ?? parameters.address,
    chainId,
    nonce
  };
  if (typeof authorization.chainId === "undefined")
    authorization.chainId = client.chain?.id ?? await getAction(client, getChainId, "getChainId")({});
  if (typeof authorization.nonce === "undefined") {
    authorization.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
      address: account.address,
      blockTag: "pending"
    });
    if (executor === "self" || executor?.address && isAddressEqual(executor.address, account.address))
      authorization.nonce += 1;
  }
  return authorization;
}
async function requestAddresses(client) {
  const addresses = await client.request({ method: "eth_requestAccounts" }, { dedupe: true, retryCount: 0 });
  return addresses.map((address) => getAddress(address));
}
async function requestPermissions(client, permissions) {
  return client.request({
    method: "wallet_requestPermissions",
    params: [permissions]
  }, { retryCount: 0 });
}
async function sendCallsSync(client, parameters) {
  const { chain = client.chain } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
  const result = await getAction(client, sendCalls, "sendCalls")(parameters);
  const status = await getAction(client, waitForCallsStatus, "waitForCallsStatus")({
    ...parameters,
    id: result.id,
    timeout
  });
  return status;
}
const supportsWalletNamespace = new LruMap(128);
async function sendTransactionSync(client, parameters) {
  const { account: account_ = client.account, assertChainId = true, chain = client.chain, accessList, authorizationList, blobs, data, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, pollingInterval, throwOnReceiptRevert, type, value, ...rest } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransactionSync"
    });
  const account = account_ ? parseAccount(account_) : null;
  let nonceManagerParameters;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (parameters.to === null)
        return void 0;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError("`to` is required. Could not infer from `authorizationList`.");
        });
      return void 0;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        if (assertChainId)
          assertCurrentChain({
            currentChainId: chainId,
            chain
          });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        accessList,
        account,
        authorizationList,
        blobs,
        chainId,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        type,
        value
      }, "sendTransaction");
      const isWalletNamespaceSupported = supportsWalletNamespace.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      const hash = await (async () => {
        try {
          return await client.request({
            method,
            params: [request]
          }, { retryCount: 0 });
        } catch (e) {
          if (isWalletNamespaceSupported === false)
            throw e;
          const error = e;
          if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
            return await client.request({
              method: "wallet_sendTransaction",
              params: [request]
            }, { retryCount: 0 }).then((hash2) => {
              supportsWalletNamespace.set(client.uid, true);
              return hash2;
            }).catch((e2) => {
              const walletNamespaceError = e2;
              if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
                supportsWalletNamespace.set(client.uid, false);
                throw error;
              }
              throw walletNamespaceError;
            });
          }
          throw error;
        }
      })();
      const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({
        checkReplacement: false,
        hash,
        pollingInterval,
        timeout
      });
      if (throwOnReceiptRevert && receipt.status === "reverted")
        throw new TransactionReceiptRevertedError({ receipt });
      return receipt;
    }
    if (account?.type === "local") {
      if (account.nonceManager && typeof nonce === "undefined") {
        const requestChainId = rest.chainId;
        const chainId = await (async () => {
          if (typeof requestChainId === "number")
            return requestChainId;
          if (chain)
            return chain.id;
          return getAction(client, getChainId, "getChainId")({});
        })();
        nonceManagerParameters = { address: account.address, chainId };
      }
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager: account.nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        type,
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const serializedTransaction = await account.signTransaction(request, {
        serializer
      });
      return await getAction(client, sendRawTransactionSync, "sendRawTransactionSync")({
        serializedTransaction,
        throwOnReceiptRevert,
        timeout: parameters.timeout
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransactionSync",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    if (nonceManagerParameters && !(err instanceof TransactionReceiptRevertedError))
      account?.nonceManager?.reset(nonceManagerParameters);
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || void 0
    });
  }
}
async function showCallsStatus(client, parameters) {
  const { id } = parameters;
  await client.request({
    method: "wallet_showCallsStatus",
    params: [id]
  });
  return;
}
async function signAuthorization$1(client, parameters) {
  const { account: account_ = client.account } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/signAuthorization"
    });
  const account = parseAccount(account_);
  if (!account.signAuthorization)
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/eip7702/signAuthorization",
      metaMessages: [
        "The `signAuthorization` Action does not support JSON-RPC Accounts."
      ],
      type: account.type
    });
  const authorization = await prepareAuthorization(client, parameters);
  return account.signAuthorization(authorization);
}
async function signMessage$1(client, { account: account_ = client.account, message }) {
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signMessage"
    });
  const account = parseAccount(account_);
  if (account.signMessage)
    return account.signMessage({ message });
  const message_ = (() => {
    if (typeof message === "string")
      return stringToHex(message);
    if (message.raw instanceof Uint8Array)
      return toHex(message.raw);
    return message.raw;
  })();
  return client.request({
    method: "personal_sign",
    params: [message_, account.address]
  }, { retryCount: 0 });
}
async function signTransaction$1(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, ...transaction } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTransaction"
    });
  const account = parseAccount(account_);
  assertRequest({
    account,
    ...parameters
  });
  const chainId = await getAction(client, getChainId, "getChainId")({});
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain
    });
  const formatters = chain?.formatters || client.chain?.formatters;
  const format = formatters?.transactionRequest?.format || formatTransactionRequest;
  if (account.signTransaction)
    return account.signTransaction({
      ...transaction,
      account,
      chainId
    }, { serializer: client.chain?.serializers?.transaction });
  return await client.request({
    method: "eth_signTransaction",
    params: [
      {
        ...format({
          ...transaction,
          account
        }, "signTransaction"),
        chainId: numberToHex(chainId),
        from: account.address
      }
    ]
  }, { retryCount: 0 });
}
async function signTypedData$1(client, parameters) {
  const { account: account_ = client.account, domain, message, primaryType } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTypedData"
    });
  const account = parseAccount(account_);
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({ domain, message, primaryType, types });
  if (account.signTypedData)
    return account.signTypedData({ domain, message, primaryType, types });
  const typedData = serializeTypedData({ domain, message, primaryType, types });
  return client.request({
    method: "eth_signTypedData_v4",
    params: [account.address, typedData]
  }, { retryCount: 0 });
}
async function switchChain(client, { id }) {
  await client.request({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: numberToHex(id)
      }
    ]
  }, { retryCount: 0 });
}
async function watchAsset(client, params) {
  const added = await client.request({
    method: "wallet_watchAsset",
    params
  }, { retryCount: 0 });
  return added;
}
async function writeContractSync(client, parameters) {
  return writeContract.internal(client, sendTransactionSync, "sendTransactionSync", parameters);
}
function walletActions(client) {
  return {
    addChain: (args) => addChain(client, args),
    deployContract: (args) => deployContract(client, args),
    fillTransaction: (args) => fillTransaction(client, args),
    getAddresses: () => getAddresses(client),
    getCallsStatus: (args) => getCallsStatus(client, args),
    getCapabilities: (args) => getCapabilities(client, args),
    getChainId: () => getChainId(client),
    getPermissions: () => getPermissions(client),
    prepareAuthorization: (args) => prepareAuthorization(client, args),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    requestAddresses: () => requestAddresses(client),
    requestPermissions: (args) => requestPermissions(client, args),
    sendCalls: (args) => sendCalls(client, args),
    sendCallsSync: (args) => sendCallsSync(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
    sendTransaction: (args) => sendTransaction(client, args),
    sendTransactionSync: (args) => sendTransactionSync(client, args),
    showCallsStatus: (args) => showCallsStatus(client, args),
    signAuthorization: (args) => signAuthorization$1(client, args),
    signMessage: (args) => signMessage$1(client, args),
    signTransaction: (args) => signTransaction$1(client, args),
    signTypedData: (args) => signTypedData$1(client, args),
    switchChain: (args) => switchChain(client, args),
    waitForCallsStatus: (args) => waitForCallsStatus(client, args),
    watchAsset: (args) => watchAsset(client, args),
    writeContract: (args) => writeContract(client, args),
    writeContractSync: (args) => writeContractSync(client, args)
  };
}
function createWalletClient(parameters) {
  const { key = "wallet", name = "Wallet Client", transport } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    transport,
    type: "walletClient"
  });
  return client.extend(walletActions);
}
function toAccount(source) {
  if (typeof source === "string") {
    if (!isAddress(source, { strict: false }))
      throw new InvalidAddressError({ address: source });
    return {
      address: source,
      type: "json-rpc"
    };
  }
  if (!isAddress(source.address, { strict: false }))
    throw new InvalidAddressError({ address: source.address });
  return {
    address: source.address,
    nonceManager: source.nonceManager,
    sign: source.sign,
    signAuthorization: source.signAuthorization,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: "custom",
    type: "local"
  };
}
let extraEntropy = false;
async function sign({ hash, privateKey, to = "object" }) {
  const { r, s, recovery } = secp256k1.sign(hash.slice(2), privateKey.slice(2), {
    lowS: true,
    extraEntropy: isHex(extraEntropy, { strict: false }) ? hexToBytes(extraEntropy) : extraEntropy
  });
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery
  };
  return (() => {
    if (to === "bytes" || to === "hex")
      return serializeSignature({ ...signature, to });
    return signature;
  })();
}
async function signAuthorization(parameters) {
  const { chainId, nonce, privateKey, to = "object" } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const signature = await sign({
    hash: hashAuthorization({ address, chainId, nonce }),
    privateKey,
    to
  });
  if (to === "object")
    return {
      address,
      chainId,
      nonce,
      ...signature
    };
  return signature;
}
async function signMessage({ message, privateKey }) {
  return await sign({ hash: hashMessage(message), privateKey, to: "hex" });
}
async function signTransaction(parameters) {
  const { privateKey, transaction, serializer = serializeTransaction } = parameters;
  const signableTransaction = (() => {
    if (transaction.type === "eip4844")
      return {
        ...transaction,
        sidecars: false
      };
    return transaction;
  })();
  const signature = await sign({
    hash: keccak256(await serializer(signableTransaction)),
    privateKey
  });
  return await serializer(transaction, signature);
}
async function signTypedData(parameters) {
  const { privateKey, ...typedData } = parameters;
  return await sign({
    hash: hashTypedData(typedData),
    privateKey,
    to: "hex"
  });
}
function privateKeyToAccount(privateKey, options = {}) {
  const { nonceManager } = options;
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false));
  const address = publicKeyToAddress(publicKey);
  const account = toAccount({
    address,
    nonceManager,
    async sign({ hash }) {
      return sign({ hash, privateKey, to: "hex" });
    },
    async signAuthorization(authorization) {
      return signAuthorization({ ...authorization, privateKey });
    },
    async signMessage({ message }) {
      return signMessage({ message, privateKey });
    },
    async signTransaction(transaction, { serializer } = {}) {
      return signTransaction({ privateKey, transaction, serializer });
    },
    async signTypedData(typedData) {
      return signTypedData({ ...typedData, privateKey });
    }
  });
  return {
    ...account,
    publicKey,
    source: "privateKey"
  };
}
const prerender = false;
const POST = async ({ request, locals }) => {
  const start = Date.now();
  const requestId = randomUUID();
  const env = locals.runtime.env;
  const db = env.DB;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const parsed = VoucherRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "validation_error", issues: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { designId, buyer } = parsed.data;
  const now = Math.floor(Date.now() / 1e3);
  const expiry = now + 900;
  let chainMs = 0;
  try {
    const reserveResult = await db.prepare(
      `UPDATE designs
         SET status = 'reserved', reserved_until = ?
         WHERE id = ?
           AND (status = 'available' OR (status = 'reserved' AND reserved_until < ?))
         RETURNING token_id, price, artist_id, ipfs_cid, selling_mode, royalty_pct`
    ).bind(expiry, designId, now).first();
    const meta = await db.prepare("SELECT changes() as c").first();
    if (!reserveResult || meta && meta.c === 0) {
      console.log(
        JSON.stringify({
          request_id: requestId,
          route: "/api/voucher",
          status: 409,
          duration_ms: Date.now() - start,
          reason: "not_available"
        })
      );
      return new Response(JSON.stringify({ error: "not_available" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { token_id: tokenId, price, ipfs_cid, artist_id: artistId, selling_mode, royalty_pct } = reserveResult;
    const artistRow = await db.prepare("SELECT wallet_address FROM artists WHERE id = ?").bind(artistId).first();
    if (!artistRow?.wallet_address) {
      console.log(
        JSON.stringify({
          request_id: requestId,
          route: "/api/voucher",
          status: 500,
          duration_ms: Date.now() - start,
          reason: "artist_has_no_wallet",
          artist_id: artistId
        })
      );
      await db.prepare("UPDATE designs SET status = 'available', reserved_until = NULL WHERE id = ?").bind(designId).run();
      return new Response(JSON.stringify({ error: "artist_has_no_wallet" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const publicClient = getChainClient(env);
    if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
      try {
        const chainStart = Date.now();
        const owner = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "ownerOf",
          args: [BigInt(tokenId)]
        });
        chainMs = Date.now() - chainStart;
        if (owner && owner !== zeroAddress) {
          await db.prepare("UPDATE designs SET status = 'sold' WHERE id = ?").bind(designId).run();
          console.log(
            JSON.stringify({
              request_id: requestId,
              route: "/api/voucher",
              status: 409,
              duration_ms: Date.now() - start,
              chain_call_ms: chainMs,
              reason: "already_minted_on_chain"
            })
          );
          return new Response(JSON.stringify({ error: "not_available" }), {
            status: 409,
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch {
      }
    }
    const cid = ipfs_cid ?? "";
    const cidHash = keccak256(toBytes(cid));
    const artistTreasury = artistRow.wallet_address;
    const isSoulbound = selling_mode === "one-time";
    const royaltyBps = !isSoulbound && royalty_pct ? Math.round(royalty_pct * 100) : 0;
    const voucher = {
      tokenId: BigInt(tokenId),
      designId,
      price: parseUnits(String(price), 18),
      artistTreasury,
      expiry: BigInt(expiry),
      buyer,
      cidHash,
      soulbound: isSoulbound,
      royaltyBps
    };
    const signerPrivKey = env.SIGNER_PRIVATE_KEY;
    const account = privateKeyToAccount(
      signerPrivKey.startsWith("0x") ? signerPrivKey : `0x${signerPrivKey}`
    );
    const walletClient = createWalletClient({
      account,
      chain: bscTestnet,
      transport: http(env.BSC_RPC_PRIMARY)
    });
    const signature = await walletClient.signTypedData({
      domain: {
        name: "SAKNID",
        version: "1",
        chainId: CHAIN_ID,
        verifyingContract: CONTRACT_ADDRESS
      },
      types: {
        LazyMintVoucher: [
          { name: "tokenId", type: "uint256" },
          { name: "designId", type: "string" },
          { name: "price", type: "uint256" },
          { name: "artistTreasury", type: "address" },
          { name: "expiry", type: "uint256" },
          { name: "buyer", type: "address" },
          { name: "cidHash", type: "bytes32" },
          { name: "soulbound", type: "bool" },
          { name: "royaltyBps", type: "uint96" }
        ]
      },
      primaryType: "LazyMintVoucher",
      message: voucher
    });
    const responseVoucher = {
      tokenId: voucher.tokenId.toString(),
      designId: voucher.designId,
      price: voucher.price.toString(),
      artistTreasury: voucher.artistTreasury,
      expiry: voucher.expiry.toString(),
      buyer: voucher.buyer,
      cidHash: voucher.cidHash,
      soulbound: voucher.soulbound,
      royaltyBps: voucher.royaltyBps
    };
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/voucher",
        status: 200,
        duration_ms: Date.now() - start,
        chain_call_ms: chainMs,
        d1_query_ms: 0
      })
    );
    return new Response(JSON.stringify({ voucher: responseVoucher, signature, cid }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.log(
      JSON.stringify({
        request_id: requestId,
        route: "/api/voucher",
        status: 500,
        duration_ms: Date.now() - start,
        error: String(err)
      })
    );
    return new Response(JSON.stringify({ error: "internal_server_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  a as renderers
};
