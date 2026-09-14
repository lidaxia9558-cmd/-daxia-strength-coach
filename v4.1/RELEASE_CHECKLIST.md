# V4.1 Release Checklist

Status: RELEASE CANDIDATE

- [x] Combined strength + cardio planner implemented
- [x] Main strength A/B rotation and recovery logic tested
- [x] Jump rope high-impact exposure guarded
- [x] Normal daily time budget near 40 minutes
- [x] V4 strength calibration, loads and targets inherited
- [x] V4-compatible history/progression write-back implemented
- [x] Active workout persisted across refresh/page exit
- [x] Backgrounding pauses timed work instead of silently consuming time
- [x] Screen Wake Lock used where supported
- [x] Early finish remains valid and is not treated as failure
- [x] Safety stop copy remains visible
- [x] iPad Safari preview tried by user; no material issue reported
- [ ] RC CI green
- [ ] Production staging deployed and verified
- [ ] Production root cutover verified

Rollback: the existing V4.0 production history remains available in git; do not remove the prior V4.0 rollback path during V4.1 release.
