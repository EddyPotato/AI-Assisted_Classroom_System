import { Clock, Filter, Download } from 'lucide-react';

export default function AttendanceLogs({ eventLogs }) {
  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Master Attendance Log</h2>
            <p className="text-gray-500 mt-1 font-medium">Real-time historical view of all campus scanner events.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-black">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event Type</th>
                <th className="p-4 w-1/2">Description / Match</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eventLogs.map((log, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-gray-500 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" /> {log.time}
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-700">
                    {log.type === 'success' ? 'Biometric Scan' : log.type === 'error' ? 'Security Alert' : 'System Event'}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-800">{log.message}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      log.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 
                      log.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {log.type === 'success' ? 'Verified' : log.type === 'error' ? 'Blocked' : 'Info'}
                    </span>
                  </td>
                </tr>
              ))}
              {eventLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">No events recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}