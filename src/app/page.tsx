"use client";

import { useRef, useState } from "react";
import {
  FileDown,
  Printer,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileCheck,
  Building2,
  Lock,
  ArrowRight,
  Edit3,
  DownloadCloud,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Coins,
  Receipt,
  TrendingDown,
  CalendarCheck,
  X,
  ExternalLink,
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
    if (confirm("Reset all fields to an empty template?")) {
      setData(emptyPayslip());
      setIsGenerated(false);
      setStatusMessage("Template reset to empty fields.");
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleLoadSample = () => {
    setData(samplePayslip());
    setStatusMessage("Official DataTrack corporate sample loaded!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleGeneratePayslip = () => {
    if (!data.companyName.trim() && !data.employeeName.trim()) {
      setStatusMessage("Please enter at least Company Name or Employee Name to generate.");
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    setIsGenerated(true);
    setStatusMessage("Payslip validated & sealed! Ready for official PDF export.");
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveTab("preview");
    }
  };

  const handleDownloadPdf = async (targetRef?: React.RefObject<HTMLDivElement | null>) => {
    const el = targetRef?.current || previewRef.current;
    if (!el) return;
    setDownloading(true);
    setStatusMessage("Rendering 300DPI corporate document...");

    try {
      const cleanEmpName = (data.employeeName || "Employee")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const filename = `DataTrack_Payslip_${cleanEmpName}_${data.payPeriodMonth}_${data.payPeriodYear}.pdf`;

      await downloadPayslipPdf(el, {
        filename,
        onProgress: (status) => setStatusMessage(status),
      });

      setStatusMessage("Payslip PDF downloaded successfully!");
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (error) {
      console.error("PDF Download error:", error);
      setStatusMessage("Export failed. Please try Print to PDF instead.");
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    printPayslip();
  };

  // Financial Computations
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
    <div className="min-h-screen bg-slate-50 relative flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. Ambient Background Atmosphere (Glows + Dot Grid) */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-grid-pattern opacity-60" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-20 right-10 w-[450px] h-[450px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 2. Top Executive Glassmorphic Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-teal-500 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center shadow-inner">
                <Building2 className="w-5 h-5 text-indigo-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  <span>DataTrack</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 font-extrabold">
                    Payslip Generator
                  </span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50/90 px-2.5 py-0.5 rounded-full border border-indigo-200/80 tracking-wide uppercase shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" /> Powered by DataTrack
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Bank-Ready Form 12-B
                </span>
                <span className="text-slate-300">•</span>
                <span className="hidden sm:inline">300DPI High Definition Export</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50/60 border border-slate-200/90 hover:border-indigo-200 px-3 py-2 rounded-xl transition duration-150 shadow-xs cursor-pointer active:scale-95"
              title="Load full official sample data"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Load Sample Data</span>
              <span className="sm:hidden">Sample</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/90 p-2 sm:px-3 sm:py-2 rounded-xl transition duration-150 shadow-xs cursor-pointer active:scale-95"
              title="Reset fields to empty"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 px-3 py-2 rounded-xl transition duration-150 shadow-xs cursor-pointer active:scale-95"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Mobile View Selector */}
        <div className="flex lg:hidden border-t border-slate-200 bg-slate-50/90 px-4 py-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === "edit"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Edit Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === "preview"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            2. Preview & Download
          </button>
        </div>
      </header>

      {/* 3. Floating Status Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold tracking-tight">{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="ml-auto text-slate-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Executive KPI Summary Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full no-print">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Gross Salary */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Gross Earnings (A)
              </span>
              <p className="text-sm sm:text-base font-black font-mono text-slate-900 truncate">
                ₹{grossEarnings.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Card 2: Deductions */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Total Deductions (B)
              </span>
              <p className="text-sm sm:text-base font-black font-mono text-slate-900 truncate">
                ₹{totalDeductions.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Card 3: Net Take-Home */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block truncate">
                Net Pay (A - B)
              </span>
              <p className="text-sm sm:text-base font-black font-mono text-white truncate">
                ₹{netPay.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Card 4: Attendance & Status */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                Working Days
              </span>
              <p className="text-sm sm:text-base font-black font-mono text-slate-900 truncate">
                {data.paidDays || "30"} / {data.totalDays || "30"} Days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Content: Dual-Column Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editor */}
          <section
            className={`lg:col-span-6 space-y-4 ${
              activeTab === "edit" ? "block" : "hidden lg:block"
            } no-print`}
          >
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Payroll Configuration
                </h2>
                <p className="text-xs text-slate-500">
                  Update employer, staff profile & itemized income ledgers
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600" /> 100% Client-Side Private
              </span>
            </div>

            <PayslipForm
              data={data}
              onChange={(updated) => {
                setData(updated);
              }}
            />

            {/* Bottom Generate Trigger for Form */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGeneratePayslip}
                className="relative overflow-hidden group w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 transform active:scale-[0.99]"
              >
                {/* Shimmer animation */}
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 animate-shimmer pointer-events-none" />
                <FileCheck className="w-4 h-4" />
                <span>Generate Official Payslip</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </section>

          {/* Right Column: The "Executive Desk" Stage */}
          <section
            className={`lg:col-span-6 lg:sticky lg:top-20 space-y-4 ${
              activeTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Document Header & Zoom Controls */}
            <div className="flex items-center justify-between pb-1 no-print">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Document Preview
                </h2>
                {isGenerated ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <CheckCircle2 className="w-3 h-3" /> Sealed & Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Live Draft
                  </span>
                )}
              </div>

              {/* Zoom & Fullscreen Controls */}
              <div className="flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl px-2 py-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                  className="px-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-[11px] font-mono text-slate-700 px-1 font-semibold">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                  className="px-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition"
                  title="Zoom In"
                >
                  +
                </button>
                <div className="h-3.5 w-px bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setFullScreenModal(true)}
                  className="p-1 text-slate-500 hover:text-indigo-600 transition"
                  title="Full Screen View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* The Document Paper Stage (With Authentic 120GSM Paper Shadow) */}
            <div className="bg-slate-200/50 p-3 sm:p-5 rounded-2xl border border-slate-200 overflow-x-auto">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease-out",
                }}
                className="paper-shadow rounded-none overflow-hidden bg-white ring-1 ring-slate-900/10"
              >
                <PayslipPreview ref={previewRef} data={data} />
              </div>
            </div>

            {/* Action Bar (Highlighted when Generated) */}
            <div className="space-y-3 pt-2 no-print">
              {isGenerated ? (
                /* Generated State: Prominent PDF Download, Print & Edit */
                <div className="bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/50 border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">
                          Official Payslip Generated Successfully!
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Formatted with Form-12B statutory standards & 300DPI clarity
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGenerated(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>

                  {/* Primary Download Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf()}
                      disabled={downloading}
                      className="relative overflow-hidden flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-extrabold py-3.5 px-5 shadow-lg shadow-emerald-600/30 transition-all duration-200 disabled:opacity-60 cursor-pointer active:scale-95"
                    >
                      {downloading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Preparing 300DPI PDF...</span>
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
                      className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300/90 hover:bg-slate-50 text-slate-800 text-sm font-bold py-3.5 px-5 shadow-xs transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Print Document</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Verified for Bank Loans, IT Returns & Visa
                    </span>
                    <button
                      type="button"
                      onClick={() => setFullScreenModal(true)}
                      className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      Inspect Fullscreen <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Pre-generation state: "Generate Payslip" as the main CTA + Quick Download option */
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleGeneratePayslip}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-extrabold py-4 px-5 shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Payslip</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf()}
                      disabled={downloading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-3.5 transition shadow-xs disabled:opacity-60 cursor-pointer"
                      title="Quick export PDF without sealing"
                    >
                      <DownloadCloud className="w-3.5 h-3.5 text-slate-500" />
                      <span>{downloading ? "Exporting..." : "Quick Download PDF"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-4 transition shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* 6. Fullscreen Modal Inspection Overlay */}
      {fullScreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-4 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in duration-200">
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4 text-white">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-tight">
                DataTrack High-Resolution Document Inspection
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                A4 • 300DPI
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf(modalPreviewRef)}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-md cursor-pointer transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{downloading ? "Downloading..." : "Download PDF"}</span>
              </button>

              <button
                type="button"
                onClick={() => setFullScreenModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Close fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-start pb-8">
            <div className="bg-white rounded-none shadow-2xl overflow-hidden max-w-[800px] w-full">
              <PayslipPreview ref={modalPreviewRef} data={data} />
            </div>
          </div>
        </div>
      )}

      {/* 7. Executive Branded Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-md py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              DT
            </div>
            <p className="font-extrabold text-slate-800 tracking-tight">
              DataTrack Payslip Generator
            </p>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Powered by DataTrack Technologies</span>
          </div>

          <p className="text-slate-400 text-[11px] font-medium">
            Zero Server Uploads • 100% Client-Side Private • Bank & Income Tax Compliant
          </p>
        </div>
      </footer>
    </div>
  );
}
