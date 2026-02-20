import React, { useState } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';

const PaperUploadPage = () => {
    const [papers, setPapers] = useState([
        { id: '1', title: 'Mid-Term 2025 Physics', subject: 'Physics', class: '12-A', date: '2025-02-10' },
    ]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = (e) => {
        e.preventDefault();
        setUploading(true);
        // Fake progress
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setUploading(false);
                setProgress(0);
                // Add fake file
                setPapers([...papers, {
                    id: Date.now().toString(),
                    title: 'New Exam Paper',
                    subject: 'Physics',
                    class: '11-B',
                    date: new Date().toISOString().split('T')[0]
                }]);
            }
        }, 300);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Exam Papers Repository</h1>

            {/* Upload Area */}
            <div className="rounded-xl bg-white p-8 shadow-sm border border-dashed border-gray-300 transition-colors hover:border-blue-400">
                <form onSubmit={handleUpload} className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="rounded-full bg-blue-50 p-4 text-blue-500">
                        <Upload size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Upload Examination Paper</h3>
                        <p className="text-sm text-gray-500">PDF files only, max 10MB</p>
                    </div>

                    <div className="grid w-full max-w-lg grid-cols-2 gap-4 text-left">
                        <div className="col-span-2">
                            <input type="text" placeholder="Paper Title (e.g. Final Exam 2024)" className="w-full rounded-md border border-gray-300 p-2 text-sm" required />
                        </div>
                        <select className="rounded-md border border-gray-300 p-2 text-sm bg-white">
                            <option>Physics 11</option>
                            <option>Physics 12</option>
                            <option>Mechanics 101</option>
                        </select>
                        <select className="rounded-md border border-gray-300 p-2 text-sm bg-white">
                            <option>Class 11-A</option>
                            <option>Class 12-B</option>
                        </select>
                        <div className="col-span-2">
                            <input type="file" accept=".pdf" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
                        </div>
                    </div>

                    {uploading && (
                        <div className="w-full max-w-lg">
                            <div className="h-2 w-full rounded-full bg-gray-200">
                                <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="mt-2 text-xs text-blue-600">Uploading... {progress}%</p>
                        </div>
                    )}

                    {!uploading && (
                        <button type="submit" className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
                            Start Upload
                        </button>
                    )}
                </form>
            </div>

            {/* List */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h3 className="font-semibold text-gray-800">Recent Uploads</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {papers.map((paper) => (
                            <tr key={paper.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <FileText className="mr-3 text-red-500" size={20} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{paper.title}</p>
                                            <p className="text-xs text-gray-500">{paper.subject} • {paper.class}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{paper.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="flex items-center text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition">
                                        <Download size={16} className="mr-1" /> Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaperUploadPage;
