// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SuknidPlates} from "../src/SuknidPlates.sol";

contract DeployScript is Script {
    function run() external {
        address signer = vm.envAddress("SIGNER_ADDRESS");
        address treasury = vm.envAddress("ARTIST_TREASURY");

        vm.startBroadcast();
        SuknidPlates plates = new SuknidPlates(signer, treasury);
        vm.stopBroadcast();

        console2.log("DEPLOYED address=%s block=%d", address(plates), block.number);
    }
}
