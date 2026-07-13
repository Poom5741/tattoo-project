// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {SuknidPlates} from "../src/SuknidPlates.sol";

// Acts as both buyer and malicious treasury.
// On first call, mint succeeds and triggers payment to self (treasury == address(this)).
// On receive(), tries to re-enter mintWithVoucher with a second voucher.
// ReentrancyGuard should cause the re-entrant call to revert.
contract MaliciousTreasury {
    SuknidPlates public target;
    SuknidPlates.LazyMintVoucher public reentrantVoucher;
    bytes public reentrantSig;
    string public reentrantCid;
    bool public shouldAttack;

    function setup(
        SuknidPlates _target,
        SuknidPlates.LazyMintVoucher memory voucher,
        bytes memory sig,
        string memory cid
    ) external {
        target = _target;
        reentrantVoucher = voucher;
        reentrantSig = sig;
        reentrantCid = cid;
    }

    receive() external payable {
        if (shouldAttack) {
            shouldAttack = false;
            // Re-enter with a second voucher (this is the re-entrancy attempt).
            target.mintWithVoucher{value: msg.value}(reentrantVoucher, reentrantSig, reentrantCid);
        }
    }

    function mint(
        SuknidPlates.LazyMintVoucher memory voucher,
        bytes memory sig,
        string memory cid
    ) external payable {
        shouldAttack = true;
        target.mintWithVoucher{value: msg.value}(voucher, sig, cid);
    }
}

contract SuknidPlatesTest is Test {
    SuknidPlates plates;

    uint256 signerKey = 0xA11CE;
    address signer;
    address treasury;
    address buyer;
    uint256 buyerKey = 0xB0B;

    // EIP-712 typehash — must match the contract constant exactly.
    bytes32 constant VOUCHER_TYPEHASH = keccak256(
        "LazyMintVoucher(uint256 tokenId,string designId,uint256 price,address artistTreasury,uint256 expiry,address buyer,bytes32 cidHash)"
    );

    function setUp() public {
        signer = vm.addr(signerKey);
        treasury = makeAddr("treasury");
        buyer = vm.addr(buyerKey);

        plates = new SuknidPlates(signer, treasury);
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    function _makeVoucher(
        uint256 tokenId,
        string memory designId,
        uint256 price,
        address _treasury,
        uint256 expiry,
        address _buyer,
        string memory cid
    ) internal pure returns (SuknidPlates.LazyMintVoucher memory) {
        return SuknidPlates.LazyMintVoucher({
            tokenId: tokenId,
            designId: designId,
            price: price,
            artistTreasury: _treasury,
            expiry: expiry,
            buyer: _buyer,
            cidHash: keccak256(bytes(cid))
        });
    }

    function _sign(SuknidPlates.LazyMintVoucher memory voucher, uint256 pk)
        internal
        view
        returns (bytes memory)
    {
        bytes32 structHash = keccak256(abi.encode(
            VOUCHER_TYPEHASH,
            voucher.tokenId,
            keccak256(bytes(voucher.designId)),
            voucher.price,
            voucher.artistTreasury,
            voucher.expiry,
            voucher.buyer,
            voucher.cidHash
        ));
        bytes32 digest = plates.hashTypedDataV4(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return abi.encodePacked(r, s, v);
    }

    // ─── tests ──────────────────────────────────────────────────────────────

    function testSuccessfulMint() public {
        string memory cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            1, "d1", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cid
        );
        bytes memory sig = _sign(voucher, signerKey);

        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);

        assertEq(plates.ownerOf(1), buyer);
        assertEq(plates.tokenURI(1), string.concat("ipfs://", cid));
    }

    function testRevertOnExpiredVoucher() public {
        string memory cid = "bafytest1";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            2, "d2", 0.01 ether, treasury, block.timestamp - 1, buyer, cid
        );
        bytes memory sig = _sign(voucher, signerKey);

        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert(bytes("EXPIRED"));
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);
    }

    function testRevertOnWrongSigner() public {
        uint256 randomKey = 0xDEAD;
        string memory cid = "bafytest2";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            3, "d3", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cid
        );
        bytes memory sig = _sign(voucher, randomKey); // signed with wrong key

        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert(bytes("BAD_SIG"));
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);
    }

    function testRevertOnDoubleClaim() public {
        string memory cid = "bafytest3";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            4, "d4", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cid
        );
        bytes memory sig = _sign(voucher, signerKey);

        vm.deal(buyer, 1 ether);
        vm.startPrank(buyer);
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);

        vm.expectRevert(bytes("MINTED"));
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);
        vm.stopPrank();
    }

    function testRevertOnUnderpayment() public {
        string memory cid = "bafytest4";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            5, "d5", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cid
        );
        bytes memory sig = _sign(voucher, signerKey);

        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert(bytes("UNDERPAID"));
        plates.mintWithVoucher{value: 0.001 ether}(voucher, sig, cid);
    }

    function testRevertOnWrongBuyer() public {
        address impostor = makeAddr("impostor");
        string memory cid = "bafytest5";
        // voucher is bound to `buyer` but impostor tries to redeem
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            6, "d6", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cid
        );
        bytes memory sig = _sign(voucher, signerKey);

        vm.deal(impostor, 1 ether);
        vm.prank(impostor);
        vm.expectRevert(bytes("WRONG_BUYER"));
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);
    }

    function testRevertOnWrongChainId() public {
        string memory cid = "bafytest6";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            7, "d7", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cid
        );

        // Sign against a contract deployed at chainId=1 (different domain separator).
        // We do this by deploying a shadow contract on a forked chainId.
        vm.chainId(1);
        SuknidPlates shadowPlates = new SuknidPlates(signer, treasury);
        bytes32 structHash = keccak256(abi.encode(
            VOUCHER_TYPEHASH,
            voucher.tokenId,
            keccak256(bytes(voucher.designId)),
            voucher.price,
            voucher.artistTreasury,
            voucher.expiry,
            voucher.buyer,
            voucher.cidHash
        ));
        bytes32 wrongDigest = shadowPlates.hashTypedDataV4(structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, wrongDigest);
        bytes memory sig = abi.encodePacked(r, s, v);

        // Switch back to default chainId (31337) for the real contract.
        vm.chainId(31337);

        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert(bytes("BAD_SIG"));
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);
    }

    function testRevertOnWrongCid() public {
        string memory cidA = "bafytest-cidA";
        string memory cidB = "bafytest-cidB";
        // Voucher is signed with cidHash for cidA.
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            8, "d8", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cidA
        );
        bytes memory sig = _sign(voucher, signerKey);

        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert(bytes("BAD_CID"));
        // But caller submits cidB — substitution attempt.
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cidB);
    }

    function testSetAuthorizedSignerOnlyOwner() public {
        address nonOwner = makeAddr("nonOwner");
        address newSigner = makeAddr("newSigner");

        vm.prank(nonOwner);
        vm.expectRevert();
        plates.setAuthorizedSigner(newSigner);
    }

    function testReentrancyBlocked() public {
        MaliciousTreasury malTreasury = new MaliciousTreasury();
        vm.deal(address(malTreasury), 1 ether);

        // First voucher: malTreasury is both buyer and treasury.
        string memory cid1 = "bafytest-reentrant-1";
        SuknidPlates.LazyMintVoucher memory voucher1 = _makeVoucher(
            9, "d9", 0.01 ether, address(malTreasury), block.timestamp + 1 hours, address(malTreasury), cid1
        );
        bytes memory sig1 = _sign(voucher1, signerKey);

        // Second voucher: used for the re-entry attempt inside receive().
        string memory cid2 = "bafytest-reentrant-2";
        SuknidPlates.LazyMintVoucher memory voucher2 = _makeVoucher(
            91, "d91", 0.01 ether, address(malTreasury), block.timestamp + 1 hours, address(malTreasury), cid2
        );
        bytes memory sig2 = _sign(voucher2, signerKey);

        // Store the re-entrant call params.
        malTreasury.setup(plates, voucher2, sig2, cid2);

        // The outer mint succeeds; receive() fires and tries to re-enter.
        // ReentrancyGuard causes the nested call to revert, which bubbles up through
        // the treasury payment call, causing the entire outer tx to revert.
        vm.expectRevert();
        malTreasury.mint{value: 0.01 ether}(voucher1, sig1, cid1);
    }

    function testRevertOnRotatedSigner() public {
        uint256 newSignerKey = 0xC0FFEE;
        address newSignerAddr = vm.addr(newSignerKey);

        // Rotate signer to newSignerAddr.
        plates.setAuthorizedSigner(newSignerAddr);

        string memory cid = "bafytest-rotated";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            10, "d10", 0.01 ether, treasury, block.timestamp + 1 hours, buyer, cid
        );
        // Sign with the OLD key.
        bytes memory sig = _sign(voucher, signerKey);

        vm.deal(buyer, 1 ether);
        vm.prank(buyer);
        vm.expectRevert(bytes("BAD_SIG"));
        plates.mintWithVoucher{value: 0.01 ether}(voucher, sig, cid);
    }

    function testTokenURIReturnsIpfs() public {
        string memory cid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
        SuknidPlates.LazyMintVoucher memory voucher = _makeVoucher(
            11, "d11", 0, treasury, block.timestamp + 1 hours, buyer, cid
        );
        bytes memory sig = _sign(voucher, signerKey);

        vm.prank(buyer);
        plates.mintWithVoucher{value: 0}(voucher, sig, cid);

        string memory uri = plates.tokenURI(11);
        assertEq(uri, "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi");
    }
}
