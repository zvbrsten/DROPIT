import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Change this to your deployed backend if needed
const BACKEND = process.env.REACT_APP_BACKEND_URL || "https://dropit-backend-three.vercel.app";

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DownloadForm() {
  const [code, setCode] = useState("");
  const [files, setFiles] = useState([]);
  const [filesCount, setFilesCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setError("");
    setFiles([]);
    setProgress(0);

    try {
      const res = await axios.get(`${BACKEND}/api/file/${encodeURIComponent(code)}`, {
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (total) {
            const percent = Math.floor((loaded * 100) / total);
            setProgress(percent);
          }
        },
      });

      setFiles(res.data.files || []);
      setFilesCount(res.data.filesCount || (res.data.files || []).length);
      setTotalSize(res.data.totalSize || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred while fetching files";
      setError(errorMessage);
      console.error("Download error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (file) => {
    try {
      // Try to fetch the file (browser will enforce CORS for presigned S3 URLs)
      const response = await fetch(file.downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('xml')) {
        const text = await response.text();
        if (text.includes('<Error>')) {
          throw new Error('Download link has expired. Please fetch files again.');
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert(`Failed to download ${file.filename}: ${err.message}`);
    }
  };

  const downloadAllFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await downloadFile(file);
      if (i < files.length - 1) await new Promise(resolve => setTimeout(resolve, 700));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#001e3c] to-[#06202a] p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">✨ DropIt — Retrieve Files</h1>
            <p className="text-sm text-slate-300/80 mt-1">Enter a download code to fetch files. Links are short-lived.</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-white/6 px-3 py-1 rounded-full border border-white/8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 3v4M8 3v4" />
              </svg>
              <span className="text-xs text-white/90">Secure</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleDownload} className="space-y-4">
          <div className="relative">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="text"
              placeholder="Enter download code"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 placeholder:text-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
            <div className="absolute right-3 top-3 text-slate-300 text-xs">Code</div>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className={`w-full inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 font-semibold shadow-md transition ${isLoading ? 'bg-slate-600 cursor-wait' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-[1.01]'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v12" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7l4-4 4 4" />
              </svg>
            )}

            <span className="text-white">{isLoading ? 'Fetching Files...' : 'Get Files'}</span>
          </motion.button>
        </form>

        {isLoading && progress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-white/6 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-2 bg-gradient-to-r from-green-400 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.6 }}
              />
            </div>
            <p className="text-xs text-slate-300 text-right mt-1">{progress}%</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-100">
            <strong>Error:</strong> {error}
            {error.toLowerCase().includes('expired') && (
              <div className="mt-2 text-sm text-red-200 italic">The download links may have expired. Try fetching the files again.</div>
            )}
          </div>
        )}

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-gradient-to-b from-white/3 to-white/2 border border-white/6 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Found {filesCount} File{filesCount !== 1 ? 's' : ''}</h2>
                <p className="text-sm text-slate-300 mt-1">Total Size: {formatFileSize(totalSize)}</p>
              </div>

              <div className="flex gap-3">
                {files.length > 1 && (
                  <button onClick={downloadAllFiles} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Download All</button>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/3 rounded-lg border border-white/6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-white/6 flex items-center justify-center text-white/90 font-semibold">{(file.filename || 'F').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="text-sm font-semibold text-white">{file.filename}</div>
                      <div className="text-xs text-slate-300">{formatFileSize(file.fileSize)} • {file.mimeType}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => downloadFile(file)} className="px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-sm">Download</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-white/4 border border-white/6 text-xs text-slate-300">
              <strong>Note:</strong> Download links are generated fresh each time you fetch files. If a download fails due to expiration, re-fetch to get fresh signed URLs.
            </div>
          </motion.div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">Made with ❤️ — DropIt</div>
      </div>
    </div>
  );
}
