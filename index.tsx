
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker before rendering the app.
// This is required for the library to process PDFs in a separate thread.
// FIX: Explicitly set the worker URL to a specific version to match the import map
// and prevent version mismatch errors between the library and the worker.
const pdfjsWorkerUrl = 'https://esm.sh/pdfjs-dist@4.6.4/build/pdf.worker.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
