// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SuknidPlatesV2} from "../src/SuknidPlatesV2.sol";

/// @notice Deploy SuknidPlatesV2 to BSC Testnet or Mainnet
///
/// Usage (BSC Testnet):
///   forge script script/DeployV2.s.sol \
///     --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545 \
///     --private-key $DEPLOYER_PRIVATE_KEY \
///     --broadcast
///
/// Environment variables required:
///   AUTHORIZED_SIGNER  — address that signs vouchers (= your server signer key)
///   PLATFORM_TREASURY  — address that receives the 3% platform fee
///
/// USDT addresses:
///   BSC Testnet:  0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
///   BSC Mainnet:  0x55d398326f99059fF775485246999027B3197955
contract DeployV2 is Script {
    // BSC Testnet USDT
    address public constant USDT_TESTNET = 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd;
    // BSC Mainnet USDT
    address public constant USDT_MAINNET = 0x55d398326f99059fF775485246999027B3197955;

    function run() external {
        address authorizedSigner = vm.envAddress("AUTHORIZED_SIGNER");
        address platformTreasury = vm.envAddress("PLATFORM_TREASURY");

        // Detect chain: BSC Testnet = 97, BSC Mainnet = 56
        uint256 chainId = block.chainid;
        address usdtAddress;
        if (chainId == 97) {
            usdtAddress = USDT_TESTNET;
            console.log("Deploying to BSC Testnet (chain ID 97)");
        } else if (chainId == 56) {
            usdtAddress = USDT_MAINNET;
            console.log("Deploying to BSC Mainnet (chain ID 56)");
        } else {
            revert("Unsupported chain. Use BSC Testnet (97) or BSC Mainnet (56)");
        }

        console.log("  Signer:          ", authorizedSigner);
        console.log("  Treasury:        ", platformTreasury);
        console.log("  USDT:            ", usdtAddress);

        vm.startBroadcast();

        SuknidPlatesV2 contract_ = new SuknidPlatesV2(
            authorizedSigner,
            platformTreasury,
            usdtAddress
        );

        vm.stopBroadcast();

        console.log("SuknidPlatesV2 deployed at:", address(contract_));
        console.log("Set PUBLIC_CONTRACT_ADDRESS =", address(contract_));
    }
}
