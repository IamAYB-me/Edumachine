import React, { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

// Use global XLSX from CDN
declare global {
  interface Window {
    XLSX: any;
  }
}

const XLSX = (window as any).XLSX;

interface ExcelImportProps {
  onImport: (data: any[]) => void;
  templateName?: string;
  expectedKeys?: string[];
}

export default function ExcelImport({ onImport, templateName = 'Template', expectedKeys = [] }: ExcelImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      if (data.length > 0) {
        onImport(data);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      expectedKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${templateName}_Template.xlsx`);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Import Excel
      </button>
      {expectedKeys.length > 0 && (
        <button
          onClick={downloadTemplate}
          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
        >
          <FileSpreadsheet className="w-3 h-3" />
          Download Template
        </button>
      )}
    </div>
  );
}
