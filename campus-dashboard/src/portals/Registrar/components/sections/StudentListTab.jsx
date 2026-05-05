import { UserMinus, Camera } from 'lucide-react';

export default function StudentListTab({ 
  enrolledStudents, 
  searchQuery, 
  onSetZoomedImage, 
  cacheBuster,
  onOpenConfirmModal 
}) {
  const filteredStudents = enrolledStudents.filter(student => {
    const fullName = `${student.last_Name} ${student.first_Name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || student.student_ID.includes(searchQuery);
  });

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-200">
        <thead>
          <tr className="bg-white text-xs uppercase text-slate-400 font-black border-b-2 border-slate-100">
            <th className="p-4 w-24 text-center">Face</th>
            <th className="p-4 w-32">Student ID</th>
            <th className="p-4">Last Name</th>
            <th className="p-4">First Name</th>
            <th className="p-4 w-28 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredStudents.map((student) => (
            <tr key={student.student_ID} className="hover:bg-slate-50 transition-colors group">
              <td className="p-3 flex justify-center items-center">
                {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                  <img 
                    src={`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`} 
                    alt="Face" 
                    onClick={() => onSetZoomedImage(`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`)}
                    className="w-10 h-10 object-cover aspect-square rounded-full border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity" 
                  />
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200"><Camera size={14}/></div>
                )}
              </td>
              <td className="p-4 font-bold text-blue-600 font-mono text-sm">{student.student_ID}</td>
              <td className="p-4 font-black text-slate-800">{student.last_Name}</td>
              <td className="p-4 font-bold text-slate-700">{student.first_Name}</td>
              <td className="p-4 text-center">
                <button onClick={() => onOpenConfirmModal(student)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Remove Student">
                  <UserMinus size={18} />
                </button>
              </td>
            </tr>
          ))}
          {filteredStudents.length === 0 && (
            <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-bold">Roster is empty.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
