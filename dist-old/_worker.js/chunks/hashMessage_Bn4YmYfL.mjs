globalThis.process ??= {};
globalThis.process.env ??= {};
import { s as stringToHex, b as bytesToHex, c as size, k as keccak256 } from "./isAddress_CvPYbxIx.mjs";
import { c as concat } from "./isAddressEqual_cc58LofG.mjs";
const presignMessagePrefix = "Ethereum Signed Message:\n";
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}
export {
  hashMessage as h
};
