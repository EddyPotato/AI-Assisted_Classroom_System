import { Search, User, Mail, BookOpen } from 'lucide-react';

export default function StudentProfiles() {
  // Dummy student database
  const students = [
    { id: '24-1507', name: 'Edrian Cortes Rodriguez', course: 'BSIT', year: '2nd Year', status: 'Enrolled', initial: 'E' },
    { id: '24-1102', name: 'Maria Santos Rivera', course: 'BSA', year: '1st Year', status: 'Enrolled', initial: 'M' },
    { id: '23-0894', name: 'Juan Carlos Dela Cruz', course: 'BSIT', year: '3rd Year', status: 'Enrolled', initial: 'J' },
    { id: '22-4512', name: 'Ana Patricia Reyes', course: 'BSCS', year: '4th Year', status: 'On Leave', initial: 'A' },
  ];

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Student Directory</h2>
            <p className="text-gray-500 mt-1 font-medium">Manage and view enrolled student profiles.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shrink-0">
                {student.initial}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-gray-800">{student.name}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><User size={14} className="text-gray-400"/> {student.id}</span>
                  <span className="flex items-center gap-1"><BookOpen size={14} className="text-gray-400"/> {student.course}</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-lg ${student.status === 'Enrolled' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {student.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}