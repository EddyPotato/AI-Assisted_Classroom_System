# Guard Portal Phase 2 - Summary of Planning Changes

**Date:** May 6, 2026  
**Status:** ✅ Planning Phase Complete

---

## 📄 FILES CREATED & MODIFIED

### 1. **NEXT_GOALS.md** (NEW - 400+ lines)
**Purpose:** Comprehensive development roadmap for Guard Portal Phase 2

**Contents:**
- 6-phase implementation plan (Backend, Frontend, SignalR, Database, Testing, Edge Node)
- Detailed task breakdowns with checkboxes
- Testing scenarios with expected outcomes
- Success criteria and known issues
- Privacy & security considerations
- Discussion items for future phases

**Key Sections:**
- Backend Camera Location Model & Endpoints
- Frontend UI Redesign (New Layout)
- Database Schema Updates (CAMERA_LOCATIONS table)
- Controlled Environment Testing Scenarios
- Phase-by-phase deliverables and timeline

---

### 2. **CONTEXT.md** (UPDATED)
**Changes Made:**
- Added "Guard Portal Phase 1 - Prototype Completed" section highlighting current functionality
- Added "Known Limitations" subsection documenting Phase 2 improvements
- Added "NEXT PHASE: Guard Portal Enhancements (Phase 2)" section with link to NEXT_GOALS.md
- Documented status-based workflow (Entrance → in-campus, Exit → offline, Rooms → present-in-room)

**Key Additions:**
```
## 📈 NEXT PHASE: Guard Portal Enhancements (Phase 2)

**See:** [NEXT_GOALS.md](./NEXT_GOALS.md) for complete roadmap

**Key Improvements:**
1. Camera Control: Off/On buttons instead of auto-close
2. Manual ID Entry: Text input fallback for barcode scanning
3. Camera Location Configuration: Support multiple cameras
4. Privacy-First Event Logs: Hidden from main UI, separate tab
5. Manual Bypass System: For students/staff without ID
6. Controlled Environment Testing: Scenario-based testing
```

---

### 3. **README.md** (UPDATED)
**Changes Made:**
- Updated project status from "Phase 1 Prototype" to clear phases
- Divided completions into "Phase 1 Completions" and "Phase 2 In Planning"
- Added section: "Guard Portal Phase 2: Upcoming Improvements" with feature comparison table
- Updated "Guard Portal UI Components" section with Phase 2 notes
- Added "Use Case: Room-Based Attendance Tracking" scenario
- Added "Privacy-First Event Logging" explanation

**Key Additions:**
- Feature comparison table (Current vs Upcoming)
- IL604 classroom attendance tracking example
- Privacy-first event logging approach
- Links to NEXT_GOALS.md

---

## 📋 REQUIREMENTS ADDRESSED

### User Requirements Breakdown:

| # | Requirement | File | Status |
|---|-------------|------|--------|
| 1 | Off camera button | NEXT_GOALS.md (Phase 1.2, 2.3) | ✅ Planned |
| 2 | Manual ID typing | NEXT_GOALS.md (Phase 1.3, 2.2) | ✅ Planned |
| 3 | Better verification display | NEXT_GOALS.md (Phase 2.1, 2.3) | ✅ Planned |
| 4 | Manual bypass button | NEXT_GOALS.md (Phase 2.2, 5.1) | ✅ Planned |
| 5 | Event logs visibility | NEXT_GOALS.md (Phase 2.1) | ✅ Planned |
| 6 | Camera location config | NEXT_GOALS.md (Phase 1.1, 4.1) | ✅ Planned |
| 7 | Lockdown button removal | NEXT_GOALS.md (Phase 2.3) | ✅ Planned |
| 8 | Auto-start vision_node | NEXT_GOALS.md (Phase 6.2) | ✅ Deferred |

---

## 🎯 KEY DESIGN DECISIONS DOCUMENTED

### 1. **Camera Location Model**
- Support multiple camera types: Entrance, Exit, Room-specific
- Each location has associated status change (in-campus, offline, present-in-room)
- Configurable via backend API and UI dropdown

### 2. **Privacy-Enhanced Event Logging**
- Main Guard Portal: Shows only last 10 access entries
- Separate "Access History" tab: Full logs with filtering
- Rationale: Balance operational needs with privacy protection

### 3. **Manual Bypass System**
- Two-step confirmation: Click button → Confirm action
- Logged separately from normal scans
- Future enhancement: Audit trail showing who authorized bypass

### 4. **UI Redesign Strategy**
- Profile picture: Same width as verification result panel
- Manual ID input: Fallback when barcode unavailable
- Camera location selector: Dropdown in control panel
- Lockdown button: Removed (inappropriate for access control)

### 5. **Python Script Stability**
- Remove auto-close on Guard Portal logout
- Add on/off button instead for manual control
- Prevent unexpected shutdowns (investigation planned)

---

## 📊 IMPLEMENTATION TIMELINE

```
May 8  → Backend Configuration (Phase 1)
May 9  → Frontend UI Redesign (Phase 2)
May 10 → SignalR + Database Updates (Phase 3-4)
May 11 → Testing & Validation (Phase 5)
May 12 → Edge Node Updates (Phase 6)
```

**Total Estimated Duration:** 15-20 hours of development

---

## 🚀 NEXT STEPS

1. **Review NEXT_GOALS.md** with team for feedback
2. **Prioritize implementation phases** based on dependencies
3. **Create GitHub issues** for each phase
4. **Assign developers** to parallel work streams
5. **Schedule Phase 3 discussion** for:
   - Professor bypass & verification approach
   - Auto-start vision_node.py strategy
   - Room-based attendance integration

---

## 📌 IMPORTANT NOTES

### What Was NOT Changed (Yet)
- No code changes to backend/frontend
- No database schema modifications (planned in Phase 4)
- No Python edge node modifications (planned in Phase 6)
- Professor manual bypass deferred to Phase 3

### What Needs Discussion
1. **Auto-Start Strategy** - Browser extension? System service? Manual start?
2. **Professor Integration** - Same bypass system or different approach?
3. **Audit Logging** - Who authorized bypasses? Need operator tracking?
4. **Room Attendance** - How to correlate with schedule data?

### Files Ready for Development
- ✅ NEXT_GOALS.md - Complete technical specification
- ✅ CONTEXT.md - Updated with Phase 2 info
- ✅ README.md - Updated with Phase 2 description
- 🟡 No code changes yet (ready for implementation)

---

**Status:** ✅ Ready for development kickoff  
**Last Updated:** May 6, 2026  
**Lead:** EddyPotato
