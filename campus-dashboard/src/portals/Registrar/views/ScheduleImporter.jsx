import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ScheduleImporter({ termId }) {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleParse = () => {
    try {
      const lines = rawText.trim().split('\n');
      const data = lines.map(line => {
        const parts = line.split('\t').map(p => p.trim());
        return {
          Subject_Code: parts[0] || '',
          Section_Id: parts[1] || '',
          Professor_Id: parts[2] || '',
          Room_Id: parts[3] || '',
          Time_Start: parts[4] || '',
          Time_End: parts[5] || '',
          Class_Days: parts[6] || '',
          Subject_Type: parts[7] || 'Lec'
        };
      }).filter(item => item.Subject_Code && item.Section_Id && item.Time_Start);
      
      setParsedData(data);
      setStatus({ type: 'success', message: `Successfully parsed ${data.length} schedules.` });
    } catch (error) {
      // THE FIX: Proper error handling usage for ESLint and better debugging
      console.error("Parse Error:", error);
      setStatus({ type: 'error', message: `Failed to parse text (${error.message}). Please ensure correct formatting.` });
    }
  };

  const handleImport = async () => {
    if (!termId) {
      setStatus({ type: 'error', message: 'Critical Error: No Academic Term selected. Please select a term in the top header.' });
      return;
    }

    if (parsedData.length === 0) return;

    setIsImporting(true);
    setStatus(null);

    try {
      const response = await fetch(`http://localhost:5000/api/schedules/import?termId=${termId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Import failed');

      setStatus({ type: 'success', message: data.message });
      setParsedData([]);
      setRawText('');
    } catch (error) {
      // THE FIX: Proper error handling usage
      console.error("Import Request Error:", error);
      setStatus({ type: 'error', message: error.message || 'An unexpected server error occurred.' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <UploadCloud className="text-primary-600" /> Master Schedule Import
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Bulk upload class schedules for{' '}
            <span className={`font-bold px-2 py-0.5 rounded border ${termId ? 'text-primary-600 bg-primary-50 border-primary-200' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
              {termId || 'NO TERM SELECTED'}
            </span>
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
        
        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border font-bold text-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {status.message}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <label className="text-sm font-bold text-slate-700 mb-2 flex justify-between items-end">
            <span>Paste Schedule Data (Excel / Sheets)</span>
            <span className="text-xs text-slate-400 font-normal">Format: Subject | Section | Prof | Room | Start | End | Days | Type</span>
          </label>
          <textarea 
            className="flex-1 w-full min-h-75 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono text-sm resize-none"
            placeholder="Paste tab-separated data here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleParse}
            disabled={!rawText.trim() || isImporting}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <FileText size={18} /> Review & Parse Data
          </button>
          
          <button 
            onClick={handleImport}
            disabled={parsedData.length === 0 || isImporting || !termId}
            className={`flex-1 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 ${
              parsedData.length === 0 || !termId 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20'
            }`}
          >
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
            {isImporting ? 'Importing to Database...' : `Commit ${parsedData.length} Schedules to Term`}
          </button>
        </div>

      </div>
    </div>
  );
}