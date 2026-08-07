globalThis.process ??= {};
globalThis.process.env ??= {};
import { d as defineChain, e as extendSchema } from "./bscTestnet_BdMT0G5N.mjs";
import { b } from "./bscTestnet_BdMT0G5N.mjs";
import { R as hexToBytes, t as toHex$1, h as hexToBigInt, e as hexToNumber$1, B as BaseError$1, i as isAddress, I as InvalidAddressError, S as toBytes$2, a1 as pad, Q as trim, P as numberToHex$1, k as keccak256$1 } from "./isAddress_CvPYbxIx.mjs";
import { P as create, Q as isEqual, R as toBytes$1, S as from$8, T as fromPublicKey, U as defineTransactionReceipt, w as formatLog, V as defineTransaction, W as defineBlock, t as toRlp, X as sha256, A as formatTransaction$1, Y as toHex$2, Z as sha256$2, _ as keccak256, $ as from$9, a0 as validate, a1 as fromHex$2, a2 as assert$2, a3 as fromRpc$5, a4 as toHex$3, a5 as toRpc$5, a6 as checksum, a7 as assert$4, H as getSelector, a8 as extract$1, a9 as fromRpcList$1, aa as yParityToV, ab as toRpcList$1, ac as validate$1, ad as from$a, ae as toTuple$3, af as fromTuple$3, f as getTransactionType, ag as fromHex$3, p as parseEventLogs, y as formatTransactionReceipt$1, z as getCode, J as verifyHash$1 } from "./verifyHash_CGN_bz2z.mjs";
import { aV as InvalidLengthError, a8 as fromHex$1, a3 as fromBytes, aa as BaseError, a2 as from$6, ad as from$7, aW as maxUint16, aX as defineTransactionRequest, v as InvalidChainIdError$1, w as maxUint256, n as assertRequest, p as formatTransactionRequest$1, q as extract, aK as getCallError, ap as fromString, aY as isEqual$1, ae as fromString$1, aZ as concat, a6 as concat$1, ac as slice, at as toNumber, al as padLeft, a7 as fromNumber, a_ as toBigInt, a5 as size, a$ as toString, ab as stringify, b0 as assert$3, b1 as random, as as trimLeft, a4 as validate$2, r as encodeFunctionData, D as readContract, o as getAction } from "./readContract_C8ppk_Ev.mjs";
import { a as concatHex, i as isAddressEqual } from "./isAddressEqual_cc58LofG.mjs";
import { c as serializeTransaction$3, d as serializeAccessList, t as toYParitySignatureArray, A as AccountNotFoundError, s as sendTransaction, w as writeContract } from "./serializeAuthorizationList_BX8v-c1f.mjs";
import { F as FeeCapTooHighError$1, T as TipAboveFeeCapError$1, p as parseAccount } from "./createBatchScheduler_DvXUs0rZ.mjs";
import { s as secp256k1, c as createCurve, F as Field, a as sha256$1, b as sha384, d as sha512 } from "./secp256k1_CT1iL2OC.mjs";
function toHex(value) {
  return to(value, "Hex");
}
function to(value, to2) {
  const to_ = to2;
  const bytes = (() => {
    if (typeof value === "string") {
      if (value.length > 3 && value.length % 2 !== 0)
        throw new InvalidLengthError(value);
      return fromHex$1(value);
    }
    return value;
  })();
  const cursor = create(bytes, {
    recursiveReadLimit: Number.POSITIVE_INFINITY
  });
  const result = decodeRlpCursor(cursor, to_);
  return result;
}
function decodeRlpCursor(cursor, to2 = "Hex") {
  if (cursor.bytes.length === 0)
    return to2 === "Hex" ? fromBytes(cursor.bytes) : cursor.bytes;
  const prefix = cursor.readByte();
  if (prefix < 128)
    cursor.decrementPosition(1);
  if (prefix < 192) {
    const length2 = readLength(cursor, prefix, 128);
    const bytes = cursor.readBytes(length2);
    return to2 === "Hex" ? fromBytes(bytes) : bytes;
  }
  const length = readLength(cursor, prefix, 192);
  return readList(cursor, length, to2);
}
function readLength(cursor, prefix, offset) {
  if (offset === 128 && prefix < 128)
    return 1;
  if (prefix <= offset + 55)
    return prefix - offset;
  if (prefix === offset + 55 + 1)
    return cursor.readUint8();
  if (prefix === offset + 55 + 2)
    return cursor.readUint16();
  if (prefix === offset + 55 + 3)
    return cursor.readUint24();
  if (prefix === offset + 55 + 4)
    return cursor.readUint32();
  throw new BaseError("Invalid RLP prefix");
}
function readList(cursor, length, to2) {
  const position = cursor.position;
  const value = [];
  while (cursor.position - position < length)
    value.push(decodeRlpCursor(cursor, to2));
  return value;
}
function from$5(value, options) {
  const { as } = options;
  const encodable = getEncodable(value);
  const cursor = create(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (as === "Hex")
    return fromBytes(cursor.bytes);
  return cursor.bytes;
}
function fromHex(hex, options = {}) {
  const { as = "Hex" } = options;
  return from$5(hex, { as });
}
function getEncodable(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)));
  return getEncodableBytes(bytes);
}
function getEncodableList(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode } of list) {
        encode(cursor);
      }
    }
  };
}
function getEncodableBytes(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? fromHex$1(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength(length) {
  if (length <= 255)
    return 1;
  if (length <= 65535)
    return 2;
  if (length <= 16777215)
    return 3;
  if (length <= 4294967295)
    return 4;
  throw new BaseError("Length is too large.");
}
function recoverAddress(options) {
  return fromPublicKey(recoverPublicKey(options));
}
function recoverPublicKey(options) {
  const { payload, signature } = options;
  const { r, s, yParity } = signature;
  const signature_ = new secp256k1.Signature(BigInt(r), BigInt(s)).addRecoveryBit(yParity);
  const point = signature_.recoverPublicKey(from$7(payload).substring(2));
  return from$8(point);
}
function verify$4(options) {
  const { hash: hash2, payload } = options;
  if (options.address)
    return isEqual(options.address, recoverAddress({ payload, signature: options.signature }));
  return secp256k1.verify(options.signature, from$6(payload), toBytes$1(options.publicKey), ...hash2 ? [{ prehash: true, lowS: true }] : []);
}
const zeroG = /* @__PURE__ */ defineChain({
  id: 16600,
  name: "0G Newton Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "0G BlockChain Explorer",
      url: "https://chainscan-newton.0g.ai"
    }
  },
  testnet: true
});
const zeroGGalileoTestnet = /* @__PURE__ */ defineChain({
  id: 16601,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "0G BlockChain Explorer",
      url: "https://chainscan-galileo.0g.ai"
    }
  },
  testnet: true
});
const zeroGMainnet = /* @__PURE__ */ defineChain({
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evmrpc.0g.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "0G BlockChain Explorer",
      url: "https://chainscan.0g.ai"
    }
  },
  testnet: false
});
const zeroGTestnet = /* @__PURE__ */ defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "0G BlockChain Explorer",
      url: "https://chainscan-galileo.0g.ai"
    }
  },
  testnet: true
});
const fireChain = /* @__PURE__ */ defineChain({
  id: 995,
  name: "5ireChain",
  nativeCurrency: { name: "5ire Token", symbol: "5IRE", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.5ire.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "5ireChain Mainnet Explorer",
      url: "https://5irescan.io/"
    }
  },
  testnet: false
});
const abey = /* @__PURE__ */ defineChain({
  id: 179,
  name: "ABEY Mainnet",
  nativeCurrency: { name: "ABEY", symbol: "ABEY", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.abeychain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Abey Scan",
      url: "https://abeyscan.com"
    }
  },
  testnet: false
});
const gasPerPubdataDefault = 50000n;
const maxBytecodeSize = maxUint16 * 32n;
const formatters$2 = {
  block: /* @__PURE__ */ defineBlock({
    format(args) {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === "string")
          return transaction;
        const formatted = formatters$2.transaction?.format(transaction);
        if (formatted.typeHex === "0x71")
          formatted.type = "eip712";
        else if (formatted.typeHex === "0xff")
          formatted.type = "priority";
        return formatted;
      });
      return {
        l1BatchNumber: args.l1BatchNumber ? hexToBigInt(args.l1BatchNumber) : null,
        l1BatchTimestamp: args.l1BatchTimestamp ? hexToBigInt(args.l1BatchTimestamp) : null,
        transactions
      };
    }
  }),
  transaction: /* @__PURE__ */ defineTransaction({
    format(args) {
      const transaction = {};
      if (args.type === "0x71")
        transaction.type = "eip712";
      else if (args.type === "0xff")
        transaction.type = "priority";
      return {
        ...transaction,
        l1BatchNumber: args.l1BatchNumber ? hexToBigInt(args.l1BatchNumber) : null,
        l1BatchTxIndex: args.l1BatchTxIndex ? hexToBigInt(args.l1BatchTxIndex) : null
      };
    }
  }),
  transactionReceipt: /* @__PURE__ */ defineTransactionReceipt({
    format(args) {
      return {
        l1BatchNumber: args.l1BatchNumber ? hexToBigInt(args.l1BatchNumber) : null,
        l1BatchTxIndex: args.l1BatchTxIndex ? hexToBigInt(args.l1BatchTxIndex) : null,
        logs: args.logs.map((log) => {
          return {
            ...formatLog(log),
            l1BatchNumber: log.l1BatchNumber ? hexToBigInt(log.l1BatchNumber) : null,
            transactionLogIndex: hexToNumber$1(log.transactionLogIndex),
            logType: log.logType
          };
        }),
        l2ToL1Logs: args.l2ToL1Logs.map((l2ToL1Log) => {
          return {
            blockNumber: hexToBigInt(l2ToL1Log.blockHash),
            blockHash: l2ToL1Log.blockHash,
            l1BatchNumber: l2ToL1Log.l1BatchNumber ? hexToBigInt(l2ToL1Log.l1BatchNumber) : null,
            transactionIndex: hexToBigInt(l2ToL1Log.transactionIndex),
            shardId: hexToBigInt(l2ToL1Log.shardId),
            isService: l2ToL1Log.isService,
            sender: l2ToL1Log.sender,
            key: l2ToL1Log.key,
            value: l2ToL1Log.value,
            transactionHash: l2ToL1Log.transactionHash,
            logIndex: hexToBigInt(l2ToL1Log.logIndex)
          };
        })
      };
    }
  }),
  transactionRequest: /* @__PURE__ */ defineTransactionRequest({
    exclude: [
      "customSignature",
      "factoryDeps",
      "gasPerPubdata",
      "paymaster",
      "paymasterInput"
    ],
    format(args) {
      if (args.gasPerPubdata || args.paymaster && args.paymasterInput || args.factoryDeps || args.customSignature)
        return {
          eip712Meta: {
            ...args.gasPerPubdata ? { gasPerPubdata: toHex$1(args.gasPerPubdata) } : { gasPerPubdata: toHex$1(gasPerPubdataDefault) },
            ...args.paymaster && args.paymasterInput ? {
              paymasterParams: {
                paymaster: args.paymaster,
                paymasterInput: Array.from(hexToBytes(args.paymasterInput))
              }
            } : {},
            ...args.factoryDeps ? {
              factoryDeps: args.factoryDeps.map((dep) => Array.from(hexToBytes(dep)))
            } : {},
            ...args.customSignature ? {
              customSignature: Array.from(hexToBytes(args.customSignature))
            } : {}
          },
          type: "0x71"
        };
      return {};
    }
  })
};
class InvalidEip712TransactionError extends BaseError$1 {
  constructor() {
    super([
      "Transaction is not an EIP712 transaction.",
      "",
      "Transaction must:",
      '  - include `type: "eip712"`',
      "  - include one of the following: `customSignature`, `paymaster`, `paymasterInput`, `gasPerPubdata`, `factoryDeps`"
    ].join("\n"), { name: "InvalidEip712TransactionError" });
  }
}
function isEIP712Transaction(transaction) {
  if (transaction.type === "eip712")
    return true;
  if ("customSignature" in transaction && transaction.customSignature || "paymaster" in transaction && transaction.paymaster || "paymasterInput" in transaction && transaction.paymasterInput || "gasPerPubdata" in transaction && typeof transaction.gasPerPubdata === "bigint" || "factoryDeps" in transaction && transaction.factoryDeps)
    return true;
  return false;
}
function assertEip712Transaction(transaction) {
  const { chainId, to: to2, from: from2, paymaster, paymasterInput } = transaction;
  if (!isEIP712Transaction(transaction))
    throw new InvalidEip712TransactionError();
  if (!chainId || chainId <= 0)
    throw new InvalidChainIdError$1({ chainId });
  if (to2 && !isAddress(to2))
    throw new InvalidAddressError({ address: to2 });
  if (from2 && !isAddress(from2))
    throw new InvalidAddressError({ address: from2 });
  if (paymaster && !isAddress(paymaster))
    throw new InvalidAddressError({ address: paymaster });
  if (paymaster && !paymasterInput) {
    throw new BaseError$1("`paymasterInput` must be provided when `paymaster` is defined");
  }
  if (!paymaster && paymasterInput) {
    throw new BaseError$1("`paymaster` must be provided when `paymasterInput` is defined");
  }
}
function serializeTransaction$2(transaction, signature) {
  if (isEIP712Transaction(transaction))
    return serializeTransactionEIP712(transaction);
  return serializeTransaction$3(transaction, signature);
}
const serializers$2 = {
  transaction: serializeTransaction$2
};
function serializeTransactionEIP712(transaction) {
  const { chainId, gas, nonce: nonce2, to: to2, from: from2, value, maxFeePerGas, maxPriorityFeePerGas, customSignature, factoryDeps, paymaster, paymasterInput, gasPerPubdata, data } = transaction;
  assertEip712Transaction(transaction);
  const serializedTransaction = [
    nonce2 ? toHex$1(nonce2) : "0x",
    maxPriorityFeePerGas ? toHex$1(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? toHex$1(maxFeePerGas) : "0x",
    gas ? toHex$1(gas) : "0x",
    to2 ?? "0x",
    value ? toHex$1(value) : "0x",
    data ?? "0x",
    toHex$1(chainId),
    toHex$1(""),
    toHex$1(""),
    toHex$1(chainId),
    from2 ?? "0x",
    gasPerPubdata ? toHex$1(gasPerPubdata) : toHex$1(gasPerPubdataDefault),
    factoryDeps ?? [],
    customSignature ?? "0x",
    // EIP712 signature
    paymaster && paymasterInput ? [paymaster, paymasterInput] : []
  ];
  return concatHex([
    "0x71",
    toRlp(serializedTransaction)
  ]);
}
class BytecodeLengthExceedsMaxSizeError extends BaseError$1 {
  constructor({ givenLength, maxBytecodeSize: maxBytecodeSize2 }) {
    super(`Bytecode cannot be longer than ${maxBytecodeSize2} bytes. Given length: ${givenLength}`, { name: "BytecodeLengthExceedsMaxSizeError" });
  }
}
class BytecodeLengthInWordsMustBeOddError extends BaseError$1 {
  constructor({ givenLengthInWords }) {
    super(`Bytecode length in 32-byte words must be odd. Given length in words: ${givenLengthInWords}`, { name: "BytecodeLengthInWordsMustBeOddError" });
  }
}
class BytecodeLengthMustBeDivisibleBy32Error extends BaseError$1 {
  constructor({ givenLength }) {
    super(`The bytecode length in bytes must be divisible by 32. Given length: ${givenLength}`, { name: "BytecodeLengthMustBeDivisibleBy32Error" });
  }
}
function hashBytecode(bytecode) {
  const bytecodeBytes = toBytes$2(bytecode);
  if (bytecodeBytes.length % 32 !== 0)
    throw new BytecodeLengthMustBeDivisibleBy32Error({
      givenLength: bytecodeBytes.length
    });
  if (bytecodeBytes.length > maxBytecodeSize)
    throw new BytecodeLengthExceedsMaxSizeError({
      givenLength: bytecodeBytes.length,
      maxBytecodeSize
    });
  const hashStr = sha256(bytecodeBytes);
  const hash2 = toBytes$2(hashStr);
  const bytecodeLengthInWords = bytecodeBytes.length / 32;
  if (bytecodeLengthInWords % 2 === 0) {
    throw new BytecodeLengthInWordsMustBeOddError({
      givenLengthInWords: bytecodeLengthInWords
    });
  }
  const bytecodeLength = toBytes$2(bytecodeLengthInWords);
  const bytecodeLengthPadded = pad(bytecodeLength, { size: 2 });
  const codeHashVersion = new Uint8Array([1, 0]);
  hash2.set(codeHashVersion, 0);
  hash2.set(bytecodeLengthPadded, 2);
  return hash2;
}
const getEip712Domain = (transaction) => {
  assertEip712Transaction(transaction);
  const message = transactionToMessage(transaction);
  return {
    domain: {
      name: "zkSync",
      version: "2",
      chainId: transaction.chainId
    },
    types: {
      Transaction: [
        { name: "txType", type: "uint256" },
        { name: "from", type: "uint256" },
        { name: "to", type: "uint256" },
        { name: "gasLimit", type: "uint256" },
        { name: "gasPerPubdataByteLimit", type: "uint256" },
        { name: "maxFeePerGas", type: "uint256" },
        { name: "maxPriorityFeePerGas", type: "uint256" },
        { name: "paymaster", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "factoryDeps", type: "bytes32[]" },
        { name: "paymasterInput", type: "bytes" }
      ]
    },
    primaryType: "Transaction",
    message
  };
};
function transactionToMessage(transaction) {
  const { gas, nonce: nonce2, to: to2, from: from2, value, maxFeePerGas, maxPriorityFeePerGas, factoryDeps, paymaster, paymasterInput, gasPerPubdata, data } = transaction;
  return {
    txType: 113n,
    from: BigInt(from2),
    to: to2 ? BigInt(to2) : 0n,
    gasLimit: gas ?? 0n,
    gasPerPubdataByteLimit: gasPerPubdata ?? gasPerPubdataDefault,
    maxFeePerGas: maxFeePerGas ?? 0n,
    maxPriorityFeePerGas: maxPriorityFeePerGas ?? 0n,
    paymaster: paymaster ? BigInt(paymaster) : 0n,
    nonce: nonce2 ? BigInt(nonce2) : 0n,
    value: value ?? 0n,
    data: data ?? "0x",
    factoryDeps: factoryDeps?.map((dep) => toHex$1(hashBytecode(dep))) ?? [],
    paymasterInput: paymasterInput ? paymasterInput : "0x"
  };
}
const chainConfig$4 = {
  blockTime: 1e3,
  formatters: formatters$2,
  serializers: serializers$2,
  custom: {
    getEip712Domain
  }
};
const abstract = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  blockTime: 200,
  id: 2741,
  name: "Abstract",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://api.mainnet.abs.xyz"],
      webSocket: ["wss://api.mainnet.abs.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://abscan.org"
    },
    native: {
      name: "Abstract Explorer",
      url: "https://explorer.mainnet.abs.xyz"
    }
  },
  contracts: {
    multicall3: {
      address: "0xAa4De41dba0Ca5dCBb288b7cC6b708F3aaC759E7",
      blockCreated: 5288
    },
    erc6492Verifier: {
      address: "0xfB688330379976DA81eB64Fe4BF50d7401763B9C",
      blockCreated: 5263
    }
  }
});
const abstractTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  blockTime: 200,
  id: 11124,
  name: "Abstract Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://api.testnet.abs.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.abscan.org"
    },
    native: {
      name: "Abstract Explorer",
      url: "https://explorer.testnet.abs.xyz"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xF9cda624FBC7e059355ce98a31693d299FACd963",
      blockCreated: 358349
    },
    erc6492Verifier: {
      address: "0xfB688330379976DA81eB64Fe4BF50d7401763B9C",
      blockCreated: 431682
    }
  }
});
const acala = /* @__PURE__ */ defineChain({
  id: 787,
  name: "Acala",
  network: "acala",
  nativeCurrency: {
    name: "Acala",
    symbol: "ACA",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://eth-rpc-acala.aca-api.network"],
      webSocket: ["wss://eth-rpc-acala.aca-api.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Acala Blockscout",
      url: "https://blockscout.acala.network",
      apiUrl: "https://blockscout.acala.network/api"
    }
  },
  testnet: false
});
const acria = /* @__PURE__ */ defineChain({
  id: 47,
  name: "Acria IntelliChain",
  nativeCurrency: {
    decimals: 18,
    name: "ACRIA",
    symbol: "ACRIA"
  },
  rpcUrls: {
    default: {
      http: ["https://aic.acria.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "Acria Explorer",
      url: "https://explorer.acria.ai"
    }
  },
  testnet: false
});
const adf = /* @__PURE__ */ defineChain({
  id: 1215,
  name: "ADF Chain",
  nativeCurrency: { name: "ADDFILL", symbol: "ADF", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.adftechnology.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "ADF Mainnet Explorer",
      url: "https://explorer.adftechnology.com"
    }
  },
  testnet: false
});
const adi = /* @__PURE__ */ defineChain({
  id: 36900,
  name: "ADI_Chain",
  nativeCurrency: {
    decimals: 18,
    name: "ADI",
    symbol: "ADI"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.adifoundation.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "ADI Explorer",
      url: "https://explorer.adifoundation.ai"
    }
  },
  testnet: false
});
const agungTestnet = /* @__PURE__ */ defineChain({
  id: 9990,
  name: "Agung Network",
  nativeCurrency: {
    decimals: 18,
    name: "Agung",
    symbol: "AGNG"
  },
  rpcUrls: {
    default: {
      http: ["https://wss-async.agung.peaq.network"],
      webSocket: ["wss://wss-async.agung.peaq.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://agung-testnet.subscan.io"
    }
  },
  testnet: true
});
const aioz = /* @__PURE__ */ defineChain({
  id: 168,
  name: "AIOZ Network",
  nativeCurrency: {
    decimals: 18,
    name: "AIOZ",
    symbol: "AIOZ"
  },
  rpcUrls: {
    default: {
      http: ["https://eth-dataseed.aioz.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "AIOZ Explorer",
      url: "https://explorer.aioz.network"
    }
  },
  testnet: false
});
const alephZero = /* @__PURE__ */ defineChain({
  id: 41455,
  name: "Aleph Zero",
  nativeCurrency: { name: "Aleph Zero", symbol: "AZERO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.alephzero.raas.gelato.cloud"]
    }
  },
  blockExplorers: {
    default: {
      name: "Aleph Zero EVM Explorer",
      url: "https://evm-explorer.alephzero.org",
      apiUrl: "https://evm-explorer.alephzero.org/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 4603377
    }
  }
});
const alephZeroTestnet = /* @__PURE__ */ defineChain({
  id: 2039,
  name: "Aleph Zero Testnet",
  nativeCurrency: { name: "TZERO", symbol: "TZERO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.alephzero-testnet.gelato.digital"],
      webSocket: ["wss://ws.alephzero-testnet.gelato.digital"]
    }
  },
  blockExplorers: {
    default: {
      name: "Aleph Zero EVM Testnet explorer",
      url: "https://evm-explorer-testnet.alephzero.org",
      apiUrl: "https://evm-explorer-testnet.alephzero.org/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 2861745
    }
  },
  testnet: true
});
const alienx = /* @__PURE__ */ defineChain({
  id: 10241024,
  name: "AlienX Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.alienxchain.io/http"] }
  },
  blockExplorers: {
    default: {
      name: "AlienX Explorer",
      url: "https://explorer.alienxchain.io"
    }
  },
  testnet: false
});
const alienxHalTestnet = /* @__PURE__ */ defineChain({
  id: 10241025,
  name: "ALIENX Hal Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://hal-rpc.alienxchain.io/http"] }
  },
  blockExplorers: {
    default: {
      name: "AlienX Explorer",
      url: "https://hal-explorer.alienxchain.io"
    }
  },
  testnet: true
});
const alpenTestnet = /* @__PURE__ */ defineChain({
  id: 8150,
  name: "Alpen Testnet",
  nativeCurrency: { name: "Signet BTC", symbol: "sBTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.alpenlabs.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Alpen Explorer",
      url: "https://explorer.testnet.alpenlabs.io",
      apiUrl: "https://explorer.testnet.alpenlabs.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 290408
    }
  },
  testnet: true
});
const contracts = {
  gasPriceOracle: { address: "0x420000000000000000000000000000000000000F" },
  l1Block: { address: "0x4200000000000000000000000000000000000015" },
  l2CrossDomainMessenger: {
    address: "0x4200000000000000000000000000000000000007"
  },
  l2Erc721Bridge: { address: "0x4200000000000000000000000000000000000014" },
  l2StandardBridge: { address: "0x4200000000000000000000000000000000000010" },
  l2ToL1MessagePasser: {
    address: "0x4200000000000000000000000000000000000016"
  }
};
const formatters$1 = {
  block: /* @__PURE__ */ defineBlock({
    format(args) {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === "string")
          return transaction;
        const formatted = formatTransaction$1(transaction);
        if (formatted.typeHex === "0x7e") {
          formatted.isSystemTx = transaction.isSystemTx;
          formatted.mint = transaction.mint ? hexToBigInt(transaction.mint) : void 0;
          formatted.sourceHash = transaction.sourceHash;
          formatted.type = "deposit";
        }
        return formatted;
      });
      return {
        transactions,
        stateRoot: args.stateRoot
      };
    }
  }),
  transaction: /* @__PURE__ */ defineTransaction({
    format(args) {
      const transaction = {};
      if (args.type === "0x7e") {
        transaction.isSystemTx = args.isSystemTx;
        transaction.mint = args.mint ? hexToBigInt(args.mint) : void 0;
        transaction.sourceHash = args.sourceHash;
        transaction.type = "deposit";
      }
      return transaction;
    }
  }),
  transactionReceipt: /* @__PURE__ */ defineTransactionReceipt({
    format(args) {
      return {
        l1GasPrice: args.l1GasPrice ? hexToBigInt(args.l1GasPrice) : null,
        l1GasUsed: args.l1GasUsed ? hexToBigInt(args.l1GasUsed) : null,
        l1Fee: args.l1Fee ? hexToBigInt(args.l1Fee) : null,
        l1FeeScalar: args.l1FeeScalar ? Number(args.l1FeeScalar) : null
      };
    }
  })
};
function serializeTransaction$1(transaction, signature) {
  if (isDeposit(transaction))
    return serializeTransactionDeposit(transaction);
  return serializeTransaction$3(transaction, signature);
}
const serializers$1 = {
  transaction: serializeTransaction$1
};
function serializeTransactionDeposit(transaction) {
  assertTransactionDeposit(transaction);
  const { sourceHash, data, from: from2, gas, isSystemTx, mint: mint2, to: to2, value } = transaction;
  const serializedTransaction = [
    sourceHash,
    from2,
    to2 ?? "0x",
    mint2 ? toHex$1(mint2) : "0x",
    value ? toHex$1(value) : "0x",
    gas ? toHex$1(gas) : "0x",
    isSystemTx ? "0x1" : "0x",
    data ?? "0x"
  ];
  return concatHex([
    "0x7e",
    toRlp(serializedTransaction)
  ]);
}
function isDeposit(transaction) {
  if (transaction.type === "deposit")
    return true;
  if (typeof transaction.sourceHash !== "undefined")
    return true;
  return false;
}
function assertTransactionDeposit(transaction) {
  const { from: from2, to: to2 } = transaction;
  if (from2 && !isAddress(from2))
    throw new InvalidAddressError({ address: from2 });
  if (to2 && !isAddress(to2))
    throw new InvalidAddressError({ address: to2 });
}
const chainConfig$3 = {
  blockTime: 2e3,
  contracts,
  formatters: formatters$1,
  serializers: serializers$1
};
const sourceId$14 = 1;
const ancient8 = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 888888888,
  name: "Ancient8",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.ancient8.gg"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ancient8 explorer",
      url: "https://scan.ancient8.gg",
      apiUrl: "https://scan.ancient8.gg/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$14]: {
        address: "0xB09DC08428C8b4EFB4ff9C0827386CDF34277996"
      }
    },
    portal: {
      [sourceId$14]: {
        address: "0x639F2AECE398Aa76b07e59eF6abe2cFe32bacb68",
        blockCreated: 19070571
      }
    },
    l1StandardBridge: {
      [sourceId$14]: {
        address: "0xd5e3eDf5b68135D559D572E26bF863FBC1950033",
        blockCreated: 19070571
      }
    }
  },
  sourceId: sourceId$14
});
const sourceId$13 = 11155111;
const ancient8Sepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 28122024,
  name: "Ancient8 Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpcv2-testnet.ancient8.gg"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ancient8 Celestia Testnet explorer",
      url: "https://scanv2-testnet.ancient8.gg",
      apiUrl: "https://scanv2-testnet.ancient8.gg/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$13]: {
        address: "0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB"
      }
    },
    portal: {
      [sourceId$13]: {
        address: "0xfa1d9E26A6aCD7b22115D27572c1221B9803c960",
        blockCreated: 4972908
      }
    },
    l1StandardBridge: {
      [sourceId$13]: {
        address: "0xF6Bc0146d3c74D48306e79Ae134A260E418C9335",
        blockCreated: 4972908
      }
    }
  },
  sourceId: sourceId$13,
  testnet: true
});
const anvil = /* @__PURE__ */ defineChain({
  id: 31337,
  name: "Anvil",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"]
    }
  }
});
const sourceId$12 = 42161;
const apeChain = /* @__PURE__ */ defineChain({
  id: 33139,
  name: "ApeChain",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.apechain.com/http"],
      webSocket: ["wss://rpc.apechain.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Apescan",
      url: "https://apescan.io",
      apiUrl: "https://api.apescan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 20889
    }
  },
  sourceId: sourceId$12
});
const apexTestnet = /* @__PURE__ */ defineChain({
  id: 3993,
  name: "APEX Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.apexlayer.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://exp-testnet.apexlayer.xyz",
      apiUrl: "https://exp-testnet.apexlayer.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xf7642be33a6b18D16a995657adb5a68CD0438aE2",
      blockCreated: 283775
    }
  },
  testnet: true
});
const apollo = /* @__PURE__ */ defineChain({
  id: 62606,
  name: "Apollo",
  nativeCurrency: {
    decimals: 18,
    name: "Apollo",
    symbol: "APOLLO"
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.apolloscan.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Apollo Explorer",
      url: "https://apolloscan.io"
    }
  }
});
const arbitrum = /* @__PURE__ */ defineChain({
  id: 42161,
  name: "Arbitrum One",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockTime: 250,
  rpcUrls: {
    default: {
      http: ["https://arb1.arbitrum.io/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://arbiscan.io",
      apiUrl: "https://api.arbiscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 7654707
    }
  }
});
const arbitrumGoerli = /* @__PURE__ */ defineChain({
  id: 421613,
  name: "Arbitrum Goerli",
  nativeCurrency: {
    name: "Arbitrum Goerli Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://goerli-rollup.arbitrum.io/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://goerli.arbiscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 88114
    }
  },
  testnet: true
});
const arbitrumNova = /* @__PURE__ */ defineChain({
  id: 42170,
  name: "Arbitrum Nova",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://nova.arbitrum.io/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://nova.arbiscan.io",
      apiUrl: "https://api-nova.arbiscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1746963
    }
  }
});
const arbitrumSepolia = /* @__PURE__ */ defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  blockTime: 250,
  nativeCurrency: {
    name: "Arbitrum Sepolia Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rollup.arbitrum.io/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io",
      apiUrl: "https://api-sepolia.arbiscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 81930
    }
  },
  testnet: true
});
const arc = /* @__PURE__ */ defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: []
    }
  }
});
const arcTestnet = /* @__PURE__ */ defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.testnet.arc.network",
        "https://rpc.quicknode.testnet.arc.network",
        "https://rpc.blockdaemon.testnet.arc.network"
      ],
      webSocket: [
        "wss://rpc.testnet.arc.network",
        "wss://rpc.quicknode.testnet.arc.network"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
      apiUrl: "https://testnet.arcscan.app/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  },
  testnet: true
});
const arenaz = /* @__PURE__ */ defineChain({
  id: 7897,
  name: "Arena-Z",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.arena-z.gg"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arena-Z Explorer",
      url: "https://explorer.arena-z.gg",
      apiUrl: "https://explorer.arena-z.gg"
    }
  }
});
const areonNetwork = /* @__PURE__ */ defineChain({
  id: 463,
  name: "Areon Network",
  nativeCurrency: { decimals: 18, name: "AREA", symbol: "AREA" },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.areon.network"],
      webSocket: ["wss://mainnet-ws.areon.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Areonscan",
      url: "https://areonscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 353286
    }
  },
  testnet: false
});
const areonNetworkTestnet = /* @__PURE__ */ defineChain({
  id: 462,
  name: "Areon Network Testnet",
  nativeCurrency: { decimals: 18, name: "TAREA", symbol: "TAREA" },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.areon.network"],
      webSocket: ["wss://testnet-ws.areon.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Areonscan",
      url: "https://areonscan.com"
    }
  },
  testnet: true
});
const areum = /* @__PURE__ */ defineChain({
  id: 463,
  name: "Areum",
  nativeCurrency: { decimals: 18, name: "AREA", symbol: "AREA" },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.areum.network"],
      webSocket: ["wss://mainnet-ws.areum.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Areum Explorer",
      url: "https://explorer.areum.network"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 353286
    }
  },
  testnet: false
});
const artelaTestnet = /* @__PURE__ */ defineChain({
  id: 11822,
  name: "Artela Testnet",
  nativeCurrency: { name: "ART", symbol: "ART", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://betanet-rpc1.artela.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Artela",
      url: "https://betanet-scan.artela.network",
      apiUrl: "https://betanet-scan.artela.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xd07c8635f76e8745Ee7092fbb6e8fbc5FeF09DD7",
      blockCreated: 7001871
    }
  },
  testnet: true
});
const arthera = /* @__PURE__ */ defineChain({
  id: 10242,
  name: "Arthera",
  nativeCurrency: { name: "Arthera", symbol: "AA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.arthera.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arthera EVM Explorer",
      url: "https://explorer.arthera.net",
      apiUrl: "https://explorer.arthera.net/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 4502791
    }
  }
});
const artheraTestnet = /* @__PURE__ */ defineChain({
  id: 10243,
  name: "Arthera Testnet",
  nativeCurrency: { name: "Arthera", symbol: "AA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-test.arthera.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arthera EVM Explorer",
      url: "https://explorer-test.arthera.net",
      apiUrl: "https://explorer-test.arthera.net/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 22051
    }
  },
  testnet: true
});
const assetChain = /* @__PURE__ */ defineChain({
  id: 42420,
  name: "AssetChain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Real World Asset",
    symbol: "RWA"
  },
  rpcUrls: {
    default: { http: ["https://mainnet-rpc.assetchain.org"] }
  },
  blockExplorers: {
    default: {
      name: "Asset Chain Explorer",
      url: "https://scan.assetchain.org",
      apiUrl: "https://scan.assetchain.org/api"
    }
  },
  testnet: false,
  contracts: {}
});
const assetChainTestnet = /* @__PURE__ */ defineChain({
  id: 42421,
  name: "AssetChain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Real World Asset",
    symbol: "RWA"
  },
  rpcUrls: {
    default: { http: ["https://enugu-rpc.assetchain.org"] }
  },
  blockExplorers: {
    default: {
      name: "Asset Chain Testnet Explorer",
      url: "https://scan-testnet.assetchain.org",
      apiUrl: "https://scan-testnet.assetchain.org/api"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0x989F832D35988cb5e3eB001Fa2Fe789469EC31Ea",
      blockCreated: 17177
    }
  }
});
const astar = /* @__PURE__ */ defineChain({
  id: 592,
  name: "Astar",
  network: "astar-mainnet",
  nativeCurrency: {
    name: "Astar",
    symbol: "ASTR",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://astar.api.onfinality.io/public"] }
  },
  blockExplorers: {
    default: {
      name: "Astar Subscan",
      url: "https://astar.subscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 761794
    }
  },
  testnet: false
});
const astarZkEVM = /* @__PURE__ */ defineChain({
  id: 3776,
  name: "Astar zkEVM",
  network: "AstarZkEVM",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-zkevm.astar.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Astar zkEVM Explorer",
      url: "https://astar-zkevm.explorer.startale.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 93528
    }
  },
  testnet: false
});
const astarZkyoto = /* @__PURE__ */ defineChain({
  id: 6038361,
  name: "Astar zkEVM Testnet zKyoto",
  network: "zKyoto",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.startale.com/zkyoto"]
    }
  },
  blockExplorers: {
    default: {
      name: "zKyoto Explorer",
      url: "https://zkyoto.explorer.startale.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 196153
    }
  },
  testnet: true
});
const atletaOlympia = /* @__PURE__ */ defineChain({
  id: 2340,
  name: "Atleta Olympia",
  nativeCurrency: { decimals: 18, name: "Atla", symbol: "ATLA" },
  rpcUrls: {
    default: {
      http: [
        "https://testnet-rpc.atleta.network:9944",
        "https://testnet-rpc.atleta.network"
      ],
      ws: ["wss://testnet-rpc.atleta.network:9944"]
    }
  },
  blockExplorers: {
    default: {
      name: "Atleta Olympia Explorer",
      url: "https://blockscout.atleta.network",
      apiUrl: "https://blockscout.atleta.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x1472ec6392180fb84F345d2455bCC75B26577115",
      blockCreated: 1076473
    }
  },
  testnet: true
});
const aurora = /* @__PURE__ */ defineChain({
  id: 1313161554,
  name: "Aurora",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://mainnet.aurora.dev"] }
  },
  blockExplorers: {
    default: {
      name: "Aurorascan",
      url: "https://aurorascan.dev",
      apiUrl: "https://aurorascan.dev/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 62907816
    }
  }
});
const auroraTestnet = /* @__PURE__ */ defineChain({
  id: 1313161555,
  name: "Aurora Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://testnet.aurora.dev"] }
  },
  blockExplorers: {
    default: {
      name: "Aurorascan",
      url: "https://testnet.aurorascan.dev",
      apiUrl: "https://testnet.aurorascan.dev/api"
    }
  },
  testnet: true
});
const auroria = /* @__PURE__ */ defineChain({
  id: 205205,
  name: "Auroria Testnet",
  network: "auroria",
  nativeCurrency: {
    name: "Auroria Stratis",
    symbol: "tSTRAX",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://auroria.rpc.stratisevm.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Auroria Testnet Explorer",
      url: "https://auroria.explorer.stratisevm.com"
    }
  },
  testnet: true
});
const autheoTestnet = /* @__PURE__ */ defineChain({
  id: 785,
  name: "Autheo Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Autheo",
    symbol: "THEO"
  },
  rpcUrls: {
    default: {
      http: [
        "https://testnet-rpc1.autheo.com",
        "https://testnet-rpc2.autheo.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Autheo Testnet Block Explorer",
      url: "https://testnet-explorer.autheo.com/"
    }
  },
  testnet: true
});
const avalanche = /* @__PURE__ */ defineChain({
  id: 43114,
  name: "Avalanche",
  blockTime: 1700,
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX"
  },
  rpcUrls: {
    default: { http: ["https://api.avax.network/ext/bc/C/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "SnowTrace",
      url: "https://snowtrace.io",
      apiUrl: "https://api.snowtrace.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 11907934
    }
  }
});
const avalancheFuji = /* @__PURE__ */ defineChain({
  id: 43113,
  name: "Avalanche Fuji",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche Fuji",
    symbol: "AVAX"
  },
  rpcUrls: {
    default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "SnowTrace",
      url: "https://testnet.snowtrace.io",
      apiUrl: "https://api-testnet.snowtrace.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 7096959
    }
  },
  testnet: true
});
const sourceId$11 = 8453;
const b3 = /* @__PURE__ */ defineChain({
  id: 8333,
  name: "B3",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.b3.fun/http"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.b3.fun"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    }
  },
  sourceId: sourceId$11
});
const sourceId$10 = 168587773;
const b3Sepolia = /* @__PURE__ */ defineChain({
  id: 1993,
  name: "B3 Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.b3.fun/http"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepolia.explorer.b3.fun"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    }
  },
  testnet: true,
  sourceId: sourceId$10
});
const bahamut = /* @__PURE__ */ defineChain({
  id: 5165,
  network: "bahamut",
  name: "Bahamut",
  nativeCurrency: { name: "Fasttoken", symbol: "FTN", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc1.bahamut.io",
        "https://bahamut-rpc.publicnode.com",
        "https://rpc2.bahamut.io"
      ],
      webSocket: [
        "wss://ws1.sahara.bahamutchain.com",
        "wss://bahamut-rpc.publicnode.com",
        "wss://ws2.sahara.bahamutchain.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Ftnscan",
      url: "https://www.ftnscan.com",
      apiUrl: "https://www.ftnscan.com/api"
    }
  }
});
const sourceId$$ = 1;
const base = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
      apiUrl: "https://api.basescan.org/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$$]: {
        address: "0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e"
      }
    },
    l2OutputOracle: {
      [sourceId$$]: {
        address: "0x56315b90c40730925ec5485cf004d835058518A0"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5022
    },
    portal: {
      [sourceId$$]: {
        address: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
        blockCreated: 17482143
      }
    },
    l1StandardBridge: {
      [sourceId$$]: {
        address: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
        blockCreated: 17482143
      }
    }
  },
  sourceId: sourceId$$
});
const basePreconf = /* @__PURE__ */ defineChain({
  ...base,
  experimental_preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ["https://mainnet-preconf.base.org"]
    }
  }
});
const basecampTestnet = /* @__PURE__ */ defineChain({
  id: 123420001114,
  name: "Basecamp Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Camp",
    symbol: "CAMP"
  },
  rpcUrls: {
    default: { http: ["https://rpc.basecamp.t.raas.gelato.cloud"] }
  },
  blockExplorers: {
    default: {
      name: "basecamp",
      url: "https://basecamp.cloud.blockscout.com"
    }
  },
  testnet: true
});
const sourceId$_ = 5;
const baseGoerli = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 84531,
  name: "Base Goerli",
  nativeCurrency: { name: "Goerli Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://goerli.base.org"] }
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://goerli.basescan.org",
      apiUrl: "https://goerli.basescan.org/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$_]: {
        address: "0x2A35891ff30313CcFa6CE88dcf3858bb075A2298"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1376988
    },
    portal: {
      [sourceId$_]: {
        address: "0xe93c8cD0D409341205A592f8c4Ac1A5fe5585cfA"
      }
    },
    l1StandardBridge: {
      [sourceId$_]: {
        address: "0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$_
});
const sourceId$Z = 11155111;
const baseSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 84532,
  network: "base-sepolia",
  name: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://sepolia.basescan.org",
      apiUrl: "https://api-sepolia.basescan.org/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$Z]: {
        address: "0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1"
      }
    },
    l2OutputOracle: {
      [sourceId$Z]: {
        address: "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254"
      }
    },
    portal: {
      [sourceId$Z]: {
        address: "0x49f53e41452c74589e85ca1677426ba426459e85",
        blockCreated: 4446677
      }
    },
    l1StandardBridge: {
      [sourceId$Z]: {
        address: "0xfd0Bf71F60660E2f608ed56e1659C450eB113120",
        blockCreated: 4446677
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1059647
    }
  },
  testnet: true,
  sourceId: sourceId$Z
});
const baseSepoliaPreconf = /* @__PURE__ */ defineChain({
  ...baseSepolia,
  experimental_preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ["https://sepolia-preconf.base.org"]
    }
  }
});
const battlechainTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 627,
  name: "BattleChain Testnet",
  network: "battlechain-testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.battlechain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "BattleChain Explorer",
      url: "https://explorer.testnet.battlechain.com",
      blockExplorerApi: "https://block-explorer-api.testnet.battlechain.com/api"
    }
  },
  testnet: true
});
const beam = /* @__PURE__ */ defineChain({
  id: 4337,
  name: "Beam",
  network: "beam",
  nativeCurrency: {
    decimals: 18,
    name: "Beam",
    symbol: "BEAM"
  },
  rpcUrls: {
    default: {
      http: ["https://build.onbeam.com/rpc"],
      webSocket: ["wss://build.onbeam.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Beam Explorer",
      url: "https://subnets.avax.network/beam"
    }
  },
  contracts: {
    multicall3: {
      address: "0x4956f15efdc3dc16645e90cc356eafa65ffc65ec",
      blockCreated: 1
    }
  }
});
const beamTestnet = /* @__PURE__ */ defineChain({
  id: 13337,
  name: "Beam Testnet",
  network: "beam",
  nativeCurrency: {
    decimals: 18,
    name: "Beam",
    symbol: "BEAM"
  },
  rpcUrls: {
    default: {
      http: ["https://build.onbeam.com/rpc/testnet"],
      webSocket: ["wss://build.onbeam.com/ws/testnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "Beam Explorer",
      url: "https://subnets-test.avax.network/beam"
    }
  },
  contracts: {
    multicall3: {
      address: "0x9bf49b704ee2a095b95c1f2d4eb9010510c41c9e",
      blockCreated: 3
    }
  },
  testnet: true
});
const bearNetworkChainMainnet = /* @__PURE__ */ defineChain({
  id: 641230,
  name: "Bear Network Chain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "BearNetworkChain",
    symbol: "BRNKC"
  },
  rpcUrls: {
    default: { http: ["https://brnkc-mainnet.bearnetwork.net"] }
  },
  blockExplorers: {
    default: {
      name: "BrnkScan",
      url: "https://brnkscan.bearnetwork.net",
      apiUrl: "https://brnkscan.bearnetwork.net/api"
    }
  }
});
const bearNetworkChainTestnet = /* @__PURE__ */ defineChain({
  id: 751230,
  name: "Bear Network Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tBRNKC",
    symbol: "tBRNKC"
  },
  rpcUrls: {
    default: { http: ["https://brnkc-test.bearnetwork.net"] }
  },
  blockExplorers: {
    default: {
      name: "BrnkTestScan",
      url: "https://brnktest-scan.bearnetwork.net",
      apiUrl: "https://brnktest-scan.bearnetwork.net/api"
    }
  },
  testnet: true
});
const berachain = /* @__PURE__ */ defineChain({
  id: 80094,
  name: "Berachain",
  blockTime: 2e3,
  nativeCurrency: {
    decimals: 18,
    name: "BERA Token",
    symbol: "BERA"
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    },
    ensRegistry: {
      address: "0x5b22280886a2f5e09a49bea7e320eab0e5320e28",
      blockCreated: 877007
    },
    ensUniversalResolver: {
      address: "0x4D41762915F83c76EcaF6776d9b08076aA32b492",
      blockCreated: 9310021
    }
  },
  rpcUrls: {
    default: { http: ["https://rpc.berachain.com"] }
  },
  blockExplorers: {
    default: {
      name: "Berascan",
      url: "https://berascan.com"
    }
  },
  ensTlds: [".bera"],
  testnet: false
});
const berachainBepolia = /* @__PURE__ */ defineChain({
  id: 80069,
  blockTime: 2e3,
  name: "Berachain Bepolia",
  nativeCurrency: {
    decimals: 18,
    name: "BERA Token",
    symbol: "BERA"
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  },
  rpcUrls: {
    default: { http: ["https://bepolia.rpc.berachain.com"] }
  },
  blockExplorers: {
    default: {
      name: "Berascan",
      url: "https://bepolia.beratrail.io"
    }
  },
  testnet: true
});
const berachainTestnet = /* @__PURE__ */ defineChain({
  id: 80085,
  name: "Berachain Artio",
  nativeCurrency: {
    decimals: 18,
    name: "BERA Token",
    symbol: "BERA"
  },
  rpcUrls: {
    default: { http: ["https://artio.rpc.berachain.com"] }
  },
  blockExplorers: {
    default: {
      name: "Berachain",
      url: "https://artio.beratrail.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 866924
    }
  },
  testnet: true
});
const berachainTestnetbArtio = /* @__PURE__ */ defineChain({
  id: 80084,
  name: "Berachain bArtio",
  nativeCurrency: {
    decimals: 18,
    name: "BERA Token",
    symbol: "BERA"
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 109269
    },
    ensRegistry: {
      address: "0xB0eef18971290b333450586D33dcA6cE122651D2",
      blockCreated: 7736794
    },
    ensUniversalResolver: {
      address: "0x41692Ef1EA0C79E6b73077E4A67572D2BDbD7057",
      blockCreated: 7736795
    }
  },
  ensTlds: [".bera"],
  rpcUrls: {
    default: { http: ["https://bartio.rpc.berachain.com"] }
  },
  blockExplorers: {
    default: {
      name: "Berachain bArtio Beratrail",
      url: "https://bartio.beratrail.io"
    }
  },
  testnet: true
});
const bevmMainnet = /* @__PURE__ */ defineChain({
  id: 11501,
  name: "BEVM Mainnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-mainnet-1.bevm.io"] }
  },
  blockExplorers: {
    default: {
      name: "Bevmscan",
      url: "https://scan-mainnet.bevm.io",
      apiUrl: "https://scan-mainnet-api.bevm.io/api"
    }
  }
});
const bifrost = /* @__PURE__ */ defineChain({
  id: 3068,
  name: "Bifrost Mainnet",
  nativeCurrency: { name: "BFC", symbol: "BFC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://public-01.mainnet.bifrostnetwork.com/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Bifrost Blockscout",
      url: "https://explorer.mainnet.bifrostnetwork.com"
    }
  },
  testnet: false
});
const birdlayer = /* @__PURE__ */ defineChain({
  id: 53456,
  name: "BirdLayer",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://rpc.birdlayer.xyz", "https://rpc1.birdlayer.xyz"],
      webSocket: ["wss://rpc.birdlayer.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "BirdLayer Explorer",
      url: "https://scan.birdlayer.xyz"
    }
  }
});
const bitgert = /* @__PURE__ */ defineChain({
  id: 32520,
  name: "Bitgert Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Brise",
    symbol: "Brise"
  },
  rpcUrls: {
    default: { http: ["https://rpc-bitgert.icecreamswap.com"] }
  },
  blockExplorers: {
    default: {
      name: "Bitgert Scan",
      url: "https://brisescan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2118034
    }
  },
  testnet: false
});
const bitkub = /* @__PURE__ */ defineChain({
  id: 96,
  name: "KUB Mainnet",
  nativeCurrency: { name: "KUB Coin", symbol: "KUB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.bitkubchain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "KUB Chain Mainnet Explorer",
      url: "https://www.bkcscan.com",
      apiUrl: "https://www.bkcscan.com/api"
    }
  }
});
const bitkubTestnet = /* @__PURE__ */ defineChain({
  id: 25925,
  name: "Bitkub Testnet",
  network: "Bitkub Testnet",
  nativeCurrency: { name: "Bitkub Test", symbol: "tKUB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.bitkubchain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Bitkub Chain Testnet Explorer",
      url: "https://testnet.bkcscan.com",
      apiUrl: "https://testnet.bkcscan.com/api"
    }
  },
  testnet: true
});
const bitlayer = /* @__PURE__ */ defineChain({
  id: 200901,
  name: "Bitlayer Mainnet",
  nativeCurrency: {
    name: "BTC",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bitlayer.org"],
      webSocket: ["wss://ws.bitlayer.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "bitlayer mainnet scan",
      url: "https://www.btrscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0x5B256fE9e993902eCe49D138a5b1162cBb529474",
      blockCreated: 2421963
    }
  }
});
const bitlayerTestnet = /* @__PURE__ */ defineChain({
  id: 200810,
  name: "Bitlayer Testnet",
  nativeCurrency: {
    name: "BTC",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.bitlayer.org"],
      webSocket: ["wss://testnet-ws.bitlayer.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "bitlayer testnet scan",
      url: "https://testnet.btrscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0x5B256fE9e993902eCe49D138a5b1162cBb529474",
      blockCreated: 4135671
    }
  },
  testnet: true
});
const bitrock = /* @__PURE__ */ defineChain({
  id: 7171,
  name: "Bitrock Mainnet",
  nativeCurrency: { name: "BROCK", symbol: "BROCK", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://brockrpc.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Bitrock Explorer",
      url: "https://explorer.bit-rock.io"
    }
  },
  testnet: false
});
const bitTorrent = /* @__PURE__ */ defineChain({
  id: 199,
  name: "BitTorrent",
  network: "bittorrent-chain-mainnet",
  nativeCurrency: { name: "BitTorrent", symbol: "BTT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.bittorrentchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Bttcscan",
      url: "https://bttcscan.com",
      apiUrl: "https://api.bttcscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 31078552
    }
  }
});
const bitTorrentTestnet = /* @__PURE__ */ defineChain({
  id: 1028,
  name: "BitTorrent Chain Testnet",
  network: "bittorrent-chain-testnet",
  nativeCurrency: { name: "BitTorrent", symbol: "BTT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testrpc.bittorrentchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Bttcscan",
      url: "https://testnet.bttcscan.com",
      apiUrl: "https://testnet.bttcscan.com/api"
    }
  },
  testnet: true
});
const sourceId$Y = 1;
const blast = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 81457,
  name: "Blast",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://rpc.blast.io"] }
  },
  blockExplorers: {
    default: {
      name: "Blastscan",
      url: "https://blastscan.io",
      apiUrl: "https://api.blastscan.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 212929
    },
    l2OutputOracle: {
      [sourceId$Y]: {
        address: "0x826D1B0D4111Ad9146Eb8941D7Ca2B6a44215c76",
        blockCreated: 19300358
      }
    },
    portal: {
      [sourceId$Y]: {
        address: "0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb",
        blockCreated: 19300357
      }
    },
    l1StandardBridge: {
      [sourceId$Y]: {
        address: "0x697402166Fbf2F22E970df8a6486Ef171dbfc524",
        blockCreated: 19300360
      }
    }
  },
  sourceId: sourceId$Y
});
const sourceId$X = 11155111;
const blastSepolia = /* @__PURE__ */ defineChain({
  id: 168587773,
  name: "Blast Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.blast.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blastscan",
      url: "https://sepolia.blastscan.io",
      apiUrl: "https://api-sepolia.blastscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 756690
    }
  },
  testnet: true,
  sourceId: sourceId$X
});
const sourceId$W = 1;
const bob = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 60808,
  name: "BOB",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.gobob.xyz"],
      webSocket: ["wss://rpc.gobob.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "BOB Explorer",
      url: "https://explorer.gobob.xyz"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 23131
    },
    l2OutputOracle: {
      [sourceId$W]: {
        address: "0xdDa53E23f8a32640b04D7256e651C1db98dB11C1",
        blockCreated: 4462615
      }
    },
    portal: {
      [sourceId$W]: {
        address: "0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E",
        blockCreated: 4462615
      }
    }
  },
  sourceId: sourceId$W
});
const boba = /* @__PURE__ */ defineChain({
  id: 288,
  name: "Boba Network",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://mainnet.boba.network"] }
  },
  blockExplorers: {
    default: {
      name: "BOBAScan",
      url: "https://bobascan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 446859
    }
  }
});
const bobaSepolia = /* @__PURE__ */ defineChain({
  id: 28882,
  name: "Boba Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://sepolia.boba.network"] }
  },
  blockExplorers: {
    default: {
      name: "BOBAScan",
      url: "https://testnet.bobascan.com"
    }
  },
  testnet: true
});
const sourceId$V = 11155111;
const bobSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 808813,
  name: "BOB Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://bob-sepolia.rpc.gobob.xyz"],
      webSocket: ["wss://bob-sepolia.rpc.gobob.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "BOB Sepolia Explorer",
      url: "https://bob-sepolia.explorer.gobob.xyz"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 35677
    },
    l2OutputOracle: {
      [sourceId$V]: {
        address: "0x14D0069452b4AE2b250B395b8adAb771E4267d2f",
        blockCreated: 4462615
      }
    },
    portal: {
      [sourceId$V]: {
        address: "0x867B1Aa872b9C8cB5E9F7755feDC45BB24Ad0ae4",
        blockCreated: 4462615
      }
    }
  },
  testnet: true,
  sourceId: sourceId$V
});
const boolBetaMainnet = /* @__PURE__ */ defineChain({
  id: 11100,
  name: "Bool Beta Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOL",
    symbol: "BOL"
  },
  rpcUrls: {
    default: { http: ["https://beta-rpc-node-http.bool.network"] }
  },
  blockExplorers: {
    default: {
      name: "BoolScan",
      url: "https://beta-mainnet.boolscan.com/"
    }
  },
  testnet: false
});
const botanix = /* @__PURE__ */ defineChain({
  id: 3637,
  name: "Botanix",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.botanixlabs.com"],
      webSocket: ["wss://rpc.botanixlabs.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Botanixscan",
      url: "https://botanixscan.io"
    }
  }
});
const botanixTestnet = /* @__PURE__ */ defineChain({
  id: 3636,
  name: "Botanix Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://node.botanixlabs.dev"]
    }
  },
  blockExplorers: {
    default: {
      name: "Botanix Testnet Explorer",
      url: "https://testnet.botanixscan.io"
    }
  },
  testnet: true
});
const bounceBit = /* @__PURE__ */ defineChain({
  id: 6001,
  name: "BounceBit Mainnet",
  nativeCurrency: { name: "BounceBit", symbol: "BB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://fullnode-mainnet.bouncebitapi.com"] }
  },
  blockExplorers: {
    default: {
      name: "BB Scan",
      url: "https://bbscan.io"
    }
  },
  testnet: false
});
const bounceBitTestnet = /* @__PURE__ */ defineChain({
  id: 6e3,
  name: "BounceBit Testnet",
  nativeCurrency: { name: "BounceBit", symbol: "BB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://fullnode-testnet.bouncebitapi.com"] }
  },
  blockExplorers: {
    default: {
      name: "BB Scan",
      url: "https://testnet.bbscan.io"
    }
  },
  testnet: true
});
const bronos = /* @__PURE__ */ defineChain({
  id: 1039,
  name: "Bronos",
  nativeCurrency: {
    decimals: 18,
    name: "BRO",
    symbol: "BRO"
  },
  rpcUrls: {
    default: { http: ["https://evm.bronos.org"] }
  },
  blockExplorers: {
    default: {
      name: "BronoScan",
      url: "https://broscan.bronos.org"
    }
  }
});
const bronosTestnet = /* @__PURE__ */ defineChain({
  id: 1038,
  name: "Bronos Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Bronos Coin",
    symbol: "tBRO"
  },
  rpcUrls: {
    default: { http: ["https://evm-testnet.bronos.org"] }
  },
  blockExplorers: {
    default: {
      name: "BronoScan",
      url: "https://tbroscan.bronos.org"
    }
  },
  testnet: true
});
const bsc = /* @__PURE__ */ defineChain({
  id: 56,
  name: "BNB Smart Chain",
  blockTime: 750,
  nativeCurrency: {
    decimals: 18,
    name: "BNB",
    symbol: "BNB"
  },
  rpcUrls: {
    default: { http: ["https://56.rpc.thirdweb.com"] }
  },
  blockExplorers: {
    default: {
      name: "BscScan",
      url: "https://bscscan.com",
      apiUrl: "https://api.bscscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 15921452
    }
  }
});
const bscGreenfield = /* @__PURE__ */ defineChain({
  id: 1017,
  name: "BNB Greenfield Chain",
  nativeCurrency: {
    decimals: 18,
    name: "BNB",
    symbol: "BNB"
  },
  rpcUrls: {
    default: { http: ["https://greenfield-chain.bnbchain.org"] }
  },
  blockExplorers: {
    default: {
      name: "BNB Greenfield Mainnet Scan",
      url: "https://greenfieldscan.com"
    }
  },
  testnet: false
});
const bsquared = /* @__PURE__ */ defineChain({
  id: 223,
  name: "B2",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bsquared.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer.bsquared.network"
    }
  }
});
const bsquaredTestnet = /* @__PURE__ */ defineChain({
  id: 1123,
  name: "B2 Testnet",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.bsquared.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://testnet-explorer.bsquared.network"
    }
  },
  testnet: true
});
const btr = /* @__PURE__ */ defineChain({
  id: 200901,
  name: "Bitlayer",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bitlayer.org", "https://rpc.bitlayer-rpc.com"],
      webSocket: ["wss://ws.bitlayer.org", "wss://ws.bitlayer-rpc.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Bitlayer(BTR) Scan",
      url: "https://www.btrscan.com"
    }
  }
});
const btrTestnet = /* @__PURE__ */ defineChain({
  id: 200810,
  name: "Bitlayer Testnet",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.bitlayer.org"],
      webSocket: [
        "wss://testnet-ws.bitlayer.org",
        "wss://testnet-ws.bitlayer-rpc.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Bitlayer(BTR) Scan",
      url: "https://testnet.btrscan.com"
    }
  },
  testnet: true
});
const bxn = /* @__PURE__ */ defineChain({
  id: 4999,
  name: "BlackFort Exchange Network",
  nativeCurrency: { name: "BlackFort Token", symbol: "BXN", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.blackfort.network/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.blackfort.network",
      apiUrl: "https://explorer.blackfort.network/api"
    }
  }
});
const bxnTestnet = /* @__PURE__ */ defineChain({
  id: 4777,
  name: "BlackFort Exchange Network Testnet",
  nativeCurrency: {
    name: "BlackFort Testnet Token",
    symbol: "TBXN",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.blackfort.network/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://testnet-explorer.blackfort.network",
      apiUrl: "https://testnet-explorer.blackfort.network/api"
    }
  },
  testnet: true
});
const cannon = /* @__PURE__ */ defineChain({
  id: 13370,
  name: "Cannon",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] }
  }
});
const canto = /* @__PURE__ */ defineChain({
  id: 7700,
  name: "Canto",
  nativeCurrency: {
    decimals: 18,
    name: "Canto",
    symbol: "CANTO"
  },
  rpcUrls: {
    default: { http: ["https://canto.gravitychain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Tuber.Build (Blockscout)",
      url: "https://tuber.build"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 2905789
    }
  }
});
const fees = {
  /*
     * Estimates the fees per gas for a transaction.
  
     * If the transaction is to be paid in a token (feeCurrency is present) then the fees
     * are estimated in the value of the token. Otherwise falls back to the default
     * estimation by returning null.
     *
     * @param params fee estimation function parameters
     */
  estimateFeesPerGas: async (params) => {
    if (!params.request?.feeCurrency)
      return null;
    const [gasPrice, maxPriorityFeePerGas] = await Promise.all([
      estimateFeePerGasInFeeCurrency(params.client, params.request.feeCurrency),
      estimateMaxPriorityFeePerGasInFeeCurrency(params.client, params.request.feeCurrency)
    ]);
    const maxFeePerGas = params.multiply(gasPrice - maxPriorityFeePerGas) + maxPriorityFeePerGas;
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
};
async function estimateFeePerGasInFeeCurrency(client, feeCurrency) {
  const fee = await client.request({
    method: "eth_gasPrice",
    params: [feeCurrency]
  });
  return BigInt(fee);
}
async function estimateMaxPriorityFeePerGasInFeeCurrency(client, feeCurrency) {
  const feesPerGas = await client.request({
    method: "eth_maxPriorityFeePerGas",
    params: [feeCurrency]
  });
  return BigInt(feesPerGas);
}
function isEmpty(value) {
  return value === 0 || value === 0n || value === void 0 || value === null || value === "0" || value === "" || typeof value === "string" && (trim(value).toLowerCase() === "0x" || trim(value).toLowerCase() === "0x00");
}
function isPresent(value) {
  return !isEmpty(value);
}
function isEIP1559(transaction) {
  return typeof transaction.maxFeePerGas !== "undefined" && typeof transaction.maxPriorityFeePerGas !== "undefined";
}
function isCIP64(transaction) {
  if (transaction.type === "cip64") {
    return true;
  }
  return isEIP1559(transaction) && isPresent(transaction.feeCurrency);
}
const formatters = {
  block: /* @__PURE__ */ defineBlock({
    format(args) {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === "string")
          return transaction;
        const formatted = formatTransaction$1(transaction);
        return {
          ...formatted,
          ...transaction.gatewayFee ? {
            gatewayFee: hexToBigInt(transaction.gatewayFee),
            gatewayFeeRecipient: transaction.gatewayFeeRecipient
          } : {},
          feeCurrency: transaction.feeCurrency
        };
      });
      return {
        transactions
      };
    }
  }),
  transaction: /* @__PURE__ */ defineTransaction({
    format(args) {
      if (args.type === "0x7e")
        return {
          isSystemTx: args.isSystemTx,
          mint: args.mint ? hexToBigInt(args.mint) : void 0,
          sourceHash: args.sourceHash,
          type: "deposit"
        };
      const transaction = { feeCurrency: args.feeCurrency };
      if (args.type === "0x7b")
        transaction.type = "cip64";
      else {
        if (args.type === "0x7c")
          transaction.type = "cip42";
        transaction.gatewayFee = args.gatewayFee ? hexToBigInt(args.gatewayFee) : null;
        transaction.gatewayFeeRecipient = args.gatewayFeeRecipient;
      }
      return transaction;
    }
  }),
  transactionRequest: /* @__PURE__ */ defineTransactionRequest({
    format(args) {
      const request = {};
      if (args.feeCurrency)
        request.feeCurrency = args.feeCurrency;
      if (isCIP64(args))
        request.type = "0x7b";
      return request;
    }
  })
};
function serializeTransaction(transaction, signature) {
  if (isCIP64(transaction))
    return serializeTransactionCIP64(transaction, signature);
  return serializeTransaction$1(transaction, signature);
}
const serializers = {
  transaction: serializeTransaction
};
function serializeTransactionCIP64(transaction, signature) {
  assertTransactionCIP64(transaction);
  const { chainId, gas, nonce: nonce2, to: to2, value, maxFeePerGas, maxPriorityFeePerGas, accessList, feeCurrency, data } = transaction;
  const serializedTransaction = [
    toHex$1(chainId),
    nonce2 ? toHex$1(nonce2) : "0x",
    maxPriorityFeePerGas ? toHex$1(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? toHex$1(maxFeePerGas) : "0x",
    gas ? toHex$1(gas) : "0x",
    to2 ?? "0x",
    value ? toHex$1(value) : "0x",
    data ?? "0x",
    serializeAccessList(accessList),
    feeCurrency,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x7b",
    toRlp(serializedTransaction)
  ]);
}
const MAX_MAX_FEE_PER_GAS = maxUint256;
function assertTransactionCIP64(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to: to2, feeCurrency } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError$1({ chainId });
  if (to2 && !isAddress(to2))
    throw new InvalidAddressError({ address: to2 });
  if (gasPrice)
    throw new BaseError$1("`gasPrice` is not a valid CIP-64 Transaction attribute.");
  if (isPresent(maxFeePerGas) && maxFeePerGas > MAX_MAX_FEE_PER_GAS)
    throw new FeeCapTooHighError$1({ maxFeePerGas });
  if (isPresent(maxPriorityFeePerGas) && isPresent(maxFeePerGas) && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError$1({ maxFeePerGas, maxPriorityFeePerGas });
  if (isPresent(feeCurrency) && !isAddress(feeCurrency)) {
    throw new BaseError$1("`feeCurrency` MUST be a token address for CIP-64 transactions.");
  }
  if (isEmpty(feeCurrency)) {
    throw new BaseError$1("`feeCurrency` must be provided for CIP-64 transactions.");
  }
}
const chainConfig$2 = {
  blockTime: 1e3,
  contracts,
  formatters,
  serializers,
  fees
};
const celo = /* @__PURE__ */ defineChain({
  ...chainConfig$2,
  id: 42220,
  name: "Celo",
  nativeCurrency: {
    decimals: 18,
    name: "CELO",
    symbol: "CELO"
  },
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] }
  },
  blockExplorers: {
    default: {
      name: "Celo Explorer",
      url: "https://celoscan.io",
      apiUrl: "https://api.celoscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 13112599
    }
  },
  testnet: false
});
const sourceId$U = 17e3;
const celoAlfajores = /* @__PURE__ */ defineChain({
  ...chainConfig$2,
  id: 44787,
  name: "Alfajores",
  nativeCurrency: {
    decimals: 18,
    name: "CELO",
    symbol: "A-CELO"
  },
  rpcUrls: {
    default: {
      http: ["https://alfajores-forno.celo-testnet.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Celo Alfajores Explorer",
      url: "https://celo-alfajores.blockscout.com",
      apiUrl: "https://celo-alfajores.blockscout.com/api"
    }
  },
  contracts: {
    ...chainConfig$2.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 14569001
    },
    portal: {
      [sourceId$U]: {
        address: "0x82527353927d8D069b3B452904c942dA149BA381",
        blockCreated: 2411324
      }
    },
    disputeGameFactory: {
      [sourceId$U]: {
        address: "0xE28AAdcd9883746c0e5068F58f9ea06027b214cb",
        blockCreated: 2411324
      }
    },
    l2OutputOracle: {
      [sourceId$U]: {
        address: "0x4a2635e9e4f6e45817b1D402ac4904c1d1752438",
        blockCreated: 2411324
      }
    },
    l1StandardBridge: {
      [sourceId$U]: {
        address: "0xD1B0E0581973c9eB7f886967A606b9441A897037",
        blockCreated: 2411324
      }
    }
  },
  testnet: true
});
const sourceId$T = 11155111;
const celoSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$2,
  id: 11142220,
  name: "Celo Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "CELO",
    symbol: "S-CELO"
  },
  rpcUrls: {
    default: {
      http: ["https://forno.celo-sepolia.celo-testnet.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Explorer",
      url: "https://celo-sepolia.blockscout.com/",
      apiUrl: "https://celo-sepolia.blockscout.com/api"
    }
  },
  contracts: {
    ...chainConfig$2.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1
    },
    portal: {
      [sourceId$T]: {
        address: "0x44ae3d41a335a7d05eb533029917aad35662dcc2",
        blockCreated: 8825790
      }
    },
    disputeGameFactory: {
      [sourceId$T]: {
        address: "0x57c45d82d1a995f1e135b8d7edc0a6bb5211cfaa",
        blockCreated: 8825790
      }
    },
    l1StandardBridge: {
      [sourceId$T]: {
        address: "0xec18a3c30131a0db4246e785355fbc16e2eaf408",
        blockCreated: 8825790
      }
    }
  },
  testnet: true
});
const chang = /* @__PURE__ */ defineChain({
  id: 5858,
  name: "Chang Chain Foundation Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "CTH",
    symbol: "CTH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.cthscan.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Chang Chain explorer",
      url: "https://cthscan.com"
    }
  }
});
const chiliz = /* @__PURE__ */ defineChain({
  id: 88888,
  name: "Chiliz Chain",
  network: "chiliz-chain",
  nativeCurrency: {
    decimals: 18,
    name: "CHZ",
    symbol: "CHZ"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.chiliz.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Chiliz Explorer",
      url: "https://scan.chiliz.com",
      apiUrl: "https://scan.chiliz.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 8080847
    }
  }
});
const chips = /* @__PURE__ */ defineChain({
  id: 2882,
  name: "Chips Network",
  network: "CHIPS",
  nativeCurrency: {
    decimals: 18,
    name: "IOTA",
    symbol: "IOTA"
  },
  rpcUrls: {
    default: {
      http: [
        "https://node.chips.ooo/wasp/api/v1/chains/iota1pp3d3mnap3ufmgqnjsnw344sqmf5svjh26y2khnmc89sv6788y3r207a8fn/evm"
      ]
    }
  }
});
const citrate = /* @__PURE__ */ defineChain({
  id: 40204,
  name: "Citrate",
  nativeCurrency: { name: "SALT", symbol: "SALT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.citrate.ai"],
      webSocket: ["wss://rpc.citrate.ai"]
    }
  },
  testnet: true
});
const citrea = /* @__PURE__ */ defineChain({
  id: 4114,
  name: "Citrea Mainnet",
  nativeCurrency: { name: "Citrea Bitcoin", symbol: "cBTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.citrea.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Citrea Explorer",
      url: "https://explorer.mainnet.citrea.xyz",
      apiUrl: "https://explorer.mainnet.citrea.xyz/api"
    }
  },
  testnet: false
});
const citreaTestnet = /* @__PURE__ */ defineChain({
  id: 5115,
  name: "Citrea Testnet",
  nativeCurrency: { name: "cBTC", symbol: "cBTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.citrea.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Citrea Explorer",
      url: "https://explorer.testnet.citrea.xyz",
      apiUrl: "https://explorer.testnet.citrea.xyz/api"
    }
  },
  testnet: true
});
const classic = /* @__PURE__ */ defineChain({
  id: 61,
  name: "Ethereum Classic",
  nativeCurrency: {
    decimals: 18,
    name: "ETC",
    symbol: "ETC"
  },
  rpcUrls: {
    default: { http: ["https://etc.rivet.link"] }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout.com/etc/mainnet"
    }
  }
});
const sourceId$S = 1;
const codex = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 81224,
  name: "Codex",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.codex.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Codex Explorer",
      url: "https://explorer.codex.xyz",
      apiUrl: "https://explorer.codex.xyz/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$S]: {
        address: "0x6A3855dc26e2beA8Ac73f82Cda79f3808B6C6F6C"
      }
    },
    portal: {
      [sourceId$S]: {
        address: "0x52759C07A759c81BAab28AE1BE5A19e6450959bD"
      }
    },
    l1StandardBridge: {
      [sourceId$S]: {
        address: "0xa6b1A05a592719B0C8a70c69eac114C48410aDE4"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    }
  },
  sourceId: sourceId$S
});
const sourceId$R = 11155111;
const codexTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 812242,
  name: "Codex Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.codex-stg.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Codex Testnet Explorer",
      url: "https://explorer.codex-stg.xyz",
      apiUrl: "https://explorer.codex-stg.xyz/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$R]: {
        address: "0x390e24E8324E56f13A8d48eB938b6f9De24CD205"
      }
    },
    portal: {
      [sourceId$R]: {
        address: "0x037F161D12c829A9ca4742eEd9371830CA54fcB2"
      }
    },
    l1StandardBridge: {
      [sourceId$R]: {
        address: "0xCf4df2bDB14C8FDB25FdacCEC10Ce5C4bAEDB3De"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    }
  },
  sourceId: sourceId$R,
  testnet: true
});
const coinbit = /* @__PURE__ */ defineChain({
  id: 112,
  name: "Coinbit Mainnet",
  nativeCurrency: { name: "GIDR", symbol: "GIDR", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://coinbit-rpc-mainnet.chain.sbcrypto.app"]
    }
  },
  blockExplorers: {
    default: {
      name: "Coinbit Explorer",
      url: "https://coinbit-explorer.chain.sbcrypto.app"
    }
  },
  testnet: false
});
const coinex = /* @__PURE__ */ defineChain({
  id: 52,
  name: "CoinEx Mainnet",
  nativeCurrency: { name: "cet", symbol: "cet", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.coinex.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "CoinEx Explorer",
      url: "https://www.coinex.net"
    }
  },
  testnet: false
});
const confluxESpace = /* @__PURE__ */ defineChain({
  id: 1030,
  name: "Conflux eSpace",
  nativeCurrency: { name: "Conflux", symbol: "CFX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm.confluxrpc.com"],
      webSocket: ["wss://evm.confluxrpc.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "ConfluxScan",
      url: "https://evm.confluxscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xEFf0078910f638cd81996cc117bccD3eDf2B072F",
      blockCreated: 68602935
    }
  }
});
const confluxESpaceTestnet = /* @__PURE__ */ defineChain({
  id: 71,
  name: "Conflux eSpace Testnet",
  network: "cfx-espace-testnet",
  testnet: true,
  nativeCurrency: { name: "Conflux", symbol: "CFX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evmtestnet.confluxrpc.com"],
      webSocket: ["wss://evmtestnet.confluxrpc.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "ConfluxScan",
      url: "https://evmtestnet.confluxscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xEFf0078910f638cd81996cc117bccD3eDf2B072F",
      blockCreated: 117499050
    }
  }
});
const coreDao = /* @__PURE__ */ defineChain({
  id: 1116,
  name: "Core Dao",
  nativeCurrency: {
    decimals: 18,
    name: "Core",
    symbol: "CORE"
  },
  rpcUrls: {
    default: { http: ["https://rpc.coredao.org"] }
  },
  blockExplorers: {
    default: {
      name: "CoreDao",
      url: "https://scan.coredao.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 11907934
    }
  },
  testnet: false
});
const coreTestnet1 = /* @__PURE__ */ defineChain({
  id: 1115,
  name: "Core Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tCore",
    symbol: "TCORE"
  },
  rpcUrls: {
    default: { http: ["https://rpc.test.btcs.network"] }
  },
  blockExplorers: {
    default: {
      name: "Core Testnet",
      url: "https://scan.test.btcs.network",
      apiUrl: "https://api.test.btcs.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xCcddF20A1932537123C2E48Bd8e00b108B8f7569",
      blockCreated: 29350509
    }
  },
  testnet: true
});
const coreTestnet2 = /* @__PURE__ */ defineChain({
  id: 1114,
  name: "Core Testnet2",
  nativeCurrency: {
    decimals: 18,
    name: "tCore2",
    symbol: "TCORE2"
  },
  rpcUrls: {
    default: { http: ["https://rpc.test2.btcs.network"] }
  },
  blockExplorers: {
    default: {
      name: "Core Testnet2",
      url: "https://scan.test2.btcs.network",
      apiUrl: "https://api.test2.btcs.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x3CB285ff3Cd5C7C7e570b1E7DE3De17A0f985e56",
      blockCreated: 3838600
    }
  },
  testnet: true
});
const sourceId$Q = 1;
const corn = /* @__PURE__ */ defineChain({
  id: 21e6,
  name: "Corn",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcorn",
    symbol: "BTCN"
  },
  rpcUrls: {
    default: { http: ["https://21000000.rpc.thirdweb.com"] }
  },
  blockExplorers: {
    default: {
      name: "Corn Explorer",
      url: "https://cornscan.io",
      apiUrl: "https://api.routescan.io/v2/network/mainnet/evm/21000000/etherscan/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3228
    }
  },
  sourceId: sourceId$Q
});
const sourceId$P = 11155111;
const cornTestnet = /* @__PURE__ */ defineChain({
  id: 21000001,
  name: "Corn Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcorn",
    symbol: "BTCN"
  },
  rpcUrls: {
    default: { http: ["https://21000001.rpc.thirdweb.com"] }
  },
  blockExplorers: {
    default: {
      name: "Corn Testnet Explorer",
      url: "https://testnet.cornscan.io",
      apiUrl: "https://api.routescan.io/v2/network/testnet/evm/21000001/etherscan/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 4886
    }
  },
  testnet: true,
  sourceId: sourceId$P
});
const cpchain = /* @__PURE__ */ defineChain({
  id: 86608,
  name: "CpChain",
  nativeCurrency: {
    decimals: 18,
    name: "CpChain",
    symbol: "CP"
  },
  rpcUrls: {
    default: { http: ["https://rpc.cpchain.com"] }
  },
  blockExplorers: {
    default: {
      name: "CpChain Explorer",
      url: "https://explorer.cpchain.com"
    }
  },
  testnet: false
});
const crab = /* @__PURE__ */ defineChain({
  id: 44,
  name: "Crab Network",
  nativeCurrency: {
    decimals: 18,
    name: "Crab Network Native Token",
    symbol: "CRAB"
  },
  rpcUrls: {
    default: {
      http: ["https://crab-rpc.darwinia.network"],
      webSocket: ["wss://crab-rpc.darwinia.network"]
    }
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://crab-scan.darwinia.network" }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 3032593
    }
  }
});
const creatorTestnet = /* @__PURE__ */ defineChain({
  id: 66665,
  name: "Creator",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.creatorchain.io"]
    }
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.creatorchain.io" }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    }
  },
  testnet: true
});
const creditCoin3Devnet = /* @__PURE__ */ defineChain({
  id: 102032,
  name: "Creditcoin Devnet",
  nativeCurrency: { name: "Devnet CTC", symbol: "devCTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.cc3-devnet.creditcoin.network"],
      webSocket: ["wss://rpc.cc3-devnet.creditcoin.network/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://creditcoin-devnet.blockscout.com",
      apiUrl: "https://creditcoin3-dev.subscan.io"
    }
  },
  testnet: true
});
const creditCoin3Mainnet = /* @__PURE__ */ defineChain({
  id: 102030,
  name: "Creditcoin",
  nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet3.creditcoin.network"],
      webSocket: ["wss://mainnet3.creditcoin.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://creditcoin.blockscout.com",
      apiUrl: "https://creditcoin.blockscout.com/api"
    }
  },
  testnet: false
});
const creditCoin3Testnet = /* @__PURE__ */ defineChain({
  id: 102031,
  name: "Creditcoin Testnet",
  nativeCurrency: { name: "Creditcoin Testnet", symbol: "tCTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.cc3-testnet.creditcoin.network"],
      webSocket: ["wss://rpc.cc3-testnet.creditcoin.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://creditcoin-testnet.blockscout.com",
      apiUrl: "https://creditcoin-testnet.blockscout.com/api"
    }
  },
  testnet: true
});
const cronos = /* @__PURE__ */ defineChain({
  id: 25,
  name: "Cronos Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Cronos",
    symbol: "CRO"
  },
  rpcUrls: {
    default: { http: ["https://evm.cronos.org"] }
  },
  blockExplorers: {
    default: {
      name: "Cronos Explorer",
      url: "https://explorer.cronos.org",
      apiUrl: "https://explorer-api.cronos.org/mainnet/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1963112
    }
  }
});
const cronosTestnet = /* @__PURE__ */ defineChain({
  id: 338,
  name: "Cronos Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "CRO",
    symbol: "tCRO"
  },
  rpcUrls: {
    default: { http: ["https://evm-t3.cronos.org"] }
  },
  blockExplorers: {
    default: {
      name: "Cronos Explorer (Testnet)",
      url: "https://explorer.cronos.org/testnet"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 10191251
    }
  },
  testnet: true
});
const cronoszkEVM = /* @__PURE__ */ defineChain({
  id: 388,
  name: "Cronos zkEVM Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Cronos zkEVM CRO",
    symbol: "zkCRO"
  },
  rpcUrls: {
    default: { http: ["https://mainnet.zkevm.cronos.org"] }
  },
  blockExplorers: {
    default: {
      name: "Cronos zkEVM (Mainnet) Chain Explorer",
      url: "https://explorer.zkevm.cronos.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0x06f4487d7c4a5983d2660db965cc6d2565e4cfaa",
      blockCreated: 72
    }
  }
});
const cronoszkEVMTestnet = /* @__PURE__ */ defineChain({
  id: 282,
  name: "Cronos zkEVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Cronos zkEVM Test Coin",
    symbol: "zkTCRO"
  },
  rpcUrls: {
    default: { http: ["https://testnet.zkevm.cronos.org"] }
  },
  blockExplorers: {
    default: {
      name: "Cronos zkEVM Testnet Explorer",
      url: "https://explorer.zkevm.cronos.org/testnet"
    }
  },
  testnet: true
});
const crossbell = /* @__PURE__ */ defineChain({
  id: 3737,
  name: "Crossbell",
  nativeCurrency: {
    decimals: 18,
    name: "CSB",
    symbol: "CSB"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.crossbell.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "CrossScan",
      url: "https://scan.crossbell.io",
      apiUrl: "https://scan.crossbell.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 38246031
    }
  }
});
const crossfi = /* @__PURE__ */ defineChain({
  id: 4158,
  name: "CrossFi Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "CrossFi",
    symbol: "XFI"
  },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.ms"] }
  },
  blockExplorers: {
    default: {
      name: "CrossFi Blockchain Explorer",
      url: "https://xfiscan.com"
    }
  },
  testnet: false
});
const curtis = /* @__PURE__ */ defineChain({
  id: 33111,
  name: "Curtis",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.curtis.apechain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Curtis Explorer",
      url: "https://explorer.curtis.apechain.com"
    }
  },
  testnet: true
});
const cyber = /* @__PURE__ */ defineChain({
  id: 7560,
  name: "Cyber",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://cyber.alt.technology"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://cyberscan.co",
      apiUrl: "https://cyberscan.co/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  }
});
const cyberTestnet = /* @__PURE__ */ defineChain({
  id: 111557560,
  name: "Cyber Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://cyber-testnet.alt.technology"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://testnet.cyberscan.co",
      apiUrl: "https://testnet.cyberscan.co/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xffc391F0018269d4758AEA1a144772E8FB99545E",
      blockCreated: 304545
    }
  },
  testnet: true
});
const dailyNetwork = /* @__PURE__ */ defineChain({
  id: 824,
  name: "Daily Network Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Daily",
    symbol: "DLY"
  },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.dailycrypto.net"] }
  },
  blockExplorers: {
    default: {
      name: "Daily Mainnet Explorer",
      url: "https://explorer.mainnet.dailycrypto.net"
    }
  },
  testnet: false
});
const dailyNetworkTestnet = /* @__PURE__ */ defineChain({
  id: 825,
  name: "Daily Network Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Daily",
    symbol: "DLY"
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.dailycrypto.net"] }
  },
  blockExplorers: {
    default: {
      name: "Daily Testnet Explorer",
      url: "https://explorer.testnet.dailycrypto.net"
    }
  },
  testnet: true
});
const darwinia = /* @__PURE__ */ defineChain({
  id: 46,
  name: "Darwinia Network",
  nativeCurrency: {
    decimals: 18,
    name: "RING",
    symbol: "RING"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.darwinia.network"],
      webSocket: ["wss://rpc.darwinia.network"]
    }
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.darwinia.network" }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 69420
    }
  }
});
const datahavenTestnet = /* @__PURE__ */ defineChain({
  id: 55931,
  name: "Datahaven Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MOCK",
    symbol: "MOCK"
  },
  rpcUrls: {
    default: {
      http: ["https://services.datahaven-testnet.network/testnet"],
      webSocket: ["wss://services.datahaven-testnet.network/testnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "DhScan",
      url: "https://testnet.dhscan.io/",
      apiUrl: "https://testnet.dhscan.io/api-docs"
    }
  },
  contracts: {},
  testnet: true
});
const dbkchain = /* @__PURE__ */ defineChain({
  id: 20240603,
  name: "DBK chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.dbkchain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "DBK Chain Explorer",
      url: "https://scan.dbkchain.io"
    }
  },
  testnet: false
});
const dchain = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 2716446429837e3,
  name: "Dchain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://dchain-2716446429837000-1.jsonrpc.sagarpc.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Dchain Explorer",
      url: "https://dchain-2716446429837000-1.sagaexplorer.io",
      apiUrl: "https://api-dchain-2716446429837000-1.sagaexplorer.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts
  }
});
const dchainTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 2713017997578e3,
  name: "Dchain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://dchaintestnet-2713017997578000-1.jsonrpc.testnet.sagarpc.io"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Dchain Explorer",
      url: "https://dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io",
      apiUrl: "https://api-dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts
  },
  testnet: true
});
const defichainEvm = /* @__PURE__ */ defineChain({
  id: 1130,
  network: "defichain-evm",
  name: "DeFiChain EVM Mainnet",
  nativeCurrency: {
    name: "DeFiChain",
    symbol: "DFI",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://eth.mainnet.ocean.jellyfishsdk.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "DeFiScan",
      url: "https://meta.defiscan.live"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 137852
    }
  }
});
const defichainEvmTestnet = /* @__PURE__ */ defineChain({
  id: 1131,
  network: "defichain-evm-testnet",
  name: "DeFiChain EVM Testnet",
  nativeCurrency: {
    name: "DeFiChain",
    symbol: "DFI",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://eth.testnet.ocean.jellyfishsdk.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "DeFiScan",
      url: "https://meta.defiscan.live/?network=TestNet"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 156462
    }
  },
  testnet: true
});
const degen = /* @__PURE__ */ defineChain({
  id: 666666666,
  name: "Degen",
  nativeCurrency: {
    decimals: 18,
    name: "Degen",
    symbol: "DEGEN"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.degen.tips"],
      webSocket: ["wss://rpc.degen.tips"]
    }
  },
  blockExplorers: {
    default: {
      name: "Degen Chain Explorer",
      url: "https://explorer.degen.tips",
      apiUrl: "https://explorer.degen.tips/api/v2"
    }
  }
});
const dfk = /* @__PURE__ */ defineChain({
  id: 53935,
  name: "DFK Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Jewel",
    symbol: "JEWEL"
  },
  rpcUrls: {
    default: {
      http: ["https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "DFKSubnetScan",
      url: "https://subnets.avax.network/defi-kingdoms"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14790551
    }
  }
});
const diode = /* @__PURE__ */ defineChain({
  id: 15,
  name: "Diode Prenet",
  nativeCurrency: {
    decimals: 18,
    name: "DIODE",
    symbol: "DIODE"
  },
  rpcUrls: {
    default: {
      http: ["https://prenet.diode.io:8443"],
      webSocket: ["wss://prenet.diode.io:8443/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Diode Explorer",
      url: "https://diode.io/prenet"
    }
  },
  testnet: false
});
const disChain = /* @__PURE__ */ defineChain({
  id: 513100,
  name: "DisChain",
  nativeCurrency: {
    decimals: 18,
    name: "DIS",
    symbol: "DIS"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.dischain.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "DisChain Explorer",
      url: "https://www.oklink.com/dis"
    }
  }
});
const dodochainTestnet = /* @__PURE__ */ defineChain({
  id: 53457,
  name: "DODOchain Testnet",
  nativeCurrency: { decimals: 18, name: "DODO", symbol: "DODO" },
  rpcUrls: {
    default: {
      http: ["https://dodochain-testnet.alt.technology"],
      webSocket: ["wss://dodochain-testnet.alt.technology/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "DODOchain Testnet (Sepolia) Explorer",
      url: "https://testnet-scan.dodochain.com"
    }
  },
  testnet: true
});
const dogechain = /* @__PURE__ */ defineChain({
  id: 2e3,
  name: "Dogechain",
  nativeCurrency: {
    decimals: 18,
    name: "Wrapped Dogecoin",
    symbol: "WDOGE"
  },
  rpcUrls: {
    default: { http: ["https://rpc.dogechain.dog"] }
  },
  blockExplorers: {
    default: {
      name: "DogeChainExplorer",
      url: "https://explorer.dogechain.dog",
      apiUrl: "https://explorer.dogechain.dog/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x68a8609a60a008EFA633dfdec592c03B030cC508",
      blockCreated: 25384031
    }
  }
});
const domaTestnet = /* @__PURE__ */ defineChain({
  id: 97476,
  name: "Doma Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.doma.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Doma Testnet Explorer",
      url: "https://explorer-testnet.doma.xyz"
    }
  },
  testnet: true
});
const donatuz = /* @__PURE__ */ defineChain({
  id: 42026,
  name: "Donatuz",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://rpc.donatuz.com"] }
  },
  blockExplorers: {
    default: {
      name: "Donatuz Explorer",
      url: "https://explorer.donatuz.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    }
  }
});
const dosChain = /* @__PURE__ */ defineChain({
  id: 7979,
  name: "DOS Chain",
  nativeCurrency: {
    decimals: 18,
    name: "DOS Chain",
    symbol: "DOS"
  },
  rpcUrls: {
    default: { http: ["https://main.doschain.com"] }
  },
  blockExplorers: {
    default: {
      name: "DOS Chain Explorer",
      url: "https://doscan.io",
      apiUrl: "https://api.doscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 161908
    }
  }
});
const dosChainTestnet = /* @__PURE__ */ defineChain({
  id: 3939,
  name: "DOS Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "DOS Chain Testnet",
    symbol: "DOS"
  },
  rpcUrls: {
    default: { http: ["https://test.doschain.com"] }
  },
  blockExplorers: {
    default: {
      name: "DOS Chain Testnet Explorer",
      url: "https://test.doscan.io",
      apiUrl: "https://api-test.doscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 69623
    }
  },
  testnet: true
});
const dreyerxMainnet = /* @__PURE__ */ defineChain({
  id: 23451,
  name: "DreyerX Mainnet",
  nativeCurrency: {
    name: "DreyerX",
    symbol: "DRX",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.dreyerx.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "DreyerX Scan",
      url: "https://scan.dreyerx.com"
    }
  }
});
const dreyerxTestnet = /* @__PURE__ */ defineChain({
  id: 23452,
  name: "DreyerX Testnet",
  nativeCurrency: {
    name: "DreyerX",
    symbol: "DRX",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["http://testnet-rpc.dreyerx.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "DreyerX Testnet Scan",
      url: "https://testnet-scan.dreyerx.com"
    }
  },
  testnet: true
});
const dustboyIoT = /* @__PURE__ */ defineChain({
  id: 555888,
  name: "DustBoy IoT",
  nativeCurrency: { name: "Ether", symbol: "DST", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://dustboy-rpc.jibl2.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://dustboy.jibl2.com",
      apiUrl: "https://dustboy.jibl2.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xFFD34aa2C62B2D52E00A361e466C229788f4eD6a",
      blockCreated: 526569
    }
  },
  testnet: false
});
const dymension = /* @__PURE__ */ defineChain({
  id: 1100,
  name: "Dymension",
  nativeCurrency: {
    name: "DYM",
    symbol: "DYM",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://dymension-evm-rpc.publicnode.com"],
      webSocket: ["wss://dymension-evm-rpc.publicnode.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Dym FYI",
      url: "https://dym.fyi"
    }
  },
  testnet: false
});
const eden = /* @__PURE__ */ defineChain({
  id: 714,
  name: "Eden",
  nativeCurrency: {
    name: "TIA",
    symbol: "TIA",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.eden.gateway.fm"]
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://eden.blockscout.com",
      apiUrl: "https://eden.blockscout.com/api"
    }
  }
});
const edexa = /* @__PURE__ */ defineChain({
  id: 5424,
  name: "edeXa",
  nativeCurrency: { name: "edeXa", symbol: "EDX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.edexa.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "edeXa Explorer",
      url: "https://explorer.edexa.network",
      apiUrl: "https://explorer.edexa.network/api/v2"
    }
  }
});
const edexaTestnet = /* @__PURE__ */ defineChain({
  id: 1995,
  name: "edeXa Testnet",
  nativeCurrency: { name: "edeXa", symbol: "tEDX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.edexa.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "edeXa Testnet Explorer",
      url: "https://explorer.testnet.edexa.network",
      apiUrl: "https://explorer.testnet.edexa.network/api/v2"
    }
  },
  testnet: true
});
const edgeless = /* @__PURE__ */ defineChain({
  id: 2026,
  name: "Edgeless Network",
  nativeCurrency: {
    name: "Edgeless Wrapped ETH",
    symbol: "EwETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.edgeless.network/http"],
      webSocket: ["wss://rpc.edgeless.network/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Edgeless Explorer",
      url: "https://explorer.edgeless.network"
    }
  }
});
const edgelessTestnet = /* @__PURE__ */ defineChain({
  id: 202,
  name: "Edgeless Testnet",
  nativeCurrency: {
    name: "Edgeless Wrapped ETH",
    symbol: "EwETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://edgeless-testnet.rpc.caldera.xyz/http"],
      webSocket: ["wss://edgeless-testnet.rpc.caldera.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Edgeless Testnet Explorer",
      url: "https://testnet.explorer.edgeless.network"
    }
  },
  testnet: true
});
const edgeware = /* @__PURE__ */ defineChain({
  id: 2021,
  name: "Edgeware EdgeEVM Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Edgeware",
    symbol: "EDG"
  },
  rpcUrls: {
    default: { http: ["https://edgeware-evm.jelliedowl.net"] }
  },
  blockExplorers: {
    default: {
      name: "Edgscan by Bharathcoorg",
      url: "https://edgscan.live",
      apiUrl: "https://edgscan.live/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 18117872
    }
  }
});
const edgewareTestnet = /* @__PURE__ */ defineChain({
  id: 2022,
  name: "Beresheet BereEVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Testnet EDG",
    symbol: "tEDG"
  },
  rpcUrls: {
    default: { http: ["https://beresheet-evm.jelliedowl.net"] }
  },
  blockExplorers: {
    default: {
      name: "Edgscan by Bharathcoorg",
      url: "https://testnet.edgscan.live",
      apiUrl: "https://testnet.edgscan.live/api"
    }
  },
  testnet: true
});
const eduChain = /* @__PURE__ */ defineChain({
  id: 41923,
  name: "EDU Chain",
  nativeCurrency: {
    decimals: 18,
    name: "EDU",
    symbol: "EDU"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.edu-chain.raas.gelato.cloud"]
    }
  },
  blockExplorers: {
    default: {
      name: "EDU Chain Explorer",
      url: "https://educhain.blockscout.com/"
    }
  },
  testnet: false
});
const eduChainTestnet = /* @__PURE__ */ defineChain({
  id: 656476,
  name: "EDU Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "EDU",
    symbol: "EDU"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.open-campus-codex.gelato.digital/"],
      webSocket: ["wss://ws.open-campus-codex.gelato.digital"]
    }
  },
  blockExplorers: {
    default: {
      name: "EDU Chain Testnet Explorer",
      url: "https://opencampus-codex.blockscout.com",
      apiUrl: "https://opencampus-codex.blockscout.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 15514133
    }
  },
  testnet: true
});
const elastos = /* @__PURE__ */ defineChain({
  id: 20,
  name: "Elastos Smart Chain",
  nativeCurrency: { name: "ELA", symbol: "ELA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api2.elastos.io/eth"]
    }
  },
  blockExplorers: {
    default: {
      name: "Elastos Explorer",
      url: "https://esc.elastos.io"
    }
  },
  testnet: false
});
const elastosTestnet = /* @__PURE__ */ defineChain({
  id: 21,
  name: "Elastos Smart Chain Testnet",
  nativeCurrency: { name: "tELA", symbol: "tELA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api-testnet.elastos.io/eth"]
    }
  },
  blockExplorers: {
    default: {
      name: "Elastos Explorer",
      url: "https://esc-testnet.elastos.io"
    }
  },
  testnet: true
});
const electroneum = /* @__PURE__ */ defineChain({
  id: 52014,
  name: "Electroneum Mainnet",
  nativeCurrency: {
    name: "ETN",
    symbol: "ETN",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.electroneum.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Electroneum Block Explorer",
      url: "https://blockexplorer.electroneum.com"
    }
  },
  testnet: false
});
const electroneumTestnet = /* @__PURE__ */ defineChain({
  id: 5201420,
  name: "Electroneum Testnet",
  nativeCurrency: {
    name: "ETN",
    symbol: "ETN",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.electroneum.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Electroneum Block Explorer",
      url: "https://blockexplorer.thesecurityteam.rocks"
    }
  },
  testnet: true
});
const elysiumTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1338,
  name: "Elysium Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "LAVA",
    symbol: "LAVA"
  },
  rpcUrls: {
    default: {
      http: ["https://elysium-test-rpc.vulcanforged.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Elysium testnet explorer",
      url: "https://elysium-explorer.vulcanforged.com"
    }
  },
  testnet: true
});
const energy = /* @__PURE__ */ defineChain({
  id: 246,
  name: "Energy Mainnet",
  nativeCurrency: { name: "EWT", symbol: "EWT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.energyweb.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "EnergyWeb Explorer",
      url: "https://explorer.energyweb.org"
    }
  },
  testnet: false
});
const eni = /* @__PURE__ */ defineChain({
  id: 173,
  name: "ENI Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "ENI",
    symbol: "ENI"
  },
  rpcUrls: {
    default: { http: ["https://rpc.eniac.network"] }
  },
  blockExplorers: {
    default: {
      name: "ENI Explorer",
      url: "https://scan.eniac.network"
    }
  },
  testnet: false
});
const eniTestnet = /* @__PURE__ */ defineChain({
  id: 6912115,
  name: "ENI Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ENI Testnet Token",
    symbol: "ENI"
  },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.eniac.network"] }
  },
  blockExplorers: {
    default: {
      name: "ENI Testnet Explorer",
      url: "https://scan-testnet.eniac.network"
    }
  },
  testnet: true
});
const enuls = /* @__PURE__ */ defineChain({
  id: 119,
  name: "ENULS Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "NULS",
    symbol: "NULS"
  },
  rpcUrls: {
    default: { http: ["https://evmapi2.nuls.io"] }
  },
  blockExplorers: {
    default: {
      name: "ENULS Explorer",
      url: "https://evmscan.nuls.io"
    }
  },
  testnet: false
});
const eon = /* @__PURE__ */ defineChain({
  id: 7332,
  name: "Horizen EON",
  nativeCurrency: {
    decimals: 18,
    name: "ZEN",
    symbol: "ZEN"
  },
  rpcUrls: {
    default: { http: ["https://eon-rpc.horizenlabs.io/ethv1"] }
  },
  blockExplorers: {
    default: {
      name: "EON Explorer",
      url: "https://eon-explorer.horizenlabs.io"
    }
  },
  contracts: {}
});
const eos = /* @__PURE__ */ defineChain({
  id: 17777,
  name: "EOS EVM",
  nativeCurrency: {
    decimals: 18,
    name: "EOS",
    symbol: "EOS"
  },
  rpcUrls: {
    default: { http: ["https://api.evm.eosnetwork.com"] }
  },
  blockExplorers: {
    default: {
      name: "EOS EVM Explorer",
      url: "https://explorer.evm.eosnetwork.com",
      apiUrl: "https://explorer.evm.eosnetwork.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 7943933
    }
  }
});
const eosTestnet = /* @__PURE__ */ defineChain({
  id: 15557,
  name: "EOS EVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "EOS",
    symbol: "EOS"
  },
  rpcUrls: {
    default: { http: ["https://api.testnet.evm.eosnetwork.com"] }
  },
  blockExplorers: {
    default: {
      name: "EOS EVM Testnet Explorer",
      url: "https://explorer.testnet.evm.eosnetwork.com",
      apiUrl: "https://explorer.testnet.evm.eosnetwork.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 9067940
    }
  },
  testnet: true
});
const eteria = /* @__PURE__ */ defineChain({
  id: 140,
  name: "Eteria",
  nativeCurrency: { name: "Eteria", symbol: "ERA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.eteria.io/v1"]
    }
  },
  blockExplorers: {
    default: {
      name: "Eteria Explorer",
      url: "https://explorer.eteria.io",
      apiUrl: "https://explorer.eteria.io/api"
    }
  }
});
const etherlink = /* @__PURE__ */ defineChain({
  id: 42793,
  name: "Etherlink",
  blockTime: 4830,
  nativeCurrency: {
    decimals: 18,
    name: "Tez",
    symbol: "XTZ"
  },
  rpcUrls: {
    default: { http: ["https://node.mainnet.etherlink.com"] }
  },
  blockExplorers: {
    default: {
      name: "Etherlink",
      url: "https://explorer.etherlink.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 33899
    }
  }
});
const etherlinkShadownetTestnet = /* @__PURE__ */ defineChain({
  id: 127823,
  name: "Etherlink Shadownet Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tez",
    symbol: "XTZ"
  },
  rpcUrls: {
    default: { http: ["https://node.shadownet.etherlink.com"] }
  },
  blockExplorers: {
    default: {
      name: "Etherlink Shadownet Testnet Explorer",
      url: "https://shadownet.explorer.etherlink.com"
    }
  },
  testnet: true
});
const etherlinkTestnet = /* @__PURE__ */ defineChain({
  id: 128123,
  name: "Etherlink Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Tez",
    symbol: "XTZ"
  },
  rpcUrls: {
    default: { http: ["https://node.ghostnet.etherlink.com"] }
  },
  blockExplorers: {
    default: {
      name: "Etherlink Testnet",
      url: "https://testnet.explorer.etherlink.com"
    }
  },
  testnet: true
});
const ethernity = /* @__PURE__ */ defineChain({
  id: 183,
  name: "Ethernity",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://mainnet.ethernitychain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Ethernity Explorer",
      url: "https://ernscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  },
  testnet: false
});
const etp = /* @__PURE__ */ defineChain({
  id: 20256789,
  name: "ETP Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETP Chain Native Token",
    symbol: "ETP"
  },
  rpcUrls: {
    default: { http: ["https://rpc.etpscan.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "ETP Scan",
      url: "https://etpscan.xyz"
    }
  }
});
const evmos = /* @__PURE__ */ defineChain({
  id: 9001,
  name: "Evmos",
  nativeCurrency: {
    decimals: 18,
    name: "Evmos",
    symbol: "EVMOS"
  },
  rpcUrls: {
    default: { http: ["https://eth.bd.evmos.org:8545"] }
  },
  blockExplorers: {
    default: {
      name: "Evmos Block Explorer",
      url: "https://escan.live"
    }
  }
});
const evmosTestnet = /* @__PURE__ */ defineChain({
  id: 9e3,
  name: "Evmos Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Evmos",
    symbol: "EVMOS"
  },
  rpcUrls: {
    default: { http: ["https://eth.bd.evmos.dev:8545"] }
  },
  blockExplorers: {
    default: {
      name: "Evmos Testnet Block Explorer",
      url: "https://evm.evmos.dev/"
    }
  },
  testnet: true
});
const excelonMainnet = /* @__PURE__ */ defineChain({
  id: 22052002,
  name: "Excelon Mainnet",
  network: "XLON",
  nativeCurrency: {
    decimals: 18,
    name: "Excelon",
    symbol: "xlon"
  },
  rpcUrls: {
    default: {
      http: ["https://edgewallet1.xlon.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Excelon explorer",
      url: "https://explorer.excelon.io"
    }
  }
});
const expanse = /* @__PURE__ */ defineChain({
  id: 2,
  name: "Expanse Network",
  nativeCurrency: {
    decimals: 18,
    name: "EXP",
    symbol: "EXP"
  },
  rpcUrls: {
    default: { http: ["https://node.expanse.tech"] }
  },
  blockExplorers: {
    default: {
      name: "Expanse Explorer",
      url: "https://explorer.expanse.tech"
    }
  },
  testnet: false
});
const exsat = /* @__PURE__ */ defineChain({
  id: 7200,
  name: "exSat Network",
  nativeCurrency: {
    decimals: 18,
    name: "BTC",
    symbol: "BTC"
  },
  rpcUrls: {
    default: { http: ["https://evm.exsat.network"] }
  },
  blockExplorers: {
    default: {
      name: "exSat Explorer",
      url: "https://scan.exsat.network",
      apiUrl: "https://scan.exsat.network/api"
    }
  }
});
const exsatTestnet = /* @__PURE__ */ defineChain({
  id: 839999,
  name: "exSat Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BTC",
    symbol: "BTC"
  },
  rpcUrls: {
    default: { http: ["https://evm-tst3.exsat.network"] }
  },
  blockExplorers: {
    default: {
      name: "exSat Explorer",
      url: "https://scan-testnet.exsat.network",
      apiUrl: "https://scan-testnet.exsat.network/api"
    }
  },
  testnet: true
});
const fantom = /* @__PURE__ */ defineChain({
  id: 250,
  name: "Fantom",
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM"
  },
  rpcUrls: {
    default: { http: ["https://250.rpc.thirdweb.com"] }
  },
  blockExplorers: {
    default: {
      name: "FTMScan",
      url: "https://ftmscan.com",
      apiUrl: "https://api.ftmscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 33001987
    }
  }
});
const fantomSonicTestnet = /* @__PURE__ */ defineChain({
  id: 64240,
  name: "Fantom Sonic Open Testnet",
  network: "fantom-sonic-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM"
  },
  rpcUrls: {
    default: { http: ["https://rpcapi.sonic.fantom.network"] }
  },
  blockExplorers: {
    default: {
      name: "Fantom Sonic Open Testnet Explorer",
      url: "https://public-sonic.fantom.network"
    }
  },
  testnet: true
});
const fantomTestnet = /* @__PURE__ */ defineChain({
  id: 4002,
  name: "Fantom Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Fantom",
    symbol: "FTM"
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.fantom.network"] }
  },
  blockExplorers: {
    default: {
      name: "FTMScan",
      url: "https://testnet.ftmscan.com",
      apiUrl: "https://testnet.ftmscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 8328688
    }
  },
  testnet: true
});
const fibo = /* @__PURE__ */ defineChain({
  id: 12306,
  name: "Fibo Chain",
  nativeCurrency: {
    decimals: 18,
    name: "fibo",
    symbol: "FIBO"
  },
  rpcUrls: {
    default: { http: ["https://network.hzroc.art"] }
  },
  blockExplorers: {
    default: {
      name: "FiboScan",
      url: "https://scan.fibochain.org"
    }
  }
});
const filecoin = /* @__PURE__ */ defineChain({
  id: 314,
  name: "Filecoin Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "filecoin",
    symbol: "FIL"
  },
  rpcUrls: {
    default: { http: ["https://api.node.glif.io/rpc/v1"] }
  },
  blockExplorers: {
    default: {
      name: "Filfox",
      url: "https://filfox.info/en"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3328594
    }
  }
});
const filecoinCalibration = /* @__PURE__ */ defineChain({
  id: 314159,
  name: "Filecoin Calibration",
  nativeCurrency: {
    decimals: 18,
    name: "testnet filecoin",
    symbol: "tFIL"
  },
  rpcUrls: {
    default: { http: ["https://api.calibration.node.glif.io/rpc/v1"] }
  },
  blockExplorers: {
    default: {
      name: "Filscan",
      url: "https://calibration.filscan.io"
    }
  },
  testnet: true
});
const filecoinHyperspace = /* @__PURE__ */ defineChain({
  id: 3141,
  name: "Filecoin Hyperspace",
  nativeCurrency: {
    decimals: 18,
    name: "testnet filecoin",
    symbol: "tFIL"
  },
  rpcUrls: {
    default: { http: ["https://api.hyperspace.node.glif.io/rpc/v1"] }
  },
  blockExplorers: {
    default: {
      name: "Filfox",
      url: "https://hyperspace.filfox.info/en"
    }
  },
  testnet: true
});
const flame = /* @__PURE__ */ defineChain({
  id: 253368190,
  name: "Flame",
  network: "flame",
  nativeCurrency: {
    symbol: "TIA",
    name: "TIA",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.flame.astria.org"],
      webSocket: ["wss://ws.flame.astria.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Flame Explorer",
      url: "https://explorer.flame.astria.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 6829148
    }
  }
});
const flare = /* @__PURE__ */ defineChain({
  id: 14,
  name: "Flare Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Flare",
    symbol: "FLR"
  },
  rpcUrls: {
    default: { http: ["https://flare-api.flare.network/ext/C/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Flare Explorer",
      url: "https://flare-explorer.flare.network",
      apiUrl: "https://flare-explorer.flare.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3002461
    }
  }
});
const flareTestnet = /* @__PURE__ */ defineChain({
  id: 114,
  name: "Flare Testnet Coston2",
  nativeCurrency: {
    decimals: 18,
    name: "Coston2 Flare",
    symbol: "C2FLR"
  },
  rpcUrls: {
    default: { http: ["https://coston2-api.flare.network/ext/C/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Coston2 Explorer",
      url: "https://coston2-explorer.flare.network",
      apiUrl: "https://coston2-explorer.flare.network/api"
    }
  },
  testnet: true
});
const flowMainnet = /* @__PURE__ */ defineChain({
  id: 747,
  name: "Flow EVM Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Flow",
    symbol: "FLOW"
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.evm.nodes.onflow.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Mainnet Explorer",
      url: "https://evm.flowscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 6205
    }
  },
  blockTime: 800
});
const flowPreviewnet = /* @__PURE__ */ defineChain({
  id: 646,
  name: "Flow EVM Previewnet",
  nativeCurrency: {
    decimals: 18,
    name: "Flow",
    symbol: "FLOW"
  },
  rpcUrls: {
    default: {
      http: ["https://previewnet.evm.nodes.onflow.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Previewnet Explorer",
      url: "https://previewnet.flowdiver.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 6205
    }
  },
  testnet: true
});
const flowTestnet = /* @__PURE__ */ defineChain({
  id: 545,
  name: "Flow EVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Flow",
    symbol: "FLOW"
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.evm.nodes.onflow.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Flow Diver",
      url: "https://evm-testnet.flowscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 137518
    }
  },
  testnet: true,
  blockTime: 800
});
const fluence = /* @__PURE__ */ defineChain({
  id: 9999999,
  name: "Fluence",
  nativeCurrency: { name: "FLT", symbol: "FLT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.fluence.dev"],
      webSocket: ["wss://ws.mainnet.fluence.dev"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout.mainnet.fluence.dev",
      apiUrl: "https://blockscout.mainnet.fluence.dev/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 207583
    }
  }
});
const fluenceStage = /* @__PURE__ */ defineChain({
  id: 123420000220,
  name: "Fluence Stage",
  nativeCurrency: { name: "tFLT", symbol: "tFLT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.stage.fluence.dev"],
      webSocket: ["wss://ws.stage.fluence.dev"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout.stage.fluence.dev",
      apiUrl: "https://blockscout.stage.fluence.dev/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 83227
    }
  },
  testnet: true
});
const fluenceTestnet = /* @__PURE__ */ defineChain({
  id: 52164803,
  name: "Fluence Testnet",
  nativeCurrency: { name: "tFLT", symbol: "tFLT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.fluence.dev"],
      webSocket: ["wss://ws.testnet.fluence.dev"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout.testnet.fluence.dev",
      apiUrl: "https://blockscout.testnet.fluence.dev/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 96424
    }
  },
  testnet: true
});
const fluent = /* @__PURE__ */ defineChain({
  id: 25363,
  name: "Fluent",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.fluent.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Fluent Explorer",
      url: "https://fluentscan.xyz"
    }
  },
  testnet: false
});
const fluentDevnet = /* @__PURE__ */ defineChain({
  id: 20993,
  name: "Fluent Devnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.devnet.fluent.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Fluent Devnet Explorer",
      url: "https://devnet.fluentscan.xyz"
    }
  },
  testnet: true
});
const fluentTestnet = /* @__PURE__ */ defineChain({
  id: 20994,
  name: "Fluent Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.fluent.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Fluent Testnet Explorer",
      url: "https://testnet.fluentscan.xyz"
    }
  },
  testnet: true
});
const sourceId$O = 1;
const form = /* @__PURE__ */ defineChain({
  id: 478,
  name: "Form Network",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.form.network/http"],
      webSocket: ["wss://rpc.form.network/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Form Explorer",
      url: "https://explorer.form.network"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    addressManager: {
      [sourceId$O]: {
        address: "0x15c249E46A2F924C2dB3A1560CF86729bAD1f07B"
      }
    },
    l1CrossDomainMessenger: {
      [sourceId$O]: {
        address: "0xF333158DCCad1dF6C3F0a3aEe8BC31fA94d9eD5c"
      }
    },
    l2OutputOracle: {
      [sourceId$O]: {
        address: "0x4ccAAF69F41c5810cA875183648B577CaCf1F67E"
      }
    },
    portal: {
      [sourceId$O]: {
        address: "0x4E259Ee5F4136408908160dD32295A5031Fa426F"
      }
    },
    l1StandardBridge: {
      [sourceId$O]: {
        address: "0xdc20aA63D3DE59574E065957190D8f24e0F7B8Ba"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    }
  },
  sourceId: sourceId$O
});
const forma = /* @__PURE__ */ defineChain({
  id: 984122,
  name: "Forma",
  network: "forma",
  nativeCurrency: {
    symbol: "TIA",
    name: "TIA",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.forma.art"],
      webSocket: ["wss://ws.forma.art"]
    }
  },
  blockExplorers: {
    default: {
      name: "Forma Explorer",
      url: "https://explorer.forma.art"
    }
  },
  contracts: {
    multicall3: {
      address: "0xd53C6FFB123F7349A32980F87faeD8FfDc9ef079",
      blockCreated: 252705
    }
  }
});
const sourceId$N = 11155111;
const formTestnet = /* @__PURE__ */ defineChain({
  id: 132902,
  name: "Form Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.form.network/http"],
      webSocket: ["wss://sepolia-rpc.form.network/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Form Testnet Explorer",
      url: "https://sepolia-explorer.form.network"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    addressManager: {
      [sourceId$N]: {
        address: "0xd5C38fa934f7fd7477D4800F4f38a1c5BFdF1373"
      }
    },
    l1CrossDomainMessenger: {
      [sourceId$N]: {
        address: "0x37A68565c4BE9700b3E3Ec60cC4416cAC3052FAa"
      }
    },
    l2OutputOracle: {
      [sourceId$N]: {
        address: "0x9eA2239E65a59EC9C7F1ED4C116dD58Da71Fc1e2"
      }
    },
    portal: {
      [sourceId$N]: {
        address: "0x60377e3cE15dF4CCA24c4beF076b60314240b032"
      }
    },
    l1StandardBridge: {
      [sourceId$N]: {
        address: "0xD4531f633942b2725896F47cD2aFd260b44Ab1F7"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    }
  },
  testnet: true,
  sourceId: sourceId$N
});
const forta = /* @__PURE__ */ defineChain({
  id: 80931,
  name: "Forta Chain",
  nativeCurrency: {
    symbol: "FORT",
    name: "FORT",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-forta-chain-8gj1qndmfc.t.conduit.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Forta Explorer",
      url: "https://explorer.forta.org"
    }
  }
});
const foundry = /* @__PURE__ */ defineChain({
  id: 31337,
  name: "Foundry",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
      webSocket: ["ws://127.0.0.1:8545"]
    }
  }
});
const sourceId$M = 1;
const fraxtal = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 252,
  name: "Fraxtal",
  nativeCurrency: { name: "Frax", symbol: "FRAX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.frax.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "fraxscan",
      url: "https://fraxscan.com",
      apiUrl: "https://api.fraxscan.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$M]: {
        address: "0x66CC916Ed5C6C2FA97014f7D1cD141528Ae171e4"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    },
    portal: {
      [sourceId$M]: {
        address: "0x36cb65c1967A0Fb0EEE11569C51C2f2aA1Ca6f6D",
        blockCreated: 19135323
      }
    },
    l1StandardBridge: {
      [sourceId$M]: {
        address: "0x34C0bD5877A5Ee7099D0f5688D65F4bB9158BDE2",
        blockCreated: 19135323
      }
    }
  },
  sourceId: sourceId$M
});
const sourceId$L = 17e3;
const fraxtalTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 2522,
  name: "Fraxtal Testnet",
  nativeCurrency: { name: "Frax", symbol: "FRAX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.frax.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "fraxscan testnet",
      url: "https://holesky.fraxscan.com",
      apiUrl: "https://api-holesky.fraxscan.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$L]: {
        address: "0x715EA64DA13F4d0831ece4Ad3E8c1aa013167F32"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    },
    portal: {
      [sourceId$L]: {
        address: "0xB9c64BfA498d5b9a8398Ed6f46eb76d90dE5505d",
        blockCreated: 318416
      }
    },
    l1StandardBridge: {
      [sourceId$L]: {
        address: "0x0BaafC217162f64930909aD9f2B27125121d6332",
        blockCreated: 318416
      }
    }
  },
  sourceId: sourceId$L,
  testnet: true
});
const sourceId$K = 1;
const funkiMainnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 33979,
  name: "Funki",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-mainnet.funkichain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Funki Mainnet Explorer",
      url: "https://funkiscan.io"
    }
  },
  contracts: {
    ...chainConfig$3.contracts
  },
  sourceId: sourceId$K
});
const sourceId$J = 11155111;
const funkiSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 3397901,
  network: "funkiSepolia",
  name: "Funki Sepolia Sandbox",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://funki-testnet.alt.technology"]
    }
  },
  blockExplorers: {
    default: {
      name: "Funki Sepolia Sandbox Explorer",
      url: "https://sepolia-sandbox.funkichain.com/"
    }
  },
  testnet: true,
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1620204
    }
  },
  sourceId: sourceId$J
});
const fuse = /* @__PURE__ */ defineChain({
  id: 122,
  name: "Fuse",
  nativeCurrency: { name: "Fuse", symbol: "FUSE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.fuse.io"] }
  },
  blockExplorers: {
    default: {
      name: "Fuse Explorer",
      url: "https://explorer.fuse.io",
      apiUrl: "https://explorer.fuse.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 16146628
    }
  }
});
const fuseSparknet = /* @__PURE__ */ defineChain({
  id: 123,
  name: "Fuse Sparknet",
  nativeCurrency: { name: "Spark", symbol: "SPARK", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.fusespark.io"] }
  },
  blockExplorers: {
    default: {
      name: "Sparkent Explorer",
      url: "https://explorer.fusespark.io",
      apiUrl: "https://explorer.fusespark.io/api"
    }
  }
});
const fusion = /* @__PURE__ */ defineChain({
  id: 32659,
  name: "Fusion Mainnet",
  nativeCurrency: { name: "Fusion", symbol: "FSN", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.fusionnetwork.io"],
      webSocket: ["wss://mainnet.fusionnetwork.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "FSNscan",
      url: "https://fsnscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 10441605
    }
  },
  testnet: false
});
const fusionTestnet = /* @__PURE__ */ defineChain({
  id: 46688,
  name: "Fusion Testnet",
  nativeCurrency: { name: "Fusion", symbol: "FSN", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.fusionnetwork.io"],
      webSocket: ["wss://testnet.fusionnetwork.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "FSNscan",
      url: "https://testnet.fsnscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 10428309
    }
  },
  testnet: true
});
const sourceId$I = 17e3;
const garnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  name: "Garnet Testnet",
  testnet: true,
  id: 17069,
  sourceId: sourceId$I,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.garnetchain.com"],
      webSocket: ["wss://rpc.garnetchain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.garnetchain.com"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    },
    portal: {
      [sourceId$I]: {
        address: "0x57ee40586fbE286AfC75E67cb69511A6D9aF5909",
        blockCreated: 1274684
      }
    },
    l2OutputOracle: {
      [sourceId$I]: {
        address: "0xCb8E7AC561b8EF04F2a15865e9fbc0766FEF569B",
        blockCreated: 1274684
      }
    },
    l1StandardBridge: {
      [sourceId$I]: {
        address: "0x09bcDd311FE398F80a78BE37E489f5D440DB95DE",
        blockCreated: 1274684
      }
    }
  }
});
const gatechain = /* @__PURE__ */ defineChain({
  id: 86,
  name: "GateChain Mainnet",
  nativeCurrency: { name: "GateChainToken", symbol: "GT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm.nodeinfo.cc"],
      webSocket: ["wss://evm-ws.gatenode.cc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Gate Scan",
      url: "https://www.gatescan.org",
      apiUrl: "https://gatescan.org/api"
    }
  },
  testnet: false
});
const geist = /* @__PURE__ */ defineChain({
  id: 63157,
  name: "Geist Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Aavegotchi GHST Token",
    symbol: "GHST"
  },
  rpcUrls: {
    default: {
      http: ["https://geist-mainnet.g.alchemy.com/public"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://geist-mainnet.explorer.alchemy.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 660735
    }
  }
});
const genesys = /* @__PURE__ */ defineChain({
  id: 16507,
  name: "Genesys Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "GSYS",
    symbol: "GSYS"
  },
  rpcUrls: {
    default: { http: ["https://rpc.genesys.network"] }
  },
  blockExplorers: {
    default: {
      name: "Genesys Explorer",
      url: "https://gchainexplorer.genesys.network"
    }
  },
  testnet: false
});
const gensyn = /* @__PURE__ */ defineChain({
  id: 685689,
  name: "Gensyn Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://gensyn-mainnet.g.alchemy.com/public"] }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://gensyn-mainnet.explorer.alchemy.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  }
});
const sourceId$H = 11155111;
const giwaSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 91342,
  network: "giwa-sepolia",
  name: "GIWA Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  blockTime: 1e3,
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.giwa.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepolia-explorer.giwa.io",
      apiUrl: "https://sepolia-explorer.giwa.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    },
    disputeGameFactory: {
      [sourceId$H]: {
        address: "0x37347caB2afaa49B776372279143D71ad1f354F6"
      }
    },
    portal: {
      [sourceId$H]: {
        address: "0x956962C34687A954e611A83619ABaA37Ce6bC78A"
      }
    },
    l1StandardBridge: {
      [sourceId$H]: {
        address: "0x77b2ffc0F57598cAe1DB76cb398059cF5d10A7E7"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$H
});
const giwaSepoliaPreconf = defineChain({
  ...giwaSepolia,
  experimental_preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc-flashblocks.giwa.io"]
    }
  }
});
const glideL1Protocol = /* @__PURE__ */ defineChain({
  id: 251,
  name: "Glide L1 Protocol XP",
  nativeCurrency: { name: "GLXP", symbol: "GLXP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-api.glideprotocol.xyz/l1-rpc"],
      webSocket: ["wss://rpc-api.glideprotocol.xyz/l1-rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Glide Protocol Explore",
      url: "https://blockchain-explorer.glideprotocol.xyz"
    }
  },
  testnet: false
});
const glideL2Protocol = /* @__PURE__ */ defineChain({
  id: 253,
  name: "Glide L2 Protocol XP",
  nativeCurrency: { name: "GLXP", symbol: "GLXP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-api.glideprotocol.xyz/l2-rpc"],
      webSocket: ["wss://rpc-api.glideprotocol.xyz/l2-rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Glide Protocol Explore",
      url: "https://blockchain-explorer.glideprotocol.xyz"
    }
  },
  testnet: false
});
const gnosis = /* @__PURE__ */ defineChain({
  id: 100,
  name: "Gnosis",
  nativeCurrency: {
    decimals: 18,
    name: "xDAI",
    symbol: "XDAI"
  },
  blockTime: 5e3,
  rpcUrls: {
    default: {
      http: ["https://rpc.gnosischain.com"],
      webSocket: ["wss://rpc.gnosischain.com/wss"]
    }
  },
  blockExplorers: {
    default: {
      name: "Gnosisscan",
      url: "https://gnosisscan.io",
      apiUrl: "https://api.gnosisscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 21022491
    }
  }
});
const gnosisChiado = /* @__PURE__ */ defineChain({
  id: 10200,
  name: "Gnosis Chiado",
  nativeCurrency: {
    decimals: 18,
    name: "Gnosis",
    symbol: "xDAI"
  },
  blockTime: 5e3,
  rpcUrls: {
    default: {
      http: ["https://rpc.chiadochain.net"],
      webSocket: ["wss://rpc.chiadochain.net/wss"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout.chiadochain.net",
      apiUrl: "https://blockscout.chiadochain.net/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 4967313
    }
  },
  testnet: true
});
const goat = /* @__PURE__ */ defineChain({
  id: 2345,
  name: "GOAT",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcoin",
    symbol: "BTC"
  },
  rpcUrls: {
    default: { http: ["https://rpc.goat.network"] }
  },
  blockExplorers: {
    default: {
      name: "Goat Explorer",
      url: "https://explorer.goat.network"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  }
});
const gobi = /* @__PURE__ */ defineChain({
  id: 1663,
  name: "Horizen Gobi Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Test ZEN",
    symbol: "tZEN"
  },
  rpcUrls: {
    default: { http: ["https://gobi-testnet.horizenlabs.io/ethv1"] }
  },
  blockExplorers: {
    default: {
      name: "Gobi Explorer",
      url: "https://gobi-explorer.horizen.io"
    }
  },
  contracts: {},
  testnet: true
});
const goChain = /* @__PURE__ */ defineChain({
  id: 60,
  name: "GoChain",
  nativeCurrency: {
    decimals: 18,
    name: "GO",
    symbol: "GO"
  },
  rpcUrls: {
    default: { http: ["https://rpc.gochain.io"] }
  },
  blockExplorers: {
    default: {
      name: "GoChain Explorer",
      url: "https://explorer.gochain.io"
    }
  },
  testnet: false
});
const godwoken = /* @__PURE__ */ defineChain({
  id: 71402,
  name: "Godwoken Mainnet",
  nativeCurrency: { decimals: 18, name: "pCKB", symbol: "pCKB" },
  rpcUrls: {
    default: {
      http: ["https://v1.mainnet.godwoken.io/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "GW Scan",
      url: "https://v1.gwscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 15034
    }
  },
  testnet: false
});
const goerli = /* @__PURE__ */ defineChain({
  id: 5,
  name: "Goerli",
  nativeCurrency: { name: "Goerli Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://5.rpc.thirdweb.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://goerli.etherscan.io",
      apiUrl: "https://api-goerli.etherscan.io/api"
    }
  },
  contracts: {
    ensRegistry: {
      address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
    },
    ensUniversalResolver: {
      address: "0xfc4AC75C46C914aF5892d6d3eFFcebD7917293F1",
      blockCreated: 10339206
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 6507670
    }
  },
  testnet: true
});
const graphite = /* @__PURE__ */ defineChain({
  id: 440017,
  name: "Graphite Network",
  nativeCurrency: { name: "Graphite", symbol: "@G", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://anon-entrypoint-1.atgraphite.com"],
      webSocket: ["wss://ws-anon-entrypoint-1.atgraphite.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Graphite Spectre",
      url: "https://main.atgraphite.com",
      apiUrl: "https://api.main.atgraphite.com/api"
    }
  },
  testnet: false
});
const graphiteTestnet = /* @__PURE__ */ defineChain({
  id: 54170,
  name: "Graphite Network Testnet",
  nativeCurrency: { name: "Graphite", symbol: "@G", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://anon-entrypoint-test-1.atgraphite.com"],
      webSocket: ["wss://ws-anon-entrypoint-test-1.atgraphite.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Graphite Testnet Spectre",
      url: "https://test.atgraphite.com",
      apiUrl: "https://api.test.atgraphite.com/api"
    }
  },
  testnet: true
});
const grav = /* @__PURE__ */ defineChain({
  id: 127001,
  name: "Gravity",
  nativeCurrency: { name: "Gravity", symbol: "G", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.gravity.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Gravity Mainnet Explorer",
      url: "https://mainnet-explorer.gravity.xyz",
      apiUrl: "https://mainnet-explorer.gravity.xyz/api"
    }
  },
  contracts: {},
  testnet: false
});
const gravity = /* @__PURE__ */ defineChain({
  id: 1625,
  name: "Gravity Alpha Mainnet",
  nativeCurrency: { name: "G", symbol: "G", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.gravity.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Gravity Explorer",
      url: "https://explorer.gravity.xyz",
      apiUrl: "https://explorer.gravity.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xf8ac4BEB2F75d2cFFb588c63251347fdD629B92c",
      blockCreated: 16851
    }
  }
});
const gunz = /* @__PURE__ */ defineChain({
  id: 43419,
  name: "Gunz Mainnet",
  nativeCurrency: { name: "GUN", symbol: "GUN", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.gunzchain.io/ext/bc/2M47TxWHGnhNtq6pM5zPXdATBtuqubxn5EPFgFmEawCQr9WFML/rpc"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Gunz Explorer",
      url: "https://gunzscan.io/"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 70502
    }
  }
});
const guruNetwork = /* @__PURE__ */ defineChain({
  id: 260,
  name: "Guru Network Mainnet",
  nativeCurrency: {
    name: "GURU Token",
    symbol: "GURU",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-main.gurunetwork.ai",
        "https://rpc.gurunetwork.ai/archive/260"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Guruscan",
      url: "https://scan.gurunetwork.ai"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 271691
    }
  },
  testnet: false
});
const guruTestnet = /* @__PURE__ */ defineChain({
  id: 261,
  name: "Guru Network Testnet",
  nativeCurrency: {
    name: "tGURU Token",
    symbol: "tGURU",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-test.gurunetwork.ai",
        "https://rpc.gurunetwork.ai/archive/261"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Guruscan",
      url: "https://sepolia.gurunetwork.ai"
    }
  },
  testnet: true
});
const ham = /* @__PURE__ */ defineChain({
  id: 5112,
  name: "Ham",
  nativeCurrency: {
    decimals: 18,
    name: "Ham",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ham.fun"],
      webSocket: ["wss://rpc.ham.fun"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ham Chain Explorer",
      url: "https://explorer.ham.fun",
      apiUrl: "https://explorer.ham.fun/api/v2"
    }
  }
});
const happychainTestnet = /* @__PURE__ */ defineChain({
  id: 216,
  name: "Happychain Testnet",
  nativeCurrency: {
    symbol: "HAPPY",
    name: "HAPPY",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.happy.tech/http"],
      webSocket: ["wss://rpc.testnet.happy.tech/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Happy Chain Testnet Explorer",
      url: "https://explorer.testnet.happy.tech"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1
    }
  },
  testnet: true
});
const haqqMainnet = /* @__PURE__ */ defineChain({
  id: 11235,
  name: "HAQQ Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Islamic Coin",
    symbol: "ISLM"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.eth.haqq.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "HAQQ Explorer",
      url: "https://explorer.haqq.network",
      apiUrl: "https://explorer.haqq.network/api"
    }
  }
});
const haqqTestedge2 = /* @__PURE__ */ defineChain({
  id: 54211,
  name: "HAQQ Testedge 2",
  nativeCurrency: {
    decimals: 18,
    name: "Islamic Coin",
    symbol: "ISLMT"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.eth.testedge2.haqq.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "HAQQ Explorer",
      url: "https://explorer.testedge2.haqq.network",
      apiUrl: "https://explorer.testedge2.haqq.network/api"
    }
  },
  testnet: true
});
const hardhat = /* @__PURE__ */ defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] }
  }
});
const harmonyOne = /* @__PURE__ */ defineChain({
  id: 16666e5,
  name: "Harmony One",
  nativeCurrency: {
    name: "Harmony",
    symbol: "ONE",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://1666600000.rpc.thirdweb.com"] }
  },
  blockExplorers: {
    default: {
      name: "Harmony Explorer",
      url: "https://explorer.harmony.one"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 24185753
    }
  }
});
const hashkey = /* @__PURE__ */ defineChain({
  id: 177,
  name: "HashKey Chain",
  nativeCurrency: {
    decimals: 18,
    name: "HashKey EcoPoints",
    symbol: "HSK"
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.hsk.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "HashKey Chain Explorer",
      url: "https://hashkey.blockscout.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    }
  }
});
const hashkeyTestnet = /* @__PURE__ */ defineChain({
  id: 133,
  name: "HashKey Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HashKey EcoPoints",
    symbol: "HSK"
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hsk.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "HashKey Chain Testnet explorer",
      url: "https://testnet-explorer.hsk.xyz"
    }
  },
  testnet: true
});
const haustTestnet = /* @__PURE__ */ defineChain({
  id: 1523903251,
  name: "Haust Network Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HAUST",
    symbol: "HAUST"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.haust.app"]
    }
  },
  blockExplorers: {
    default: {
      name: "Haust Network Testnet Explorer",
      url: "https://explorer-testnet.haust.app"
    }
  },
  testnet: true
});
const hedera = /* @__PURE__ */ defineChain({
  id: 295,
  name: "Hedera Mainnet",
  network: "hedera-mainnet",
  nativeCurrency: {
    symbol: "HBAR",
    name: "HBAR",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.hashio.io/api"]
    }
  },
  blockExplorers: {
    default: {
      name: "Hashscan",
      url: "https://hashscan.io/mainnet"
    }
  },
  testnet: false
});
const hederaPreviewnet = /* @__PURE__ */ defineChain({
  id: 297,
  name: "Hedera Previewnet",
  network: "hedera-previewnet",
  nativeCurrency: {
    symbol: "HBAR",
    name: "HBAR",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://previewnet.hashio.io/api"]
    }
  },
  blockExplorers: {
    default: {
      name: "Hashscan",
      url: "https://hashscan.io/previewnet"
    }
  },
  testnet: true
});
const hederaTestnet = /* @__PURE__ */ defineChain({
  id: 296,
  name: "Hedera Testnet",
  network: "hedera-testnet",
  nativeCurrency: {
    symbol: "HBAR",
    name: "HBAR",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"]
    }
  },
  blockExplorers: {
    default: {
      name: "Hashscan",
      url: "https://hashscan.io/testnet"
    }
  },
  testnet: true
});
const hela = /* @__PURE__ */ defineChain({
  id: 8668,
  name: "Hela Mainnet",
  nativeCurrency: {
    name: "HLUSD",
    symbol: "HLUSD",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.helachain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Hela explorer",
      url: "https://mainnet-blockexplorer.helachain.com"
    }
  },
  testnet: false
});
const heliosTestnet = /* @__PURE__ */ defineChain({
  id: 42e3,
  name: "Helios Testnet",
  network: "helios-testnet",
  nativeCurrency: {
    symbol: "HLS",
    name: "Helios",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet1.helioschainlabs.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Helios Testnet Explorer",
      url: "https://explorer.helioschainlabs.org/"
    }
  },
  testnet: true
});
const hemi = /* @__PURE__ */ defineChain({
  id: 43111,
  name: "Hemi",
  network: "Hemi",
  blockTime: 12e3,
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hemi.network/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer.hemi.xyz"
    }
  },
  testnet: false
});
const hemiSepolia = /* @__PURE__ */ defineChain({
  id: 743111,
  name: "Hemi Sepolia",
  network: "Hemi Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.rpc.hemi.network/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Hemi Sepolia explorer",
      url: "https://testnet.explorer.hemi.xyz"
    }
  },
  testnet: true
});
const henesys = /* @__PURE__ */ defineChain({
  id: 68414,
  name: "Henesys",
  nativeCurrency: { name: "NEXPACE", symbol: "NXPC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://henesys-rpc.msu.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Avalanche Explorer",
      url: "https://subnets.avax.network/henesys"
    }
  }
});
const holesky = /* @__PURE__ */ defineChain({
  id: 17e3,
  name: "Holesky",
  nativeCurrency: { name: "Holesky Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://ethereum-holesky-rpc.publicnode.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://holesky.etherscan.io",
      apiUrl: "https://api-holesky.etherscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 77
    },
    ensUniversalResolver: {
      address: "0xeeeeeeee14d718c2b47d9923deab1335e144eeee",
      blockCreated: 4295055
    }
  },
  testnet: true
});
const hoodi = /* @__PURE__ */ defineChain({
  id: 560048,
  name: "Hoodi",
  nativeCurrency: { name: "Hoodi Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.hoodi.ethpandaops.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://hoodi.etherscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2589
    }
  },
  testnet: true
});
const horizenTestnet = /* @__PURE__ */ defineChain({
  id: 2651420,
  name: "Horizen Testnet",
  network: "horizen-testnet",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://horizen-testnet.rpc.caldera.xyz/http"]
    }
  },
  blockExplorers: {
    default: {
      name: "Horizen Testnet Caldera Explorer",
      url: "https://horizen-testnet.explorer.caldera.xyz"
    }
  },
  testnet: true
});
const hpb = /* @__PURE__ */ defineChain({
  id: 269,
  name: "High Performance Blockchain",
  nativeCurrency: { name: "HPB", symbol: "HPB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://hpbnode.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "hpbScan",
      url: "https://hscan.org"
    }
  },
  testnet: false
});
const hpp = /* @__PURE__ */ defineChain({
  id: 190415,
  name: "HPP Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.hpp.io"],
      webSocket: ["wss://mainnet.hpp.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "HPP Mainnet Explorer",
      url: "https://explorer.hpp.io"
    }
  },
  testnet: false
});
const hppSepolia = /* @__PURE__ */ defineChain({
  id: 181228,
  name: "HPP Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.hpp.io"],
      webSocket: ["wss://testnet.hpp.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "HPP Sepolia Explorer",
      url: "https://sepolia-explorer.hpp.io"
    }
  },
  testnet: true
});
const sourceId$G = 42161;
const huddle01Mainnet = /* @__PURE__ */ defineChain({
  id: 12323,
  name: "Huddle01 dRTC Chain",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://huddle01.calderachain.xyz/http"],
      webSocket: ["wss://huddle01.calderachain.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Huddle01 Caldera Explorer",
      url: "https://huddle01.calderaexplorer.xyz",
      apiUrl: "https://huddle01.calderaexplorer.xyz/api"
    }
  },
  sourceId: sourceId$G
});
const sourceId$F = 421614;
const huddle01Testnet = /* @__PURE__ */ defineChain({
  id: 2524852,
  name: "Huddle01 dRTC Chain Testnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://huddle-testnet.rpc.caldera.xyz/http"],
      webSocket: ["wss://huddle-testnet.rpc.caldera.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Huddle01 Caldera Explorer",
      url: "https://huddle-testnet.explorer.caldera.xyz",
      apiUrl: "https://huddle-testnet.explorer.caldera.xyz/api"
    }
  },
  sourceId: sourceId$F,
  testnet: true
});
const humanity = /* @__PURE__ */ defineChain({
  id: 6985385,
  name: "Humanity",
  nativeCurrency: {
    name: "H",
    symbol: "H",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://humanity-mainnet.g.alchemy.com/public"]
    }
  },
  blockExplorers: {
    default: {
      name: "Humanity Mainnet Explorer",
      url: "https://humanity-mainnet.explorer.alchemy.com",
      apiUrl: "https://humanity-mainnet.explorer.alchemy.com/api"
    }
  },
  testnet: false
});
const humanityTestnet = /* @__PURE__ */ defineChain({
  id: 7080969,
  name: "Humanity Testnet",
  nativeCurrency: {
    name: "tHP",
    symbol: "tHP",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.humanity.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Humanity Testnet Explorer",
      url: "https://humanity-testnet.explorer.alchemy.com",
      apiUrl: "https://humanity-testnet.explorer.alchemy.com/api"
    }
  },
  testnet: true
});
const humanode = /* @__PURE__ */ defineChain({
  id: 5234,
  name: "Humanode",
  nativeCurrency: { name: "HMND", symbol: "HMND", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://explorer-rpc-http.mainnet.stages.humanode.io"],
      webSocket: ["wss://explorer-rpc-ws.mainnet.stages.humanode.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://humanode.subscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 4413097
    }
  }
});
const humanodeTestnet5 = /* @__PURE__ */ defineChain({
  id: 14853,
  name: "Humanode Testnet 5",
  nativeCurrency: { name: "HMND", symbol: "HMND", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://explorer-rpc-http.testnet5.stages.humanode.io"],
      webSocket: ["wss://explorer-rpc-ws.testnet5.stages.humanode.io"]
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    }
  },
  testnet: true
});
const hychain = /* @__PURE__ */ defineChain({
  id: 2911,
  name: "HYCHAIN",
  nativeCurrency: { name: "HYTOPIA", symbol: "TOPIA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.hychain.com/http"] }
  },
  blockExplorers: {
    default: {
      name: "HYCHAIN Explorer",
      url: "https://explorer.hychain.com"
    }
  },
  testnet: false
});
const hychainTestnet = /* @__PURE__ */ defineChain({
  id: 29112,
  name: "HYCHAIN Testnet",
  nativeCurrency: { name: "HYTOPIA", symbol: "TOPIA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.hychain.com/http"] }
  },
  blockExplorers: {
    default: {
      name: "HYCHAIN Explorer",
      url: "https://testnet-rpc.hychain.com/http"
    }
  },
  testnet: true
});
const hyperEvm = /* @__PURE__ */ defineChain({
  id: 999,
  name: "HyperEVM",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  blockExplorers: {
    default: {
      name: "HyperEVMScan",
      url: "https://hyperevmscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 13051
    }
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid.xyz/evm"]
    }
  },
  testnet: false
});
const hyperliquidEvmTestnet = /* @__PURE__ */ defineChain({
  id: 998,
  name: "Hyperliquid EVM Testnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid-testnet.xyz/evm"]
    }
  },
  testnet: true
});
const icbNetwork = /* @__PURE__ */ defineChain({
  id: 73115,
  name: "ICB Network",
  nativeCurrency: {
    decimals: 18,
    name: "ICB Native Token",
    symbol: "ICBX"
  },
  rpcUrls: {
    default: { http: ["https://rpc1-mainnet.icbnetwork.info"] }
  },
  blockExplorers: {
    default: {
      name: "ICB Explorer",
      url: "https://icbscan.io",
      apiUrl: "https://icbscan.io/api"
    }
  },
  testnet: false
});
const idchain = /* @__PURE__ */ defineChain({
  id: 74,
  name: "IDChain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "EIDI",
    symbol: "EIDI"
  },
  rpcUrls: {
    default: {
      http: ["https://idchain.one/rpc"],
      webSocket: ["wss://idchain.one/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "IDChain Explorer",
      url: "https://explorer.idchain.one"
    }
  },
  testnet: false
});
const igra = /* @__PURE__ */ defineChain({
  id: 38833,
  name: "Igra Network",
  nativeCurrency: {
    decimals: 18,
    name: "iKAS",
    symbol: "iKAS"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.igralabs.com:8545"]
    }
  },
  blockExplorers: {
    default: {
      name: "Igra Explorer",
      url: "https://explorer.igralabs.com"
    }
  },
  testnet: false
});
const immutableZkEvm = /* @__PURE__ */ defineChain({
  id: 13371,
  name: "Immutable zkEVM",
  nativeCurrency: {
    decimals: 18,
    name: "Immutable Coin",
    symbol: "IMX"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.immutable.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Immutable Explorer",
      url: "https://explorer.immutable.com",
      apiUrl: "https://explorer.immutable.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x236bdA4589e44e6850f5aC6a74BfCa398a86c6c0",
      blockCreated: 4335972
    }
  }
});
const immutableZkEvmTestnet = /* @__PURE__ */ defineChain({
  id: 13473,
  name: "Immutable zkEVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Immutable Coin",
    symbol: "IMX"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.immutable.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Immutable Testnet Explorer",
      url: "https://explorer.testnet.immutable.com/"
    }
  },
  contracts: {
    multicall3: {
      address: "0x2CC787Ed364600B0222361C4188308Fa8E68bA60",
      blockCreated: 5977391
    }
  },
  testnet: true
});
const inEVM = /* @__PURE__ */ defineChain({
  id: 2525,
  name: "inEVM Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Injective",
    symbol: "INJ"
  },
  rpcUrls: {
    default: { http: ["https://mainnet.rpc.inevm.com/http"] }
  },
  blockExplorers: {
    default: {
      name: "inEVM Explorer",
      url: "https://inevm.calderaexplorer.xyz",
      apiUrl: "https://inevm.calderaexplorer.xyz/api/v2"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 118606
    }
  }
});
const initVerse = /* @__PURE__ */ defineChain({
  id: 7233,
  name: "InitVerse Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "InitVerse",
    symbol: "INI"
  },
  rpcUrls: {
    default: { http: ["https://rpc-mainnet.inichain.com"] }
  },
  blockExplorers: {
    default: {
      name: "InitVerseScan",
      url: "https://www.iniscan.com",
      apiUrl: "https://explorer-api.inichain.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x83466BE48A067115FFF91f7b892Ed1726d032e47",
      blockCreated: 2318
    }
  }
});
const initVerseGenesis = /* @__PURE__ */ defineChain({
  id: 7234,
  name: "InitVerse Genesis Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "InitVerse",
    symbol: "INI"
  },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.inichain.com"] }
  },
  blockExplorers: {
    default: {
      name: "InitVerseGenesisScan",
      url: "https://genesis-testnet.iniscan.com",
      apiUrl: "https://explorer-testnet-api.inichain.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x0cF32CBDd6c437331EA4f85ed2d881A5379B5a6F",
      blockCreated: 16361
    }
  },
  testnet: true
});
const injective = /* @__PURE__ */ defineChain({
  id: 1776,
  name: "Injective",
  nativeCurrency: {
    decimals: 18,
    name: "Injective",
    symbol: "INJ"
  },
  rpcUrls: {
    default: {
      http: ["https://sentry.evm-rpc.injective.network"],
      webSocket: ["wss://sentry.evm-ws.injective.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Injective Explorer",
      url: "https://blockscout.injective.network",
      apiUrl: "https://blockscout.injective.network/api"
    }
  },
  testnet: false
});
const injectiveTestnet = /* @__PURE__ */ defineChain({
  id: 1439,
  name: "Injective Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Injective",
    symbol: "INJ"
  },
  rpcUrls: {
    default: {
      http: ["https://k8s.testnet.json-rpc.injective.network"],
      webSocket: ["wss://k8s.testnet.ws.injective.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Injective Explorer",
      url: "https://testnet.blockscout.injective.network",
      apiUrl: "https://testnet.blockscout.injective.network/api"
    }
  },
  testnet: true
});
const sourceId$E = 1;
const ink = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 57073,
  name: "Ink",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-gel.inkonchain.com",
        "https://rpc-qnd.inkonchain.com"
      ],
      webSocket: [
        "wss://rpc-gel.inkonchain.com",
        "wss://rpc-qnd.inkonchain.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.inkonchain.com",
      apiUrl: "https://explorer.inkonchain.com/api/v2"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    },
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$E]: {
        address: "0x10d7b35078d3baabb96dd45a9143b94be65b12cd"
      }
    },
    portal: {
      [sourceId$E]: {
        address: "0x5d66c1782664115999c47c9fa5cd031f495d3e4f"
      }
    },
    l1StandardBridge: {
      [sourceId$E]: {
        address: "0x88ff1e5b602916615391f55854588efcbb7663f0"
      }
    }
  },
  testnet: false,
  sourceId: sourceId$E
});
const sourceId$D = 11155111;
const inkSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 763373,
  name: "Ink Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-gel-sepolia.inkonchain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer-sepolia.inkonchain.com/",
      apiUrl: "https://explorer-sepolia.inkonchain.com/api/v2"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    },
    disputeGameFactory: {
      [sourceId$D]: {
        address: "0x860e626c700af381133d9f4af31412a2d1db3d5d"
      }
    },
    portal: {
      [sourceId$D]: {
        address: "0x5c1d29c6c9c8b0800692acc95d700bcb4966a1d7"
      }
    },
    l1StandardBridge: {
      [sourceId$D]: {
        address: "0x33f60714bbd74d62b66d79213c348614de51901c"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$D
});
const iota = /* @__PURE__ */ defineChain({
  id: 8822,
  name: "IOTA EVM",
  network: "iotaevm",
  nativeCurrency: {
    decimals: 18,
    name: "IOTA",
    symbol: "IOTA"
  },
  rpcUrls: {
    default: {
      http: ["https://json-rpc.evm.iotaledger.net"],
      webSocket: ["wss://ws.json-rpc.evm.iotaledger.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.evm.iota.org",
      apiUrl: "https://explorer.evm.iota.org/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 25022
    }
  }
});
const iotaTestnet = /* @__PURE__ */ defineChain({
  id: 1075,
  name: "IOTA EVM Testnet",
  network: "iotaevm-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "IOTA",
    symbol: "IOTA"
  },
  rpcUrls: {
    default: {
      http: ["https://json-rpc.evm.testnet.iotaledger.net"],
      webSocket: ["wss://ws.json-rpc.evm.testnet.iotaledger.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.evm.testnet.iotaledger.net",
      apiUrl: "https://explorer.evm.testnet.iotaledger.net/api"
    }
  },
  testnet: true
});
const iotex = /* @__PURE__ */ defineChain({
  id: 4689,
  name: "IoTeX",
  nativeCurrency: {
    decimals: 18,
    name: "IoTeX",
    symbol: "IOTX"
  },
  rpcUrls: {
    default: {
      http: ["https://babel-api.mainnet.iotex.io"],
      webSocket: ["wss://babel-api.mainnet.iotex.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "IoTeXScan",
      url: "https://iotexscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 22163670
    }
  }
});
const iotexTestnet = /* @__PURE__ */ defineChain({
  id: 4690,
  name: "IoTeX Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "IoTeX",
    symbol: "IOTX"
  },
  rpcUrls: {
    default: {
      http: ["https://babel-api.testnet.iotex.io"],
      webSocket: ["wss://babel-api.testnet.iotex.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "IoTeXScan",
      url: "https://testnet.iotexscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xb5cecD6894c6f473Ec726A176f1512399A2e355d",
      blockCreated: 24347592
    }
  },
  testnet: true
});
const iSunCoin = /* @__PURE__ */ defineChain({
  id: 8017,
  name: "iSunCoin Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "ISC",
    symbol: "ISC"
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.isuncoin.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "iSunCoin Explorer",
      url: "https://baifa.io/app/chains/8017"
    }
  }
});
const jasmyChain = /* @__PURE__ */ defineChain({
  id: 680,
  name: "Jasmy Chain",
  network: "jasmyChain",
  nativeCurrency: { name: "JasmyCoin", symbol: "JASMY", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.jasmychain.io"],
      webSocket: ["wss://rpc.jasmychain.io"]
    }
  },
  testnet: false
});
const jasmyChainTestnet = /* @__PURE__ */ defineChain({
  id: 681,
  name: "Jasmy Chain Testnet",
  network: "jasmyChainTestnet",
  nativeCurrency: { name: "JasmyCoin", symbol: "JASMY", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc_testnet.jasmychain.io"],
      webSocket: ["wss://rpc_testnet.jasmychain.io"]
    }
  },
  testnet: true
});
const jbc = /* @__PURE__ */ defineChain({
  id: 8899,
  name: "JB Chain",
  network: "jbc",
  nativeCurrency: { name: "JBC", symbol: "JBC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-l1.jibchain.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://exp-l1.jibchain.net",
      apiUrl: "https://exp-l1.jibchain.net/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xc0C8C486D1466C57Efe13C2bf000d4c56F47CBdC",
      blockCreated: 2299048
    }
  },
  testnet: false
});
const jbcTestnet = /* @__PURE__ */ defineChain({
  id: 88991,
  name: "Jibchain Testnet",
  nativeCurrency: { name: "tJBC", symbol: "tJBC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.jibchain.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://exp.testnet.jibchain.net",
      apiUrl: "https://exp.testnet.jibchain.net/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xa1a858ad9041B4741e620355a3F96B3c78e70ecE",
      blockCreated: 32848
    }
  },
  testnet: true
});
const jocMainnet = /* @__PURE__ */ defineChain({
  id: 81,
  name: "Japan Open Chain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Japan Open Chain Token",
    symbol: "JOC"
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-1.japanopenchain.org:8545",
        "https://rpc-2.japanopenchain.org:8545",
        "https://rpc-3.japanopenchain.org"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://explorer.japanopenchain.org"
    }
  },
  testnet: false
});
const jocTestnet = /* @__PURE__ */ defineChain({
  id: 10081,
  name: "Japan Open Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Japan Open Chain Testnet Token",
    symbol: "JOCT"
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-1.testnet.japanopenchain.org:8545",
        "https://rpc-2.testnet.japanopenchain.org:8545",
        "https://rpc-3.testnet.japanopenchain.org"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Testnet Block Explorer",
      url: "https://explorer.testnet.japanopenchain.org"
    }
  },
  testnet: true
});
const jovay = /* @__PURE__ */ defineChain({
  id: 5734951,
  name: "Jovay Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.jovay.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Jovay Explorer",
      url: "https://explorer.jovay.io/l2"
    }
  },
  testnet: false
});
const jovaySepolia = /* @__PURE__ */ defineChain({
  id: 2019775,
  name: "Jovay Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://api.zan.top/public/jovay-testnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "Jovay Testnet Explorer",
      url: "https://sepolia-explorer.jovay.io/l2"
    }
  },
  testnet: true
});
const juneo = /* @__PURE__ */ defineChain({
  id: 45003,
  name: "Juneo JUNE-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "JUNE-Chain",
    symbol: "JUNE"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/JUNE/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/2",
      apiUrl: "https://juneoscan.io/chain/2/api"
    }
  }
});
const juneoBCH1Chain = /* @__PURE__ */ defineChain({
  id: 45013,
  name: "Juneo BCH1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo BCH1-Chain",
    symbol: "BCH1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/BCH1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/12",
      apiUrl: "https://juneoscan.io/chain/12/api"
    }
  }
});
const juneoDAI1Chain = /* @__PURE__ */ defineChain({
  id: 45004,
  name: "Juneo DAI1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo DAI1-Chain",
    symbol: "DAI1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/DAI1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/5",
      apiUrl: "https://juneoscan.io/chain/5/api"
    }
  }
});
const juneoDOGE1Chain = /* @__PURE__ */ defineChain({
  id: 45010,
  name: "Juneo DOGE1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo DOGE1-Chain",
    symbol: "DOGE1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/DOGE1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/10",
      apiUrl: "https://juneoscan.io/chain/10/api"
    }
  }
});
const juneoEUR1Chain = /* @__PURE__ */ defineChain({
  id: 45011,
  name: "Juneo EUR1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo EUR1-Chain",
    symbol: "EUR1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/EUR1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/6",
      apiUrl: "https://juneoscan.io/chain/6/api"
    }
  }
});
const juneoGLD1Chain = /* @__PURE__ */ defineChain({
  id: 45008,
  name: "Juneo GLD1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo GLD1-Chain",
    symbol: "GLD1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/GLD1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/8",
      apiUrl: "https://juneoscan.io/chain/8/api"
    }
  }
});
const juneoLINK1Chain = /* @__PURE__ */ defineChain({
  id: 45014,
  name: "Juneo LINK1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo LINK1-Chain",
    symbol: "LINK1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/LINK1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/13",
      apiUrl: "https://juneoscan.io/chain/13/api"
    }
  }
});
const juneoLTC1Chain = /* @__PURE__ */ defineChain({
  id: 45009,
  name: "Juneo LTC1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo LTC1-Chain",
    symbol: "LTC1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/LTC1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/11",
      apiUrl: "https://juneoscan.io/chain/11/api"
    }
  }
});
const juneomBTC1Chain = /* @__PURE__ */ defineChain({
  id: 45007,
  name: "Juneo mBTC1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo mBTC1-Chain",
    symbol: "mBTC1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/mBTC1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/9",
      apiUrl: "https://juneoscan.io/chain/9/api"
    }
  }
});
const juneoSGD1Chain = /* @__PURE__ */ defineChain({
  id: 45012,
  name: "Juneo SGD1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo SGD1-Chain",
    symbol: "SGD1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/SGD1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/7",
      apiUrl: "https://juneoscan.io/chain/7/api"
    }
  }
});
const juneoSocotraTestnet = /* @__PURE__ */ defineChain({
  id: 101003,
  name: "Socotra JUNE-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Socotra JUNE-Chain",
    symbol: "JUNE"
  },
  rpcUrls: {
    default: { http: ["https://rpc.socotra-testnet.network/ext/bc/JUNE/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://socotra.juneoscan.io/chain/2",
      apiUrl: "https://socotra.juneoscan.io/chain/2/api"
    }
  },
  testnet: true
});
const juneoUSD1Chain = /* @__PURE__ */ defineChain({
  id: 45006,
  name: "Juneo USD1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo USD1-Chain",
    symbol: "USD1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/USD1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/4",
      apiUrl: "https://juneoscan.io/chain/4/api"
    }
  }
});
const juneoUSDT1Chain = /* @__PURE__ */ defineChain({
  id: 45005,
  name: "Juneo USDT1-Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Juneo USDT1-Chain",
    symbol: "USDT1"
  },
  rpcUrls: {
    default: { http: ["https://rpc.juneo-mainnet.network/ext/bc/USDT1/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Juneo Scan",
      url: "https://juneoscan.io/chain/3",
      apiUrl: "https://juneoscan.io/chain/3/api"
    }
  }
});
const kaia = /* @__PURE__ */ defineChain({
  id: 8217,
  name: "Kaia",
  nativeCurrency: {
    decimals: 18,
    name: "Kaia",
    symbol: "KAIA"
  },
  rpcUrls: {
    default: { http: ["https://public-en.node.kaia.io"] }
  },
  blockExplorers: {
    default: {
      name: "KaiaScan",
      url: "https://kaiascan.io",
      apiUrl: "https://api-cypress.klaytnscope.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 96002415
    }
  }
});
const kairos = /* @__PURE__ */ defineChain({
  id: 1001,
  name: "Kairos Testnet",
  network: "kairos",
  nativeCurrency: {
    decimals: 18,
    name: "Kairos KAIA",
    symbol: "KAIA"
  },
  rpcUrls: {
    default: { http: ["https://public-en-kairos.node.kaia.io"] }
  },
  blockExplorers: {
    default: {
      name: "KaiaScan",
      url: "https://kairos.kaiascan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 123390593
    }
  },
  testnet: true
});
const kakarotSepolia = /* @__PURE__ */ defineChain({
  id: 1802203764,
  name: "Kakarot Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.kakarot.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Kakarot Scan",
      url: "https://sepolia.kakarotscan.org"
    }
  },
  testnet: true
});
const kakarotStarknetSepolia = /* @__PURE__ */ defineChain({
  id: 920637907288165,
  name: "Kakarot Starknet Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.kakarot.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Kakarot Scan",
      url: "https://sepolia.kakarotscan.org"
    }
  },
  testnet: true
});
const kardiaChain = /* @__PURE__ */ defineChain({
  id: 24,
  name: "KardiaChain Mainnet",
  nativeCurrency: { name: "KAI", symbol: "KAI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.kardiachain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "KardiaChain Explorer",
      url: "https://explorer.kardiachain.io"
    }
  },
  testnet: false
});
const karura = /* @__PURE__ */ defineChain({
  id: 686,
  name: "Karura",
  network: "karura",
  nativeCurrency: {
    name: "Karura",
    symbol: "KAR",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://eth-rpc-karura.aca-api.network"],
      webSocket: ["wss://eth-rpc-karura.aca-api.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Karura Blockscout",
      url: "https://blockscout.karura.network",
      apiUrl: "https://blockscout.karura.network/api"
    }
  },
  testnet: false
});
const katana = /* @__PURE__ */ defineChain({
  id: 747474,
  name: "Katana",
  network: "katana",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.katana.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "katana explorer",
      url: "https://katanascan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  },
  testnet: false
});
const kava = /* @__PURE__ */ defineChain({
  id: 2222,
  name: "Kava EVM",
  network: "kava-mainnet",
  nativeCurrency: {
    name: "Kava",
    symbol: "KAVA",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://evm.kava.io"] }
  },
  blockExplorers: {
    default: {
      name: "Kava EVM Explorer",
      url: "https://kavascan.com",
      apiUrl: "https://kavascan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 3661165
    }
  },
  testnet: false
});
const kavaTestnet = /* @__PURE__ */ defineChain({
  id: 2221,
  name: "Kava EVM Testnet",
  network: "kava-testnet",
  nativeCurrency: {
    name: "Kava",
    symbol: "KAVA",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://evm.testnet.kava.io"] }
  },
  blockExplorers: {
    default: {
      name: "Kava EVM Testnet Explorer",
      url: "https://testnet.kavascan.com/",
      apiUrl: "https://testnet.kavascan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xDf1D724A7166261eEB015418fe8c7679BBEa7fd6",
      blockCreated: 7242179
    }
  },
  testnet: true
});
const kcc = /* @__PURE__ */ defineChain({
  id: 321,
  name: "KCC Mainnet",
  network: "KCC Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "KCS",
    symbol: "KCS"
  },
  rpcUrls: {
    default: {
      http: ["https://kcc-rpc.com"]
    }
  },
  blockExplorers: {
    default: { name: "KCC Explorer", url: "https://explorer.kcc.io" }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 11760430
    }
  },
  testnet: false
});
const kii = /* @__PURE__ */ defineChain({
  id: 1783,
  name: "KiiChain",
  network: "kii-chain",
  nativeCurrency: {
    name: "Kii",
    symbol: "KII",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://json-rpc.kiivalidator.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "KiiExplorer",
      url: "https://explorer.kiichain.io"
    }
  }
});
const kiiTestnetOro = /* @__PURE__ */ defineChain({
  id: 1336,
  name: "Kii Testnet Oro",
  network: "kii-testnet-oro",
  nativeCurrency: {
    name: "Kii",
    symbol: "KII",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "KiiExplorer",
      url: "https://testnet.explorer.kiichain.io"
    }
  },
  testnet: true
});
const kinto = /* @__PURE__ */ defineChain({
  id: 7887,
  name: "Kinto Mainnet",
  network: "Kinto Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.kinto.xyz/http"] }
  },
  blockExplorers: {
    default: {
      name: "Kinto Explorer",
      url: "https://explorer.kinto.xyz"
    }
  },
  testnet: false
});
const klaytn = /* @__PURE__ */ defineChain({
  id: 8217,
  name: "Klaytn",
  nativeCurrency: {
    decimals: 18,
    name: "Klaytn",
    symbol: "KLAY"
  },
  rpcUrls: {
    default: { http: ["https://public-en-cypress.klaytn.net"] }
  },
  blockExplorers: {
    default: {
      name: "KlaytnScope",
      url: "https://scope.klaytn.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 96002415
    }
  }
});
const klaytnBaobab = /* @__PURE__ */ defineChain({
  id: 1001,
  name: "Klaytn Baobab Testnet",
  network: "klaytn-baobab",
  nativeCurrency: {
    decimals: 18,
    name: "Baobab Klaytn",
    symbol: "KLAY"
  },
  rpcUrls: {
    default: { http: ["https://public-en-baobab.klaytn.net"] }
  },
  blockExplorers: {
    default: {
      name: "KlaytnScope",
      url: "https://baobab.klaytnscope.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 123390593
    }
  },
  testnet: true
});
const koi = /* @__PURE__ */ defineChain({
  id: 701,
  name: "Koi Network",
  nativeCurrency: {
    decimals: 18,
    name: "Koi Network Native Token",
    symbol: "KRING"
  },
  rpcUrls: {
    default: {
      http: ["https://koi-rpc.darwinia.network"],
      webSocket: ["wss://koi-rpc.darwinia.network"]
    }
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://koi-scan.darwinia.network" }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 180001
    }
  },
  testnet: true
});
const kroma = /* @__PURE__ */ defineChain({
  id: 255,
  name: "Kroma",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.kroma.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Kroma Explorer",
      url: "https://blockscout.kroma.network",
      apiUrl: "https://blockscout.kroma.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 16054868
    }
  },
  testnet: false
});
const kromaSepolia = /* @__PURE__ */ defineChain({
  id: 2358,
  name: "Kroma Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.sepolia.kroma.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Kroma Sepolia Explorer",
      url: "https://blockscout.sepolia.kroma.network",
      apiUrl: "https://blockscout.sepolia.kroma.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 8900914
    }
  },
  testnet: true
});
const krown = /* @__PURE__ */ defineChain({
  id: 1983,
  name: "Krown",
  nativeCurrency: {
    decimals: 18,
    name: "Krown",
    symbol: "KROWN"
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.krown.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Krown Explorer",
      url: "https://explorer.krown.network"
    }
  },
  testnet: false
});
const l3x = /* @__PURE__ */ defineChain({
  id: 12324,
  name: "L3X Protocol",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-mainnet.l3x.com"],
      webSocket: ["wss://rpc-mainnet.l3x.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "L3X Mainnet Explorer",
      url: "https://explorer.l3x.com",
      apiUrl: "https://explorer.l3x.com/api/v2"
    }
  },
  testnet: false
});
const l3xTestnet = /* @__PURE__ */ defineChain({
  id: 12325,
  name: "L3X Protocol Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.l3x.com"],
      webSocket: ["wss://rpc-testnet.l3x.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "L3X Testnet Explorer",
      url: "https://explorer-testnet.l3x.com",
      apiUrl: "https://explorer-testnet.l3x.com/api/v2"
    }
  },
  testnet: true
});
const ladyChain = /* @__PURE__ */ defineChain({
  id: 589,
  name: "LadyChain",
  nativeCurrency: { name: "Lady", symbol: "LADY", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://ladyrpc.us/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "LadyScan",
      url: "https://ladyscan.us"
    }
  },
  testnet: false
});
const lavita = /* @__PURE__ */ defineChain({
  id: 360890,
  name: "LAVITA Mainnet",
  nativeCurrency: { name: "vTFUEL", symbol: "vTFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://tsub360890-eth-rpc.thetatoken.org/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "LAVITA Explorer",
      url: "https://tsub360890-explorer.thetatoken.org"
    }
  },
  testnet: false
});
const lens = /* @__PURE__ */ defineChain({
  id: 232,
  name: "Lens",
  nativeCurrency: { name: "GHO", symbol: "GHO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.lens.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lens Block Explorer",
      url: "https://explorer.lens.xyz",
      apiUrl: "https://explorer.lens.xyz/api"
    }
  }
});
const lensTestnet = /* @__PURE__ */ defineChain({
  id: 37111,
  name: "Lens Testnet",
  nativeCurrency: { name: "GRASS", symbol: "GRASS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.lens.dev"],
      webSocket: ["wss://rpc.testnet.lens.dev/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lens Block Explorer",
      url: "https://block-explorer.testnet.lens.dev",
      apiUrl: "https://block-explorer-api.staging.lens.dev/api"
    }
  },
  testnet: true
});
const lestnet = /* @__PURE__ */ defineChain({
  id: 21363,
  name: "Lestnet",
  nativeCurrency: { name: "Lestnet Ether", symbol: "LETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://service.lestnet.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lestnet Explorer",
      url: "https://explore.lestnet.org"
    }
  },
  testnet: true
});
const lightlinkPegasus = /* @__PURE__ */ defineChain({
  id: 1891,
  name: "LightLink Pegasus Testnet",
  network: "lightlink-pegasus",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://replicator.pegasus.lightlink.io/rpc/v1"]
    }
  },
  blockExplorers: {
    default: {
      name: "LightLink Pegasus Explorer",
      url: "https://pegasus.lightlink.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 127188532
    }
  },
  testnet: true
});
const lightlinkPhoenix = /* @__PURE__ */ defineChain({
  id: 1890,
  name: "LightLink Phoenix Mainnet",
  network: "lightlink-phoenix",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://replicator.phoenix.lightlink.io/rpc/v1"]
    }
  },
  blockExplorers: {
    default: {
      name: "LightLink Phoenix Explorer",
      url: "https://phoenix.lightlink.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 125499184
    }
  },
  testnet: false
});
async function estimateGas(client, args) {
  const { account: account_ = client.account } = args;
  if (!account_)
    throw new AccountNotFoundError();
  const account = parseAccount(account_);
  try {
    const { accessList, blockNumber, blockTag, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce: nonce2, to: to2, value, ...rest } = args;
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex$1(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    assertRequest(args);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format2 = chainFormat || formatTransactionRequest$1;
    const request = format2({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      account,
      accessList,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce: nonce2,
      to: to2,
      value
    }, "estimateGas");
    const { baseFeePerGas, gasLimit, priorityFeePerGas } = await client.request({
      method: "linea_estimateGas",
      params: block ? [request, block] : [request]
    });
    return {
      baseFeePerGas: BigInt(baseFeePerGas),
      gasLimit: BigInt(gasLimit),
      priorityFeePerGas: BigInt(priorityFeePerGas)
    };
  } catch (err) {
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
const chainConfig$1 = {
  fees: {
    estimateFeesPerGas,
    async maxPriorityFeePerGas({ block, client, request }) {
      const response = await estimateFeesPerGas({
        block,
        client,
        multiply: (x) => x,
        request,
        type: "eip1559"
      });
      if (!response?.maxPriorityFeePerGas)
        return null;
      return response.maxPriorityFeePerGas;
    }
  }
};
async function estimateFeesPerGas({ client, multiply, request, type: type2 }) {
  try {
    const response = await estimateGas(client, {
      ...request,
      account: request?.account
    });
    const { priorityFeePerGas: maxPriorityFeePerGas } = response;
    const baseFeePerGas = multiply(BigInt(response.baseFeePerGas));
    const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
    if (type2 === "legacy")
      return { gasPrice: maxFeePerGas };
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  } catch {
    return null;
  }
}
const linea = /* @__PURE__ */ defineChain({
  ...chainConfig$1,
  id: 59144,
  name: "Linea Mainnet",
  blockTime: 2e3,
  nativeCurrency: { name: "Linea Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.linea.build"],
      webSocket: ["wss://rpc.linea.build"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://lineascan.build",
      apiUrl: "https://api.lineascan.build/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 42
    },
    ensRegistry: {
      address: "0x50130b669B28C339991d8676FA73CF122a121267",
      blockCreated: 6682888
    },
    ensUniversalResolver: {
      address: "0x4D41762915F83c76EcaF6776d9b08076aA32b492",
      blockCreated: 22222151
    }
  },
  ensTlds: [".linea.eth"],
  testnet: false
});
const lineaGoerli = /* @__PURE__ */ defineChain({
  id: 59140,
  name: "Linea Goerli Testnet",
  nativeCurrency: { name: "Linea Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.goerli.linea.build"],
      webSocket: ["wss://rpc.goerli.linea.build"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://goerli.lineascan.build",
      apiUrl: "https://api-goerli.lineascan.build/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 498623
    }
  },
  testnet: true
});
const lineaSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$1,
  id: 59141,
  name: "Linea Sepolia Testnet",
  nativeCurrency: { name: "Linea Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.linea.build"],
      webSocket: ["wss://rpc.sepolia.linea.build"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.lineascan.build",
      apiUrl: "https://api-sepolia.lineascan.build/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 227427
    },
    ensRegistry: {
      address: "0x5B2636F0f2137B4aE722C01dd5122D7d3e9541f7",
      blockCreated: 2395094
    },
    ensUniversalResolver: {
      address: "0x4D41762915F83c76EcaF6776d9b08076aA32b492",
      blockCreated: 17168484
    }
  },
  ensTlds: [".linea.eth"],
  testnet: true
});
const lineaTestnet = /* @__PURE__ */ defineChain({
  id: 59140,
  name: "Linea Goerli Testnet",
  nativeCurrency: { name: "Linea Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.goerli.linea.build"],
      webSocket: ["wss://rpc.goerli.linea.build"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://goerli.lineascan.build",
      apiUrl: "https://goerli.lineascan.build/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 498623
    }
  },
  testnet: true
});
const sourceId$C = 1;
const lisk = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1135,
  name: "Lisk",
  network: "lisk",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.api.lisk.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout.lisk.com",
      apiUrl: "https://blockscout.lisk.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$C]: {
        address: "0x0CF7D3706a27CCE2017aEB11E8a9c8b5388c282C"
      }
    },
    multicall3: {
      address: "0xA9d71E1dd7ca26F26e656E66d6AA81ed7f745bf0"
    },
    l2OutputOracle: {
      [sourceId$C]: {
        address: "0x113cB99283AF242Da0A0C54347667edF531Aa7d6"
      }
    },
    portal: {
      [sourceId$C]: {
        address: "0x26dB93F8b8b4f7016240af62F7730979d353f9A7"
      }
    },
    l1StandardBridge: {
      [sourceId$C]: {
        address: "0x2658723Bf70c7667De6B25F99fcce13A16D25d08"
      }
    }
  },
  sourceId: sourceId$C
});
const sourceId$B = 11155111;
const liskSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 4202,
  network: "lisk-sepolia",
  name: "Lisk Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia-api.lisk.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepolia-blockscout.lisk.com",
      apiUrl: "https://sepolia-blockscout.lisk.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$B]: {
        address: "0xA0E35F56C318DE1bD5D9ca6A94Fe7e37C5663348"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    },
    portal: {
      [sourceId$B]: {
        address: "0xe3d90F21490686Ec7eF37BE788E02dfC12787264"
      }
    },
    l1StandardBridge: {
      [sourceId$B]: {
        address: "0x1Fb30e446eA791cd1f011675E5F3f5311b70faF5"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$B
});
const loadAlphanet = /* @__PURE__ */ defineChain({
  id: 9496,
  name: "Load Alphanet",
  nativeCurrency: { name: "Testnet LOAD", symbol: "tLOAD", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://alphanet.load.network"] }
  },
  blockExplorers: {
    default: {
      name: "Load Alphanet Explorer",
      url: "https://explorer.load.network"
    }
  },
  testnet: true
});
const localhost = /* @__PURE__ */ defineChain({
  id: 1337,
  name: "Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] }
  }
});
const loop = /* @__PURE__ */ defineChain({
  id: 15551,
  name: "LoopNetwork Mainnet",
  nativeCurrency: {
    name: "LOOP",
    symbol: "LOOP",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://api.mainnetloop.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "LoopNetwork Blockchain Explorer",
      url: "https://explorer.mainnetloop.com/"
    }
  },
  testnet: false
});
const lukso = /* @__PURE__ */ defineChain({
  id: 42,
  network: "lukso",
  name: "LUKSO",
  nativeCurrency: {
    name: "LUKSO",
    symbol: "LYX",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.lukso.network"],
      webSocket: ["wss://ws-rpc.mainnet.lukso.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "LUKSO Mainnet Explorer",
      url: "https://explorer.execution.mainnet.lukso.network",
      apiUrl: "https://api.explorer.execution.mainnet.lukso.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 468183
    }
  }
});
const luksoTestnet = /* @__PURE__ */ defineChain({
  id: 4201,
  name: "LUKSO Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "LUKSO Testnet",
    symbol: "LYXt"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.lukso.network"],
      webSocket: ["wss://ws-rpc.testnet.lukso.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "LUKSO Testnet Explorer",
      url: "https://explorer.execution.testnet.lukso.network",
      apiUrl: "https://api.explorer.execution.testnet.lukso.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 605348
    }
  },
  testnet: true
});
const lumiaMainnet = /* @__PURE__ */ defineChain({
  id: 994873017,
  name: "Lumia Mainnet",
  network: "LumiaMainnet",
  nativeCurrency: { name: "Lumia", symbol: "LUMIA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.lumia.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lumia Explorer",
      url: "https://explorer.lumia.org/"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3975939
    }
  },
  testnet: false
});
const lumiaTestnet = /* @__PURE__ */ defineChain({
  id: 1952959480,
  name: "Lumia Testnet",
  network: "LumiaTestnet",
  nativeCurrency: {
    name: "Lumia",
    symbol: "LUMIA",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.lumia.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lumia Testnet Explorer",
      url: "https://testnet-explorer.lumia.org/"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2235063
    }
  },
  testnet: true
});
const lumoz = /* @__PURE__ */ defineChain({
  id: 96370,
  name: "Lumoz",
  nativeCurrency: {
    decimals: 18,
    name: "Lumoz Token",
    symbol: "MOZ"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.lumoz.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lumoz Scan",
      url: "https://scan.lumoz.info"
    }
  },
  testnet: false
});
const lumozTestnet = /* @__PURE__ */ defineChain({
  id: 105363,
  name: "Lumoz Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Lumoz Testnet Token",
    symbol: "MOZ"
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.lumoz.org"]
    }
  },
  testnet: true
});
const luxeports = /* @__PURE__ */ defineChain({
  id: 1122,
  name: "LuxePorts",
  network: "luxeports",
  nativeCurrency: {
    name: "LuxePorts",
    symbol: "LXP",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.luxeports.com", "https://erpc.luxeports.com"],
      webSocket: ["wss://rpc.luxeports.com/ws", "wss://erpc.luxeports.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "LXPScan",
      url: "https://lxpscan.com"
    }
  },
  testnet: false
});
const lycan = /* @__PURE__ */ defineChain({
  id: 721,
  name: "Lycan",
  nativeCurrency: {
    decimals: 18,
    name: "Lycan",
    symbol: "LYC"
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.lycanchain.com",
        "https://us-east.lycanchain.com",
        "https://us-west.lycanchain.com",
        "https://eu-north.lycanchain.com",
        "https://eu-west.lycanchain.com",
        "https://asia-southeast.lycanchain.com"
      ],
      webSocket: [
        "wss://rpc.lycanchain.com",
        "wss://us-east.lycanchain.com",
        "wss://us-west.lycanchain.com",
        "wss://eu-north.lycanchain.com",
        "wss://eu-west.lycanchain.com",
        "wss://asia-southeast.lycanchain.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Lycan Explorer",
      url: "https://explorer.lycanchain.com"
    }
  }
});
const lyra = /* @__PURE__ */ defineChain({
  id: 957,
  name: "Lyra Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.lyra.finance"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lyra Explorer",
      url: "https://explorer.lyra.finance",
      apiUrl: "https://explorer.lyra.finance/api/v2"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1935198
    }
  }
});
const mainnet = /* @__PURE__ */ defineChain({
  id: 1,
  name: "Ethereum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockTime: 12e3,
  rpcUrls: {
    default: {
      http: ["https://eth.merkle.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
      apiUrl: "https://api.etherscan.io/api"
    }
  },
  contracts: {
    ensUniversalResolver: {
      address: "0xeeeeeeee14d718c2b47d9923deab1335e144eeee",
      blockCreated: 23085558
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14353601
    }
  }
});
const mandala = /* @__PURE__ */ defineChain({
  id: 595,
  name: "Mandala TC9",
  network: "mandala",
  nativeCurrency: {
    name: "Mandala",
    symbol: "mACA",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://eth-rpc-tc9.aca-staging.network"],
      webSocket: ["wss://eth-rpc-tc9.aca-staging.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Mandala Blockscout",
      url: "https://blockscout.mandala.aca-staging.network",
      apiUrl: "https://blockscout.mandala.aca-staging.network/api"
    }
  },
  testnet: true
});
const manta = /* @__PURE__ */ defineChain({
  id: 169,
  name: "Manta Pacific Mainnet",
  network: "manta",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://pacific-rpc.manta.network/http"] }
  },
  blockExplorers: {
    default: {
      name: "Manta Explorer",
      url: "https://pacific-explorer.manta.network",
      apiUrl: "https://pacific-explorer.manta.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 332890
    }
  }
});
const mantaSepoliaTestnet = /* @__PURE__ */ defineChain({
  id: 3441006,
  name: "Manta Pacific Sepolia Testnet",
  network: "manta-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://pacific-rpc.sepolia-testnet.manta.network/http"]
    }
  },
  blockExplorers: {
    default: {
      name: "Manta Sepolia Testnet Explorer",
      url: "https://pacific-explorer.sepolia-testnet.manta.network",
      apiUrl: "https://pacific-explorer.sepolia-testnet.manta.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca54918f7B525C8df894668846506767412b53E3",
      blockCreated: 479584
    }
  },
  testnet: true
});
const mantaTestnet = /* @__PURE__ */ defineChain({
  id: 3441005,
  name: "Manta Pacific Testnet",
  network: "manta-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://manta-testnet.calderachain.xyz/http"] }
  },
  blockExplorers: {
    default: {
      name: "Manta Testnet Explorer",
      url: "https://pacific-explorer.testnet.manta.network",
      apiUrl: "https://pacific-explorer.testnet.manta.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x211B1643b95Fe76f11eD8880EE810ABD9A4cf56C",
      blockCreated: 419915
    }
  },
  testnet: true
});
const mantle = /* @__PURE__ */ defineChain({
  id: 5e3,
  name: "Mantle",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT"
  },
  rpcUrls: {
    default: { http: ["https://rpc.mantle.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Mantle Explorer",
      url: "https://mantlescan.xyz/",
      apiUrl: "https://api.mantlescan.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 304717
    }
  }
});
const mantleSepoliaTestnet = /* @__PURE__ */ defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT"
  },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Mantle Testnet Explorer",
      url: "https://explorer.sepolia.mantle.xyz/",
      apiUrl: "https://explorer.sepolia.mantle.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 4584012
    }
  },
  testnet: true
});
const mantleTestnet = /* @__PURE__ */ defineChain({
  id: 5001,
  name: "Mantle Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT"
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.mantle.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Mantle Testnet Explorer",
      url: "https://explorer.testnet.mantle.xyz",
      apiUrl: "https://explorer.testnet.mantle.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 561333
    }
  },
  testnet: true
});
const mantraDuKongEVMTestnet = /* @__PURE__ */ defineChain({
  id: 5887,
  name: "MANTRA DuKong EVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MANTRA",
    symbol: "MANTRA"
  },
  rpcUrls: {
    default: { http: ["https://evm.dukong.mantrachain.io"] }
  },
  blockExplorers: {
    default: {
      name: "MANTRAScan",
      url: "https://mantrascan.io/dukong"
    }
  },
  testnet: true
});
const mantraEVM = /* @__PURE__ */ defineChain({
  id: 5888,
  name: "MANTRA EVM",
  nativeCurrency: {
    decimals: 18,
    name: "MANTRA",
    symbol: "MANTRA"
  },
  rpcUrls: {
    default: {
      http: ["https://evm.mantrachain.io"],
      webSocket: ["https://evm.mantrachain.io/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "MANTRA Blockscout Explorer",
      url: "https://blockscout.mantrascan.io"
    }
  }
});
const mapProtocol = /* @__PURE__ */ defineChain({
  id: 22776,
  name: "MAP Protocol",
  nativeCurrency: {
    decimals: 18,
    name: "MAPO",
    symbol: "MAPO"
  },
  rpcUrls: {
    default: { http: ["https://rpc.maplabs.io"] }
  },
  blockExplorers: {
    default: {
      name: "MAPO Scan",
      url: "https://maposcan.io"
    }
  },
  testnet: false
});
const matchain = /* @__PURE__ */ defineChain({
  id: 698,
  name: "Matchain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://rpc.matchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Matchain Scan",
      url: "https://matchscan.io"
    }
  }
});
const matchainTestnet = /* @__PURE__ */ defineChain({
  id: 699,
  name: "Matchain Testnet",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.matchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Matchain Scan",
      url: "https://testnet.matchscan.io"
    }
  },
  testnet: true
});
const mchVerse = /* @__PURE__ */ defineChain({
  id: 29548,
  name: "MCH Verse",
  nativeCurrency: { name: "Oasys", symbol: "OAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.oasys.mycryptoheroes.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "MCH Verse Explorer",
      url: "https://explorer.oasys.mycryptoheroes.net",
      apiUrl: "https://explorer.oasys.mycryptoheroes.net/api"
    }
  },
  testnet: false
});
const sourceId$A = 1;
const megaeth = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 4326,
  blockTime: 1e3,
  name: "MegaETH",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.megaeth.com/rpc"],
      webSocket: ["wss://mainnet.megaeth.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://mega.etherscan.io",
      apiUrl: "https://api.etherscan.io/v2/api"
    },
    blockscout: {
      name: "Blockscout",
      url: "https://megaeth.blockscout.com",
      apiUrl: "https://megaeth.blockscout.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$A]: {
        address: "0x8546840adF796875cD9AAcc5B3B048f6B2c9D563"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    },
    portal: {
      [sourceId$A]: {
        address: "0x7f82f57F0Dd546519324392e408b01fcC7D709e8",
        blockCreated: 21644285
      }
    },
    l1StandardBridge: {
      [sourceId$A]: {
        address: "0x0CA3A2FBC3D770b578223FBB6b062fa875a2eE75",
        blockCreated: 21644285
      }
    }
  },
  sourceId: sourceId$A
});
const megaethTestnet = /* @__PURE__ */ defineChain({
  id: 6343,
  blockTime: 1e3,
  name: "MegaETH Testnet",
  nativeCurrency: {
    name: "MegaETH Testnet Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://carrot.megaeth.com/rpc"],
      webSocket: ["wss://carrot.megaeth.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://testnet-mega.etherscan.io",
      apiUrl: "https://api.etherscan.io/v2/api"
    },
    blockscout: {
      name: "Blockscout",
      url: "https://megaeth-testnet-v2.blockscout.com",
      apiUrl: "https://megaeth-testnet-v2.blockscout.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  },
  testnet: true
});
const mekong = /* @__PURE__ */ defineChain({
  id: 7078815900,
  name: "Mekong Pectra Devnet",
  nativeCurrency: { name: "eth", symbol: "eth", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mekong.ethpandaops.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://explorer.mekong.ethpandaops.io"
    }
  },
  testnet: true
});
const meld = /* @__PURE__ */ defineChain({
  id: 333000333,
  name: "Meld",
  nativeCurrency: {
    decimals: 18,
    name: "Meld",
    symbol: "MELD"
  },
  rpcUrls: {
    default: { http: ["https://rpc-1.meld.com"] }
  },
  blockExplorers: {
    default: { name: "MELDscan", url: "https://meldscan.io" }
  },
  contracts: {
    multicall3: {
      address: "0x769ee5a8e82c15c1b6e358f62ac8eb6e3abe8dc5",
      blockCreated: 360069
    }
  }
});
const memecore = /* @__PURE__ */ defineChain({
  id: 4352,
  name: "MemeCore",
  nativeCurrency: {
    decimals: 18,
    name: "M",
    symbol: "M"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.memecore.net"],
      webSocket: ["wss://ws.memecore.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "MemeCore Explorer",
      url: "https://memecorescan.io",
      apiUrl: "https://api.memecorescan.io/api"
    },
    okx: {
      name: "MemeCore Explorer",
      url: "https://web3.okx.com/explorer/memecore"
    },
    memecore: {
      name: "MemeCore Explorer",
      url: "https://blockscout.memecore.com",
      apiUrl: "https://blockscout.memecore.com/api"
    }
  }
});
const formicarium = /* @__PURE__ */ defineChain({
  id: 43521,
  name: "Formicarium",
  nativeCurrency: {
    decimals: 18,
    name: "M",
    symbol: "M"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.formicarium.memecore.net"],
      webSocket: ["wss://ws.formicarium.memecore.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "MemeCore Testnet Explorer",
      url: "https://formicarium.memecorescan.io"
    },
    okx: {
      name: "MemeCore Testnet Explorer",
      url: "https://web3.okx.com/explorer/formicarium-testnet"
    },
    memecore: {
      name: "MemeCore Testnet Explorer",
      url: "https://formicarium.blockscout.memecore.com",
      apiUrl: "https://formicarium.blockscout.memecore.com/api"
    }
  },
  testnet: true
});
const merlin = /* @__PURE__ */ defineChain({
  id: 4200,
  name: "Merlin",
  nativeCurrency: {
    name: "BTC",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://rpc.merlinchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://scan.merlinchain.io",
      apiUrl: "https://scan.merlinchain.io/api"
    }
  }
});
const merlinErigonTestnet = /* @__PURE__ */ defineChain({
  id: 4203,
  name: "Merlin Erigon Testnet",
  nativeCurrency: {
    name: "BTC",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://testnet-erigon-rpc.merlinchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://testnet-erigon-scan.merlinchain.io",
      apiUrl: "https://testnet-erigon-scan.merlinchain.io/api"
    }
  },
  testnet: true
});
const metachain = /* @__PURE__ */ defineChain({
  id: 571,
  name: "MetaChain Mainnet",
  nativeCurrency: { name: "Metatime Coin", symbol: "MTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.metatime.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "MetaExplorer",
      url: "https://explorer.metatime.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0x0000000000000000000000000000000000003001",
      blockCreated: 0
    }
  }
});
const metachainIstanbul = /* @__PURE__ */ defineChain({
  id: 1453,
  name: "MetaChain Istanbul",
  nativeCurrency: { name: "Metatime Coin", symbol: "MTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://istanbul-rpc.metachain.dev"]
    }
  },
  blockExplorers: {
    default: {
      name: "MetaExplorer",
      url: "https://istanbul-explorer.metachain.dev"
    }
  },
  contracts: {
    multicall3: {
      address: "0x0000000000000000000000000000000000003001",
      blockCreated: 0
    }
  },
  testnet: true
});
const metadium = /* @__PURE__ */ defineChain({
  id: 11,
  name: "Metadium Network",
  nativeCurrency: {
    decimals: 18,
    name: "META",
    symbol: "META"
  },
  rpcUrls: {
    default: { http: ["https://api.metadium.com/prod"] }
  },
  blockExplorers: {
    default: {
      name: "Metadium Explorer",
      url: "https://explorer.metadium.com"
    }
  },
  testnet: false
});
const sourceId$z = 1;
const metalL2 = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1750,
  name: "Metal L2",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.metall2.com"],
      webSocket: ["wss://rpc.metall2.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.metall2.com",
      apiUrl: "https://explorer.metall2.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$z]: {
        address: "0x3B1F7aDa0Fcc26B13515af752Dd07fB1CAc11426"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    },
    portal: {
      [sourceId$z]: {
        address: "0x3F37aBdE2C6b5B2ed6F8045787Df1ED1E3753956"
      }
    },
    l1StandardBridge: {
      [sourceId$z]: {
        address: "0x6d0f65D59b55B0FEC5d2d15365154DcADC140BF3"
      }
    }
  },
  sourceId: sourceId$z
});
const meter = /* @__PURE__ */ defineChain({
  id: 82,
  name: "Meter",
  nativeCurrency: {
    decimals: 18,
    name: "MTR",
    symbol: "MTR"
  },
  rpcUrls: {
    default: { http: ["https://rpc.meter.io"] }
  },
  blockExplorers: {
    default: {
      name: "MeterScan",
      url: "https://scan.meter.io"
    }
  }
});
const meterTestnet = /* @__PURE__ */ defineChain({
  id: 83,
  name: "Meter Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MTR",
    symbol: "MTR"
  },
  rpcUrls: {
    default: { http: ["https://rpctest.meter.io"] }
  },
  blockExplorers: {
    default: {
      name: "MeterTestnetScan",
      url: "https://scan-warringstakes.meter.io"
    }
  },
  testnet: true
});
const metis = /* @__PURE__ */ defineChain({
  id: 1088,
  name: "Metis",
  nativeCurrency: {
    decimals: 18,
    name: "Metis",
    symbol: "METIS"
  },
  rpcUrls: {
    default: {
      http: [
        "https://metis.rpc.hypersync.xyz",
        "https://metis-pokt.nodies.app",
        "https://api.blockeden.xyz/metis/67nCBdZQSH9z3YqDDjdm",
        "https://metis-andromeda.rpc.thirdweb.com",
        "https://metis-andromeda.gateway.tenderly.co",
        "https://metis.api.onfinality.io/public",
        "https://andromeda.metis.io/?owner=1088",
        "https://metis-mainnet.public.blastapi.io"
      ],
      webSocket: ["wss://metis-rpc.publicnode.com", "wss://metis.drpc.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Metis Explorer",
      url: "https://explorer.metis.io",
      apiUrl: "https://api.routescan.io/v2/network/mainnet/evm/1088/etherscan/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 2338552
    }
  }
});
const metisGoerli = /* @__PURE__ */ defineChain({
  id: 599,
  name: "Metis Goerli",
  nativeCurrency: {
    decimals: 18,
    name: "Metis Goerli",
    symbol: "METIS"
  },
  rpcUrls: {
    default: { http: ["https://goerli.gateway.metisdevops.link"] }
  },
  blockExplorers: {
    default: {
      name: "Metis Goerli Explorer",
      url: "https://goerli.explorer.metisdevops.link",
      apiUrl: "https://goerli.explorer.metisdevops.link/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1006207
    }
  },
  testnet: true
});
const metisSepolia = /* @__PURE__ */ defineChain({
  id: 59902,
  name: "Metis Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Test Metis",
    symbol: "tMETIS"
  },
  rpcUrls: {
    default: {
      http: [
        "https://sepolia.metisdevops.link",
        "https://metis-sepolia-rpc.publicnode.com",
        "https://metis-sepolia.gateway.tenderly.co"
      ],
      webSocket: ["wss://metis-sepolia-rpc.publicnode.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Metis Sepolia Explorer",
      url: "https://sepolia-explorer.metisdevops.link",
      apiUrl: "https://sepolia-explorer.metisdevops.link/api-docs"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 224185
    }
  },
  testnet: true
});
const mev = /* @__PURE__ */ defineChain({
  id: 7518,
  name: "MEVerse Chain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "MEVerse",
    symbol: "MEV"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.meversemainnet.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://www.meversescan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 86881340
    }
  }
});
const mevTestnet = /* @__PURE__ */ defineChain({
  id: 4759,
  name: "MEVerse Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MEVerse",
    symbol: "MEV"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.meversetestnet.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://testnet.meversescan.io/"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 64371115
    }
  },
  testnet: true
});
const mezo = /* @__PURE__ */ defineChain({
  id: 31612,
  name: "Mezo",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcoin",
    symbol: "BTC"
  },
  rpcUrls: {
    default: { http: ["https://rpc.mezo.org"] }
  },
  blockExplorers: {
    default: {
      name: "Mezo Explorer",
      url: "https://explorer.mezo.org"
    }
  }
});
const mezoTestnet = /* @__PURE__ */ defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcoin",
    symbol: "BTC"
  },
  rpcUrls: {
    default: { http: ["https://rpc.test.mezo.org"] }
  },
  blockExplorers: {
    default: {
      name: "Mezo Testnet Explorer",
      url: "https://explorer.test.mezo.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3328573
    }
  },
  testnet: true
});
const mint = /* @__PURE__ */ defineChain({
  id: 185,
  name: "Mint Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mintchain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Mintchain explorer",
      url: "https://explorer.mintchain.io"
    }
  },
  testnet: false
});
const mintSepoliaTestnet = /* @__PURE__ */ defineChain({
  id: 1686,
  name: "Mint Sepolia Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.mintchain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Mintchain Testnet explorer",
      url: "https://testnet-explorer.mintchain.io"
    }
  },
  testnet: true
});
const mitosisTestnet = /* @__PURE__ */ defineChain({
  id: 124832,
  name: "Mitosis Testnet",
  nativeCurrency: { name: "MITO", symbol: "MITO", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.mitosis.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Mitosis testnet explorer",
      url: "https://testnet.mitosiscan.xyz"
    }
  },
  testnet: true
});
const mizuhikiTestnetAwaji = /* @__PURE__ */ defineChain({
  id: 6497,
  name: "MIZUHIKI Testnet Awaji",
  nativeCurrency: { name: "MIZU", symbol: "MIZU", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.awaji.mizuhiki.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://awaji.blockscout.com",
      apiUrl: "https://awaji.blockscout.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    }
  },
  testnet: true
});
const sourceId$y = 1;
const mode = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 34443,
  name: "Mode Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.mode.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Modescan",
      url: "https://modescan.io"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$y]: {
        address: "0x6f13EFadABD9269D6cEAd22b448d434A1f1B433E"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 2465882
    },
    l2OutputOracle: {
      [sourceId$y]: {
        address: "0x4317ba146D4933D889518a3e5E11Fe7a53199b04"
      }
    },
    portal: {
      [sourceId$y]: {
        address: "0x8B34b14c7c7123459Cf3076b8Cb929BE097d0C07"
      }
    },
    l1StandardBridge: {
      [sourceId$y]: {
        address: "0x735aDBbE72226BD52e818E7181953f42E3b0FF21"
      }
    }
  },
  sourceId: sourceId$y
});
const sourceId$x = 11155111;
const modeTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 919,
  name: "Mode Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.mode.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepolia.explorer.mode.network",
      apiUrl: "https://sepolia.explorer.mode.network/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$x]: {
        address: "0x2634BD65ba27AB63811c74A63118ACb312701Bfa",
        blockCreated: 3778393
      }
    },
    portal: {
      [sourceId$x]: {
        address: "0x320e1580effF37E008F1C92700d1eBa47c1B23fD",
        blockCreated: 3778395
      }
    },
    l1StandardBridge: {
      [sourceId$x]: {
        address: "0xbC5C679879B2965296756CD959C3C739769995E2",
        blockCreated: 3778392
      }
    },
    multicall3: {
      address: "0xBAba8373113Fb7a68f195deF18732e01aF8eDfCF",
      blockCreated: 3019007
    }
  },
  testnet: true,
  sourceId: sourceId$x
});
const monad = /* @__PURE__ */ defineChain({
  id: 143,
  name: "Monad",
  blockTime: 400,
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.monad.xyz", "https://rpc1.monad.xyz"],
      webSocket: ["wss://rpc.monad.xyz", "wss://rpc1.monad.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "MonadVision",
      url: "https://monadvision.com"
    },
    monadscan: {
      name: "Monadscan",
      url: "https://monadscan.com",
      apiUrl: "https://api.monadscan.com/api"
    }
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 9248132
    }
  }
});
const monadTestnet = /* @__PURE__ */ defineChain({
  id: 10143,
  name: "Monad Testnet",
  blockTime: 400,
  nativeCurrency: {
    name: "Testnet MON Token",
    symbol: "MON",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet explorer",
      url: "https://testnet.monadexplorer.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 251449
    }
  },
  testnet: true
});
const moonbaseAlpha = /* @__PURE__ */ defineChain({
  id: 1287,
  name: "Moonbase Alpha",
  nativeCurrency: {
    decimals: 18,
    name: "DEV",
    symbol: "DEV"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.api.moonbase.moonbeam.network"],
      webSocket: ["wss://wss.api.moonbase.moonbeam.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonbase.moonscan.io",
      apiUrl: "https://moonbase.moonscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1850686
    }
  },
  testnet: true
});
const moonbeam = /* @__PURE__ */ defineChain({
  id: 1284,
  name: "Moonbeam",
  nativeCurrency: {
    decimals: 18,
    name: "Moonbeam",
    symbol: "GLMR"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.api.moonbeam.network"],
      webSocket: ["wss://wss.api.moonbeam.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonscan.io",
      apiUrl: "https://api-moonbeam.moonscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 609002
    }
  },
  testnet: false
});
const moonbeamDev = /* @__PURE__ */ defineChain({
  id: 1281,
  name: "Moonbeam Development Node",
  nativeCurrency: {
    decimals: 18,
    name: "DEV",
    symbol: "DEV"
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:9944"],
      webSocket: ["wss://127.0.0.1:9944"]
    }
  }
});
const moonriver = /* @__PURE__ */ defineChain({
  id: 1285,
  name: "Moonriver",
  nativeCurrency: {
    decimals: 18,
    name: "Moonriver",
    symbol: "MOVR"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.api.moonriver.moonbeam.network"],
      webSocket: ["wss://wss.api.moonriver.moonbeam.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonriver.moonscan.io",
      apiUrl: "https://api-moonriver.moonscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1597904
    }
  },
  testnet: false
});
const morph = /* @__PURE__ */ defineChain({
  id: 2818,
  name: "Morph",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.morphl2.io"],
      webSocket: ["wss://rpc.morphl2.io:8443"]
    }
  },
  blockExplorers: {
    default: {
      name: "Morph Explorer",
      url: "https://explorer.morphl2.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3654913
    }
  },
  testnet: false
});
const morphHolesky = /* @__PURE__ */ defineChain({
  id: 2810,
  name: "Morph Holesky",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-quicknode-holesky.morphl2.io"],
      webSocket: ["wss://rpc-quicknode-holesky.morphl2.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Morph Holesky Explorer",
      url: "https://explorer-holesky.morphl2.io",
      apiUrl: "https://explorer-api-holesky.morphl2.io/api"
    }
  },
  testnet: true
});
const morphSepolia = /* @__PURE__ */ defineChain({
  id: 2710,
  name: "Morph Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.morphl2.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Morph Testnet Explorer",
      url: "https://explorer-testnet.morphl2.io",
      apiUrl: "https://explorer-api-testnet.morphl2.io/api"
    }
  },
  testnet: true
});
const nahmii = /* @__PURE__ */ defineChain({
  id: 5551,
  name: "Nahmii 2 Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://l2.nahmii.io"] }
  },
  blockExplorers: {
    default: {
      name: "Nahmii 2 Explorer",
      url: "https://explorer.n2.nahmii.io"
    }
  },
  testnet: false
});
const nautilus = /* @__PURE__ */ defineChain({
  id: 22222,
  name: "Nautilus Mainnet",
  nativeCurrency: { name: "ZBC", symbol: "ZBC", decimals: 9 },
  rpcUrls: {
    default: {
      http: ["https://api.nautilus.nautchain.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "NautScan",
      url: "https://nautscan.com"
    }
  }
});
const near = /* @__PURE__ */ defineChain({
  id: 397,
  name: "NEAR Protocol",
  nativeCurrency: {
    decimals: 18,
    name: "NEAR",
    symbol: "NEAR"
  },
  rpcUrls: {
    default: { http: ["https://eth-rpc.mainnet.near.org"] }
  },
  blockExplorers: {
    default: {
      name: "NEAR Explorer",
      url: "https://eth-explorer.near.org"
    }
  },
  testnet: false
});
const nearTestnet = /* @__PURE__ */ defineChain({
  id: 398,
  name: "NEAR Protocol Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "NEAR",
    symbol: "NEAR"
  },
  rpcUrls: {
    default: { http: ["https://eth-rpc.testnet.near.org"] }
  },
  blockExplorers: {
    default: {
      name: "NEAR Explorer",
      url: "https://eth-explorer-testnet.near.org"
    }
  },
  testnet: true
});
const neonDevnet = /* @__PURE__ */ defineChain({
  id: 245022926,
  name: "Neon EVM DevNet",
  nativeCurrency: { name: "NEON", symbol: "NEON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://devnet.neonevm.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Neonscan",
      url: "https://devnet.neonscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 205206112
    }
  },
  testnet: true
});
const neonMainnet = /* @__PURE__ */ defineChain({
  id: 245022934,
  network: "neonMainnet",
  name: "Neon EVM MainNet",
  nativeCurrency: { name: "NEON", symbol: "NEON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://neon-proxy-mainnet.solana.p2p.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Neonscan",
      url: "https://neonscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 206545524
    }
  },
  testnet: false
});
const neoxMainnet = /* @__PURE__ */ defineChain({
  id: 47763,
  name: "Neo X Mainnet",
  nativeCurrency: { name: "Gas", symbol: "GAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://mainnet-1.rpc.banelabs.org",
        "https://mainnet-2.rpc.banelabs.org"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Neo X - Explorer",
      url: "https://xexplorer.neo.org"
    }
  },
  testnet: false
});
const neoxT4 = /* @__PURE__ */ defineChain({
  id: 12227332,
  name: "Neo X Testnet T4",
  nativeCurrency: { name: "Gas", symbol: "GAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.rpc.banelabs.org/"]
    }
  },
  blockExplorers: {
    default: {
      name: "neox-scan",
      url: "https://xt4scan.ngd.network"
    }
  },
  testnet: true
});
const newton = /* @__PURE__ */ defineChain({
  id: 1012,
  name: "Newton",
  nativeCurrency: {
    name: "Newton",
    symbol: "NEW",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://global.rpc.mainnet.newtonproject.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "NewFi explorer",
      url: "https://explorer.newtonproject.org/"
    }
  },
  testnet: false
});
const nexi = /* @__PURE__ */ defineChain({
  id: 4242,
  name: "Nexi",
  nativeCurrency: { name: "Nexi", symbol: "NEXI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.chain.nexi.technology"]
    }
  },
  blockExplorers: {
    default: {
      name: "NexiScan",
      url: "https://www.nexiscan.com",
      apiUrl: "https://www.nexiscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x0277A46Cc69A57eE3A6C8c158bA874832F718B8E",
      blockCreated: 25770160
    }
  }
});
const nexilix = /* @__PURE__ */ defineChain({
  id: 240,
  name: "Nexilix Smart Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Nexilix",
    symbol: "NEXILIX"
  },
  rpcUrls: {
    default: { http: ["https://rpcurl.pos.nexilix.com"] }
  },
  blockExplorers: {
    default: {
      name: "NexilixScan",
      url: "https://scan.nexilix.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0x58381c8e2BF9d0C2C4259cA14BdA9Afe02831244",
      blockCreated: 74448
    }
  }
});
const nibiru = /* @__PURE__ */ defineChain({
  id: 6900,
  name: "Nibiru",
  nativeCurrency: {
    decimals: 18,
    name: "NIBI",
    symbol: "NIBI"
  },
  rpcUrls: {
    default: { http: ["https://evm-rpc.nibiru.fi"] }
  },
  blockExplorers: {
    default: {
      name: "NibiScan",
      url: "https://nibiscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 19587573
    }
  }
});
const nitrographTestnet = /* @__PURE__ */ defineChain({
  id: 200024,
  name: "Nitrograph Testnet",
  testnet: true,
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.nitrograph.foundation"]
    }
  },
  nativeCurrency: {
    name: "Nitro",
    symbol: "NOS",
    decimals: 18
  },
  blockExplorers: {
    default: {
      url: "https://explorer-testnet.nitrograph.foundation",
      name: "Nitrograph Explorer"
    }
  }
});
const nomina = /* @__PURE__ */ defineChain({
  id: 166,
  name: "Nomina",
  nativeCurrency: {
    name: "Nomina",
    symbol: "NOM",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.nomina.io"],
      webSocket: ["wss://mainnet.nomina.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Nomina Explorer",
      url: "https://nomscan.io"
    }
  },
  testnet: false
});
const oasisTestnet = /* @__PURE__ */ defineChain({
  id: 4090,
  network: "oasis-testnet",
  name: "Oasis Testnet",
  nativeCurrency: { name: "Fasttoken", symbol: "FTN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc1.oasis.bahamutchain.com"] }
  },
  blockExplorers: {
    default: {
      name: "Ftnscan",
      url: "https://oasis.ftnscan.com",
      apiUrl: "https://oasis.ftnscan.com/api"
    }
  },
  testnet: true
});
const oasys = /* @__PURE__ */ defineChain({
  id: 248,
  name: "Oasys",
  nativeCurrency: { name: "Oasys", symbol: "OAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.oasys.games"]
    }
  },
  blockExplorers: {
    default: {
      name: "OasysScan",
      url: "https://scan.oasys.games",
      apiUrl: "https://scan.oasys.games/api"
    }
  }
});
const odysseyTestnet = /* @__PURE__ */ defineChain({
  id: 911867,
  name: "Odyssey Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://odyssey.ithaca.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "Odyssey Explorer",
      url: "https://odyssey-explorer.ithaca.xyz",
      apiUrl: "https://odyssey-explorer.ithaca.xyz/api"
    }
  },
  testnet: true
});
const okc = /* @__PURE__ */ defineChain({
  id: 66,
  name: "OKC",
  nativeCurrency: {
    decimals: 18,
    name: "OKT",
    symbol: "OKT"
  },
  rpcUrls: {
    default: { http: ["https://exchainrpc.okex.org"] }
  },
  blockExplorers: {
    default: {
      name: "oklink",
      url: "https://www.oklink.com/okc"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 10364792
    }
  }
});
const omax = /* @__PURE__ */ defineChain({
  id: 311,
  name: "Omax Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "OMAX",
    symbol: "OMAX"
  },
  rpcUrls: {
    default: { http: ["https://mainapi.omaxray.com"] }
  },
  blockExplorers: {
    default: {
      name: "Omax Explorer",
      url: "https://omaxscan.com"
    }
  },
  testnet: false
});
const omni = /* @__PURE__ */ defineChain({
  id: 166,
  name: "Omni",
  nativeCurrency: { name: "Omni", symbol: "OMNI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.omni.network"],
      webSocket: ["wss://mainnet.omni.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "OmniScan",
      url: "https://omniscan.network"
    }
  },
  testnet: false
});
const omniOmega = /* @__PURE__ */ defineChain({
  id: 164,
  name: "Omni Omega",
  nativeCurrency: { name: "Omni", symbol: "OMNI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://omega.omni.network"],
      webSocket: ["wss://omega.omni.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Omega OmniScan",
      url: "https://omega.omniscan.network/"
    }
  },
  testnet: true
});
const oneWorld = /* @__PURE__ */ defineChain({
  id: 309075,
  name: "One World Chain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "OWCT",
    symbol: "OWCT"
  },
  rpcUrls: {
    default: { http: ["https://mainnet-rpc.oneworldchain.org"] }
  },
  blockExplorers: {
    default: {
      name: "One World Explorer",
      url: "https://mainnet.oneworldchain.org"
    }
  },
  testnet: false
});
const oortMainnetDev = /* @__PURE__ */ defineChain({
  id: 9700,
  name: "OORT MainnetDev",
  nativeCurrency: {
    decimals: 18,
    name: "OORT",
    symbol: "OORT"
  },
  rpcUrls: {
    default: { http: ["https://dev-rpc.oortech.com"] }
  },
  blockExplorers: {
    default: {
      name: "OORT MainnetDev Explorer",
      url: "https://dev-scan.oortech.com"
    }
  }
});
const sourceId$w = 56;
const opBNB = /* @__PURE__ */ defineChain({
  id: 204,
  name: "opBNB",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://opbnb-mainnet-rpc.bnbchain.org"] }
  },
  blockExplorers: {
    default: {
      name: "opBNB (BSCScan)",
      url: "https://opbnb.bscscan.com",
      apiUrl: "https://api-opbnb.bscscan.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 512881
    },
    l2OutputOracle: {
      [sourceId$w]: {
        address: "0x153CAB79f4767E2ff862C94aa49573294B13D169"
      }
    },
    portal: {
      [sourceId$w]: {
        address: "0x1876EA7702C0ad0C6A2ae6036DE7733edfBca519"
      }
    },
    l1StandardBridge: {
      [sourceId$w]: {
        address: "0xF05F0e4362859c3331Cb9395CBC201E3Fa6757Ea"
      }
    }
  },
  sourceId: sourceId$w
});
const sourceId$v = 97;
const opBNBTestnet = /* @__PURE__ */ defineChain({
  id: 5611,
  name: "opBNB Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "tBNB",
    symbol: "tBNB"
  },
  rpcUrls: {
    default: { http: ["https://opbnb-testnet-rpc.bnbchain.org"] }
  },
  blockExplorers: {
    default: {
      name: "opbnbscan",
      url: "https://testnet.opbnbscan.com"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3705108
    },
    l2OutputOracle: {
      [sourceId$v]: {
        address: "0xFf2394Bb843012562f4349C6632a0EcB92fC8810"
      }
    },
    portal: {
      [sourceId$v]: {
        address: "0x4386C8ABf2009aC0c263462Da568DD9d46e52a31"
      }
    },
    l1StandardBridge: {
      [sourceId$v]: {
        address: "0x677311Fd2cCc511Bbc0f581E8d9a07B033D5E840"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$v
});
const openledger = /* @__PURE__ */ defineChain({
  id: 1612,
  name: "OpenLedger",
  nativeCurrency: { name: "Open", symbol: "OPEN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.openledger.xyz"] }
  },
  blockExplorers: {
    default: {
      name: "OpenLedger Explorer",
      url: "https://scan.openledger.xyz"
    }
  },
  testnet: false
});
const sourceId$u = 1;
const optimism = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 10,
  name: "OP Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.optimism.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Optimism Explorer",
      url: "https://optimistic.etherscan.io",
      apiUrl: "https://api-optimistic.etherscan.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$u]: {
        address: "0xe5965Ab5962eDc7477C8520243A95517CD252fA9"
      }
    },
    l2OutputOracle: {
      [sourceId$u]: {
        address: "0xdfe97868233d1aa22e815a266982f2cf17685a27"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 4286263
    },
    portal: {
      [sourceId$u]: {
        address: "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed"
      }
    },
    l1StandardBridge: {
      [sourceId$u]: {
        address: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1"
      }
    }
  },
  sourceId: sourceId$u
});
const sourceId$t = 5;
const optimismGoerli = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 420,
  name: "Optimism Goerli",
  nativeCurrency: { name: "Goerli Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://goerli.optimism.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://goerli-optimism.etherscan.io",
      apiUrl: "https://goerli-optimism.etherscan.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$t]: {
        address: "0xE6Dfba0953616Bacab0c9A8ecb3a9BBa77FC15c0"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 49461
    },
    portal: {
      [sourceId$t]: {
        address: "0x5b47E1A08Ea6d985D6649300584e6722Ec4B1383"
      }
    },
    l1StandardBridge: {
      [sourceId$t]: {
        address: "0x636Af16bf2f682dD3109e60102b8E1A089FedAa8"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$t
});
const sourceId$s = 11155111;
const optimismSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 11155420,
  name: "OP Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.optimism.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://optimism-sepolia.blockscout.com",
      apiUrl: "https://optimism-sepolia.blockscout.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$s]: {
        address: "0x05F9613aDB30026FFd634f38e5C4dFd30a197Fa1"
      }
    },
    l2OutputOracle: {
      [sourceId$s]: {
        address: "0x90E9c4f8a994a250F6aEfd61CAFb4F2e895D458F"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1620204
    },
    portal: {
      [sourceId$s]: {
        address: "0x16Fc5058F25648194471939df75CF27A2fdC48BC"
      }
    },
    l1StandardBridge: {
      [sourceId$s]: {
        address: "0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$s
});
const optopia = /* @__PURE__ */ defineChain({
  id: 62050,
  name: "Optopia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-mainnet.optopia.ai"] }
  },
  blockExplorers: {
    default: {
      name: "Optopia Explorer",
      url: "https://scan.optopia.ai"
    }
  },
  testnet: false
});
const optopiaTestnet = /* @__PURE__ */ defineChain({
  id: 62049,
  name: "Optopia Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.optopia.ai"] }
  },
  blockExplorers: {
    default: {
      name: "Optopia Explorer",
      url: "https://scan-testnet.optopia.ai"
    }
  },
  testnet: true
});
const orderly = /* @__PURE__ */ defineChain({
  id: 291,
  name: "Orderly",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.orderly.network"] }
  },
  blockExplorers: {
    default: {
      name: "Orderly Explorer",
      url: "https://explorer.orderly.network"
    }
  },
  testnet: false
});
const orderlySepolia = /* @__PURE__ */ defineChain({
  id: 4460,
  name: "Orderly Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://l2-orderly-l2-4460-sepolia-8tc3sd7dvy.t.conduit.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Orderly Explorer",
      url: "https://explorerl2new-orderly-l2-4460-sepolia-8tc3sd7dvy.t.conduit.xyz"
    }
  },
  testnet: true
});
const otimDevnet = /* @__PURE__ */ defineChain({
  id: 41144114,
  name: "Otim Devnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["http://devnet.otim.xyz"]
    }
  },
  contracts: {
    batchInvoker: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    }
  },
  testnet: true
});
const palm = /* @__PURE__ */ defineChain({
  id: 11297108109,
  name: "Palm",
  nativeCurrency: {
    decimals: 18,
    name: "PALM",
    symbol: "PALM"
  },
  rpcUrls: {
    default: {
      http: ["https://palm-mainnet.public.blastapi.io"],
      webSocket: ["wss://palm-mainnet.public.blastapi.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Chainlens",
      url: "https://palm.chainlens.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 15429248
    }
  }
});
const palmTestnet = /* @__PURE__ */ defineChain({
  id: 11297108099,
  name: "Palm Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "PALM",
    symbol: "PALM"
  },
  rpcUrls: {
    default: {
      http: ["https://palm-mainnet.public.blastapi.io"],
      webSocket: ["wss://palm-mainnet.public.blastapi.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Chainlens",
      url: "https://palm.chainlens.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 15429248
    }
  },
  testnet: true
});
const paseoPassetHub = /* @__PURE__ */ defineChain({
  id: 420420422,
  name: "Paseo PassetHub",
  nativeCurrency: {
    name: "PAS",
    symbol: "PAS",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-passet-hub.parity-testnet.parity.io"
    }
  },
  testnet: true
});
const peaq = /* @__PURE__ */ defineChain({
  id: 3338,
  name: "Peaq",
  nativeCurrency: {
    decimals: 18,
    name: "peaq",
    symbol: "PEAQ"
  },
  rpcUrls: {
    default: {
      http: [
        "https://quicknode1.peaq.xyz",
        "https://quicknode2.peaq.xyz",
        "https://quicknode3.peaq.xyz"
      ],
      webSocket: [
        "wss://quicknode1.peaq.xyz",
        "wss://quicknode2.peaq.xyz",
        "wss://quicknode3.peaq.xyz"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://peaq.subscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 3566354
    }
  }
});
const sourceId$r = 1;
const pgn = /* @__PURE__ */ defineChain({
  id: 424,
  network: "pgn",
  name: "PGN",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.publicgoods.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "PGN Explorer",
      url: "https://explorer.publicgoods.network",
      apiUrl: "https://explorer.publicgoods.network/api"
    }
  },
  contracts: {
    l2OutputOracle: {
      [sourceId$r]: {
        address: "0x9E6204F750cD866b299594e2aC9eA824E2e5f95c"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3380209
    },
    portal: {
      [sourceId$r]: {
        address: "0xb26Fd985c5959bBB382BAFdD0b879E149e48116c"
      }
    },
    l1StandardBridge: {
      [sourceId$r]: {
        address: "0xD0204B9527C1bA7bD765Fa5CCD9355d38338272b"
      }
    }
  },
  formatters: formatters$1,
  sourceId: sourceId$r
});
const sourceId$q = 11155111;
const pgnTestnet = /* @__PURE__ */ defineChain({
  id: 58008,
  network: "pgn-testnet",
  name: "PGN",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.publicgoods.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "PGN Testnet Explorer",
      url: "https://explorer.sepolia.publicgoods.network",
      apiUrl: "https://explorer.sepolia.publicgoods.network/api"
    }
  },
  contracts: {
    l2OutputOracle: {
      [sourceId$q]: {
        address: "0xD5bAc3152ffC25318F848B3DD5dA6C85171BaEEe"
      }
    },
    portal: {
      [sourceId$q]: {
        address: "0xF04BdD5353Bb0EFF6CA60CfcC78594278eBfE179"
      }
    },
    l1StandardBridge: {
      [sourceId$q]: {
        address: "0xFaE6abCAF30D23e233AC7faF747F2fC3a5a6Bfa3"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3754925
    }
  },
  formatters: formatters$1,
  sourceId: sourceId$q,
  testnet: true
});
const phoenix = /* @__PURE__ */ defineChain({
  id: 13381,
  name: "Phoenix Blockchain",
  nativeCurrency: { name: "Phoenix", symbol: "PHX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.phoenixplorer.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Phoenixplorer",
      url: "https://phoenixplorer.com",
      apiUrl: "https://phoenixplorer.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x498cF757a575cFF2c2Ed9f532f56Efa797f86442",
      blockCreated: 5620192
    }
  }
});
const planq = /* @__PURE__ */ defineChain({
  id: 7070,
  name: "Planq Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "PLQ",
    symbol: "PLQ"
  },
  rpcUrls: {
    default: {
      http: [
        "https://planq-rpc.nodies.app",
        "https://evm-rpc.planq.network",
        "https://jsonrpc.planq.nodestake.top"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Planq Explorer",
      url: "https://evm.planq.network"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 8470015
    }
  },
  testnet: false
});
const plasma = /* @__PURE__ */ defineChain({
  id: 9745,
  name: "Plasma",
  blockTime: 1e3,
  nativeCurrency: {
    name: "Plasma",
    symbol: "XPL",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.plasma.to"]
    }
  },
  blockExplorers: {
    default: {
      name: "PlasmaScan",
      url: "https://plasmascan.to"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  }
});
const plasmaDevnet = /* @__PURE__ */ defineChain({
  id: 9747,
  name: "Plasma Devnet",
  nativeCurrency: {
    name: "Devnet Plasma",
    symbol: "XPL",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://devnet-rpc.plasma.to"]
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  }
});
const plasmaTestnet = /* @__PURE__ */ defineChain({
  id: 9746,
  name: "Plasma Testnet",
  nativeCurrency: {
    name: "Testnet Plasma",
    symbol: "XPL",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.plasma.to"]
    }
  },
  blockExplorers: {
    default: {
      name: "RouteScan",
      url: "https://testnet.plasmascan.to"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  },
  testnet: true
});
const playfiAlbireo = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 1612127,
  name: "PlayFi Albireo Testnet",
  network: "albireo",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://albireo-rpc.playfi.ai"],
      webSocket: ["wss://albireo-rpc-ws.playfi.ai/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "PlayFi Albireo Explorer",
      url: "https://albireo-explorer.playfi.ai"
    }
  },
  contracts: {
    multicall3: {
      address: "0xF9cda624FBC7e059355ce98a31693d299FACd963"
    }
  },
  testnet: true
});
const plinga = /* @__PURE__ */ defineChain({
  id: 242,
  name: "Plinga",
  nativeCurrency: { name: "Plinga", symbol: "PLINGA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpcurl.mainnet.plgchain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Plgscan",
      url: "https://www.plgscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0x0989576160f2e7092908BB9479631b901060b6e4",
      blockCreated: 204489
    }
  }
});
const sourceId$p = 1;
const plume = /* @__PURE__ */ defineChain({
  id: 98865,
  name: "Plume (Legacy)",
  nativeCurrency: {
    name: "Plume Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.plumenetwork.xyz"],
      webSocket: ["wss://rpc.plumenetwork.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.plumenetwork.xyz",
      apiUrl: "https://explorer.plumenetwork.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 48577
    }
  },
  sourceId: sourceId$p
});
const sourceId$o = 11155111;
const plumeDevnet = /* @__PURE__ */ defineChain({
  id: 98864,
  name: "Plume Devnet (Legacy)",
  nativeCurrency: {
    name: "Plume Sepolia Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://test-rpc.plumenetwork.xyz"],
      webSocket: ["wss://test-rpc.plumenetwork.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://test-explorer.plumenetwork.xyz",
      apiUrl: "https://test-explorer.plumenetwork.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 481948
    }
  },
  testnet: true,
  sourceId: sourceId$o
});
const sourceId$n = 1;
const plumeMainnet = /* @__PURE__ */ defineChain({
  id: 98866,
  name: "Plume",
  nativeCurrency: {
    name: "Plume",
    symbol: "PLUME",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.plume.org"],
      webSocket: ["wss://rpc.plume.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.plume.org",
      apiUrl: "https://explorer.plume.org/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 39679
    }
  },
  sourceId: sourceId$n
});
const sourceId$m = 11155111;
const plumeSepolia = /* @__PURE__ */ defineChain({
  id: 98867,
  name: "Plume Testnet",
  nativeCurrency: {
    name: "Plume",
    symbol: "PLUME",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.plume.org"],
      webSocket: ["wss://testnet-rpc.plume.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://testnet-explorer.plume.org",
      apiUrl: "https://testnet-explorer.plume.org/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 199712
    }
  },
  testnet: true,
  sourceId: sourceId$m
});
const sourceId$l = 11155111;
const plumeTestnet = /* @__PURE__ */ defineChain({
  id: 161221135,
  name: "Plume Testnet (Legacy)",
  nativeCurrency: {
    name: "Plume Sepolia Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.plumenetwork.xyz/http"],
      webSocket: ["wss://testnet-rpc.plumenetwork.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://testnet-explorer.plumenetwork.xyz",
      apiUrl: "https://testnet-explorer.plumenetwork.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 6022332
    }
  },
  testnet: true,
  sourceId: sourceId$l
});
const polterTestnet = /* @__PURE__ */ defineChain({
  id: 631571,
  name: "Polter Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Polter GHST",
    symbol: "GHST"
  },
  rpcUrls: {
    default: {
      http: ["https://geist-polter.g.alchemy.com/public"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://polter-testnet.explorer.alchemy.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 11245
    }
  },
  testnet: true
});
const polygon = /* @__PURE__ */ defineChain({
  id: 137,
  name: "Polygon",
  blockTime: 2e3,
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://polygon.drpc.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://polygonscan.com",
      apiUrl: "https://api.etherscan.io/v2/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 25770160
    }
  }
});
const polygonAmoy = /* @__PURE__ */ defineChain({
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-amoy.polygon.technology"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://amoy.polygonscan.com",
      apiUrl: "https://api.etherscan.io/v2/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 3127388
    }
  },
  testnet: true
});
const polygonMumbai = /* @__PURE__ */ defineChain({
  id: 80001,
  name: "Polygon Mumbai",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://80001.rpc.thirdweb.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://mumbai.polygonscan.com",
      apiUrl: "https://api-testnet.polygonscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 25770160
    }
  },
  testnet: true
});
const polygonZkEvm = /* @__PURE__ */ defineChain({
  id: 1101,
  name: "Polygon zkEVM",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://zkevm-rpc.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://zkevm.polygonscan.com",
      apiUrl: "https://api-zkevm.polygonscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 57746
    }
  }
});
const polygonZkEvmCardona = /* @__PURE__ */ defineChain({
  id: 2442,
  name: "Polygon zkEVM Cardona",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.cardona.zkevm-rpc.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://cardona-zkevm.polygonscan.com",
      apiUrl: "https://cardona-zkevm.polygonscan.com/api"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 114091
    }
  }
});
const polygonZkEvmTestnet = /* @__PURE__ */ defineChain({
  id: 1442,
  name: "Polygon zkEVM Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.public.zkevm-test.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "PolygonScan",
      url: "https://testnet-zkevm.polygonscan.com",
      apiUrl: "https://testnet-zkevm.polygonscan.com/api"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 525686
    }
  }
});
const polynomial = /* @__PURE__ */ defineChain({
  id: 8008,
  name: "Polynomial",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.polynomial.fi"]
    }
  },
  blockExplorers: {
    default: {
      name: "Polynomial Scan",
      url: "https://polynomialscan.io"
    }
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    }
  }
});
const polynomialSepolia = /* @__PURE__ */ defineChain({
  id: 80008,
  name: "Polynomia Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.polynomial.fi"]
    }
  },
  blockExplorers: {
    default: {
      name: "Polynomial Scan",
      url: "https://sepolia.polynomialscan.io"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    }
  }
});
const potos = /* @__PURE__ */ defineChain({
  id: 60603,
  name: "POTOS Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "POTOS Token",
    symbol: "POT"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.potos.hk"]
    }
  },
  blockExplorers: {
    default: {
      name: "POTOS Mainnet explorer",
      url: "https://scan.potos.hk"
    }
  },
  testnet: false
});
const potosTestnet = /* @__PURE__ */ defineChain({
  id: 60600,
  name: "POTOS Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "POTOS Token",
    symbol: "POT"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.potos.hk"]
    }
  },
  blockExplorers: {
    default: {
      name: "POTOS Testnet explorer",
      url: "https://scan-testnet.potos.hk"
    }
  },
  testnet: true
});
const premiumBlockTestnet = /* @__PURE__ */ defineChain({
  id: 23023,
  name: "PremiumBlock Testnet",
  nativeCurrency: { name: "Premium Block", symbol: "PBLK", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.premiumblock.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "PremiumBlocks Explorer",
      url: "https://scan.premiumblock.org"
    }
  },
  testnet: true
});
const pulsechain = /* @__PURE__ */ defineChain({
  id: 369,
  name: "PulseChain",
  nativeCurrency: { name: "Pulse", symbol: "PLS", decimals: 18 },
  testnet: false,
  blockTime: 1e4,
  rpcUrls: {
    default: {
      http: ["https://rpc.pulsechain.com"],
      webSocket: ["wss://ws.pulsechain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "PulseScan",
      url: "https://ipfs.scan.pulsechain.com",
      apiUrl: "https://api.scan.pulsechain.com/api"
    }
  },
  contracts: {
    ensRegistry: {
      address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14353601
    }
  }
});
const pulsechainV4 = /* @__PURE__ */ defineChain({
  id: 943,
  name: "PulseChain V4",
  testnet: true,
  nativeCurrency: { name: "V4 Pulse", symbol: "v4PLS", decimals: 18 },
  blockTime: 1e4,
  rpcUrls: {
    default: {
      http: ["https://rpc.v4.testnet.pulsechain.com"],
      webSocket: ["wss://ws.v4.testnet.pulsechain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "PulseScan",
      url: "https://scan.v4.testnet.pulsechain.com",
      apiUrl: "https://scan.v4.testnet.pulsechain.com/api"
    }
  },
  contracts: {
    ensRegistry: {
      address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14353601
    }
  }
});
const pumpfiTestnet = /* @__PURE__ */ defineChain({
  id: 490092,
  name: "Pumpfi Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "PMPT",
    symbol: "PMPT"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc1testnet.pumpfi.me"]
    }
  },
  blockExplorers: {
    default: {
      name: "Pumpfi Testnet Scan",
      url: "https://testnetscan.pumpfi.me"
    }
  },
  testnet: true
});
const sourceId$k = 11155111;
const pyrope = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  name: "Pyrope Testnet",
  testnet: true,
  id: 695569,
  sourceId: sourceId$k,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.pyropechain.com"],
      webSocket: ["wss://rpc.pyropechain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://pyrope.blockscout.com"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l1StandardBridge: {
      [sourceId$k]: {
        address: "0xC24932c31D9621aE9e792576152B7ef010cFC2F8"
      }
    }
  }
});
const ql1 = /* @__PURE__ */ defineChain({
  id: 766,
  name: "QL1",
  nativeCurrency: {
    decimals: 18,
    name: "QOM",
    symbol: "QOM"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.qom.one"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ql1 Explorer",
      url: "https://scan.qom.one"
    }
  },
  contracts: {
    multicall3: {
      address: "0x7A52370716ea730585884F5BDB0f6E60C39b8C64"
    }
  },
  testnet: false
});
const qMainnet = /* @__PURE__ */ defineChain({
  id: 35441,
  name: "Q Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Q",
    symbol: "Q"
  },
  rpcUrls: {
    default: { http: ["https://rpc.q.org"] }
  },
  blockExplorers: {
    default: {
      name: "Q Mainnet Explorer",
      url: "https://explorer.q.org",
      apiUrl: "https://explorer.q.org/api"
    }
  }
});
const qTestnet = /* @__PURE__ */ defineChain({
  id: 35443,
  name: "Q Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Q",
    symbol: "Q"
  },
  rpcUrls: {
    default: { http: ["https://rpc.qtestnet.org"] }
  },
  blockExplorers: {
    default: {
      name: "Q Testnet Explorer",
      url: "https://explorer.qtestnet.org",
      apiUrl: "https://explorer.qtestnet.org/api"
    }
  },
  testnet: true
});
const quai = /* @__PURE__ */ defineChain({
  id: 9,
  name: "Quai Network Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Quai",
    symbol: "QUAI"
  },
  rpcUrls: {
    default: { http: ["https://rpc.quai.network/cyprus1"] }
  },
  blockExplorers: {
    default: {
      name: "Quaiscan",
      url: "https://quaiscan.io",
      apiUrl: "https://quaiscan.io/api"
    }
  },
  testnet: false
});
const quaiTestnet = /* @__PURE__ */ defineChain({
  id: 15e3,
  name: "Quai Network Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Quai",
    symbol: "QUAI"
  },
  rpcUrls: {
    default: { http: ["https://orchard.rpc.quai.network/cyprus1"] }
  },
  blockExplorers: {
    default: {
      name: "Orchard Quaiscan",
      url: "https://orchard.quaiscan.io",
      apiUrl: "https://orchard.quaiscan.io/api"
    }
  },
  testnet: true
});
const radius = /* @__PURE__ */ defineChain({
  id: 723487,
  name: "Radius Network",
  nativeCurrency: { name: "Radius USD", symbol: "RUSD", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.radiustech.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Radius Network Explorer",
      url: "https://network.radiustech.xyz"
    }
  },
  testnet: false
});
const radiusTestnet = /* @__PURE__ */ defineChain({
  id: 72344,
  name: "Radius Test Network",
  nativeCurrency: { name: "Radius USD", symbol: "RUSD", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.radiustech.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Radius Test Network Explorer",
      url: "https://testnet.radiustech.xyz"
    }
  },
  testnet: true
});
const reactiveTestnet = /* @__PURE__ */ defineChain({
  id: 5318007,
  name: "Reactive Lasna Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Lasna React",
    symbol: "lREACT"
  },
  rpcUrls: {
    default: { http: ["https://lasna-rpc.rnk.dev"] }
  },
  blockExplorers: {
    default: {
      name: "Reactscan",
      url: "https://lasna.reactscan.net"
    }
  },
  testnet: true
});
const real = /* @__PURE__ */ defineChain({
  id: 111188,
  name: "re.al",
  nativeCurrency: {
    name: "reETH",
    decimals: 18,
    symbol: "reETH"
  },
  rpcUrls: {
    default: { http: ["https://rpc.realforreal.gelato.digital"] }
  },
  blockExplorers: {
    default: {
      name: "re.al Explorer",
      url: "https://explorer.re.al",
      apiUrl: "https://explorer.re.al/api/v2"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 695
    }
  }
});
const redbellyMainnet = /* @__PURE__ */ defineChain({
  id: 151,
  name: "Redbelly Network Mainnet",
  nativeCurrency: {
    name: "Redbelly Native Coin",
    symbol: "RBNT",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://governors.mainnet.redbelly.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Routescan",
      url: "https://redbelly.routescan.io",
      apiUrl: "https://api.routescan.io/v2/network/mainnet/evm/151/etherscan/api"
    }
  },
  testnet: false
});
const redbellyTestnet = /* @__PURE__ */ defineChain({
  id: 153,
  name: "Redbelly Network Testnet",
  nativeCurrency: {
    name: "Redbelly Native Coin",
    symbol: "RBNT",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://governors.testnet.redbelly.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Routescan",
      url: "https://redbelly.testnet.routescan.io",
      apiUrl: "https://api.routescan.io/v2/network/testnet/evm/153_2/etherscan/api"
    }
  },
  testnet: true
});
const reddio = /* @__PURE__ */ defineChain({
  id: 50342,
  name: "Reddio",
  nativeCurrency: { name: "Reddio", symbol: "RED", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.reddio.com/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://reddio.cloud.blockscout.com",
      apiUrl: "https://reddio.cloud.blockscout.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 848849
    }
  },
  testnet: false
});
const reddioSepolia = /* @__PURE__ */ defineChain({
  id: 50341,
  name: "Reddio Sepolia",
  nativeCurrency: { name: "Reddio", symbol: "RED", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://reddio-dev.reddio.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Reddioscan",
      url: "https://reddio-devnet.l2scan.co",
      apiUrl: "https://reddio-devnet.l2scan.co/api"
    }
  },
  testnet: true
});
const sourceId$j = 1;
const redstone = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  name: "Redstone",
  id: 690,
  sourceId: sourceId$j,
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://rpc.redstonechain.com"],
      webSocket: ["wss://rpc.redstonechain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.redstone.xyz"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    },
    portal: {
      [sourceId$j]: {
        address: "0xC7bCb0e8839a28A1cFadd1CF716de9016CdA51ae",
        blockCreated: 19578329
      }
    },
    l2OutputOracle: {
      [sourceId$j]: {
        address: "0xa426A052f657AEEefc298b3B5c35a470e4739d69",
        blockCreated: 19578337
      }
    },
    l1StandardBridge: {
      [sourceId$j]: {
        address: "0xc473ca7E02af24c129c2eEf51F2aDf0411c1Df69",
        blockCreated: 19578331
      }
    }
  }
});
const rei = /* @__PURE__ */ defineChain({
  id: 47805,
  name: "REI Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "REI",
    symbol: "REI"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.rei.network"],
      webSocket: ["wss://rpc.rei.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "REI Scan",
      url: "https://scan.rei.network"
    }
  },
  testnet: false
});
const reyaNetwork = /* @__PURE__ */ defineChain({
  id: 1729,
  name: "Reya Network",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://rpc.reya.network"],
      webSocket: ["wss://ws.reya.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Reya Network Explorer",
      url: "https://explorer.reya.network"
    }
  },
  testnet: false
});
const rise = /* @__PURE__ */ defineChain({
  id: 4153,
  name: "RISE",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.risechain.com"],
      webSocket: ["wss://rpc.risechain.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.risechain.com",
      apiUrl: "https://explorer.risechain.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    }
  }
});
const riseTestnet = /* @__PURE__ */ defineChain({
  id: 11155931,
  name: "RISE Testnet",
  nativeCurrency: { name: "RISE Testnet Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.riselabs.xyz"],
      webSocket: ["wss://testnet.riselabs.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.testnet.riselabs.xyz/",
      apiUrl: "https://explorer.testnet.riselabs.xyz/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    }
  },
  testnet: true
});
const rivalz = /* @__PURE__ */ defineChain({
  id: 753,
  name: "Rivalz",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://rivalz.calderachain.xyz/http"]
    }
  },
  blockExplorers: {
    default: {
      name: "Rivalz Caldera Explorer",
      url: "https://rivalz.calderaexplorer.xyz"
    }
  },
  testnet: false
});
const rollux = /* @__PURE__ */ defineChain({
  id: 570,
  name: "Rollux Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Syscoin",
    symbol: "SYS"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.rollux.com"],
      webSocket: ["wss://rpc.rollux.com/wss"]
    }
  },
  blockExplorers: {
    default: {
      name: "RolluxExplorer",
      url: "https://explorer.rollux.com",
      apiUrl: "https://explorer.rollux.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 119222
    }
  }
});
const rolluxTestnet = /* @__PURE__ */ defineChain({
  id: 57e3,
  name: "Rollux Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Syscoin",
    symbol: "SYS"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-tanenbaum.rollux.com/"],
      webSocket: ["wss://rpc-tanenbaum.rollux.com/wss"]
    }
  },
  blockExplorers: {
    default: {
      name: "RolluxTestnetExplorer",
      url: "https://rollux.tanenbaum.io",
      apiUrl: "https://rollux.tanenbaum.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1813675
    }
  },
  testnet: true
});
const ronin = /* @__PURE__ */ defineChain({
  id: 2020,
  name: "Ronin",
  nativeCurrency: { name: "RON", symbol: "RON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.roninchain.com/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ronin Explorer",
      url: "https://app.roninchain.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 26023535
    }
  }
});
const root = /* @__PURE__ */ defineChain({
  id: 7668,
  name: "The Root Network",
  nativeCurrency: {
    decimals: 18,
    name: "XRP",
    symbol: "XRP"
  },
  rpcUrls: {
    default: {
      http: ["https://root.rootnet.live/archive"],
      webSocket: ["wss://root.rootnet.live/archive/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Rootscan",
      url: "https://rootscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xc9C2E2429AeC354916c476B30d729deDdC94988d",
      blockCreated: 9218338
    }
  }
});
const rootPorcini = /* @__PURE__ */ defineChain({
  id: 7672,
  name: "The Root Network - Porcini",
  nativeCurrency: {
    decimals: 18,
    name: "XRP",
    symbol: "XRP"
  },
  rpcUrls: {
    default: {
      http: ["https://porcini.rootnet.app/archive"],
      webSocket: ["wss://porcini.rootnet.app/archive/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Rootscan",
      url: "https://porcini.rootscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xc9C2E2429AeC354916c476B30d729deDdC94988d",
      blockCreated: 10555692
    }
  },
  testnet: true
});
const rootstock = /* @__PURE__ */ defineChain({
  id: 30,
  name: "Rootstock Mainnet",
  network: "rootstock",
  nativeCurrency: {
    decimals: 18,
    name: "Rootstock Bitcoin",
    symbol: "RBTC"
  },
  rpcUrls: {
    default: { http: ["https://public-node.rsk.co"] }
  },
  blockExplorers: {
    default: {
      name: "RSK Explorer",
      url: "https://explorer.rsk.co"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 4249540
    }
  }
});
const rootstockTestnet = /* @__PURE__ */ defineChain({
  id: 31,
  name: "Rootstock Testnet",
  network: "rootstock",
  nativeCurrency: {
    decimals: 18,
    name: "Rootstock Bitcoin",
    symbol: "tRBTC"
  },
  rpcUrls: {
    default: { http: ["https://public-node.testnet.rsk.co"] }
  },
  blockExplorers: {
    default: {
      name: "RSK Explorer",
      url: "https://explorer.testnet.rootstock.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2771150
    }
  },
  testnet: true
});
const sourceId$i = 1;
const rss3 = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 12553,
  name: "RSS3 VSL Mainnet",
  nativeCurrency: { name: "RSS3", symbol: "RSS3", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.rss3.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "RSS3 VSL Mainnet Scan",
      url: "https://scan.rss3.io",
      apiUrl: "https://scan.rss3.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$i]: {
        address: "0xE6f24d2C32B3109B18ed33cF08eFb490b1e09C10"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14193
    },
    portal: {
      [sourceId$i]: {
        address: "0x6A12432491bbbE8d3babf75F759766774C778Db4",
        blockCreated: 19387057
      }
    },
    l1StandardBridge: {
      [sourceId$i]: {
        address: "0x4cbab69108Aa72151EDa5A3c164eA86845f18438"
      }
    }
  },
  sourceId: sourceId$i
});
const sourceId$h = 11155111;
const rss3Sepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 2331,
  name: "RSS3 VSL Sepolia Testnet",
  nativeCurrency: { name: "RSS3", symbol: "RSS3", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.rss3.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "RSS3 VSL Sepolia Testnet Scan",
      url: "https://scan.testnet.rss3.io",
      apiUrl: "https://scan.testnet.rss3.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$h]: {
        address: "0xDb5c46C3Eaa6Ed6aE8b2379785DF7dd029C0dC81"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 55697
    },
    portal: {
      [sourceId$h]: {
        address: "0xcBD77E8E1E7F06B25baDe67142cdE82652Da7b57",
        blockCreated: 5345035
      }
    },
    l1StandardBridge: {
      [sourceId$h]: {
        address: "0xdDD29bb63B0839FB1cE0eE439Ff027738595D07B"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$h
});
const saakuru = /* @__PURE__ */ defineChain({
  id: 7225878,
  name: "Saakuru Mainnet",
  nativeCurrency: { name: "OAS", symbol: "OAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.saakuru.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Saakuru Explorer",
      url: "https://explorer.saakuru.network"
    }
  },
  testnet: false
});
const saga = /* @__PURE__ */ defineChain({
  id: 5464,
  name: "Saga",
  network: "saga",
  nativeCurrency: {
    decimals: 18,
    name: "gas",
    symbol: "GAS"
  },
  rpcUrls: {
    default: { http: ["https://sagaevm.jsonrpc.sagarpc.io"] }
  },
  blockExplorers: {
    default: {
      name: "Saga Explorer",
      url: "https://sagaevm.sagaexplorer.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0x864DDc9B50B9A0dF676d826c9B9EDe9F8913a160",
      blockCreated: 467530
    }
  }
});
const saigon = /* @__PURE__ */ defineChain({
  id: 202601,
  name: "Ronin Saigon Testnet",
  nativeCurrency: { name: "RON", symbol: "RON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://saigon-testnet.roninchain.com/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Saigon Explorer",
      url: "https://saigon-explorer.roninchain.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 18736871
    }
  },
  testnet: true
});
const sanko = /* @__PURE__ */ defineChain({
  id: 1996,
  name: "Sanko",
  nativeCurrency: { name: "DMT", symbol: "DMT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.sanko.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Sanko Explorer",
      url: "https://explorer.sanko.xyz"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 37
    }
  },
  testnet: false
});
const sapphire = /* @__PURE__ */ defineChain({
  id: 23294,
  name: "Oasis Sapphire",
  network: "sapphire",
  nativeCurrency: { name: "Sapphire Rose", symbol: "ROSE", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sapphire.oasis.io"],
      webSocket: ["wss://sapphire.oasis.io/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Oasis Explorer",
      url: "https://explorer.oasis.io/mainnet/sapphire"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 734531
    }
  }
});
const sapphireTestnet = /* @__PURE__ */ defineChain({
  id: 23295,
  name: "Oasis Sapphire Testnet",
  network: "sapphire-testnet",
  nativeCurrency: { name: "Sapphire Test Rose", symbol: "TEST", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.sapphire.oasis.dev"],
      webSocket: ["wss://testnet.sapphire.oasis.dev/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Oasis Explorer",
      url: "https://explorer.oasis.io/testnet/sapphire"
    }
  },
  testnet: true
});
const satoshiVM = /* @__PURE__ */ defineChain({
  id: 3109,
  name: "SatoshiVM Alpha Mainnet",
  nativeCurrency: {
    name: "BTC",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://alpha-rpc-node-http.svmscan.io"] }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://svmscan.io",
      apiUrl: "https://svmscan.io/api"
    }
  }
});
const satoshiVMTestnet = /* @__PURE__ */ defineChain({
  id: 3110,
  name: "SatoshiVM Testnet",
  nativeCurrency: {
    name: "BTC",
    symbol: "BTC",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://test-rpc-node-http.svmscan.io"] }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://testnet.svmscan.io",
      apiUrl: "https://testnet.svmscan.io/api"
    }
  },
  testnet: true
});
const scroll = /* @__PURE__ */ defineChain({
  id: 534352,
  name: "Scroll",
  blockTime: 3e3,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.scroll.io"],
      webSocket: ["wss://wss-rpc.scroll.io/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Scrollscan",
      url: "https://scrollscan.com",
      apiUrl: "https://api.scrollscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14
    }
  },
  testnet: false
});
const scrollSepolia = /* @__PURE__ */ defineChain({
  id: 534351,
  name: "Scroll Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.scroll.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Scrollscan",
      url: "https://sepolia.scrollscan.com",
      apiUrl: "https://api-sepolia.scrollscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 9473
    }
  },
  testnet: true
});
const sei = /* @__PURE__ */ defineChain({
  id: 1329,
  name: "Sei Network",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc.sei-apis.com/"],
      webSocket: ["wss://evm-ws.sei-apis.com/"]
    }
  },
  blockExplorers: {
    default: {
      name: "Seiscan",
      url: "https://seiscan.io",
      apiUrl: "https://api.etherscan.io/v2/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    }
  }
});
const seismicDevnet = /* @__PURE__ */ defineChain({
  id: 5124,
  name: "Seismic Devnet",
  nativeCurrency: { name: "Seismic Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://node-2.seismicdev.net/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Seismic Devnet Explorer",
      url: "https://explorer-2.seismicdev.net"
    }
  },
  testnet: true
});
const seiTestnet = /* @__PURE__ */ defineChain({
  id: 1328,
  name: "Sei Testnet",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc-testnet.sei-apis.com"],
      webSocket: ["wss://evm-ws-testnet.sei-apis.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Seiscan",
      url: "https://testnet.seiscan.io",
      apiUrl: "https://api.etherscan.io/v2/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 98697651
    }
  },
  testnet: true
});
const sentrix = /* @__PURE__ */ defineChain({
  id: 7119,
  name: "Sentrix Chain",
  nativeCurrency: { name: "Sentrix", symbol: "SRX", decimals: 18 },
  blockTime: 1e3,
  rpcUrls: {
    default: {
      http: ["https://rpc.sentrixchain.com"],
      webSocket: ["wss://rpc.sentrixchain.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "SentrixScan",
      url: "https://scan.sentrixchain.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xFd4b34b5763f54a580a0d9f7997A2A993ef9ceE9",
      blockCreated: 717078
    }
  }
});
const sentrixTestnet = /* @__PURE__ */ defineChain({
  id: 7120,
  name: "Sentrix Testnet",
  nativeCurrency: { name: "Sentrix", symbol: "SRX", decimals: 18 },
  blockTime: 1e3,
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.sentrixchain.com"],
      webSocket: ["wss://testnet-rpc.sentrixchain.com/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "SentrixScan Testnet",
      url: "https://scan-testnet.sentrixchain.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0x7900826De548425c6BE56caEbD4760AB0155Cd54",
      blockCreated: 723191
    }
  },
  testnet: true
});
const sepolia = /* @__PURE__ */ defineChain({
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://11155111.rpc.thirdweb.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
      apiUrl: "https://api-sepolia.etherscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 751532
    },
    ensUniversalResolver: {
      address: "0xeeeeeeee14d718c2b47d9923deab1335e144eeee",
      blockCreated: 8928790
    }
  },
  testnet: true
});
const sourceId$g = 1;
const shape = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 360,
  name: "Shape",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.shape.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "shapescan",
      url: "https://shapescan.xyz",
      apiUrl: "https://shapescan.xyz/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$g]: {
        address: "0x6Ef8c69CfE4635d866e3E02732068022c06e724D",
        blockCreated: 20369940
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1
    },
    portal: {
      [sourceId$g]: {
        address: "0xEB06fFa16011B5628BaB98E29776361c83741dd3",
        blockCreated: 20369933
      }
    },
    l1StandardBridge: {
      [sourceId$g]: {
        address: "0x62Edd5f4930Ea92dCa3fB81689bDD9b9d076b57B",
        blockCreated: 20369935
      }
    }
  },
  sourceId: sourceId$g
});
const sourceId$f = 11155111;
const shapeSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 11011,
  name: "Shape Sepolia Testnet",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.shape.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer-sepolia.shape.network/",
      apiUrl: "https://explorer-sepolia.shape.network/api/v2"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1
    }
  },
  testnet: true,
  sourceId: sourceId$f
});
const shardeum = /* @__PURE__ */ defineChain({
  id: 8118,
  name: "Shardeum",
  nativeCurrency: { name: "Shardeum", symbol: "SHM", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.shardeum.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Shardeum Explorer",
      url: "https://explorer.shardeum.org"
    }
  },
  testnet: false
});
const shardeumSphinx = /* @__PURE__ */ defineChain({
  id: 8082,
  name: "Shardeum Sphinx",
  nativeCurrency: { name: "SHARDEUM", symbol: "SHM", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sphinx.shardeum.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Shardeum Explorer",
      url: "https://explorer-sphinx.shardeum.org"
    }
  },
  testnet: true
});
const shibarium = /* @__PURE__ */ defineChain({
  id: 109,
  name: "Shibarium",
  network: "shibarium",
  nativeCurrency: { name: "Bone", symbol: "BONE", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.shibrpc.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://shibariumscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0x864Bf681ADD6052395188A89101A1B37d3B4C961",
      blockCreated: 265900
    }
  }
});
const shibariumTestnet = /* @__PURE__ */ defineChain({
  id: 157,
  name: "Puppynet Shibarium",
  nativeCurrency: {
    decimals: 18,
    name: "Bone",
    symbol: "BONE"
  },
  rpcUrls: {
    default: { http: ["https://puppynet.shibrpc.com"] }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://puppyscan.shib.io",
      apiUrl: "https://puppyscan.shib.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xA4029b74FBA366c926eDFA7Dd10B21C621170a4c",
      blockCreated: 3035769
    }
  },
  testnet: true
});
const shiden = /* @__PURE__ */ defineChain({
  id: 336,
  name: "Shiden",
  nativeCurrency: {
    decimals: 18,
    name: "SDN",
    symbol: "SDN"
  },
  rpcUrls: {
    default: {
      http: ["https://shiden.public.blastapi.io"],
      webSocket: ["wss://shiden-rpc.dwellir.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Shiden Scan",
      url: "https://shiden.subscan.io"
    }
  },
  testnet: false
});
const shimmer = /* @__PURE__ */ defineChain({
  id: 148,
  name: "Shimmer",
  network: "shimmer",
  nativeCurrency: {
    decimals: 18,
    name: "Shimmer",
    symbol: "SMR"
  },
  rpcUrls: {
    default: {
      http: ["https://json-rpc.evm.shimmer.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Shimmer Network Explorer",
      url: "https://explorer.evm.shimmer.network",
      apiUrl: "https://explorer.evm.shimmer.network/api"
    }
  }
});
const shimmerTestnet = /* @__PURE__ */ defineChain({
  id: 1073,
  name: "Shimmer Testnet",
  network: "shimmer-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Shimmer",
    symbol: "SMR"
  },
  rpcUrls: {
    default: {
      http: ["https://json-rpc.evm.testnet.shimmer.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Shimmer Network Explorer",
      url: "https://explorer.evm.testnet.shimmer.network",
      apiUrl: "https://explorer.evm.testnet.shimmer.network/api"
    }
  },
  testnet: true
});
const sidraChain = /* @__PURE__ */ defineChain({
  id: 97453,
  name: "Sidra Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Sidra Digital Asset",
    symbol: "SDA"
  },
  rpcUrls: {
    default: {
      http: ["https://node.sidrachain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Sidra Chain Explorer",
      url: "https://ledger.sidrachain.com"
    }
  }
});
const silentData = /* @__PURE__ */ defineChain({
  id: 380929,
  name: "Silent Data Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.silentdata.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Silent Data Mainnet Explorer",
      url: "https://explorer-mainnet.rollup.silentdata.com"
    }
  },
  testnet: false
});
const silicon = /* @__PURE__ */ defineChain({
  id: 2355,
  name: "Silicon zkEVM",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc.silicon.network",
        "https://silicon-mainnet.nodeinfra.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "SiliconScope",
      url: "https://scope.silicon.network"
    }
  }
});
const siliconSepolia = /* @__PURE__ */ defineChain({
  id: 1722641160,
  name: "Silicon Sepolia zkEVM",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-sepolia.silicon.network",
        "https://silicon-testnet.nodeinfra.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "SiliconSepoliaScope",
      url: "https://scope-sepolia.silicon.network"
    }
  },
  testnet: true
});
const sixProtocol = /* @__PURE__ */ defineChain({
  id: 98,
  name: "Six Protocol",
  nativeCurrency: {
    decimals: 18,
    name: "SIX",
    symbol: "SIX"
  },
  rpcUrls: {
    default: {
      http: ["https://sixnet-rpc-evm.sixprotocol.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Six Protocol Scan",
      url: "https://sixscan.io/sixnet"
    }
  },
  testnet: false
});
const skaleBlockBrawlers = /* @__PURE__ */ defineChain({
  id: 391845894,
  name: "SKALE | Block Brawlers",
  nativeCurrency: { name: "BRAWL", symbol: "BRAWL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/frayed-decent-antares"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/frayed-decent-antares"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://frayed-decent-antares.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {}
});
const skaleCalypso = /* @__PURE__ */ defineChain({
  id: 1564830818,
  name: "SKALE Calypso Hub",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"],
      webSocket: [
        "wss://mainnet.skalenodes.com/v1/ws/honorable-steel-rasalhague"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3107626
    }
  }
});
const skaleCalypsoTestnet = /* @__PURE__ */ defineChain({
  id: 974399131,
  name: "SKALE Calypso Testnet",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/giant-half-dual-testnet"],
      webSocket: ["wss://testnet.skalenodes.com/v1/ws/giant-half-dual-testnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://giant-half-dual-testnet.explorer.testnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 103220
    }
  },
  testnet: true
});
const skaleCryptoBlades = /* @__PURE__ */ defineChain({
  id: 1026062157,
  name: "SKALE | CryptoBlades",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/affectionate-immediate-pollux"],
      webSocket: [
        "wss://mainnet.skalenodes.com/v1/ws/affectionate-immediate-pollux"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://affectionate-immediate-pollux.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {}
});
const skaleCryptoColosseum = /* @__PURE__ */ defineChain({
  id: 1032942172,
  name: "SKALE | Crypto Colosseum",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/haunting-devoted-deneb"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/haunting-devoted-deneb"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://haunting-devoted-deneb.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {}
});
const skaleEuropa = /* @__PURE__ */ defineChain({
  id: 2046399126,
  name: "SKALE Europa Hub",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/elated-tan-skat"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/elated-tan-skat"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://elated-tan-skat.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 3113495
    }
  }
});
const skaleEuropaTestnet = /* @__PURE__ */ defineChain({
  id: 1444673419,
  name: "SKALE Europa Testnet",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/juicy-low-small-testnet"],
      webSocket: ["wss://testnet.skalenodes.com/v1/ws/juicy-low-small-testnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://juicy-low-small-testnet.explorer.testnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 110858
    }
  },
  testnet: true
});
const skaleExorde = /* @__PURE__ */ defineChain({
  id: 2139927552,
  name: "Exorde Network",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/light-vast-diphda"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/light-vast-diphda"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://light-vast-diphda.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {}
});
const skaleHumanProtocol = /* @__PURE__ */ defineChain({
  id: 1273227453,
  name: "SKALE | Human Protocol",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/wan-red-ain"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/wan-red-ain"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://wan-red-ain.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {}
});
const skaleNebula = /* @__PURE__ */ defineChain({
  id: 1482601649,
  name: "SKALE Nebula Hub",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/green-giddy-denebola"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/green-giddy-denebola"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://green-giddy-denebola.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2372986
    }
  }
});
const skaleNebulaTestnet = /* @__PURE__ */ defineChain({
  id: 37084624,
  name: "SKALE Nebula Testnet",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/lanky-ill-funny-testnet"],
      webSocket: ["wss://testnet.skalenodes.com/v1/ws/lanky-ill-funny-testnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 105141
    }
  },
  testnet: true
});
const skaleRazor = /* @__PURE__ */ defineChain({
  id: 278611351,
  name: "SKALE | Razor Network",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/turbulent-unique-scheat"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/turbulent-unique-scheat"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://turbulent-unique-scheat.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {}
});
const skaleBase = /* @__PURE__ */ defineChain({
  id: 1187947933,
  name: "SKALE Base",
  nativeCurrency: { name: "Credits", symbol: "CREDIT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://skale-base.skalenodes.com/v1/base"],
      webSocket: ["wss://skale-base.skalenodes.com/v1/ws/base"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://skale-base-explorer.skalenodes.com/"
    }
  },
  testnet: true
});
const skaleBaseSepoliaTestnet = /* @__PURE__ */ defineChain({
  id: 324705682,
  name: "SKALE Base Sepolia Testnet",
  nativeCurrency: { name: "Credits", symbol: "CREDIT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://base-sepolia-testnet.skalenodes.com/v1/base-testnet"],
      webSocket: [
        "wss://base-sepolia-testnet.skalenodes.com/v1/ws/base-testnet"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://base-sepolia-testnet-explorer.skalenodes.com/"
    }
  },
  testnet: true
});
const skaleTitan = /* @__PURE__ */ defineChain({
  id: 1350216234,
  name: "SKALE Titan Hub",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.skalenodes.com/v1/parallel-stormy-spica"],
      webSocket: ["wss://mainnet.skalenodes.com/v1/ws/parallel-stormy-spica"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://parallel-stormy-spica.explorer.mainnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2076458
    }
  }
});
const skaleTitanTestnet = /* @__PURE__ */ defineChain({
  id: 1020352220,
  name: "SKALE Titan Testnet",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/aware-fake-trim-testnet"],
      webSocket: ["wss://testnet.skalenodes.com/v1/ws/aware-fake-trim-testnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "SKALE Explorer",
      url: "https://aware-fake-trim-testnet.explorer.testnet.skalenodes.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 104072
    }
  },
  testnet: true
});
const sketchpad = /* @__PURE__ */ defineChain({
  id: 984123,
  name: "Forma Sketchpad",
  network: "sketchpad",
  nativeCurrency: {
    symbol: "TIA",
    name: "TIA",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sketchpad-1.forma.art"],
      webSocket: ["wss://ws.sketchpad-1.forma.art"]
    }
  },
  blockExplorers: {
    default: {
      name: "Sketchpad Explorer",
      url: "https://explorer.sketchpad-1.forma.art"
    }
  },
  testnet: true
});
const sourceId$e = 1;
const snax = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 2192,
  network: "snaxchain-mainnet",
  name: "SnaxChain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.snaxchain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Snax Explorer",
      url: "https://explorer.snaxchain.io",
      apiUrl: "https://explorer.snaxchain.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$e]: {
        address: "0x472562Fcf26D6b2793f8E0b0fB660ba0E5e08A46"
      }
    },
    l2OutputOracle: {
      [sourceId$e]: {
        address: "0x2172e492Fc807F5d5645D0E3543f139ECF539294"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    },
    portal: {
      [sourceId$e]: {
        address: "0x79f446D024d74D0Bb6E699C131c703463c5D65E9"
      }
    },
    l1StandardBridge: {
      [sourceId$e]: {
        address: "0x6534Bdb6b5c060d3e6aa833433333135eFE8E0aA"
      }
    }
  },
  sourceId: sourceId$e
});
const sourceId$d = 11155111;
const snaxTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 13001,
  network: "snaxchain-testnet",
  name: "SnaxChain Testnet",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.snaxchain.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Snax Explorer",
      url: "https://testnet-explorer.snaxchain.io",
      apiUrl: "https://testnet-explorer.snaxchain.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$d]: {
        address: "0x206a75d89d45F146C54020F132FF93bEDD09f55E"
      }
    },
    l2OutputOracle: {
      [sourceId$d]: {
        address: "0x60e3A368a4cdCEf85ffB964e372726F56A46221e"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11"
    },
    portal: {
      [sourceId$d]: {
        address: "0xb5afdd0E8dDF081Ef90e8A3e0c7b5798e66E954E"
      }
    },
    l1StandardBridge: {
      [sourceId$d]: {
        address: "0xbd37E1a59D4C00C9A46F75018dffd84061bC5f74"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$d
});
const somnia = /* @__PURE__ */ defineChain({
  id: 5031,
  name: "Somnia",
  nativeCurrency: { name: "Somnia", symbol: "SOMI", decimals: 18 },
  blockTime: 100,
  rpcUrls: {
    default: {
      http: ["https://api.infra.mainnet.somnia.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://explorer.somnia.network",
      apiUrl: "https://explorer.somnia.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11",
      blockCreated: 38516341
    }
  },
  testnet: false
});
const somniaTestnet = /* @__PURE__ */ defineChain({
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  blockTime: 100,
  rpcUrls: {
    default: {
      http: ["https://api.infra.testnet.somnia.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Somnia Testnet Explorer",
      url: "https://shannon-explorer.somnia.network",
      apiUrl: "https://shannon-explorer.somnia.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223",
      blockCreated: 71314235
    }
  },
  testnet: true
});
const sourceId$c = 1;
const soneium = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1868,
  name: "Soneium Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.soneium.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://soneium.blockscout.com",
      apiUrl: "https://soneium.blockscout.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$c]: {
        address: "0x512a3d2c7a43bd9261d2b8e8c9c70d4bd4d503c0"
      }
    },
    l2OutputOracle: {
      [sourceId$c]: {
        address: "0x0000000000000000000000000000000000000000"
      }
    },
    portal: {
      [sourceId$c]: {
        address: "0x88e529a6ccd302c948689cd5156c83d4614fae92",
        blockCreated: 7061266
      }
    },
    l1StandardBridge: {
      [sourceId$c]: {
        address: "0xeb9bf100225c214efc3e7c651ebbadcf85177607",
        blockCreated: 7061266
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1
    }
  },
  sourceId: sourceId$c
});
const sourceId$b = 11155111;
const soneiumMinato = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1946,
  name: "Soneium Minato Testnet",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.minato.soneium.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://soneium-minato.blockscout.com",
      apiUrl: "https://soneium-minato.blockscout.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$b]: {
        address: "0xB3Ad2c38E6e0640d7ce6aA952AB3A60E81bf7a01"
      }
    },
    l2OutputOracle: {
      [sourceId$b]: {
        address: "0x710e5286C746eC38beeB7538d0146f60D27be343"
      }
    },
    portal: {
      [sourceId$b]: {
        address: "0x65ea1489741A5D72fFdD8e6485B216bBdcC15Af3",
        blockCreated: 6466136
      }
    },
    l1StandardBridge: {
      [sourceId$b]: {
        address: "0x5f5a404A5edabcDD80DB05E8e54A78c9EBF000C2",
        blockCreated: 6466136
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1
    }
  },
  testnet: true,
  sourceId: sourceId$b
});
const songbird = /* @__PURE__ */ defineChain({
  id: 19,
  name: "Songbird Canary-Network",
  nativeCurrency: {
    decimals: 18,
    name: "Songbird",
    symbol: "SGB"
  },
  rpcUrls: {
    default: { http: ["https://songbird-api.flare.network/ext/C/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Songbird Explorer",
      url: "https://songbird-explorer.flare.network",
      apiUrl: "https://songbird-explorer.flare.network/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 13382504
    }
  }
});
const songbirdTestnet = /* @__PURE__ */ defineChain({
  id: 16,
  name: "Songbird Testnet Coston",
  nativeCurrency: {
    decimals: 18,
    name: "Coston Flare",
    symbol: "CFLR"
  },
  rpcUrls: {
    default: { http: ["https://coston-api.flare.network/ext/C/rpc"] }
  },
  blockExplorers: {
    default: {
      name: "Coston Explorer",
      url: "https://coston-explorer.flare.network",
      apiUrl: "https://coston-explorer.flare.network/api"
    }
  },
  testnet: true
});
const sonic = /* @__PURE__ */ defineChain({
  id: 146,
  name: "Sonic",
  blockTime: 630,
  nativeCurrency: {
    decimals: 18,
    name: "Sonic",
    symbol: "S"
  },
  rpcUrls: {
    default: { http: ["https://rpc.soniclabs.com"] }
  },
  blockExplorers: {
    default: {
      name: "Sonic Explorer",
      url: "https://sonicscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 60
    }
  },
  testnet: false
});
const sonicBlazeTestnet = /* @__PURE__ */ defineChain({
  id: 57054,
  name: "Sonic Blaze Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Sonic",
    symbol: "S"
  },
  rpcUrls: {
    default: { http: ["https://rpc.blaze.soniclabs.com"] }
  },
  blockExplorers: {
    default: {
      name: "Sonic Blaze Testnet Explorer",
      url: "https://testnet.sonicscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1100
    }
  },
  testnet: true
});
const sonicTestnet = /* @__PURE__ */ defineChain({
  id: 64165,
  name: "Sonic Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Sonic",
    symbol: "S"
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.soniclabs.com"] }
  },
  blockExplorers: {
    default: {
      name: "Sonic Testnet Explorer",
      url: "https://testnet.soniclabs.com/"
    }
  },
  testnet: true
});
const sophon = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  blockTime: 200,
  id: 50104,
  name: "Sophon",
  nativeCurrency: {
    decimals: 18,
    name: "Sophon",
    symbol: "SOPH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sophon.xyz"],
      webSocket: ["wss://rpc.sophon.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Sophon Block Explorer",
      url: "https://explorer.sophon.xyz"
    }
  },
  contracts: {
    multicall3: {
      address: "0x5f4867441d2416cA88B1b3fd38f21811680CD2C8",
      blockCreated: 116
    }
  },
  testnet: false
});
const sophonTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  blockTime: 200,
  id: 531050104,
  name: "Sophon Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Sophon",
    symbol: "SOPH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.sophon.xyz"],
      webSocket: ["wss://rpc.testnet.sophon.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Sophon Block Explorer",
      url: "https://explorer.testnet.sophon.xyz"
    }
  },
  contracts: {
    multicall3: {
      address: "0x83c04d112adedA2C6D9037bb6ecb42E7f0b108Af",
      blockCreated: 15642
    }
  },
  testnet: true
});
const sova = /* @__PURE__ */ defineChain({
  id: 100021,
  name: "Sova",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sova.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Sova Block Explorer",
      url: "https://explorer.sova.io"
    }
  },
  testnet: false
});
const sovaSepolia = /* @__PURE__ */ defineChain({
  id: 120893,
  name: "Sova Network Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Sepolia Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.sova.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Sova Sepolia Explorer",
      url: "https://explorer.testnet.sova.io"
    }
  },
  testnet: true
});
const spicy = /* @__PURE__ */ defineChain({
  id: 88882,
  name: "Chiliz Spicy Testnet",
  network: "chiliz-spicy-Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "CHZ",
    symbol: "CHZ"
  },
  rpcUrls: {
    default: {
      http: [
        "https://spicy-rpc.chiliz.com",
        "https://chiliz-spicy-rpc.publicnode.com"
      ],
      webSocket: [
        "wss://spicy-rpc-ws.chiliz.com",
        "wss://chiliz-spicy-rpc.publicnode.com"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Chiliz Explorer",
      url: "http://spicy-explorer.chiliz.com",
      apiUrl: "http://spicy-explorer.chiliz.com/api"
    }
  },
  testnet: true
});
const stable = /* @__PURE__ */ defineChain({
  id: 988,
  name: "Stable Mainnet",
  blockTime: 700,
  nativeCurrency: {
    name: "USDT0",
    symbol: "USDT0",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.stable.xyz"],
      webSocket: ["wss://rpc.stable.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Stablescan",
      url: "https://stablescan.xyz",
      apiUrl: "https://api.etherscan.io/v2/api?chainid=988"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2423647
    }
  },
  testnet: false
});
const stableTestnet = /* @__PURE__ */ defineChain({
  id: 2201,
  name: "Stable Testnet",
  blockTime: 700,
  nativeCurrency: {
    name: "USDT0",
    symbol: "USDT0",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.stable.xyz"],
      webSocket: ["wss://rpc.testnet.stable.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Stablescan",
      url: "https://testnet.stablescan.xyz",
      apiUrl: "https://api.etherscan.io/v2/api?chainid=2201"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 22364430
    }
  },
  testnet: true
});
const statusSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$1,
  id: 1660990954,
  name: "Status Network Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://public.sepolia.rpc.status.network"],
      webSocket: ["wss://public.sepolia.rpc.status.network/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sepoliascan.status.network"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1578364
    }
  },
  testnet: true
});
const step = /* @__PURE__ */ defineChain({
  id: 1234,
  name: "Step Network",
  nativeCurrency: { name: "FITFI", symbol: "FITFI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.step.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Step Scan",
      url: "https://stepscan.io"
    }
  },
  testnet: false
});
const story = /* @__PURE__ */ defineChain({
  id: 1514,
  name: "Story",
  nativeCurrency: {
    decimals: 18,
    name: "IP Token",
    symbol: "IP"
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 340998
    },
    ensRegistry: {
      address: "0x5dc881dda4e4a8d312be3544ad13118d1a04cb17",
      blockCreated: 648924
    },
    ensUniversalResolver: {
      address: "0xddfb18888a9466688235887dec2a10c4f5effee9",
      blockCreated: 649114
    }
  },
  rpcUrls: {
    default: { http: ["https://mainnet.storyrpc.io"] }
  },
  blockExplorers: {
    default: {
      name: "Story explorer",
      url: "https://storyscan.io",
      apiUrl: "https://storyscan.io/api/v2"
    }
  },
  ensTlds: [".ip"],
  testnet: false
});
const storyAeneid = /* @__PURE__ */ defineChain({
  id: 1315,
  name: "Story Aeneid",
  network: "story-aeneid",
  nativeCurrency: {
    decimals: 18,
    name: "IP",
    symbol: "IP"
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1792
    },
    ensRegistry: {
      address: "0x5dC881dDA4e4a8d312be3544AD13118D1a04Cb17",
      blockCreated: 1322033
    },
    ensUniversalResolver: {
      address: "0x6D3B3F99177FB2A5de7F9E928a9BD807bF7b5BAD",
      blockCreated: 1322097
    }
  },
  rpcUrls: {
    default: { http: ["https://aeneid.storyrpc.io"] }
  },
  blockExplorers: {
    default: {
      name: "Story Aeneid Explorer",
      url: "https://aeneid.storyscan.io",
      apiUrl: "https://aeneid.storyscan.io/api/v2"
    }
  },
  ensTlds: [".ip"],
  testnet: true
});
const storyOdyssey = /* @__PURE__ */ defineChain({
  id: 1516,
  name: "Story Odyssey",
  nativeCurrency: {
    decimals: 18,
    name: "IP",
    symbol: "IP"
  },
  rpcUrls: {
    default: { http: ["https://rpc.odyssey.storyrpc.io"] }
  },
  blockExplorers: {
    default: {
      name: "Story Odyssey Explorer",
      url: "https://odyssey.storyscan.xyz"
    }
  },
  testnet: true
});
const storyTestnet = /* @__PURE__ */ defineChain({
  id: 1513,
  name: "Story Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "IP",
    symbol: "IP"
  },
  rpcUrls: {
    default: { http: ["https://testnet.storyrpc.io"] }
  },
  blockExplorers: {
    default: {
      name: "Story Testnet Explorer",
      url: "https://testnet.storyscan.xyz"
    }
  },
  testnet: true
});
const stratis = /* @__PURE__ */ defineChain({
  id: 105105,
  name: "Stratis Mainnet",
  network: "stratis",
  nativeCurrency: {
    name: "Stratis",
    symbol: "STRAX",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.stratisevm.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Stratis Explorer",
      url: "https://explorer.stratisevm.com"
    }
  }
});
const subtensorEvm = /* @__PURE__ */ defineChain({
  id: 964,
  name: "Subtensor EVM",
  nativeCurrency: {
    decimals: 18,
    name: "TAO",
    symbol: "TAO"
  },
  rpcUrls: {
    default: {
      http: ["https://lite.chain.opentensor.ai"]
    }
  },
  blockExplorers: {
    default: {
      name: "Taostats EVM Explorer",
      url: "https://evm.taostats.io",
      apiUrl: "https://evm.taostats.io/api"
    }
  },
  testnet: false
});
const superlumio = /* @__PURE__ */ defineChain({
  id: 8866,
  name: "SuperLumio",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.lumio.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Lumio explorer",
      url: "https://explorer.lumio.io"
    }
  },
  testnet: false
});
const superposition = /* @__PURE__ */ defineChain({
  id: 55244,
  name: "Superposition",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.superposition.so"] }
  },
  blockExplorers: {
    default: {
      name: "Superposition Explorer",
      url: "https://explorer.superposition.so"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 39
    }
  },
  testnet: false
});
const sourceId$a = 1;
const superseed = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 5330,
  name: "Superseed",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.superseed.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Superseed Explorer",
      url: "https://explorer.superseed.xyz",
      apiUrl: "https://explorer.superseed.xyz/api/v2"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$a]: {
        address: "0x8b097CF1f9BbD9cbFD0DD561858a1FCbC8857Be0",
        blockCreated: 20737481
      }
    },
    l2OutputOracle: {
      [sourceId$a]: {
        address: "0x693A0F8854F458D282DE3C5b69E8eE5EEE8aA949",
        blockCreated: 20737481
      }
    },
    portal: {
      [sourceId$a]: {
        address: "0x2c2150aa5c75A24fB93d4fD2F2a895D618054f07",
        blockCreated: 20737481
      }
    },
    l1StandardBridge: {
      [sourceId$a]: {
        address: "0x8b0576E39F1233679109F9b40cFcC2a7E0901Ede",
        blockCreated: 20737481
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    }
  },
  sourceId: sourceId$a
});
const sourceId$9 = 11155111;
const superseedSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 53302,
  name: "Superseed Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.superseed.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Superseed Sepolia Explorer",
      url: "https://sepolia-explorer.superseed.xyz",
      apiUrl: "https://sepolia-explorer.superseed.xyz/api/v2"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    },
    portal: {
      [sourceId$9]: {
        address: "0x7A0db8C51432d2C3eb4e8f360a2EeB26FF2809fB",
        blockCreated: 5523438
      }
    },
    l1StandardBridge: {
      [sourceId$9]: {
        address: "0x2B227A603fAAdB3De0ED050b63ADD232B5f2c28C",
        blockCreated: 5523442
      }
    }
  },
  testnet: true,
  sourceId: sourceId$9
});
const surgeTestnet = /* @__PURE__ */ defineChain({
  id: 763375,
  name: "Surge Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://l2-rpc.hoodi.surge.wtf"],
      webSocket: ["wss://l2-ws.hoodi.surge.wtf"]
    }
  },
  blockExplorers: {
    default: {
      name: "Surge Testnet Blockscout",
      url: "https://explorer.hoodi.surge.wtf"
    }
  },
  testnet: true
});
const swan = /* @__PURE__ */ defineChain({
  id: 254,
  name: "Swan Chain Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet-rpc.swanchain.org"] }
  },
  blockExplorers: {
    default: {
      name: "Swan Explorer",
      url: "https://swanscan.io"
    }
  },
  testnet: false
});
const swanProximaTestnet = /* @__PURE__ */ defineChain({
  id: 20241133,
  name: "Swan Proxima Testnet",
  nativeCurrency: { name: "Swan Ether", symbol: "sETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-proxima.swanchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Swan Explorer",
      url: "https://proxima-explorer.swanchain.io"
    }
  },
  testnet: true
});
const swanSaturnTestnet = /* @__PURE__ */ defineChain({
  id: 2024,
  name: "Swan Saturn Testnet",
  nativeCurrency: { name: "Swan Ether", symbol: "sETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://saturn-rpc.swanchain.io"] }
  },
  blockExplorers: {
    default: {
      name: "Swan Explorer",
      url: "https://saturn-explorer.swanchain.io"
    }
  },
  testnet: true
});
const swellchain = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1923,
  name: "Swellchain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://swell-mainnet.alt.technology"]
    }
  },
  blockExplorers: {
    default: {
      name: "Swell Explorer",
      url: "https://explorer.swellnetwork.io",
      apiUrl: "https://explorer.swellnetwork.io/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1
    }
  }
});
const swellchainTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1924,
  name: "Swellchain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://swell-testnet.alt.technology"]
    }
  },
  blockExplorers: {
    default: {
      name: "Swellchain Testnet Explorer",
      url: "https://swell-testnet-explorer.alt.technology",
      apiUrl: "https://swell-testnet-explorer.alt.technology/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1
    }
  },
  testnet: true
});
const swissdlt = /* @__PURE__ */ defineChain({
  id: 94,
  name: "SwissDLT Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "BCTS",
    symbol: "BCTS"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.swissdlt.ch"]
    }
  },
  blockExplorers: {
    default: {
      name: "SwissDLT Explorer",
      url: "https://explorer.swissdlt.ch"
    }
  },
  testnet: false
});
const syscoin = /* @__PURE__ */ defineChain({
  id: 57,
  name: "Syscoin Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Syscoin",
    symbol: "SYS"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.syscoin.org"],
      webSocket: ["wss://rpc.syscoin.org/wss"]
    }
  },
  blockExplorers: {
    default: {
      name: "SyscoinExplorer",
      url: "https://explorer.syscoin.org",
      apiUrl: "https://explorer.syscoin.org/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 287139
    }
  }
});
const syscoinTestnet = /* @__PURE__ */ defineChain({
  id: 5700,
  name: "Syscoin Tanenbaum Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Syscoin",
    symbol: "SYS"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.tanenbaum.io"],
      webSocket: ["wss://rpc.tanenbaum.io/wss"]
    }
  },
  blockExplorers: {
    default: {
      name: "SyscoinTestnetExplorer",
      url: "https://tanenbaum.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 271288
    }
  },
  testnet: true
});
const tac = /* @__PURE__ */ defineChain({
  id: 239,
  name: "TAC",
  nativeCurrency: { name: "TAC", symbol: "TAC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/tac"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://tac.blockscout.com",
      apiUrl: "https://tac.blockscout.com/api"
    },
    native: {
      name: "TAC Explorer",
      url: "https://explorer.tac.build",
      apiUrl: "https://explorer.tac.build/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    }
  }
});
const tacSPB = /* @__PURE__ */ defineChain({
  id: 2391,
  name: "TAC SPB Testnet",
  nativeCurrency: {
    name: "TAC",
    symbol: "TAC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://spb.rpc.tac.build"]
    }
  },
  blockExplorers: {
    default: {
      name: "TAC",
      url: "https://spb.explorer.tac.build",
      apiUrl: "https://spb.explorer.tac.build/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 471429
    }
  },
  testnet: true
});
const taiko = /* @__PURE__ */ defineChain({
  id: 167e3,
  name: "Taiko Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.taiko.xyz"],
      webSocket: ["wss://ws.mainnet.taiko.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://taikoscan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 11269
    }
  }
});
const taikoHekla = /* @__PURE__ */ defineChain({
  id: 167009,
  name: "Taiko Hekla L2",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.hekla.taiko.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Taikoscan",
      url: "https://hekla.taikoscan.network"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 59757
    }
  },
  testnet: true
});
const taikoHoodi = /* @__PURE__ */ defineChain({
  id: 167013,
  name: "Taiko Hoodi",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.hoodi.taiko.xyz"],
      webSocket: ["wss://ws.hoodi.taiko.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://hoodi.taikoscan.io/"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 581116
    }
  },
  testnet: true
});
const taikoJolnir = /* @__PURE__ */ defineChain({
  id: 167007,
  name: "Taiko Jolnir (Alpha-5 Testnet)",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.jolnir.taiko.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer.jolnir.taiko.xyz"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 732706
    }
  },
  testnet: true
});
const taikoKatla = /* @__PURE__ */ defineChain({
  id: 167008,
  name: "Taiko Katla (Alpha-6 Testnet)",
  network: "tko-katla",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.katla.taiko.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer.katla.taiko.xyz"
    }
  },
  testnet: true
});
const taikoTestnetSepolia = /* @__PURE__ */ defineChain({
  id: 167005,
  name: "Taiko (Alpha-3 Testnet)",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.test.taiko.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer.test.taiko.xyz"
    }
  },
  testnet: true
});
const taraxa = /* @__PURE__ */ defineChain({
  id: 841,
  name: "Taraxa Mainnet",
  nativeCurrency: { name: "Tara", symbol: "TARA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.taraxa.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Taraxa Explorer",
      url: "https://explorer.mainnet.taraxa.io"
    }
  }
});
const taraxaTestnet = /* @__PURE__ */ defineChain({
  id: 842,
  name: "Taraxa Testnet",
  nativeCurrency: { name: "Tara", symbol: "TARA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.taraxa.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Taraxa Explorer",
      url: "https://explorer.testnet.taraxa.io"
    }
  },
  testnet: true
});
const teaSepolia = /* @__PURE__ */ defineChain({
  id: 10218,
  name: "Tea Sepolia",
  nativeCurrency: { name: "Sepolia Tea", symbol: "TEA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://tea-sepolia.g.alchemy.com/public"]
    }
  },
  blockExplorers: {
    default: {
      name: "Tea Sepolia Explorer",
      url: "https://sepolia.tea.xyz"
    }
  },
  testnet: true
});
const telcoinTestnet = /* @__PURE__ */ defineChain({
  id: 2017,
  name: "Telcoin Adiri Testnet",
  nativeCurrency: { name: "Telcoin", symbol: "TEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.telcoin.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "telscan",
      url: "https://telscan.io"
    }
  },
  testnet: true
});
const telos = /* @__PURE__ */ defineChain({
  id: 40,
  name: "Telos",
  nativeCurrency: {
    decimals: 18,
    name: "Telos",
    symbol: "TLOS"
  },
  rpcUrls: {
    default: { http: ["https://rpc.telos.net"] }
  },
  blockExplorers: {
    default: {
      name: "Teloscan",
      url: "https://www.teloscan.io/"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 246530709
    }
  }
});
const telosTestnet = /* @__PURE__ */ defineChain({
  id: 41,
  name: "Telos",
  nativeCurrency: {
    decimals: 18,
    name: "Telos",
    symbol: "TLOS"
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.telos.net"] }
  },
  blockExplorers: {
    default: {
      name: "Teloscan (testnet)",
      url: "https://testnet.teloscan.io/"
    }
  },
  testnet: true
});
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Fp256 = Field(BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"));
const p256_a = Fp256.create(BigInt("-3"));
const p256_b = BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b");
const p256 = createCurve({
  a: p256_a,
  b: p256_b,
  Fp: Fp256,
  n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
  Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
  Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
  h: BigInt(1),
  lowS: false
}, sha256$1);
const Fp384 = Field(BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"));
const p384_a = Fp384.create(BigInt("-3"));
const p384_b = BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef");
createCurve({
  a: p384_a,
  b: p384_b,
  Fp: Fp384,
  n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"),
  Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"),
  Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"),
  h: BigInt(1),
  lowS: false
}, sha384);
const Fp521 = Field(BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
const p521_a = Fp521.create(BigInt("-3"));
const p521_b = BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00");
createCurve({
  a: p521_a,
  b: p521_b,
  Fp: Fp521,
  n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"),
  Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"),
  Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650"),
  h: BigInt(1),
  lowS: false,
  allowedPrivateKeyLengths: [130, 131, 132]
  // P521 keys are variable-length. Normalize to 132b
}, sha512);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const secp256r1 = p256;
function verify$3(options) {
  const { hash: hash2, payload, publicKey, signature } = options;
  return secp256r1.verify(signature, payload instanceof Uint8Array ? payload : fromHex$1(payload), toHex$2(publicKey).substring(2), { lowS: true, ...hash2 ? { prehash: true } : {} });
}
const encoder = /* @__PURE__ */ new TextEncoder();
/* @__PURE__ */ Object.fromEntries(Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/").map((a, i) => [i, a.charCodeAt(0)]));
const characterToInteger = {
  ...Object.fromEntries(Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/").map((a, i) => [a.charCodeAt(0), i])),
  ["=".charCodeAt(0)]: 0,
  ["-".charCodeAt(0)]: 62,
  ["_".charCodeAt(0)]: 63
};
function toBytes(value) {
  const base64 = value.replace(/=+$/, "");
  const size2 = base64.length;
  const decoded = new Uint8Array(size2 + 3);
  encoder.encodeInto(base64 + "===", decoded);
  for (let i = 0, j = 0; i < base64.length; i += 4, j += 3) {
    const x = (characterToInteger[decoded[i]] << 18) + (characterToInteger[decoded[i + 1]] << 12) + (characterToInteger[decoded[i + 2]] << 6) + characterToInteger[decoded[i + 3]];
    decoded[j] = x >> 16;
    decoded[j + 1] = x >> 8 & 255;
    decoded[j + 2] = x & 255;
  }
  const decodedSize = (size2 >> 2) * 3 + (size2 % 4 && size2 % 4 - 1);
  return new Uint8Array(decoded.buffer, 0, decodedSize);
}
function verify$2(options) {
  const { challenge, metadata, origin, publicKey, rpId, signature } = options;
  const { authenticatorData, clientDataJSON, userVerificationRequired } = metadata;
  const authenticatorDataBytes = fromHex$1(authenticatorData);
  if (authenticatorDataBytes.length < 37)
    return false;
  if (rpId !== void 0) {
    const rpIdHash = authenticatorDataBytes.slice(0, 32);
    const expectedRpIdHash = sha256$2(fromString(rpId), { as: "Bytes" });
    if (!isEqual$1(rpIdHash, expectedRpIdHash))
      return false;
  }
  const flag = authenticatorDataBytes[32];
  if ((flag & 1) !== 1)
    return false;
  if (userVerificationRequired && (flag & 4) !== 4)
    return false;
  if ((flag & 8) !== 8 && (flag & 16) === 16)
    return false;
  const clientData = JSON.parse(clientDataJSON);
  if (clientData.type !== "webauthn.get")
    return false;
  if (!clientData.challenge || fromBytes(toBytes(clientData.challenge)) !== challenge)
    return false;
  if (origin !== void 0) {
    const origins = Array.isArray(origin) ? origin : [origin];
    if (!origins.includes(clientData.origin))
      return false;
  }
  const clientDataJSONHash = sha256$2(fromString$1(clientDataJSON), {
    as: "Bytes"
  });
  const payload = concat(authenticatorDataBytes, clientDataJSONHash);
  return verify$3({
    hash: true,
    payload,
    publicKey,
    signature
  });
}
function verify$1(options) {
  return verify$2(options);
}
const maxOwners = 10;
const zeroSalt = `0x${"00".repeat(32)}`;
const accountDomain = "tempo:multisig:account";
const configDomain = "tempo:multisig:config";
const signatureDomain = "tempo:multisig:signature";
function assert$1(config) {
  const { salt, threshold, owners } = config;
  if (typeof salt !== "undefined" && size(salt) !== 32)
    throw new InvalidConfigError({ reason: "salt must be 32 bytes" });
  if (owners.length === 0)
    throw new InvalidConfigError({ reason: "owners cannot be empty" });
  if (owners.length > maxOwners)
    throw new InvalidConfigError({ reason: "too many owners" });
  if (Number(threshold) < 1)
    throw new InvalidConfigError({ reason: "threshold cannot be zero" });
  let totalWeight = 0;
  let previous;
  for (const owner of owners) {
    if (!validate(owner.owner) || toBigInt(owner.owner) === 0n)
      throw new InvalidConfigError({ reason: "owner cannot be zero" });
    if (Number(owner.weight) < 1)
      throw new InvalidConfigError({ reason: "owner weight cannot be zero" });
    const current = toBigInt(owner.owner);
    if (typeof previous !== "undefined" && previous >= current)
      throw new InvalidConfigError({
        reason: "owners must be strictly ascending"
      });
    previous = current;
    totalWeight += Number(owner.weight);
  }
  if (totalWeight > 4294967295)
    throw new InvalidConfigError({
      reason: "total owner weight exceeds u32 max"
    });
  if (Number(threshold) > totalWeight)
    throw new InvalidConfigError({
      reason: "threshold exceeds total owner weight"
    });
}
function from$4(config) {
  const owners = [...config.owners].sort((a, b2) => toBigInt(a.owner) < toBigInt(b2.owner) ? -1 : 1);
  const normalized = {
    salt: config.salt ? padLeft(config.salt, 32) : zeroSalt,
    threshold: config.threshold,
    owners
  };
  assert$1(normalized);
  return normalized;
}
function fromTuple$2(tuple) {
  const [salt, threshold, owners] = tuple;
  return {
    salt: salt && salt !== "0x" ? padLeft(salt, 32) : zeroSalt,
    threshold: threshold === "0x" ? 0 : toNumber(threshold),
    owners: owners.map((owner) => {
      const [ownerAddress, weight] = owner;
      return {
        owner: ownerAddress,
        weight: !weight || weight === "0x" ? 0 : toNumber(weight)
      };
    })
  };
}
function getAddress(value) {
  const id = typeof value === "object" && "genesisConfigId" in value ? value.genesisConfigId : toId(value);
  const hash2 = keccak256(concat$1(fromString(accountDomain), id));
  return from$9(slice(hash2, 12, 32));
}
function getSignPayload$2(value) {
  const { payload } = value;
  const account = "account" in value && value.account ? value.account : getAddress(value.genesisConfig);
  const genesisConfigId = "genesisConfigId" in value && value.genesisConfigId ? value.genesisConfigId : toId(value.genesisConfig);
  return keccak256(concat$1(fromString(signatureDomain), from$7(payload), account, genesisConfigId));
}
function toId(config) {
  assert$1(config);
  const id = keccak256(concat$1(fromString(configDomain), padLeft(config.salt ?? zeroSalt, 32), fromNumber(config.threshold, { size: 4 }), fromNumber(config.owners.length, { size: 4 }), ...config.owners.flatMap((owner) => [
    owner.owner,
    fromNumber(owner.weight, { size: 4 })
  ])));
  if (toBigInt(id) === 0n)
    throw new InvalidConfigError({ reason: "config ID cannot be zero" });
  return id;
}
function toTuple$2(config) {
  assert$1(config);
  const owners = config.owners.map((owner) => [owner.owner, fromNumber(owner.weight)]);
  const salt = config.salt ? padLeft(config.salt, 32) : zeroSalt;
  return [salt, fromNumber(config.threshold), owners];
}
class InvalidConfigError extends BaseError {
  constructor({ reason }) {
    super(`Invalid native multisig config: ${reason}.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "MultisigConfig.InvalidConfigError"
    });
  }
}
const serializedP256Type = "0x01";
const serializedWebAuthnType = "0x02";
const serializedKeychainType = "0x03";
const serializedKeychainV2Type = "0x04";
const serializedMultisigType = "0x05";
const magicBytes = "0x7777777777777777777777777777777777777777777777777777777777777777";
function extractAddress(options) {
  const { signature, root: root2 } = options;
  if (signature.type === "keychain") {
    if (root2)
      return signature.userAddress;
    return extractAddress({ ...options, signature: signature.inner });
  }
  if (signature.type === "multisig")
    return signature.account;
  return fromPublicKey(extractPublicKey(options));
}
function extractPublicKey(options) {
  const { payload, signature } = options;
  switch (signature.type) {
    case "secp256k1":
      return recoverPublicKey({
        payload,
        signature: signature.signature
      });
    case "p256":
    case "webAuthn":
      return signature.publicKey;
    case "keychain":
      return extractPublicKey({ payload, signature: signature.inner });
    case "multisig":
      throw new CoercionError({ envelope: signature });
  }
}
function deserialize$1(value) {
  const serialized = value.endsWith(magicBytes.slice(2)) ? slice(value, 0, -size(magicBytes)) : value;
  const size$1 = size(serialized);
  if (size$1 === 65) {
    const signature = fromHex$2(serialized);
    assert$2(signature);
    return { signature, type: "secp256k1" };
  }
  const typeId = slice(serialized, 0, 1);
  const data = slice(serialized, 1);
  const dataSize = size(data);
  if (typeId === serializedP256Type) {
    if (dataSize !== 129)
      throw new InvalidSerializedError$1({
        reason: `Invalid P256 signature envelope size: expected 129 bytes, got ${dataSize} bytes`,
        serialized
      });
    return {
      publicKey: {
        prefix: 4,
        x: toBigInt(slice(data, 64, 96)),
        y: toBigInt(slice(data, 96, 128))
      },
      prehash: toNumber(slice(data, 128, 129)) !== 0,
      signature: {
        r: toBigInt(slice(data, 0, 32)),
        s: toBigInt(slice(data, 32, 64))
      },
      type: "p256"
    };
  }
  if (typeId === serializedWebAuthnType) {
    if (dataSize < 128)
      throw new InvalidSerializedError$1({
        reason: `Invalid WebAuthn signature envelope size: expected at least 128 bytes, got ${dataSize} bytes`,
        serialized
      });
    const webauthnDataSize = dataSize - 128;
    const webauthnData = slice(data, 0, webauthnDataSize);
    let authenticatorData;
    let clientDataJSON;
    for (let split = 37; split < webauthnDataSize; split++) {
      const potentialJson = toString(slice(webauthnData, split));
      if (potentialJson.startsWith("{") && potentialJson.endsWith("}")) {
        try {
          JSON.parse(potentialJson);
          authenticatorData = slice(webauthnData, 0, split);
          clientDataJSON = potentialJson;
          break;
        } catch {
        }
      }
    }
    if (!authenticatorData || !clientDataJSON)
      throw new InvalidSerializedError$1({
        reason: "Unable to parse WebAuthn metadata: could not extract valid authenticatorData and clientDataJSON",
        serialized
      });
    return {
      publicKey: {
        prefix: 4,
        x: toBigInt(slice(data, webauthnDataSize + 64, webauthnDataSize + 96)),
        y: toBigInt(slice(data, webauthnDataSize + 96, webauthnDataSize + 128))
      },
      metadata: {
        authenticatorData,
        clientDataJSON
      },
      signature: {
        r: toBigInt(slice(data, webauthnDataSize, webauthnDataSize + 32)),
        s: toBigInt(slice(data, webauthnDataSize + 32, webauthnDataSize + 64))
      },
      type: "webAuthn"
    };
  }
  if (typeId === serializedKeychainType || typeId === serializedKeychainV2Type) {
    const userAddress = slice(data, 0, 20);
    const inner = deserialize$1(slice(data, 20));
    return {
      userAddress,
      inner,
      type: "keychain",
      version: typeId === serializedKeychainV2Type ? "v2" : "v1"
    };
  }
  if (typeId === serializedMultisigType) {
    const [account, genesisConfigId, signatures, init] = toHex(data);
    return {
      type: "multisig",
      account,
      genesisConfigId,
      signatures: signatures.map((signature) => deserialize$1(signature)),
      ...init && init !== "0x" ? {
        init: fromTuple$2(init)
      } : {}
    };
  }
  throw new InvalidSerializedError$1({
    reason: `Unknown signature type identifier: ${typeId}. Expected ${serializedP256Type} (P256), ${serializedWebAuthnType} (WebAuthn), ${serializedKeychainType} (Keychain V1), ${serializedKeychainV2Type} (Keychain V2), or ${serializedMultisigType} (Multisig)`,
    serialized
  });
}
function from$3(value, options) {
  if (typeof value === "string")
    return deserialize$1(value);
  if (typeof value === "object" && value !== null && "r" in value && "s" in value && "yParity" in value)
    return { signature: value, type: "secp256k1" };
  const type2 = getType$1(value);
  if (type2 === "multisig") {
    const multisig = value;
    const { genesisConfig, init, ...rest } = multisig;
    const account = (() => {
      if (rest.account)
        return rest.account;
      if (genesisConfig)
        return getAddress(genesisConfig);
      return rest.account;
    })();
    const genesisConfigId = (() => {
      if (rest.genesisConfigId)
        return rest.genesisConfigId;
      if (genesisConfig)
        return toId(genesisConfig);
      return rest.genesisConfigId;
    })();
    const initSource = init === true ? genesisConfig : init || void 0;
    return {
      ...rest,
      account,
      genesisConfigId,
      signatures: rest.signatures.map((signature) => from$3(signature)),
      // Normalize the bootstrap config (sorts owners, defaults the salt) so the
      // in-memory envelope matches what `deserialize` reconstructs.
      ...initSource ? { init: from$4(initSource) } : {},
      type: type2
    };
  }
  return {
    ...value,
    ...type2 === "p256" ? { prehash: value.prehash } : {},
    ...type2 === "keychain" ? {
      ...!(typeof value === "object" && value !== null && "version" in value && value.version) ? { version: "v2" } : {},
      ...!(typeof value === "object" && "keyId" in value && value.keyId) ? (() => {
        const inner = value.inner;
        if (inner.type === "p256" || inner.type === "webAuthn")
          return { keyId: fromPublicKey(inner.publicKey) };
        if (inner.type === "secp256k1" && options?.payload)
          ;
        return {};
      })() : {}
    } : {},
    type: type2
  };
}
function fromRpc$4(envelope) {
  if (envelope.type === "secp256k1")
    return {
      signature: fromRpc$5(envelope),
      type: "secp256k1"
    };
  if (envelope.type === "p256") {
    return {
      prehash: envelope.preHash,
      publicKey: {
        prefix: 4,
        x: toBigInt(envelope.pubKeyX),
        y: toBigInt(envelope.pubKeyY)
      },
      signature: {
        r: toBigInt(envelope.r),
        s: toBigInt(envelope.s)
      },
      type: "p256"
    };
  }
  if (envelope.type === "webAuthn") {
    const webauthnData = envelope.webauthnData;
    const webauthnDataSize = size(webauthnData);
    let authenticatorData;
    let clientDataJSON;
    for (let split = 37; split < webauthnDataSize; split++) {
      const potentialJson = toString(slice(webauthnData, split));
      if (potentialJson.startsWith("{") && potentialJson.endsWith("}")) {
        try {
          JSON.parse(potentialJson);
          authenticatorData = slice(webauthnData, 0, split);
          clientDataJSON = potentialJson;
          break;
        } catch {
        }
      }
    }
    if (!authenticatorData || !clientDataJSON)
      throw new InvalidSerializedError$1({
        reason: "Unable to parse WebAuthn metadata: could not extract valid authenticatorData and clientDataJSON",
        serialized: webauthnData
      });
    return {
      metadata: {
        authenticatorData,
        clientDataJSON
      },
      publicKey: {
        prefix: 4,
        x: toBigInt(envelope.pubKeyX),
        y: toBigInt(envelope.pubKeyY)
      },
      signature: {
        r: toBigInt(envelope.r),
        s: toBigInt(envelope.s)
      },
      type: "webAuthn"
    };
  }
  if (envelope.type === "keychain" || "userAddress" in envelope && "signature" in envelope) {
    const keychain = envelope;
    return {
      type: "keychain",
      userAddress: keychain.userAddress,
      inner: fromRpc$4(keychain.signature),
      ...keychain.keyId ? { keyId: keychain.keyId } : {},
      ...keychain.version ? { version: keychain.version } : {}
    };
  }
  if (envelope.type === "multisig" || "account" in envelope && "configId" in envelope && "signatures" in envelope) {
    const multisig = envelope;
    return {
      type: "multisig",
      account: multisig.account,
      // Map RPC wire field `configId` (TIP-1061 spec name) to the typed
      // envelope's `genesisConfigId`.
      genesisConfigId: multisig.configId,
      // Owner approvals are raw serialized signatures (node `Vec<Bytes>`).
      signatures: multisig.signatures.map((signature) => deserialize$1(signature)),
      ...multisig.init ? { init: from$4(multisig.init) } : {}
    };
  }
  throw new CoercionError({ envelope });
}
function getType$1(envelope) {
  if (typeof envelope !== "object" || envelope === null)
    throw new CoercionError({ envelope });
  if ("type" in envelope && envelope.type)
    return envelope.type;
  if ("signature" in envelope && !("publicKey" in envelope) && typeof envelope.signature === "object" && envelope.signature !== null && "r" in envelope.signature && "s" in envelope.signature && "yParity" in envelope.signature)
    return "secp256k1";
  if ("r" in envelope && "s" in envelope && "yParity" in envelope)
    return "secp256k1";
  if ("signature" in envelope && "prehash" in envelope && "publicKey" in envelope && typeof envelope.prehash === "boolean")
    return "p256";
  if ("signature" in envelope && "metadata" in envelope && "publicKey" in envelope)
    return "webAuthn";
  if ("userAddress" in envelope && "inner" in envelope)
    return "keychain";
  if (("account" in envelope && "genesisConfigId" in envelope || "genesisConfig" in envelope) && "signatures" in envelope)
    return "multisig";
  throw new CoercionError({
    envelope
  });
}
function serialize$2(envelope, options = {}) {
  const type2 = getType$1(envelope);
  if (type2 === "secp256k1") {
    const secp256k12 = envelope;
    return concat$1(toHex$3(secp256k12.signature), options.magic ? magicBytes : "0x");
  }
  if (type2 === "p256") {
    const p2562 = envelope;
    return concat$1(serializedP256Type, fromNumber(p2562.signature.r, { size: 32 }), fromNumber(p2562.signature.s, { size: 32 }), fromNumber(p2562.publicKey.x, { size: 32 }), fromNumber(p2562.publicKey.y, { size: 32 }), fromNumber(p2562.prehash ? 1 : 0, { size: 1 }), options.magic ? magicBytes : "0x");
  }
  if (type2 === "webAuthn") {
    const webauthn = envelope;
    const webauthnData = concat$1(webauthn.metadata.authenticatorData, fromString(webauthn.metadata.clientDataJSON));
    return concat$1(serializedWebAuthnType, webauthnData, fromNumber(webauthn.signature.r, { size: 32 }), fromNumber(webauthn.signature.s, { size: 32 }), fromNumber(webauthn.publicKey.x, { size: 32 }), fromNumber(webauthn.publicKey.y, { size: 32 }), options.magic ? magicBytes : "0x");
  }
  if (type2 === "keychain") {
    const keychain = envelope;
    const keychainTypeId = keychain.version === "v1" ? serializedKeychainType : serializedKeychainV2Type;
    return concat$1(keychainTypeId, keychain.userAddress, serialize$2(keychain.inner), options.magic ? magicBytes : "0x");
  }
  if (type2 === "multisig") {
    const multisig = envelope;
    return concat$1(serializedMultisigType, fromHex([
      multisig.account,
      multisig.genesisConfigId,
      multisig.signatures.map((signature) => serialize$2(signature)),
      multisig.init ? toTuple$2(multisig.init) : "0x"
    ]), options.magic ? magicBytes : "0x");
  }
  throw new CoercionError({ envelope });
}
function sortMultisigApprovals(value) {
  const { payload, signatures } = value;
  const digest = getSignPayload$2("genesisConfig" in value && value.genesisConfig ? { payload, genesisConfig: value.genesisConfig } : {
    payload,
    account: value.account,
    genesisConfigId: value.genesisConfigId
  });
  return signatures.map((signature) => ({
    key: toBigInt(extractAddress({ payload: digest, signature })),
    signature
  })).sort((a, b2) => a.key < b2.key ? -1 : a.key > b2.key ? 1 : 0).map((entry) => entry.signature);
}
function toRpc$4(envelope) {
  const type2 = getType$1(envelope);
  if (type2 === "secp256k1") {
    const secp256k12 = envelope;
    return {
      ...toRpc$5(secp256k12.signature),
      type: "secp256k1"
    };
  }
  if (type2 === "p256") {
    const p2562 = envelope;
    return {
      preHash: p2562.prehash,
      pubKeyX: fromNumber(p2562.publicKey.x, { size: 32 }),
      pubKeyY: fromNumber(p2562.publicKey.y, { size: 32 }),
      r: fromNumber(p2562.signature.r, { size: 32 }),
      s: fromNumber(p2562.signature.s, { size: 32 }),
      type: "p256"
    };
  }
  if (type2 === "webAuthn") {
    const webauthn = envelope;
    const webauthnData = concat$1(webauthn.metadata.authenticatorData, fromString(webauthn.metadata.clientDataJSON));
    return {
      pubKeyX: fromNumber(webauthn.publicKey.x, { size: 32 }),
      pubKeyY: fromNumber(webauthn.publicKey.y, { size: 32 }),
      r: fromNumber(webauthn.signature.r, { size: 32 }),
      s: fromNumber(webauthn.signature.s, { size: 32 }),
      type: "webAuthn",
      webauthnData
    };
  }
  if (type2 === "keychain") {
    const keychain = envelope;
    return {
      type: "keychain",
      userAddress: keychain.userAddress,
      signature: toRpc$4(keychain.inner),
      ...keychain.keyId ? { keyId: keychain.keyId } : {},
      ...keychain.version ? { version: keychain.version } : {}
    };
  }
  if (type2 === "multisig") {
    const multisig = envelope;
    return {
      type: "multisig",
      account: multisig.account,
      // Map the typed envelope's `genesisConfigId` to the RPC wire field
      // `configId` (TIP-1061 spec name).
      configId: multisig.genesisConfigId,
      // Owner approvals are raw serialized signatures (node `Vec<Bytes>`).
      signatures: multisig.signatures.map((signature) => serialize$2(signature)),
      ...multisig.init ? { init: multisig.init } : {}
    };
  }
  throw new CoercionError({ envelope });
}
function verify(signature, parameters) {
  const { payload } = parameters;
  const address = (() => {
    if (parameters.address)
      return parameters.address;
    if (parameters.publicKey)
      return fromPublicKey(parameters.publicKey);
    return void 0;
  })();
  if (!address)
    return false;
  const envelope = from$3(signature);
  if (envelope.type === "secp256k1") {
    if (!address)
      return false;
    return verify$4({
      address,
      payload,
      signature: envelope.signature
    });
  }
  if (envelope.type === "p256") {
    const envelopeAddress = fromPublicKey(envelope.publicKey);
    if (!isEqual(envelopeAddress, address))
      return false;
    return verify$3({
      hash: envelope.prehash,
      publicKey: envelope.publicKey,
      payload,
      signature: envelope.signature
    });
  }
  if (envelope.type === "webAuthn") {
    const envelopeAddress = fromPublicKey(envelope.publicKey);
    if (!isEqual(envelopeAddress, address))
      return false;
    return verify$1({
      challenge: from$7(payload),
      metadata: envelope.metadata,
      publicKey: envelope.publicKey,
      signature: envelope.signature
    });
  }
  throw new VerificationError(`Unable to verify signature envelope of type "${envelope.type}".`);
}
class CoercionError extends BaseError {
  constructor({ envelope }) {
    super(`Unable to coerce value (\`${stringify(envelope)}\`) to a valid signature envelope.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "SignatureEnvelope.CoercionError"
    });
  }
}
let InvalidSerializedError$1 = class InvalidSerializedError extends BaseError {
  constructor({ reason, serialized }) {
    super(`Unable to deserialize signature envelope: ${reason}`, {
      metaMessages: [`Serialized: ${serialized}`]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "SignatureEnvelope.InvalidSerializedError"
    });
  }
};
class VerificationError extends BaseError {
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "SignatureEnvelope.VerificationError"
    });
  }
}
function resolve(address) {
  if (address.startsWith("tempo"))
    return parse(address).address;
  return address;
}
function parse(tempoAddress) {
  if (!tempoAddress.startsWith("tempox"))
    throw new InvalidPrefixError({ address: tempoAddress });
  const hex = tempoAddress.slice("tempox".length);
  assert$3(hex, { strict: true });
  const address = checksum(hex);
  return { address };
}
class InvalidPrefixError extends BaseError {
  constructor({ address }) {
    super(`Tempo address "${address}" has an invalid prefix. Expected "tempox".`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "TempoAddress.InvalidPrefixError"
    });
  }
}
function from$2(authorization, options = {}) {
  if (typeof authorization.chainId === "string")
    return fromRpc$3(authorization);
  const resolved = {
    ...authorization,
    address: resolve(authorization.address)
  };
  if (options.signature) {
    return { ...resolved, signature: options.signature };
  }
  return resolved;
}
function fromRpc$3(authorization) {
  const { address, chainId, nonce: nonce2 } = authorization;
  const signature = fromRpc$4(authorization.signature);
  return {
    address,
    chainId: Number(chainId),
    nonce: BigInt(nonce2),
    signature
  };
}
function fromRpcList(authorizationList) {
  return authorizationList.map((x) => fromRpc$3(x));
}
function fromTuple$1(tuple) {
  const [chainId, address, nonce2, signatureSerialized] = tuple;
  const args = {
    address,
    chainId: chainId === "0x" ? 0 : Number(chainId),
    nonce: nonce2 === "0x" ? 0n : BigInt(nonce2)
  };
  if (signatureSerialized)
    args.signature = deserialize$1(signatureSerialized);
  return from$2(args);
}
function fromTupleList$1(tupleList) {
  const list = [];
  for (const tuple of tupleList)
    list.push(fromTuple$1(tuple));
  return list;
}
function toRpc$3(authorization) {
  const { address, chainId, nonce: nonce2, signature } = authorization;
  return {
    address,
    chainId: fromNumber(chainId),
    nonce: fromNumber(nonce2),
    signature: toRpc$4(signature)
  };
}
function toRpcList(authorizationList) {
  return authorizationList.map((x) => toRpc$3(x));
}
function toTuple$1(authorization) {
  const { address, chainId, nonce: nonce2 } = authorization;
  const signature = authorization.signature ? serialize$2(authorization.signature) : void 0;
  return [
    chainId ? fromNumber(chainId) : "0x",
    address,
    nonce2 ? fromNumber(nonce2) : "0x",
    ...signature ? [signature] : []
  ];
}
function toTupleList$1(list) {
  if (!list || list.length === 0)
    return [];
  const tupleList = [];
  for (const authorization of list)
    tupleList.push(toTuple$1(authorization));
  return tupleList;
}
const tip20Prefix = "0x20c0";
function toAddress(tokenId) {
  if (typeof tokenId === "string") {
    const resolved = resolve(tokenId);
    assert$4(resolved);
    return resolved;
  }
  const tokenIdHex = fromNumber(tokenId, { size: 18 });
  return concat$1(tip20Prefix, tokenIdHex);
}
function from$1(authorization, options = {}) {
  if ("keyId" in authorization)
    return fromRpc$2(authorization);
  const auth = authorization;
  if (auth.witness !== void 0)
    assertWitness(auth.witness);
  const resolved = {
    ...auth,
    address: resolve(auth.address),
    ...auth.limits ? {
      limits: auth.limits.map((l) => ({
        ...l,
        token: resolve(l.token)
      }))
    } : {},
    ...auth.scopes ? {
      scopes: auth.scopes.map((scope) => ({
        ...scope,
        address: resolve(scope.address),
        selector: resolveSelector(scope.selector),
        ...scope.recipients ? {
          recipients: scope.recipients.map((r) => resolve(r))
        } : {}
      }))
    } : {}
  };
  if (options.signature)
    return {
      ...resolved,
      signature: from$3(options.signature)
    };
  return resolved;
}
function fromRpc$2(authorization) {
  const { allowedCalls, chainId, keyId, expiry, limits, keyType } = authorization;
  const witness = authorization.witness ?? void 0;
  const isAdmin2 = authorization.isAdmin ?? void 0;
  const account = authorization.account ?? void 0;
  const signature = fromRpc$4(authorization.signature);
  if (witness !== void 0)
    assertWitness(witness);
  const scopes = allowedCalls ? allowedCalls.flatMap((callScope) => {
    if (!callScope.selectorRules || callScope.selectorRules.length === 0)
      return [{ address: callScope.target }];
    return callScope.selectorRules.map((rule) => ({
      address: callScope.target,
      selector: normalizeSelector(rule.selector),
      ...rule.recipients && rule.recipients.length > 0 ? { recipients: rule.recipients } : {}
    }));
  }) : void 0;
  return {
    address: keyId,
    chainId: chainId === "0x" ? 0n : toBigInt(chainId),
    ...expiry != null ? { expiry: Number(expiry) } : {},
    limits: limits?.map((limit) => ({
      token: limit.token,
      limit: BigInt(limit.limit),
      ...limit.period && hexToNumber(limit.period) > 0 ? { period: hexToNumber(limit.period) } : {}
    })),
    ...scopes ? { scopes } : {},
    signature,
    type: keyType,
    ...witness !== void 0 ? { witness } : {},
    ...isAdmin2 ? { isAdmin: true } : {},
    ...account !== void 0 ? { account } : {}
  };
}
function fromTuple(tuple) {
  const [authorization, signatureSerialized] = tuple;
  const [chainId, keyType_hex, keyId, ...trailing] = authorization;
  const keyType = (() => {
    switch (keyType_hex) {
      case "0x":
      case "0x00":
        return "secp256k1";
      case "0x01":
        return "p256";
      case "0x02":
        return "webAuthn";
      default:
        throw new Error(`Invalid key type: ${keyType_hex}`);
    }
  })();
  const [rawExpiry, rawLimits, rawScopes, rawWitness, rawIsAdmin, rawAccount] = trailing;
  const expiry = isAbsent(rawExpiry) ? void 0 : hexToNumber(rawExpiry) || void 0;
  const limits = Array.isArray(rawLimits) && rawLimits.length > 0 ? rawLimits.map((limitTuple) => {
    const [token, limit, period] = limitTuple;
    return {
      token,
      limit: hexToBigint(limit),
      ...period !== void 0 ? { period: hexToNumber(period) } : {}
    };
  }) : void 0;
  const scopes = Array.isArray(rawScopes) ? rawScopes.flatMap((scopeTuple) => {
    const [address, selectorRules] = scopeTuple;
    if (!Array.isArray(selectorRules) || selectorRules.length === 0)
      return [{ address }];
    return selectorRules.map((ruleTuple) => {
      const [selector, recipients] = ruleTuple;
      return {
        address,
        selector,
        ...Array.isArray(recipients) && recipients.length > 0 ? { recipients } : {}
      };
    });
  }) : void 0;
  const witness = isAbsent(rawWitness) ? void 0 : rawWitness;
  if (witness !== void 0)
    assertWitness(witness);
  const isAdmin2 = (() => {
    if (isAbsent(rawIsAdmin))
      return void 0;
    if (rawIsAdmin !== "0x01")
      throw new InvalidAdminMarkerError(rawIsAdmin);
    return true;
  })();
  const account = isAbsent(rawAccount) ? void 0 : rawAccount;
  const adminPair = account !== void 0 && isAdmin2 ? { account, isAdmin: true } : {};
  const args = {
    address: keyId,
    chainId: chainId === "0x" ? 0n : toBigInt(chainId),
    type: keyType,
    ...expiry !== void 0 ? { expiry } : {},
    ...limits !== void 0 ? { limits } : {},
    ...scopes !== void 0 ? { scopes } : {},
    ...witness !== void 0 ? { witness } : {},
    ...adminPair
  };
  if (signatureSerialized)
    args.signature = deserialize$1(signatureSerialized);
  return from$1(args);
}
function getSignPayload$1(authorization) {
  return hash$1(authorization);
}
function hash$1(authorization) {
  const [authorizationTuple] = toTuple(authorization);
  const serialized = fromHex(authorizationTuple);
  return keccak256(serialized);
}
function toRpc$2(authorization) {
  const { address, scopes, chainId, expiry, limits, type: type2, signature, witness, isAdmin: isAdmin2, account } = authorization;
  if (witness !== void 0)
    assertWitness(witness);
  const allowedCalls = (() => {
    if (!scopes)
      return void 0;
    const grouped = /* @__PURE__ */ new Map();
    for (const scope of scopes) {
      const key = scope.address;
      if (!grouped.has(key))
        grouped.set(key, []);
      if (scope.selector) {
        grouped.get(key).push({
          selector: resolveSelector(scope.selector),
          ...scope.recipients && scope.recipients.length > 0 ? { recipients: scope.recipients } : {}
        });
      }
    }
    return [...grouped.entries()].map(([target, selectorRules]) => ({
      target,
      ...selectorRules.length > 0 ? { selectorRules } : {}
    }));
  })();
  return {
    chainId: chainId === 0n ? "0x" : fromNumber(chainId),
    expiry: typeof expiry === "number" ? fromNumber(expiry) : null,
    keyId: resolve(address),
    keyType: type2,
    limits: limits?.map(({ token, limit, period }) => ({
      token,
      limit: fromNumber(limit),
      ...period ? { period: numberToHex(period) } : {}
    })),
    signature: toRpc$4(signature),
    ...allowedCalls ? { allowedCalls } : {},
    ...witness !== void 0 ? { witness } : {},
    ...isAdmin2 ? { isAdmin: true } : {},
    ...account !== void 0 ? { account } : {}
  };
}
function toTuple(authorization) {
  const { address, chainId, scopes, expiry, limits, witness, isAdmin: isAdmin2, account } = authorization;
  if (witness !== void 0)
    assertWitness(witness);
  const signature = authorization.signature ? serialize$2(authorization.signature) : void 0;
  const type2 = (() => {
    switch (authorization.type) {
      case "secp256k1":
        return "0x";
      case "p256":
        return "0x01";
      case "webAuthn":
        return "0x02";
      default:
        throw new Error(`Invalid key type: ${authorization.type}`);
    }
  })();
  const limitsValue = limits?.map((limit) => {
    const tuple = [limit.token, bigintToHex(limit.limit)];
    if (limit.period && limit.period > 0)
      tuple.push(numberToHex(limit.period));
    return tuple;
  });
  const callsValue = (() => {
    if (!scopes)
      return void 0;
    const grouped = /* @__PURE__ */ new Map();
    for (const scope of scopes) {
      const key = scope.address;
      if (!grouped.has(key))
        grouped.set(key, []);
      if (scope.selector) {
        grouped.get(key).push([
          resolveSelector(scope.selector),
          scope.recipients ?? []
        ]);
      }
    }
    return [...grouped.entries()].map(([address2, selectorRules]) => [
      address2,
      selectorRules.map(([selector, recipients]) => [selector, recipients])
    ]);
  })();
  const hasTip1053Plus = witness !== void 0 || isAdmin2 || account !== void 0;
  const optionals = [
    {
      value: expiry !== null && expiry !== void 0 && expiry !== 0 ? numberToHex(expiry) : void 0,
      placeholder: "0x"
    },
    {
      value: limitsValue,
      placeholder: hasTip1053Plus ? "0x" : []
    },
    { value: callsValue, placeholder: "0x" },
    { value: witness, placeholder: "0x" },
    // TIP-1049: admin marker. Present = `0x01` (RLP integer 1); absent
    // skipped or omitted. Any other value is a hard decode error on the node.
    { value: isAdmin2 ? "0x01" : void 0, placeholder: "0x" },
    // TIP-1049: optional account binding. Last field — never a placeholder.
    { value: account, placeholder: "0x" }
  ];
  let lastPresent = -1;
  for (let i = optionals.length - 1; i >= 0; i--)
    if (optionals[i].value !== void 0) {
      lastPresent = i;
      break;
    }
  const trailing = optionals.slice(0, lastPresent + 1).map(({ value, placeholder }) => value ?? placeholder);
  const authorizationTuple = [bigintToHex(chainId), type2, address, ...trailing];
  return [authorizationTuple, ...signature ? [signature] : []];
}
function bigintToHex(value) {
  return value === 0n ? "0x" : fromNumber(value);
}
function numberToHex(value) {
  return value === 0 ? "0x" : fromNumber(value);
}
function hexToBigint(hex) {
  return hex === "0x" ? 0n : BigInt(hex);
}
function hexToNumber(hex) {
  return hex === "0x" ? 0 : toNumber(hex);
}
function normalizeSelector(selector) {
  if (typeof selector === "string")
    return selector;
  if (Array.isArray(selector))
    return fromBytes(new Uint8Array(selector));
  return selector;
}
function resolveSelector(selector) {
  if (!selector)
    return void 0;
  if (selector.startsWith("0x"))
    return selector;
  return getSelector(selector);
}
function assertWitness(witness) {
  if (size(witness) !== 32)
    throw new InvalidWitnessSizeError(witness);
}
function isAbsent(value) {
  return value === void 0 || value === "0x";
}
class InvalidWitnessSizeError extends Error {
  constructor(witness) {
    super(`Witness \`${witness}\` must be exactly 32 bytes (got ${size(witness)} bytes).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "KeyAuthorization.InvalidWitnessSizeError"
    });
  }
}
class InvalidAdminMarkerError extends Error {
  constructor(marker) {
    super(`Admin marker \`${marker}\` is invalid; expected \`0x01\` (TIP-1049).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "KeyAuthorization.InvalidAdminMarkerError"
    });
  }
}
const toRpcType$1 = {
  legacy: "0x0",
  eip2930: "0x1",
  eip1559: "0x2",
  eip4844: "0x3",
  eip7702: "0x4"
};
const fromRpcType$1 = {
  "0x0": "legacy",
  "0x1": "eip2930",
  "0x2": "eip1559",
  "0x3": "eip4844",
  "0x4": "eip7702"
};
function fromRpc$1(transaction, _options = {}) {
  if (!transaction)
    return null;
  const signature = extract$1(transaction);
  const transaction_ = {
    ...transaction,
    ...signature
  };
  transaction_.blockNumber = transaction.blockNumber ? BigInt(transaction.blockNumber) : null;
  if ("blockTimestamp" in transaction)
    transaction_.blockTimestamp = transaction.blockTimestamp ? BigInt(transaction.blockTimestamp) : transaction.blockTimestamp === null ? null : void 0;
  transaction_.data = transaction.input;
  transaction_.gas = BigInt(transaction.gas ?? 0n);
  transaction_.nonce = BigInt(transaction.nonce ?? 0n);
  transaction_.transactionIndex = transaction.transactionIndex ? Number(transaction.transactionIndex) : null;
  transaction_.value = BigInt(transaction.value ?? 0n);
  if (transaction.authorizationList)
    transaction_.authorizationList = fromRpcList$1(transaction.authorizationList);
  if (transaction.chainId)
    transaction_.chainId = Number(transaction.chainId);
  if (transaction.gasPrice)
    transaction_.gasPrice = BigInt(transaction.gasPrice);
  if (transaction.maxFeePerBlobGas)
    transaction_.maxFeePerBlobGas = BigInt(transaction.maxFeePerBlobGas);
  if (transaction.maxFeePerGas)
    transaction_.maxFeePerGas = BigInt(transaction.maxFeePerGas);
  if (transaction.maxPriorityFeePerGas)
    transaction_.maxPriorityFeePerGas = BigInt(transaction.maxPriorityFeePerGas);
  if (transaction.type)
    transaction_.type = fromRpcType$1[transaction.type] ?? transaction.type;
  if (signature)
    transaction_.v = yParityToV(signature.yParity);
  return transaction_;
}
const toRpcType = {
  ...toRpcType$1,
  tempo: "0x76"
};
const fromRpcType = {
  ...fromRpcType$1,
  "0x76": "tempo"
};
function fromRpc(transaction, _options = {}) {
  if (!transaction)
    return null;
  const transaction_ = fromRpc$1(transaction);
  transaction_.type = fromRpcType[transaction.type];
  if (transaction.aaAuthorizationList) {
    transaction_.authorizationList = fromRpcList(transaction.aaAuthorizationList);
    delete transaction_.aaAuthorizationList;
  }
  if (transaction.calls)
    transaction_.calls = transaction.calls.map((call) => ({
      to: call.to,
      value: call.value && call.value !== "0x" ? BigInt(call.value) : void 0,
      // @ts-expect-error
      data: call.input || call.data || "0x"
    }));
  if (transaction.feeToken)
    transaction_.feeToken = transaction.feeToken;
  if (transaction.nonceKey)
    transaction_.nonceKey = BigInt(transaction.nonceKey);
  if (transaction.signature)
    transaction_.signature = fromRpc$4(transaction.signature);
  if (transaction.validAfter)
    transaction_.validAfter = Number(transaction.validAfter);
  if (transaction.validBefore)
    transaction_.validBefore = Number(transaction.validBefore);
  if (transaction.keyAuthorization)
    transaction_.keyAuthorization = fromRpc$2(transaction.keyAuthorization);
  if (transaction.feePayerSignature) {
    transaction_.feePayerSignature = fromRpc$5(transaction.feePayerSignature);
    transaction_.feePayerSignature.v = yParityToV(transaction_.feePayerSignature.yParity);
  }
  return transaction_;
}
function toRpc$1(request) {
  const request_rpc = {};
  if (typeof request.accessList !== "undefined")
    request_rpc.accessList = request.accessList;
  if (typeof request.authorizationList !== "undefined")
    request_rpc.authorizationList = toRpcList$1(request.authorizationList);
  if (typeof request.blobVersionedHashes !== "undefined")
    request_rpc.blobVersionedHashes = request.blobVersionedHashes;
  if (typeof request.blobs !== "undefined")
    request_rpc.blobs = request.blobs;
  if (typeof request.chainId !== "undefined")
    request_rpc.chainId = fromNumber(request.chainId);
  if (typeof request.data !== "undefined") {
    request_rpc.data = request.data;
    request_rpc.input = request.data;
  } else if (typeof request.input !== "undefined") {
    request_rpc.data = request.input;
    request_rpc.input = request.input;
  }
  if (typeof request.from !== "undefined")
    request_rpc.from = request.from;
  if (typeof request.gas !== "undefined")
    request_rpc.gas = fromNumber(request.gas);
  if (typeof request.gasPrice !== "undefined")
    request_rpc.gasPrice = fromNumber(request.gasPrice);
  if (typeof request.maxFeePerBlobGas !== "undefined")
    request_rpc.maxFeePerBlobGas = fromNumber(request.maxFeePerBlobGas);
  if (typeof request.maxFeePerGas !== "undefined")
    request_rpc.maxFeePerGas = fromNumber(request.maxFeePerGas);
  if (typeof request.maxPriorityFeePerGas !== "undefined")
    request_rpc.maxPriorityFeePerGas = fromNumber(request.maxPriorityFeePerGas);
  if (typeof request.maxPriorityFeePerGas !== "undefined")
    request_rpc.maxPriorityFeePerGas = fromNumber(request.maxPriorityFeePerGas);
  if (typeof request.nonce !== "undefined")
    request_rpc.nonce = fromNumber(request.nonce);
  if (typeof request.to !== "undefined")
    request_rpc.to = request.to;
  if (typeof request.type !== "undefined")
    request_rpc.type = toRpcType$1[request.type] || request.type;
  if (typeof request.value !== "undefined")
    request_rpc.value = fromNumber(request.value);
  return request_rpc;
}
function toRpc(request) {
  const request_rpc = toRpc$1({
    ...request,
    authorizationList: void 0
  });
  if (request.authorizationList)
    request_rpc.authorizationList = toRpcList(request.authorizationList);
  if (request.calls)
    request_rpc.calls = request.calls.map((call) => ({
      to: call.to ? resolve(call.to) : call.to,
      value: call.value ? fromNumber(call.value) : "0x",
      data: call.data ?? "0x"
    }));
  else if (request.to || request.data || request.value)
    request_rpc.calls = [
      {
        to: request.to ? resolve(request.to) : void 0,
        value: request.value ? fromNumber(request.value) : "0x",
        data: request.data ?? "0x"
      }
    ];
  if (typeof request.feeToken !== "undefined")
    request_rpc.feeToken = toAddress(request.feeToken);
  if (request.keyAuthorization)
    request_rpc.keyAuthorization = toRpc$2(request.keyAuthorization);
  if (typeof request.validBefore !== "undefined")
    request_rpc.validBefore = fromNumber(request.validBefore);
  if (typeof request.validAfter !== "undefined")
    request_rpc.validAfter = fromNumber(request.validAfter);
  const nonceKey = (() => {
    if (request.nonceKey === "random")
      return random(6);
    if (typeof request.nonceKey === "bigint")
      return fromNumber(request.nonceKey);
    return void 0;
  })();
  if (nonceKey)
    request_rpc.nonceKey = nonceKey;
  if (typeof request.calls !== "undefined" || typeof request.feePayer !== "undefined" || typeof request.feeToken !== "undefined" || typeof request.keyAuthorization !== "undefined" || typeof request.nonceKey !== "undefined" || typeof request.validBefore !== "undefined" || typeof request.validAfter !== "undefined" || request.type === "tempo") {
    request_rpc.type = toRpcType.tempo;
    delete request_rpc.data;
    delete request_rpc.input;
    delete request_rpc.to;
    delete request_rpc.value;
  }
  return request_rpc;
}
function fromTupleList(accessList) {
  const list = [];
  for (let i = 0; i < accessList.length; i++) {
    const [address, storageKeys] = accessList[i];
    if (address)
      assert$4(address, { strict: false });
    list.push({
      address,
      storageKeys: storageKeys.map((key) => validate$1(key) ? key : trimLeft(key))
    });
  }
  return list;
}
function toTupleList(accessList) {
  if (!accessList || accessList.length === 0)
    return [];
  const tuple = [];
  for (const { address, storageKeys } of accessList) {
    for (let j = 0; j < storageKeys.length; j++)
      if (size(storageKeys[j]) !== 32)
        throw new InvalidStorageKeySizeError({
          storageKey: storageKeys[j]
        });
    if (address)
      assert$4(address, { strict: false });
    tuple.push([address, storageKeys]);
  }
  return tuple;
}
class InvalidStorageKeySizeError extends BaseError {
  constructor({ storageKey }) {
    super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${size(storageKey)} bytes.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AccessList.InvalidStorageKeySizeError"
    });
  }
}
const exponents = {
  wei: 0,
  gwei: 9,
  szabo: 12,
  finney: 15,
  ether: 18
};
function format(value, decimals = 0) {
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative)
    display = display.slice(1);
  display = display.padStart(decimals, "0");
  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals)
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}
function formatGwei(wei, unit = "wei") {
  return format(wei, exponents.gwei - exponents[unit]);
}
class FeeCapTooHighError extends BaseError {
  constructor({ feeCap } = {}) {
    super(`The fee cap (\`maxFeePerGas\`/\`maxPriorityFeePerGas\`${feeCap ? ` = ${formatGwei(feeCap)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "TransactionEnvelope.FeeCapTooHighError"
    });
  }
}
class InvalidChainIdError extends BaseError {
  constructor({ chainId }) {
    super(typeof chainId !== "undefined" ? `Chain ID "${chainId}" is invalid.` : "Chain ID is invalid.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "TransactionEnvelope.InvalidChainIdError"
    });
  }
}
class InvalidSerializedError2 extends BaseError {
  constructor({ attributes, serialized, type: type2 }) {
    const missing = Object.entries(attributes).map(([key, value]) => typeof value === "undefined" ? key : void 0).filter(Boolean);
    super(`Invalid serialized transaction of type "${type2}" was provided.`, {
      metaMessages: [
        `Serialized Transaction: "${serialized}"`,
        missing.length > 0 ? `Missing Attributes: ${missing.join(", ")}` : ""
      ].filter(Boolean)
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "TransactionEnvelope.InvalidSerializedError"
    });
  }
}
class TipAboveFeeCapError extends BaseError {
  constructor({ maxPriorityFeePerGas, maxFeePerGas } = {}) {
    super([
      `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}).`
    ].join("\n"));
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "TransactionEnvelope.TipAboveFeeCapError"
    });
  }
}
const feePayerMagic = "0x78";
const serializedType = "0x76";
const type = "tempo";
function assert(envelope) {
  const { calls, chainId, maxFeePerGas, maxPriorityFeePerGas, validBefore, validAfter } = envelope;
  if (!calls || calls.length === 0)
    throw new CallsEmptyError();
  if (typeof validBefore === "number" && typeof validAfter === "number" && validBefore <= validAfter) {
    throw new InvalidValidityWindowError({
      validBefore,
      validAfter
    });
  }
  if (calls) {
    for (const call of calls)
      if (call.to)
        assert$4(call.to, { strict: false });
  }
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (maxFeePerGas && BigInt(maxFeePerGas) > 2n ** 256n - 1n)
    throw new FeeCapTooHighError({
      feeCap: maxFeePerGas
    });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({
      maxFeePerGas,
      maxPriorityFeePerGas
    });
}
function deserialize(serialized) {
  const transactionArray = toHex(slice(serialized, 1));
  const [chainId, maxPriorityFeePerGas, maxFeePerGas, gas, calls, accessList, nonceKey, nonce2, validBefore, validAfter, feeToken, feePayerSignatureOrSender, authorizationList, keyAuthorizationOrSignature, maybeSignature] = transactionArray;
  const keyAuthorization = Array.isArray(keyAuthorizationOrSignature) ? keyAuthorizationOrSignature : void 0;
  const signature = keyAuthorization ? maybeSignature : keyAuthorizationOrSignature;
  if (!(transactionArray.length === 13 || transactionArray.length === 14 || transactionArray.length === 15))
    throw new InvalidSerializedError2({
      attributes: {
        authorizationList,
        chainId,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gas,
        calls,
        accessList,
        keyAuthorization,
        nonceKey,
        nonce: nonce2,
        validBefore,
        validAfter,
        feeToken,
        feePayerSignatureOrSender,
        ...transactionArray.length > 12 ? {
          signature
        } : {}
      },
      serialized,
      type
    });
  let transaction = {
    chainId: Number(chainId),
    type
  };
  if (validate$2(gas) && gas !== "0x")
    transaction.gas = BigInt(gas);
  if (validate$2(nonce2))
    transaction.nonce = nonce2 === "0x" ? 0n : BigInt(nonce2);
  if (validate$2(maxFeePerGas) && maxFeePerGas !== "0x")
    transaction.maxFeePerGas = BigInt(maxFeePerGas);
  if (validate$2(maxPriorityFeePerGas) && maxPriorityFeePerGas !== "0x")
    transaction.maxPriorityFeePerGas = BigInt(maxPriorityFeePerGas);
  if (validate$2(nonceKey))
    transaction.nonceKey = nonceKey === "0x" ? 0n : BigInt(nonceKey);
  if (validate$2(validBefore) && validBefore !== "0x")
    transaction.validBefore = Number(validBefore);
  if (validate$2(validAfter) && validAfter !== "0x")
    transaction.validAfter = Number(validAfter);
  if (validate$2(feeToken) && feeToken !== "0x")
    transaction.feeToken = feeToken;
  if (calls && calls !== "0x") {
    const callsArray = calls;
    transaction.calls = callsArray.map((callTuple) => {
      const [to2, value, data] = callTuple;
      const call = {};
      if (to2 && to2 !== "0x")
        call.to = to2;
      if (value && value !== "0x")
        call.value = BigInt(value);
      if (data && data !== "0x")
        call.data = data;
      return call;
    });
  }
  if (accessList?.length !== 0 && accessList !== "0x")
    transaction.accessList = fromTupleList(accessList);
  if (authorizationList?.length !== 0 && authorizationList !== "0x")
    transaction.authorizationList = fromTupleList$1(authorizationList);
  if (feePayerSignatureOrSender !== "0x" && feePayerSignatureOrSender !== void 0) {
    if (feePayerSignatureOrSender === "0x00" || validate(feePayerSignatureOrSender)) {
      transaction.feePayerSignature = null;
      if (validate(feePayerSignatureOrSender))
        transaction.from = feePayerSignatureOrSender;
    } else
      transaction.feePayerSignature = fromTuple$3(feePayerSignatureOrSender);
  }
  if (keyAuthorization)
    transaction.keyAuthorization = fromTuple(keyAuthorization);
  const signatureEnvelope = signature ? deserialize$1(signature) : void 0;
  if (signatureEnvelope)
    transaction = {
      ...transaction,
      signature: signatureEnvelope
    };
  if (!transaction.from && signatureEnvelope) {
    try {
      transaction.from = extractAddress({
        payload: getSignPayload(from(transaction)),
        signature: signatureEnvelope,
        root: true
      });
    } catch {
    }
  }
  assert(transaction);
  return transaction;
}
function from(envelope, options = {}) {
  const { feePayerSignature, signature } = options;
  const envelope_ = typeof envelope === "string" ? deserialize(envelope) : envelope;
  if (envelope_.from)
    envelope_.from = resolve(envelope_.from);
  if (envelope_.calls)
    envelope_.calls = envelope_.calls.map((call) => ({
      ...call,
      ...call.to ? { to: resolve(call.to) } : {}
    }));
  assert(envelope_);
  return {
    ...envelope_,
    ...signature ? { signature: from$3(signature) } : {},
    ...feePayerSignature ? { feePayerSignature: from$a(feePayerSignature) } : {},
    type: "tempo"
  };
}
function serialize$1(envelope, options = {}) {
  const { accessList, authorizationList, calls, chainId, feeToken, gas, keyAuthorization, nonce: nonce2, nonceKey, maxFeePerGas, maxPriorityFeePerGas, validBefore, validAfter } = envelope;
  assert(envelope);
  const accessTupleList = toTupleList(accessList);
  const signature = options.signature || envelope.signature;
  const authorizationTupleList = toTupleList$1(authorizationList);
  const callsTupleList = calls.map((call) => [
    call.to ? resolve(call.to) : "0x",
    call.value ? fromNumber(call.value) : "0x",
    call.data ?? "0x"
  ]);
  let skipFeeToken = false;
  const feePayerSignatureOrSender = (() => {
    if (options.sender)
      return options.sender;
    if (options.format === "feePayer" && signature) {
      const sig = from$3(signature);
      if (sig.type === "keychain")
        return sig.userAddress;
      if (sig.type === "p256" || sig.type === "webAuthn")
        return fromPublicKey(sig.publicKey);
      if (sig.type === "secp256k1")
        return recoverAddress({
          payload: getSignPayload(from(envelope)),
          signature: sig.signature
        });
    }
    const feePayerSignature = typeof options.feePayerSignature !== "undefined" ? options.feePayerSignature : envelope.feePayerSignature;
    if (feePayerSignature === null) {
      skipFeeToken = true;
      return "0x00";
    }
    if (!feePayerSignature)
      return "0x";
    return toTuple$3(feePayerSignature);
  })();
  const serialized = [
    fromNumber(chainId),
    maxPriorityFeePerGas ? fromNumber(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? fromNumber(maxFeePerGas) : "0x",
    gas ? fromNumber(gas) : "0x",
    callsTupleList,
    accessTupleList,
    nonceKey ? fromNumber(nonceKey) : "0x",
    nonce2 ? fromNumber(nonce2) : "0x",
    typeof validBefore === "number" ? fromNumber(validBefore) : "0x",
    typeof validAfter === "number" ? fromNumber(validAfter) : "0x",
    !skipFeeToken && (typeof feeToken === "bigint" || typeof feeToken === "string") ? toAddress(feeToken) : "0x",
    feePayerSignatureOrSender,
    authorizationTupleList,
    ...keyAuthorization ? [toTuple(keyAuthorization)] : [],
    ...signature ? [serialize$2(from$3(signature))] : []
  ];
  return concat$1(options.format === "feePayer" ? feePayerMagic : serializedType, fromHex(serialized));
}
function encodeForSigning(envelope) {
  return serialize$1({
    ...envelope,
    signature: void 0,
    // When a fee payer signature is present, normalize to `null`
    // (the presign marker).
    ...envelope.feePayerSignature !== void 0 ? { feePayerSignature: null } : {}
  });
}
function getSignPayload(envelope, options = {}) {
  const sigHash = hash(envelope, { presign: true });
  if (options.from)
    return keccak256(concat$1("0x04", sigHash, resolve(options.from)));
  return sigHash;
}
function hash(envelope, options = {}) {
  const serialized = options.presign ? encodeForSigning(envelope) : serialize$1(envelope);
  return keccak256(serialized);
}
function getFeePayerSignPayload(envelope, options) {
  const sender = resolve(options.sender);
  const serialized = serialize$1({ ...envelope, signature: void 0 }, {
    sender,
    format: "feePayer"
  });
  return keccak256(serialized);
}
class CallsEmptyError extends BaseError {
  constructor() {
    super("Calls list cannot be empty.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "TxEnvelopeTempo.CallsEmptyError"
    });
  }
}
class InvalidValidityWindowError extends BaseError {
  constructor({ validBefore, validAfter }) {
    super(`validBefore (${validBefore}) must be greater than validAfter (${validAfter}).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "TxEnvelopeTempo.InvalidValidityWindowError"
    });
  }
}
const tip20ChannelReserve = [
  {
    name: "CLOSE_GRACE_PERIOD",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "VOUCHER_TYPEHASH",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "open",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "payee" },
      { type: "address", name: "operator" },
      { type: "address", name: "token" },
      { type: "uint96", name: "deposit" },
      { type: "bytes32", name: "salt" },
      { type: "address", name: "authorizedSigner" }
    ],
    outputs: [{ type: "bytes32", name: "channelId" }]
  },
  {
    name: "settle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "descriptor",
        components: [
          { type: "address", name: "payer" },
          { type: "address", name: "payee" },
          { type: "address", name: "operator" },
          { type: "address", name: "token" },
          { type: "bytes32", name: "salt" },
          { type: "address", name: "authorizedSigner" },
          { type: "bytes32", name: "expiringNonceHash" }
        ]
      },
      { type: "uint96", name: "cumulativeAmount" },
      { type: "bytes", name: "signature" }
    ],
    outputs: []
  },
  {
    name: "topUp",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "descriptor",
        components: [
          { type: "address", name: "payer" },
          { type: "address", name: "payee" },
          { type: "address", name: "operator" },
          { type: "address", name: "token" },
          { type: "bytes32", name: "salt" },
          { type: "address", name: "authorizedSigner" },
          { type: "bytes32", name: "expiringNonceHash" }
        ]
      },
      { type: "uint96", name: "additionalDeposit" }
    ],
    outputs: []
  },
  {
    name: "close",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "descriptor",
        components: [
          { type: "address", name: "payer" },
          { type: "address", name: "payee" },
          { type: "address", name: "operator" },
          { type: "address", name: "token" },
          { type: "bytes32", name: "salt" },
          { type: "address", name: "authorizedSigner" },
          { type: "bytes32", name: "expiringNonceHash" }
        ]
      },
      { type: "uint96", name: "cumulativeAmount" },
      { type: "uint96", name: "captureAmount" },
      { type: "bytes", name: "signature" }
    ],
    outputs: []
  },
  {
    name: "requestClose",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "descriptor",
        components: [
          { type: "address", name: "payer" },
          { type: "address", name: "payee" },
          { type: "address", name: "operator" },
          { type: "address", name: "token" },
          { type: "bytes32", name: "salt" },
          { type: "address", name: "authorizedSigner" },
          { type: "bytes32", name: "expiringNonceHash" }
        ]
      }
    ],
    outputs: []
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "tuple",
        name: "descriptor",
        components: [
          { type: "address", name: "payer" },
          { type: "address", name: "payee" },
          { type: "address", name: "operator" },
          { type: "address", name: "token" },
          { type: "bytes32", name: "salt" },
          { type: "address", name: "authorizedSigner" },
          { type: "bytes32", name: "expiringNonceHash" }
        ]
      }
    ],
    outputs: []
  },
  {
    name: "getChannel",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        type: "tuple",
        name: "descriptor",
        components: [
          { type: "address", name: "payer" },
          { type: "address", name: "payee" },
          { type: "address", name: "operator" },
          { type: "address", name: "token" },
          { type: "bytes32", name: "salt" },
          { type: "address", name: "authorizedSigner" },
          { type: "bytes32", name: "expiringNonceHash" }
        ]
      }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            type: "tuple",
            name: "descriptor",
            components: [
              { type: "address", name: "payer" },
              { type: "address", name: "payee" },
              { type: "address", name: "operator" },
              { type: "address", name: "token" },
              { type: "bytes32", name: "salt" },
              { type: "address", name: "authorizedSigner" },
              { type: "bytes32", name: "expiringNonceHash" }
            ]
          },
          {
            type: "tuple",
            name: "state",
            components: [
              { type: "uint96", name: "settled" },
              { type: "uint96", name: "deposit" },
              { type: "uint32", name: "closeRequestedAt" }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "getChannelState",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32", name: "channelId" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "uint96", name: "settled" },
          { type: "uint96", name: "deposit" },
          { type: "uint32", name: "closeRequestedAt" }
        ]
      }
    ]
  },
  {
    name: "getChannelStatesBatch",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32[]", name: "channelIds" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { type: "uint96", name: "settled" },
          { type: "uint96", name: "deposit" },
          { type: "uint32", name: "closeRequestedAt" }
        ]
      }
    ]
  },
  {
    name: "computeChannelId",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "payer" },
      { type: "address", name: "payee" },
      { type: "address", name: "operator" },
      { type: "address", name: "token" },
      { type: "bytes32", name: "salt" },
      { type: "address", name: "authorizedSigner" },
      { type: "bytes32", name: "expiringNonceHash" }
    ],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "getVoucherDigest",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "bytes32", name: "channelId" },
      { type: "uint96", name: "cumulativeAmount" }
    ],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "domainSeparator",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "ChannelOpened",
    type: "event",
    inputs: [
      { type: "bytes32", name: "channelId", indexed: true },
      { type: "address", name: "payer", indexed: true },
      { type: "address", name: "payee", indexed: true },
      { type: "address", name: "operator" },
      { type: "address", name: "token" },
      { type: "address", name: "authorizedSigner" },
      { type: "bytes32", name: "salt" },
      { type: "bytes32", name: "expiringNonceHash" },
      { type: "uint96", name: "deposit" }
    ]
  },
  {
    name: "Settled",
    type: "event",
    inputs: [
      { type: "bytes32", name: "channelId", indexed: true },
      { type: "address", name: "payer", indexed: true },
      { type: "address", name: "payee", indexed: true },
      { type: "uint96", name: "cumulativeAmount" },
      { type: "uint96", name: "deltaPaid" },
      { type: "uint96", name: "newSettled" }
    ]
  },
  {
    name: "TopUp",
    type: "event",
    inputs: [
      { type: "bytes32", name: "channelId", indexed: true },
      { type: "address", name: "payer", indexed: true },
      { type: "address", name: "payee", indexed: true },
      { type: "uint96", name: "additionalDeposit" },
      { type: "uint96", name: "newDeposit" }
    ]
  },
  {
    name: "CloseRequested",
    type: "event",
    inputs: [
      { type: "bytes32", name: "channelId", indexed: true },
      { type: "address", name: "payer", indexed: true },
      { type: "address", name: "payee", indexed: true },
      { type: "uint256", name: "closeGraceEnd" }
    ]
  },
  {
    name: "ChannelClosed",
    type: "event",
    inputs: [
      { type: "bytes32", name: "channelId", indexed: true },
      { type: "address", name: "payer", indexed: true },
      { type: "address", name: "payee", indexed: true },
      { type: "uint96", name: "settledToPayee" },
      { type: "uint96", name: "refundedToPayer" }
    ]
  },
  {
    name: "CloseRequestCancelled",
    type: "event",
    inputs: [
      { type: "bytes32", name: "channelId", indexed: true },
      { type: "address", name: "payer", indexed: true },
      { type: "address", name: "payee", indexed: true }
    ]
  },
  { name: "ChannelAlreadyExists", type: "error", inputs: [] },
  { name: "ChannelNotFound", type: "error", inputs: [] },
  { name: "NotPayer", type: "error", inputs: [] },
  { name: "NotPayeeOrOperator", type: "error", inputs: [] },
  { name: "InvalidPayee", type: "error", inputs: [] },
  { name: "ZeroDeposit", type: "error", inputs: [] },
  { name: "ExpiringNonceHashNotSet", type: "error", inputs: [] },
  { name: "InvalidSignature", type: "error", inputs: [] },
  { name: "AmountExceedsDeposit", type: "error", inputs: [] },
  { name: "AmountNotIncreasing", type: "error", inputs: [] },
  { name: "CaptureAmountInvalid", type: "error", inputs: [] },
  { name: "CloseNotReady", type: "error", inputs: [] },
  { name: "DepositOverflow", type: "error", inputs: [] }
];
const tip20 = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "uint8" }]
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "quoteToken",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }]
  },
  {
    name: "nextQuoteToken",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }]
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" }
    ],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ],
    outputs: []
  },
  {
    name: "burn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "amount" }],
    outputs: []
  },
  {
    name: "currency",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    name: "supplyCap",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "paused",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }]
  },
  {
    name: "transferPolicyId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "logoURI",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    name: "setLogoURI",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "string", name: "newLogoURI" }],
    outputs: []
  },
  {
    name: "burnBlocked",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "uint256", name: "amount" }
    ],
    outputs: []
  },
  {
    name: "mintWithMemo",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: []
  },
  {
    name: "burnWithMemo",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: []
  },
  {
    name: "transferWithMemo",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: []
  },
  {
    name: "transferFromWithMemo",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "changeTransferPolicyId",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint64", name: "newPolicyId" }],
    outputs: []
  },
  {
    name: "setSupplyCap",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "newSupplyCap" }],
    outputs: []
  },
  {
    name: "pause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "unpause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "setNextQuoteToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "newQuoteToken" }],
    outputs: []
  },
  {
    name: "completeQuoteTokenUpdate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "PAUSE_ROLE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "UNPAUSE_ROLE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "ISSUER_ROLE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "BURN_BLOCKED_ROLE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "permit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" },
      { type: "uint256", name: "value" },
      { type: "uint256", name: "deadline" },
      { type: "uint8", name: "v" },
      { type: "bytes32", name: "r" },
      { type: "bytes32", name: "s" }
    ],
    outputs: []
  },
  {
    name: "nonces",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "owner" }],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "DOMAIN_SEPARATOR",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "distributeReward",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint256", name: "amount" }],
    outputs: []
  },
  {
    name: "setRewardRecipient",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "recipient" }],
    outputs: []
  },
  {
    name: "claimRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "optedInSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint128" }]
  },
  {
    name: "globalRewardPerToken",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "userRewardInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "address", name: "rewardRecipient" },
          { type: "uint256", name: "rewardPerToken" },
          { type: "uint256", name: "rewardBalance" }
        ]
      }
    ]
  },
  {
    name: "getPendingRewards",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint128" }]
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "amount" }
    ]
  },
  {
    name: "Approval",
    type: "event",
    inputs: [
      { type: "address", name: "owner", indexed: true },
      { type: "address", name: "spender", indexed: true },
      { type: "uint256", name: "amount" }
    ]
  },
  {
    name: "Mint",
    type: "event",
    inputs: [
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "amount" }
    ]
  },
  {
    name: "Burn",
    type: "event",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "uint256", name: "amount" }
    ]
  },
  {
    name: "BurnBlocked",
    type: "event",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "uint256", name: "amount" }
    ]
  },
  {
    name: "TransferWithMemo",
    type: "event",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "amount" },
      { type: "bytes32", name: "memo", indexed: true }
    ]
  },
  {
    name: "TransferPolicyUpdate",
    type: "event",
    inputs: [
      { type: "address", name: "updater", indexed: true },
      { type: "uint64", name: "newPolicyId", indexed: true }
    ]
  },
  {
    name: "SupplyCapUpdate",
    type: "event",
    inputs: [
      { type: "address", name: "updater", indexed: true },
      { type: "uint256", name: "newSupplyCap", indexed: true }
    ]
  },
  {
    name: "PauseStateUpdate",
    type: "event",
    inputs: [
      { type: "address", name: "updater", indexed: true },
      { type: "bool", name: "isPaused" }
    ]
  },
  {
    name: "NextQuoteTokenSet",
    type: "event",
    inputs: [
      { type: "address", name: "updater", indexed: true },
      { type: "address", name: "nextQuoteToken", indexed: true }
    ]
  },
  {
    name: "QuoteTokenUpdate",
    type: "event",
    inputs: [
      { type: "address", name: "updater", indexed: true },
      { type: "address", name: "newQuoteToken", indexed: true }
    ]
  },
  {
    name: "RewardDistributed",
    type: "event",
    inputs: [
      { type: "address", name: "funder", indexed: true },
      { type: "uint256", name: "amount" }
    ]
  },
  {
    name: "RewardRecipientSet",
    type: "event",
    inputs: [
      { type: "address", name: "holder", indexed: true },
      { type: "address", name: "recipient", indexed: true }
    ]
  },
  {
    name: "LogoURIUpdated",
    type: "event",
    inputs: [
      { type: "address", name: "updater", indexed: true },
      { type: "string", name: "newLogoURI" }
    ]
  },
  {
    name: "InsufficientBalance",
    type: "error",
    inputs: [
      { type: "uint256", name: "available" },
      { type: "uint256", name: "required" },
      { type: "address", name: "token" }
    ]
  },
  { name: "InsufficientAllowance", type: "error", inputs: [] },
  { name: "SupplyCapExceeded", type: "error", inputs: [] },
  { name: "InvalidSupplyCap", type: "error", inputs: [] },
  { name: "InvalidPayload", type: "error", inputs: [] },
  { name: "PolicyForbids", type: "error", inputs: [] },
  { name: "InvalidRecipient", type: "error", inputs: [] },
  { name: "ContractPaused", type: "error", inputs: [] },
  { name: "InvalidCurrency", type: "error", inputs: [] },
  { name: "InvalidQuoteToken", type: "error", inputs: [] },
  { name: "InvalidAmount", type: "error", inputs: [] },
  { name: "NoOptedInSupply", type: "error", inputs: [] },
  { name: "Unauthorized", type: "error", inputs: [] },
  { name: "ProtectedAddress", type: "error", inputs: [] },
  { name: "InvalidToken", type: "error", inputs: [] },
  { name: "Uninitialized", type: "error", inputs: [] },
  { name: "InvalidTransferPolicyId", type: "error", inputs: [] },
  { name: "PermitExpired", type: "error", inputs: [] },
  { name: "InvalidSignature", type: "error", inputs: [] },
  { name: "LogoURITooLong", type: "error", inputs: [] },
  { name: "InvalidLogoURI", type: "error", inputs: [] },
  {
    name: "hasRole",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "bytes32", name: "role" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "getRoleAdmin",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32", name: "role" }],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "grantRole",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "bytes32", name: "role" },
      { type: "address", name: "account" }
    ],
    outputs: []
  },
  {
    name: "revokeRole",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "bytes32", name: "role" },
      { type: "address", name: "account" }
    ],
    outputs: []
  },
  {
    name: "renounceRole",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "bytes32", name: "role" }],
    outputs: []
  },
  {
    name: "setRoleAdmin",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "bytes32", name: "role" },
      { type: "bytes32", name: "adminRole" }
    ],
    outputs: []
  },
  {
    name: "RoleMembershipUpdated",
    type: "event",
    inputs: [
      { type: "bytes32", name: "role", indexed: true },
      { type: "address", name: "account", indexed: true },
      { type: "address", name: "sender", indexed: true },
      { type: "bool", name: "hasRole" }
    ]
  },
  {
    name: "RoleAdminUpdated",
    type: "event",
    inputs: [
      { type: "bytes32", name: "role", indexed: true },
      { type: "bytes32", name: "newAdminRole", indexed: true },
      { type: "address", name: "sender", indexed: true }
    ]
  },
  { name: "Unauthorized", type: "error", inputs: [] }
];
const validatorConfigV2 = [
  {
    name: "getActiveValidators",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        name: "validators",
        components: [
          { type: "bytes32", name: "publicKey" },
          { type: "address", name: "validatorAddress" },
          { type: "string", name: "ingress" },
          { type: "string", name: "egress" },
          { type: "address", name: "feeRecipient" },
          { type: "uint64", name: "index" },
          { type: "uint64", name: "addedAtHeight" },
          { type: "uint64", name: "deactivatedAtHeight" }
        ]
      }
    ]
  },
  {
    name: "getInitializedAtHeight",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }]
  },
  {
    name: "validatorCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "validatorByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint64", name: "index" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "bytes32", name: "publicKey" },
          { type: "address", name: "validatorAddress" },
          { type: "string", name: "ingress" },
          { type: "string", name: "egress" },
          { type: "address", name: "feeRecipient" },
          { type: "uint64", name: "index" },
          { type: "uint64", name: "addedAtHeight" },
          { type: "uint64", name: "deactivatedAtHeight" }
        ]
      }
    ]
  },
  {
    name: "validatorByAddress",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "validatorAddress" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "bytes32", name: "publicKey" },
          { type: "address", name: "validatorAddress" },
          { type: "string", name: "ingress" },
          { type: "string", name: "egress" },
          { type: "address", name: "feeRecipient" },
          { type: "uint64", name: "index" },
          { type: "uint64", name: "addedAtHeight" },
          { type: "uint64", name: "deactivatedAtHeight" }
        ]
      }
    ]
  },
  {
    name: "validatorByPublicKey",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32", name: "publicKey" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "bytes32", name: "publicKey" },
          { type: "address", name: "validatorAddress" },
          { type: "string", name: "ingress" },
          { type: "string", name: "egress" },
          { type: "address", name: "feeRecipient" },
          { type: "uint64", name: "index" },
          { type: "uint64", name: "addedAtHeight" },
          { type: "uint64", name: "deactivatedAtHeight" }
        ]
      }
    ]
  },
  {
    name: "getNextNetworkIdentityRotationEpoch",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "isInitialized",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }]
  },
  {
    name: "addValidator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "validatorAddress" },
      { type: "bytes32", name: "publicKey" },
      { type: "string", name: "ingress" },
      { type: "string", name: "egress" },
      { type: "address", name: "feeRecipient" },
      { type: "bytes", name: "signature" }
    ],
    outputs: [{ type: "uint64", name: "index" }]
  },
  {
    name: "deactivateValidator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint64", name: "idx" }],
    outputs: []
  },
  {
    name: "rotateValidator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "idx" },
      { type: "bytes32", name: "publicKey" },
      { type: "string", name: "ingress" },
      { type: "string", name: "egress" },
      { type: "bytes", name: "signature" }
    ],
    outputs: []
  },
  {
    name: "setFeeRecipient",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "idx" },
      { type: "address", name: "feeRecipient" }
    ],
    outputs: []
  },
  {
    name: "setIpAddresses",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "idx" },
      { type: "string", name: "ingress" },
      { type: "string", name: "egress" }
    ],
    outputs: []
  },
  {
    name: "transferValidatorOwnership",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "idx" },
      { type: "address", name: "newAddress" }
    ],
    outputs: []
  },
  {
    name: "transferOwnership",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "newOwner" }],
    outputs: []
  },
  {
    name: "setNetworkIdentityRotationEpoch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint64", name: "epoch" }],
    outputs: []
  },
  {
    name: "migrateValidator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint64", name: "idx" }],
    outputs: []
  },
  {
    name: "initializeIfMigrated",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "ValidatorAdded",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "address", name: "validatorAddress", indexed: true },
      { type: "bytes32", name: "publicKey" },
      { type: "string", name: "ingress" },
      { type: "string", name: "egress" },
      { type: "address", name: "feeRecipient" }
    ]
  },
  {
    name: "ValidatorDeactivated",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "address", name: "validatorAddress", indexed: true }
    ]
  },
  {
    name: "ValidatorRotated",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "uint64", name: "deactivatedIndex", indexed: true },
      { type: "address", name: "validatorAddress", indexed: true },
      { type: "bytes32", name: "oldPublicKey" },
      { type: "bytes32", name: "newPublicKey" },
      { type: "string", name: "ingress" },
      { type: "string", name: "egress" },
      { type: "address", name: "caller" }
    ]
  },
  {
    name: "FeeRecipientUpdated",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "address", name: "feeRecipient" },
      { type: "address", name: "caller" }
    ]
  },
  {
    name: "IpAddressesUpdated",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "string", name: "ingress" },
      { type: "string", name: "egress" },
      { type: "address", name: "caller" }
    ]
  },
  {
    name: "ValidatorOwnershipTransferred",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "address", name: "oldAddress", indexed: true },
      { type: "address", name: "newAddress", indexed: true },
      { type: "address", name: "caller" }
    ]
  },
  {
    name: "OwnershipTransferred",
    type: "event",
    inputs: [
      { type: "address", name: "oldOwner", indexed: true },
      { type: "address", name: "newOwner", indexed: true }
    ]
  },
  {
    name: "ValidatorMigrated",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "address", name: "validatorAddress", indexed: true },
      { type: "bytes32", name: "publicKey" }
    ]
  },
  {
    name: "NetworkIdentityRotationEpochSet",
    type: "event",
    inputs: [
      { type: "uint64", name: "previousEpoch", indexed: true },
      { type: "uint64", name: "nextEpoch", indexed: true }
    ]
  },
  {
    name: "Initialized",
    type: "event",
    inputs: [{ type: "uint64", name: "height" }]
  },
  {
    name: "SkippedValidatorMigration",
    type: "event",
    inputs: [
      { type: "uint64", name: "index", indexed: true },
      { type: "address", name: "validatorAddress", indexed: true },
      { type: "bytes32", name: "publicKey" }
    ]
  },
  { name: "AlreadyInitialized", type: "error", inputs: [] },
  {
    name: "IngressAlreadyExists",
    type: "error",
    inputs: [{ type: "string", name: "ingress" }]
  },
  { name: "EmptyV1ValidatorSet", type: "error", inputs: [] },
  { name: "InvalidMigrationIndex", type: "error", inputs: [] },
  { name: "InvalidOwner", type: "error", inputs: [] },
  { name: "InvalidPublicKey", type: "error", inputs: [] },
  { name: "InvalidSignature", type: "error", inputs: [] },
  { name: "InvalidSignatureFormat", type: "error", inputs: [] },
  { name: "InvalidValidatorAddress", type: "error", inputs: [] },
  { name: "MigrationNotComplete", type: "error", inputs: [] },
  { name: "NotInitialized", type: "error", inputs: [] },
  {
    name: "NotIp",
    type: "error",
    inputs: [
      { type: "string", name: "input" },
      { type: "string", name: "backtrace" }
    ]
  },
  {
    name: "NotIpPort",
    type: "error",
    inputs: [
      { type: "string", name: "input" },
      { type: "string", name: "backtrace" }
    ]
  },
  { name: "PublicKeyAlreadyExists", type: "error", inputs: [] },
  { name: "Unauthorized", type: "error", inputs: [] },
  { name: "AddressAlreadyHasValidator", type: "error", inputs: [] },
  { name: "ValidatorAlreadyDeactivated", type: "error", inputs: [] },
  { name: "ValidatorNotFound", type: "error", inputs: [] }
];
const signatureVerifier$1 = [
  {
    name: "recover",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "bytes32", name: "hash" },
      { type: "bytes", name: "signature" }
    ],
    outputs: [{ type: "address", name: "signer" }]
  },
  {
    name: "verify",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "signer" },
      { type: "bytes32", name: "hash" },
      { type: "bytes", name: "signature" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "verifyKeychain",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "bytes32", name: "hash" },
      { type: "bytes", name: "signature" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "verifyKeychainAdmin",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "bytes32", name: "hash" },
      { type: "bytes", name: "signature" }
    ],
    outputs: [{ type: "bool" }]
  },
  { name: "InvalidFormat", type: "error", inputs: [] },
  { name: "InvalidSignature", type: "error", inputs: [] }
];
const stablecoinDex = [
  {
    name: "createPair",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "base" }],
    outputs: [{ type: "bytes32", name: "key" }]
  },
  {
    name: "place",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "token" },
      { type: "uint128", name: "amount" },
      { type: "bool", name: "isBid" },
      { type: "int16", name: "tick" }
    ],
    outputs: [{ type: "uint128", name: "orderId" }]
  },
  {
    name: "placeFlip",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "token" },
      { type: "uint128", name: "amount" },
      { type: "bool", name: "isBid" },
      { type: "int16", name: "tick" },
      { type: "int16", name: "flipTick" }
    ],
    outputs: [{ type: "uint128", name: "orderId" }]
  },
  {
    name: "cancel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint128", name: "orderId" }],
    outputs: []
  },
  {
    name: "cancelStaleOrder",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint128", name: "orderId" }],
    outputs: []
  },
  {
    name: "swapExactAmountIn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "tokenIn" },
      { type: "address", name: "tokenOut" },
      { type: "uint128", name: "amountIn" },
      { type: "uint128", name: "minAmountOut" }
    ],
    outputs: [{ type: "uint128", name: "amountOut" }]
  },
  {
    name: "swapExactAmountOut",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "tokenIn" },
      { type: "address", name: "tokenOut" },
      { type: "uint128", name: "amountOut" },
      { type: "uint128", name: "maxAmountIn" }
    ],
    outputs: [{ type: "uint128", name: "amountIn" }]
  },
  {
    name: "quoteSwapExactAmountIn",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "tokenIn" },
      { type: "address", name: "tokenOut" },
      { type: "uint128", name: "amountIn" }
    ],
    outputs: [{ type: "uint128", name: "amountOut" }]
  },
  {
    name: "quoteSwapExactAmountOut",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "tokenIn" },
      { type: "address", name: "tokenOut" },
      { type: "uint128", name: "amountOut" }
    ],
    outputs: [{ type: "uint128", name: "amountIn" }]
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "user" },
      { type: "address", name: "token" }
    ],
    outputs: [{ type: "uint128" }]
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "token" },
      { type: "uint128", name: "amount" }
    ],
    outputs: []
  },
  {
    name: "getOrder",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint128", name: "orderId" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "uint128", name: "orderId" },
          { type: "address", name: "maker" },
          { type: "bytes32", name: "bookKey" },
          { type: "bool", name: "isBid" },
          { type: "int16", name: "tick" },
          { type: "uint128", name: "amount" },
          { type: "uint128", name: "remaining" },
          { type: "uint128", name: "prev" },
          { type: "uint128", name: "next" },
          { type: "bool", name: "isFlip" },
          { type: "int16", name: "flipTick" }
        ]
      }
    ]
  },
  {
    name: "getTickLevel",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "base" },
      { type: "int16", name: "tick" },
      { type: "bool", name: "isBid" }
    ],
    outputs: [
      { type: "uint128", name: "head" },
      { type: "uint128", name: "tail" },
      { type: "uint128", name: "totalLiquidity" }
    ]
  },
  {
    name: "pairKey",
    type: "function",
    stateMutability: "pure",
    inputs: [
      { type: "address", name: "tokenA" },
      { type: "address", name: "tokenB" }
    ],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "nextOrderId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint128" }]
  },
  {
    name: "books",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32", name: "pairKey" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "address", name: "base" },
          { type: "address", name: "quote" },
          { type: "int16", name: "bestBidTick" },
          { type: "int16", name: "bestAskTick" }
        ]
      }
    ]
  },
  {
    name: "MIN_TICK",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "int16" }]
  },
  {
    name: "MAX_TICK",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "int16" }]
  },
  {
    name: "TICK_SPACING",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "int16" }]
  },
  {
    name: "PRICE_SCALE",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "uint32" }]
  },
  {
    name: "MIN_ORDER_AMOUNT",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "uint128" }]
  },
  {
    name: "MIN_PRICE",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "uint32" }]
  },
  {
    name: "MAX_PRICE",
    type: "function",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ type: "uint32" }]
  },
  {
    name: "tickToPrice",
    type: "function",
    stateMutability: "pure",
    inputs: [{ type: "int16", name: "tick" }],
    outputs: [{ type: "uint32", name: "price" }]
  },
  {
    name: "priceToTick",
    type: "function",
    stateMutability: "pure",
    inputs: [{ type: "uint32", name: "price" }],
    outputs: [{ type: "int16", name: "tick" }]
  },
  {
    name: "PairCreated",
    type: "event",
    inputs: [
      { type: "bytes32", name: "key", indexed: true },
      { type: "address", name: "base", indexed: true },
      { type: "address", name: "quote", indexed: true }
    ]
  },
  {
    name: "OrderPlaced",
    type: "event",
    inputs: [
      { type: "uint128", name: "orderId", indexed: true },
      { type: "address", name: "maker", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "uint128", name: "amount" },
      { type: "bool", name: "isBid" },
      { type: "int16", name: "tick" },
      { type: "bool", name: "isFlipOrder" },
      { type: "int16", name: "flipTick" }
    ]
  },
  {
    name: "OrderFilled",
    type: "event",
    inputs: [
      { type: "uint128", name: "orderId", indexed: true },
      { type: "address", name: "maker", indexed: true },
      { type: "address", name: "taker", indexed: true },
      { type: "uint128", name: "amountFilled" },
      { type: "bool", name: "partialFill" }
    ]
  },
  {
    name: "OrderFlipped",
    type: "event",
    inputs: [
      { type: "uint128", name: "orderId", indexed: true },
      { type: "address", name: "maker", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "uint128", name: "amount" },
      { type: "bool", name: "isBid" },
      { type: "int16", name: "tick" },
      { type: "int16", name: "flipTick" }
    ]
  },
  {
    name: "FlipFailed",
    type: "event",
    inputs: [
      { type: "uint128", name: "orderId", indexed: true },
      { type: "address", name: "maker", indexed: true },
      { type: "bytes4", name: "reason" }
    ]
  },
  {
    name: "OrderCancelled",
    type: "event",
    inputs: [{ type: "uint128", name: "orderId", indexed: true }]
  },
  { name: "Unauthorized", type: "error", inputs: [] },
  { name: "PairDoesNotExist", type: "error", inputs: [] },
  { name: "PairAlreadyExists", type: "error", inputs: [] },
  { name: "OrderDoesNotExist", type: "error", inputs: [] },
  { name: "IdenticalTokens", type: "error", inputs: [] },
  { name: "InvalidToken", type: "error", inputs: [] },
  {
    name: "TickOutOfBounds",
    type: "error",
    inputs: [{ type: "int16", name: "tick" }]
  },
  { name: "InvalidTick", type: "error", inputs: [] },
  { name: "InvalidFlipTick", type: "error", inputs: [] },
  { name: "InsufficientBalance", type: "error", inputs: [] },
  { name: "InsufficientLiquidity", type: "error", inputs: [] },
  { name: "InsufficientOutput", type: "error", inputs: [] },
  { name: "MaxInputExceeded", type: "error", inputs: [] },
  {
    name: "BelowMinimumOrderSize",
    type: "error",
    inputs: [{ type: "uint128", name: "amount" }]
  },
  { name: "InvalidBaseToken", type: "error", inputs: [] },
  { name: "OrderNotStale", type: "error", inputs: [] }
];
const addressRegistry = [
  {
    name: "registerVirtualMaster",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "bytes32", name: "salt" }],
    outputs: [{ type: "bytes4", name: "masterId" }]
  },
  {
    name: "getMaster",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes4", name: "masterId" }],
    outputs: [{ type: "address" }]
  },
  {
    name: "resolveRecipient",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "to" }],
    outputs: [{ type: "address", name: "effectiveRecipient" }]
  },
  {
    name: "resolveVirtualAddress",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "virtualAddr" }],
    outputs: [{ type: "address", name: "master" }]
  },
  {
    name: "isVirtualAddress",
    type: "function",
    stateMutability: "pure",
    inputs: [{ type: "address", name: "addr" }],
    outputs: [{ type: "bool" }]
  },
  {
    name: "decodeVirtualAddress",
    type: "function",
    stateMutability: "pure",
    inputs: [{ type: "address", name: "addr" }],
    outputs: [
      { type: "bool", name: "isVirtual" },
      { type: "bytes4", name: "masterId" },
      { type: "bytes6", name: "userTag" }
    ]
  },
  {
    name: "isImplicitlyApproved",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "addr" }],
    outputs: [{ type: "bool" }]
  },
  {
    name: "MasterRegistered",
    type: "event",
    inputs: [
      { type: "bytes4", name: "masterId", indexed: true },
      { type: "address", name: "masterAddress", indexed: true }
    ]
  },
  {
    name: "MasterIdCollision",
    type: "error",
    inputs: [{ type: "address", name: "master" }]
  },
  { name: "InvalidMasterAddress", type: "error", inputs: [] },
  { name: "ProofOfWorkFailed", type: "error", inputs: [] },
  { name: "VirtualAddressUnregistered", type: "error", inputs: [] }
];
const feeManager = [
  {
    name: "userTokens",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "user" }],
    outputs: [{ type: "address" }]
  },
  {
    name: "validatorTokens",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "validator" }],
    outputs: [{ type: "address" }]
  },
  {
    name: "setUserToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "token" }],
    outputs: []
  },
  {
    name: "setValidatorToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "token" }],
    outputs: []
  },
  {
    name: "distributeFees",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "validator" },
      { type: "address", name: "token" }
    ],
    outputs: []
  },
  {
    name: "collectedFees",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "validator" },
      { type: "address", name: "token" }
    ],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "UserTokenSet",
    type: "event",
    inputs: [
      { type: "address", name: "user", indexed: true },
      { type: "address", name: "token", indexed: true }
    ]
  },
  {
    name: "ValidatorTokenSet",
    type: "event",
    inputs: [
      { type: "address", name: "validator", indexed: true },
      { type: "address", name: "token", indexed: true }
    ]
  },
  {
    name: "FeesDistributed",
    type: "event",
    inputs: [
      { type: "address", name: "validator", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "uint256", name: "amount" }
    ]
  },
  { name: "InvalidToken", type: "error", inputs: [] },
  { name: "InsufficientFeeTokenBalance", type: "error", inputs: [] },
  { name: "CannotChangeWithinBlock", type: "error", inputs: [] }
];
const feeAmm = [
  {
    name: "M",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "N",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "SCALE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "MIN_LIQUIDITY",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "getPoolId",
    type: "function",
    stateMutability: "pure",
    inputs: [
      { type: "address", name: "userToken" },
      { type: "address", name: "validatorToken" }
    ],
    outputs: [{ type: "bytes32" }]
  },
  {
    name: "getPool",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "userToken" },
      { type: "address", name: "validatorToken" }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "uint128", name: "reserveUserToken" },
          { type: "uint128", name: "reserveValidatorToken" }
        ]
      }
    ]
  },
  {
    name: "pools",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32", name: "poolId" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "uint128", name: "reserveUserToken" },
          { type: "uint128", name: "reserveValidatorToken" }
        ]
      }
    ]
  },
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "userToken" },
      { type: "address", name: "validatorToken" },
      { type: "uint256", name: "amountValidatorToken" },
      { type: "address", name: "to" }
    ],
    outputs: [{ type: "uint256", name: "liquidity" }]
  },
  {
    name: "burn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "userToken" },
      { type: "address", name: "validatorToken" },
      { type: "uint256", name: "liquidity" },
      { type: "address", name: "to" }
    ],
    outputs: [
      { type: "uint256", name: "amountUserToken" },
      { type: "uint256", name: "amountValidatorToken" }
    ]
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes32", name: "poolId" }],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "liquidityBalances",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "bytes32", name: "poolId" },
      { type: "address", name: "user" }
    ],
    outputs: [{ type: "uint256" }]
  },
  {
    name: "rebalanceSwap",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "userToken" },
      { type: "address", name: "validatorToken" },
      { type: "uint256", name: "amountOut" },
      { type: "address", name: "to" }
    ],
    outputs: [{ type: "uint256", name: "amountIn" }]
  },
  {
    name: "Mint",
    type: "event",
    inputs: [
      { type: "address", name: "sender" },
      { type: "address", name: "to", indexed: true },
      { type: "address", name: "userToken", indexed: true },
      { type: "address", name: "validatorToken", indexed: true },
      { type: "uint256", name: "amountValidatorToken" },
      { type: "uint256", name: "liquidity" }
    ]
  },
  {
    name: "Burn",
    type: "event",
    inputs: [
      { type: "address", name: "sender", indexed: true },
      { type: "address", name: "userToken", indexed: true },
      { type: "address", name: "validatorToken", indexed: true },
      { type: "uint256", name: "amountUserToken" },
      { type: "uint256", name: "amountValidatorToken" },
      { type: "uint256", name: "liquidity" },
      { type: "address", name: "to" }
    ]
  },
  {
    name: "RebalanceSwap",
    type: "event",
    inputs: [
      { type: "address", name: "userToken", indexed: true },
      { type: "address", name: "validatorToken", indexed: true },
      { type: "address", name: "swapper", indexed: true },
      { type: "uint256", name: "amountIn" },
      { type: "uint256", name: "amountOut" }
    ]
  },
  { name: "IdenticalAddresses", type: "error", inputs: [] },
  { name: "InvalidToken", type: "error", inputs: [] },
  { name: "InsufficientLiquidity", type: "error", inputs: [] },
  { name: "InsufficientReserves", type: "error", inputs: [] },
  { name: "InvalidAmount", type: "error", inputs: [] },
  { name: "DivisionByZero", type: "error", inputs: [] },
  { name: "InvalidSwapCalculation", type: "error", inputs: [] }
];
const receivePolicyGuard = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "bytes", name: "receipt" }],
    outputs: [{ type: "uint256", name: "amount" }]
  },
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "to" },
      { type: "bytes", name: "receipt" }
    ],
    outputs: []
  },
  {
    name: "burnBlockedReceipt",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "bytes", name: "receipt" }],
    outputs: []
  },
  {
    name: "TransferBlocked",
    type: "event",
    inputs: [
      { type: "address", name: "token", indexed: true },
      { type: "address", name: "receiver", indexed: true },
      { type: "uint64", name: "blockedNonce", indexed: true },
      { type: "uint256", name: "amount" },
      { type: "uint8", name: "receiptVersion" },
      { type: "bytes", name: "receipt" }
    ]
  },
  {
    name: "ReceiptClaimed",
    type: "event",
    inputs: [
      { type: "address", name: "token", indexed: true },
      { type: "address", name: "receiver", indexed: true },
      { type: "uint64", name: "blockedNonce", indexed: true },
      { type: "uint64", name: "blockedAt" },
      { type: "uint8", name: "receiptVersion" },
      { type: "address", name: "originator" },
      { type: "address", name: "recipient" },
      { type: "address", name: "recoveryAuthority" },
      { type: "address", name: "caller" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" }
    ]
  },
  {
    name: "ReceiptBurned",
    type: "event",
    inputs: [
      { type: "address", name: "token", indexed: true },
      { type: "address", name: "receiver", indexed: true },
      { type: "uint64", name: "blockedNonce", indexed: true },
      { type: "uint64", name: "blockedAt" },
      { type: "uint8", name: "receiptVersion" },
      { type: "address", name: "originator" },
      { type: "address", name: "recipient" },
      { type: "address", name: "recoveryAuthority" },
      { type: "address", name: "caller" },
      { type: "uint256", name: "amount" }
    ]
  },
  { name: "InvalidReceipt", type: "error", inputs: [] },
  { name: "InvalidClaimAddress", type: "error", inputs: [] },
  { name: "UnauthorizedClaimer", type: "error", inputs: [] },
  { name: "AddressReserved", type: "error", inputs: [] }
];
const accountKeychain$1 = [
  {
    name: "authorizeKey",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "keyId" },
      { type: "uint8", name: "signatureType" },
      { type: "uint64", name: "expiry" },
      { type: "bool", name: "enforceLimits" },
      {
        type: "tuple[]",
        name: "limits",
        components: [
          { type: "address", name: "token" },
          { type: "uint256", name: "amount" }
        ]
      }
    ],
    outputs: []
  },
  {
    name: "authorizeKey",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "keyId" },
      { type: "uint8", name: "signatureType" },
      {
        type: "tuple",
        name: "config",
        components: [
          { type: "uint64", name: "expiry" },
          { type: "bool", name: "enforceLimits" },
          {
            type: "tuple[]",
            name: "limits",
            components: [
              { type: "address", name: "token" },
              { type: "uint256", name: "amount" },
              { type: "uint64", name: "period" }
            ]
          },
          { type: "bool", name: "allowAnyCalls" },
          {
            type: "tuple[]",
            name: "allowedCalls",
            components: [
              { type: "address", name: "target" },
              {
                type: "tuple[]",
                name: "selectorRules",
                components: [
                  { type: "bytes4", name: "selector" },
                  { type: "address[]", name: "recipients" }
                ]
              }
            ]
          }
        ]
      }
    ],
    outputs: []
  },
  {
    name: "authorizeKey",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "keyId" },
      { type: "uint8", name: "signatureType" },
      {
        type: "tuple",
        name: "config",
        components: [
          { type: "uint64", name: "expiry" },
          { type: "bool", name: "enforceLimits" },
          {
            type: "tuple[]",
            name: "limits",
            components: [
              { type: "address", name: "token" },
              { type: "uint256", name: "amount" },
              { type: "uint64", name: "period" }
            ]
          },
          { type: "bool", name: "allowAnyCalls" },
          {
            type: "tuple[]",
            name: "allowedCalls",
            components: [
              { type: "address", name: "target" },
              {
                type: "tuple[]",
                name: "selectorRules",
                components: [
                  { type: "bytes4", name: "selector" },
                  { type: "address[]", name: "recipients" }
                ]
              }
            ]
          }
        ]
      },
      { type: "bytes32", name: "witness" }
    ],
    outputs: []
  },
  {
    name: "authorizeAdminKey",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "keyId" },
      { type: "uint8", name: "signatureType" },
      { type: "bytes32", name: "witness" }
    ],
    outputs: []
  },
  {
    name: "burnKeyAuthorizationWitness",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "bytes32", name: "witness" }],
    outputs: []
  },
  {
    name: "revokeKey",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "keyId" }],
    outputs: []
  },
  {
    name: "updateSpendingLimit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "keyId" },
      { type: "address", name: "token" },
      { type: "uint256", name: "newLimit" }
    ],
    outputs: []
  },
  {
    name: "setAllowedCalls",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "keyId" },
      {
        type: "tuple[]",
        name: "scopes",
        components: [
          { type: "address", name: "target" },
          {
            type: "tuple[]",
            name: "selectorRules",
            components: [
              { type: "bytes4", name: "selector" },
              { type: "address[]", name: "recipients" }
            ]
          }
        ]
      }
    ],
    outputs: []
  },
  {
    name: "removeAllowedCalls",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "keyId" },
      { type: "address", name: "target" }
    ],
    outputs: []
  },
  {
    name: "getKey",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "address", name: "keyId" }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "uint8", name: "signatureType" },
          { type: "address", name: "keyId" },
          { type: "uint64", name: "expiry" },
          { type: "bool", name: "enforceLimits" },
          { type: "bool", name: "isRevoked" }
        ]
      }
    ]
  },
  {
    name: "getRemainingLimit",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "address", name: "keyId" },
      { type: "address", name: "token" }
    ],
    outputs: [{ type: "uint256", name: "remaining" }]
  },
  {
    name: "getRemainingLimitWithPeriod",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "address", name: "keyId" },
      { type: "address", name: "token" }
    ],
    outputs: [
      { type: "uint256", name: "remaining" },
      { type: "uint64", name: "periodEnd" }
    ]
  },
  {
    name: "getAllowedCalls",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "address", name: "keyId" }
    ],
    outputs: [
      { type: "bool", name: "isScoped" },
      {
        type: "tuple[]",
        name: "scopes",
        components: [
          { type: "address", name: "target" },
          {
            type: "tuple[]",
            name: "selectorRules",
            components: [
              { type: "bytes4", name: "selector" },
              { type: "address[]", name: "recipients" }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "isKeyAuthorizationWitnessBurned",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "bytes32", name: "witness" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "isAdminKey",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "address", name: "keyId" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "getTransactionKey",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }]
  },
  {
    name: "KeyAuthorized",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "address", name: "publicKey", indexed: true },
      { type: "uint8", name: "signatureType" },
      { type: "uint64", name: "expiry" }
    ]
  },
  {
    name: "AdminKeyAuthorized",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "address", name: "publicKey", indexed: true }
    ]
  },
  {
    name: "KeyRevoked",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "address", name: "publicKey", indexed: true }
    ]
  },
  {
    name: "SpendingLimitUpdated",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "address", name: "publicKey", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "uint256", name: "newLimit" }
    ]
  },
  {
    name: "AccessKeySpend",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "address", name: "publicKey", indexed: true },
      { type: "address", name: "token", indexed: true },
      { type: "uint256", name: "amount" },
      { type: "uint256", name: "remainingLimit" }
    ]
  },
  {
    name: "KeyAuthorizationWitness",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "bytes32", name: "witness", indexed: true }
    ]
  },
  {
    name: "KeyAuthorizationWitnessBurned",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "bytes32", name: "witness", indexed: true }
    ]
  },
  { name: "UnauthorizedCaller", type: "error", inputs: [] },
  { name: "KeyAlreadyExists", type: "error", inputs: [] },
  { name: "KeyNotFound", type: "error", inputs: [] },
  { name: "KeyExpired", type: "error", inputs: [] },
  { name: "SpendingLimitExceeded", type: "error", inputs: [] },
  { name: "InvalidSpendingLimit", type: "error", inputs: [] },
  { name: "InvalidSignatureType", type: "error", inputs: [] },
  { name: "ZeroPublicKey", type: "error", inputs: [] },
  { name: "ExpiryInPast", type: "error", inputs: [] },
  { name: "KeyAlreadyRevoked", type: "error", inputs: [] },
  {
    name: "SignatureTypeMismatch",
    type: "error",
    inputs: [
      { type: "uint8", name: "expected" },
      { type: "uint8", name: "actual" }
    ]
  },
  { name: "CallNotAllowed", type: "error", inputs: [] },
  { name: "InvalidCallScope", type: "error", inputs: [] },
  { name: "InvalidKeyId", type: "error", inputs: [] },
  { name: "InvalidKeyAuthorizationWitness", type: "error", inputs: [] },
  { name: "KeyAuthorizationWitnessAlreadyBurned", type: "error", inputs: [] },
  {
    name: "LegacyAuthorizeKeySelectorChanged",
    type: "error",
    inputs: [{ type: "bytes4", name: "newSelector" }]
  }
];
const nonce = [
  {
    name: "getNonce",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "account" },
      { type: "uint256", name: "nonceKey" }
    ],
    outputs: [{ type: "uint64", name: "nonce" }]
  },
  {
    name: "NonceIncremented",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "uint256", name: "nonceKey", indexed: true },
      { type: "uint64", name: "newNonce" }
    ]
  },
  { name: "ProtocolNonceNotSupported", type: "error", inputs: [] },
  { name: "InvalidNonceKey", type: "error", inputs: [] },
  { name: "NonceOverflow", type: "error", inputs: [] },
  { name: "ExpiringNonceReplay", type: "error", inputs: [] },
  { name: "ExpiringNonceSetFull", type: "error", inputs: [] },
  { name: "InvalidExpiringNonceExpiry", type: "error", inputs: [] }
];
const tip20Factory = [
  {
    name: "createToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "string", name: "name" },
      { type: "string", name: "symbol" },
      { type: "string", name: "currency" },
      { type: "address", name: "quoteToken" },
      { type: "address", name: "admin" },
      { type: "bytes32", name: "salt" }
    ],
    outputs: [{ type: "address" }]
  },
  {
    name: "createToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "string", name: "name" },
      { type: "string", name: "symbol" },
      { type: "string", name: "currency" },
      { type: "address", name: "quoteToken" },
      { type: "address", name: "admin" },
      { type: "bytes32", name: "salt" },
      { type: "string", name: "logoURI" }
    ],
    outputs: [{ type: "address" }]
  },
  {
    name: "isTIP20",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "token" }],
    outputs: [{ type: "bool" }]
  },
  {
    name: "getTokenAddress",
    type: "function",
    stateMutability: "pure",
    inputs: [
      { type: "address", name: "sender" },
      { type: "bytes32", name: "salt" }
    ],
    outputs: [{ type: "address" }]
  },
  {
    name: "TokenCreated",
    type: "event",
    inputs: [
      { type: "address", name: "token", indexed: true },
      { type: "string", name: "name" },
      { type: "string", name: "symbol" },
      { type: "string", name: "currency" },
      { type: "address", name: "quoteToken" },
      { type: "address", name: "admin" },
      { type: "bytes32", name: "salt" }
    ]
  },
  { name: "AddressReserved", type: "error", inputs: [] },
  { name: "AddressNotReserved", type: "error", inputs: [] },
  { name: "InvalidQuoteToken", type: "error", inputs: [] },
  {
    name: "TokenAlreadyExists",
    type: "error",
    inputs: [{ type: "address", name: "token" }]
  }
];
const tip403Registry = [
  {
    name: "policyIdCounter",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "policyExists",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint64", name: "policyId" }],
    outputs: [{ type: "bool" }]
  },
  {
    name: "policyData",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint64", name: "policyId" }],
    outputs: [
      { type: "uint8", name: "policyType" },
      { type: "address", name: "admin" }
    ]
  },
  {
    name: "isAuthorized",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "uint64", name: "policyId" },
      { type: "address", name: "user" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "isAuthorizedSender",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "uint64", name: "policyId" },
      { type: "address", name: "user" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "isAuthorizedRecipient",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "uint64", name: "policyId" },
      { type: "address", name: "user" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "isAuthorizedMintRecipient",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "uint64", name: "policyId" },
      { type: "address", name: "user" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    name: "compoundPolicyData",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint64", name: "policyId" }],
    outputs: [
      { type: "uint64", name: "senderPolicyId" },
      { type: "uint64", name: "recipientPolicyId" },
      { type: "uint64", name: "mintRecipientPolicyId" }
    ]
  },
  {
    name: "receivePolicy",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [
      { type: "bool", name: "hasReceivePolicy" },
      { type: "uint64", name: "senderPolicyId" },
      { type: "uint8", name: "senderPolicyType" },
      { type: "uint64", name: "tokenFilterId" },
      { type: "uint8", name: "tokenFilterType" },
      { type: "address", name: "recoveryAuthority" }
    ]
  },
  {
    name: "validateReceivePolicy",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "token" },
      { type: "address", name: "sender" },
      { type: "address", name: "receiver" }
    ],
    outputs: [
      { type: "bool", name: "authorized" },
      { type: "uint8", name: "blockedReason" }
    ]
  },
  {
    name: "createPolicy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "admin" },
      { type: "uint8", name: "policyType" }
    ],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "createPolicyWithAccounts",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "admin" },
      { type: "uint8", name: "policyType" },
      { type: "address[]", name: "accounts" }
    ],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "setPolicyAdmin",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "policyId" },
      { type: "address", name: "admin" }
    ],
    outputs: []
  },
  {
    name: "modifyPolicyWhitelist",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "policyId" },
      { type: "address", name: "account" },
      { type: "bool", name: "allowed" }
    ],
    outputs: []
  },
  {
    name: "modifyPolicyBlacklist",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "policyId" },
      { type: "address", name: "account" },
      { type: "bool", name: "restricted" }
    ],
    outputs: []
  },
  {
    name: "createCompoundPolicy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "senderPolicyId" },
      { type: "uint64", name: "recipientPolicyId" },
      { type: "uint64", name: "mintRecipientPolicyId" }
    ],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "setReceivePolicy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "senderPolicyId" },
      { type: "uint64", name: "tokenFilterId" },
      { type: "address", name: "recoveryAuthority" }
    ],
    outputs: []
  },
  {
    name: "PolicyAdminUpdated",
    type: "event",
    inputs: [
      { type: "uint64", name: "policyId", indexed: true },
      { type: "address", name: "updater", indexed: true },
      { type: "address", name: "admin", indexed: true }
    ]
  },
  {
    name: "PolicyCreated",
    type: "event",
    inputs: [
      { type: "uint64", name: "policyId", indexed: true },
      { type: "address", name: "updater", indexed: true },
      { type: "uint8", name: "policyType" }
    ]
  },
  {
    name: "WhitelistUpdated",
    type: "event",
    inputs: [
      { type: "uint64", name: "policyId", indexed: true },
      { type: "address", name: "updater", indexed: true },
      { type: "address", name: "account", indexed: true },
      { type: "bool", name: "allowed" }
    ]
  },
  {
    name: "BlacklistUpdated",
    type: "event",
    inputs: [
      { type: "uint64", name: "policyId", indexed: true },
      { type: "address", name: "updater", indexed: true },
      { type: "address", name: "account", indexed: true },
      { type: "bool", name: "restricted" }
    ]
  },
  {
    name: "CompoundPolicyCreated",
    type: "event",
    inputs: [
      { type: "uint64", name: "policyId", indexed: true },
      { type: "address", name: "creator", indexed: true },
      { type: "uint64", name: "senderPolicyId" },
      { type: "uint64", name: "recipientPolicyId" },
      { type: "uint64", name: "mintRecipientPolicyId" }
    ]
  },
  {
    name: "ReceivePolicyUpdated",
    type: "event",
    inputs: [
      { type: "address", name: "account", indexed: true },
      { type: "uint64", name: "senderPolicyId" },
      { type: "uint64", name: "tokenFilterId" },
      { type: "address", name: "recoveryAuthority" }
    ]
  },
  { name: "Unauthorized", type: "error", inputs: [] },
  { name: "PolicyNotFound", type: "error", inputs: [] },
  { name: "PolicyNotSimple", type: "error", inputs: [] },
  { name: "InvalidPolicyType", type: "error", inputs: [] },
  { name: "IncompatiblePolicyType", type: "error", inputs: [] },
  { name: "VirtualAddressNotAllowed", type: "error", inputs: [] },
  { name: "InvalidReceivePolicyType", type: "error", inputs: [] },
  { name: "InvalidRecoveryAuthority", type: "error", inputs: [] }
];
const validatorConfig = [
  {
    name: "getValidators",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        name: "validators",
        components: [
          { type: "bytes32", name: "publicKey" },
          { type: "bool", name: "active" },
          { type: "uint64", name: "index" },
          { type: "address", name: "validatorAddress" },
          { type: "string", name: "inboundAddress" },
          { type: "string", name: "outboundAddress" }
        ]
      }
    ]
  },
  {
    name: "addValidator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "newValidatorAddress" },
      { type: "bytes32", name: "publicKey" },
      { type: "bool", name: "active" },
      { type: "string", name: "inboundAddress" },
      { type: "string", name: "outboundAddress" }
    ],
    outputs: []
  },
  {
    name: "updateValidator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "newValidatorAddress" },
      { type: "bytes32", name: "publicKey" },
      { type: "string", name: "inboundAddress" },
      { type: "string", name: "outboundAddress" }
    ],
    outputs: []
  },
  {
    name: "changeValidatorStatus",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "validator" },
      { type: "bool", name: "active" }
    ],
    outputs: []
  },
  {
    name: "changeValidatorStatusByIndex",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint64", name: "index" },
      { type: "bool", name: "active" }
    ],
    outputs: []
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }]
  },
  {
    name: "changeOwner",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address", name: "newOwner" }],
    outputs: []
  },
  {
    name: "getNextFullDkgCeremony",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  {
    name: "setNextFullDkgCeremony",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "uint64", name: "epoch" }],
    outputs: []
  },
  {
    name: "validatorsArray",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "index" }],
    outputs: [{ type: "address" }]
  },
  {
    name: "validators",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address", name: "validator" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "bytes32", name: "publicKey" },
          { type: "bool", name: "active" },
          { type: "uint64", name: "index" },
          { type: "address", name: "validatorAddress" },
          { type: "string", name: "inboundAddress" },
          { type: "string", name: "outboundAddress" }
        ]
      }
    ]
  },
  {
    name: "validatorCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint64" }]
  },
  { name: "Unauthorized", type: "error", inputs: [] },
  { name: "ValidatorAlreadyExists", type: "error", inputs: [] },
  { name: "ValidatorNotFound", type: "error", inputs: [] },
  { name: "InvalidPublicKey", type: "error", inputs: [] },
  {
    name: "NotHostPort",
    type: "error",
    inputs: [
      { type: "string", name: "field" },
      { type: "string", name: "input" },
      { type: "string", name: "backtrace" }
    ]
  },
  {
    name: "NotIpPort",
    type: "error",
    inputs: [
      { type: "string", name: "field" },
      { type: "string", name: "input" },
      { type: "string", name: "backtrace" }
    ]
  }
];
[
  ...tip20ChannelReserve,
  ...tip20,
  ...validatorConfigV2,
  ...signatureVerifier$1,
  ...stablecoinDex,
  ...addressRegistry,
  ...feeManager,
  ...feeAmm,
  ...receivePolicyGuard,
  ...accountKeychain$1,
  ...nonce,
  ...tip20Factory,
  ...tip403Registry,
  ...validatorConfig
];
function getType(transaction) {
  const account = transaction.account;
  if (account?.keyType && account.keyType !== "secp256k1" || account?.source === "accessKey" || account?.source === "multisig" || typeof transaction.calls !== "undefined" || typeof transaction.feePayer !== "undefined" || typeof transaction.feePayerSignature !== "undefined" || typeof transaction.feeToken !== "undefined" || typeof transaction.keyAuthorization !== "undefined" || typeof transaction.multisig !== "undefined" || typeof transaction.nonceKey !== "undefined" || typeof transaction.signature !== "undefined" || typeof transaction.signatures !== "undefined" || typeof transaction.validBefore !== "undefined" || typeof transaction.validAfter !== "undefined")
    return "tempo";
  if (transaction.type)
    return transaction.type;
  return getTransactionType(transaction);
}
function isTempo(transaction) {
  try {
    const type2 = getType(transaction);
    return type2 === "tempo";
  } catch {
    return false;
  }
}
async function serialize(transaction, signature) {
  if (!isTempo(transaction)) {
    if (signature && "type" in signature && signature.type !== "secp256k1")
      throw new Error("Unsupported signature type. Expected `secp256k1` but got `" + signature.type + "`.");
    if (signature && "type" in signature) {
      const { r, s, yParity } = signature?.signature;
      return serializeTransaction$3(transaction, {
        r: fromNumber(r, { size: 32 }),
        s: fromNumber(s, { size: 32 }),
        yParity
      });
    }
    return serializeTransaction$3(transaction, signature);
  }
  const type2 = getType(transaction);
  if (type2 === "tempo")
    return serializeTempo(transaction, signature);
  throw new Error("Unsupported transaction type");
}
async function serializeTempo(transaction, sig) {
  const signature = (() => {
    if (transaction.signature)
      return transaction.signature;
    if (sig && "type" in sig)
      return sig;
    if (sig)
      return from$3({
        r: BigInt(sig.r),
        s: BigInt(sig.s),
        yParity: Number(sig.yParity)
      });
    return void 0;
  })();
  const { chainId, feePayer, nonce: nonce2, ...rest } = transaction;
  const feePayerSignature = (() => {
    const feePayerSignature2 = transaction.feePayerSignature;
    if (feePayerSignature2)
      return {
        r: BigInt(feePayerSignature2.r),
        s: BigInt(feePayerSignature2.s),
        yParity: Number(feePayerSignature2.yParity)
      };
    if (feePayerSignature2 === null || feePayer)
      return null;
    return void 0;
  })();
  const hasPrefilledFeePayerSignature = typeof transaction.feePayerSignature !== "undefined" && transaction.feePayerSignature !== null;
  const shouldStripFeeTokenForSponsorship = feePayer === true && (!signature || !feePayerSignature) || !signature && hasPrefilledFeePayerSignature;
  const transaction_ox = {
    ...rest,
    calls: rest.calls?.length ? rest.calls : [
      {
        to: rest.to || (!rest.data || rest.data === "0x" ? "0x0000000000000000000000000000000000000000" : void 0),
        value: rest.value,
        data: rest.data
      }
    ],
    chainId: Number(chainId),
    feePayerSignature,
    type: "tempo",
    ...nonce2 ? { nonce: BigInt(nonce2) } : {}
  };
  if (shouldStripFeeTokenForSponsorship)
    delete transaction_ox.feeToken;
  if (transaction.multisig && transaction.signatures && !feePayer) {
    const payload = getSignPayload(from(transaction_ox));
    const signatures = transaction.signatures.map((approval) => from$3(approval));
    const sorted = sortMultisigApprovals({
      payload,
      signatures,
      genesisConfig: transaction.multisig
    });
    const signature2 = from$3({
      genesisConfig: transaction.multisig,
      signatures: sorted,
      ...nonce2 ? {} : { init: true }
    });
    return serialize$1(transaction_ox, {
      feePayerSignature: void 0,
      signature: signature2
    });
  }
  if (signature && typeof transaction.feePayer === "object") {
    const tx = from(transaction_ox, {
      signature
    });
    const sender = (() => {
      if (transaction.from)
        return transaction.from;
      if (signature.type === "secp256k1")
        return recoverAddress({
          payload: getSignPayload(tx),
          signature: signature.signature
        });
      throw new Error("Unable to extract sender from transaction or signature.");
    })();
    const hash2 = getFeePayerSignPayload(tx, {
      sender
    });
    const feePayerSignature2 = await transaction.feePayer.sign({
      hash: hash2
    });
    return serialize$1(tx, {
      feePayerSignature: from$a(feePayerSignature2)
    });
  }
  if (feePayer === true || !signature && hasPrefilledFeePayerSignature) {
    if (signature && feePayerSignature)
      return serialize$1(transaction_ox, {
        signature
      });
    if (signature)
      return serialize$1(transaction_ox, {
        format: "feePayer",
        sender: transaction.from,
        signature
      });
    return serialize$1(transaction_ox, {
      feePayerSignature: null
    });
  }
  return serialize$1(
    // If we have specified a fee payer, the user will not be signing over the fee token.
    // Defer the fee token signing to the fee payer. Once the fee payer has signed,
    // keep `feeToken` so the broadcast envelope carries the token the chain must charge.
    {
      ...transaction_ox,
      ...feePayer && !feePayerSignature ? { feeToken: void 0 } : {}
    },
    {
      feePayerSignature: void 0,
      signature
    }
  );
}
function isAccessKeyAccount(account) {
  return account.source === "accessKey" && "accessKeyAddress" in account;
}
async function signKeyAuthorization(account, parameters) {
  const { chainId, key, expiry, limits, scopes, witness, admin } = parameters;
  const { accessKeyAddress, keyType: type2 } = resolveAccessKey(key);
  const isAccessKey = isAccessKeyAccount(account);
  const boundFields = isAccessKey ? { account: account.address } : {};
  const restrictions = admin ? {} : { expiry, limits, scopes };
  const hash2 = getSignPayload$1({
    address: accessKeyAddress,
    chainId,
    type: type2,
    witness,
    ...admin ? { isAdmin: true } : {},
    ...boundFields,
    ...restrictions
  });
  const signature = isAccessKey ? await account.sign({ hash: hash2, raw: true }) : await account.sign({ hash: hash2 });
  return from$1({
    address: accessKeyAddress,
    chainId,
    signature: from$3(signature),
    type: type2,
    ...witness ? { witness } : {},
    ...admin ? { isAdmin: true } : {},
    ...boundFields,
    ...restrictions
  });
}
function resolveAccessKey(accessKey) {
  if ("accessKeyAddress" in accessKey)
    return {
      accessKeyAddress: accessKey.accessKeyAddress,
      keyType: accessKey.keyType
    };
  if ("publicKey" in accessKey && accessKey.publicKey)
    return {
      accessKeyAddress: fromPublicKey(fromHex$3(accessKey.publicKey)),
      keyType: accessKey.type
    };
  return {
    accessKeyAddress: accessKey.address,
    keyType: accessKey.type
  };
}
const accountKeychain = "0xaAAAaaAA00000000000000000000000000000000";
const signatureVerifier = "0x5165300000000000000000000000000000000000";
const hardforks = [
  "genesis",
  "t0",
  "t1",
  "t1a",
  "t1b",
  "t1c",
  "t2",
  "t3",
  "t4",
  "t5",
  "t6"
];
function lt(current, target) {
  return hardforks.indexOf(current) < hardforks.indexOf(target);
}
function defineCall(call) {
  return {
    ...call,
    data: encodeFunctionData(call),
    to: call.address
  };
}
const signatureTypes = {
  0: "secp256k1",
  1: "p256",
  2: "webAuthn"
};
const spendPolicies = {
  true: "limited",
  false: "unlimited"
};
async function authorize(client, parameters) {
  return authorize.inner(sendTransaction, client, parameters);
}
(function(authorize2) {
  async function inner(action, client, parameters) {
    const { accessKey, admin, chainId = client.chain?.id, expiry, limits, scopes, witness, ...rest } = parameters;
    const account_ = rest.account ?? client.account;
    if (!account_)
      throw new Error("account is required.");
    if (!chainId)
      throw new Error("chainId is required.");
    const parsed = parseAccount(account_);
    const keyAuthorization = await signKeyAuthorization(parsed, {
      chainId: BigInt(chainId),
      key: accessKey,
      admin,
      expiry,
      limits,
      scopes,
      witness
    });
    return await action(client, {
      ...rest,
      keyAuthorization
    });
  }
  authorize2.inner = inner;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: accountKeychain$1,
      logs,
      eventName: "KeyAuthorized",
      strict: true
    });
    if (!log)
      throw new Error("`KeyAuthorized` event not found.");
    return log;
  }
  authorize2.extractEvent = extractEvent;
})(authorize || (authorize = {}));
async function burnWitness(client, parameters) {
  return burnWitness.inner(writeContract, client, parameters);
}
(function(burnWitness2) {
  async function inner(action, client, parameters) {
    const { witness, ...rest } = parameters;
    const call2 = burnWitness2.call({ witness });
    return await action(client, {
      ...rest,
      ...call2
    });
  }
  burnWitness2.inner = inner;
  function call(args) {
    const { witness } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "burnKeyAuthorizationWitness",
      args: [witness]
    });
  }
  burnWitness2.call = call;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: accountKeychain$1,
      logs,
      eventName: "KeyAuthorizationWitnessBurned",
      strict: true
    });
    if (!log)
      throw new Error("`KeyAuthorizationWitnessBurned` event not found.");
    return log;
  }
  burnWitness2.extractEvent = extractEvent;
})(burnWitness || (burnWitness = {}));
async function getMetadata(client, parameters) {
  const { account: account_ = client.account, accessKey, ...rest } = parameters;
  if (!account_)
    throw new Error("account is required.");
  const account = parseAccount(account_);
  const result = await readContract(client, {
    ...rest,
    account: null,
    ...getMetadata.call({ account: account.address, accessKey })
  });
  return {
    address: result.keyId,
    keyType: signatureTypes[result.signatureType] ?? "secp256k1",
    expiry: result.expiry,
    spendPolicy: spendPolicies[`${result.enforceLimits}`],
    isRevoked: result.isRevoked
  };
}
(function(getMetadata2) {
  function call(args) {
    const { account, accessKey } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "getKey",
      args: [account, resolveAccessKeyAddress(accessKey)]
    });
  }
  getMetadata2.call = call;
})(getMetadata || (getMetadata = {}));
async function getRemainingLimit(client, parameters) {
  const { account: account_ = client.account, accessKey, token, ...rest } = parameters;
  if (!account_)
    throw new Error("account is required.");
  const account = parseAccount(account_);
  const hardfork = client.chain?.hardfork;
  if (hardfork && lt(hardfork, "t3")) {
    const remaining2 = await readContract(client, {
      ...rest,
      ...getRemainingLimit.call({ account: account.address, accessKey, token })
    });
    return { remaining: remaining2, periodEnd: void 0 };
  }
  const [remaining, periodEnd] = await readContract(client, {
    ...rest,
    ...getRemainingLimit.callWithPeriod({
      account: account.address,
      accessKey,
      token
    })
  });
  return { remaining, periodEnd };
}
(function(getRemainingLimit2) {
  function call(args) {
    const { account, accessKey, token } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "getRemainingLimit",
      args: [account, resolveAccessKeyAddress(accessKey), token]
    });
  }
  getRemainingLimit2.call = call;
  function callWithPeriod(args) {
    const { account, accessKey, token } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "getRemainingLimitWithPeriod",
      args: [account, resolveAccessKeyAddress(accessKey), token]
    });
  }
  getRemainingLimit2.callWithPeriod = callWithPeriod;
})(getRemainingLimit || (getRemainingLimit = {}));
async function isAdmin(client, parameters) {
  const { account: account_ = client.account, accessKey, ...rest } = parameters;
  if (!account_)
    throw new Error("account is required.");
  const account = parseAccount(account_);
  return readContract(client, {
    ...rest,
    account: null,
    ...isAdmin.call({ account: account.address, accessKey })
  });
}
(function(isAdmin2) {
  function call(args) {
    const { account, accessKey } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "isAdminKey",
      args: [account, resolveAccessKeyAddress(accessKey)]
    });
  }
  isAdmin2.call = call;
})(isAdmin || (isAdmin = {}));
async function isWitnessBurned(client, parameters) {
  const { account: account_ = client.account, witness, ...rest } = parameters;
  if (!account_)
    throw new Error("account is required.");
  const account = parseAccount(account_);
  return readContract(client, {
    ...rest,
    account: null,
    ...isWitnessBurned.call({ account: account.address, witness })
  });
}
(function(isWitnessBurned2) {
  function call(args) {
    const { account, witness } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "isKeyAuthorizationWitnessBurned",
      args: [account, witness]
    });
  }
  isWitnessBurned2.call = call;
})(isWitnessBurned || (isWitnessBurned = {}));
async function revoke(client, parameters) {
  return revoke.inner(writeContract, client, parameters);
}
(function(revoke2) {
  async function inner(action, client, parameters) {
    const { accessKey, ...rest } = parameters;
    const call2 = revoke2.call({ accessKey });
    return await action(client, {
      ...rest,
      ...call2
    });
  }
  revoke2.inner = inner;
  function call(args) {
    const { accessKey } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "revokeKey",
      args: [resolveAccessKeyAddress(accessKey)]
    });
  }
  revoke2.call = call;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: accountKeychain$1,
      logs,
      eventName: "KeyRevoked",
      strict: true
    });
    if (!log)
      throw new Error("`KeyRevoked` event not found.");
    return log;
  }
  revoke2.extractEvent = extractEvent;
})(revoke || (revoke = {}));
async function updateLimit(client, parameters) {
  return updateLimit.inner(writeContract, client, parameters);
}
(function(updateLimit2) {
  async function inner(action, client, parameters) {
    const { accessKey, token, limit, ...rest } = parameters;
    const call2 = updateLimit2.call({ accessKey, token, limit });
    return await action(client, {
      ...rest,
      ...call2
    });
  }
  updateLimit2.inner = inner;
  function call(args) {
    const { accessKey, token, limit } = args;
    return defineCall({
      address: accountKeychain,
      abi: accountKeychain$1,
      functionName: "updateSpendingLimit",
      args: [resolveAccessKeyAddress(accessKey), token, limit]
    });
  }
  updateLimit2.call = call;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: accountKeychain$1,
      logs,
      eventName: "SpendingLimitUpdated",
      strict: true
    });
    if (!log)
      throw new Error("`SpendingLimitUpdated` event not found.");
    return log;
  }
  updateLimit2.extractEvent = extractEvent;
})(updateLimit || (updateLimit = {}));
async function verifyHash(client, parameters) {
  const { account, admin, hash: hash2, signature, ...rest } = parameters;
  return readContract(client, {
    ...rest,
    ...verifyHash.call({ account, admin, hash: hash2, signature })
  });
}
(function(verifyHash2) {
  function call(args) {
    const { account, admin = true, hash: hash2, signature } = args;
    return defineCall({
      address: signatureVerifier,
      abi: signatureVerifier$1,
      functionName: admin ? "verifyKeychainAdmin" : "verifyKeychain",
      args: [account, hash2, signature]
    });
  }
  verifyHash2.call = call;
})(verifyHash || (verifyHash = {}));
function resolveAccessKeyAddress(accessKey) {
  if (typeof accessKey === "string")
    return accessKey;
  return accessKey.accessKeyAddress;
}
function formatTransaction(transaction) {
  if (!isTempo(transaction))
    return formatTransaction$1(transaction);
  const blockTimestamp = transaction.blockTimestamp == null ? void 0 : BigInt(transaction.blockTimestamp);
  const { feePayerSignature, gasPrice: _, nonce: nonce2, ...tx } = fromRpc(transaction);
  return {
    ...tx,
    accessList: tx.accessList,
    ...typeof blockTimestamp !== "undefined" && { blockTimestamp },
    feePayerSignature: feePayerSignature ? {
      r: fromNumber(feePayerSignature.r, { size: 32 }),
      s: fromNumber(feePayerSignature.s, { size: 32 }),
      v: BigInt(feePayerSignature.v ?? 27),
      yParity: feePayerSignature.yParity
    } : void 0,
    nonce: Number(nonce2),
    typeHex: toRpcType[tx.type],
    type: tx.type
  };
}
function formatTransactionReceipt(receipt) {
  return formatTransactionReceipt$1(receipt);
}
function formatTransactionRequest(r, action) {
  const request = r;
  const account = request.account ? parseAccount(request.account) : void 0;
  if (!isTempo(request))
    return formatTransactionRequest$1(r);
  if (action)
    request.calls = request.calls ?? [
      {
        to: r.to || (!r.data || r.data === "0x" ? "0x0000000000000000000000000000000000000000" : void 0),
        value: r.value,
        data: r.data
      }
    ];
  if (request.feePayer === true && !request.feePayerSignature)
    delete request.feeToken;
  const { multisig: _multisig, signatures: _signatures, ...rpcRequest } = request;
  const rpc = toRpc({
    ...rpcRequest,
    type: "tempo"
  });
  if (action === "estimateGas") {
    rpc.maxFeePerGas = void 0;
    rpc.maxPriorityFeePerGas = void 0;
  }
  rpc.to = void 0;
  rpc.data = void 0;
  rpc.value = void 0;
  const [keyType, keyData] = (() => {
    const type2 = account && "keyType" in account ? account.keyType : account?.source;
    if (!type2)
      return [request.keyType, shimKeyData(request.keyData)];
    if (type2 === "webAuthn")
      return ["webAuthn", "0x0578"];
    if (["p256", "secp256k1"].includes(type2))
      return [type2, void 0];
    return [request.keyType, shimKeyData(request.keyData)];
  })();
  const keyId = account && "accessKeyAddress" in account ? account.accessKeyAddress : request.keyId;
  if (account)
    rpc.from = account.address;
  return {
    ...rpc,
    ...request.capabilities ? { capabilities: request.capabilities } : {},
    ...keyData ? { keyData } : {},
    ...keyId ? { keyId } : {},
    ...keyType ? { keyType } : {},
    ...typeof request.feePayer !== "undefined" ? {
      feePayer: typeof request.feePayer === "object" ? parseAccount(request.feePayer) : request.feePayer
    } : {},
    ..."feePayerSignature" in request && request.feePayerSignature !== void 0 ? { feePayerSignature: request.feePayerSignature } : {}
  };
}
function shimKeyData(data) {
  if (!data)
    return data;
  const byteLength = (data.length - 2) / 2;
  if (byteLength <= 4)
    return data;
  return fromNumber(byteLength, { size: 2 });
}
const concurrentCounts = /* @__PURE__ */ new Map();
async function detect(key) {
  concurrentCounts.set(key, (concurrentCounts.get(key) ?? 0) + 1);
  await Promise.resolve();
  const isConcurrent = (concurrentCounts.get(key) ?? 0) > 1;
  queueMicrotask(() => {
    const count = concurrentCounts.get(key) ?? 0;
    if (count <= 1)
      concurrentCounts.delete(key);
    else
      concurrentCounts.set(key, count - 1);
  });
  return isConcurrent;
}
const maxExpirySecs = 25;
const chainConfig = {
  blockTime: 1e3,
  extendSchema: extendSchema(),
  formatters: {
    transaction: defineTransaction({
      exclude: ["aaAuthorizationList"],
      format: formatTransaction
    }),
    transactionReceipt: defineTransactionReceipt({
      format: formatTransactionReceipt
    }),
    transactionRequest: defineTransactionRequest({
      format: formatTransactionRequest
    })
  },
  prepareTransactionRequest: [
    async (r, { client, phase }) => {
      const request = r;
      if (phase === "afterFillParameters") {
        if (request.feePayer) {
          if (request.keyAuthorization?.signature.type === "webAuthn")
            request.gas = (request.gas ?? 0n) + 20000n;
          else if (request.account?.source === "accessKey")
            request.gas = (request.gas ?? 0n) + 10000n;
        }
        return request;
      }
      const multisig = request.multisig ?? (request.account?.source === "multisig" ? request.account.config : void 0);
      if (multisig) {
        request.multisig = multisig;
        request.from = getAddress(multisig);
        if (request.account?.source !== "multisig")
          delete request.account;
      }
      if (!request.keyAuthorization && request.account?.source === "accessKey") {
        const keyAuthorizationManager = request.account.keyAuthorizationManager;
        if (keyAuthorizationManager) {
          const chainId = request.chainId ?? request.chain?.id;
          if (typeof chainId !== "undefined") {
            const address = request.account.address;
            const accessKey = request.account.accessKeyAddress;
            const key = { address, accessKey, chainId };
            const keyAuthorization = await keyAuthorizationManager.get(key);
            if (keyAuthorization) {
              const now = BigInt(Math.floor(Date.now() / 1e3));
              if (keyAuthorization.expiry != null && BigInt(keyAuthorization.expiry) <= now) {
                await keyAuthorizationManager.remove(key);
              } else {
                const metadata = await getAction(client, getMetadata, "getMetadata")({ account: address, accessKey });
                if (isAddressEqual(metadata.address, accessKey) && !metadata.isRevoked && metadata.expiry > now)
                  await keyAuthorizationManager.remove(key);
                else
                  request.keyAuthorization = keyAuthorization;
              }
            }
          }
        }
      }
      const useExpiringNonce = await (async () => {
        if (request.nonceKey === "expiring")
          return true;
        if (request.feePayer && typeof request.nonceKey === "undefined")
          return true;
        const address = request.account?.address;
        if (address && typeof request.nonceKey === "undefined")
          return await detect(address);
        return false;
      })();
      if (useExpiringNonce) {
        request.nonceKey = maxUint256;
        request.nonce = 0;
        if (typeof request.validBefore === "undefined")
          request.validBefore = Math.floor(Date.now() / 1e3) + maxExpirySecs;
      } else if (typeof request.nonceKey !== "undefined") {
        request.nonce = typeof request.nonce === "number" ? request.nonce : 0;
      }
      if (!request.feeToken && request.chain?.feeToken)
        request.feeToken = request.chain.feeToken;
      return request;
    },
    { runAt: ["beforeFillTransaction", "afterFillParameters"] }
  ],
  serializers: {
    // TODO: casting to satisfy viem – viem v3 to have more flexible serializer type.
    transaction: ((transaction, signature) => serialize(transaction, signature))
  },
  async verifyHash(client, parameters) {
    const { address, hash: hash2, signature, mode: mode2 } = parameters;
    const envelope = (() => {
      if (typeof signature !== "string")
        return;
      try {
        return deserialize$1(signature);
      } catch {
        return void 0;
      }
    })();
    if (envelope) {
      if (envelope?.type === "keychain" && mode2 === "allowAccessKey") {
        const innerPayload = envelope.version === "v2" ? keccak256$1(concat$1("0x04", hash2, address)) : hash2;
        const accessKeyAddress = (() => {
          try {
            return extractAddress({
              payload: innerPayload,
              signature: envelope.inner
            });
          } catch {
            return void 0;
          }
        })();
        if (!accessKeyAddress)
          return false;
        const keyInfo = await getMetadata(client, {
          account: address,
          accessKey: accessKeyAddress,
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag
        });
        if (keyInfo.isRevoked)
          return false;
        if (keyInfo.expiry <= BigInt(Math.floor(Date.now() / 1e3)))
          return false;
        return verify(envelope.inner, {
          address: accessKeyAddress,
          payload: innerPayload
        });
      }
      if (envelope.type === "p256" || envelope.type === "webAuthn") {
        const code = await getCode(client, {
          address,
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag
        });
        if (
          // not a contract (EOA)
          !code || // default delegation (tempo EOA)
          code === "0xef01007702c00000000000000000000000000000000000"
        )
          return verify(envelope, {
            address,
            payload: hash2
          });
      }
    }
    return await getAction(client, verifyHash$1, "verifyHash")({ ...parameters, chain: null });
  }
};
const tempo = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 4217,
  blockExplorers: {
    default: {
      name: "Tempo Explorer",
      url: "https://explore.tempo.xyz"
    }
  },
  name: "Tempo Mainnet",
  nativeCurrency: {
    name: "USD",
    symbol: "USD",
    decimals: 6
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.tempo.xyz"],
      webSocket: ["wss://rpc.tempo.xyz"]
    }
  }
});
const tempoDevnet = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 31318,
  name: "Tempo Devnet",
  hardfork: "t3",
  blockExplorers: {
    default: {
      name: "Tempo Explorer",
      url: "https://explore.devnet.tempo.xyz"
    }
  },
  nativeCurrency: {
    name: "USD",
    symbol: "USD",
    decimals: 6
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.devnet.tempoxyz.dev"],
      webSocket: ["wss://rpc.devnet.tempoxyz.dev"]
    }
  },
  testnet: true
});
const tempoLocalnet = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 1337,
  name: "Tempo",
  hardfork: "t3",
  nativeCurrency: {
    name: "USD",
    symbol: "USD",
    decimals: 6
  },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] }
  }
});
const tempoModerato = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 42431,
  hardfork: "t5",
  blockExplorers: {
    default: {
      name: "Tempo Explorer",
      url: "https://explore.testnet.tempo.xyz"
    }
  },
  name: "Tempo Testnet (Moderato)",
  nativeCurrency: {
    name: "USD",
    symbol: "USD",
    decimals: 6
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.moderato.tempo.xyz"],
      webSocket: ["wss://rpc.moderato.tempo.xyz"]
    }
  },
  testnet: true
});
const tenet = /* @__PURE__ */ defineChain({
  id: 1559,
  name: "Tenet",
  network: "tenet-mainnet",
  nativeCurrency: {
    name: "TENET",
    symbol: "TENET",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://rpc.tenet.org"] }
  },
  blockExplorers: {
    default: {
      name: "TenetScan Mainnet",
      url: "https://tenetscan.io",
      apiUrl: "https://tenetscan.io/api"
    }
  },
  testnet: false
});
const ternoa = /* @__PURE__ */ defineChain({
  id: 752025,
  name: "Ternoa",
  nativeCurrency: { name: "Capsule Coin", symbol: "CAPS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-mainnet.zkevm.ternoa.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ternoa Explorer",
      url: "https://explorer-mainnet.zkevm.ternoa.network"
    }
  },
  testnet: false
});
const thaiChain = /* @__PURE__ */ defineChain({
  id: 7,
  name: "ThaiChain",
  nativeCurrency: { name: "TCH", symbol: "TCH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.thaichain.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://exp.thaichain.org",
      apiUrl: "https://exp.thaichain.org/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x0DaD6130e832c21719C5CE3bae93454E16A84826",
      blockCreated: 4806386
    }
  },
  testnet: false
});
const that = /* @__PURE__ */ defineChain({
  id: 8428,
  name: "THAT Mainnet",
  nativeCurrency: { name: "THAT", symbol: "THAT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.thatchain.io/mainnet"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://that.blockscout.com"
    }
  },
  testnet: false
});
const theta = /* @__PURE__ */ defineChain({
  id: 361,
  name: "Theta Mainnet",
  nativeCurrency: { name: "TFUEL", symbol: "TFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://eth-rpc-api.thetatoken.org/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Theta Explorer",
      url: "https://explorer.thetatoken.org"
    }
  },
  testnet: false
});
const thetaTestnet = /* @__PURE__ */ defineChain({
  id: 365,
  name: "Theta Testnet",
  nativeCurrency: { name: "TFUEL", symbol: "TFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Theta Explorer",
      url: "https://testnet-explorer.thetatoken.org"
    }
  },
  testnet: true
});
const thunderCore = /* @__PURE__ */ defineChain({
  id: 108,
  name: "ThunderCore Mainnet",
  nativeCurrency: { name: "TT", symbol: "TT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet-rpc.thundercore.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "ThunderCore Explorer",
      url: "https://explorer-mainnet.thundercore.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 0
    }
  },
  testnet: false
});
const thunderTestnet = /* @__PURE__ */ defineChain({
  id: 997,
  name: "5ireChain Thunder Testnet",
  nativeCurrency: { name: "5ire Token", symbol: "5IRE", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.5ire.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "5ireChain Thunder Explorer",
      url: "https://testnet.5irescan.io/"
    }
  },
  testnet: true
});
const tiktrixTestnet = /* @__PURE__ */ defineChain({
  id: 62092,
  name: "TikTrix Testnet",
  nativeCurrency: {
    name: "tTTX",
    symbol: "tTTX",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://tiktrix-rpc.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "TikTrix Testnet Explorer",
      url: "https://tiktrix.xyz"
    }
  },
  testnet: true
});
const tomb = /* @__PURE__ */ defineChain({
  id: 6969,
  name: "Tomb Mainnet",
  nativeCurrency: { name: "TOMB", symbol: "TOMB", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.tombchain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Tomb Explorer",
      url: "https://tombscout.com"
    }
  },
  testnet: false
});
const treasure = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 61166,
  name: "Treasure",
  nativeCurrency: {
    decimals: 18,
    name: "MAGIC",
    symbol: "MAGIC"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.treasure.lol"],
      webSocket: ["wss://rpc.treasure.lol/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Treasure Block Explorer",
      url: "https://treasurescan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0x2e29fe39496a56856D8698bD43e1dF4D0CE6266a",
      blockCreated: 101
    }
  },
  testnet: false
});
const treasureTopaz = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 978658,
  name: "Treasure Topaz Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MAGIC",
    symbol: "MAGIC"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.topaz.treasure.lol"],
      webSocket: ["wss://rpc.topaz.treasure.lol/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Treasure Topaz Block Explorer",
      url: "https://topaz.treasurescan.io"
    }
  },
  contracts: {
    multicall3: {
      address: "0xF9cda624FBC7e059355ce98a31693d299FACd963",
      blockCreated: 108112
    }
  },
  testnet: true
});
const tron = /* @__PURE__ */ defineChain({
  id: 728126428,
  name: "Tron",
  nativeCurrency: { name: "TRON", symbol: "TRX", decimals: 6 },
  rpcUrls: {
    default: {
      http: ["https://api.trongrid.io/jsonrpc"]
    }
  },
  blockTime: 3e3,
  blockExplorers: {
    default: {
      name: "Tronscan",
      url: "https://tronscan.org",
      apiUrl: "https://apilist.tronscanapi.com/api"
    }
  }
});
const tronNile = /* @__PURE__ */ defineChain({
  id: 3448148188,
  name: "Tron Nile",
  nativeCurrency: { name: "TRON", symbol: "TRX", decimals: 6 },
  rpcUrls: {
    default: {
      http: ["https://nile.trongrid.io/jsonrpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Tronscan",
      url: "https://nile.tronscan.org"
    }
  },
  testnet: true
});
const tronShasta = /* @__PURE__ */ defineChain({
  id: 2494104990,
  name: "Tron Shasta",
  nativeCurrency: { name: "TRON", symbol: "TRX", decimals: 6 },
  rpcUrls: {
    default: {
      http: ["https://api.shasta.trongrid.io/jsonrpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Tronscan",
      url: "https://shasta.tronscan.org"
    }
  },
  testnet: true
});
const ubiq = /* @__PURE__ */ defineChain({
  id: 8,
  name: "Ubiq Mainnet",
  nativeCurrency: { name: "UBQ", symbol: "UBQ", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://pyrus2.ubiqscan.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ubiq Scan",
      url: "https://ubiqscan.io"
    }
  },
  testnet: false
});
const ultra = /* @__PURE__ */ defineChain({
  id: 19991,
  name: "Ultra EVM",
  nativeCurrency: {
    decimals: 18,
    name: "Ultra Token",
    symbol: "UOS"
  },
  rpcUrls: {
    default: { http: ["https://evm.ultra.eosusa.io"] }
  },
  blockExplorers: {
    default: {
      name: "Ultra EVM Explorer",
      url: "https://evmexplorer.ultra.io"
    }
  }
});
const ultraTestnet = /* @__PURE__ */ defineChain({
  id: 18881,
  name: "Ultra EVM Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ultra Token",
    symbol: "UOS"
  },
  rpcUrls: {
    default: { http: ["https://evm.test.ultra.eosusa.io"] }
  },
  blockExplorers: {
    default: {
      name: "Ultra EVM Testnet Explorer",
      url: "https://evmexplorer.testnet.ultra.io"
    }
  },
  testnet: true
});
const ultron = /* @__PURE__ */ defineChain({
  id: 1231,
  name: "Ultron Mainnet",
  nativeCurrency: { name: "ULX", symbol: "ULX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://ultron-rpc.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ultron Scan",
      url: "https://ulxscan.com"
    }
  },
  testnet: false
});
const ultronTestnet = /* @__PURE__ */ defineChain({
  id: 1230,
  name: "Ultron Testnet",
  nativeCurrency: { name: "ULX", symbol: "ULX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://ultron-dev.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ultron Scan",
      url: "https://explorer.ultron-dev.io"
    }
  },
  testnet: true
});
const sourceId$8 = 1;
const unichain = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 130,
  name: "Unichain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockTime: 1e3,
  rpcUrls: {
    default: {
      http: ["https://mainnet.unichain.org/"]
    }
  },
  blockExplorers: {
    default: {
      name: "Uniscan",
      url: "https://uniscan.xyz",
      apiUrl: "https://api.uniscan.xyz/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    },
    disputeGameFactory: {
      [sourceId$8]: {
        address: "0x2F12d621a16e2d3285929C9996f478508951dFe4"
      }
    },
    portal: {
      [sourceId$8]: {
        address: "0x0bd48f6B86a26D3a217d0Fa6FfE2B491B956A7a2"
      }
    },
    l1StandardBridge: {
      [sourceId$8]: {
        address: "0x81014F44b0a345033bB2b3B21C7a1A308B35fEeA"
      }
    }
  },
  sourceId: sourceId$8
});
const sourceId$7 = 11155111;
const unichainSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 1301,
  name: "Unichain Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  blockTime: 1e3,
  rpcUrls: {
    default: {
      http: ["https://sepolia.unichain.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Uniscan",
      url: "https://sepolia.uniscan.xyz",
      apiUrl: "https://api-sepolia.uniscan.xyz/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    },
    portal: {
      [sourceId$7]: {
        address: "0x0d83dab629f0e0F9d36c0Cbc89B69a489f0751bD"
      }
    },
    l1StandardBridge: {
      [sourceId$7]: {
        address: "0xea58fcA6849d79EAd1f26608855c2D6407d54Ce2"
      }
    },
    disputeGameFactory: {
      [sourceId$7]: {
        address: "0xeff73e5aa3B9AEC32c659Aa3E00444d20a84394b"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$7
});
const unique = /* @__PURE__ */ defineChain({
  id: 8880,
  name: "Unique Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "UNQ",
    symbol: "UNQ"
  },
  rpcUrls: {
    default: { http: ["https://rpc.unique.network"] }
  },
  blockExplorers: {
    default: {
      name: "Unique Subscan",
      url: "https://unique.subscan.io/"
    }
  }
});
const uniqueOpal = /* @__PURE__ */ defineChain({
  id: 8882,
  name: "Opal Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "OPL",
    symbol: "OPL"
  },
  rpcUrls: {
    default: { http: ["https://rpc-opal.unique.network"] }
  },
  blockExplorers: {
    default: {
      name: "Opal Subscan",
      url: "https://opal.subscan.io/"
    }
  },
  testnet: true
});
const uniqueQuartz = /* @__PURE__ */ defineChain({
  id: 8881,
  name: "Quartz Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "QTZ",
    symbol: "QTZ"
  },
  rpcUrls: {
    default: { http: ["https://rpc-quartz.unique.network"] }
  },
  blockExplorers: {
    default: {
      name: "Quartz Subscan",
      url: "https://quartz.subscan.io/"
    }
  }
});
const unreal = /* @__PURE__ */ defineChain({
  id: 18233,
  name: "Unreal",
  nativeCurrency: {
    name: "reETH",
    decimals: 18,
    symbol: "reETH"
  },
  rpcUrls: {
    default: { http: ["https://rpc.unreal-orbit.gelato.digital"] }
  },
  blockExplorers: {
    default: {
      name: "Unreal Explorer",
      url: "https://unreal.blockscout.com",
      apiUrl: "https://unreal.blockscout.com/api/v2"
    }
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: "0x8b6B0e60D8CD84898Ea8b981065A12F876eA5677",
      blockCreated: 1745
    }
  }
});
const valygoNft = defineChain({
  id: 7773777,
  name: "VALYGO NFT",
  nativeCurrency: {
    decimals: 18,
    name: "VYO",
    symbol: "VYO"
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-gw-1.vyoscan.com/ext/bc/2RyzsmGypNQZPby1miwMMV8spTvhgd9qd2peNRzU1mErUQqSSw/rpc",
        "https://rpc-gw-2.vyoscan.com/ext/bc/2RyzsmGypNQZPby1miwMMV8spTvhgd9qd2peNRzU1mErUQqSSw/rpc"
      ],
      webSocket: [
        "wss://ws.vyoscan.com/ext/bc/2RyzsmGypNQZPby1miwMMV8spTvhgd9qd2peNRzU1mErUQqSSw/ws"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "VYOScan NFT",
      url: "https://nft.vyoscan.com",
      apiUrl: "https://nft.vyoscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0x4469693a04BAE365795329a89b24F4Eb1303Ea08"
    }
  }
});
const valygoSmartchain = defineChain({
  id: 7771777,
  name: "VALYGO Smartchain",
  nativeCurrency: {
    decimals: 18,
    name: "VYO",
    symbol: "VYO"
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-gw-1.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/rpc",
        "https://rpc-gw-2.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/rpc"
      ],
      webSocket: [
        "wss://ws.vyoscan.com/ext/bc/2t51dXsuxUvd9teY9TKEJmgxmxMk3CRF88UYTA4HQgjeYZqzSX/ws"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "VYOScan",
      url: "https://vyoscan.com",
      apiUrl: "https://vyoscan.com/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xeFa3c632BD275750597cE9ca2346A5becAA0F344"
    }
  }
});
const vana = /* @__PURE__ */ defineChain({
  id: 1480,
  name: "Vana",
  blockTime: 6e3,
  nativeCurrency: {
    decimals: 18,
    name: "Vana",
    symbol: "VANA"
  },
  rpcUrls: {
    default: { http: ["https://rpc.vana.org/"] }
  },
  blockExplorers: {
    default: {
      name: "Vana Block Explorer",
      url: "https://vanascan.io",
      apiUrl: "https://vanascan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xD8d2dFca27E8797fd779F8547166A2d3B29d360E",
      blockCreated: 716763
    }
  }
});
const vanaMoksha = /* @__PURE__ */ defineChain({
  id: 14800,
  name: "Vana Moksha Testnet",
  blockTime: 6e3,
  nativeCurrency: {
    decimals: 18,
    name: "Vana",
    symbol: "VANA"
  },
  rpcUrls: {
    default: { http: ["https://rpc.moksha.vana.org"] }
  },
  blockExplorers: {
    default: {
      name: "Vana Moksha Testnet",
      url: "https://moksha.vanascan.io",
      apiUrl: "https://moksha.vanascan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xD8d2dFca27E8797fd779F8547166A2d3B29d360E",
      blockCreated: 732283
    }
  },
  testnet: true
});
const vanar = /* @__PURE__ */ defineChain({
  id: 2040,
  name: "Vanar Mainnet",
  nativeCurrency: { name: "VANRY", symbol: "VANRY", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.vanarchain.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Vanar Mainnet Explorer",
      url: "https://explorer.vanarchain.com/"
    }
  },
  testnet: false
});
const vechain = /* @__PURE__ */ defineChain({
  id: 100009,
  name: "Vechain",
  nativeCurrency: { name: "VeChain", symbol: "VET", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.vechain.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Vechain Explorer",
      url: "https://explore.vechain.org"
    },
    vechainStats: {
      name: "Vechain Stats",
      url: "https://vechainstats.com"
    }
  }
});
const velas = /* @__PURE__ */ defineChain({
  id: 106,
  name: "Velas EVM Mainnet",
  nativeCurrency: { name: "VLX", symbol: "VLX", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evmexplorer.velas.com/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Velas Explorer",
      url: "https://evmexplorer.velas.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 55883577
    }
  },
  testnet: false
});
const viction = /* @__PURE__ */ defineChain({
  id: 88,
  name: "Viction",
  nativeCurrency: { name: "Viction", symbol: "VIC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.viction.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "VIC Scan",
      url: "https://vicscan.xyz"
    }
  },
  testnet: false
});
const victionTestnet = /* @__PURE__ */ defineChain({
  id: 89,
  name: "Viction Testnet",
  nativeCurrency: { name: "Viction", symbol: "VIC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.viction.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "VIC Scan",
      url: "https://testnet.vicscan.xyz"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 12170179
    }
  },
  testnet: true
});
const vision = /* @__PURE__ */ defineChain({
  id: 888888,
  name: "Vision",
  nativeCurrency: { name: "VISION", symbol: "VS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://infragrid.v.network/ethereum/compatible"]
    }
  },
  blockExplorers: {
    default: {
      name: "Vision Scan",
      url: "https://visionscan.org"
    }
  },
  testnet: false
});
const visionTestnet = /* @__PURE__ */ defineChain({
  id: 666666,
  name: "Vision Testnet",
  nativeCurrency: { name: "VISION", symbol: "VS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://vpioneer.infragrid.v.network/ethereum/compatible"]
    }
  },
  blockExplorers: {
    default: {
      name: "Vision Scan",
      url: "https://visionscan.org/?chain=vpioneer"
    }
  },
  testnet: true
});
const wanchain = /* @__PURE__ */ defineChain({
  id: 888,
  name: "Wanchain",
  nativeCurrency: { name: "WANCHAIN", symbol: "WAN", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://gwan-ssl.wandevs.org:56891",
        "https://gwan2-ssl.wandevs.org"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "WanScan",
      url: "https://wanscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcDF6A1566e78EB4594c86Fe73Fcdc82429e97fbB",
      blockCreated: 25312390
    }
  }
});
const wanchainTestnet = /* @__PURE__ */ defineChain({
  id: 999,
  name: "Wanchain Testnet",
  nativeCurrency: { name: "WANCHAIN", symbol: "WANt", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://gwan-ssl.wandevs.org:46891"]
    }
  },
  blockExplorers: {
    default: {
      name: "WanScanTest",
      url: "https://wanscan.org"
    }
  },
  contracts: {
    multicall3: {
      address: "0x11c89bF4496c39FB80535Ffb4c92715839CC5324",
      blockCreated: 24743448
    }
  },
  testnet: true
});
const weaveVMAlphanet = /* @__PURE__ */ defineChain({
  id: 9496,
  name: "WeaveVM Alphanet",
  nativeCurrency: { name: "Testnet WeaveVM", symbol: "tWVM", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.wvm.dev"] }
  },
  blockExplorers: {
    default: {
      name: "WeaveVM Alphanet Explorer",
      url: "https://explorer.wvm.dev"
    }
  },
  testnet: true
});
const wemix = /* @__PURE__ */ defineChain({
  id: 1111,
  name: "WEMIX",
  network: "wemix-mainnet",
  nativeCurrency: { name: "WEMIX", symbol: "WEMIX", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.wemix.com"] }
  },
  blockExplorers: {
    default: {
      name: "wemixExplorer",
      url: "https://explorer.wemix.com"
    }
  }
});
const wemixTestnet = /* @__PURE__ */ defineChain({
  id: 1112,
  name: "WEMIX Testnet",
  network: "wemix-testnet",
  nativeCurrency: { name: "WEMIX", symbol: "tWEMIX", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.test.wemix.com"] }
  },
  blockExplorers: {
    default: {
      name: "wemixExplorer",
      url: "https://testnet.wemixscan.com",
      apiUrl: "https://testnet.wemixscan.com/api"
    }
  },
  testnet: true
});
const westendAssetHub = /* @__PURE__ */ defineChain({
  id: 420420421,
  name: "Westend Asset Hub",
  nativeCurrency: {
    decimals: 18,
    name: "Westies",
    symbol: "WND"
  },
  rpcUrls: {
    default: { http: ["https://westend-asset-hub-eth-rpc.polkadot.io"] }
  },
  blockExplorers: {
    default: {
      name: "subscan",
      url: "https://westend-asset-hub-eth-explorer.parity.io"
    }
  },
  testnet: true
});
const whitechain = /* @__PURE__ */ defineChain({
  testnet: false,
  name: "Whitechain",
  blockExplorers: {
    default: {
      name: "Whitechain Explorer",
      url: "https://explorer.whitechain.io"
    }
  },
  id: 1875,
  rpcUrls: {
    default: {
      http: ["https://rpc.whitechain.io"]
    }
  },
  nativeCurrency: {
    decimals: 18,
    name: "WhiteBIT Coin",
    symbol: "WBT"
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 25212237
    }
  }
});
const whitechainTestnet = /* @__PURE__ */ defineChain({
  testnet: true,
  name: "Whitechain Testnet",
  blockExplorers: {
    default: {
      name: "Whitechain Explorer",
      url: "https://testnet.whitechain.io"
    }
  },
  id: 2625,
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.whitechain.io"]
    }
  },
  nativeCurrency: {
    decimals: 18,
    name: "WhiteBIT Coin",
    symbol: "WBT"
  }
});
const wmcTestnet = /* @__PURE__ */ defineChain({
  id: 42070,
  name: "WMC Testnet",
  nativeCurrency: { name: "WMTx", symbol: "WMTx", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet-base.worldmobile.net"]
    }
  },
  blockExplorers: {
    default: {
      name: "WMC Explorer",
      url: "https://explorer2-base-testnet.worldmobile.net"
    }
  },
  testnet: true
});
const sourceId$6 = 1;
const worldchain = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 480,
  name: "World Chain",
  network: "worldchain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://worldchain-mainnet.g.alchemy.com/public"] }
  },
  blockExplorers: {
    default: {
      name: "Worldscan",
      url: "https://worldscan.org",
      apiUrl: "https://api.worldscan.org/api"
    },
    blockscout: {
      name: "Blockscout",
      url: "https://worldchain-mainnet.explorer.alchemy.com",
      apiUrl: "https://worldchain-mainnet.explorer.alchemy.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    },
    disputeGameFactory: {
      [sourceId$6]: {
        address: "0x069c4c579671f8c120b1327a73217D01Ea2EC5ea"
      }
    },
    l2OutputOracle: {
      [sourceId$6]: {
        address: "0x19A6d1E9034596196295CF148509796978343c5D"
      }
    },
    portal: {
      [sourceId$6]: {
        address: "0xd5ec14a83B7d95BE1E2Ac12523e2dEE12Cbeea6C"
      }
    },
    l1StandardBridge: {
      [sourceId$6]: {
        address: "0x470458C91978D2d929704489Ad730DC3E3001113"
      }
    }
  },
  testnet: false,
  sourceId: sourceId$6
});
const sourceId$5 = 11155111;
const worldchainSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 4801,
  name: "World Chain Sepolia",
  network: "worldchain-sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://worldchain-sepolia.g.alchemy.com/public"] }
  },
  blockExplorers: {
    default: {
      name: "Worldscan Sepolia",
      url: "https://sepolia.worldscan.org",
      apiUrl: "https://api-sepolia.worldscan.org/api"
    },
    blockscout: {
      name: "Blockscout",
      url: "https://worldchain-sepolia.explorer.alchemy.com",
      apiUrl: "https://worldchain-sepolia.explorer.alchemy.com/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 0
    },
    disputeGameFactory: {
      [sourceId$5]: {
        address: "0x8Ec1111f67Dad6b6A93B3F42DfBC92D81c98449A"
      }
    },
    l2OutputOracle: {
      [sourceId$5]: {
        address: "0xc8886f8BAb6Eaeb215aDB5f1c686BF699248300e"
      }
    },
    portal: {
      [sourceId$5]: {
        address: "0xFf6EBa109271fe6d4237EeeD4bAb1dD9A77dD1A4"
      }
    },
    l1StandardBridge: {
      [sourceId$5]: {
        address: "0xd7DF54b3989855eb66497301a4aAEc33Dbb3F8DE"
      }
    }
  },
  testnet: true,
  sourceId: sourceId$5
});
const worldLand = /* @__PURE__ */ defineChain({
  id: 103,
  name: "WorldLand Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "WLC",
    symbol: "WLC"
  },
  rpcUrls: {
    default: {
      http: ["https://seoul.worldland.foundation"]
    }
  },
  blockExplorers: {
    default: {
      name: "WorldLand Scan",
      url: "https://scan.worldland.foundation"
    }
  },
  testnet: false
});
const xai = /* @__PURE__ */ defineChain({
  id: 660279,
  name: "Xai Mainnet",
  nativeCurrency: { name: "Xai", symbol: "XAI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://xai-chain.net/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.xai-chain.net"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 222549
    }
  },
  testnet: false
});
const xaiTestnet = /* @__PURE__ */ defineChain({
  id: 37714555429,
  name: "Xai Testnet",
  nativeCurrency: { name: "sXai", symbol: "sXAI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet-v2.xai-chain.net/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://testnet-explorer-v2.xai-chain.net"
    }
  },
  testnet: true
});
const xdc = /* @__PURE__ */ defineChain({
  id: 50,
  name: "XDC Network",
  nativeCurrency: {
    decimals: 18,
    name: "XDC",
    symbol: "XDC"
  },
  rpcUrls: {
    default: { http: ["https://rpc.xdcrpc.com"] }
  },
  blockExplorers: {
    default: {
      name: "XDCScan",
      url: "https://xdcscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0x0B1795ccA8E4eC4df02346a082df54D437F8D9aF",
      blockCreated: 75884020
    }
  }
});
const xdcTestnet = /* @__PURE__ */ defineChain({
  id: 51,
  name: "Apothem Network",
  nativeCurrency: {
    decimals: 18,
    name: "TXDC",
    symbol: "TXDC"
  },
  rpcUrls: {
    default: { http: ["https://erpc.apothem.network"] }
  },
  blockExplorers: {
    default: {
      name: "XDCScan",
      url: "https://testnet.xdcscan.com"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 59765389
    }
  },
  testnet: true
});
const xgr = /* @__PURE__ */ defineChain({
  id: 1643,
  name: "XGR Mainnet",
  nativeCurrency: {
    name: "XGR",
    symbol: "XGR",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.xgr.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "XGR Explorer",
      url: "https://explorer.xgr.network"
    }
  }
});
const xLayer = /* @__PURE__ */ defineChain({
  id: 196,
  name: "X Layer Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "OKB",
    symbol: "OKB"
  },
  rpcUrls: {
    default: { http: ["https://xlayerrpc.okx.com"] }
  },
  blockExplorers: {
    default: {
      name: "OKLink",
      url: "https://www.oklink.com/xlayer",
      apiUrl: "https://www.oklink.com/api/v5/explorer/xlayer/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 47416
    }
  }
});
const xLayerTestnet = /* @__PURE__ */ defineChain({
  id: 1952,
  name: "X1 Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "OKB",
    symbol: "OKB"
  },
  rpcUrls: {
    default: { http: ["https://xlayertestrpc.okx.com"] }
  },
  blockExplorers: {
    default: {
      name: "OKLink",
      url: "https://www.oklink.com/xlayer-test"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 624344
    }
  },
  testnet: true
});
const xoneMainnet = /* @__PURE__ */ defineChain({
  id: 3721,
  name: "Xone Chain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "XOC",
    symbol: "XOC"
  },
  rpcUrls: {
    default: { http: ["https://rpc.xone.org"] }
  },
  blockExplorers: {
    default: {
      name: "Xone Mainnet Explorer",
      url: "https://xonescan.com",
      apiUrl: "http://api.xonescan.com/api"
    }
  },
  testnet: false
});
const xoneTestnet = /* @__PURE__ */ defineChain({
  id: 33772211,
  name: "Xone Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "XOC",
    symbol: "XOC"
  },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-testnet.xone.org",
        "https://rpc-testnet.xone.plus",
        "https://rpc-testnet.knight.center"
      ]
    }
  },
  blockExplorers: {
    default: {
      name: "Xone Testnet Explorer",
      url: "https://testnet.xonescan.com",
      apiUrl: "http://api.testnet.xonescan.com/api"
    }
  },
  testnet: true
});
const xphereMainnet = /* @__PURE__ */ defineChain({
  id: 20250217,
  name: "Xphere Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "XP",
    symbol: "XP"
  },
  rpcUrls: {
    default: {
      http: ["https://en-bkk.x-phere.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Xphere Tamsa Explorer",
      url: "https://xp.tamsa.io"
    }
  },
  testnet: false
});
const xphereTestnet = /* @__PURE__ */ defineChain({
  id: 1998991,
  name: "Xphere Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "XPT",
    symbol: "XPT"
  },
  rpcUrls: {
    default: {
      http: ["http://testnet.x-phere.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Xphere Tamsa Explorer",
      url: "https://xpt.tamsa.io"
    }
  },
  testnet: true
});
const xpla = /* @__PURE__ */ defineChain({
  id: 37,
  name: "CONX Chain",
  nativeCurrency: {
    decimals: 18,
    name: "XPLA",
    symbol: "XPLA"
  },
  rpcUrls: {
    default: {
      http: ["https://dimension-evm-rpc.xpla.dev"]
    }
  },
  blockExplorers: {
    default: {
      name: "CONX Explorer",
      url: "https://explorer.conx.xyz"
    }
  },
  testnet: false
});
const xrOne = /* @__PURE__ */ defineChain({
  id: 273,
  name: "XR One",
  nativeCurrency: {
    decimals: 18,
    name: "XR1",
    symbol: "XR1"
  },
  rpcUrls: {
    default: {
      http: ["https://xr1.calderachain.xyz/http"],
      webSocket: ["wss://xr1.calderachain.xyz/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://xr1.calderaexplorer.xyz"
    }
  },
  testnet: false
});
const xrplevm = /* @__PURE__ */ defineChain({
  id: 144e4,
  name: "XRPL EVM",
  nativeCurrency: {
    name: "XRP",
    symbol: "XRP",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://rpc.xrplevm.org"] }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer.xrplevm.org",
      apiUrl: "https://explorer.xrplevm.org/api/v2"
    }
  },
  testnet: false
});
const xrplevmDevnet = /* @__PURE__ */ defineChain({
  id: 1440002,
  name: "XRPL EVM Devnet",
  nativeCurrency: {
    name: "XRP",
    symbol: "XRP",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.xrplevm.org/"]
    },
    public: {
      http: ["https://rpc.xrplevm.org/"]
    }
  },
  blockExplorers: {
    default: {
      name: "XRPLEVM Devnet Explorer",
      url: "https://explorer.xrplevm.org/"
    }
  },
  contracts: {
    multicall3: {
      address: "0x82Cc144D7d0AD4B1c27cb41420e82b82Ad6e9B31",
      blockCreated: 15237286
    }
  },
  testnet: true
});
const xrplevmTestnet = /* @__PURE__ */ defineChain({
  id: 1449e3,
  name: "XRPL EVM Testnet",
  nativeCurrency: {
    name: "XRP",
    symbol: "XRP",
    decimals: 18
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.xrplevm.org"] }
  },
  blockExplorers: {
    default: {
      name: "blockscout",
      url: "https://explorer.testnet.xrplevm.org",
      apiUrl: "https://explorer.testnet.xrplevm.org/api/v2"
    }
  },
  contracts: {
    multicall3: {
      address: "0x82Cc144D7d0AD4B1c27cb41420e82b82Ad6e9B31",
      blockCreated: 492302
    }
  },
  testnet: true
});
const xrSepolia = /* @__PURE__ */ defineChain({
  id: 2730,
  name: "XR Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "tXR",
    symbol: "tXR"
  },
  rpcUrls: {
    default: { http: ["https://xr-sepolia-testnet.rpc.caldera.xyz/http"] }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://xr-sepolia-testnet.explorer.caldera.xyz"
    }
  },
  testnet: true
});
const yooldoVerse = /* @__PURE__ */ defineChain({
  id: 50005,
  name: "Yooldo Verse",
  nativeCurrency: { name: "OAS", symbol: "OAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.yooldo-verse.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Yooldo Verse Explorer",
      url: "https://explorer.yooldo-verse.xyz"
    }
  }
});
const yooldoVerseTestnet = /* @__PURE__ */ defineChain({
  id: 50006,
  name: "Yooldo Verse Testnet",
  nativeCurrency: { name: "OAS", symbol: "OAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.yooldo-verse.xyz"]
    }
  },
  blockExplorers: {
    default: {
      name: "Yooldo Verse Testnet Explorer",
      url: "https://explorer.testnet.yooldo-verse.xyz"
    }
  },
  testnet: true
});
const zenchainTestnet = /* @__PURE__ */ defineChain({
  id: 8408,
  name: "ZenChain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ZTC",
    symbol: "ZTC"
  },
  rpcUrls: {
    default: {
      http: ["https://zenchain-testnet.api.onfinality.io/public"],
      webSocket: ["wss://zenchain-testnet.api.onfinality.io/public-ws"]
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 230019
    }
  },
  blockExplorers: {
    default: {
      name: "Zentrace",
      url: "https://zentrace.io"
    }
  },
  testnet: true
});
const zeniq = /* @__PURE__ */ defineChain({
  id: 383414847825,
  name: "Zeniq Mainnet",
  nativeCurrency: { name: "ZENIQ", symbol: "ZENIQ", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.zeniq.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Zeniq Explorer",
      url: "https://zeniqscan.com"
    }
  },
  testnet: false
});
const zeroNetwork = /* @__PURE__ */ defineChain({
  id: 543210,
  name: "Zero Network",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.zerion.io/v1/zero"]
    }
  },
  blockExplorers: {
    default: {
      name: "Zero Network Explorer",
      url: "https://explorer.zero.network"
    }
  },
  testnet: false
});
const zetachain = /* @__PURE__ */ defineChain({
  id: 7e3,
  name: "ZetaChain",
  nativeCurrency: {
    decimals: 18,
    name: "Zeta",
    symbol: "ZETA"
  },
  rpcUrls: {
    default: {
      http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"]
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1632781
    }
  },
  blockExplorers: {
    default: {
      name: "ZetaScan",
      url: "https://zetascan.com"
    }
  },
  testnet: false
});
const zetachainAthensTestnet = /* @__PURE__ */ defineChain({
  id: 7001,
  name: "ZetaChain Athens Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Zeta",
    symbol: "aZETA"
  },
  rpcUrls: {
    default: {
      http: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"]
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 2715217
    }
  },
  blockExplorers: {
    default: {
      name: "ZetaScan",
      url: "https://testnet.zetascan.com"
    }
  },
  testnet: true
});
const zhejiang = /* @__PURE__ */ defineChain({
  id: 1337803,
  name: "Zhejiang",
  nativeCurrency: { name: "Zhejiang Ether", symbol: "ZhejETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.zhejiang.ethpandaops.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "Beaconchain",
      url: "https://zhejiang.beaconcha.in"
    }
  },
  testnet: true
});
const zilliqa = /* @__PURE__ */ defineChain({
  id: 32769,
  name: "Zilliqa",
  network: "zilliqa",
  nativeCurrency: { name: "Zilliqa", symbol: "ZIL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.zilliqa.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ethernal",
      url: "https://evmx.zilliqa.com"
    }
  },
  testnet: false
});
const zilliqaTestnet = /* @__PURE__ */ defineChain({
  id: 33101,
  name: "Zilliqa Testnet",
  network: "zilliqa-testnet",
  nativeCurrency: { name: "Zilliqa", symbol: "ZIL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://dev-api.zilliqa.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Ethernal",
      url: "https://evmx.testnet.zilliqa.com"
    }
  },
  testnet: true
});
const sourceId$4 = 1;
const zircuit = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 48900,
  name: "Zircuit Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.zircuit.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Zircuit Explorer",
      url: "https://explorer.zircuit.com"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    },
    l2OutputOracle: {
      [sourceId$4]: {
        address: "0x92Ef6Af472b39F1b363da45E35530c24619245A4"
      }
    },
    portal: {
      [sourceId$4]: {
        address: "0x17bfAfA932d2e23Bd9B909Fd5B4D2e2a27043fb1"
      }
    },
    l1StandardBridge: {
      [sourceId$4]: {
        address: "0x386B76D9cA5F5Fb150B6BFB35CF5379B22B26dd8"
      }
    }
  },
  testnet: false
});
const sourceId$3 = 11155111;
const zircuitGarfieldTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 48898,
  name: "Zircuit Garfield Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://garfield-testnet.zircuit.com/"]
    }
  },
  blockExplorers: {
    default: {
      name: "Zircuit Garfield Testnet Explorer",
      url: "https://explorer.garfield-testnet.zircuit.com"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    },
    l2OutputOracle: {
      [sourceId$3]: {
        address: "0xd69D3AC5CA686cCF94b258291772bc520FEAf211"
      }
    },
    portal: {
      [sourceId$3]: {
        address: "0x4E21A71Ac3F7607Da5c06153A17B1DD20E702c21"
      }
    },
    l1StandardBridge: {
      [sourceId$3]: {
        address: "0x87a7E2bCA9E35BA49282E832a28A6023904460D8"
      }
    }
  },
  testnet: true
});
const zkFair = /* @__PURE__ */ defineChain({
  id: 42766,
  name: "ZKFair Mainnet",
  network: "zkfair-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "USD Coin",
    symbol: "USDC"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.zkfair.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "zkFair Explorer",
      url: "https://scan.zkfair.io",
      apiUrl: "https://scan.zkfair.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 6090959
    }
  },
  testnet: false
});
const zkFairTestnet = /* @__PURE__ */ defineChain({
  id: 43851,
  name: "ZKFair Testnet",
  network: "zkfair-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "USD Coin",
    symbol: "USDC"
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.zkfair.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "zkFair Explorer",
      url: "https://testnet-scan.zkfair.io"
    }
  },
  testnet: true
});
const zkLinkNova = /* @__PURE__ */ defineChain({
  id: 810180,
  name: "zkLink Nova",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://rpc.zklink.io"] }
  },
  blockExplorers: {
    default: {
      name: "zkLink Nova Block Explorer",
      url: "https://explorer.zklink.io"
    }
  }
});
const zkLinkNovaSepoliaTestnet = /* @__PURE__ */ defineChain({
  id: 810181,
  name: "zkLink Nova Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["https://sepolia.rpc.zklink.io"] }
  },
  blockExplorers: {
    default: {
      name: "zkLink Nova Block Explorer",
      url: "https://sepolia.explorer.zklink.io"
    }
  },
  testnet: true
});
const zksync = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  blockTime: 200,
  id: 324,
  name: "ZKsync Era",
  network: "zksync-era",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.era.zksync.io"],
      webSocket: ["wss://mainnet.era.zksync.io/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "ZKsync Explorer",
      url: "https://explorer.zksync.io/",
      apiUrl: "https://block-explorer-api.mainnet.zksync.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xF9cda624FBC7e059355ce98a31693d299FACd963",
      blockCreated: 3908235
    },
    erc6492Verifier: {
      address: "0xfB688330379976DA81eB64Fe4BF50d7401763B9C",
      blockCreated: 45659388
    }
  }
});
const zksyncInMemoryNode = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 260,
  name: "ZKsync InMemory Node",
  network: "zksync-in-memory-node",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:8011"]
    }
  },
  testnet: true
});
const zksyncLocalCustomHyperchain = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 272,
  name: "ZKsync CLI Local Custom Hyperchain",
  nativeCurrency: { name: "BAT", symbol: "BAT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:15200"],
      webSocket: ["ws://localhost:15201"]
    }
  },
  blockExplorers: {
    default: {
      name: "ZKsync explorer",
      url: "http://localhost:15005/",
      apiUrl: "http://localhost:15005/api"
    }
  },
  testnet: true
});
const zksyncLocalHyperchain = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 270,
  name: "ZKsync CLI Local Hyperchain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:15100"],
      webSocket: ["ws://localhost:15101"]
    }
  },
  blockExplorers: {
    default: {
      name: "ZKsync explorer",
      url: "http://localhost:15005/",
      apiUrl: "http://localhost:15005/api"
    }
  },
  testnet: true
});
const zksyncLocalHyperchainL1 = /* @__PURE__ */ defineChain({
  id: 9,
  name: "ZKsync CLI Local Hyperchain L1",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:15045"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "http://localhost:15001/",
      apiUrl: "http://localhost:15001/api/v2"
    }
  },
  testnet: true
});
const zksyncLocalNode = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  id: 270,
  name: "ZKsync CLI Local Node",
  network: "zksync-cli-local-node",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:3050"]
    }
  },
  testnet: true
});
const zksyncSepoliaTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$4,
  blockTime: 200,
  id: 300,
  name: "ZKsync Sepolia Testnet",
  network: "zksync-sepolia-testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.era.zksync.dev"],
      webSocket: ["wss://sepolia.era.zksync.dev/ws"]
    }
  },
  blockExplorers: {
    default: {
      name: "ZKsync Explorer",
      url: "https://sepolia.explorer.zksync.io/",
      blockExplorerApi: "https://block-explorer-api.sepolia.zksync.dev/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xF9cda624FBC7e059355ce98a31693d299FACd963"
    },
    erc6492Verifier: {
      address: "0xfB688330379976DA81eB64Fe4BF50d7401763B9C",
      blockCreated: 3855712
    }
  },
  testnet: true
});
const zkXPLA = /* @__PURE__ */ defineChain({
  id: 375,
  name: "zkXPLA Mainnet",
  network: "zkxpla",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.zkxpla.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "zkXPLA Mainnet Explorer",
      url: "https://explorer.zkxpla.io",
      apiUrl: "https://explorer.zkxpla.io/api"
    }
  },
  testnet: false
});
const zkXPLATestnet = /* @__PURE__ */ defineChain({
  id: 475,
  name: "zkXPLA Testnet",
  network: "zkxpla-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.zkxpla.io"]
    }
  },
  blockExplorers: {
    default: {
      name: "zkXPLA Testnet Explorer",
      url: "https://testnet-explorer.zkxpla.io",
      apiUrl: "https://testnet-explorer.zkxpla.io/api"
    }
  },
  testnet: true
});
const sourceId$2 = 1;
const zora = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 7777777,
  name: "Zora",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.zora.energy"],
      webSocket: ["wss://rpc.zora.energy"]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://explorer.zora.energy",
      apiUrl: "https://explorer.zora.energy/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    disputeGameFactory: {
      [sourceId$2]: {
        address: "0xB0F15106fa1e473Ddb39790f197275BC979Aa37e"
      }
    },
    l2OutputOracle: {
      [sourceId$2]: {
        address: "0x9E6204F750cD866b299594e2aC9eA824E2e5f95c"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882
    },
    portal: {
      [sourceId$2]: {
        address: "0x1a0ad011913A150f69f6A19DF447A0CfD9551054"
      }
    },
    l1StandardBridge: {
      [sourceId$2]: {
        address: "0x3e2Ea9B92B7E48A52296fD261dc26fd995284631"
      }
    }
  },
  sourceId: sourceId$2
});
const sourceId$1 = 11155111;
const zoraSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 999999999,
  name: "Zora Sepolia",
  network: "zora-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Zora Sepolia",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.rpc.zora.energy"],
      webSocket: ["wss://sepolia.rpc.zora.energy"]
    }
  },
  blockExplorers: {
    default: {
      name: "Zora Sepolia Explorer",
      url: "https://sepolia.explorer.zora.energy/",
      apiUrl: "https://sepolia.explorer.zora.energy/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    l2OutputOracle: {
      [sourceId$1]: {
        address: "0x2615B481Bd3E5A1C0C7Ca3Da1bdc663E8615Ade9"
      }
    },
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 83160
    },
    portal: {
      [sourceId$1]: {
        address: "0xeffE2C6cA9Ab797D418f0D91eA60807713f3536f"
      }
    },
    l1StandardBridge: {
      [sourceId$1]: {
        address: "0x5376f1D543dcbB5BD416c56C189e4cB7399fCcCB"
      }
    }
  },
  sourceId: sourceId$1,
  testnet: true
});
const sourceId = 5;
const zoraTestnet = /* @__PURE__ */ defineChain({
  ...chainConfig$3,
  id: 999,
  name: "Zora Goerli Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Zora Goerli",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.rpc.zora.energy"],
      webSocket: ["wss://testnet.rpc.zora.energy"]
    }
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://testnet.explorer.zora.energy",
      apiUrl: "https://testnet.explorer.zora.energy/api"
    }
  },
  contracts: {
    ...chainConfig$3.contracts,
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 189123
    },
    portal: {
      [sourceId]: {
        address: "0xDb9F51790365e7dc196e7D072728df39Be958ACe"
      }
    }
  },
  sourceId,
  testnet: true
});
export {
  abey,
  abstract,
  abstractTestnet,
  acala,
  acria,
  adf,
  adi,
  agungTestnet,
  aioz,
  alephZero,
  alephZeroTestnet,
  alienx,
  alienxHalTestnet,
  alpenTestnet,
  ancient8,
  ancient8Sepolia,
  anvil,
  apeChain,
  apexTestnet,
  apollo,
  arbitrum,
  arbitrumGoerli,
  arbitrumNova,
  arbitrumSepolia,
  arc,
  arcTestnet,
  arenaz,
  areonNetwork,
  areonNetworkTestnet,
  areum,
  artelaTestnet,
  arthera,
  artheraTestnet,
  assetChain,
  assetChainTestnet,
  astar,
  astarZkEVM,
  astarZkyoto,
  atletaOlympia,
  aurora,
  auroraTestnet,
  auroria,
  autheoTestnet,
  avalanche,
  avalancheFuji,
  b3,
  b3Sepolia,
  bahamut,
  base,
  baseGoerli,
  basePreconf,
  baseSepolia,
  baseSepoliaPreconf,
  basecampTestnet,
  battlechainTestnet,
  beam,
  beamTestnet,
  bearNetworkChainMainnet,
  bearNetworkChainTestnet,
  berachain,
  berachainBepolia,
  berachainTestnet,
  berachainTestnetbArtio,
  bevmMainnet,
  bifrost,
  birdlayer,
  bitTorrent,
  bitTorrentTestnet,
  bitgert,
  bitkub,
  bitkubTestnet,
  bitlayer,
  bitlayerTestnet,
  bitrock,
  blast,
  blastSepolia,
  bob,
  bobSepolia,
  boba,
  bobaSepolia,
  boolBetaMainnet,
  botanix,
  botanixTestnet,
  bounceBit,
  bounceBitTestnet,
  bronos,
  bronosTestnet,
  bsc,
  bscGreenfield,
  b as bscTestnet,
  bsquared,
  bsquaredTestnet,
  btr,
  btrTestnet,
  bxn,
  bxnTestnet,
  cannon,
  canto,
  celo,
  celoAlfajores,
  celoSepolia,
  chang,
  chiliz,
  chips,
  citrate,
  citrea,
  citreaTestnet,
  classic,
  codex,
  codexTestnet,
  coinbit,
  coinex,
  confluxESpace,
  confluxESpaceTestnet,
  coreDao,
  coreTestnet1,
  coreTestnet2,
  corn,
  cornTestnet,
  cpchain,
  crab,
  creatorTestnet,
  creditCoin3Devnet,
  creditCoin3Mainnet,
  creditCoin3Testnet,
  cronos,
  cronosTestnet,
  cronoszkEVM,
  cronoszkEVMTestnet,
  crossbell,
  crossfi,
  curtis,
  cyber,
  cyberTestnet,
  dailyNetwork,
  dailyNetworkTestnet,
  darwinia,
  datahavenTestnet,
  dbkchain,
  dchain,
  dchainTestnet,
  defichainEvm,
  defichainEvmTestnet,
  degen,
  dfk,
  diode,
  disChain,
  dodochainTestnet,
  dogechain,
  domaTestnet,
  donatuz,
  dosChain,
  dosChainTestnet,
  dreyerxMainnet,
  dreyerxTestnet,
  dustboyIoT,
  dymension,
  eden,
  edexa,
  edexaTestnet,
  edgeless,
  edgelessTestnet,
  edgeware,
  edgewareTestnet,
  eduChain,
  eduChainTestnet,
  elastos,
  elastosTestnet,
  electroneum,
  electroneumTestnet,
  elysiumTestnet,
  energy,
  eni,
  eniTestnet,
  enuls,
  eon,
  eos,
  eosTestnet,
  eteria,
  etherlink,
  etherlinkShadownetTestnet,
  etherlinkTestnet,
  ethernity,
  etp,
  evmos,
  evmosTestnet,
  excelonMainnet,
  expanse,
  exsat,
  exsatTestnet,
  fantom,
  fantomSonicTestnet,
  fantomTestnet,
  fibo,
  filecoin,
  filecoinCalibration,
  filecoinHyperspace,
  fireChain,
  flame,
  flare,
  flareTestnet,
  flowMainnet,
  flowPreviewnet,
  flowTestnet,
  fluence,
  fluenceStage,
  fluenceTestnet,
  fluent,
  fluentDevnet,
  fluentTestnet,
  form,
  formTestnet,
  forma,
  formicarium,
  forta,
  foundry,
  fraxtal,
  fraxtalTestnet,
  funkiMainnet,
  funkiSepolia,
  fuse,
  fuseSparknet,
  fusion,
  fusionTestnet,
  garnet,
  gatechain,
  geist,
  genesys,
  gensyn,
  giwaSepolia,
  giwaSepoliaPreconf,
  glideL1Protocol,
  glideL2Protocol,
  gnosis,
  gnosisChiado,
  goChain,
  goat,
  gobi,
  godwoken,
  goerli,
  graphite,
  graphiteTestnet,
  grav,
  gravity,
  gunz,
  guruNetwork,
  guruTestnet,
  ham,
  happychainTestnet,
  haqqMainnet,
  haqqTestedge2,
  hardhat,
  harmonyOne,
  hashkey,
  hashkeyTestnet,
  haustTestnet,
  hedera,
  hederaPreviewnet,
  hederaTestnet,
  hela,
  heliosTestnet,
  hemi,
  hemiSepolia,
  henesys,
  holesky,
  hoodi,
  horizenTestnet,
  hpb,
  hpp,
  hppSepolia,
  huddle01Mainnet,
  huddle01Testnet,
  humanity,
  humanityTestnet,
  humanode,
  humanodeTestnet5,
  hychain,
  hychainTestnet,
  hyperEvm,
  hyperEvm as hyperliquid,
  hyperliquidEvmTestnet,
  iSunCoin,
  icbNetwork,
  idchain,
  igra,
  immutableZkEvm,
  immutableZkEvmTestnet,
  inEVM,
  initVerse,
  initVerseGenesis,
  injective,
  injectiveTestnet,
  ink,
  inkSepolia,
  iota,
  iotaTestnet,
  iotex,
  iotexTestnet,
  jasmyChain,
  jasmyChainTestnet,
  jbc,
  jbcTestnet,
  jocMainnet,
  jocTestnet,
  jovay,
  jovaySepolia,
  juneo,
  juneoBCH1Chain,
  juneoDAI1Chain,
  juneoDOGE1Chain,
  juneoEUR1Chain,
  juneoGLD1Chain,
  juneoLINK1Chain,
  juneoLTC1Chain,
  juneoSGD1Chain,
  juneoSocotraTestnet,
  juneoUSD1Chain,
  juneoUSDT1Chain,
  juneomBTC1Chain,
  kaia,
  kairos,
  kakarotSepolia,
  kakarotStarknetSepolia,
  kardiaChain,
  karura,
  katana,
  kava,
  kavaTestnet,
  kcc,
  kii,
  kiiTestnetOro,
  kinto,
  klaytn,
  klaytnBaobab,
  koi,
  kroma,
  kromaSepolia,
  krown,
  l3x,
  l3xTestnet,
  ladyChain,
  lavita,
  lens,
  lensTestnet,
  lestnet,
  lightlinkPegasus,
  lightlinkPhoenix,
  linea,
  lineaGoerli,
  lineaSepolia,
  lineaTestnet,
  lisk,
  liskSepolia,
  loadAlphanet,
  localhost,
  loop,
  lukso,
  luksoTestnet,
  lumiaMainnet,
  lumiaTestnet,
  lumoz,
  lumozTestnet,
  luxeports,
  lycan,
  lyra,
  mainnet,
  mandala,
  manta,
  mantaSepoliaTestnet,
  mantaTestnet,
  mantle,
  mantleSepoliaTestnet,
  mantleTestnet,
  mantraDuKongEVMTestnet,
  mantraEVM,
  mapProtocol,
  matchain,
  matchainTestnet,
  mchVerse,
  megaeth,
  megaethTestnet,
  mekong,
  meld,
  memecore,
  merlin,
  merlinErigonTestnet,
  metachain,
  metachainIstanbul,
  metadium,
  metalL2,
  meter,
  meterTestnet,
  metis,
  metisGoerli,
  metisSepolia,
  mev,
  mevTestnet,
  mezo,
  mezoTestnet,
  mint,
  mintSepoliaTestnet,
  mitosisTestnet,
  mizuhikiTestnetAwaji,
  mode,
  modeTestnet,
  monad,
  monadTestnet,
  moonbaseAlpha,
  moonbeam,
  moonbeamDev,
  moonriver,
  morph,
  morphHolesky,
  morphSepolia,
  nahmii,
  nautilus,
  near,
  nearTestnet,
  neonDevnet,
  neonMainnet,
  neoxMainnet,
  neoxT4,
  newton,
  nexi,
  nexilix,
  nibiru,
  nitrographTestnet,
  nomina,
  oasisTestnet,
  oasys,
  odysseyTestnet,
  okc,
  omax,
  omni,
  omniOmega,
  oneWorld,
  oortMainnetDev,
  opBNB,
  opBNBTestnet,
  openledger,
  optimism,
  optimismGoerli,
  optimismSepolia,
  optopia,
  optopiaTestnet,
  orderly,
  orderlySepolia,
  otimDevnet,
  palm,
  palmTestnet,
  paseoPassetHub,
  peaq,
  pgn,
  pgnTestnet,
  phoenix,
  planq,
  plasma,
  plasmaDevnet,
  plasmaTestnet,
  playfiAlbireo,
  plinga,
  plume,
  plumeDevnet,
  plumeMainnet,
  plumeSepolia,
  plumeTestnet,
  polterTestnet,
  polygon,
  polygonAmoy,
  polygonMumbai,
  polygonZkEvm,
  polygonZkEvmCardona,
  polygonZkEvmTestnet,
  polynomial,
  polynomialSepolia,
  potos,
  potosTestnet,
  premiumBlockTestnet,
  pulsechain,
  pulsechainV4,
  pumpfiTestnet,
  pyrope,
  qMainnet,
  qTestnet,
  ql1,
  quai,
  quaiTestnet,
  radius,
  radiusTestnet,
  reactiveTestnet,
  real,
  redbellyMainnet,
  redbellyTestnet,
  reddio,
  reddioSepolia,
  redstone,
  rei,
  reyaNetwork,
  rise,
  riseTestnet,
  rivalz,
  rollux,
  rolluxTestnet,
  ronin,
  root,
  rootPorcini,
  rootstock,
  rootstockTestnet,
  rss3,
  rss3Sepolia,
  saakuru,
  saga,
  saigon,
  sanko,
  sapphire,
  sapphireTestnet,
  satoshiVM,
  satoshiVMTestnet,
  scroll,
  scrollSepolia,
  sei,
  seiTestnet,
  seismicDevnet,
  sentrix,
  sentrixTestnet,
  sepolia,
  shape,
  shapeSepolia,
  shardeum,
  shardeumSphinx,
  shibarium,
  shibariumTestnet,
  shiden,
  shimmer,
  shimmerTestnet,
  sidraChain,
  silentData,
  silicon,
  siliconSepolia,
  sixProtocol,
  skaleBase,
  skaleBaseSepoliaTestnet,
  skaleBlockBrawlers,
  skaleCalypso,
  skaleCalypsoTestnet,
  skaleCryptoBlades,
  skaleCryptoColosseum,
  skaleEuropa,
  skaleEuropaTestnet,
  skaleExorde,
  skaleHumanProtocol,
  skaleNebula,
  skaleNebulaTestnet,
  skaleRazor,
  skaleTitan,
  skaleTitanTestnet,
  sketchpad,
  snax,
  snaxTestnet,
  somnia,
  somniaTestnet,
  soneium,
  soneiumMinato,
  songbird,
  songbirdTestnet,
  sonic,
  sonicBlazeTestnet,
  sonicTestnet,
  sophon,
  sophonTestnet,
  sova,
  sovaSepolia,
  spicy,
  stable,
  stableTestnet,
  statusSepolia as statusNetworkSepolia,
  statusSepolia,
  step,
  story,
  storyAeneid,
  storyOdyssey,
  storyTestnet,
  stratis,
  subtensorEvm,
  superlumio,
  superposition,
  superseed,
  superseedSepolia,
  surgeTestnet,
  swan,
  swanProximaTestnet,
  swanSaturnTestnet,
  swellchain,
  swellchainTestnet,
  swissdlt,
  syscoin,
  syscoinTestnet,
  tac,
  tacSPB,
  taiko,
  taikoHekla,
  taikoHoodi,
  taikoJolnir,
  taikoKatla,
  taikoTestnetSepolia,
  taraxa,
  taraxaTestnet,
  teaSepolia,
  telcoinTestnet,
  telos,
  telosTestnet,
  tempo,
  tempoDevnet,
  tempoLocalnet,
  tempo as tempoMainnet,
  tempoModerato,
  tempoModerato as tempoTestnet,
  tenet,
  ternoa,
  thaiChain,
  that,
  theta,
  thetaTestnet,
  thunderCore,
  thunderTestnet,
  tiktrixTestnet,
  tomb,
  treasure,
  treasureTopaz,
  tron,
  tronNile,
  tronShasta,
  ubiq,
  ultra,
  ultraTestnet,
  ultron,
  ultronTestnet,
  unichain,
  unichainSepolia,
  unique,
  uniqueOpal,
  uniqueQuartz,
  unreal,
  valygoNft,
  valygoSmartchain,
  vana,
  vanaMoksha,
  vanar,
  vechain,
  velas,
  viction,
  victionTestnet,
  vision,
  visionTestnet,
  wanchain,
  wanchainTestnet,
  weaveVMAlphanet,
  wemix,
  wemixTestnet,
  westendAssetHub,
  whitechain,
  whitechainTestnet,
  wmcTestnet,
  worldLand,
  worldchain,
  worldchainSepolia,
  xLayerTestnet as x1Testnet,
  xLayer,
  xLayerTestnet,
  xai,
  xaiTestnet,
  xdc,
  xdcTestnet,
  xgr,
  xoneMainnet,
  xoneTestnet,
  xphereMainnet,
  xphereTestnet,
  xpla,
  xrOne,
  xrSepolia,
  xrplevm,
  xrplevmDevnet,
  xrplevmTestnet,
  yooldoVerse,
  yooldoVerseTestnet,
  zenchainTestnet,
  zeniq,
  zeroG,
  zeroGGalileoTestnet,
  zeroGMainnet,
  zeroGTestnet,
  zeroNetwork,
  zetachain,
  zetachainAthensTestnet,
  zhejiang,
  zilliqa,
  zilliqaTestnet,
  zircuit,
  zircuitGarfieldTestnet,
  zkFair,
  zkFairTestnet,
  zkLinkNova,
  zkLinkNovaSepoliaTestnet,
  zksync as zkSync,
  zksyncInMemoryNode as zkSyncInMemoryNode,
  zksyncLocalNode as zkSyncLocalNode,
  zksyncSepoliaTestnet as zkSyncSepoliaTestnet,
  zkXPLA,
  zkXPLATestnet,
  zksync,
  zksyncInMemoryNode,
  zksyncLocalCustomHyperchain,
  zksyncLocalHyperchain,
  zksyncLocalHyperchainL1,
  zksyncLocalNode,
  zksyncSepoliaTestnet,
  zora,
  zoraSepolia,
  zoraTestnet
};
