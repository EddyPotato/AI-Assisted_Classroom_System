# 🚔 Guard Portal Development Guide
**Building Real-Time Face Recognition Access System in Gemini AI**  
**Last Updated:** May 6, 2026

---

## 🎯 Quick Start: What You're Building

A **sleek, high-contrast security dashboard** that displays live camera feeds and real-time access events as students scan their IDs and get biometrically verified.

### Two Main Workflows

**WORKFLOW 1: Student Approaches Gate**
```
📷 Camera sees barcode on student ID
   ↓
🔍 pyzbar (Python) decodes barcode
   ↓
📡 MQTT publishes: campus/door/scan → { student_id: "STU001" }
   ↓
🖥️ C# Backend receives MQTT event
   ↓
👤 Backend looks up student → retrieves FACE_REFERENCE_PATH
   ↓
👨 Edge node compares live face vs. reference photo
   ↓
📡 MQTT publishes: campus/door/verified → { status: "approved" }
   ↓
📡 C# broadcasts via SignalR to all connected Guard portals
   ↓
⚡ React Guard UI updates in REAL-TIME (no page refresh!)
   ✅ Green badge: "APPROVED" | Student name, ID, photo, timestamp
```

**WORKFLOW 2: Manual Override (Student forgot ID)**
```
Guard clicks "BYPASS GATE (FORGOTTEN ID)" button
   ↓
Modal asks for: Student ID, Reason for bypass
   ↓
Event sent to backend → logged to EVENT_LOGS
   ↓
SignalR broadcasts result to UI
   ↓
Access log shows: [MANUAL OVERRIDE] Student Name - Bypass reason
```

---

## 🏗️ Current State of GuardPortal.jsx

**What Already Exists:**
```jsx
✅ Header with guard name & logout button
✅ Live camera feed viewer (connects to http://localhost:5000/video_feed)
✅ Camera status indicators (LIVE / SIGNAL LOST)
✅ Manual override buttons (BYPASS GATE, TRIGGER LOCKDOWN)
✅ Access log panel (RIGHT SIDE) - ready for data
✅ Dark theme with amber/red tactical styling
```

**What Needs to Be Added:**
```jsx
🔄 SignalR WebSocket connection
🔄 Event listener: ReceiveScanResult
🔄 Access log population with real-time data
🔄 Success/failure UI states (green/red badges)
🔄 Manual bypass modal dialog
```

---

## 📡 SignalR Integration Blueprint

### Step 1: Import & Setup Connection (at top of GuardPortal.jsx)

```javascript
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useState, useEffect } from "react";

export default function GuardPortal() {
  const [accessLog, setAccessLog] = useState([]);
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
```

### Step 2: Connect to Backend Hub (useEffect)

```javascript
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5106/campushub")
      .withAutomaticReconnect([0, 3000, 5000, 15000, 30000])
      .build();

    newConnection.start()
      .then(() => {
        console.log("✅ SignalR connected to CampusHub");
        setConnectionStatus("connected");
      })
      .catch(err => {
        console.error("❌ SignalR connection failed:", err);
        setConnectionStatus("disconnected");
      });

    // LISTEN FOR SCAN RESULTS
    newConnection.on("ReceiveScanResult", (data) => {
      console.log("🔔 Scan event received:", data);
      // data = {
      //   student_id: "STU001",
      //   first_name: "John",
      //   last_name: "Doe",
      //   status: "approved" | "denied",
      //   timestamp: "2026-05-06 14:32:15",
      //   face_reference_path: "student_001.jpg",
      //   bypass_reason: null | "Forgotten ID"
      // }
      
      setAccessLog(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 events
    });

    // HANDLE CONNECTION ERRORS
    newConnection.on("Disconnected", () => {
      console.warn("⚠️ Connection lost");
      setConnectionStatus("disconnected");
    });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);
```

### Step 3: Render Access Log with Real-Time Data

```javascript
  return (
    <div className="w-96 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-800 bg-slate-950/50">
        <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
          <UserCheck size={20} className="text-emerald-400"/> ACCESS LOG
          <span className={`ml-auto text-xs px-2 py-1 rounded ${
            connectionStatus === 'connected' 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/20 text-rose-400'
          }`}>
            {connectionStatus === 'connected' ? '🟢 Live' : '🔴 Offline'}
          </span>
        </h3>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {accessLog.length === 0 ? (
          <div className="text-center text-slate-600 font-bold mt-10">
            Awaiting gate scans...
          </div>
        ) : (
          accessLog.map((entry, idx) => (
            <AccessLogEntry key={idx} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
```

### Step 4: AccessLogEntry Component (Separate or Inline)

```jsx
function AccessLogEntry({ entry }) {
  const isApproved = entry.status === "approved";
  const isBypass = entry.bypass_reason !== null && entry.bypass_reason !== undefined;

  return (
    <div className={`p-3 rounded-lg border ${
      isBypass 
        ? 'bg-amber-900/30 border-amber-600/50'
        : isApproved 
          ? 'bg-emerald-900/30 border-emerald-600/50'
          : 'bg-rose-900/30 border-rose-600/50'
    }`}>
      <div className="flex items-center gap-3">
        
        {/* STUDENT PHOTO */}
        {entry.face_reference_path ? (
          <img 
            src={`http://localhost:5106/ReferenceFaces/${entry.face_reference_path}?t=${Date.now()}`}
            alt={entry.first_name}
            className="w-10 h-10 rounded-full object-cover border border-slate-600"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling?.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-400"
          style={{ display: entry.face_reference_path ? 'none' : 'flex' }}
        >
          ?
        </div>

        {/* NAME & ID */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">
            {entry.first_name} {entry.last_name}
          </p>
          <p className="text-xs text-slate-400 truncate">{entry.student_id}</p>
        </div>

        {/* STATUS BADGE */}
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-black px-2 py-1 rounded whitespace-nowrap ${
            isBypass
              ? 'bg-amber-600 text-white'
              : isApproved
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
          }`}>
            {isBypass ? '⚠️ BYPASS' : isApproved ? '✅ APPROVED' : '❌ DENIED'}
          </span>
          <span className="text-xs text-slate-500">{entry.timestamp}</span>
        </div>
      </div>

      {/* BYPASS REASON (if applicable) */}
      {isBypass && (
        <p className="text-xs text-amber-300 mt-2 italic">
          Bypass: {entry.bypass_reason}
        </p>
      )}
    </div>
  );
}
```

---

## 🎨 UI States & Colors

| State | Background | Badge | Icon |
|-------|------------|-------|------|
| **Approved** | `bg-emerald-900/30` | `bg-emerald-600` | ✅ |
| **Denied** | `bg-rose-900/30` | `bg-rose-600` | ❌ |
| **Bypass** | `bg-amber-900/30` | `bg-amber-600` | ⚠️ |
| **Camera Offline** | `bg-slate-950` | Show "SIGNAL LOST" | 📡 |

---

## 🔌 Manual Override Buttons

### BYPASS GATE Button

```jsx
const [bypassModal, setBypassModal] = useState(false);
const [bypassForm, setBypassForm] = useState({ student_id: '', reason: '' });

const handleBypassGate = async () => {
  // Send to backend
  try {
    const response = await fetch('http://localhost:5106/api/access/manual-override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: bypassForm.student_id,
        bypass_reason: bypassForm.reason,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      console.log('✅ Bypass logged');
      setBypassModal(false);
      setBypassForm({ student_id: '', reason: '' });
    }
  } catch (err) {
    console.error('❌ Bypass failed:', err);
  }
};

// In JSX:
<button 
  onClick={() => setBypassModal(true)}
  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg border border-amber-400"
>
  <Unlock size={24} /> BYPASS GATE (FORGOTTEN ID)
</button>

{bypassModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 w-96">
      <h2 className="text-xl font-black text-white mb-4">Manual Gate Override</h2>
      <input
        type="text"
        placeholder="Student ID"
        value={bypassForm.student_id}
        onChange={(e) => setBypassForm({...bypassForm, student_id: e.target.value})}
        className="w-full p-2 mb-3 bg-slate-800 border border-slate-600 rounded text-white"
      />
      <input
        type="text"
        placeholder="Reason for bypass"
        value={bypassForm.reason}
        onChange={(e) => setBypassForm({...bypassForm, reason: e.target.value})}
        className="w-full p-2 mb-4 bg-slate-800 border border-slate-600 rounded text-white"
      />
      <div className="flex gap-3">
        <button
          onClick={handleBypassGate}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded"
        >
          Confirm
        </button>
        <button
          onClick={() => setBypassModal(false)}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

### TRIGGER LOCKDOWN Button

```jsx
const handleLockdown = async () => {
  if (confirm('⚠️ Are you sure? This will lock down the facility.')) {
    try {
      await fetch('http://localhost:5106/api/access/lockdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      });
      // Add visual/audio alert
      console.log('🔒 LOCKDOWN TRIGGERED');
    } catch (err) {
      console.error('Lockdown request failed:', err);
    }
  }
};

<button 
  onClick={handleLockdown}
  className="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg border border-rose-500"
>
  <ShieldAlert size={24} /> TRIGGER LOCKDOWN
</button>
```

---

## 🔧 Backend Requirements

### 1. Update MqttListenerService to Broadcast Events

The `MqttListenerService.cs` needs to inject `IHubContext<CampusHub>` and broadcast scan results:

```csharp
private readonly IHubContext<CampusHub> _hubContext;

public MqttListenerService(IHubContext<CampusHub> hubContext)
{
    _hubContext = hubContext;
}

// When barcode scanned:
await _hubContext.Clients.All.SendAsync(
    "ReceiveScanResult",
    new
    {
        student_id = "STU001",
        first_name = "John",
        last_name = "Doe",
        status = "approved", // or "denied"
        timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
        face_reference_path = "student_001.jpg",
        bypass_reason = null
    }
);
```

### 2. Add Access/Manual Override Endpoints (Optional)

```csharp
[HttpPost("api/access/manual-override")]
public async Task<IActionResult> ManualOverride([FromBody] BypassRequest request)
{
    // Log to EVENT_LOGS table
    // Broadcast via SignalR
    return Ok();
}

[HttpPost("api/access/lockdown")]
public async Task<IActionResult> TriggerLockdown()
{
    // Log security event
    // Broadcast lockdown alert to all Guard portals
    return Ok();
}
```

---

## 🧪 Testing in Gemini AI

1. **Start all services** in terminals:
   - Backend: `dotnet run` (port 5106)
   - Frontend: `npm run dev` (port 5173)
   - Edge: `python vision_node.py` (port 5000)

2. **Open Guard Portal**: http://localhost:5173 → Login → Navigate to Guard Portal

3. **Simulate barcode scan**:
   - Run in Python terminal to manually publish MQTT event:
     ```python
     import paho.mqtt.client as mqtt
     client = mqtt.Client()
     client.connect("localhost", 1883, 60)
     client.publish("campus/door/scan", '{"student_id":"STU001"}')
     ```

4. **Watch access log** update in real-time on the Guard Portal

---

## 📚 Key Files References

| File | Purpose |
|------|---------|
| `campus-dashboard/src/portals/Guard/GuardPortal.jsx` | Main Guard Portal component |
| `campus-backend/Hubs/CampusHub.cs` | SignalR hub (broadcast center) |
| `campus-backend/Services/MqttListenerService.cs` | MQTT listener → SignalR broadcaster |
| `campus-edge/vision_node.py` | Barcode detection & edge processing |
| `database/schema.sql` | EVENT_LOGS table (access record storage) |

---

## 🚀 Deployment Checklist

- [ ] SignalR connection established (check browser console)
- [ ] Access log populates with test events
- [ ] Student photos load correctly (check for 404s)
- [ ] Color-coded badges work (green/red/amber)
- [ ] Manual override buttons functional
- [ ] Camera feed displays (or shows offline gracefully)
- [ ] Connection status indicator updates
- [ ] Real-time updates work without page refresh

---

**Built with ❤️ for seamless real-time security**
