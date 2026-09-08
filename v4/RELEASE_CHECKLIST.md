# V4.0 Release Candidate Checklist

Status: RC

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
- [ ] Final V3 -> V4 data migration regression
- [ ] Refresh / background / resume regression
- [ ] Voice toggle / concise mode / replay regression
- [ ] 30-minute boundary regression
- [ ] Calibration reset / re-calibration regression
- [ ] Final production build smoke test
- [x] Rollback point verified before root replacement

## Rollback target
Dedicated rollback branch: `v3-production-backup-20260908`
Snapshot commit: `ebc3fe44828797fa2cfe63736574b4f2e57ec477`

## Release rule
V4.0 must not replace the current V3 production root until all engineering gates above pass. If any blocker is found, keep V3 live and fix V4 in RC first.
