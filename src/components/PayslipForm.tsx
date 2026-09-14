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
  Shield,
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

  const grossPayable = data.earnings.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalDeductions = data.deductions.reduce((s, i) => s + (Number(i.amount) || 0), 0);

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
                Company Details
              </h3>
              <p className="text-[11px] text-slate-400">
                Company name, address and branding
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
              label="Company Name"
              value={data.companyName}
              onChange={(v) => set("companyName", v)}
              placeholder="e.g. iENERGIZER IT SERVICES PRIVATE LIMITED"
              required
            />
            <FormInput
              label="Company Address"
              value={data.companyAddress}
              onChange={(v) => set("companyAddress", v)}
              placeholder="e.g. A-37, Sector-60"
              icon={MapPin}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
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
                Employee code, name, department, joining date & days
              </p>
            </div>
          </div>
          <User className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Employee Code"
            value={data.employeeId}
            onChange={(v) => set("employeeId", v)}
            placeholder="e.g. T276912"
            required
            icon={FileText}
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
            label="Department / Client"
            value={data.department}
            onChange={(v) => set("department", v)}
            placeholder="e.g. Rapido"
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Joining Date (DD/MM/YYYY)
            </label>
            <input
              type="date"
              value={data.dateOfJoining}
              onChange={(e) => set("dateOfJoining", e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition"
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

        {/* Schedule & Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Payslip Month
            </label>
            <div className="flex items-center gap-1 border border-slate-200/90 rounded-xl px-3 py-1.5 bg-white shadow-xs">
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
                placeholder="2024"
              />
            </div>
          </div>

          <FormInput
            label="Working Days"
            value={data.totalDays}
            onChange={(v) => set("totalDays", v)}
            placeholder="31"
          />

          <FormInput
            label="Paid Days"
            value={data.paidDays}
            onChange={(v) => set("paidDays", v)}
            placeholder="30"
          />

          <FormInput
            label="Loss of Pay (LOP)"
            value={data.lopDays}
            onChange={(v) => set("lopDays", v)}
            placeholder="1"
          />
        </div>
      </div>

      {/* 3. Statutory, Banking & Card Details */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Statutory & Bank Identifiers
              </h3>
              <p className="text-[11px] text-slate-400">
                UAN, ESIC, Bank account, insurance and PAN details
              </p>
            </div>
          </div>
          <CreditCard className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="UAN No"
            value={data.uanNumber}
            onChange={(v) => set("uanNumber", v)}
            placeholder="e.g. 102114127134"
          />
          <FormInput
            label="ESIC No"
            value={data.esicNumber}
            onChange={(v) => set("esicNumber", v)}
            placeholder="e.g. 6723755843"
          />
          <FormInput
            label="Bank Name"
            value={data.bankName}
            onChange={(v) => set("bankName", v)}
            placeholder="e.g. Kotak Bank"
          />
          <FormInput
            label="Bank Account No"
            value={data.bankAccount}
            onChange={(v) => set("bankAccount", v)}
            placeholder="e.g. 247529081"
          />
          <FormInput
            label="Salary Status / Mode"
            value={data.paymentMode}
            onChange={(v) => set("paymentMode", v)}
            placeholder="Bank Transfer"
          />
          <FormInput
            label="PAN No"
            value={data.panNumber}
            onChange={(v) => set("panNumber", v.toUpperCase())}
            placeholder="e.g. -"
          />
          <FormInput
            label="Insurance Card No"
            value={data.insuranceCardNo}
            onChange={(v) => set("insuranceCardNo", v)}
            placeholder="e.g. -"
          />
        </div>
      </div>

      {/* 4. Earnings Ledger (Rate & Payable) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Earnings (Rate & Payable)
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  ₹{grossPayable.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Basic, HRA, and allowances</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addEarning("ALLOWANCE", 0, 0)}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Earning
          </button>
        </div>

        {/* Quick Chips */}
        <div className="flex flex-wrap gap-1.5">
          {["BASIC", "HRA", "SPECIAL ALLOWANCE", "CONVEYANCE", "BONUS"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addEarning(p, 0, 0)}
              className="text-[10px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition"
            >
              + {p}
            </button>
          ))}
        </div>

        {/* Earnings Items */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
            <span className="col-span-5">Component</span>
            <span className="col-span-3 text-right pr-2">Rate (₹)</span>
            <span className="col-span-3 text-right pr-2">Payable (₹)</span>
            <span className="col-span-1" />
          </div>

          {data.earnings.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-2 rounded-xl border border-slate-200"
            >
              <input
                value={item.label}
                onChange={(e) => updateEarning(item.id, { label: e.target.value })}
                placeholder="e.g. BASIC"
                className="col-span-5 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold uppercase"
              />
              <input
                type="number"
                value={item.rate === 0 ? "" : (item.rate ?? "")}
                onChange={(e) =>
                  updateEarning(item.id, { rate: parseFloat(e.target.value) || 0 })
                }
                placeholder="Rate"
                className="col-span-3 px-2.5 py-1.5 text-xs text-right bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
              />
              <input
                type="number"
                value={item.amount === 0 ? "" : item.amount}
                onChange={(e) =>
                  updateEarning(item.id, { amount: parseFloat(e.target.value) || 0 })
                }
                placeholder="Payable"
                className="col-span-3 px-2.5 py-1.5 text-xs text-right bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => removeEarning(item.id)}
                className="col-span-1 p-1 text-slate-400 hover:text-rose-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Deductions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 shadow-xs">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Other Deductions
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  ₹{totalDeductions.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">PF, ESI, Fine, Headset, TDS</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addDeduction("DEDUCTION", 0)}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Deduction
          </button>
        </div>

        {/* Quick Chips */}
        <div className="flex flex-wrap gap-1.5">
          {["PF", "ESI", "HEADSET", "FINE", "TDS", "PROFESSIONAL TAX"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addDeduction(p, 0)}
              className="text-[10px] font-medium bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition"
            >
              + {p}
            </button>
          ))}
        </div>

        {/* Deductions Items */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase px-1">
            <span className="col-span-8">Deduction Description</span>
            <span className="col-span-3 text-right pr-2">Amount (₹)</span>
            <span className="col-span-1" />
          </div>

          {data.deductions.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-2 rounded-xl border border-slate-200"
            >
              <input
                value={item.label}
                onChange={(e) => updateDeduction(item.id, { label: e.target.value })}
                placeholder="e.g. PF"
                className="col-span-8 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold uppercase"
              />
              <input
                type="number"
                value={item.amount === 0 ? "" : item.amount}
                onChange={(e) =>
                  updateDeduction(item.id, { amount: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
                className="col-span-3 px-2.5 py-1.5 text-xs text-right bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => removeDeduction(item.id)}
                className="col-span-1 p-1 text-slate-400 hover:text-rose-600 rounded"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Remarks & Authenticity Options */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 hover:shadow-sm transition-all">
        <FormInput
          label="Remarks Statement"
          value={data.remarks}
          onChange={(v) => set("remarks", v)}
          placeholder="This is a computer generated statement, as such no signature required."
          icon={Shield}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <Stamp className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">
              Optional Circular Payroll Stamp
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.showStamp}
              onChange={(e) => set("showStamp", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-xs" />
          </label>
        </div>
      </div>
    </div>
  );
}
