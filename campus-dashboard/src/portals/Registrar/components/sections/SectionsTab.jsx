import { useState, useEffect } from 'react';
import { Layers, Users, BookOpen } from 'lucide-react';
import SectionRoster from './SectionRoster';

export default function SectionsTab() {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null); // Controls the Drill-Down

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/sections');
        if (response.ok) {
          setSections(await response.json());
        }
      } catch (err) {
        console.error("Failed to fetch sections", err);
      }
    };
    fetchSections();
  }, []);

  // If a section is selected, render the Roster View instead of the Grid
  if (activeSection) {
    return <SectionRoster section={activeSection} onBack={() => setActiveSection(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Section Directory</h2>
          <p className="text-slate-500 mt-1 font-medium">Click a section block to view its enrolled student roster.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <div 
            key={sec.section_ID}
            onClick={() => setActiveSection(sec)}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-primary-400 transition-all cursor-pointer group flex flex-col justify-between h-48 relative overflow-hidden"
          >
            {/* Background Icon Decoration */}
            <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-50 group-hover:text-primary-50 group-hover:scale-110 transition-transform duration-500">
              <Layers size={140} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-3xl font-black text-slate-800 group-hover:text-primary-600 transition-colors tracking-tight">
                  {sec.section_Name}
                </h3>
              </div>
              <p className="text-sm font-bold text-slate-500 bg-slate-100 inline-block px-3 py-1 rounded-lg border border-slate-200">
                {sec.section_ID}
              </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-600 font-bold">
                <BookOpen size={16} className="text-primary-500" />
                {sec.course} (Yr {sec.year_Level})
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <Users size={14} />
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed">
            No sections found in the database.
          </div>
        )}
      </div>
    </div>
  );
}