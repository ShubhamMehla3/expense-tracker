
import * as pdfjsLib from 'pdfjs-dist';

interface PageImage {
    base64: string;
    previewUrl: string;
    mimeType: 'image/jpeg';
}

/**
 * Converts each page of a PDF file into a JPEG image.
 * @param file The PDF file to process.
 * @param onProgress Callback to report progress (e.g., "Processing page 1 of 5").
 * @returns A promise that resolves to an array of PageImage objects.
 */
export const pdfToImagePreviews = async (file: File, onProgress: (status: string) => void): Promise<PageImage[]> => {
    const images: PageImage[] = [];
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read PDF file."));
            }

            try {
                onProgress("Parsing PDF...");
                const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                const numPages = pdf.numPages;
                
                for (let i = 1; i <= numPages; i++) {
                    onProgress(`Processing page ${i} of ${numPages}...`);
                    const page = await pdf.getPage(i);
                    // FIX: Lower scale to 1.5 to improve stability and reduce memory usage.
                    const viewport = page.getViewport({ scale: 1.5 });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) {
                        throw new Error("Could not get canvas context.");
                    }
                    
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport: viewport }).promise;

                    const previewUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
                    const base64 = previewUrl.split(',')[1];
                    
                    images.push({
                        base64,
                        previewUrl,
                        mimeType: 'image/jpeg',
                    });
                }
                resolve(images);
            } catch (error) {
                console.error("Error processing PDF:", error);
                // Pass the original error for better debugging.
                reject(error);
            }
        };

        fileReader.onerror = (error) => reject(error);
        fileReader.readAsArrayBuffer(file);
    });
};
