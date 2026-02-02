
import React, { useState, useRef } from 'react';
import { Expense, ExpenseCategory } from '../types';
import ExpenseForm from './ExpenseForm';
import { analyzeReceipt } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { pdfToImagePreviews } from '../utils/pdfUtils';
import { CameraIcon } from './icons/CameraIcon';
import { GalleryIcon } from './icons/GalleryIcon';
import { ManualIcon } from './icons/ManualIcon';
import { CloseIcon } from './icons/CloseIcon';

interface AddExpenseModalProps {
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'> | Omit<Expense, 'id'>[]) => void;
}

type View = 'options' | 'form' | 'pdfProcessing';

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose, onAddExpense }) => {
  const [view, setView] = useState<View>('options');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfProcessingStatus, setPdfProcessingStatus] = useState<string>('');
  const [initialData, setInitialData] = useState<Partial<Omit<Expense, 'id'>> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleProcessPdf = async (file: File) => {
    setView('pdfProcessing');
    setError(null);
    try {
        const pageImages = await pdfToImagePreviews(file, setPdfProcessingStatus);
        
        const extractedExpenses: Omit<Expense, 'id'>[] = [];
        for (let i = 0; i < pageImages.length; i++) {
            const page = pageImages[i];
            setPdfProcessingStatus(`Analyzing page ${i + 1} of ${pageImages.length}...`);
            try {
                const extractedData = await analyzeReceipt(page.base64, page.mimeType);
                extractedExpenses.push({
                    ...extractedData,
                    imagePreview: page.previewUrl,
                });
            } catch (pageError) {
                console.error(`Failed to process page ${i+1}:`, pageError);
            }
        }
        
        if (extractedExpenses.length > 0) {
            onAddExpense(extractedExpenses);
        } else {
            throw new Error("Could not extract any expenses from the PDF.");
        }

    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during PDF processing.");
      setView('options');
    }
  };

  const handleProcessImage = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setView('form');

    try {
      const imagePreview = URL.createObjectURL(file);
      const base64Image = await fileToBase64(file);
      
      setInitialData({ imagePreview: `data:${file.type};base64,${base64Image}` });

      const extractedData = await analyzeReceipt(base64Image, file.type);
      setInitialData(prev => ({ ...prev, ...extractedData }));

    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
        handleProcessPdf(file);
    } else if (file.type.startsWith('image/')) {
        handleProcessImage(file);
    } else {
        setError("Unsupported file type. Please select an image or a PDF.");
    }
    event.target.value = '';
  };

  const handleManualEntry = () => {
    setInitialData({});
    setView('form');
  };

  const OptionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-3 p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors w-full"
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold mb-6 text-center">Add New Expense</h2>

          {view === 'options' && (
            <>
              {error && (
                  <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-4">
                      <p>{error}</p>
                  </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="file" accept="image/*,application/pdf" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                
                <OptionButton icon={<CameraIcon className="w-10 h-10" />} label="Use Camera" onClick={() => cameraInputRef.current?.click()} />
                <OptionButton icon={<GalleryIcon className="w-10 h-10" />} label="Images / PDF" onClick={() => fileInputRef.current?.click()} />
                <OptionButton icon={<ManualIcon className="w-10 h-10" />} label="Manual Entry" onClick={handleManualEntry} />
              </div>
            </>
          )}

          {view === 'pdfProcessing' && (
             <div className="text-center p-8 space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-lg font-semibold">Processing PDF...</p>
                <p className="text-gray-400">{pdfProcessingStatus}</p>
             </div>
          )}

          {view === 'form' && (
            <div>
              {isLoading && (
                <div className="text-center p-8 space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-lg font-semibold">AI is analyzing your receipt...</p>
                  <p className="text-gray-400">This might take a moment.</p>
                </div>
              )}
              {error && !isLoading && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-4">
                  <p className="font-bold">Analysis Failed</p>
                  <p>{error}</p>
                </div>
              )}
               <ExpenseForm 
                  onSubmit={onAddExpense} 
                  initialData={initialData} 
                  isLoading={isLoading} 
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
