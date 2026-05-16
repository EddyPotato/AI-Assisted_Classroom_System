import { useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Search, UserPlus, BookOpen, Users, CalendarPlus } from 'lucide-react';

import { useEnrollmentLogic } from './hooks/useEnrollmentLogic';
import { useScheduleLogic } from './hooks/useScheduleLogic';

import AddStudentsView from './AddStudentsView'; 
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import ScheduleForm from '../schedules/ScheduleForm';
import FaceZoomModal from '../users/FaceZoomModal';
import StudentListTab from './StudentListTab';
import SchedulesTab from './SchedulesTab';

// THE FIX: Accept termId from the parent SectionsTab
export default function SectionRoster({ section, termId, onBack, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);
  const [cacheBuster] = useState(() => Date.now());

  // THE FIX: Pass termId down to the custom hooks to ensure all queries are semester-bound
  const enrollment = useEnrollmentLogic(section.section_ID, termId);
  const schedule = useScheduleLogic(section.section_ID, termId);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    
    // Safely close forms when switching tabs
    if (tab === 'students') {
      schedule.setShowScheduleForm(false);
    } else if (tab === 'subjects') {
      enrollment.setShowAddStudentsView(false);
    }
  };

  if (!section) return null;

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      
      <FaceZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />

      {/* Modals for deletions/removals */}
      <ConfirmModal
        isOpen={enrollment.confirmModal.isOpen}
        type="danger"
        title="Remove Student"
        message={`Remove ${enrollment.confirmModal.student?.first_Name} from this section's active roster?`}
        onConfirm={enrollment.executeRemoveStudent}
        onCancel={() => enrollment.setConfirmModal({ isOpen: false, student: null })}
      />
      <ConfirmModal
        isOpen={schedule.confirmSchedModal.isOpen}
        type="danger"
        title="Remove Subject"
        message="Remove this subject and schedule from the section for this semester?"
        onConfirm={schedule.executeDeleteSchedule}
        onCancel={() => schedule.setConfirmSchedModal({ isOpen: false, scheduleId: null })}
      />

      {/* Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Left Side: Title & Back Button */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {section.section_Name}
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Block Section Master Roster • <span className="text-primary-600">{termId}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Edit & Delete Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onEdit} 
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-xl font-bold transition-all border border-amber-200 shadow-sm active:scale-95 text-sm"
          >
            <Edit2 size={16} strokeWidth={2.5} /> Edit Details
          </button>
          <button 
            onClick={onDelete} 
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl font-bold transition-all border border-rose-200 shadow-sm active:scale-95 text-sm"
          >
            <Trash2 size={16} strokeWidth={2.5} /> Delete Section
          </button>
        </div>

      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
        <button
          onClick={() => handleTabChange('students')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'students'
              ? 'bg-blue-50/50 text-blue-700 border-blue-600'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
          }`}
        >
          <Users size={18} /> Student List <span className="ml-1 bg-white border border-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-600">{enrollment.enrolledStudents.length}</span>
        </button>

        <button
          onClick={() => handleTabChange('subjects')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'subjects'
              ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
          }`}
        >
          <BookOpen size={18} /> Schedules <span className="ml-1 bg-white border border-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-600">{schedule.scheduleData?.length || 0}</span>
        </button>
      </div>

      {/* --- THE ROUTING LOGIC --- */}
      {activeTab === 'students' && enrollment.showAddStudentsView ? (
        <AddStudentsView
          section={section}
          termId={termId}
          currentEnrollees={enrollment.enrolledStudents}
          onBack={() => enrollment.setShowAddStudentsView(false)}
          onAdd={(newStudents) => {
            enrollment.handleAddStudents(newStudents);
            enrollment.setShowAddStudentsView(false); 
          }}
        />
      ) : activeTab === 'subjects' && schedule.showScheduleForm ? (
        <ScheduleForm
          schedule={schedule.editingSchedule}
          sectionId={section.section_ID}
          termId={termId} // THE FIX: Pass termId to the form so schedules are stamped
          onBack={() => { schedule.setShowScheduleForm(false); schedule.setEditingSchedule(null); }}
          onSuccess={() => { schedule.setShowScheduleForm(false); schedule.setEditingSchedule(null); schedule.fetchSchedule(); }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">

          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'students' ? 'students' : 'schedules'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            {activeTab === 'students' ? (
              <button onClick={() => enrollment.setShowAddStudentsView(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
                <UserPlus size={18} /> Add Students
              </button>
            ) : (
              <button onClick={() => schedule.setShowScheduleForm(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
                <CalendarPlus size={18} /> Assign Subject
              </button>
            )}
          </div>

          {/* Render the decoupled tabs */}
          {activeTab === 'students' && (
            <StudentListTab
              enrolledStudents={enrollment.enrolledStudents}
              searchQuery={searchQuery}
              onSetZoomedImage={setZoomedImage}
              cacheBuster={cacheBuster}
              onOpenConfirmModal={(student) => enrollment.setConfirmModal({ isOpen: true, student })}
            />
          )}

          {activeTab === 'subjects' && (
            <SchedulesTab
              scheduleData={schedule.scheduleData}
              searchQuery={searchQuery}
              schedSortConfig={schedule.schedSortConfig}
              onHandleSchedSort={schedule.handleSchedSort}
              onSetZoomedImage={setZoomedImage}
              cacheBuster={cacheBuster}
              onEditSchedule={schedule.handleEditSchedule}
              onOpenConfirmSchedModal={(scheduleId) => schedule.setConfirmSchedModal({ isOpen: true, scheduleId })}
            />
          )}
        </div>
      )}
    </div>
  );
}