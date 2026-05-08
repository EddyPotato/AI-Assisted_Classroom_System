import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Save, Server, Trash2, ShieldAlert } from 'lucide-react';
import ConfirmModal from '../../../components/ui/ConfirmModal';

export default function CameraManagerView() {
  const [locations, setLocations] = useState([]);
  const [rooms, setRooms] = useState([]); // NEW: State to hold database rooms
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [modal, setModal] = useState({ isOpen: false, locationId: null, name: '' });

  // 1. INITIAL LOAD: Fetch both Cameras and Rooms
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        // Fetch Camera Locations
        const locRes = await fetch('http://localhost:5106/api/camera/locations');
        if (locRes.ok && isMounted) setLocations(await locRes.json());

        // Fetch Rooms for the Dropdown (using your existing RoomsController)
        const roomRes = await fetch('http://localhost:5106/api/rooms');
        if (roomRes.ok && isMounted) setRooms(await roomRes.json());
        
      } catch (err) { console.error("Initial load error:", err); }
    };
    
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  const refreshLocations = async () => {
    try {
      const res = await fetch('http://localhost:5106/api/camera/locations');
      if (res.ok) setLocations(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleEdit = (loc = null) => {
    if (loc) {
      setFormData(loc);
    } else {
      setFormData({
        location_ID: `CAM-${Math.floor(100 + Math.random() * 900)}`,
        camera_Name: '',
        logic_Type: 'gate',
        location_Type: 'entrance',
        associated_Room_ID: '', // Start empty
        is_Active: true
      });
    }
    setIsEditing(true);
  };

  const handleLogicChange = (field, value) => {
    let newData = { ...formData, [field]: value };
    const logic = field === 'logic_Type' ? value : newData.logic_Type;

    // If it's a gate, it shouldn't be tied to a specific classroom FK
    if (logic === 'gate') {
      newData.associated_Room_ID = ''; 
    } 
    setFormData(newData);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isNew = !locations.find(l => l.location_ID === formData.location_ID);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? 'http://localhost:5106/api/camera/locations' : `http://localhost:5106/api/camera/locations/${formData.location_ID}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsEditing(false);
        refreshLocations();
      } else {
        // ROBUST ERROR LOGGING: Extract the exact error from the backend
        const errorText = await res.text();
        alert(`❌ SAVE FAILED\n\nServer Status Code: ${res.status}\n\nDatabase/Server Error Details:\n${errorText}\n\n(Check your backend console for the full Oracle exception)`);
      }
    } catch (err) { 
      console.error(err); 
      alert(`⚠️ NETWORK ERROR\n\nCould not connect to the C# Backend.\nDetails: ${err.message}`);
    }
  };

  const confirmDelete = (loc) => {
    setModal({ isOpen: true, locationId: loc.location_ID, name: loc.camera_Name });
  };

  const executeDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5106/api/camera/locations/${modal.locationId}`, { method: 'DELETE' });
      if (res.ok) {
        setModal({ isOpen: false, locationId: null, name: '' });
        refreshLocations();
      } else {
        const errorText = await res.text();
        alert(`❌ DELETE FAILED\n\nStatus: ${res.status}\nDetails: ${errorText}`);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <ConfirmModal 
        isOpen={modal.isOpen} 
        type="danger" 
        title="Delete Hardware Node" 
        message={`Are you sure you want to permanently delete the node "${modal.name}"? The system will no longer accept video streams from this ID.`}
        onConfirm={executeDelete} 
        onCancel={() => setModal({ isOpen: false, locationId: null, name: '' })} 
      />

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hardware Node Manager</h2>
          <p className="text-slate-500 mt-1 font-medium text-lg">Configure IoT camera locations and validation logic.</p>
        </div>
        <button 
          onClick={() => handleEdit()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 text-lg"
        >
          <Plus size={20} /> Register Node
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="text-indigo-500" /> Node Configuration
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-black text-slate-500 uppercase mb-2">Camera Name *</label>
              <input required type="text" value={formData.camera_Name} onChange={e => setFormData({...formData, camera_Name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Main Gate Alpha" />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-500 uppercase mb-2">Hardware Type *</label>
              <select value={formData.logic_Type} onChange={e => handleLogicChange('logic_Type', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                <option value="gate">Gate</option>
                <option value="room">Room</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-500 uppercase mb-2">Flow Type *</label>
              <select value={formData.location_Type} onChange={e => handleLogicChange('location_Type', e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                <option value="entrance">Entrance</option>
                <option value="exit">Exit</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-black text-slate-500 uppercase mb-2">TARGET ROOM / BUILDING *</label>
              
              {/* SMART RENDERING: Dropdown for Rooms, Disabled text for Gates */}
              {formData.logic_Type === 'room' ? (
                <select 
                  required 
                  value={formData.associated_Room_ID || ''} 
                  onChange={e => setFormData({...formData, associated_Room_ID: e.target.value})} 
                  className="w-full p-4 bg-white border border-slate-300 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="" disabled>-- Select an Official Room --</option>
                  {rooms.map((r, idx) => {
                    // Fallback handles differing API capitalization (room_ID vs Room_ID)
                    const roomId = r.room_ID || r.Room_ID || r.roomId;
                    const bldg = r.building || r.Building || "Campus";
                    return (
                      <option key={idx} value={roomId}>
                        {roomId} ({bldg})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input 
                  type="text" 
                  value="N/A (Gate Hardware does not map to a specific classroom)" 
                  disabled
                  className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-400 outline-none cursor-not-allowed" 
                />
              )}
            </div>
            
            <div className="lg:col-span-2 flex justify-end items-end gap-3 pt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-lg">Cancel</button>
              <button type="submit" className="px-8 py-4 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2 text-lg active:scale-95"><Save size={20}/> Save Configuration</button>
            </div>
          </form>
        </div>
      )}

      {/* BIG, LEGIBLE, EVENLY SPACED TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr className="text-sm uppercase text-slate-500 font-black tracking-widest">
              <th className="p-5 w-1/6">Node ID</th>
              <th className="p-5 w-1/4">Name</th>
              <th className="p-5 w-1/6 text-center">Type</th>
              <th className="p-5 w-1/6 text-center">Flow</th>
              <th className="p-5 w-1/4">Linked Room</th>
              <th className="p-5 w-32 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map(loc => (
              <tr key={loc.location_ID} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="p-5">
                  <span className="font-mono font-black text-slate-500 text-lg bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{loc.location_ID}</span>
                </td>
                <td className="p-5">
                  <span className="font-black text-slate-800 text-lg">{loc.camera_Name}</span>
                </td>
                <td className="p-5 text-center">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest border ${loc.logic_Type === 'room' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {loc.logic_Type}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest border ${loc.location_Type === 'entrance' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {loc.location_Type}
                  </span>
                </td>
                <td className="p-5 font-black text-slate-600 text-lg">
                  {loc.associated_Room_ID || <span className="text-slate-300 italic text-sm">Gate Node</span>}
                </td>
                <td className="p-5 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <button onClick={() => handleEdit(loc)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-200" title="Edit Node">
                      <Edit2 size={20} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => confirmDelete(loc)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200" title="Delete Node">
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan="6" className="p-12 text-center text-slate-500 font-bold text-lg bg-slate-50/50 flex flex-col items-center justify-center">
                   <ShieldAlert size={48} className="mb-4 text-slate-300" />
                   No hardware nodes found. Please register your first camera edge node.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}