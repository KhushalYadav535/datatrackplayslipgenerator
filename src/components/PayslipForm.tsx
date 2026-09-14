"use client";

import { ChangeEvent, useRef } from "react";
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
  BadgeCheck,
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
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 tracking-tight">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400 font-normal">{hint}</span>}
      </div>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <input
          type={type}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${
            Icon ? "pl-9" : "px-3.5"
          } pr-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200`}
        />
      </div>
    </div>
  );
}

function LineItemsEditor({
  title,
  subtitle,
  items,
  onChange,
  addLabel,
  icon: Icon,
  badgeColor,
  presetSuggestions,
}: {
  title: string;
  subtitle: string;
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  addLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  presetSuggestions: string[];
}) {
  const update = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const remove = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  const add = (customLabel = "") => {
    onChange([...items, { id: makeId(), label: customLabel, amount: 0 }]);
  };

  const columnTotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shadow-xs ${badgeColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {title}
              </h4>
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                ₹{columnTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => add()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/90 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap gap-1.5">
        {presetSuggestions.map((preset) => {
          const alreadyExists = items.some(
            (i) => i.label.toLowerCase() === preset.toLowerCase()
          );
          if (alreadyExists) return null;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => add(preset)}
              className="text-[10px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-all duration-150 cursor-pointer active:scale-95"
            >
              + {preset}
            </button>
          );
        })}
      </div>

      {/* Item List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 bg-slate-50/80 hover:bg-white p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all duration-150"
          >
            <input
              value={item.label}
              onChange={(e) => update(item.id, { label: e.target.value })}
              placeholder="e.g. Basic Pay"
              className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <div className="relative w-32 shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                value={item.amount === 0 ? "" : item.amount}
                onChange={(e) =>
                  update(item.id, { amount: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="w-full pl-7 pr-3 py-1.5 text-xs sm:text-sm text-right bg-white border border-slate-200/90 rounded-lg text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PayslipForm({ data, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="space-y-6">
      {/* 1. Employer / Company Master Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Employer Legal Entity
              </h3>
              <p className="text-[11px] text-slate-400">
                Official corporate details for letterhead & regulatory display
              </p>
            </div>
          </div>
          <Building2 className="w-4 h-4 text-slate-400" />
        </div>

        {/* Logo and Name */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="relative shrink-0">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {data.logo ? (
              <div className="relative group w-24 h-24 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.logo}
                  alt="Uploaded Logo"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={clearLogo}
                  className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-85 hover:opacity-100 transition shadow-sm cursor-pointer"
                  title="Remove Logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 bg-slate-50/70 hover:bg-indigo-50/30 transition-all duration-200 group cursor-pointer"
              >
                <Upload className="w-5 h-5 mb-1 group-hover:-translate-y-0.5 transition" />
                <span className="text-[10px] font-bold">Logo</span>
                <span className="text-[9px] text-slate-400">PNG / JPG</span>
              </button>
            )}
          </div>

          <div className="flex-1 w-full space-y-3">
            <FormInput
              label="Company Registered Legal Name"
              value={data.companyName}
              onChange={(v) => set("companyName", v)}
              placeholder="e.g. DATATRACK TECHNOLOGIES PRIVATE LIMITED"
              required
            />
            <FormInput
              label="Registered Corporate Address"
              value={data.companyAddress}
              onChange={(v) => set("companyAddress", v)}
              placeholder="e.g. Building 4B, Outer Ring Road Tech Zone, Bellandur"
              icon={MapPin}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <FormInput
            label="City, State & Pincode"
            value={data.cityPincode}
            onChange={(v) => set("cityPincode", v)}
            placeholder="e.g. Bengaluru, Karnataka - 560103"
          />
          <FormInput
            label="Country"
            value={data.country}
            onChange={(v) => set("country", v)}
            placeholder="India"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
          <FormInput
            label="Corporate ID Number (CIN)"
            value={data.cinNumber}
            onChange={(v) => set("cinNumber", v)}
            placeholder="e.g. U72200KA2020PTC138942"
            hint="Optional"
          />
          <FormInput
            label="Company GSTIN"
            value={data.gstin}
            onChange={(v) => set("gstin", v)}
            placeholder="e.g. 29AABCD1234F1Z8"
            hint="Optional"
          />
        </div>
      </div>

      {/* 2. Employee Profile & Attendance */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Employee Profile & Attendance
              </h3>
              <p className="text-[11px] text-slate-400">
                Staff designation, join date & attendance cycle records
              </p>
            </div>
          </div>
          <User className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Employee Full Name"
            value={data.employeeName}
            onChange={(v) => set("employeeName", v)}
            placeholder="e.g. Aditya R. Sharma"
            required
            icon={User}
          />
          <FormInput
            label="Employee ID / Staff Code"
            value={data.employeeId}
            onChange={(v) => set("employeeId", v)}
            placeholder="e.g. DT-8429"
            required
            icon={FileText}
          />
          <FormInput
            label="Designation / Job Role"
            value={data.designation}
            onChange={(v) => set("designation", v)}
            placeholder="e.g. Senior Software Engineer"
          />
          <FormInput
            label="Department / Business Unit"
            value={data.department}
            onChange={(v) => set("department", v)}
            placeholder="e.g. Enterprise Cloud Platforms"
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Date of Joining (DOJ)
            </label>
            <input
              type="date"
              value={data.dateOfJoining}
              onChange={(e) => set("dateOfJoining", e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition"
            />
          </div>
          <FormInput
            label="Work Location / Branch"
            value={data.location}
            onChange={(v) => set("location", v)}
            placeholder="e.g. Bengaluru, India"
            icon={MapPin}
          />
        </div>

        {/* Schedule & Attendance Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Pay Month & Year
            </label>
            <div className="flex items-center gap-1 border border-slate-200/90 rounded-xl px-3 py-1.5 bg-white shadow-xs focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/10 transition">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={data.payPeriodMonth}
                onChange={(e) => set("payPeriodMonth", e.target.value)}
                className="text-xs sm:text-sm bg-transparent font-semibold text-slate-800 focus:outline-none w-full cursor-pointer"
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
                className="w-14 text-xs sm:text-sm bg-transparent font-mono font-bold text-slate-800 focus:outline-none text-right"
                placeholder="2026"
              />
            </div>
          </div>

          <FormInput
            label="Calendar Days"
            value={data.totalDays}
            onChange={(v) => set("totalDays", v)}
            placeholder="30"
          />

          <FormInput
            label="Paid Working Days"
            value={data.paidDays}
            onChange={(v) => set("paidDays", v)}
            placeholder="30"
          />

          <FormInput
            label="Loss of Pay (LOP)"
            value={data.lopDays}
            onChange={(v) => set("lopDays", v)}
            placeholder="0"
          />
        </div>

        <div className="pt-1">
          <div className="space-y-1.5 max-w-sm">
            <label className="block text-xs font-semibold text-slate-700">
              Salary Credit / Pay Date
            </label>
            <input
              type="date"
              value={data.payDate}
              onChange={(e) => set("payDate", e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition"
            />
          </div>
        </div>
      </div>

      {/* 3. Statutory, Banking & Tax Identifiers */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Banking & Statutory Identifiers
              </h3>
              <p className="text-[11px] text-slate-400">
                PAN, UAN, PF account and direct deposit information
              </p>
            </div>
          </div>
          <CreditCard className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Bank Name"
            value={data.bankName}
            onChange={(v) => set("bankName", v)}
            placeholder="e.g. HDFC Bank Ltd."
          />
          <FormInput
            label="Bank A/C Number"
            value={data.bankAccount}
            onChange={(v) => set("bankAccount", v)}
            placeholder="e.g. 50100492817291"
          />
          <FormInput
            label="Permanent Account Number (PAN)"
            value={data.panNumber}
            onChange={(v) => set("panNumber", v.toUpperCase())}
            placeholder="e.g. ABCDE1234F"
          />
          <FormInput
            label="Payment Mode"
            value={data.paymentMode}
            onChange={(v) => set("paymentMode", v)}
            placeholder="Direct Bank Transfer (NEFT)"
          />
          <FormInput
            label="Universal Account Number (UAN)"
            value={data.uanNumber}
            onChange={(v) => set("uanNumber", v)}
            placeholder="e.g. 101234567890"
          />
          <FormInput
            label="Provident Fund (PF) Number"
            value={data.pfNumber}
            onChange={(v) => set("pfNumber", v)}
            placeholder="e.g. KN/BNG/0048921/000/0842"
          />
        </div>
      </div>

      {/* 4. Salary Structure: Earnings & Deductions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 text-xs font-bold flex items-center justify-center">
            4
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Salary Structure Ledgers
            </h3>
            <p className="text-[11px] text-slate-400">
              Itemized monthly credits (earnings) and debits (statutory deductions)
            </p>
          </div>
        </div>

        <LineItemsEditor
          title="Earnings Ledger (A)"
          subtitle="Fixed pay, statutory allowances, and variable incentives"
          items={data.earnings}
          onChange={(items) => set("earnings", items)}
          addLabel="Add Earning"
          icon={TrendingUp}
          badgeColor="bg-emerald-50 text-emerald-700"
          presetSuggestions={[
            "Basic Salary",
            "House Rent Allowance (HRA)",
            "Special Allowance",
            "Conveyance Allowance",
            "Medical Allowance",
            "Performance Incentive",
            "Overtime Allowance",
          ]}
        />

        <hr className="border-slate-100" />

        <LineItemsEditor
          title="Deductions Ledger (B)"
          subtitle="EPF contributions, professional taxes & income tax TDS"
          items={data.deductions}
          onChange={(items) => set("deductions", items)}
          addLabel="Add Deduction"
          icon={TrendingDown}
          badgeColor="bg-rose-50 text-rose-700"
          presetSuggestions={[
            "Employee Provident Fund (EPF)",
            "Professional Tax (PT)",
            "Tax Deducted at Source (TDS)",
            "Group Health Insurance",
            "Voluntary PF (VPF)",
            "Staff Loan Recovery",
          ]}
        />
      </div>

      {/* 5. Document Authenticity Options */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex items-center justify-between hover:shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
            <Stamp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-900">
                Official Corporate Payroll Seal
              </p>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Imprint authentic circular authentication seal on the issued PDF
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.showStamp}
            onChange={(e) => set("showStamp", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-xs" />
        </label>
      </div>
    </div>
  );
}
