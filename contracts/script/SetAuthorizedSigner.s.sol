// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SuknidPlates} from "../src/SuknidPlates.sol";

contract SetAuthorizedSignerScript is Script {
    function run() external {
        address contractAddr = vm.envAddress("CONTRACT_ADDRESS");
        address newSigner = vm.envAddress("NEW_SIGNER");

        vm.startBroadcast();
        SuknidPlates(contractAddr).setAuthorizedSigner(newSigner);
        vm.stopBroadcast();

        console2.log("SIGNER_ROTATED contract=%s newSigner=%s", contractAddr, newSigner);
    }
}
