import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import {
  HardDrive,
  FolderPlus,
  Upload,
  LogOut,
  Search,
  Clock,
  Star,
  Trash2,
  MoreVertical,
  ChevronRight,
  Home,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  File,
  RefreshCw,
  Share2,
  Edit3,
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Grid,
  List,
  ChevronDown,
  Shield,
  Menu,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getFileIcon = (mimeType, isFolder) => {
  if (isFolder) return { icon: FolderPlus, color: "#f59e0b", bg: "#fef3c7" };
  if (!mimeType) return { icon: File, color: "#6b7280", bg: "#f3f4f6" };
  if (mimeType.startsWith("image/"))
    return { icon: FileImage, color: "#3b82f6", bg: "#eff6ff" };
  if (mimeType.startsWith("video/"))
    return { icon: FileVideo, color: "#8b5cf6", bg: "#f5f3ff" };
  if (mimeType.startsWith("audio/"))
    return { icon: FileAudio, color: "#ec4899", bg: "#fdf2f8" };
  if (mimeType.includes("pdf"))
    return { icon: FileText, color: "#ef4444", bg: "#fef2f2" };
  if (mimeType.includes("zip") || mimeType.includes("rar"))
    return { icon: FileArchive, color: "#f97316", bg: "#fff7ed" };
  if (mimeType.includes("text") || mimeType.includes("doc"))
    return { icon: FileText, color: "#10b981", bg: "#f0fdf4" };
  return { icon: File, color: "#6b7280", bg: "#f3f4f6" };
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white min-w-[240px] animate-slide-up
        ${t.type === "success" ? "bg-emerald-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`}
      >
        {t.type === "success" ? (
          <CheckCircle size={16} />
        ) : t.type === "error" ? (
          <AlertTriangle size={16} />
        ) : (
          <Loader2 size={16} className="animate-spin" />
        )}
        <span className="flex-1 truncate">{t.message}</span>
        <button
          onClick={() => removeToast(t.id)}
          className="opacity-70 hover:opacity-100 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

// ─── Rename Modal ─────────────────────────────────────────────────────────────
const RenameModal = ({ item, onConfirm, onClose }) => {
  const [name, setName] = useState(item?.name || "");
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Edit3 size={18} className="text-blue-600" /> Rename
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Enter a new name for "{item?.name}"
        </p>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm(name);
            if (e.key === "Escape") onClose();
          }}
          className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none text-sm font-medium mb-4"
          placeholder="Enter name..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(name)}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
};

//---Upload Modal------------------------------------------------------------
const UploadModal = ({
  onClose,
  onUpload,
  isUploading,
  uploadProgress,
  currentFolderName,
}) => {
  const [isDraggingInModal, setIsDraggingInModal] = useState(false);
  const modalFileRef = useRef(null);

  const handleModalDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingInModal(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    onUpload(file);
    onClose();
  };

  const handleModalFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onUpload(file);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Upload size={18} className="text-blue-600" /> Upload File
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              To:{" "}
              <span className="font-semibold text-gray-600">
                {currentFolderName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drop Zone — SIRF drag & drop, koi click nahi */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingInModal(true);
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            setIsDraggingInModal(false);
          }}
          onDrop={handleModalDrop}
          onClick={() => !isDraggingInModal && modalFileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl py-8 px-4 flex flex-col items-center gap-3 transition-all duration-200 mb-4 select-none cursor-pointer
    ${
      isDraggingInModal
        ? "border-blue-400 bg-blue-50 scale-[1.02]"
        : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"
    }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all pointer-events-none
            ${isDraggingInModal ? "bg-blue-100" : "bg-white border border-gray-100"}`}
          >
            <Upload
              size={26}
              className={isDraggingInModal ? "text-blue-500" : "text-gray-300"}
            />
          </div>

          <input
            type="file"
            ref={modalFileRef}
            onChange={handleModalFileSelect}
            className="hidden"
          />

          <div className="text-center pointer-events-none">
            <p
              className={`font-bold text-sm ${isDraggingInModal ? "text-blue-600" : "text-gray-500"}`}
            >
              {isDraggingInModal ? "🎯 Chhod do!" : "File yahan drag karo"}
            </p>

            <p className="text-xs text-gray-300 mt-1">
              {isDraggingInModal
                ? "Release to upload"
                : "Desktop se file uthao aur yahan drop karo"}
            </p>
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
            ya
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Browse Button — SIRF is se file manager khulega */}
        <button
          onClick={() => modalFileRef.current?.click()}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          <Upload size={16} /> Computer se Select Karo
        </button>

        {/* Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-blue-600 mb-1.5">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Share Modal ──────────────────────────────────────────────────────────────
const ShareModal = ({ item, onClose, addToast }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/files/share", {
        file_id: item.id,
        email: email.trim(),
        permission,
      });
      setShareLink(res.data.link || "");
      addToast("Shared successfully!", "success");
      setEmail("");
    } catch {
      addToast("Share failed. Check email.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 truncate pr-2">
            <Share2 size={18} className="text-blue-600 shrink-0" />
            <span className="truncate">Share "{item?.name}"</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address..."
            className="flex-1 px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none text-sm"
          />
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 outline-none bg-white"
          >
            <option value="view">Viewer</option>
            <option value="edit">Editor</option>
          </select>
        </div>
        <button
          onClick={handleShare}
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-sm shadow-lg shadow-blue-200 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Share2 size={16} />
          )}{" "}
          Send Invite
        </button>
        {shareLink && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Share Link
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareLink}
                className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none min-w-0"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  addToast("Link copied!", "success");
                }}
                className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Preview Modal ────────────────────────────────────────────────────────────
const PreviewModal = ({ item, onClose }) => {
  const isImage = item.mime_type?.startsWith("image/");
  const isVideo = item.mime_type?.startsWith("video/");
  const isAudio = item.mime_type?.startsWith("audio/");
  const isPdf = item.mime_type?.includes("pdf");

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: getFileIcon(item.mime_type, false).bg }}
            >
              {React.createElement(getFileIcon(item.mime_type, false).icon, {
                size: 16,
                style: { color: getFileIcon(item.mime_type, false).color },
              })}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-400">
                {formatBytes(item.size_bytes)} · {formatDate(item.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <a
              href={item.file_url}
              download={item.name}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Upload size={12} className="rotate-180" />
              <span className="hidden sm:block">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-50 p-4">
          {isImage && (
            <img
              src={item.file_url}
              alt={item.name}
              className="max-w-full max-h-[65vh] object-contain rounded-lg shadow"
            />
          )}
          {isVideo && (
            <video
              controls
              className="max-w-full max-h-[65vh] rounded-lg w-full"
            >
              <source src={item.file_url} type={item.mime_type} />
            </video>
          )}
          {isAudio && (
            <div className="w-full max-w-md py-8 px-4">
              <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileAudio size={40} className="text-pink-500" />
              </div>
              <p className="text-center font-bold text-gray-700 mb-4 truncate">
                {item.name}
              </p>
              <audio controls className="w-full">
                <source src={item.file_url} type={item.mime_type} />
              </audio>
            </div>
          )}
          {isPdf && (
            <iframe
              src={item.file_url}
              className="w-full h-[65vh] rounded-lg"
              title={item.name}
            />
          )}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="py-16 flex flex-col items-center gap-4 px-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: getFileIcon(item.mime_type, false).bg }}
              >
                {React.createElement(getFileIcon(item.mime_type, false).icon, {
                  size: 40,
                  style: { color: getFileIcon(item.mime_type, false).color },
                })}
              </div>
              <p className="font-bold text-gray-500">Preview not available</p>
              <a
                href={item.file_url}
                download={item.name}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VersionModal = ({ item, onClose, addToast }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await api.get(`/files/versions/${item.id}`);
        setVersions(res.data.versions || []);
        setFileName(res.data.fileName || item.name);
      } catch {
        addToast("Failed to load versions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [item.id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-black text-gray-800">
              Version History
            </h3>
            <p className="text-xs text-gray-400 truncate max-w-[250px]">
              {fileName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Versions List */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 font-bold">No versions found</p>
              <p className="text-xs text-gray-300 mt-1">
                Upload the same file again to create versions
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {versions.map((v, index) => (
                <div
                  key={v.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition ${v.isCurrent ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                >
                  {/* Version Badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0
                    ${v.isCurrent ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
                  >
                    v{v.version_number}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-800">
                        Version {v.version_number}
                      </p>
                      {v.isCurrent && (
                        <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatBytes(v.size_bytes)} · {formatDate(v.created_at)}
                    </p>
                  </div>

                  {/* Download */}
                  {v.file_url && (
                    <a
                      href={v.file_url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition shrink-0"
                      title="Download this version"
                    >
                      <Upload size={14} className="rotate-180" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Same naam ki file dobara upload karne par naya version banega
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
const DropdownMenu = ({
  item,
  isTrash,
  onRename,
  onDelete,
  onShare,
  onRestore,
  onToggleStar,
  onVersionHistory,
  close,
}) => (
  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-2xl py-1.5 z-50 text-sm">
    {isTrash ? (
      <>
        <button
          onClick={() => {
            onRestore(item.id);
            close();
          }}
          className="w-full px-4 py-2.5 text-left font-semibold flex items-center gap-2.5 hover:bg-gray-50 text-emerald-600"
        >
          <RotateCcw size={14} /> Restore
        </button>
        <button
          onClick={() => {
            onDelete(item.id, true);
            close();
          }}
          className="w-full px-4 py-2.5 text-left font-semibold flex items-center gap-2.5 hover:bg-red-50 text-red-500"
        >
          <Trash2 size={14} /> Delete Forever
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => {
            onToggleStar(item);
            close();
          }}
          className="w-full px-4 py-2.5 text-left font-semibold flex items-center gap-2.5 hover:bg-gray-50 text-gray-700"
        >
          <Star
            size={14}
            className={
              item.is_starred
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400"
            }
          />
          {item.is_starred ? "Unstar" : "Add to Starred"}
        </button>
        {!item.is_folder && (
          <button
            onClick={() => {
              onShare(item);
              close();
            }}
            className="w-full px-4 py-2.5 text-left font-semibold flex items-center gap-2.5 hover:bg-gray-50 text-gray-700"
          >
            <Share2 size={14} /> Share
          </button>
        )}
        <button
          onClick={() => {
            onRename(item);
            close();
          }}
          className="w-full px-4 py-2.5 text-left font-semibold flex items-center gap-2.5 hover:bg-gray-50 text-blue-600"
        >
          <Edit3 size={14} /> Rename
        </button>
        <hr className="my-1 border-gray-50" />
        <button
          onClick={() => {
            onVersionHistory(item);
            close();
          }}
          className="w-full px-4 py-2.5 text-left font-semibold flex items-center gap-2.5 hover:bg-gray-50 text-purple-600"
        >
          <RefreshCw size={14} /> Version History
        </button>
        <button
          onClick={() => {
            onDelete(item.id, false);
            close();
          }}
          className="w-full px-4 py-2.5 text-left font-semibold flex items-center gap-2.5 hover:bg-red-50 text-red-500"
        >
          <Trash2 size={14} /> Move to Trash
        </button>
      </>
    )}
  </div>
);

// ─── File Card ────────────────────────────────────────────────────────────────
const FileCard = ({
  item,
  viewMode,
  onFolderOpen,
  onRename,
  onDelete,
  onShare,
  onRestore,
  onToggleStar,
  onPreview,
  onVersionHistory,
  isTrash,
  onDragStart,
  onDragEnd,
  onDragOverFolder,
  onDropOnFolder,
  draggedItemId,
  dragOverFolderId,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { icon: Icon, color, bg } = getFileIcon(item.mime_type, item.is_folder);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (viewMode === "list") {
    return (
      <div
        className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all"
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart(item);
        }}
        onDragEnd={() => onDragEnd()}
        onDragOver={(e) => {
          if (item.is_folder) {
            e.preventDefault();
            e.stopPropagation();
            onDragOverFolder(item.id);
          }
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          onDragOverFolder(null);
        }}
        onDrop={(e) => {
          if (item.is_folder) {
            e.preventDefault();
            e.stopPropagation();
            onDropOnFolder(item.id);
          }
        }}
        style={{
          opacity: draggedItemId === item.id ? 0.4 : 1,
          outline:
            dragOverFolderId === item.id && item.is_folder
              ? "2px solid #3b82f6"
              : "none",
          outlineOffset: "2px",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: bg }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            if (item.is_folder) onFolderOpen(item.id, item.name);
            else onPreview(item);
          }}
        >
          <p className="font-semibold text-sm text-gray-800 truncate">
            {item.name}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {item.is_folder ? "Folder" : item.mime_type}
          </p>
        </div>
        <div className="w-20 text-right hidden sm:block shrink-0">
          <p className="text-xs text-gray-500 font-medium">
            {item.is_folder ? "--" : formatBytes(item.size_bytes)}
          </p>
        </div>
        <div className="w-24 text-right hidden md:block shrink-0">
          <p className="text-xs text-gray-500 font-medium">
            {formatDate(item.created_at)}
          </p>
        </div>
        {/* Always visible three dots - no hover required */}
        <div className="w-8 relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <DropdownMenu
              item={item}
              isTrash={isTrash}
              onRename={onRename}
              onDelete={onDelete}
              onShare={onShare}
              onRestore={onRestore}
              onToggleStar={onToggleStar}
              onVersionHistory={onVersionHistory}
              close={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-gray-200 transition-all duration-200 relative"
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(item);
      }}
      onDragEnd={() => onDragEnd()}
      // Agar yeh item folder hai toh drop bhi accept kare
      onDragOver={(e) => {
        if (item.is_folder) {
          e.preventDefault();
          e.stopPropagation();
          onDragOverFolder(item.id);
        }
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        onDragOverFolder(null);
      }}
      onDrop={(e) => {
        if (item.is_folder) {
          e.preventDefault();
          e.stopPropagation();
          onDropOnFolder(item.id);
        }
      }}
      style={{
        opacity: draggedItemId === item.id ? 0.4 : 1,
        outline: dragOverFolderId === item.id ? "2px solid #3b82f6" : "none",
        outlineOffset: "2px",
      }}
    >
      <div
        className="h-[110px] sm:h-[120px] flex items-center justify-center cursor-pointer rounded-t-2xl overflow-hidden relative"
        style={{ background: bg }}
        onClick={() => {
          if (item.is_folder) onFolderOpen(item.id, item.name);
          else onPreview(item);
        }}
      >
        {item.mime_type?.startsWith("image/") && item.file_url ? (
          <img
            src={item.file_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon size={40} style={{ color }} />
        )}

        {/* ⭐ Star Badge */}
        {item.is_starred && (
          <Star
            size={16}
            className="absolute top-2 left-2 fill-white text-white drop-shadow-lg"
          />
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-800 truncate leading-tight">
          {item.name}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {item.is_folder ? "Folder" : formatBytes(item.size_bytes)}
        </p>
      </div>
      {/* Always visible three dots - no hover required for mobile */}
      <div className="absolute top-2 right-2" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-gray-500 hover:text-gray-800 transition border border-gray-100"
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <DropdownMenu
            item={item}
            isTrash={isTrash}
            onRename={onRename}
            onDelete={onDelete}
            onShare={onShare}
            onRestore={onRestore}
            onToggleStar={onToggleStar}
            onVersionHistory={onVersionHistory}
            close={() => setMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [hasMore, setHasMore] = useState(true);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const LIMIT = 20;
  const [isMoving, setIsMoving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [versionItem, setVersionItem] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [filterType, setFilterType] = useState("all");
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    used_space_bytes: 0,
    used_space_mb: "0 MB",
  });
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [navigationStack, setNavigationStack] = useState([
    { id: null, name: "My Files" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameItem, setRenameItem] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toasts, setToasts] = useState([]);
  const profileRef = useRef(null);
  const contentRef = useRef(null);
  const pageRef = useRef(1);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = useCallback(
    async (reset = true) => {
      try {
        if (reset) setLoading(true);
        else setIsFetchingMore(true);

        // Page ko ref se lo, state se nahi
        const currentOffset = reset ? 0 : pageRef.current * LIMIT;

        const [filesRes, statsRes] = await Promise.all([
          api.get(`/files/my-files?limit=${LIMIT}&offset=${currentOffset}`),
          api.get("/files/storage-stats"),
        ]);

        const newFiles = filesRes.data.files || [];
        const more = filesRes.data.hasMore || false;

        setAllFiles((prev) => {
          const combined = reset ? newFiles : [...prev, ...newFiles];
          // Duplicates hatao
          const unique = combined.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id),
          );
          return unique;
        });

        setHasMore(more);
        setStats(statsRes.data);
        if (!reset) {
          pageRef.current += 1;
        } else {
          pageRef.current = 1;
        }
      } catch (err) {
        if (err.code !== "ERR_NETWORK")
          addToast("Failed to load files", "error");
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }

      if (activeTab === "shared") {
        const sharedRes = await api.get("/files/shared-with-me");
        const statsRes = await api.get("/files/storage-stats");
        setSharedFiles(sharedRes.data.sharedFiles || []);
        setStats(await api.get("/files/storage-stats").then((r) => r.data));
        setStats(statsRes.data);
        setLoading(false); // 👈 finally se pehle manually set karo
        setIsFetchingMore(false);
        return;
      }
      const currentOffset = reset ? 0 : pageRef.current * LIMIT;
    },
    [currentFolderId, activeTab, sortBy, filterType],
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        hasMore &&
        !isFetchingMore &&
        !loading
      ) {
        fetchData(false);
      }
    };
    const el = contentRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, isFetchingMore, loading, fetchData]);

  // Tab/folder change hone par reset karo
  useEffect(() => {
    pageRef.current = 1;
    setAllFiles([]);
    setHasMore(true);
    fetchData(true);
  }, [currentFolderId, activeTab, sortBy, filterType]);

  // fetchData ke baad allFiles change hone par filter karo
  useEffect(() => {
    let filtered = [];
    if (activeTab === "starred") {
      filtered = allFiles.filter((f) => f.is_starred && !f.is_deleted);
    } else if (activeTab === "trash") {
      filtered = allFiles.filter((f) => f.is_deleted);
    } else if (activeTab === "recent") {
      filtered = allFiles
        .filter((f) => !f.is_deleted && !f.is_folder)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
    } else {
      if (currentFolderId === null) {
        filtered = allFiles.filter(
          (item) =>
            !item.is_deleted &&
            (item.parent_id === null ||
              item.parent_id === undefined ||
              item.parent_id === ""),
        );
      } else {
        filtered = allFiles.filter(
          (item) => !item.is_deleted && item.parent_id === currentFolderId,
        );
      }
    }

    if (filterType !== "all") {
      if (filterType === "folder")
        filtered = filtered.filter((f) => f.is_folder);
      else if (filterType === "image")
        filtered = filtered.filter((f) => f.mime_type?.startsWith("image/"));
      else if (filterType === "pdf")
        filtered = filtered.filter((f) => f.mime_type?.includes("pdf"));
      else if (filterType === "video")
        filtered = filtered.filter((f) => f.mime_type?.startsWith("video/"));
    }

    filtered.sort((a, b) => {
      if (a.is_folder && !b.is_folder) return -1;
      if (!a.is_folder && b.is_folder) return 1;
      return 0;
    });

    if (sortBy === "name")
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "size")
      filtered.sort((a, b) => (b.size_bytes || 0) - (a.size_bytes || 0));
    else
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFiles(filtered);
  }, [allFiles, activeTab, currentFolderId, filterType, sortBy]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(
          `/files/search?query=${encodeURIComponent(searchQuery)}`,
        );
        setSearchResults(res.data.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFolderOpen = (id, name) => {
    setActiveTab("all");
    setCurrentFolderId(id);
    setNavigationStack((prev) => [...prev, { id, name }]);
    setSidebarOpen(false);
  };

  const handleBreadcrumb = (index) => {
    const stack = navigationStack.slice(0, index + 1);
    setNavigationStack(stack);
    setCurrentFolderId(stack[index].id);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post("/files/folder", {
        name: newFolderName,
        parent_id: currentFolderId,
      });
      setNewFolderName("");
      setShowFolderModal(false);
      fetchData();
      addToast("Folder created!", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to create folder", "error");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("parent_id", currentFolderId || "");
    formData.append("file", file);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) =>
          setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
      fetchData();
      addToast(`"${file.name}" uploaded!`, "success");
    } catch {
      addToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadFile = async (file) => {
    const formData = new FormData();
    formData.append("parent_id", currentFolderId || "");
    formData.append("file", file);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) =>
          setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
      fetchData();
      addToast(`"${file.name}" uploaded!`, "success");
    } catch {
      addToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRenameConfirm = async (newName) => {
    if (!newName.trim() || newName === renameItem.name) {
      setRenameItem(null);
      return;
    }
    try {
      await api.put(`/files/rename/${renameItem.id}`, { newName });
      fetchData();
      addToast("Renamed successfully!", "success");
    } catch (err) {
      // Error message backend se aayega
      addToast(err.response?.data?.error || "Rename failed", "error");
    } finally {
      setRenameItem(null);
    }
  };

  const handleDelete = async (id, permanent = false) => {
    try {
      if (permanent) {
        await api.delete(`/files/delete-permanently/${id}`);
        addToast("Permanently deleted", "success");
      } else {
        await api.patch(`/files/trash/${id}`, { is_deleted: true });
        addToast("Moved to trash", "success");
      }
      fetchData();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const handleToggleStar = async (item) => {
    try {
      await api.patch(`/files/star/${item.id}`);
      fetchData();
      addToast(
        item.is_starred ? "Removed from starred" : "Added to starred!",
        "success",
      );
    } catch {
      addToast("Failed to update star", "error");
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.patch(`/files/restore/${id}`);
      fetchData();
      addToast("Item restored!", "success");
    } catch {
      addToast("Restore failed", "error");
    }
  };

  const handleMoveItem = async (itemId, targetFolderId) => {
    try {
      setIsMoving(true);
      await api.put(`/files/rename/${itemId}`, {
        parent_id: targetFolderId || null,
      });
      fetchData();
      addToast("Item moved!", "success");
    } catch {
      addToast("Move failed", "error");
    } finally {
      setIsMoving(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (!e.dataTransfer.types.includes("Files")) return;

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const formData = new FormData();
    formData.append("parent_id", currentFolderId || "");
    formData.append("file", droppedFile);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) =>
          setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
      fetchData();
      addToast(`"${droppedFile.name}" uploaded!`, "success");
    } catch {
      addToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const usedBytes = stats?.used_space_bytes || 0;
  const limitBytes = 500 * 1024 * 1024;
  const usedPercent = Math.min((usedBytes / limitBytes) * 100, 100);
  const displayFiles = searchQuery.trim()
    ? searchResults
    : activeTab === "shared"
      ? sharedFiles
      : files;
  const tabLabel = {
    all: navigationStack[navigationStack.length - 1]?.name,
    recent: "Recent",
    starred: "Starred",
    shared: "Shared with Me",
    trash: "Trash",
  };
  const navItems = [
    { id: "all", label: "My Files", icon: HardDrive },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "starred", label: "Starred", icon: Star },
    { id: "shared", label: "Shared with Me", icon: Share2 },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (id === "all") {
      setCurrentFolderId(null);
      setNavigationStack([{ id: null, name: "My Files" }]);
    }
    setSidebarOpen(false);
  };

  // Sidebar content (reusable for both desktop and mobile)
  const SidebarContent = () => (
    <>
      <div className="px-5 py-4 flex items-center gap-2.5 border-b border-gray-50">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 2z" />
          </svg>
        </div>
        <span className="text-lg font-black text-gray-900 tracking-tight">
          CloudVault
        </span>
      </div>

      <div className="px-4 pt-4 pb-2 flex flex-col gap-2">
        <button
          onClick={() => {
            setShowFolderModal(true);
            setSidebarOpen(false);
          }}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition shadow-md shadow-blue-200 group"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-500 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:-rotate-12"
            >
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          {/* <FolderPlus
            size={16}
            className="transition-transform duration-300 group-hover:-rotate-12"
          />{" "} */}
          New Folder
        </button>
        <button
          onClick={() => {
            setShowUploadModal(true);
            setSidebarOpen(false);
          }}
          disabled={isUploading}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl font-semibold text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin text-blue-500" />
          ) : (
            <Upload size={16} />
          )}
          {isUploading ? `Uploading ${uploadProgress}%` : "Upload File"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* {isUploading && (
        <div className="px-4 pb-2">
          <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )} */}

      {isUploading && (
        <div className="px-8 py-2 bg-blue-50 border-b shrink-0">
          <div className="flex justify-between text-xs font-bold text-blue-600 mb-1">
            <span>⬆️ Uploading file...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {isMoving && (
        <div className="px-6 py-2 bg-purple-50 border-b shrink-0">
          <div className="flex justify-between text-xs font-bold text-purple-600 mb-1">
            <span className="flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              Moving item...
            </span>
            <span>Please wait</span>
          </div>
          <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full animate-moving-bar" />
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleNavClick(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === id ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
          >
            <Icon
              size={17}
              className={activeTab === id ? "text-blue-600" : ""}
            />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-50">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Storage
          </span>
          <span className="text-xs font-bold text-blue-600">
            {usedPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${usedPercent > 80 ? "bg-red-500" : usedPercent > 60 ? "bg-amber-500" : "bg-blue-500"}`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 font-medium">
          {formatBytes(usedBytes)} <span className="text-gray-300">of</span> 500
          MB used
        </p>
      </div>
    </>
  );

  return (
    <div
      className="flex h-screen bg-[#f8f9fc] font-sans overflow-hidden"
      style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
    >
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-2xl animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col shrink-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 shrink-0 gap-2">
          {/* Hamburger - mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
              size={16}
            />
            {isSearching && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin"
                size={14}
              />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-blue-300 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* View toggle */}
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
              >
                <List size={15} />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition hidden sm:flex"
            >
              <RefreshCw size={15} />
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                  {user?.details?.full_name?.charAt(0)?.toUpperCase() ||
                    user?.full_name?.charAt(0)?.toUpperCase() ||
                    "U"}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden md:block max-w-[80px] truncate">
                  {user?.details?.full_name || user?.full_name || "User"}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform hidden sm:block ${showProfileMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                        {user?.details?.full_name?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {user?.details?.full_name ||
                            user?.full_name ||
                            "User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.details?.email || user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
                      <Shield size={14} className="text-blue-500" />
                      <span className="text-xs font-semibold text-gray-600">
                        Free Plan · 500 MB
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-50 px-2 py-1.5">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout
                          ? logout()
                          : (localStorage.removeItem("token"),
                            (window.location.href = "/login"));
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        {activeTab === "all" && (
          <div className="px-3 sm:px-6 py-2 bg-white border-b border-gray-50 flex items-center gap-1 text-sm shrink-0 overflow-x-auto">
            {navigationStack.map((crumb, index) => (
              <React.Fragment key={index}>
                {index === 0 ? (
                  <button
                    onClick={() => handleBreadcrumb(index)}
                    className={`flex items-center gap-1 font-semibold transition whitespace-nowrap ${index === navigationStack.length - 1 ? "text-gray-800" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    <Home size={13} /> {crumb.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBreadcrumb(index)}
                    className={`font-semibold transition whitespace-nowrap ${index === navigationStack.length - 1 ? "text-gray-800" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    {crumb.name}
                  </button>
                )}
                {index < navigationStack.length - 1 && (
                  <ChevronRight size={14} className="text-gray-200 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Content area */}
        <div
          ref={contentRef}
          className={`flex-1 overflow-y-auto px-3 sm:px-6 py-4 transition-all duration-200 ${isDragging ? "bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="fixed inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center z-40 pointer-events-none">
              <div className="bg-white rounded-3xl shadow-2xl px-8 sm:px-12 py-8 sm:py-10 flex flex-col items-center gap-4 border-2 border-dashed border-blue-400 mx-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Upload size={32} className="text-blue-500" />
                </div>
                <p className="text-xl font-black text-blue-600">
                  Drop to Upload
                </p>
                <p className="text-sm text-gray-400 text-center">
                  {currentFolderId
                    ? `Uploading to "${navigationStack[navigationStack.length - 1]?.name}"`
                    : "Uploading to My Files"}
                </p>
              </div>
            </div>
          )}

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : tabLabel[activeTab]}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                {displayFiles.length}{" "}
                {displayFiles.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-gray-600 cursor-pointer hover:border-gray-300 transition"
              >
                <option value="all">All Types</option>
                <option value="folder">Folders</option>
                <option value="image">Images</option>
                <option value="pdf">PDFs</option>
                <option value="video">Videos</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-gray-600 cursor-pointer hover:border-gray-300 transition"
              >
                <option value="date">Sort: Date</option>
                <option value="name">Sort: Name</option>
                <option value="size">Sort: Size</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
                  : "flex flex-col gap-2"
              }
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-2xl animate-pulse border border-gray-100 ${viewMode === "grid" ? "h-[160px]" : "h-14"}`}
                />
              ))}
            </div>
          ) : displayFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-200">
                {activeTab === "trash" ? (
                  <Trash2 size={28} className="text-gray-300" />
                ) : activeTab === "starred" ? (
                  <Star size={28} className="text-gray-300" />
                ) : (
                  <FolderPlus size={28} className="text-gray-300" />
                )}
              </div>
              <p className="text-base font-bold text-gray-400">
                {searchQuery
                  ? "No results found"
                  : activeTab === "trash"
                    ? "Trash is empty"
                    : activeTab === "starred"
                      ? "No starred items"
                      : "This folder is empty"}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {!searchQuery &&
                  activeTab === "all" &&
                  "Upload a file or create a new folder"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {displayFiles.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  viewMode="grid"
                  onFolderOpen={handleFolderOpen}
                  onRename={setRenameItem}
                  onDelete={handleDelete}
                  onShare={setShareItem}
                  onRestore={handleRestore}
                  isTrash={activeTab === "trash"}
                  onToggleStar={handleToggleStar}
                  onPreview={setPreviewItem}
                  onVersionHistory={setVersionItem}
                  onDragStart={setDraggedItem}
                  onDragEnd={() => {
                    setDraggedItem(null);
                    setDragOverFolderId(null);
                  }}
                  onDragOverFolder={setDragOverFolderId}
                  onDropOnFolder={(targetFolderId) => {
                    if (draggedItem && draggedItem.id !== targetFolderId) {
                      handleMoveItem(draggedItem.id, targetFolderId);
                      setDraggedItem(null);
                      setDragOverFolderId(null);
                    }
                  }}
                  draggedItemId={draggedItem?.id}
                  dragOverFolderId={dragOverFolderId}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-9 shrink-0" />
                <div className="flex-1">Name</div>
                <div className="w-20 text-right hidden sm:block shrink-0">
                  Size
                </div>
                <div className="w-24 text-right hidden md:block shrink-0">
                  Modified
                </div>
                <div className="w-8 shrink-0" />
              </div>
              {displayFiles.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  viewMode="list"
                  onFolderOpen={handleFolderOpen}
                  onRename={setRenameItem}
                  onDelete={handleDelete}
                  onShare={setShareItem}
                  onRestore={handleRestore}
                  isTrash={activeTab === "trash"}
                  onToggleStar={handleToggleStar}
                  onPreview={setPreviewItem}
                  onVersionHistory={setVersionItem}
                  onDragStart={setDraggedItem}
                  onDragEnd={() => {
                    setDraggedItem(null);
                    setDragOverFolderId(null);
                  }}
                  onDragOverFolder={setDragOverFolderId}
                  onDropOnFolder={(targetFolderId) => {
                    if (draggedItem && draggedItem.id !== targetFolderId) {
                      handleMoveItem(draggedItem.id, targetFolderId);
                      setDraggedItem(null);
                      setDragOverFolderId(null);
                    }
                  }}
                  draggedItemId={draggedItem?.id}
                  dragOverFolderId={dragOverFolderId}
                />
              ))}
            </div>
          )}
          {/* Load More Indicator */}
          {isFetchingMore && (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span className="text-sm font-semibold text-gray-400">
                Loading more...
              </span>
            </div>
          )}

          {/* All loaded indicator */}
          {!hasMore && files.length > 0 && !loading && (
            <div className="text-center py-4">
              <p className="text-xs text-gray-300 font-medium">
                — All files loaded —
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-black text-gray-800 mb-1 flex items-center gap-2">
              <FolderPlus size={20} className="text-blue-600" /> New Folder
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Creating in:{" "}
              <span className="font-semibold text-gray-600">
                {navigationStack[navigationStack.length - 1]?.name}
              </span>
            </p>
            <form onSubmit={handleCreateFolder}>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none text-sm font-semibold mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderModal(false);
                    setNewFolderName("");
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:bg-gray-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {renameItem && (
        <RenameModal
          item={renameItem}
          onConfirm={handleRenameConfirm}
          onClose={() => setRenameItem(null)}
        />
      )}
      {shareItem && (
        <ShareModal
          item={shareItem}
          onClose={() => setShareItem(null)}
          addToast={addToast}
        />
      )}
      {previewItem && (
        <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
      <Toast toasts={toasts} removeToast={removeToast} />

      {versionItem && (
        <VersionModal
          item={versionItem}
          onClose={() => setVersionItem(null)}
          addToast={addToast}
        />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadFile}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          currentFolderName={navigationStack[navigationStack.length - 1]?.name}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
          @keyframes moving-bar {
  0% { width: 0%; margin-left: 0%; }
  50% { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
.animate-moving-bar {
  animation: moving-bar 1.2s ease-in-out infinite;
}
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default Dashboard;
