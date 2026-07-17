import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle
} from "lucide-react";
import API from "../api/api";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [renameMode, setRenameMode] = useState(false);
  const [newName, setNewName] = useState("");

  const [currentFile, setCurrentFile] = useState(null); // 🔥 penting buat duplicate per file

  // DROPZONE (MULTI + FOLDER)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setSuccess("");
    },
  });

  // 🔥 SINGLE UPLOAD WITH MODE
  const uploadSingle = async (file, mode = "ask") => {
    const formData = new FormData();
    formData.append("file", file);

    let url = `/upload?mode=${mode}`;

    if (mode === "rename" && newName) {
      url += `&new_name=${encodeURIComponent(newName)}`;
    }

    const res = await API.post(url, formData);
    return res.data;
  };

  // 🔥 MAIN UPLOAD LOOP
  const handleUpload = async () => {
    if (!files.length) return;

    setLoading(true);

    try {
      for (const file of files) {
        const res = await uploadSingle(file);

        // DUPLICATE DETECTED
        if (res.status === "duplicate") {
          setCurrentFile(file);
          setShowModal(true);
          setLoading(false);
          return; // 🔥 STOP LOOP dulu
        }
      }

      setSuccess(`${files.length} files uploaded successfully`);
      setFiles([]);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setLoading(false);
  };

  // 🔥 HANDLE AFTER USER CHOOSE ACTION
  const handleDuplicateAction = async (mode) => {
    try {
      setLoading(true);

      await uploadSingle(currentFile, mode);

      // lanjut upload sisa file
      const remaining = files.filter(f => f !== currentFile);

      for (const file of remaining) {
        await uploadSingle(file);
      }

      setSuccess("Upload completed");
      setFiles([]);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setShowModal(false);
    setRenameMode(false);
    setNewName("");
    setCurrentFile(null);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* HEADER */}
      <h1 className="text-3xl font-semibold text-ink-900 mb-2">
        Upload Documents
      </h1>
      <p className="text-ink-500 mb-8">
        Upload single file or entire folder
      </p>

      {/* DROP AREA */}
      <div
        {...getRootProps()}
        className={`glass-soft border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition
        ${isDragActive ? "border-accent-500 bg-accent-50/60" : "border-ink-200"}
        hover:border-accent-500`}
      >
        <input {...getInputProps()} webkitdirectory="true" directory="" />

        <UploadCloud className="mx-auto mb-4 text-ink-400" size={40} />

        <p className="text-ink-700 font-medium">
          Drag & drop files or folder
        </p>
        <p className="text-ink-500 text-sm">
          or click to browse
        </p>
      </div>

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="mt-6 glass-soft rounded-xl p-4 space-y-3 max-h-[200px] overflow-y-auto">
          {files.map((file, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="text-ink-900" />
                <div>
                  <p className="text-sm font-medium text-ink-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-ink-500 font-mono">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setFiles(files.filter((_, index) => index !== i))
                }
              >
                <X className="text-ink-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="mt-6 flex items-center gap-3 bg-green-950/30 border border-green-800/40 text-green-300 p-4 rounded-xl">
          <CheckCircle />
          <div>
            <p className="font-medium">Upload successful</p>
            <p className="text-sm text-green-300/70">{success}</p>
          </div>
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        disabled={!files.length || loading}
        className={`mt-6 w-full py-3 rounded-full text-paper-200 font-medium transition
        ${
          loading
            ? "bg-accent-500/40"
            : "bg-accent-500 hover:bg-accent-600 active:scale-[0.98]"
        }`}
      >
        {loading ? "Uploading..." : `Upload ${files.length || ""} File(s)`}
      </button>

      {/* DUPLICATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-[360px] shadow-xl">

            <h2 className="text-lg font-semibold mb-2 text-ink-900">
              File already exists
            </h2>

            <p className="text-sm text-ink-500 mb-4">
              Choose action for "{currentFile?.name}"
            </p>

            {renameMode && (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="new_name.pdf"
                className="w-full mb-4 p-2 bg-white/5 border border-ink-200 rounded-lg text-ink-900 placeholder-ink-400"
              />
            )}

            <div className="flex flex-col gap-3">

              <button
                onClick={() => handleDuplicateAction("replace")}
                className="bg-red-500 text-white py-2 rounded-full hover:opacity-90 active:scale-[0.98] transition"
              >
                Replace
              </button>

              {!renameMode ? (
                <button
                  onClick={() => setRenameMode(true)}
                  className="bg-accent-500 text-paper-200 py-2 rounded-full hover:bg-accent-600 active:scale-[0.98] transition"
                >
                  Rename
                </button>
              ) : (
                <button
                  onClick={() => handleDuplicateAction("rename")}
                  className="bg-accent-600 text-paper-200 py-2 rounded-full hover:opacity-90 active:scale-[0.98] transition"
                >
                  Confirm Rename
                </button>
              )}

              <button
                onClick={() => {
                  setShowModal(false);
                  setRenameMode(false);
                  setNewName("");
                  setCurrentFile(null);
                }}
                className="border border-ink-200 py-2 rounded-full hover:bg-white/5 active:scale-[0.98] transition"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}