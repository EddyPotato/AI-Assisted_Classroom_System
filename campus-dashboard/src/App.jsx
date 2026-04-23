import { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Import our new modular components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardContent from './components/DashboardContent';
import SimulationPanel from './components/SimulationPanel';

function App() {
  // STATE MANAGEMENT
  const [roomState, setRoomState] = useState('UNLOCKED (Class Ongoing)'); 
  const [occupancy, setOccupancy] = useState(0);
  const [lastScanned, setLastScanned] = useState(null);
  const [eventLogs, setEventLogs] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: 'System Initialized. Awaiting Events.', type: 'system' }
  ]);

  // API ROUTES
  const API_BASE_URL = 'http://localhost:5106/api';
  const HUB_URL = 'http://localhost:5106/campushub';

  // SIGNALR REAL-TIME CONNECTION
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .configureLogging(LogLevel.Information)
      .build();

    connection.on("ReceiveScanEvent", (student) => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setLastScanned(student);
      setOccupancy(prev => prev + 1);
      
      setEventLogs(prev => [{ 
        time: now, 
        message: `AI CAMERA: ${student.first_Name} ${student.last_Name} verified and logged.`, 
        type: 'success' 
      }, ...prev]);
    });

    connection.start()
      .then(() => console.log("Connected to SignalR Hub successfully!"))
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop();
    };
  }, []);

  // MANUAL RPG SIMULATION HANDLER
  const triggerEvent = async (actionType) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newMessage = '';
    let newType = 'info';

    switch(actionType) {
      case 'STUDENT_SCAN':
        if (roomState.includes('LOCKED')) {
          newMessage = 'Failed: Cannot enter. Professor not present.';
          newType = 'error';
        } else {
          try {
            const response = await fetch(`${API_BASE_URL}/student/24-1507`);
            if (response.ok) {
              const student = await response.json();
              setOccupancy(prev => prev + 1);
              setLastScanned(student);
              newMessage = `Manual Override: Access Granted for ${student.first_Name}.`;
              newType = 'success';
            }
          } catch (error) {
            newMessage = 'Network Error: Cannot connect to API.';
            newType = 'error';
          }
        }
        break;
      default:
        break;
    }

    setEventLogs(prev => [{ time: now, message: newMessage, type: newType }, ...prev]);
  };

  // UI LAYOUT RENDER
  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <DashboardContent 
          roomState={roomState} 
          occupancy={occupancy} 
          lastScanned={lastScanned} 
        />
        <SimulationPanel 
          triggerEvent={triggerEvent} 
          eventLogs={eventLogs} 
        />
      </div>
    </div>
  );
}

export default App;