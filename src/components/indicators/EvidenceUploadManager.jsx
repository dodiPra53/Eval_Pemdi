import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, 
  Loader2, Eye, FileCheck, Cloud, Database
} from 'lucide-react';
import { getEvidenceList, uploadEvidencePdf } from '../../services/evidenceService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export default function EvidenceUploadManager({
  indicator,
  activeLevel,
  checklistItems = [],
  onEvidenceCountChange
}) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [judulDokumen, setJudulDokumen] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState(new Date().getFullYear());
  const [selectedChecklist, setSelectedChecklist] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Muat daftar bukti dari database MySQL saat indikator berubah
  const loadEvidence = async () => {
    if (!indicator?.id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getEvidenceList({ indicator_id: indicator.id });
      setEvidenceList(data);
      if (onEvidenceCountChange) {
        onEvidenceCountChange(indicator.id, data.length);
      }
    } catch (err) {
      console.warn('Gagal memuat bukti dari MySQL:', err.message);
      // Fallback jika API belum aktif di mode tertentu
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [indicator?.id]);

  // Validasi file PDF
  const validateAndSetFile = (file) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!file) return;

    // Cek ekstensi
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      setErrorMsg('Format file ditolak! Sistem hanya menerima dokumen berformat PDF (.pdf).');
      setSelectedFile(null);
      return;
    }

    // Cek ukuran (< 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg('Ukuran file terlalu besar! Maksimal ukuran PDF adalah 25 MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!judulDokumen) {
      // Buat judul default yang rapi dari nama file
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_|-]/g, ' ');
      setJudulDokumen(cleanTitle);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Silakan pilih berkas dokumen PDF terlebih dahulu.');
      return;
    }
    if (!judulDokumen.trim()) {
      setErrorMsg('Judul dokumen bukti wajib diisi.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await uploadEvidencePdf({
        indicator_id: indicator.id,
        checklist_id: selectedChecklist || null,
        target_level: activeLevel || 3,
        judul_dokumen: judulDokumen.trim(),
        nomor_surat_resmi: nomorSurat.trim() || null,
        tahun_terbit: tahunTerbit,
        deskripsi_singkat: deskripsi.trim(),
        file: selectedFile
      });

      setSuccessMsg('Dokumen bukti PDF berhasil diunggah dan disimpan ke database!');
      
      // Reset form
      setSelectedFile(null);
      setJudulDokumen('');
      setNomorSurat('');
      setDeskripsi('');
      setSelectedChecklist('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh data
      await loadEvidence();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengunggah dokumen bukti.');
    } finally {
      setUploading(false);
    }
  };


  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-slate-900">
                Unggah Bukti Dukung Resmi (Format PDF)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                Wajib PDF
              </span>
              {isSupabaseConfigured ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Supabase Cloud Active
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Database className="w-3 h-3 text-blue-600" />
                  MySQL Local (Laragon)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSupabaseConfigured 
                ? 'Berkas PDF & metadata tersimpan langsung di Cloud Database Supabase (PostgreSQL + S3 Storage Bucket)'
                : 'Berkas PDF tersimpan di MySQL database EvalPemdi (Siap dimigrasi ke Supabase Cloud)'}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          {evidenceList.length} Berkas Tersimpan
        </span>
      </div>

      {/* Alert Notifikasi */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 border border-rose-300 text-rose-800 rounded-xl animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Upload */}
      <form onSubmit={handleUpload} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
        
        {/* Dropzone PDF */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-rose-500 bg-rose-50/80 scale-[0.99]' 
              : selectedFile 
                ? 'border-emerald-400 bg-emerald-50/50' 
                : 'border-slate-300 hover:border-rose-400 bg-white hover:bg-rose-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                PDF
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatFileSize(selectedFile.size)} • Siap diunggah
                </div>
              </div>
              <span className="ml-auto text-xs text-brand-600 hover:underline font-semibold">
                Ganti File
              </span>
            </div>
          ) : (
            <div className="py-2">
              <Upload className="w-7 h-7 mx-auto text-rose-500 mb-1.5" />
              <div className="text-xs font-bold text-slate-800">
                Tarik berkas PDF ke sini atau <span className="text-rose-600 underline">Pilih Berkas PDF</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Hanya menerima format <strong>.pdf</strong> (Maksimal ukuran 25 MB)
              </p>
            </div>
          )}
        </div>

        {/* Input Rincian Dokumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul / Nama Dokumen Bukti <span className="text-rose-600">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="Misal: Perbup Tata Kelola Arsitektur SPBE 2025"
              value={judulDokumen}
              onChange={(e) => setJudulDokumen(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hubungkan ke Butir Checklist (Opsional):
            </label>
            <select
              value={selectedChecklist}
              onChange={(e) => setSelectedChecklist(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              <option value="">-- Dokumen Umum Indikator Ini --</option>
              {checklistItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.label} (Level {item.minLevel || 3}+)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor Surat / SK Resmi (Opsional):
            </label>
            <input
              type="text"
              placeholder="Misal: 188.45/120/HK/2025"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun Terbit:
              </label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={tahunTerbit}
                onChange={(e) => setTahunTerbit(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Level:
              </label>
              <input
                type="text"
                disabled
                value={`Level ${activeLevel}`}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Ringkasan Isi / Catatan Bukti:
          </label>
          <input
            type="text"
            placeholder="Keterangan pasal, BAB, atau halaman relevan dalam berkas..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
          />
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all ${
              uploading || !selectedFile
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 active:scale-95'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunggah & Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Simpan Berkas Bukti PDF</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Daftar Berkas Terunggah dari Database */}
      <div className="space-y-2 pt-1">
        <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Daftar Dokumen Bukti yang Telah Diunggah</span>
        </h5>

        {loading ? (
          <div className="flex items-center justify-center p-6 text-slate-500 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
            <span>Memuat berkas dari database...</span>
          </div>
        ) : evidenceList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-500">
            Belum ada berkas PDF bukti dukung yang diunggah untuk indikator ini. Silakan gunakan form di atas untuk mengunggah.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {evidenceList.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-rose-300 transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                    PDF
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-rose-600">
                      {doc.judul_dokumen}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap mt-0.5">
                      <span className="font-mono">{doc.file_name_original}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size_bytes)}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded-sm bg-brand-50 text-brand-700 font-bold">
                        Target Lvl {doc.target_level}
                      </span>
                      {doc.nomor_surat_resmi && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600">No: {doc.nomor_surat_resmi}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aksi Berkas */}
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {(doc.external_url || doc.file_path_storage) && (
                    <a
                      href={doc.external_url || doc.file_path_storage}
                      target="_blank"
                      rel="noreferrer"
                      title="Buka / Unduh Berkas PDF"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
