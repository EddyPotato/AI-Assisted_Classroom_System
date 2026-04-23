import { useState, useEffect } from 'react';
import DashboardContent from './DashboardContent';

export default function RoomDashboard({ roomState, occupancy, lastScanned }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/rooms');
        if (response.ok) {
          const data = await response.json();
          setFacilities(data);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };
    fetchRooms();
  }, []);

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
              key={room.room_ID}
              onClick={() => setSelectedRoom(room.room_ID)}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-gray-800 group-hover:text-blue-600 transition-colors tracking-tight">
                    {room.room_ID}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${room.status === 'In Session' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {room.status}
                  </span>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <p className="text-sm font-bold text-gray-500 flex items-center justify-between">
                    <span>Building:</span> <span className="text-gray-800">{room.building}</span>
                  </p>
                  <p className="text-sm font-bold text-gray-500 flex items-center justify-between">
                    <span>Floor:</span> <span className="text-indigo-600">Floor {room.floor}</span>
                  </p>
                  <p className="text-sm font-bold text-gray-500 flex items-center justify-between">
                    <span>Type:</span> <span className="text-gray-800">{room.room_Type}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {facilities.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-400 font-bold bg-gray-100 rounded-xl border border-gray-200 border-dashed">
               Connecting to Oracle Database to fetch facilities...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}