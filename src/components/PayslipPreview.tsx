import { forwardRef } from "react";
import { PayslipData } from "@/types/payslip";
import { amountInWords } from "@/lib/numberToWords";
import { Building2 } from "lucide-react";

interface Props {
  data: PayslipData;
}

function formatCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `₹ ${safe.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PayslipPreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const grossEarnings = (data.earnings || []).reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  const totalDeductions = (data.deductions || []).reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  // Pad items so Earnings & Deductions columns are balanced and look like a real corporate sheet
  const maxRows = Math.max(
    (data.earnings || []).length,
    (data.deductions || []).length,
    5
  );
  const earningsList = [...(data.earnings || [])];
  const deductionsList = [...(data.deductions || [])];

  return (
    <div
      ref={ref}
      id="payslip-print-target"
      className="bg-white text-slate-900 mx-auto select-none font-sans"
      style={{
        width: "100%",
        maxWidth: "794px", // Standard A4 width ratio
        backgroundColor: "#ffffff",
        color: "#0f172a",
        padding: "32px 36px",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Header: Authentic Corporate Letterhead */}
      <div className="pb-4 border-b-2 border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {data.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logo}
                alt="Company Logo"
                className="w-16 h-16 object-contain shrink-0 border border-slate-200 p-1"
              />
            ) : (
              <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0 rounded-none border border-slate-900">
                {data.companyName ? data.companyName.charAt(0).toUpperCase() : <Building2 className="w-6 h-6" />}
              </div>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase font-serif">
                {data.companyName || "DATATRACK TECHNOLOGIES PRIVATE LIMITED"}
              </h1>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {[data.companyAddress, data.cityPincode, data.country]
                  .filter(Boolean)
                  .join(", ") || "Corporate Tech Park, Outer Ring Road, Bengaluru - 560103, India"}
              </p>
              {(data.cinNumber || data.gstin) && (
                <p className="text-[10px] text-slate-500 mt-1 font-mono tracking-wide">
                  {data.cinNumber && <span>CIN: {data.cinNumber}</span>}
                  {data.cinNumber && data.gstin && <span> | </span>}
                  {data.gstin && <span>GSTIN: {data.gstin}</span>}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 border-l border-slate-300 pl-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              FORM 12-B / HR-DOC
            </span>
            <span className="text-xs font-mono text-slate-700 block mt-0.5">
              Ref: DT/PAY/{data.payPeriodYear}/{data.employeeId || "001"}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              Pay Date: <strong className="text-slate-800">{formatDate(data.payDate)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Payslip Month Title Bar */}
      <div className="bg-slate-100 border-x border-b border-slate-300 py-1.5 px-4 my-0 text-center">
        <h2 className="text-xs sm:text-sm font-bold tracking-widest text-slate-900 uppercase">
          PAYSLIP FOR THE MONTH OF {data.payPeriodMonth} {data.payPeriodYear}
        </h2>
      </div>

      {/* 3. Employee Master & Statutory Details Table (Authentic 4-column Grid) */}
      <div className="mt-3 border border-slate-300 text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="w-1/4 py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Employee Code
              </td>
              <td className="w-1/4 py-1.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-300">
                {data.employeeId || "DT-8429"}
              </td>
              <td className="w-1/4 py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Employee Name
              </td>
              <td className="w-1/4 py-1.5 px-3 font-bold text-slate-900 uppercase">
                {data.employeeName || "ADITYA R. SHARMA"}
              </td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Designation
              </td>
              <td className="py-1.5 px-3 text-slate-800 border-r border-slate-300">
                {data.designation || "Senior Software Engineer"}
              </td>
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Department
              </td>
              <td className="py-1.5 px-3 text-slate-800">
                {data.department || "Enterprise Cloud Platforms"}
              </td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Date of Joining
              </td>
              <td className="py-1.5 px-3 text-slate-800 border-r border-slate-300 font-mono">
                {formatDate(data.dateOfJoining)}
              </td>
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Location / Branch
              </td>
              <td className="py-1.5 px-3 text-slate-800">
                {data.location || "Bengaluru, India"}
              </td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Bank Name
              </td>
              <td className="py-1.5 px-3 text-slate-800 border-r border-slate-300">
                {data.bankName || "HDFC Bank Ltd."}
              </td>
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Bank A/C Number
              </td>
              <td className="py-1.5 px-3 font-mono font-medium text-slate-900">
                {data.bankAccount || "••••••••4892"}
              </td>
            </tr>

            <tr className="border-b border-slate-200">
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                PAN Number
              </td>
              <td className="py-1.5 px-3 font-mono font-semibold text-slate-900 uppercase border-r border-slate-300">
                {data.panNumber || "ABCDE1234F"}
              </td>
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                Payment Mode
              </td>
              <td className="py-1.5 px-3 text-slate-800">
                {data.paymentMode || "Direct Bank Transfer (NEFT)"}
              </td>
            </tr>

            <tr>
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                UAN (Universal A/C)
              </td>
              <td className="py-1.5 px-3 font-mono text-slate-800 border-r border-slate-300">
                {data.uanNumber || "101234567890"}
              </td>
              <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-600 border-r border-slate-300">
                PF Account Number
              </td>
              <td className="py-1.5 px-3 font-mono text-slate-800">
                {data.pfNumber || "KN/BNG/0048921/000/0842"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Attendance Summary Strip */}
      <div className="mt-2 border border-slate-300 bg-slate-50/80 text-xs">
        <div className="grid grid-cols-3 divide-x divide-slate-300 text-center py-1.5">
          <div>
            <span className="text-slate-500 font-medium">Calendar Days: </span>
            <span className="font-bold text-slate-900 font-mono">{data.totalDays || "30"}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Days Worked / Paid: </span>
            <span className="font-bold text-slate-900 font-mono">{data.paidDays || "30"}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Loss of Pay (LOP): </span>
            <span className="font-bold text-slate-900 font-mono">{data.lopDays || "0"}</span>
          </div>
        </div>
      </div>

      {/* 5. Salary Ledger: Earnings vs Deductions Table */}
      <div className="mt-3 border border-slate-300">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-200/90 text-slate-900 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2 px-3 text-left w-[35%] border-r border-slate-300">
                Earnings
              </th>
              <th className="py-2 px-3 text-right w-[15%] border-r border-slate-300">
                Amount (₹)
              </th>
              <th className="py-2 px-3 text-left w-[35%] border-r border-slate-300">
                Deductions
              </th>
              <th className="py-2 px-3 text-right w-[15%]">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, idx) => {
              const earn = earningsList[idx];
              const ded = deductionsList[idx];
              return (
                <tr
                  key={idx}
                  className={`border-b border-slate-200 ${
                    idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                  }`}
                >
                  {/* Earnings Item */}
                  <td className="py-1.5 px-3 text-slate-800 border-r border-slate-300">
                    {earn ? earn.label : ""}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-900 border-r border-slate-300">
                    {earn ? Number(earn.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : ""}
                  </td>

                  {/* Deductions Item */}
                  <td className="py-1.5 px-3 text-slate-800 border-r border-slate-300">
                    {ded ? ded.label : ""}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-900">
                    {ded ? Number(ded.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : ""}
                  </td>
                </tr>
              );
            })}

            {/* Total Subtotal Row */}
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-xs text-slate-900">
              <td className="py-2 px-3 border-r border-slate-300 uppercase">
                Total Gross Earnings (A)
              </td>
              <td className="py-2 px-3 text-right font-mono border-r border-slate-300">
                {formatCurrency(grossEarnings)}
              </td>
              <td className="py-2 px-3 border-r border-slate-300 uppercase">
                Total Deductions (B)
              </td>
              <td className="py-2 px-3 text-right font-mono">
                {formatCurrency(totalDeductions)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Net Salary & Amount in Words Card */}
      <div className="mt-3 border-2 border-slate-800 bg-slate-50 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Take Home Pay (Net Payable)
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-slate-950">
              NET PAY (A - B): {formatCurrency(netPay)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-medium block">
              Mode of Disbursement
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {data.paymentMode || "Direct Deposit (NEFT)"}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-300 text-xs">
          <span className="text-slate-600 font-semibold">Amount in Words: </span>
          <span className="font-bold text-slate-900 italic font-serif">
            {amountInWords(netPay)}
          </span>
        </div>
      </div>

      {/* 7. Corporate Seal & Signatures Block */}
      <div className="mt-6 pt-3 grid grid-cols-2 gap-6 items-end relative">
        {/* Left: Employee Notes & Disclaimer */}
        <div className="text-[10px] text-slate-500 space-y-1 leading-relaxed">
          <p className="font-semibold text-slate-700">Important Statutory Notice:</p>
          <p>
            1. Income tax computation is based on employee declared tax regimes under Section 115BAC / Old Regime.
          </p>
          <p>
            2. This voucher is an official document of earnings issued for statutory, banking, and tax verification.
          </p>
          <p className="pt-2 font-mono text-slate-400">
            ** This is a system-authenticated digital record generated via DataTrack Payroll Engine. **
          </p>
        </div>

        {/* Right: Official Corporate Seal & Employer Authorization */}
        <div className="flex flex-col items-end relative">
          {/* Realistic Circular Corporate Seal / Stamp */}
          {data.showStamp && (
            <div
              className="absolute -top-12 right-20 pointer-events-none select-none opacity-85"
              style={{ transform: "rotate(-8deg)" }}
            >
              <div className="w-24 h-24 rounded-full border-2 border-double border-indigo-800 p-1 flex flex-col items-center justify-center text-center shadow-xs bg-indigo-50/20 backdrop-blur-[0.5px]">
                <div className="w-full h-full rounded-full border border-indigo-700 flex flex-col items-center justify-center p-1">
                  <span className="text-[7px] font-black text-indigo-900 uppercase tracking-tighter leading-none">
                    {data.companyName ? data.companyName.slice(0, 18) : "DATATRACK TECH"}
                  </span>
                  <span className="text-[8px] my-0.5 font-black text-indigo-800 tracking-wider">
                    ★ VERIFIED ★
                  </span>
                  <span className="text-[6px] font-bold text-indigo-700 uppercase tracking-tighter leading-none">
                    PAYROLL DIVISION
                  </span>
                  <span className="text-[6px] font-mono text-indigo-900 mt-0.5">
                    {data.payPeriodMonth.slice(0, 3).toUpperCase()} {data.payPeriodYear}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-right w-56 pt-6">
            <p className="text-[11px] font-bold text-slate-900 uppercase">
              For {data.companyName || "DATATRACK TECHNOLOGIES PVT. LTD."}
            </p>
            <div className="h-10 flex items-end justify-end pb-1">
              <span className="font-serif italic text-sm text-indigo-900 font-bold">
                Authorized Signatory
              </span>
            </div>
            <div className="border-b border-slate-500 w-full mb-1" />
            <p className="text-[10px] text-slate-500 font-medium">
              Head of Human Resources / Payroll
            </p>
          </div>
        </div>
      </div>

      {/* 8. Footer Bar */}
      <div className="mt-6 pt-2 border-t border-slate-300 text-center flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Powered by DataTrack Enterprise HRMS</span>
        <span>Page 1 of 1</span>
        <span>Strictly Private & Confidential</span>
      </div>
    </div>
  );
});

PayslipPreview.displayName = "PayslipPreview";
export default PayslipPreview;
