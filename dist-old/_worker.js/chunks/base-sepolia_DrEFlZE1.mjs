globalThis.process ??= {};
globalThis.process.env ??= {};
const _note = "Placeholder — run scripts/deploy-contract.sh to populate after deploying to Base Sepolia.";
const address = "";
const chainId = 84532;
const deployBlock = 0;
const abi = [{ "type": "constructor", "inputs": [{ "name": "signer", "type": "address" }, { "name": "treasury", "type": "address" }], "stateMutability": "nonpayable" }, { "type": "function", "name": "mintWithVoucher", "inputs": [{ "name": "voucher", "type": "tuple", "components": [{ "name": "tokenId", "type": "uint256" }, { "name": "designId", "type": "string" }, { "name": "price", "type": "uint256" }, { "name": "artistTreasury", "type": "address" }, { "name": "expiry", "type": "uint256" }, { "name": "buyer", "type": "address" }, { "name": "cidHash", "type": "bytes32" }] }, { "name": "signature", "type": "bytes" }, { "name": "cid", "type": "string" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "setAuthorizedSigner", "inputs": [{ "name": "newSigner", "type": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "tokenURI", "inputs": [{ "name": "tokenId", "type": "uint256" }], "outputs": [{ "name": "", "type": "string" }], "stateMutability": "view" }, { "type": "function", "name": "authorizedSigner", "inputs": [], "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view" }, { "type": "function", "name": "ownerOf", "inputs": [{ "name": "tokenId", "type": "uint256" }], "outputs": [{ "name": "", "type": "address" }], "stateMutability": "view" }, { "type": "function", "name": "balanceOf", "inputs": [{ "name": "owner", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view" }, { "type": "event", "name": "PlateMinted", "inputs": [{ "name": "tokenId", "type": "uint256", "indexed": true }, { "name": "buyer", "type": "address", "indexed": true }, { "name": "designId", "type": "string", "indexed": false }], "anonymous": false }, { "type": "event", "name": "SignerRotated", "inputs": [{ "name": "oldSigner", "type": "address", "indexed": true }, { "name": "newSigner", "type": "address", "indexed": true }], "anonymous": false }, { "type": "event", "name": "Transfer", "inputs": [{ "name": "from", "type": "address", "indexed": true }, { "name": "to", "type": "address", "indexed": true }, { "name": "tokenId", "type": "uint256", "indexed": true }], "anonymous": false }];
const baseSepolia = {
  _note,
  address,
  chainId,
  deployBlock,
  abi
};
export {
  _note,
  abi,
  address,
  chainId,
  baseSepolia as default,
  deployBlock
};
