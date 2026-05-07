import { useState, useEffect } from 'react';
import { Video, Plus, Edit2, Save, Server } from 'lucide-react';

export default function CameraManagerView() {
  const [locations, setLocations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // 1. Initial Load: Isolated safely inside the useEffect
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await fetch('http://localhost:5106/api/camera/locations');
        if (res.ok) {
          const data = await res.json();
          // This flag proves to the linter that the state update is safe and asynchronous
          if (isMounted) setLocations(data); 
        }
      } catch (err) { console.error(err); }
    };
    
    loadData();
    return () => { isMounted = false; };
  }, []); // <-- Empty array is now perfectly safe!

  // 2. Manual Refresh: Used only after saving new data
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
        associated_Room_ID: '',
        status_On_Scan: 'in-campus',
        is_Active: true
      });
    }
    setIsEditing(true);
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
        refreshLocations(); // Call the manual refresh here
      } else {
        alert('Failed to save hardware node.');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hardware Node Manager</h2>
          <p className="text-slate-500 mt-1 font-medium">Configure IoT camera locations and validation logic.</p>
        </div>
        <button 
          onClick={() => handleEdit()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} /> Register Node
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Node ID (Fixed)</label>
              <input type="text" value={formData.location_ID} disabled className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Camera Name</label>
              <input required type="text" value={formData.camera_Name} onChange={e => setFormData({...formData, camera_Name: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold" placeholder="e.g. Main Gate Alpha" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Logic Type</label>
              <select value={formData.logic_Type} onChange={e => setFormData({...formData, logic_Type: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold">
                <option value="gate">Gate (Campus Entry/Exit)</option>
                <option value="room">Room (Classroom Attendance)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location Type</label>
              <select value={formData.location_Type} onChange={e => setFormData({...formData, location_Type: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold">
                <option value="entrance">Entrance</option>
                <option value="exit">Exit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Room ID (If Logic = Room)</label>
              <input type="text" value={formData.associated_Room_ID || ''} onChange={e => setFormData({...formData, associated_Room_ID: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold" placeholder="e.g. IL604" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Presence Status on Scan</label>
              <input required type="text" value={formData.status_On_Scan} onChange={e => setFormData({...formData, status_On_Scan: e.target.value})} className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold" placeholder="e.g. in-campus" />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
              <button type="submit" className="px-6 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2"><Save size={18}/> Save Node config</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs uppercase text-slate-500 font-black">
              <th className="p-4">Node ID / Name</th>
              <th className="p-4">Logic Pipeline</th>
              <th className="p-4">Linked Room</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map(loc => (
              <tr key={loc.location_ID} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-black text-slate-800">{loc.camera_Name}</div>
                  <div className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1"><Server size={12}/> {loc.location_ID}</div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${loc.logic_Type === 'room' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{loc.logic_Type}</span>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${loc.location_Type === 'entrance' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{loc.location_Type}</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-slate-600">{loc.associated_Room_ID || <span className="text-slate-300 italic">None</span>}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(loc)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}