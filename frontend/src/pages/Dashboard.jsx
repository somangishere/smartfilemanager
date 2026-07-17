import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  FileText,
  TrendingUp,
  Search,
  Upload,
  Folder,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/documents").then((res) => setDocs(res.data));
  }, []);

  const recentDocs = docs.slice(0, 3);

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink-900">Dashboard</h1>
      <p className="text-ink-500 mt-1">
        Your AI-powered document workspace
      </p>

      <div className="grid grid-cols-3 gap-6 mt-8">

        <div className="glass-soft p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-3 rounded-xl">
              <FileText className="text-ink-900" size={20} />
            </div>
            <p className="text-ink-500 font-medium">Total Documents</p>
          </div>
          <h2 className="text-3xl font-bold mt-4 font-sans">{docs.length}</h2>
        </div>

        <div className="glass-soft p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-3 rounded-xl">
              <TrendingUp className="text-ink-900" size={20} />
            </div>
            <p className="text-ink-500 font-medium">Added This Week</p>
          </div>
          <h2 className="text-3xl font-bold mt-4 font-sans">{docs.length}</h2>
        </div>

        <div className="glass-soft p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-accent-50 p-3 rounded-xl">
              <Search className="text-accent-600" size={20} />
            </div>
            <p className="text-ink-500 font-medium">Semantic Search</p>
          </div>

          <button
            onClick={() => navigate("/search")}
            className="mt-4 px-4 py-2 bg-accent-500 text-paper-200 rounded-full hover:bg-accent-600 active:scale-[0.98] transition"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">

        <div
          onClick={() => navigate("/upload")}
          className="glass-soft p-6 rounded-2xl flex justify-between cursor-pointer hover:bg-white/10 transition"
        >
          <div className="flex items-center gap-4">
            <Upload className="text-ink-900" />
            <div>
              <p className="font-semibold text-ink-900">Upload Document</p>
              <p className="text-sm text-ink-500">
                Add a PDF to your workspace
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/documents")}
          className="glass-soft p-6 rounded-2xl flex justify-between cursor-pointer hover:bg-white/10 transition"
        >
          <div className="flex items-center gap-4">
            <Folder className="text-ink-900" />
            <div>
              <p className="font-semibold text-ink-900">Browse Documents</p>
              <p className="text-sm text-ink-500">
                View all uploaded PDFs
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <h2 className="font-semibold text-ink-900">Recent Documents</h2>
        <button onClick={() => navigate("/documents")} className="text-sm text-ink-500 hover:text-ink-900 transition">
          View all →
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {recentDocs.map((doc) => (
          <div key={doc.id} className="glass-soft p-4 rounded-xl flex justify-between">
            <span className="text-ink-900">{doc.file_name}</span>
          </div>
        ))}
      </div>
    </>
  );
}