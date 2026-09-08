# V4.0 Release Candidate Checklist

Status: RELEASE READY

## Product gates
- [x] Safari real-device preview completed by user with positive overall experience
- [x] One-time movement calibration
- [x] Rep-based strength training engine
- [x] Automatic progression with conservative safeguards
- [x] Light/recovery day logic
- [x] 30-minute hard session cap
- [x] Partial completion counts as valid training
- [x] Voice coach 2.0
- [x] Exercise coaching cards
- [x] iOS safe-area / mobile interaction support

## Engineering gates
- [x] Core engine syntax check
- [x] Core engine automated tests
- [x] Coach experience automated tests
- [x] GitHub Pages preview deployment
- [x] Final V3 -> V4 data migration regression
- [x] Refresh / background / resume regression
- [x] Voice toggle / concise mode / replay regression
- [x] 30-minute boundary regression
- [x] Calibration reset / re-calibration regression
- [x] Final production build smoke test
- [x] Rollback point verified before root replacement

## Rollback target
Dedicated rollback branch: `v3-production-backup-20260908`
Snapshot commit: `ebc3fe44828797fa2cfe63736574b4f2e57ec477`

## Release decision
All release gates passed. The validated staging blobs may be copied unchanged to the production root.
