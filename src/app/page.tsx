"use client";

import { useRef, useState } from "react";
import {
  FileDown,
  Printer,
  RotateCcw,
  Sparkles,
  Building2,
  Lock,
  ArrowRight,
  Maximize2,
  X,
  FileText,
  SlidersHorizontal,
  Eye,
  Check,
  ChevronRight,
} from "lucide-react";
import PayslipForm from "@/components/PayslipForm";
import PayslipPreview from "@/components/PayslipPreview";
import { PayslipData, emptyPayslip, samplePayslip } from "@/types/payslip";
import { downloadPayslipPdf, printPayslip } from "@/lib/generatePdf";

export default function Home() {
  const [data, setData] = useState<PayslipData>(samplePayslip());
  const [isGenerated, setIsGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fullScreenModal, setFullScreenModal] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const modalPreviewRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    if (confirm("Clear all form fields and start fresh?")) {
      setData(emptyPayslip());
      setIsGenerated(false);
      setStatusMessage("Template cleared.");
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleLoadSample = () => {
    setData(samplePayslip());
    setStatusMessage("Corporate sample data loaded.");
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleGeneratePayslip = () => {
    if (!data.companyName.trim() && !data.employeeName.trim()) {
      setStatusMessage("Please specify Company Name or Employee Name.");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsGenerated(true);
    setStatusMessage("Document compiled & ready for PDF export.");
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveTab("preview");
    }
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

      setStatusMessage("PDF downloaded successfully.");
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
      {/* 1. Refined Executive Header (Clean, Restrained, High-End SaaS) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
          {/* Brand & Workspace Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              DT
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                DataTrack
              </span>
              <span className="text-slate-300 font-light text-sm">/</span>
              <span className="text-slate-600 text-xs font-medium">
                Payslip Generator
              </span>
            </div>
          </div>

          {/* Center Ledger Summary Pill (Restrained & Functional) */}
          <div className="hidden md:flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-full px-4 py-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Gross:</span>
              <span className="font-semibold text-slate-800">
                ₹{grossEarnings.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Deductions:</span>
              <span className="font-semibold text-rose-600">
                -₹{totalDeductions.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Net Salary:</span>
              <span className="font-bold text-slate-900">
                ₹{netPay.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample Data</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition hover:bg-slate-100"
              title="Reset fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => handleDownloadPdf()}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer active:scale-98"
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
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden border-t border-slate-200 bg-slate-50 px-4 py-2 gap-2">
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
            className="ml-auto text-slate-400 hover:text-white p-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editor */}
          <section
            className={`lg:col-span-5 space-y-4 ${
              activeTab === "edit" ? "block" : "hidden lg:block"
            } no-print`}
          >
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Salary Details
                </h2>
                <p className="text-xs text-slate-500">
                  Update employer, employee, and monthly ledger records
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Client-Side Private</span>
              </div>
            </div>

            <PayslipForm
              data={data}
              onChange={(updated) => {
                setData(updated);
              }}
            />

            {/* Bottom Generate / Update Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGeneratePayslip}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-99"
              >
                <span>Generate Official Payslip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* Right Column: Physical Paper Canvas (Like Acrobat / Figma Desk) */}
          <section
            className={`lg:col-span-7 lg:sticky lg:top-20 space-y-3 ${
              activeTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Document Stage Toolbar */}
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between shadow-2xs no-print text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                  {data.companyName
                    ? `${data.companyName.split(" ")[0]}_Payslip_${data.payPeriodMonth}_${data.payPeriodYear}.pdf`
                    : "Payslip_Document.pdf"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  (A4 • 1 Page)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                    className="px-1 text-slate-500 hover:text-slate-800 font-bold"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono font-medium text-slate-700 px-1.5">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                    className="px-1 text-slate-500 hover:text-slate-800 font-bold"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setFullScreenModal(true)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Full Screen View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Stage Studio Canvas */}
            <div className="bg-[#eaedf1] p-4 sm:p-6 rounded-2xl border border-slate-300/80 overflow-x-auto shadow-inner">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease-out",
                }}
                className="bg-white border border-slate-300 shadow-xl rounded-none overflow-hidden mx-auto"
              >
                <PayslipPreview ref={previewRef} data={data} />
              </div>
            </div>

            {/* Quick Export Row */}
            <div className="flex items-center gap-3 pt-1 no-print">
              <button
                type="button"
                onClick={() => handleDownloadPdf()}
                disabled={downloading}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
              >
                {downloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rendering PDF...</span>
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
                className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 4. Fullscreen Modal Inspection Overlay */}
      {fullScreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in duration-150">
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">
                High-Definition Document Inspection
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                (A4 Print Quality)
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
            <div className="bg-white shadow-2xl overflow-hidden max-w-[800px] w-full border border-slate-300">
              <PayslipPreview ref={modalPreviewRef} data={data} />
            </div>
          </div>
        </div>
      )}

      {/* 5. Minimalist Professional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500 no-print">
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

          <span className="text-slate-400 text-[11px]">
            100% Client-Side • Bank Compliant Standards
          </span>
        </div>
      </footer>
    </div>
  );
}
