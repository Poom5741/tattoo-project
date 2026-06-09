// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title InknoirPlatesV2
/// @notice ERC-721 NFT contract for INKNOIR on BSC with:
///   - USDT (BEP-20) payment via ERC-20 transferFrom (18 decimals on BSC)
///   - ERC-2981 royalties per token
///   - Soulbound flag (prevents transfer after mint)
///   - Resale mechanism via buyResale()
///   - 3% platform fee split at mint and resale
contract InknoirPlatesV2 is ERC721, ERC2981, Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    string private constant SIGNING_DOMAIN = "INKNOIR";
    string private constant SIGNATURE_VERSION = "1";

    /// @notice USDT BEP-20 token address on BSC
    /// BSC Testnet: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd
    /// BSC Mainnet: 0x55d398326f99059fF775485246999027B3197955
    IERC20 public immutable usdt;

    /// @notice Platform treasury receives the 3% fee
    address public platformTreasury;

    /// @notice Authorized signer for lazy-mint vouchers
    address public authorizedSigner;

    /// @notice Platform fee in basis points (300 = 3%)
    uint256 public constant PLATFORM_FEE_BPS = 300;

    /// @notice Whether resale is enabled (owner toggle)
    bool public resaleEnabled;

    /// @notice Soulbound flag per token — set at mint, prevents transfer
    mapping(uint256 => bool) public soulbound;

    /// @notice IPFS CID per token
    mapping(uint256 => string) private _tokenCIDs;

    struct LazyMintVoucher {
        uint256 tokenId;
        string designId;
        uint256 price;
        address artistTreasury;
        uint256 expiry;
        address buyer;
        bytes32 cidHash;
        bool soulbound;
        uint96 royaltyBps;
    }

    bytes32 private constant VOUCHER_TYPEHASH = keccak256(
        "LazyMintVoucher(uint256 tokenId,string designId,uint256 price,address artistTreasury,uint256 expiry,address buyer,bytes32 cidHash,bool soulbound,uint96 royaltyBps)"
    );

    event PlateMinted(uint256 indexed tokenId, address indexed buyer, string designId);
    event ResalePurchase(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event SignerRotated(address indexed oldSigner, address indexed newSigner);
    event PlatformTreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ResaleEnabledSet(bool enabled);

    error EXPIRED();
    error WRONG_BUYER();
    error ALREADY_MINTED();
    error BAD_SIG();
    error BAD_CID();
    error SOULBOUND();
    error RESALE_DISABLED();
    error CANNOT_BUY_OWN_TOKEN();
    error ZERO_ADDRESS();
    error PAY_FAIL();

    constructor(
        address signer,
        address treasury,
        address usdtAddress
    )
        ERC721("InknoirPlatesV2", "INKNOIR2")
        Ownable(msg.sender)
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION)
    {
        if (signer == address(0)) revert ZERO_ADDRESS();
        if (treasury == address(0)) revert ZERO_ADDRESS();
        if (usdtAddress == address(0)) revert ZERO_ADDRESS();
        authorizedSigner = signer;
        platformTreasury = treasury;
        usdt = IERC20(usdtAddress);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Owner-only admin functions
    // ─────────────────────────────────────────────────────────────────────

    function setAuthorizedSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZERO_ADDRESS();
        address old = authorizedSigner;
        authorizedSigner = newSigner;
        emit SignerRotated(old, newSigner);
    }

    function setPlatformTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZERO_ADDRESS();
        address old = platformTreasury;
        platformTreasury = newTreasury;
        emit PlatformTreasuryUpdated(old, newTreasury);
    }

    function setResaleEnabled(bool enabled) external onlyOwner {
        resaleEnabled = enabled;
        emit ResaleEnabledSet(enabled);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Core mint function (lazy mint with USDT payment)
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Mint a plate NFT using a server-signed voucher.
    ///         Buyer must first approve this contract to spend `voucher.price` USDT.
    function mintWithVoucher(
        LazyMintVoucher calldata voucher,
        bytes calldata signature,
        string calldata cid
    ) external nonReentrant {
        if (block.timestamp > voucher.expiry) revert EXPIRED();
        if (msg.sender != voucher.buyer) revert WRONG_BUYER();
        if (_ownerOf(voucher.tokenId) != address(0)) revert ALREADY_MINTED();

        // Verify EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(
            VOUCHER_TYPEHASH,
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
        address recovered = _hashTypedDataV4(structHash).recover(signature);
        if (recovered != authorizedSigner) revert BAD_SIG();

        // Verify CID hash
        if (keccak256(bytes(cid)) != voucher.cidHash) revert BAD_CID();

        // Calculate fee split
        uint256 platformFee = (voucher.price * PLATFORM_FEE_BPS) / 10000;
        uint256 artistAmount = voucher.price - platformFee;

        // Pull USDT from buyer (buyer must have approved this contract)
        usdt.safeTransferFrom(msg.sender, address(this), voucher.price);

        // Distribute payments
        usdt.safeTransfer(voucher.artistTreasury, artistAmount);
        usdt.safeTransfer(platformTreasury, platformFee);

        // Mint the token
        _tokenCIDs[voucher.tokenId] = cid;
        _safeMint(voucher.buyer, voucher.tokenId);

        // Set soulbound flag if requested
        if (voucher.soulbound) {
            soulbound[voucher.tokenId] = true;
        }

        // Set per-token ERC-2981 royalty
        if (voucher.royaltyBps > 0) {
            _setTokenRoyalty(voucher.tokenId, voucher.artistTreasury, voucher.royaltyBps);
        }

        emit PlateMinted(voucher.tokenId, voucher.buyer, voucher.designId);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Resale function (secondary market)
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Purchase a resale NFT. Seller must have approved this contract
    ///         to transfer the NFT (via setApprovalForAll or approve).
    ///         Buyer must have approved this contract to spend `price` USDT.
    /// @param tokenId The token to purchase
    /// @param price The agreed price in USDT (must match off-chain resale listing)
    function buyResale(uint256 tokenId, uint256 price) external nonReentrant {
        if (!resaleEnabled) revert RESALE_DISABLED();

        address seller = ownerOf(tokenId);
        if (msg.sender == seller) revert CANNOT_BUY_OWN_TOKEN();
        if (soulbound[tokenId]) revert SOULBOUND();

        // Calculate splits
        uint256 platformFee = (price * PLATFORM_FEE_BPS) / 10000;
        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, price);
        uint256 sellerAmount = price - platformFee - royaltyAmount;

        // Pull USDT from buyer
        usdt.safeTransferFrom(msg.sender, address(this), price);

        // Distribute payments
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            usdt.safeTransfer(royaltyReceiver, royaltyAmount);
        }
        usdt.safeTransfer(platformTreasury, platformFee);
        usdt.safeTransfer(seller, sellerAmount);

        // Transfer NFT from seller to buyer
        _safeTransfer(seller, msg.sender, tokenId, "");

        emit ResalePurchase(tokenId, msg.sender, price);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Soulbound transfer guard
    // ─────────────────────────────────────────────────────────────────────

    /// @dev Override _update to block transfers of soulbound tokens.
    ///      Mints (from == address(0)) are always allowed.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && soulbound[tokenId]) {
            revert SOULBOUND();
        }
        return super._update(to, tokenId, auth);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Metadata
    // ─────────────────────────────────────────────────────────────────────

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "NONEXISTENT");
        return string.concat("ipfs://", _tokenCIDs[tokenId]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // ERC-165 interface support
    // ─────────────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Test helper
    // ─────────────────────────────────────────────────────────────────────

    /// @dev Exposed for off-chain signing verification
    function hashTypedDataV4(bytes32 structHash) external view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }
}
