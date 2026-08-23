# Audit Findings

- [x] HIGH: Design DELETE route missing 'confirmed' bookings in dependency check — fixed in c98bab4
- [x] HIGH: Admin booking status route missing 'accepted'→'confirmed' transition — fixed in f81f1dd
- [x] HIGH: Bookings page VALID_TRANSITIONS missing 'accepted'→'confirmed' (UI/API mismatch) — fixed in 2670f80
- [x] MEDIUM: Bookings page shows literal 'null' for null artist_id — fixed in 8fcf887
- [x] MEDIUM: Designs and dashboard pages show literal 'null' for null artist_id — fixed in 3a6a82a
- [x] HIGH: Design DELETE missing chillpay_transactions cascade (FK violation) — fixed in 1f0dc9f
