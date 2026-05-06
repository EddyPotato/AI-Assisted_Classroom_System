# Guard Portal Phase 2: Real-Time Access Control Enhancements

**Status:** Planning Phase  
**Target Completion:** May 13, 2026  
**Priority:** High (Core Guard Portal Functionality)

---

## 🎯 OBJECTIVES

Transform the Guard Portal from a prototype into a production-ready access control system with:
- Manual camera control (on/off button)
- Multiple camera location support (entrance/exit/room-specific)
- Privacy-first event logging (hidden by default)
- Fallback manual ID entry system
- Controlled environment testing capability

---

## 📋 IMPLEMENTATION ROADMAP

### **PHASE 1: Backend Configuration** (Est. 2-3 hours)

#### 1.1 Camera Location Model
- [ ] Create `CameraLocation.cs` model with fields:
  - `Location_ID` (unique identifier)
  - `Camera_Name` (e.g., "Main Entrance Gate", "Main Exit Gate", "IL604 Classroom")
  - `Location_Type` (Entrance/Exit/Room)
  - `Associated_Room_ID` (nullable, for room-specific cameras)
  - `Status_On_Scan` (in-campus, offline, present-in-room)
  - `Is_Active` (boolean)
- [ ] Create `ICameraLocationRepository.cs` interface
- [ ] Create `CameraLocationRepository.cs` with CRUD operations
- [ ] Add to database schema (`schema.sql`): `CAMERA_LOCATIONS` table

#### 1.2 Camera Control Endpoints
- [ ] `POST /api/camera/stop` - Stop camera stream (replaces auto-close)
- [ ] `POST /api/camera/start` - Start camera stream (new)
- [ ] `GET /api/camera/locations` - Get all configured camera locations
- [ ] `POST /api/camera/locations` - Create new location configuration
- [ ] `PUT /api/camera/location/{id}` - Update location configuration

#### 1.3 Manual ID Entry Endpoint
- [ ] `POST /api/camera/manual-scan` - Accept manually typed student/staff ID
  - Input: `{ student_id, camera_location_id }`
  - Process: Bypass barcode scan, trigger face verification directly
  - Response: Include profile picture, name, status

#### 1.4 Update MqttListenerService
- [ ] Modify to include `camera_location_id` in MQTT events
- [ ] Update event log to store location information
- [ ] Change logic: Use `camera_location_id` to determine status update instead of hardcoded logic

---

### **PHASE 2: Frontend UI Redesign** (Est. 3-4 hours)

#### 2.1 Guard Portal Layout Restructure
**Current (Problematic):**
```
┌─────────────────────┬──────────────────────┐
│   Camera Feed       │  Access Log          │
│                     │  (Event Logs Table)  │
└─────────────────────┴──────────────────────┘
```

**New (Improved):**
```
┌─────────────────────────────────────────────┐
│  Camera Controls: [Start] [Stop] [Location]  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────┐  ┌──────────────┐  │
│  │  Camera Feed        │  │ Verification │  │
│  │  (MJPEG Stream)     │  │ Result Panel │  │
│  │                     │  │              │  │
│  │                     │  │ Profile Pic  │  │
│  │                     │  │ (Large)      │  │
│  └─────────────────────┘  └──────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│  Manual ID Input: [Text Box] [Submit]       │
├─────────────────────────────────────────────┤
│  [Manual Bypass] [Set Location] [Settings]  │
├─────────────────────────────────────────────┤
│  Access Log (Read-Only, Recent 10 entries)  │
└─────────────────────────────────────────────┘

TAB: Access History (Full logs)
```

#### 2.2 Components to Create/Modify
- [ ] **GuardPortal.jsx** - Restructure layout, add tabs
- [ ] **CameraControls.jsx** (NEW) - Start/Stop buttons, location selector
- [ ] **VerificationResultPanel.jsx** - Make profile picture larger
- [ ] **ManualIDInput.jsx** (NEW) - Text input form for manual scanning
- [ ] **ManualBypassModal.jsx** (NEW) - Bypass confirmation dialog
- [ ] **AccessLog.jsx** - Show last 10 entries only (not full table)
- [ ] **AccessHistory.jsx** (NEW) - Separate tab for full event logs

#### 2.3 UI Behavior Changes
- [ ] Remove "TRIGGER LOCKDOWN" button
- [ ] Add "OFF CAMERA" button with confirmation
- [ ] Add "SET CAMERA LOCATION" dropdown selector
- [ ] Make profile picture **same width as verification result panel**
- [ ] Manual bypass only shows: Student name, ID, timestamp (no face verification)
- [ ] Hide full event logs from main view
- [ ] Show camera location name in status bar: "Active: Main Entrance Gate"

---

### **PHASE 3: SignalR Integration Updates** (Est. 1-2 hours)

#### 3.1 Update CampusHub
- [ ] Modify `Clients.All.SendAsync("ReceiveScanResult", data)` to include:
  - `camera_location_id`
  - `location_name`
  - `status_change` (in-campus, offline, present-in-room)
- [ ] Add `camera_status_changed` event for stop/start camera

#### 3.2 Frontend SignalR Listener
- [ ] Update to handle camera status changes
- [ ] Update access log with location information
- [ ] Auto-update camera location UI when changed

---

### **PHASE 4: Database Schema Updates** (Est. 1 hour)

#### 4.1 New Tables
```sql
-- Add to schema.sql
CREATE TABLE CAMERA_LOCATIONS (
  LOCATION_ID VARCHAR2(20) PRIMARY KEY,
  CAMERA_NAME VARCHAR2(100) NOT NULL,
  LOCATION_TYPE VARCHAR2(20), -- 'Entrance', 'Exit', 'Room'
  ASSOCIATED_ROOM_ID VARCHAR2(20),
  STATUS_ON_SCAN VARCHAR2(50), -- 'in-campus', 'offline', 'present-in-room'
  IS_ACTIVE NUMBER(1) DEFAULT 1,
  CREATED_AT TIMESTAMP DEFAULT SYSDATE
);

-- Modify EVENT_LOGS to include location
ALTER TABLE EVENT_LOGS ADD LOCATION_ID VARCHAR2(20) REFERENCES CAMERA_LOCATIONS(LOCATION_ID);
```

#### 4.2 Seed Data
```sql
INSERT INTO CAMERA_LOCATIONS VALUES ('CAM-001', 'Main Entrance Gate', 'Entrance', NULL, 'in-campus', 1, SYSDATE);
INSERT INTO CAMERA_LOCATIONS VALUES ('CAM-002', 'Main Exit Gate', 'Exit', NULL, 'offline', 1, SYSDATE);
INSERT INTO CAMERA_LOCATIONS VALUES ('CAM-IL604', 'IL604 Classroom', 'Room', 'IL604', 'present-in-room', 1, SYSDATE);
```

---

### **PHASE 5: Testing & Validation** (Est. 2-3 hours)

#### 5.1 Controlled Environment Testing
**Scenario: Classroom IL604 Attendance Tracking**
```
1. Set camera location to: CAM-IL604 (IL604 Classroom)
2. Check schedule for IL604: "SE101" (Thursday 2:30 PM - 5:30 PM)
3. Student arrives 5 minutes early, scans barcode
4. System logs: "Student present in IL604"
5. Status changes to: "present-in-room"
6. Student leaves after class
7. Re-scan barcode, system logs: "Student exited IL604"
```

#### 5.2 Test Cases
- [ ] Entrance gate: Student scans → status changes to "in-campus"
- [ ] Exit gate: Student scans → status changes to "offline"
- [ ] Manual ID entry: Typing ID → triggers verification
- [ ] Manual bypass: No scan, just name/ID entry
- [ ] Off camera: Button press → camera stops, UI updates
- [ ] Access history: View full logs in separate tab
- [ ] Camera location change: Dropdown switch → updates status logic

---

### **PHASE 6: Python Edge Node Updates** (Est. 1-2 hours)

#### 6.1 Endpoint Changes
- [ ] Modify `/stop_camera` to accept `location_id` parameter
- [ ] Implement `/start_camera` endpoint
- [ ] Update MQTT payload to include `camera_location_id`

#### 6.2 Auto-Start Planning
- [ ] Document plan for auto-launching `vision_node.py` when Guard Portal opens
- [ ] Consider: System tray app, background service, or manual start option
- [ ] **Decision Point:** Defer to Phase 3 pending discussion

---

## 🔒 PRIVACY & SECURITY CONSIDERATIONS

### Event Log Visibility
- **Main Guard Portal:** Hides detailed event logs (only recent 10 access entries shown)
- **Separate Access History Tab:** Full event logs with filtering by date/student/location
- **Audit Trail:** All scans logged to database for security review
- **Rationale:** Balances operational needs with privacy protection

### Manual Bypass Audit
- [ ] All manual bypass events logged with timestamp and operator name (future)
- [ ] Separate bypass audit log for security review
- [ ] Alert system for excessive bypass usage (future)

---

## 📊 TESTING SCENARIOS

### Scenario 1: Entrance Gate (CAM-001)
```
Timeline: 8:00 AM
Student ID: 24-1507
Action: Scans barcode at main entrance
Expected:
  ✓ Face verification succeeds
  ✓ Status changed to "in-campus"
  ✓ Access log shows: "24-1507 - APPROVED - Main Entrance Gate - 08:00"
  ✓ Event log stored with location_id: CAM-001
```

### Scenario 2: Exit Gate (CAM-002)
```
Timeline: 5:45 PM (after classes)
Student ID: 24-1507
Action: Scans barcode at main exit
Expected:
  ✓ Face verification succeeds
  ✓ Status changed to "offline" (student left campus)
  ✓ Access log shows: "24-1507 - APPROVED - Main Exit Gate - 17:45"
  ✓ Event log stored with location_id: CAM-002
```

### Scenario 3: Manual ID Entry (No Barcode)
```
Timeline: 10:15 AM
Student ID: 24-1506 (no barcode)
Action: Manually types "24-1506" in text input
Expected:
  ✓ System retrieves student record
  ✓ Face verification process begins
  ✓ Profile picture displayed
  ✓ If approved: Status updated with location info
```

### Scenario 4: Manual Bypass
```
Timeline: 3:30 PM
Situation: Student forgot ID card
Action: Click "Manual Bypass" → Confirm without face verification
Expected:
  ✓ Popup: "Enter Student Name/ID"
  ✓ Bypass logged with timestamp
  ✓ Status updated but marked as "bypass" in logs
  ✓ Access log shows: "24-1507 [BYPASS] - Manual Entry"
```

### Scenario 5: Classroom Attendance (CAM-IL604)
```
Timeline: 2:25 PM (5 min before class SE101 in IL604)
Class: SE101, IL604, 2:30 PM - 5:30 PM
Student ID: 24-1507

ENTRY:
  Action: Student scans at IL604 camera
  Expected:
    ✓ Status: "present-in-room" for IL604
    ✓ Log: "24-1507 entered IL604 - 14:25"

EXIT (After 5 minutes to simulate):
  Action: Student re-scans before leaving
  Expected:
    ✓ Status: Returns to "in-campus"
    ✓ Log: "24-1507 exited IL604 - 14:30"
```

---

## 📈 DELIVERABLES BY MILESTONE

| Phase | Components | Status | Target Date |
|-------|-----------|--------|------------|
| **1** | Backend Config | Not Started | May 8 |
| **2** | Frontend UI | Not Started | May 9 |
| **3** | SignalR Updates | Not Started | May 10 |
| **4** | DB Schema | Not Started | May 10 |
| **5** | Testing | Not Started | May 11 |
| **6** | Edge Node Updates | Not Started | May 12 |

---

## 🚀 SUCCESS CRITERIA

✅ Off-camera button functional - camera stops without closing Python script  
✅ Manual ID input accepts text entry and triggers verification  
✅ Verification result panel displays profile picture prominently  
✅ Manual bypass works with logging  
✅ Event logs hidden from main view, accessible in separate tab  
✅ Camera locations configurable and affect status updates  
✅ Controlled environment test passes (IL604 scenario)  
✅ Privacy requirements met (logs not visible to casual users)  
✅ Lockdown button removed  

---

## 🔧 KNOWN ISSUES TO ADDRESS

1. **Python Script Auto-Closure**
   - Currently stops when Guard Portal closes
   - Sends: `POST /stop_camera`
   - **Fix:** Add off-camera button instead of auto-close

2. **Script Unexpected Shutdowns**
   - **Possible causes:**
     - Connection timeout from backend
     - MQTT connection loss
     - Unhandled exception in edge node
   - **Investigation needed:** Check `vision_node.py` error handling

3. **Event Logs Privacy**
   - Currently exposed in main UI
   - **Fix:** Move to separate Access History tab

4. **Camera Location Hardcoded**
   - Currently only "Main Gate"
   - **Fix:** Make configurable via dropdown

---

## 📝 NOTES FOR DEVELOPMENT

### For Backend Developer
- Implement repository pattern for `CameraLocationRepository`
- Update MQTT listener to respect location-based status changes
- Add validation: Only one active entrance/exit camera at a time (optional)

### For Frontend Developer
- Keep manual ID input optional (barcode still primary)
- Make profile picture at least 200x200px for visibility
- Add loading state during face verification
- Show camera location in status bar prominently

### For DevOps/Edge Node
- Document how to configure camera location on Python side
- Add error logging for unexpected shutdowns
- Consider adding health check endpoint for camera status

---

## 🎓 DISCUSSION ITEMS FOR LATER PHASES

1. **Professor Manual Bypass & Verification**
   - Should professors also be able to scan/bypass?
   - Different UI for professor entry?
   - Separate access logs for professors?

2. **Auto-Start Vision Node**
   - Browser extension? System service? Manual button?
   - Security implications of auto-launching Python processes?

3. **Room-Based Attendance Integration**
   - How to correlate camera events with schedule data?
   - Create attendance table linking student + room + timestamp?

4. **Advanced Features (Phase 3)**
   - Liveness detection to prevent photo attacks
   - Real-time dashboard showing campus occupancy
   - Analytics: Peak entry/exit times
   - Integration with student leave/absence requests

---

**Last Updated:** May 6, 2026  
**Lead:** EddyPotato  
**Status:** 🔴 Not Started
