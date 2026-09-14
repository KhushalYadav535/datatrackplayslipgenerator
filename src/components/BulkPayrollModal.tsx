"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Archive,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { PayslipData, MONTHS } from "@/types/payslip";
import {
  parseExcelPayroll,
  generateSampleExcelTemplate,
  ParsedBatchResult,
} from "@/lib/excelParser";
import {
  exportBatchAsZip,
  exportBatchAsCombinedPdf,
} from "@/lib/batchPdfGenerator";
import PayslipPreview from "@/components/PayslipPreview";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  baseCompanyData: PayslipData;
}

export default function BulkPayrollModal({
  isOpen,
  onClose,
  baseCompanyData,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [batchEmployees, setBatchEmployees] = useState<PayslipData[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Batch override options
  const [overrideCompany, setOverrideCompany] = useState(baseCompanyData.companyName);
  const [overrideMonth, setOverrideMonth] = useState(baseCompanyData.payPeriodMonth);
  const [overrideYear, setOverrideYear] = useState(baseCompanyData.payPeriodYear);
  const [overrideStamp, setOverrideStamp] = useState(baseCompanyData.showStamp);

  // Export progress
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);

  // Single employee preview modal
  const [previewEmployee, setPreviewEmployee] = useState<PayslipData | null>(null);

  // Off-screen container for rendering batch PDFs
  const [batchRenderData, setBatchRenderData] = useState<PayslipData>(baseCompanyData);
  const offscreenRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (uploadedFile: File) => {
    setParsing(true);
    setErrorMsg(null);
    setFile(uploadedFile);

    try {
      const result: ParsedBatchResult = await parseExcelPayroll(uploadedFile, {
        ...baseCompanyData,
        companyName: overrideCompany || baseCompanyData.companyName,
        payPeriodMonth: overrideMonth || baseCompanyData.payPeriodMonth,
        payPeriodYear: overrideYear || baseCompanyData.payPeriodYear,
        showStamp: overrideStamp,
      });

      if (result.employees.length === 0) {
        setErrorMsg("No valid employee payroll records found in file. Please verify column headers.");
        setBatchEmployees([]);
        setSelectedIndices(new Set());
      } else {
        setBatchEmployees(result.employees);
        // Select all by default
        setSelectedIndices(new Set(result.employees.map((_, i) => i)));
      }
    } catch (err: any) {
      console.error("Excel parse failed:", err);
      setErrorMsg("Failed to parse file. Please upload a valid .xlsx or .csv spreadsheet.");
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === batchEmployees.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(batchEmployees.map((_, i) => i)));
    }
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  // Helper for batch runner to update DOM
  const updateRenderDOM = async (emp: PayslipData): Promise<void> => {
    const customized: PayslipData = {
      ...emp,
      companyName: overrideCompany || emp.companyName,
      payPeriodMonth: overrideMonth || emp.payPeriodMonth,
      payPeriodYear: overrideYear || emp.payPeriodYear,
      showStamp: overrideStamp,
      logo: baseCompanyData.logo,
      companyAddress: baseCompanyData.companyAddress,
      cityPincode: baseCompanyData.cityPincode,
    };
    setBatchRenderData(customized);
    await new Promise((resolve) => setTimeout(resolve, 60));
  };

  const getTargetEmployees = (): PayslipData[] => {
    return batchEmployees
      .filter((_, idx) => selectedIndices.has(idx))
      .map((emp) => ({
        ...emp,
        companyName: overrideCompany || emp.companyName,
        payPeriodMonth: overrideMonth || emp.payPeriodMonth,
        payPeriodYear: overrideYear || emp.payPeriodYear,
        showStamp: overrideStamp,
        logo: baseCompanyData.logo,
        companyAddress: baseCompanyData.companyAddress,
        cityPincode: baseCompanyData.cityPincode,
      }));
  };

  const handleDownloadZip = async () => {
    const targets = getTargetEmployees();
    if (targets.length === 0 || !offscreenRef.current) return;

    setIsExporting(true);
    setExportProgress({ current: 0, total: targets.length, message: "Initializing batch..." });

    try {
      await exportBatchAsZip(
        offscreenRef.current,
        targets,
        updateRenderDOM,
        {
          onProgress: (cur, tot, name) => {
            setExportProgress({ current: cur, total: tot, message: name });
          },
        }
      );
    } catch (err) {
      console.error("Batch ZIP export failed:", err);
      alert("Batch export encountered an error. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleDownloadMasterPdf = async () => {
    const targets = getTargetEmployees();
    if (targets.length === 0 || !offscreenRef.current) return;

    setIsExporting(true);
    setExportProgress({ current: 0, total: targets.length, message: "Initializing master document..." });

    try {
      await exportBatchAsCombinedPdf(
        offscreenRef.current,
        targets,
        updateRenderDOM,
        {
          onProgress: (cur, tot, name) => {
            setExportProgress({ current: cur, total: tot, message: name });
          },
        }
      );
    } catch (err) {
      console.error("Master PDF export failed:", err);
      alert("Master PDF export encountered an error. Please try again.");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col p-3 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in duration-150">
      <div className="max-w-5xl w-full mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Bulk Excel Payroll Generator
                </h2>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Batch Mode
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload your company payroll sheet to generate all employee payslips at once
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generateSampleExcelTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
              title="Download standard Excel format with pre-filled sample rows"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Download Excel Template</span>
              <span className="sm:hidden">Template</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. File Upload Dropzone */}
          {batchEmployees.length === 0 && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-900 group-hover:scale-105 transition shadow-xs">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <div className="text-sm font-bold text-slate-800">
                  {parsing ? "Parsing spreadsheet..." : "Click or drag & drop payroll sheet"}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) files
                </p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-maps Employee Code, Basic, HRA, PF, ESIC, Bank details
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 2. When Spreadsheet is Loaded */}
          {batchEmployees.length > 0 && (
            <div className="space-y-4">
              {/* Batch Meta Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {batchEmployees.length}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {file?.name || "Payroll Roster"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedIndices.size} of {batchEmployees.length} employees selected for export
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setBatchEmployees([]);
                      setFile(null);
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Batch Settings Bar (Month, Year, Company) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 text-[11px]">
                    Standardized Company Name
                  </label>
                  <input
                    value={overrideCompany}
                    onChange={(e) => setOverrideCompany(e.target.value)}
                    placeholder="Company Name"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 text-[11px]">
                    Pay Period Month & Year
                  </label>
                  <div className="flex items-center gap-1">
                    <select
                      value={overrideMonth}
                      onChange={(e) => setOverrideMonth(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      value={overrideYear}
                      onChange={(e) => setOverrideYear(e.target.value)}
                      className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 sm:pt-2 px-2">
                  <span className="font-semibold text-slate-700 text-xs">
                    Attach Digital Stamp Seal
                  </span>
                  <input
                    type="checkbox"
                    checked={overrideStamp}
                    onChange={(e) => setOverrideStamp(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                </div>
              </div>

              {/* Parsed Employees Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedIndices.size === batchEmployees.length &&
                              batchEmployees.length > 0
                            }
                            onChange={toggleSelectAll}
                            className="w-3.5 h-3.5 rounded text-slate-900"
                          />
                        </th>
                        <th className="p-2.5">Code</th>
                        <th className="p-2.5">Employee Name</th>
                        <th className="p-2.5">Designation</th>
                        <th className="p-2.5 text-right">Gross (₹)</th>
                        <th className="p-2.5 text-right">Deductions (₹)</th>
                        <th className="p-2.5 text-right">Net Salary (₹)</th>
                        <th className="p-2.5 text-center w-16">Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {batchEmployees.map((emp, idx) => {
                        const gross = emp.earnings.reduce(
                          (s, i) => s + (Number(i.amount) || 0),
                          0
                        );
                        const ded = emp.deductions.reduce(
                          (s, i) => s + (Number(i.amount) || 0),
                          0
                        );
                        const net = Math.max(0, gross - ded);
                        const isSelected = selectedIndices.has(idx);

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50/80 transition ${
                              isSelected ? "bg-slate-50/40" : "opacity-60"
                            }`}
                          >
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(idx)}
                                className="w-3.5 h-3.5 rounded text-slate-900 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 font-mono font-medium text-slate-700">
                              {emp.employeeId}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">
                              {emp.employeeName}
                            </td>
                            <td className="p-2.5 text-slate-600 truncate max-w-[160px]">
                              {emp.designation}
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                              ₹{gross.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold text-rose-600">
                              -₹{ded.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-950">
                              ₹{net.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewEmployee({
                                    ...emp,
                                    companyName: overrideCompany || emp.companyName,
                                    payPeriodMonth: overrideMonth || emp.payPeriodMonth,
                                    payPeriodYear: overrideYear || emp.payPeriodYear,
                                    showStamp: overrideStamp,
                                  })
                                }
                                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                                title="Inspect Payslip Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. Export Progress Indicator */}
          {isExporting && exportProgress && (
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="font-semibold">{exportProgress.message}</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">
                  {Math.round((exportProgress.current / exportProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-150 rounded-full"
                  style={{
                    width: `${Math.round(
                      (exportProgress.current / exportProgress.total) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {batchEmployees.length > 0 ? (
              <span>
                Ready to generate <strong>{selectedIndices.size}</strong> official payslips
              </span>
            ) : (
              <span>Upload an Excel spreadsheet to unlock batch PDF generation</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Export Option 1: ZIP of individual PDFs */}
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={selectedIndices.size === 0 || isExporting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-black disabled:opacity-50 px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Download ZIP (Separate PDFs)</span>
            </button>

            {/* Export Option 2: Combined Multi-Page PDF */}
            <button
              type="button"
              onClick={handleDownloadMasterPdf}
              disabled={selectedIndices.size === 0 || isExporting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Combined Master PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Render Target for DOM Rasterization (Off-screen) */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          width: "794px",
          zIndex: -1,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div ref={offscreenRef} className="bg-white">
          <PayslipPreview data={batchRenderData} />
        </div>
      </div>

      {/* Single Employee Preview Sub-modal */}
      {previewEmployee && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex flex-col p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2 text-xs">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">
                Preview: {previewEmployee.employeeName} ({previewEmployee.employeeId})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewEmployee(null)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex justify-center items-start pb-8">
            <div className="bg-white paper-elevation overflow-hidden max-w-[800px] w-full border border-slate-300">
              <PayslipPreview data={previewEmployee} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
