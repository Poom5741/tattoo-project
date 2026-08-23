# App Flow — a Simple Guide

Sequence diagrams that tell the story of how the marketplace works, in plain language.
The "Website" in each diagram does all the behind-the-scenes work automatically.

---

## 1. Customer Journey — Buying a Design

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer
    participant W as Website
    participant A as Artist
    participant P as Payment Provider

    C->>W: Browses designs and opens one they like
    W-->>C: Shows the design, price, and artist info
    C->>W: Clicks "Book this artist"
    C->>W: Fills in contact details and a message
    W->>A: Sends the booking request to the artist
    W-->>C: Confirms it's sent and opens a chat with the artist
    C->>W: Talks with the artist about the design and timing
    W-->>A: Messages arrive in the artist's inbox

    A->>W: Accepts the booking and picks an appointment time
    W-->>C: Tells the customer the appointment is confirmed
    C->>W: Clicks "Pay" and chooses their payment method
    W->>P: Asks the payment provider to create a payment
    Note over W: The design is set aside for 15 minutes so no one else can buy it
    C->>P: Pays on the payment provider's page
    P-->>W: Confirms the payment went through
    W-->>C: Shows "Payment successful"
    W->>A: Lets the artist know the design was sold
    W-->>C: Delivers the digital receipt (NFT) to the customer's wallet
```

---

## 2. Artist Journey — Selling and Managing Bookings

```mermaid
sequenceDiagram
    autonumber
    participant A as Artist
    participant W as Website
    participant U as Admin

    A->>W: Signs in with their wallet (Face ID or fingerprint)
    W-->>A: Opens the artist dashboard
    A->>W: Uploads a new design and sets the price
    W-->>A: Confirms the design is sent for review
    W->>U: Asks the admin to review the design
    U-->>W: Approves the design
    W-->>A: Design is now live in the market

    A->>W: Checks inbox for booking requests and messages
    W-->>A: Shows requests from customers
    A->>W: Accepts a booking and sets the appointment time
    A->>W: Or declines a booking they can't take
    W-->>A: Appointment is confirmed with the customer
    A->>W: Checks earnings after a sale
    W-->>A: Shows what the artist earned
```

---

## 3. Admin Journey — Keeping the Marketplace Safe

```mermaid
sequenceDiagram
    autonumber
    participant U as Admin
    participant W as Website
    participant A as Artist

    U->>W: Signs in with an admin password
    W-->>U: Opens the admin dashboard
    U->>W: Opens the list of designs waiting for review
    W-->>U: Shows new designs from artists
    U->>W: Approves a design
    W-->>A: Design goes live in the market
    U->>W: Rejects a design
    W-->>A: Artist is told why it wasn't accepted
    U->>W: Adds, edits, or removes artist profiles
    W-->>U: Artist roster is updated
```

---

## 4. Why Booking and Chat Go Together

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer
    participant W as Website
    participant A as Artist

    C->>W: Sends a booking request
    W->>A: Passes the request to the artist
    Note over W: Every booking automatically creates a chat thread
    C->>W: Asks a question about the design
    W->>A: Artist sees the message in their inbox
    A->>W: Replies to the customer
    W-->>C: Customer sees the reply
    A->>W: Accepts or declines the booking from the chat
    W-->>C: Customer is told the outcome
```
