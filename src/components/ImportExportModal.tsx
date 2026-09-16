import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Database,
  ArrowDownToLine
} from 'lucide-react';
import type { Company, StudentProfile } from '../types';
import { 
  exportCompaniesToExcel, 
  exportCompaniesToCSV, 
  downloadExcelTemplate, 
  parseExcelOrCSVFile 
} from '../services/excelService';
import { exportToJSON, importFromJSON } from '../services/storage';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  profile?: StudentProfile | null;
  onImportComplete: (importedCompanies: Company[], importedProfile?: StudentProfile) => void;
  initialTab?: 'import' | 'export' | 'backup';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  companies,
  profile,
  onImportComplete,
  initialTab = 'export',
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backup'>(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const result = await parseExcelOrCSVFile(file);
      if (result.success && (result.companies.length > 0 || result.profile)) {
        onImportComplete(result.companies, result.profile);
        setStatusMessage({
          type: 'success',
          message: `Successfully imported ${result.importedCount} companies${result.profile ? ` and restored profile for ${result.profile.name}` : ''}!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: result.errors.join(', ') || 'Failed to parse file or spreadsheet is empty.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err.message || 'Error processing spreadsheet.',
      });
    } finally {
      setIsProcessing(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleExportExcel = () => {
    exportCompaniesToExcel(companies, profile);
    setStatusMessage({ type: 'success', message: 'Excel file generated and downloaded.' });
  };

  const handleExportCSV = () => {
    exportCompaniesToCSV(companies);
    setStatusMessage({ type: 'success', message: 'CSV file generated and downloaded.' });
  };

  const handleJSONBackupDownload = () => {
    const jsonStr = exportToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TrackMyCompany_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setStatusMessage({ type: 'success', message: 'JSON backup downloaded.' });
  };

  const handleJSONRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importFromJSON(text);
        if (success) {
          setStatusMessage({ type: 'success', message: 'Backup restored successfully!' });
          window.location.reload();
        } else {
          setStatusMessage({ type: 'error', message: 'Invalid backup file format.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', message: 'Failed to read backup file.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#131B2E] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0B0F19]/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                Excel & CSV Data Hub
              </h2>
              <p className="text-[10px] text-slate-400 leading-tight">
                Import or export your placement spreadsheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 px-4 pt-2.5 gap-2 bg-[#0B0F19]/30 shrink-0">
          <button
            onClick={() => { setActiveTab('export'); setStatusMessage(null); }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => { setActiveTab('import'); setStatusMessage(null); }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Spreadsheet</span>
          </button>

          <button
            onClick={() => { setActiveTab('backup'); setStatusMessage(null); }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>JSON Backup</span>
          </button>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/50 border-rose-800/80 text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.message}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Download your complete campus placement tracking data ({companies.length} companies) to an Excel spreadsheet or CSV file.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExportExcel}
                  disabled={companies.length === 0}
                  className="p-4 rounded-xl bg-[#0B0F19] border border-slate-700/80 hover:border-emerald-500/50 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Excel (.xlsx)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Includes formatted columns, auto-width, and status tags.
                  </p>
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={companies.length === 0}
                  className="p-4 rounded-xl bg-[#0B0F19] border border-slate-700/80 hover:border-indigo-500/50 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                    <FileText className="w-4 h-4" />
                    <span>Download CSV (.csv)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Plain comma-separated format compatible with Google Sheets.
                  </p>
                </button>
              </div>

              {companies.length === 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300">
                  No companies added yet to export. You can import an existing spreadsheet or add your first company.
                </div>
              )}
            </div>
          )}

          {/* IMPORT TAB */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Upload Excel (.xlsx, .xls) or CSV (.csv)
                </span>
                <button
                  onClick={downloadExcelTemplate}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium underline"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Download Sample Template</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#0B0F19]/60 hover:bg-[#0B0F19] transition-all">
                <UploadCloud className="w-10 h-10 text-indigo-400/80 mb-2" />
                <span className="text-sm font-semibold text-white">
                  Click to browse or drop spreadsheet file
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports Excel (.xlsx) and CSV files. Automatic column detection.
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>

              <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Supported columns in your Excel file:</p>
                <p>• Company Name, Role, CTC, Application Status (Applied / Not Applied), OA Date, Rejection Reason</p>
              </div>
            </div>
          )}

          {/* BACKUP TAB */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Save an exact JSON snapshot of your student profile, custom rejection reasons, and tracked companies.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleJSONBackupDownload}
                  className="p-4 rounded-xl bg-[#0B0F19] border border-slate-700/80 hover:border-indigo-500/50 text-left transition-all"
                >
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Saves all local data to a single portable JSON file.
                  </p>
                </button>

                <label className="p-4 rounded-xl bg-[#0B0F19] border border-slate-700/80 hover:border-purple-500/50 text-left transition-all cursor-pointer block">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                    <UploadCloud className="w-4 h-4" />
                    <span>Restore from JSON</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Load previously backed up local data.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJSONRestore}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B0F19]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
