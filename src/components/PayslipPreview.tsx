import { forwardRef } from "react";
import { PayslipData } from "@/types/payslip";
import { amountInWords } from "@/lib/numberToWords";
import { Building2 } from "lucide-react";

interface Props {
  data: PayslipData;
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const PayslipPreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const grossPayable = (data.earnings || []).reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  const totalRate = (data.earnings || []).reduce(
    (s, i) => s + (Number(i.rate ?? i.amount) || 0),
    0
  );
  const totalDeductions = (data.deductions || []).reduce(
    (s, i) => s + (Number(i.amount) || 0),
    0
  );
  const netPay = Math.max(0, grossPayable - totalDeductions);

  const earningsList = data.earnings || [];
  const deductionsList = data.deductions || [];

  return (
    <div
      ref={ref}
      id="payslip-print-target"
      className="bg-white text-black mx-auto select-none font-sans"
      style={{
        width: "100%",
        maxWidth: "794px",
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: "24px 32px",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* 1. Header: Logo & Company Name */}
      <div className="flex items-center justify-between pb-2.5">
        <div className="w-28 shrink-0">
          {data.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logo}
              alt="Company Logo"
              className="max-h-12 max-w-full object-contain"
            />
          ) : (
            <div className="flex items-center gap-1.5 text-slate-950 font-bold text-sm tracking-tight">
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-extrabold text-[11px] shrink-0">
                {data.companyName ? data.companyName.charAt(0) : "D"}
              </div>
              <span className="truncate max-w-[90px] uppercase font-extrabold text-xs">
                {data.companyName ? data.companyName.split(" ")[0] : "DATATRACK"}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 text-center pr-12">
          <h1 className="text-sm sm:text-base font-bold text-black uppercase tracking-tight">
            {data.companyName || "iENERGIZER IT SERVICES PRIVATE LIMITED"}
          </h1>
          <p className="text-[11px] text-gray-700 mt-0.5">
            {[data.companyAddress, data.cityPincode].filter(Boolean).join(", ") ||
              "A-37, Sector-60, Noida-201301"}
          </p>
        </div>
      </div>

      {/* 2. Payslip Month Title Bar */}
      <div className="bg-[#4b5563] text-white font-bold text-center py-1 text-xs tracking-wider uppercase border border-gray-600">
        Payslip For {data.payPeriodMonth} {data.payPeriodYear}
      </div>

      {/* 3. Employee Master Information Grid (3 Isolated Columns with Dedicated Colon Cells - ZERO OVERLAP) */}
      <div className="mt-2 text-[10px] text-black">
        <div className="grid grid-cols-12 gap-2">
          {/* Column 1: Code, Name, Joining, Dept, Location (30% width) */}
          <div className="col-span-4">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-16 font-bold whitespace-nowrap py-0.5">Code</td>
                  <td className="w-3 text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1 font-medium">{data.employeeId || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">Name</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1 font-bold">{data.employeeName || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">Joining</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1">{formatDate(data.dateOfJoining)}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">Dept</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1 leading-tight">{data.department || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">Location</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1">{data.location || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column 2: Designation, UAN, ESIC, Bank Name (36% width) */}
          <div className="col-span-4 pl-1">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-20 font-bold whitespace-nowrap py-0.5 align-top">Designation</td>
                  <td className="w-3 text-center py-0.5 font-bold align-top">:</td>
                  <td className="py-0.5 pl-1 align-top leading-tight">{data.designation || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">UAN No</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1">{data.uanNumber || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">ESIC No</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1">{data.esicNumber || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">Bank Name</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1 leading-tight">{data.bankName || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Column 3: Insurance Card No, Bank Account No, Salary Status, PAN No (34% width) */}
          <div className="col-span-4 pl-1">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-28 font-bold whitespace-nowrap py-0.5">Insurance Card No</td>
                  <td className="w-3 text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1">{data.insuranceCardNo || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">Bank Account No</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1 font-medium whitespace-nowrap">{data.bankAccount || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5 align-top">Salary Status</td>
                  <td className="text-center py-0.5 font-bold align-top">:</td>
                  <td className="py-0.5 pl-1 align-top leading-tight">{data.paymentMode || "Bank Transfer"}</td>
                </tr>
                <tr>
                  <td className="font-bold whitespace-nowrap py-0.5">PAN No</td>
                  <td className="text-center py-0.5 font-bold">:</td>
                  <td className="py-0.5 pl-1">{data.panNumber || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Working Days & Paid Days Strip (Solid Black Lines matching T276912_10_2024.PDF) */}
      <div className="mt-1.5 border-t border-b border-black py-1 px-1 flex justify-between items-center text-xs font-bold text-black">
        <div>Working Days:{data.totalDays || "31"}</div>
        <div>Paid Days:{data.paidDays || "30"}</div>
      </div>

      {/* 5. Main Salary Ledger Table Box */}
      <div className="mt-2 border border-black text-[11px] text-black">
        {/* Table Headers */}
        <div className="flex border-b border-black font-bold py-1 bg-white text-[11px]">
          {/* Earnings side: 56% */}
          <div className="w-[56%] flex border-r border-black px-2">
            <span className="w-[50%] text-left">Earnings</span>
            <span className="w-[25%] text-right pr-2">Rate</span>
            <span className="w-[25%] text-right">Payable</span>
          </div>
          {/* Deductions side: 44% */}
          <div className="w-[44%] flex px-2">
            <span className="w-[68%] text-left">Other Deductions</span>
            <span className="w-[32%] text-right">Amount</span>
          </div>
        </div>

        {/* Content Box Area */}
        <div className="min-h-[220px] flex">
          {/* Left Side: Earnings Items */}
          <div className="w-[56%] border-r border-black p-2 space-y-1.5">
            {earningsList.map((item) => (
              <div key={item.id} className="flex text-[11px] leading-tight">
                <span className="w-[50%] font-semibold uppercase pr-1">
                  {item.label}
                </span>
                <span className="w-[25%] text-right pr-2 text-black font-normal">
                  {item.rate !== undefined ? item.rate : item.amount}
                </span>
                <span className="w-[25%] text-right text-black font-medium">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>

          {/* Right Side: Deductions Items */}
          <div className="w-[44%] p-2 space-y-1.5">
            {deductionsList.map((item) => (
              <div key={item.id} className="flex text-[11px] leading-tight">
                <span className="w-[68%] font-semibold uppercase pr-1">
                  {item.label}
                </span>
                <span className="w-[32%] text-right text-black font-medium">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary Row */}
        <div className="flex border-t border-black font-bold py-1 bg-white text-xs">
          <div className="w-[56%] flex border-r border-black px-2">
            <span className="w-[50%] text-left uppercase">TOTAL</span>
            <span className="w-[25%] text-right pr-2">{totalRate}</span>
            <span className="w-[25%] text-right">{grossPayable}</span>
          </div>
          <div className="w-[44%] flex px-2">
            <span className="w-[68%]" />
            <span className="w-[32%] text-right">{totalDeductions}</span>
          </div>
        </div>
      </div>

      {/* 6. Net Salary & In-Words Bar (Authentic Blue Text matching T276912_10_2024.PDF) */}
      <div className="mt-2.5 text-xs font-bold text-[#1d4ed8] flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div>Net Salary:Rs. {netPay}</div>
        <div>In Words:{amountInWords(netPay)}</div>
      </div>

      {/* 7. Remarks Line */}
      <div className="mt-4 text-[10.5px] text-gray-600">
        Remarks : {data.remarks || "This is a computer generated statement, as such no signature required."}
      </div>

      {/* 8. Optional Stamp if user enables it */}
      {data.showStamp && (
        <div className="mt-1 flex justify-end">
          <div className="w-18 h-18 rounded-full border border-dashed border-indigo-800 p-1 flex flex-col items-center justify-center text-center opacity-85 rotate-[-5deg]">
            <span className="text-[6px] font-bold text-indigo-900 uppercase leading-none">
              {data.companyName ? data.companyName.slice(0, 16) : "PAYROLL"}
            </span>
            <span className="text-[6px] my-0.5 font-black text-indigo-800">★ VERIFIED ★</span>
            <span className="text-[5px] text-indigo-700 font-mono leading-none">
              {data.payPeriodMonth} {data.payPeriodYear}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

PayslipPreview.displayName = "PayslipPreview";
export default PayslipPreview;
