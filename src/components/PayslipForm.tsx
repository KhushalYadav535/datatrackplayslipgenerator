"use client";

import { ChangeEvent, useRef, useState } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Calendar,
  Building2,
  User,
  CreditCard,
  TrendingUp,
  TrendingDown,
  X,
  Stamp,
  MapPin,
  FileText,
  ShieldCheck,
  Calculator,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Percent,
} from "lucide-react";
import { PayslipData, LineItem, MONTHS, makeId } from "@/types/payslip";

interface Props {
  data: PayslipData;
  onChange: (data: PayslipData) => void;
}

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  prefix?: string;
  monospace?: boolean;
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
  hint,
  prefix,
  monospace = false,
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 tracking-tight">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400 font-normal">{hint}</span>}
      </div>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        {prefix && (
          <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${
            Icon ? "pl-9" : prefix ? "pl-7" : "px-3"
          } pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition duration-150 ${
            monospace ? "font-mono font-medium tracking-tight tabular-nums" : ""
          }`}
        />
      </div>
    </div>
  );
}

export default function PayslipForm({ data, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"company_emp" | "salary" | "statutory">("company_emp");

  const set = <K extends keyof PayslipData>(key: K, value: PayslipData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("logo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    set("logo", null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Earnings handlers
  const updateEarning = (id: string, patch: Partial<LineItem>) => {
    set(
      "earnings",
      data.earnings.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };
  const removeEarning = (id: string) => {
    set(
      "earnings",
      data.earnings.filter((it) => it.id !== id)
    );
  };
  const addEarning = (label = "", rate = 0, amount = 0) => {
    set("earnings", [
      ...data.earnings,
      { id: makeId(), label, rate, amount },
    ]);
  };

  // Deductions handlers
  const updateDeduction = (id: string, patch: Partial<LineItem>) => {
    set(
      "deductions",
      data.deductions.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };
  const removeDeduction = (id: string) => {
    set(
      "deductions",
      data.deductions.filter((it) => it.id !== id)
    );
  };
  const addDeduction = (label = "", amount = 0) => {
    set("deductions", [...data.deductions, { id: makeId(), label, amount }]);
  };

  // One-click statutory calculator helpers (standard Indian payroll rules)
  const basicEarning = data.earnings.find(
    (e) => e.label.toUpperCase().includes("BASIC")
  );
  const basicAmount = basicEarning ? Number(basicEarning.amount) || 0 : 0;

  const handleApplyStandardPF = () => {
    if (basicAmount <= 0) return;
    const pfVal = Math.round(Math.min(basicAmount, 15000) * 0.12);
    const existingPf = data.deductions.find((d) => d.label.toUpperCase() === "PF");
    if (existingPf) {
      updateDeduction(existingPf.id, { amount: pfVal });
    } else {
      addDeduction("PF", pfVal);
    }
  };

  const handleApplyStandardESIC = () => {
    const grossVal = data.earnings.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    if (grossVal > 21000) return; // ESIC applicable up to 21,000 gross
    const esicVal = Math.ceil(grossVal * 0.0075);
    const existingEsic = data.deductions.find((d) => d.label.toUpperCase() === "ESI");
    if (existingEsic) {
      updateDeduction(existingEsic.id, { amount: esicVal });
    } else {
      addDeduction("ESI", esicVal);
    }
  };

  const grossPayable = data.earnings.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalDeductions = data.deductions.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const netPay = Math.max(0, grossPayable - totalDeductions);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Executive Segmented Navigation Tabs */}
      <div className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 flex items-center gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("company_emp")}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === "company_emp"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Profile & Dates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("salary")}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === "salary"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Salary Ledger</span>
          <span className="ml-1 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
            {data.earnings.length + data.deductions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("statutory")}
          className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === "statutory"
              ? "bg-white text-slate-900 shadow-2xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Compliance & Bank</span>
        </button>
      </div>

      {/* TAB 1: Company Profile, Employee & Schedule */}
      {activeTab === "company_emp" && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Company Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Employer Entity
                </h3>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Header Branding</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 items-start">
              {/* Logo Box */}
              <div className="relative shrink-0">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                {data.logo ? (
                  <div className="relative group w-20 h-20 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1.5 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.logo}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer"
                      title="Remove Logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 border border-dashed border-slate-300 hover:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100/60 transition group cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mb-1 group-hover:-translate-y-0.5 transition" />
                    <span className="text-[10px] font-semibold">Upload</span>
                    <span className="text-[9px] text-slate-400">Logo</span>
                  </button>
                )}
              </div>

              <div className="flex-1 w-full space-y-2.5">
                <FormInput
                  label="Registered Company Name"
                  value={data.companyName}
                  onChange={(v) => set("companyName", v)}
                  placeholder="e.g. iENERGIZER IT SERVICES PRIVATE LIMITED"
                  required
                />
                <FormInput
                  label="Registered Address"
                  value={data.companyAddress}
                  onChange={(v) => set("companyAddress", v)}
                  placeholder="e.g. A-37, Sector-60"
                  icon={MapPin}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <FormInput
                label="City & Pincode"
                value={data.cityPincode}
                onChange={(v) => set("cityPincode", v)}
                placeholder="e.g. Noida-201301"
              />
              <FormInput
                label="Country"
                value={data.country}
                onChange={(v) => set("country", v)}
                placeholder="India"
              />
            </div>
          </div>

          {/* Employee Master Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Employee Identity & Assignment
                </h3>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Official Record</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Employee Code"
                value={data.employeeId}
                onChange={(v) => set("employeeId", v)}
                placeholder="e.g. T276912"
                required
                icon={FileText}
                monospace
              />
              <FormInput
                label="Employee Name"
                value={data.employeeName}
                onChange={(v) => set("employeeName", v)}
                placeholder="e.g. Khushal Yadav"
                required
                icon={User}
              />
              <FormInput
                label="Designation"
                value={data.designation}
                onChange={(v) => set("designation", v)}
                placeholder="e.g. Assistant Executive Customer Service"
              />
              <FormInput
                label="Department / Client Unit"
                value={data.department}
                onChange={(v) => set("department", v)}
                placeholder="e.g. Rapido / Operations"
                icon={Briefcase}
              />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={data.dateOfJoining}
                  onChange={(e) => set("dateOfJoining", e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition font-mono"
                />
              </div>
              <FormInput
                label="Work Location"
                value={data.location}
                onChange={(v) => set("location", v)}
                placeholder="e.g. Noida"
                icon={MapPin}
              />
            </div>
          </div>

          {/* Schedule & Days */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Pay Period & Attendance Schedule
                </h3>
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-500">
                {data.paidDays} / {data.totalDays} Days Paid
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Period Month & Year
                </label>
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white shadow-2xs">
                  <select
                    value={data.payPeriodMonth}
                    onChange={(e) => set("payPeriodMonth", e.target.value)}
                    className="text-xs bg-transparent font-semibold text-slate-900 focus:outline-none w-full cursor-pointer"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    value={data.payPeriodYear}
                    onChange={(e) => set("payPeriodYear", e.target.value)}
                    className="w-12 text-xs bg-transparent font-mono font-bold text-slate-900 focus:outline-none text-right"
                    placeholder="2024"
                  />
                </div>
              </div>

              <FormInput
                label="Working Days"
                value={data.totalDays}
                onChange={(v) => set("totalDays", v)}
                placeholder="31"
                monospace
              />

              <FormInput
                label="Paid Days"
                value={data.paidDays}
                onChange={(v) => set("paidDays", v)}
                placeholder="30"
                monospace
              />

              <FormInput
                label="Loss of Pay (LOP)"
                value={data.lopDays}
                onChange={(v) => set("lopDays", v)}
                placeholder="1"
                monospace
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab("salary")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-black bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition"
              >
                <span>Proceed to Salary Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Salary Ledger (Earnings & Deductions) */}
      {activeTab === "salary" && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Quick Calculations Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
                ₹
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Net Monthly Disbursal
                </div>
                <div className="text-lg font-bold font-mono text-white tracking-tight">
                  ₹{netPay.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleApplyStandardPF}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition text-[11px] font-medium"
                title="Compute standard 12% PF on Basic"
              >
                <Percent className="w-3 h-3 text-indigo-400" />
                <span>Calc PF (12%)</span>
              </button>
              {grossPayable <= 21000 && (
                <button
                  type="button"
                  onClick={handleApplyStandardESIC}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition text-[11px] font-medium"
                  title="Compute standard 0.75% ESIC on Gross"
                >
                  <Percent className="w-3 h-3 text-emerald-400" />
                  <span>Calc ESIC (0.75%)</span>
                </button>
              )}
            </div>
          </div>

          {/* Earnings Ledger */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Earnings Components
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  Gross: ₹{grossPayable.toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  onClick={() => addEarning("ALLOWANCE", 0, 0)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-md transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>

            {/* Quick Component Chips */}
            <div className="flex flex-wrap gap-1">
              {["BASIC", "HRA", "SPECIAL ALLOWANCE", "CONVEYANCE", "BONUS"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => addEarning(p, 0, 0)}
                  className="text-[10px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition"
                >
                  + {p}
                </button>
              ))}
            </div>

            {/* Earnings Rows */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                <span className="col-span-5">Component Name</span>
                <span className="col-span-3 text-right pr-2">Rate (₹)</span>
                <span className="col-span-3 text-right pr-2">Payable (₹)</span>
                <span className="col-span-1" />
              </div>

              {data.earnings.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50/70 hover:bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 transition"
                >
                  <input
                    value={item.label}
                    onChange={(e) => updateEarning(item.id, { label: e.target.value })}
                    placeholder="e.g. BASIC"
                    className="col-span-5 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 font-semibold uppercase tracking-tight focus:outline-none focus:border-slate-800"
                  />
                  <input
                    type="number"
                    value={item.rate === 0 ? "" : (item.rate ?? "")}
                    onChange={(e) =>
                      updateEarning(item.id, { rate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Rate"
                    className="col-span-3 px-2.5 py-1.5 text-xs text-right bg-white border border-slate-200 rounded-md text-slate-800 font-mono tabular-nums focus:outline-none focus:border-slate-800"
                  />
                  <input
                    type="number"
                    value={item.amount === 0 ? "" : item.amount}
                    onChange={(e) =>
                      updateEarning(item.id, { amount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Payable"
                    className="col-span-3 px-2.5 py-1.5 text-xs text-right bg-white border border-slate-200 rounded-md text-slate-900 font-mono font-bold tabular-nums focus:outline-none focus:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeEarning(item.id)}
                    className="col-span-1 p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Delete row"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions Ledger */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Statutory & Other Deductions
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                  Total: ₹{totalDeductions.toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  onClick={() => addDeduction("DEDUCTION", 0)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-md transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>

            {/* Quick Deduction Chips */}
            <div className="flex flex-wrap gap-1">
              {["PF", "ESI", "HEADSET", "FINE", "TDS", "PROFESSIONAL TAX"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => addDeduction(p, 0)}
                  className="text-[10px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition"
                >
                  + {p}
                </button>
              ))}
            </div>

            {/* Deductions Rows */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
                <span className="col-span-8">Deduction Description</span>
                <span className="col-span-3 text-right pr-2">Amount (₹)</span>
                <span className="col-span-1" />
              </div>

              {data.deductions.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50/70 hover:bg-slate-50 p-1.5 rounded-lg border border-slate-200/80 transition"
                >
                  <input
                    value={item.label}
                    onChange={(e) => updateDeduction(item.id, { label: e.target.value })}
                    placeholder="e.g. PF"
                    className="col-span-8 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-900 font-semibold uppercase tracking-tight focus:outline-none focus:border-slate-800"
                  />
                  <input
                    type="number"
                    value={item.amount === 0 ? "" : item.amount}
                    onChange={(e) =>
                      updateDeduction(item.id, { amount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    className="col-span-3 px-2.5 py-1.5 text-xs text-right bg-white border border-slate-200 rounded-md text-slate-900 font-mono font-bold tabular-nums focus:outline-none focus:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeDeduction(item.id)}
                    className="col-span-1 p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Delete row"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("company_emp")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("statutory")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-black bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg transition"
              >
                <span>Compliance & Bank</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Statutory & Banking Details */}
      {activeTab === "statutory" && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Statutory & Disbursal Accounts
                </h3>
              </div>
              <span className="text-[10px] font-medium text-slate-400">EPFO / ESIC / Banking</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="UAN Number"
                value={data.uanNumber}
                onChange={(v) => set("uanNumber", v)}
                placeholder="e.g. 102114127134"
                monospace
              />
              <FormInput
                label="ESIC Number"
                value={data.esicNumber}
                onChange={(v) => set("esicNumber", v)}
                placeholder="e.g. 6723755843"
                monospace
              />
              <FormInput
                label="Bank Name"
                value={data.bankName}
                onChange={(v) => set("bankName", v)}
                placeholder="e.g. Kotak Bank"
              />
              <FormInput
                label="Bank Account Number"
                value={data.bankAccount}
                onChange={(v) => set("bankAccount", v)}
                placeholder="e.g. 247529081"
                monospace
              />
              <FormInput
                label="Salary Status / Payment Mode"
                value={data.paymentMode}
                onChange={(v) => set("paymentMode", v)}
                placeholder="Bank Transfer"
              />
              <FormInput
                label="PAN Number"
                value={data.panNumber}
                onChange={(v) => set("panNumber", v.toUpperCase())}
                placeholder="e.g. -"
                monospace
              />
              <FormInput
                label="Insurance Card Number"
                value={data.insuranceCardNo}
                onChange={(v) => set("insuranceCardNo", v)}
                placeholder="e.g. -"
                monospace
              />
              <FormInput
                label="Company CIN / Registration"
                value={data.cinNumber}
                onChange={(v) => set("cinNumber", v)}
                placeholder="e.g. U72200DL2000PTC107563"
                monospace
              />
            </div>
          </div>

          {/* Compliance Remarks & Seal */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Authentication & Remarks
                </h3>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Document Endorsement</span>
            </div>

            <FormInput
              label="Compliance Disclaimer / Remarks"
              value={data.remarks}
              onChange={(v) => set("remarks", v)}
              placeholder="This is a computer generated statement, as such no signature required."
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <Stamp className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Circular Payroll Seal
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Include digital verified seal watermark at document footer
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showStamp}
                  onChange={(e) => set("showStamp", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900 shadow-2xs" />
              </label>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={() => setActiveTab("salary")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1.5 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Salary Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
