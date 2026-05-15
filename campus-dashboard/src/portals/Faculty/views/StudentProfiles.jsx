import { Search, User, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function StudentProfiles({ roster }) {
  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Student Profiles</h2>
            <p className="text-gray-500 mt-1 font-medium">Real-time attendance tracking for the current session.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {!roster || roster.length === 0 ? (
             <div className="col-span-2 p-12 text-center text-slate-400 font-bold bg-white rounded-xl border border-slate-200 border-dashed">
                Awaiting connection to Database / No students enrolled.
             </div>
          ) : roster.map((student) => {
            const id = student.student_ID || student.studentId || student.STUDENT_ID;
            const fName = student.first_Name || student.firstName || student.FIRST_NAME || '';
            const lName = student.last_Name || student.lastName || student.LAST_NAME || '';
            const status = student.status || student.Status || 'Absent';
            const initial = fName ? fName.charAt(0).toUpperCase() : 'U';

            return (
              <div 
                key={id} 
                className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-5 transition-all ${
                  status === 'Present' ? 'border-emerald-200 shadow-emerald-100/50' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border ${
                  status === 'Present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  {initial}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-gray-800">{fName} {lName}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><User size={14} className="text-gray-400"/> {id}</span>
                  </div>
                </div>
                
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${
                    status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    status === 'Late' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {status === 'Present' ? <CheckCircle size={14} /> : status === 'Late' ? <Clock size={14} /> : <XCircle size={14} />}
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}