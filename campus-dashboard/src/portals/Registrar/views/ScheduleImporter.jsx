import { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export default function ScheduleImporter() {
  const [csvText, setCsvText] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // null, 'success', 'error'

  // Standard Template Format Expected
  const EXPECTED_HEADERS = "Subject_Code,Section_Id,Professor_Id,Room_Id,Time_Start,Time_End,Class_Days,Subject_Type";

  const handleParse = () => {
    if (!csvText.trim()) return;

    // Simple CSV parser
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    // Skip header if the user copied it
    let startIndex = 0;
    if (lines[0].toLowerCase().includes('subject_code')) {
      startIndex = 1;
    }

    const parsed = [];
    for (let i = startIndex; i < lines.length; i++) {
      // Split by comma, handling potential spaces
      const columns = lines[i].split(',').map(col => col.trim());
      
      if (columns.length >= 7) {
        parsed.push({
          Subject_Code: columns[0],
          Section_Id: columns[1],
          Professor_Id: columns[2],
          Room_Id: columns[3],
          Time_Start: columns[4],
          Time_End: columns[5],
          Class_Days: columns[6],
          Subject_Type: columns[7] || 'Lec'
        });
      }
    }
    setPreviewData(parsed);
    setImportStatus(null);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);
    setImportStatus(null);

    try {
      const response = await fetch('http://localhost:5106/api/schedules/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData)
      });

      if (response.ok) {
        setImportStatus('success');
        setCsvText('');
        setPreviewData([]);
      } else {
        setImportStatus('error');
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
          <UploadCloud size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Master Schedule Import</h2>
          <p className="text-slate-500 font-medium mt-1">
            Copy and paste your department's Excel schedule directly into the system. 
            This will instantly populate the dashboards for all assigned professors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Instructions & Input */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <FileText size={16} /> 1. Expected Format (CSV)
            </h3>
            <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
              <code className="text-xs text-emerald-400 font-mono whitespace-nowrap">
                {EXPECTED_HEADERS}
              </code>
              <div className="text-xs text-slate-400 font-mono mt-2 whitespace-nowrap">
                SE101, SEC-001, PRO-0001, IL604, 09:00 AM, 12:00 PM, Monday/Mon, Lec<br/>
                IT301, SEC-002, PRO-0001, IK504, 01:00 PM, 04:00 PM, Tuesday/Tue, Lab
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
              2. Paste CSV Data Here
            </h3>
            <textarea
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
              placeholder="Paste rows from Excel or CSV file..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <button 
              onClick={handleParse}
              disabled={!csvText.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-95"
            >
              Parse Data <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Col: Preview & Confirm */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
            <span>3. Data Preview</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px]">
              {previewData.length} ROWS FOUND
            </span>
          </h3>

          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col min-h-[300px]">
            {previewData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No data parsed yet.</p>
                <p className="text-sm">Paste your data and click Parse.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr className="text-xs uppercase text-slate-500 font-bold">
                      <th className="p-3">Subject</th>
                      <th className="p-3">Prof ID</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="p-3 font-bold text-slate-700">{row.Subject_Code} <span className="text-slate-400 font-normal">({row.Section_Id})</span></td>
                        <td className="p-3 font-mono text-slate-500">{row.Professor_Id}</td>
                        <td className="p-3 text-slate-600">{row.Time_Start}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {importStatus === 'success' && (
            <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3 font-bold">
              <CheckCircle2 size={20} /> Schedules successfully imported!
            </div>
          )}

          {importStatus === 'error' && (
            <div className="mt-4 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-3 font-bold">
              <AlertCircle size={20} /> Error importing schedules. Check format.
            </div>
          )}

          <button 
            onClick={handleImport}
            disabled={previewData.length === 0 || isProcessing}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-95 text-lg tracking-wide uppercase"
          >
            {isProcessing ? 'Importing Data...' : 'Confirm & Import to Database'}
          </button>
        </div>

      </div>
    </div>
  );
}