'use client';

import { useState, useRef } from 'react';
import { X } from 'lucide-react'; 
import { uploadStoryAction } from './actions'; // Make sure this path points to your new file

export default function AdminStoryUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null); 
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setStatusMessage('Passing file securely to server...');

    // Basic URL validation
    if (linkUrl.trim() !== '') {
      try {
        new URL(linkUrl.trim());
      } catch (err) {
        setStatusMessage('Error: Invalid shoppable link format.');
        setIsUploading(false);
        return;
      }
    }

    try {
      // Package the data for the Server Action
      const formData = new FormData();
      formData.append('file', file);
      formData.append('linkUrl', linkUrl);

      setStatusMessage('Uploading and saving to database...');

      // Execute the Server Action
      const result = await uploadStoryAction(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      setStatusMessage('Story published successfully!');
      setFile(null);
      setLinkUrl('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => setStatusMessage(''), 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setStatusMessage(`Error: ${error.message || 'Something went wrong'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Upload New Story</h2>
      
      <form onSubmit={handleUpload} className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-xs font-black tracking-wider uppercase text-gray-800 mb-2">
            Media (Image or Video)
          </label>
          
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept="image/*,video/mp4,video/quicktime"
              onChange={handleFileChange}
              ref={fileInputRef} 
              className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:uppercase file:tracking-wide file:bg-black file:text-white hover:file:bg-gray-800 transition-colors cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-2"
              required
            />
            
            {file && (
              <button
                type="button"
                onClick={handleClearFile}
                className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all border border-gray-200 hover:border-red-200 flex items-center justify-center shadow-sm flex-shrink-0"
                title="Remove selected file"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black tracking-wider uppercase text-gray-800 mb-2">
            Shoppable Link (Optional)
          </label>
          <input 
            type="url" 
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4C29A] transition-all bg-white"
          />
        </div>

        <button 
          type="submit" 
          disabled={!file || isUploading}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex justify-center items-center mt-2"
        >
          {isUploading ? 'Publishing...' : 'Publish Story'}
        </button>

        {statusMessage && (
          <p className={`text-sm mt-3 font-bold text-center ${statusMessage.includes('Error') ? 'text-red-500' : 'text-[#D4C29A]'}`}>
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}