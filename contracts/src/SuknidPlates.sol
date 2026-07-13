// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SuknidPlates is ERC721, Ownable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    string private constant SIGNING_DOMAIN = "SUKNID";
    string private constant SIGNATURE_VERSION = "1";

    address public authorizedSigner;
    address public artistTreasury;
    mapping(uint256 => string) private _tokenCIDs;

    struct LazyMintVoucher {
        uint256 tokenId;
        string designId;
        uint256 price;
        address artistTreasury;
        uint256 expiry;
        address buyer;
        bytes32 cidHash;
    }

    bytes32 private constant VOUCHER_TYPEHASH = keccak256(
        "LazyMintVoucher(uint256 tokenId,string designId,uint256 price,address artistTreasury,uint256 expiry,address buyer,bytes32 cidHash)"
    );

    event PlateMinted(uint256 indexed tokenId, address indexed buyer, string designId);
    event SignerRotated(address indexed oldSigner, address indexed newSigner);

    constructor(address signer, address treasury)
        ERC721("SuknidPlates", "SUKNID")
        Ownable(msg.sender)
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION)
    {
        require(signer != address(0), "ZERO_SIGNER");
        require(treasury != address(0), "ZERO_TREASURY");
        authorizedSigner = signer;
        artistTreasury = treasury;
    }

    function setAuthorizedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "ZERO_SIGNER");
        address old = authorizedSigner;
        authorizedSigner = newSigner;
        emit SignerRotated(old, newSigner);
    }

    function mintWithVoucher(
        LazyMintVoucher calldata voucher,
        bytes calldata signature,
        string calldata cid
    ) external payable nonReentrant {
        require(block.timestamp <= voucher.expiry, "EXPIRED");
        require(msg.value >= voucher.price, "UNDERPAID");
        require(msg.sender == voucher.buyer, "WRONG_BUYER");
        require(_ownerOf(voucher.tokenId) == address(0), "MINTED");

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
        address recovered = _hashTypedDataV4(structHash).recover(signature);
        require(recovered == authorizedSigner, "BAD_SIG");

        require(keccak256(bytes(cid)) == voucher.cidHash, "BAD_CID");

        _tokenCIDs[voucher.tokenId] = cid;
        _safeMint(voucher.buyer, voucher.tokenId);

        (bool ok,) = voucher.artistTreasury.call{value: msg.value}("");
        require(ok, "PAY_FAIL");

        emit PlateMinted(voucher.tokenId, voucher.buyer, voucher.designId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "NONEXISTENT");
        return string.concat("ipfs://", _tokenCIDs[tokenId]);
    }

    // Exposed for off-chain signing and test helpers.
    function hashTypedDataV4(bytes32 structHash) external view returns (bytes32) {
        return _hashTypedDataV4(structHash);
    }
}
