import { useState } from 'react';
import DashboardContent from './DashboardContent';

export default function RoomDashboard({ roomState, occupancy, lastScanned }) {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const facilities = [
    { id: '302', name: 'Room 302', type: 'Computer Laboratory', capacity: 50, status: 'Active' },
    { id: '303', name: 'Room 303', type: 'Lecture Hall', capacity: 40, status: 'Inactive' },
    { id: '304', name: 'Room 304', type: 'Cisco Networking Lab', capacity: 30, status: 'Active' },
  ];

  if (selectedRoom) {
    return (
      <DashboardContent 
        roomName={selectedRoom}
        roomState={roomState} 
        occupancy={occupancy} 
        lastScanned={lastScanned} 
        onBack={() => setSelectedRoom(null)} 
      />
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50 relative">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Campus Facilities</h2>
        <p className="text-gray-500 mt-2 font-medium">Select a room to monitor live occupancy and edge node camera feeds.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {facilities.map(room => (
            <div 
              key={room.id}
              onClick={() => setSelectedRoom(room.name)}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">{room.name}</h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${room.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                  {room.status}
                </span>
              </div>
              <div className="space-y-3 pt-2 border-t border-gray-50">
                <p className="text-sm font-bold text-gray-500 flex items-center justify-between">
                  <span>Type:</span> <span className="text-gray-800">{room.type}</span>
                </p>
                <p className="text-sm font-bold text-gray-500 flex items-center justify-between">
                  <span>Capacity:</span> <span className="text-gray-800">{room.capacity}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}