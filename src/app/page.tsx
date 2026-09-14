"use client";

import { useRef, useState, useEffect } from "react";
import {
  FileDown,
  Printer,
  RotateCcw,
  Sparkles,
  Lock,
  Maximize2,
  X,
  FileText,
  SlidersHorizontal,
  Eye,
  Check,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Layers,
} from "lucide-react";
import PayslipForm from "@/components/PayslipForm";
import PayslipPreview from "@/components/PayslipPreview";
import {
  PayslipData,
  emptyPayslip,
  samplePayslip,
  techSoftwareEngineerPayslip,
  corporateExecutivePayslip,
} from "@/types/payslip";
import { downloadPayslipPdf, printPayslip } from "@/lib/generatePdf";

export default function Home() {
  const [data, setData] = useState<PayslipData>(samplePayslip());
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fullScreenModal, setFullScreenModal] = useState<boolean>(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const modalPreviewRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for PDF download (Ctrl+P or Cmd+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleDownloadPdf();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data]);

  const handleReset = () => {
    if (confirm("Clear all form fields and start fresh?")) {
      setData(emptyPayslip());
      setStatusMessage("Template cleared.");
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleLoadPreset = (type: "ienergizer" | "tech" | "executive" | "empty") => {
    setPresetMenuOpen(false);
    if (type === "ienergizer") {
      setData(samplePayslip());
      setStatusMessage("Loaded iEnergizer Customer Ops template.");
    } else if (type === "tech") {
      setData(techSoftwareEngineerPayslip());
      setStatusMessage("Loaded Tech / SDE template.");
    } else if (type === "executive") {
      setData(corporateExecutivePayslip());
      setStatusMessage("Loaded Corporate Executive template.");
    } else if (type === "empty") {
      setData(emptyPayslip());
      setStatusMessage("Blank canvas loaded.");
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDownloadPdf = async (targetRef?: React.RefObject<HTMLDivElement | null>) => {
    const el = targetRef?.current || previewRef.current;
    if (!el) return;
    setDownloading(true);
    setStatusMessage("Compiling 300DPI vector-grade PDF...");

    try {
      const cleanEmpName = (data.employeeName || "Employee")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const filename = `DataTrack_Payslip_${cleanEmpName}_${data.payPeriodMonth}_${data.payPeriodYear}.pdf`;

      await downloadPayslipPdf(el, {
        filename,
        onProgress: (status) => setStatusMessage(status),
      });

      setStatusMessage("Official PDF downloaded successfully.");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setStatusMessage("Download failed. Please use Print to PDF.");
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    printPayslip();
  };

  // Live financials
  const grossEarnings = (data.earnings || []).reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  const totalDeductions = (data.deductions || []).reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* 1. Bespoke Executive Top Bar (Linear / Mercury Caliber) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Brand & Workspace Title */}
          <div className="flex items-center gap-3">
            {/* Precision SVG Brand Glyph */}
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs border border-slate-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-slate-100"
              >
                <path
                  d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V17.5C20 18.8807 18.8807 20 17.5 20H6.5C5.11929 20 4 18.8807 4 17.5V6.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 8.5H16M8 12H16M8 15.5H12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="15.5" r="1.5" fill="#38bdf8" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                DataTrack
              </span>
              <span className="text-slate-300 font-light text-sm">/</span>
              <span className="text-slate-600 text-xs font-semibold">
                Payslip Studio
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                v2.5
              </span>
            </div>

            {/* Live Sync Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 ml-2 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sync Active</span>
            </div>
          </div>

          {/* Center Ledger Summary Pill (Clean Monospace Financial Figures) */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-4 py-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Gross:</span>
              <span className="font-mono font-semibold text-slate-800 tabular-nums">
                ₹{grossEarnings.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Deductions:</span>
              <span className="font-mono font-semibold text-rose-600 tabular-nums">
                -₹{totalDeductions.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Net Salary:</span>
              <span className="font-mono font-bold text-slate-950 tabular-nums">
                ₹{netPay.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Template Presets Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPresetMenuOpen(!presetMenuOpen)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {presetMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Industry Template
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset("ienergizer")}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-800 hover:text-slate-950 transition"
                  >
                    <div>
                      <div className="font-semibold text-xs">iEnergizer / BPO Ops</div>
                      <div className="text-[10px] text-slate-400">
                        Khushal Yadav • Noida
                      </div>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset("tech")}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-800 hover:text-slate-950 transition"
                  >
                    <div>
                      <div className="font-semibold text-xs">Software Engineer (SDE)</div>
                      <div className="text-[10px] text-slate-400">
                        Tech Bangalore • ₹1.1L Gross
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset("executive")}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-800 hover:text-slate-950 transition"
                  >
                    <div>
                      <div className="font-semibold text-xs">Corporate Director</div>
                      <div className="text-[10px] text-slate-400">
                        Executive Leadership • ₹2.3L Gross
                      </div>
                    </div>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => handleLoadPreset("empty")}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-500 hover:text-rose-600 text-xs transition"
                  >
                    Clear to Blank Canvas
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition hover:bg-slate-100 cursor-pointer"
              title="Reset fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {/* Primary Action Button (Obsidian, Tactile, Hotkey Badge) */}
            <button
              type="button"
              onClick={() => handleDownloadPdf()}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-black disabled:opacity-60 px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer active:scale-98"
            >
              {downloading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                  <span className="hidden md:inline-block text-[10px] font-mono text-slate-400 bg-slate-800 px-1 py-0.2 rounded ml-0.5">
                    ⌘P
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden border-t border-slate-200 bg-slate-50 px-4 py-1.5 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
              activeTab === "edit"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Form Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                : "text-slate-600"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Document Preview</span>
          </button>
        </div>
      </header>

      {/* 2. Floating Notification Toast */}
      {statusMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium">{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="ml-auto text-slate-400 hover:text-white p-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Studio Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Editor (Segmented Controller) */}
          <section
            className={`lg:col-span-5 space-y-3.5 ${
              activeTab === "edit" ? "block" : "hidden lg:block"
            } no-print`}
          >
            <div className="flex items-center justify-between pb-0.5">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Payroll Information Studio
                </h2>
                <p className="text-[11px] text-slate-500">
                  Configure corporate employer, employee records, and monthly ledger
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                <Lock className="w-2.5 h-2.5 text-slate-500" />
                <span>Client-Side Private</span>
              </div>
            </div>

            <PayslipForm
              data={data}
              onChange={(updated) => {
                setData(updated);
              }}
            />
          </section>

          {/* Right Column: Physical Paper Canvas (Figma / Acrobat Desk Quality) */}
          <section
            className={`lg:col-span-7 lg:sticky lg:top-18 space-y-3 ${
              activeTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Document Stage Toolbar Dock */}
            <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-2xs no-print text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-100 text-slate-700">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800 truncate max-w-[180px] sm:max-w-xs text-xs">
                    {data.companyName
                      ? `${data.companyName.split(" ")[0]}_Payslip_${data.payPeriodMonth}_${data.payPeriodYear}.pdf`
                      : "Payslip_Document.pdf"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    A4 Portrait • 300 DPI High-Definition Export
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    className="px-1 text-slate-500 hover:text-slate-900 font-bold text-xs cursor-pointer"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="text-[10px] font-mono font-semibold text-slate-700 px-1.5 hover:text-slate-900 cursor-pointer"
                    title="Reset to 100%"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                    className="px-1 text-slate-500 hover:text-slate-900 font-bold text-xs cursor-pointer"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setFullScreenModal(true)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Full Screen Inspection"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Stage Studio Canvas (Drafting Desk Texture) */}
            <div className="studio-desk-pattern p-4 sm:p-6 rounded-2xl border border-slate-300/80 overflow-x-auto shadow-inner min-h-[500px] flex items-start justify-center">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="bg-white paper-elevation rounded-none overflow-hidden mx-auto transition-transform"
              >
                <PayslipPreview ref={previewRef} data={data} />
              </div>
            </div>

            {/* Quick Export Dock */}
            <div className="flex items-center gap-2.5 pt-0.5 no-print">
              <button
                type="button"
                onClick={() => handleDownloadPdf()}
                disabled={downloading}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
              >
                {downloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Official PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Download Official PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Slip</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 4. Fullscreen Modal Inspection Overlay */}
      {fullScreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col p-4 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in duration-150">
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">
                High-Definition Document Inspection
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                (A4 Print Quality Standard)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf(modalPreviewRef)}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setFullScreenModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-start pb-8">
            <div className="bg-white paper-elevation overflow-hidden max-w-[800px] w-full border border-slate-300">
              <PayslipPreview ref={modalPreviewRef} data={data} />
            </div>
          </div>
        </div>
      )}

      {/* 5. Minimalist Professional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3.5 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              DataTrack Payslip Studio
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 text-[11px]">
              Internal Payroll Generation Utility
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Client-Side Private
            </span>
            <span>•</span>
            <span>Bank & IT Act Compliant Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
