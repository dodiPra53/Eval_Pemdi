// INI DI EDIT DARI EVAL PEMDI YANDEX@branch edit_dari_yandex
import React from 'react';
import { FileCheck, Sparkles, ChevronRight, CheckCircle2, AlertCircle, FileSearch, FolderDown, Download } from 'lucide-react';
import { MATURITY_LEVELS } from '../../data/domainsData';

export default function IndicatorCard({ 
  indicator, 
  indicatorState, 
  onOpenDetail, 
  onOpenReviewAi, 
  onAskAi,
  onUpdateLevel 
}) {
  const checkedItems = indicatorState?.checkedItems || {};
  const totalItems = indicator.evidenceChecklist?.length || 0;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const currentLevel = indicatorState?.selfLevel || 1;
  const levelInfo = MATURITY_LEVELS.find(l => l.level === currentLevel) || MATURITY_LEVELS[0];

  const hasTemplates = ['ind-03', 'ind-07', 'ind-11', 'ind-16', 'ind-18'].includes(indicator.id) || 
                       ['IND-03', 'IND-07', 'IND-11', 'IND-16', 'IND-18'].includes(indicator.code);

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group ${
      hasTemplates 
        ? 'border-indigo-200 hover:border-indigo-400 hover:shadow-xl shadow-xs' 
        : 'border-slate-200/90 hover:border-brand-300 hover:shadow-xl'
    }`}>
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
              {indicator.code}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              {indicator.aspectName}
            </span>
            {hasTemplates && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
                <FolderDown className="w-3 h-3 text-indigo-600" />
                5 Template Word & Excel
              </span>
            )}
            {indicator.weight && !hasTemplates && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                Bobot {indicator.weight}%
              </span>
            )}
          </div>

          {/* Level Pill */}
          <div className="relative">
            <select
              value={currentLevel}
              onChange={(e) => onUpdateLevel(indicator.id, Number(e.target.value))}
              title="Pilih estimasi tingkat kematangan indikator ini"
              aria-label="Pilih estimasi tingkat kematangan indikator ini"
              className="text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 cursor-pointer focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value={1}>Lvl 1 - Rintisan</option>
              <option value={2}>Lvl 2 - Terkelola</option>
              <option value={3}>Lvl 3 - Terstandar</option>
              <option value={4}>Lvl 4 - Terpadu</option>
              <option value={5}>Lvl 5 - Optimum</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onOpenDetail(indicator)}
          className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-brand-600 cursor-pointer transition-colors line-clamp-2 mb-2"
        >
          {indicator.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {indicator.description}
        </p>
      </div>

      {/* Bottom Section: Evidence Progress & Actions */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        
        {/* Progress Bar of Evidence Checklist */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <FileCheck className="w-3.5 h-3.5 text-brand-600" />
              Kelengkapan Dokumen Bukti:
            </span>
            <span className={`font-bold ${progressPercent === 100 ? 'text-emerald-600' : 'text-slate-700'}`}>
              {checkedCount}/{totalItems} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                progressPercent === 100 
                  ? 'bg-emerald-500' 
                  : progressPercent > 50 
                    ? 'bg-brand-500' 
                    : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          {/* Main button: View Detail Evidence & Templates */}
          {hasTemplates ? (
            <button
              onClick={() => onOpenDetail(indicator)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-700 hover:to-brand-700 shadow-sm shadow-indigo-500/25 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Bukti & Template</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenDetail(indicator)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 hover:border-brand-200 transition-colors"
            >
              <span>Cek Bukti</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* AI Gap Review Button */}
          <button
            onClick={() => onOpenReviewAi(indicator)}
            title="Analisis kelayakan dokumen bukti dengan AI"
            className="inline-flex items-center justify-center p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors gap-1"
          >
            <FileSearch className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Review AI</span>
          </button>

          {/* AI Ask Button */}
          <button
            onClick={() => onAskAi(indicator)}
            title="Tanya Asisten AI tentang regulasi indikator ini"
            className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </button>
        </div>

      </div>

    </div>
  );
}
