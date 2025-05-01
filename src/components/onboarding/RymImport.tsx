import React, { useState } from 'react';
import { FileIcon, UploadIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
export function RymImport() {
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const handleImport = async () => {
    if (!file) return;
    setImportStatus('importing');
    // Simulate import process
    setTimeout(() => {
      setImportStatus('success');
    }, 2000);
  };
  return <div>
      <p className="text-lg mb-6">
        Already have a RateYourMusic account? Import your ratings and reviews to
        get started quickly.
      </p>
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="font-bold mb-4">How to export your RYM data:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Go to your RateYourMusic profile</li>
          <li>Click on "Export Ratings"</li>
          <li>Select "CSV" format</li>
          <li>Download the file</li>
          <li>Upload it here</li>
        </ol>
      </div>
      <div className="border-2 border-dashed rounded-xl p-8 text-center">
        {importStatus === 'idle' && <>
            <div className="mb-4">
              <FileIcon size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="font-medium mb-2">
                {file ? file.name : 'Drop your RYM export file here'}
              </p>
              <p className="text-sm text-gray-500">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to select'}
              </p>
            </div>
            <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="rym-file" />
            <label htmlFor="rym-file" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors cursor-pointer">
              <UploadIcon size={18} />
              <span>Select File</span>
            </label>
          </>}
        {importStatus === 'importing' && <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Importing your ratings...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>}
        {importStatus === 'success' && <div className="text-center text-green-600">
            <CheckIcon size={40} className="mx-auto mb-4" />
            <p className="font-medium">Import successful!</p>
            <p className="text-sm">Your ratings have been imported</p>
          </div>}
        {importStatus === 'error' && <div className="text-center text-red-600">
            <AlertCircleIcon size={40} className="mx-auto mb-4" />
            <p className="font-medium">Import failed</p>
            <p className="text-sm">Please try again</p>
          </div>}
      </div>
      {file && importStatus === 'idle' && <div className="mt-6 text-center">
          <button onClick={handleImport} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
            Start Import
          </button>
        </div>}
      <p className="text-sm text-center mt-8 text-gray-500">
        Don't have a RateYourMusic account? No problem! You can skip this step.
      </p>
    </div>;
}