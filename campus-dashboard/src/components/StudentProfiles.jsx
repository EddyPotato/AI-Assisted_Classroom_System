import { Search, User, BookOpen, CheckCircle, XCircle } from 'lucide-react';

export default function StudentProfiles({ presentStudents }) {
  // Integrated Student Database for Room/Session Demo
  const students = [
    { id: '24-1507', name: 'Edrian Cortes Rodriguez', course: 'BSIT', year: '2nd Year', initial: 'E' },
    { id: '23-2244', name: 'Darrel Christian David Asinas Datoon', course: 'BSIT', year: '2nd Year', initial: 'D' },
    { id: '24-1487', name: 'Daniel Reta Pelicano', course: 'BSIT', year: '2nd Year', initial: 'D' },
    { id: '24-1102', name: 'Maria Santos Rivera', course: 'BSA', year: '1st Year', initial: 'M' },
  ];

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
          {students.map((student) => {
            // Check if the student's ID is in the real-time 'present' array
            const isPresent = presentStudents.includes(student.id);

            return (
              <div 
                key={student.id} 
                className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-5 transition-all ${
                  isPresent ? 'border-emerald-200 shadow-emerald-100/50' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 border ${
                  isPresent ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  {student.initial}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-gray-800">{student.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><User size={14} className="text-gray-400"/> {student.id}</span>
                    <span className="flex items-center gap-1"><BookOpen size={14} className="text-gray-400"/> {student.course}</span>
                  </div>
                </div>
                
                {/* Dynamic Attendance Status Badge */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${
                    isPresent 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {isPresent ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {isPresent ? 'Present' : 'Absent'}
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