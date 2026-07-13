// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {SuknidPlatesV2} from "../src/SuknidPlatesV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Minimal mock ERC-20 for testing USDT transfers
contract MockUSDT {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    string public name = "Mock USDT";
    string public symbol = "USDT";
    uint8 public decimals = 18;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "insufficient balance");
        require(allowance[from][msg.sender] >= amount, "insufficient allowance");
        balanceOf[from] -= amount;
        allowance[from][msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract SuknidPlatesV2Test is Test {
    SuknidPlatesV2 public nft;
    MockUSDT public usdt;

    uint256 internal signerKey = 0xA11CE;
    address internal signer;
    address internal treasury = address(0x1111);
    address internal artist = address(0x2222);
    address internal buyer = address(0x3333);
    address internal buyer2 = address(0x4444);

    uint256 internal constant PRICE = 100 ether; // 100 USDT (18 decimals)

    function setUp() public {
        signer = vm.addr(signerKey);
        usdt = new MockUSDT();
        nft = new SuknidPlatesV2(signer, treasury, address(usdt));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────

    function _makeVoucher(
        uint256 tokenId,
        string memory designId,
        uint256 price,
        address artistTreasury,
        address buyerAddr,
        bool isSoulbound,
        uint96 royaltyBps
    ) internal view returns (SuknidPlatesV2.LazyMintVoucher memory) {
        string memory cid = "QmTestCID123";
        bytes32 cidHash = keccak256(bytes(cid));
        return SuknidPlatesV2.LazyMintVoucher({
            tokenId: tokenId,
            designId: designId,
            price: price,
            artistTreasury: artistTreasury,
            expiry: block.timestamp + 900,
            buyer: buyerAddr,
            cidHash: cidHash,
            soulbound: isSoulbound,
            royaltyBps: royaltyBps
        });
    }

    function _sign(SuknidPlatesV2.LazyMintVoucher memory v) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(abi.encode(
            keccak256("LazyMintVoucher(uint256 tokenId,string designId,uint256 price,address artistTreasury,uint256 expiry,address buyer,bytes32 cidHash,bool soulbound,uint96 royaltyBps)"),
            v.tokenId,
            keccak256(bytes(v.designId)),
            v.price,
            v.artistTreasury,
            v.expiry,
            v.buyer,
            v.cidHash,
            v.soulbound,
            v.royaltyBps
        ));
        bytes32 digest = nft.hashTypedDataV4(structHash);
        (uint8 vv, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        return abi.encodePacked(r, s, vv);
    }

    function _mintForBuyer(uint256 tokenId, bool isSoulbound, uint96 royaltyBps) internal {
        usdt.mint(buyer, PRICE);
        SuknidPlatesV2.LazyMintVoucher memory voucher = _makeVoucher(
            tokenId, "design-1", PRICE, artist, buyer, isSoulbound, royaltyBps
        );
        bytes memory sig = _sign(voucher);
        vm.startPrank(buyer);
        usdt.approve(address(nft), PRICE);
        nft.mintWithVoucher(voucher, sig, "QmTestCID123");
        vm.stopPrank();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Mint tests
    // ─────────────────────────────────────────────────────────────────────

    function test_mint_basic() public {
        uint256 artistBefore = usdt.balanceOf(artist);
        uint256 treasuryBefore = usdt.balanceOf(treasury);

        _mintForBuyer(1, false, 1000); // 10% royalty

        assertEq(nft.ownerOf(1), buyer);
        assertEq(usdt.balanceOf(buyer), 0);

        // Platform gets 3% = 3 USDT
        uint256 expectedFee = (PRICE * 300) / 10000;
        assertEq(usdt.balanceOf(treasury) - treasuryBefore, expectedFee);

        // Artist gets 97% = 97 USDT
        uint256 expectedArtist = PRICE - expectedFee;
        assertEq(usdt.balanceOf(artist) - artistBefore, expectedArtist);
    }

    function test_mint_soulbound_flag() public {
        _mintForBuyer(1, true, 0);
        assertEq(nft.soulbound(1), true);
    }

    function test_mint_resellable_no_soulbound() public {
        _mintForBuyer(1, false, 1000);
        assertEq(nft.soulbound(1), false);
    }

    function test_mint_royalty_info() public {
        _mintForBuyer(1, false, 1000); // 10% royalty = 1000 bps
        (address receiver, uint256 amount) = nft.royaltyInfo(1, PRICE);
        assertEq(receiver, artist);
        assertEq(amount, (PRICE * 1000) / 10000); // 10%
    }

    function test_mint_expired_voucher() public {
        SuknidPlatesV2.LazyMintVoucher memory voucher = _makeVoucher(
            1, "design-1", PRICE, artist, buyer, false, 0
        );
        voucher.expiry = block.timestamp - 1;
        bytes memory sig = _sign(voucher);

        usdt.mint(buyer, PRICE);
        vm.startPrank(buyer);
        usdt.approve(address(nft), PRICE);
        vm.expectRevert(SuknidPlatesV2.EXPIRED.selector);
        nft.mintWithVoucher(voucher, sig, "QmTestCID123");
        vm.stopPrank();
    }

    function test_mint_wrong_buyer() public {
        SuknidPlatesV2.LazyMintVoucher memory voucher = _makeVoucher(
            1, "design-1", PRICE, artist, buyer, false, 0
        );
        bytes memory sig = _sign(voucher);

        usdt.mint(buyer2, PRICE);
        vm.startPrank(buyer2);
        usdt.approve(address(nft), PRICE);
        vm.expectRevert(SuknidPlatesV2.WRONG_BUYER.selector);
        nft.mintWithVoucher(voucher, sig, "QmTestCID123");
        vm.stopPrank();
    }

    function test_mint_bad_sig() public {
        SuknidPlatesV2.LazyMintVoucher memory voucher = _makeVoucher(
            1, "design-1", PRICE, artist, buyer, false, 0
        );
        // Sign with wrong key
        bytes32 structHash = keccak256(abi.encode(
            keccak256("LazyMintVoucher(uint256 tokenId,string designId,uint256 price,address artistTreasury,uint256 expiry,address buyer,bytes32 cidHash,bool soulbound,uint96 royaltyBps)"),
            voucher.tokenId,
            keccak256(bytes(voucher.designId)),
            voucher.price,
            voucher.artistTreasury,
            voucher.expiry,
            voucher.buyer,
            voucher.cidHash,
            voucher.soulbound,
            voucher.royaltyBps
        ));
        bytes32 digest = nft.hashTypedDataV4(structHash);
        (uint8 vv, bytes32 r, bytes32 s) = vm.sign(0xBADBAD, digest);
        bytes memory badSig = abi.encodePacked(r, s, vv);

        usdt.mint(buyer, PRICE);
        vm.startPrank(buyer);
        usdt.approve(address(nft), PRICE);
        vm.expectRevert(SuknidPlatesV2.BAD_SIG.selector);
        nft.mintWithVoucher(voucher, badSig, "QmTestCID123");
        vm.stopPrank();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Soulbound transfer revert tests
    // ─────────────────────────────────────────────────────────────────────

    function test_soulbound_transfer_reverts() public {
        _mintForBuyer(1, true, 0);

        vm.startPrank(buyer);
        vm.expectRevert(SuknidPlatesV2.SOULBOUND.selector);
        nft.transferFrom(buyer, buyer2, 1);
        vm.stopPrank();
    }

    function test_soulbound_safeTransfer_reverts() public {
        _mintForBuyer(1, true, 0);

        vm.startPrank(buyer);
        vm.expectRevert(SuknidPlatesV2.SOULBOUND.selector);
        nft.safeTransferFrom(buyer, buyer2, 1);
        vm.stopPrank();
    }

    function test_non_soulbound_transfer_succeeds() public {
        _mintForBuyer(1, false, 0);

        vm.startPrank(buyer);
        nft.transferFrom(buyer, buyer2, 1);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), buyer2);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Resale tests
    // ─────────────────────────────────────────────────────────────────────

    function test_resale_disabled_by_default() public {
        _mintForBuyer(1, false, 1000);

        usdt.mint(buyer2, PRICE);
        vm.startPrank(buyer2);
        usdt.approve(address(nft), PRICE);
        vm.expectRevert(SuknidPlatesV2.RESALE_DISABLED.selector);
        nft.buyResale(1, PRICE);
        vm.stopPrank();
    }

    function test_resale_purchase() public {
        _mintForBuyer(1, false, 1000); // 10% royalty
        nft.setResaleEnabled(true);

        uint256 resalePrice = 200 ether; // 200 USDT
        usdt.mint(buyer2, resalePrice);

        uint256 artistBefore = usdt.balanceOf(artist);
        uint256 treasuryBefore = usdt.balanceOf(treasury);
        uint256 sellerBefore = usdt.balanceOf(buyer); // buyer is seller here

        vm.startPrank(buyer);
        nft.approve(address(nft), 1);
        vm.stopPrank();

        vm.startPrank(buyer2);
        usdt.approve(address(nft), resalePrice);
        nft.buyResale(1, resalePrice);
        vm.stopPrank();

        assertEq(nft.ownerOf(1), buyer2);

        uint256 expectedFee = (resalePrice * 300) / 10000; // 3%
        uint256 expectedRoyalty = (resalePrice * 1000) / 10000; // 10%
        uint256 expectedSeller = resalePrice - expectedFee - expectedRoyalty;

        assertEq(usdt.balanceOf(treasury) - treasuryBefore, expectedFee);
        assertEq(usdt.balanceOf(artist) - artistBefore, expectedRoyalty);
        assertEq(usdt.balanceOf(buyer) - sellerBefore, expectedSeller);
    }

    function test_resale_soulbound_reverts() public {
        _mintForBuyer(1, true, 0);
        nft.setResaleEnabled(true);

        usdt.mint(buyer2, PRICE);
        vm.startPrank(buyer2);
        usdt.approve(address(nft), PRICE);
        vm.expectRevert(SuknidPlatesV2.SOULBOUND.selector);
        nft.buyResale(1, PRICE);
        vm.stopPrank();
    }

    function test_resale_owner_cannot_buy_own() public {
        _mintForBuyer(1, false, 0);
        nft.setResaleEnabled(true);

        usdt.mint(buyer, PRICE);
        vm.startPrank(buyer);
        usdt.approve(address(nft), PRICE);
        vm.expectRevert(SuknidPlatesV2.CANNOT_BUY_OWN_TOKEN.selector);
        nft.buyResale(1, PRICE);
        vm.stopPrank();
    }

    // ─────────────────────────────────────────────────────────────────────
    // ERC-165 / supportsInterface
    // ─────────────────────────────────────────────────────────────────────

    function test_supportsInterface_erc2981() public view {
        bytes4 erc2981 = type(IERC20).interfaceId; // using a proxy check
        // ERC-2981 interface id is 0x2a55205a
        assertTrue(nft.supportsInterface(0x2a55205a));
    }

    function test_supportsInterface_erc721() public view {
        // ERC-721 interface id is 0x80ac58cd
        assertTrue(nft.supportsInterface(0x80ac58cd));
    }
}
