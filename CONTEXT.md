# SAKNID — Domain Context

## What it is

SAKNID is a marketplace for one-of-one tattoo plate NFTs on BSC Testnet. Each plate is a unique generative artwork. Buyers browse, book tattoo appointments with artists, and receive the plate as an NFT. The project name "Bone & Blood" refers to the new visual identity direction.

## Core Concepts

### Plate
A one-of-one tattoo design. Not a generic NFT — specifically a tattoo plate that an artist will use. Generated algorithmically (canvas-based). Each plate is unique.

### Artist
A tattoo artist who lists plates on the marketplace. Artists have profiles and dashboards. They receive bookings tied to their plates.

### Booking
A scheduled tattoo appointment between a buyer and an artist, tied to a specific plate. Not just a purchase — it's a real-world service appointment.

### Vault
The buyer's wallet view showing owned plates. Displays the collection of NFTs they hold.

### Lazy Mint
The ERC-721 contract doesn't mint on creation — it mints on first transfer/sale. Reduces gas costs for unsold plates.

## Key Boundaries

- **Plate ≠ NFT at rest** — A plate exists as a generative artwork before it's ever minted. It becomes an NFT only when sold.
- **Booking ≠ Purchase** — A booking is a service appointment. The plate NFT transfers, but the real deliverable is the tattoo.
- **Vault ≠ Wallet** — The vault is SAKNID's display of owned plates, not a generic crypto wallet.
- **Marketplace ≠ Store** — Plates are one-of-one, not inventory. Once sold, that specific plate is gone.

## Stakeholders

- **Buyer/Collector** — Browses plates, books appointments, collects NFTs
- **Artist** — Creates/list plates, manages bookings, earns from sales
- **Admin** — Manages the platform, artists, and content

## Current State

Dark monochrome "Ink Noir" design. Migrating to "Bone & Blood" — warm cream/paper tones with red accent. Light-only. Refined minimalism.
