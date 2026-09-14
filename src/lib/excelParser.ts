import * as XLSX from "xlsx";
import { PayslipData, makeId, LineItem } from "@/types/payslip";

export interface ParsedBatchResult {
  employees: PayslipData[];
  errors: string[];
  totalRows: number;
}

// Clean and normalize keys from Excel header row
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Helper to safely get value by multiple aliases
function getRowValue(row: Record<string, any>, ...aliases: string[]): string {
  const rowNormalized: Record<string, any> = {};
  for (const k of Object.keys(row)) {
    rowNormalized[normalizeKey(k)] = row[k];
  }

  for (const alias of aliases) {
    const norm = normalizeKey(alias);
    if (rowNormalized[norm] !== undefined && rowNormalized[norm] !== null) {
      return String(rowNormalized[norm]).trim();
    }
  }
  return "";
}

function getRowNumber(row: Record<string, any>, ...aliases: string[]): number {
  const val = getRowValue(row, ...aliases);
  if (!val) return 0;
  const num = parseFloat(val.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num;
}

/**
 * Parse an Excel (.xlsx, .xls) or CSV file into an array of PayslipData
 */
export async function parseExcelPayroll(
  file: File,
  baseCompany: Partial<PayslipData>
): Promise<ParsedBatchResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          resolve({ employees: [], errors: ["File could not be read."], totalRows: 0 });
          return;
        }

        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ employees: [], errors: ["No sheets found in workbook."], totalRows: 0 });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        if (rawRows.length === 0) {
          resolve({ employees: [], errors: ["Worksheet is empty."], totalRows: 0 });
          return;
        }

        const employees: PayslipData[] = [];
        const errors: string[] = [];

        rawRows.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          const empName = getRowValue(row, "EmployeeName", "Name", "EmpName", "Employee");
          const empId = getRowValue(row, "EmployeeCode", "EmployeeId", "EmpCode", "Code", "Id");

          if (!empName && !empId) {
            // skip completely empty rows
            return;
          }

          // Earnings
          const basicRate = getRowNumber(row, "BasicRate", "BasicPayRate", "Basic");
          const basicAmount = getRowNumber(row, "BasicAmount", "BasicPayable", "BasicPay", "Basic");
          const hraRate = getRowNumber(row, "HRARate", "HouseRentAllowanceRate", "HRA");
          const hraAmount = getRowNumber(row, "HRAAmount", "HRAPayable", "HouseRentAllowance", "HRA");
          const specialAmount = getRowNumber(row, "SpecialAllowance", "Special", "SpecialPayable");
          const conveyanceAmount = getRowNumber(row, "Conveyance", "ConveyanceAllowance", "ConveyancePayable");
          const bonusAmount = getRowNumber(row, "Bonus", "PerformanceBonus", "Incentive");
          const otherAllowance = getRowNumber(row, "OtherAllowance", "Allowance", "Medical");

          const earnings: LineItem[] = [];
          if (basicRate > 0 || basicAmount > 0) {
            earnings.push({
              id: makeId(),
              label: "BASIC",
              rate: basicRate || basicAmount,
              amount: basicAmount || basicRate,
            });
          }
          if (hraRate > 0 || hraAmount > 0) {
            earnings.push({
              id: makeId(),
              label: "HRA",
              rate: hraRate || hraAmount,
              amount: hraAmount || hraRate,
            });
          }
          if (specialAmount > 0) {
            earnings.push({
              id: makeId(),
              label: "SPECIAL ALLOWANCE",
              rate: specialAmount,
              amount: specialAmount,
            });
          }
          if (conveyanceAmount > 0) {
            earnings.push({
              id: makeId(),
              label: "CONVEYANCE ALLOWANCE",
              rate: conveyanceAmount,
              amount: conveyanceAmount,
            });
          }
          if (bonusAmount > 0) {
            earnings.push({
              id: makeId(),
              label: "BONUS",
              rate: bonusAmount,
              amount: bonusAmount,
            });
          }
          if (otherAllowance > 0) {
            earnings.push({
              id: makeId(),
              label: "OTHER ALLOWANCE",
              rate: otherAllowance,
              amount: otherAllowance,
            });
          }

          // Fallback if no earnings parsed
          if (earnings.length === 0) {
            earnings.push({ id: makeId(), label: "BASIC", rate: 10000, amount: 10000 });
          }

          // Deductions
          const pfAmount = getRowNumber(row, "PF", "ProvidentFund", "EPF");
          const esicAmount = getRowNumber(row, "ESIC", "ESI");
          const ptAmount = getRowNumber(row, "ProfessionalTax", "PT");
          const tdsAmount = getRowNumber(row, "TDS", "IncomeTax", "Tax");
          const fineAmount = getRowNumber(row, "Fine", "Headset", "Advance");
          const otherDeductions = getRowNumber(row, "OtherDeductions", "Deductions", "Deduction");

          const deductions: LineItem[] = [];
          if (pfAmount > 0) {
            deductions.push({ id: makeId(), label: "PF", amount: pfAmount });
          }
          if (esicAmount > 0) {
            deductions.push({ id: makeId(), label: "ESI", amount: esicAmount });
          }
          if (ptAmount > 0) {
            deductions.push({ id: makeId(), label: "PROFESSIONAL TAX", amount: ptAmount });
          }
          if (tdsAmount > 0) {
            deductions.push({ id: makeId(), label: "TDS / TAX", amount: tdsAmount });
          }
          if (fineAmount > 0) {
            deductions.push({ id: makeId(), label: "OTHER DEDUCTION", amount: fineAmount });
          }
          if (otherDeductions > 0 && fineAmount === 0) {
            deductions.push({ id: makeId(), label: "OTHER DEDUCTION", amount: otherDeductions });
          }

          // Parse Dates
          let doj = getRowValue(row, "DateOfJoining", "DOJ", "JoiningDate", "Joining");
          if (doj && !isNaN(Number(doj))) {
            // Excel serial date format
            const parsed = XLSX.SSF.parse_date_code(Number(doj));
            if (parsed) {
              const y = parsed.y;
              const m = String(parsed.m).padStart(2, "0");
              const d = String(parsed.d).padStart(2, "0");
              doj = `${y}-${m}-${d}`;
            }
          }

          const payslipRecord: PayslipData = {
            logo: baseCompany.logo ?? null,
            companyName:
              getRowValue(row, "CompanyName", "Company") ||
              baseCompany.companyName ||
              "DATATRACK TECHNOLOGIES PRIVATE LIMITED",
            companyAddress:
              getRowValue(row, "CompanyAddress", "Address") ||
              baseCompany.companyAddress ||
              "A-37, Sector-60",
            cityPincode:
              getRowValue(row, "CityPincode", "City") ||
              baseCompany.cityPincode ||
              "Noida-201301",
            country: baseCompany.country || "India",
            cinNumber: getRowValue(row, "CIN", "CINNumber") || baseCompany.cinNumber || "",
            gstin: getRowValue(row, "GSTIN", "GST") || baseCompany.gstin || "",

            employeeName: empName || `Employee ${idx + 1}`,
            employeeId: empId || `EMP-${String(100 + idx)}`,
            designation:
              getRowValue(row, "Designation", "Role", "Title") || "Operations Associate",
            department:
              getRowValue(row, "Department", "Dept", "Unit") || "Customer Operations",
            dateOfJoining: doj || "2024-01-15",
            location: getRowValue(row, "Location", "Branch") || baseCompany.location || "Noida",

            panNumber: getRowValue(row, "PAN", "PANNo") || "-",
            uanNumber: getRowValue(row, "UAN", "UANNo") || "-",
            esicNumber: getRowValue(row, "ESICNo", "ESICNumber") || "-",
            insuranceCardNo: getRowValue(row, "InsuranceCardNo", "Insurance") || "-",
            pfNumber: getRowValue(row, "PFNumber", "PFNo") || "-",
            bankAccount: getRowValue(row, "BankAccount", "AccountNo", "Account") || "-",
            bankName: getRowValue(row, "BankName", "Bank") || "HDFC Bank Ltd",
            paymentMode:
              getRowValue(row, "PaymentMode", "PaymentStatus", "Mode") || "Bank Transfer",

            payPeriodMonth:
              getRowValue(row, "Month", "PayMonth", "PeriodMonth") ||
              baseCompany.payPeriodMonth ||
              "OCT",
            payPeriodYear:
              getRowValue(row, "Year", "PayYear", "PeriodYear") ||
              baseCompany.payPeriodYear ||
              "2024",
            totalDays: getRowValue(row, "TotalDays", "WorkingDays") || "31",
            paidDays: getRowValue(row, "PaidDays", "PresentDays") || "30",
            lopDays: getRowValue(row, "LOP", "LossOfPay", "LOPDays") || "1",
            payDate:
              getRowValue(row, "PayDate") ||
              baseCompany.payDate ||
              new Date().toISOString().split("T")[0],

            earnings,
            deductions,

            remarks:
              getRowValue(row, "Remarks") ||
              baseCompany.remarks ||
              "This is a computer generated statement, as such no signature required.",
            showStamp: baseCompany.showStamp ?? false,
          };

          employees.push(payslipRecord);
        });

        resolve({
          employees,
          errors,
          totalRows: rawRows.length,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate a ready-to-use Sample Excel Template file for download
 */
export function generateSampleExcelTemplate(): void {
  const sampleData = [
    {
      EmployeeCode: "EMP-101",
      EmployeeName: "Aarav N. Verma",
      Designation: "Assistant Executive Customer Service",
      Department: "Customer Operations",
      DateOfJoining: "2024-03-12",
      Location: "Noida",
      WorkingDays: 31,
      PaidDays: 30,
      LOPDays: 1,
      BasicRate: 8600,
      BasicAmount: 8323,
      HRARate: 4614,
      HRAAmount: 4465,
      SpecialAllowance: 2500,
      PF: 999,
      ESIC: 96,
      ProfessionalTax: 200,
      TDS: 0,
      OtherDeductions: 0,
      BankName: "Kotak Mahindra Bank",
      BankAccount: "918273645012",
      PaymentMode: "Bank Transfer",
      UAN: "101982736451",
      ESICNo: "6710293847",
      PAN: "ABCDE1234F",
    },
    {
      EmployeeCode: "EMP-102",
      EmployeeName: "Neha S. Sharma",
      Designation: "Senior Operations Specialist",
      Department: "Customer Operations",
      DateOfJoining: "2023-08-15",
      Location: "Noida",
      WorkingDays: 31,
      PaidDays: 31,
      LOPDays: 0,
      BasicRate: 14000,
      BasicAmount: 14000,
      HRARate: 7000,
      HRAAmount: 7000,
      SpecialAllowance: 4500,
      PF: 1680,
      ESIC: 191,
      ProfessionalTax: 200,
      TDS: 0,
      OtherDeductions: 0,
      BankName: "HDFC Bank Ltd",
      BankAccount: "50100293817261",
      PaymentMode: "Bank Transfer",
      UAN: "101837261948",
      ESICNo: "6729183746",
      PAN: "FGHIJ5678K",
    },
    {
      EmployeeCode: "EMP-103",
      EmployeeName: "Rohan V. Mehta",
      Designation: "Team Lead - Operations",
      Department: "Process Quality",
      DateOfJoining: "2022-11-01",
      Location: "Noida",
      WorkingDays: 31,
      PaidDays: 29,
      LOPDays: 2,
      BasicRate: 22000,
      BasicAmount: 20580,
      HRARate: 11000,
      HRAAmount: 10290,
      SpecialAllowance: 6500,
      PF: 2470,
      ESIC: 0,
      ProfessionalTax: 200,
      TDS: 1200,
      OtherDeductions: 0,
      BankName: "ICICI Bank Ltd",
      BankAccount: "001205938172",
      PaymentMode: "Bank Transfer",
      UAN: "101928374650",
      ESICNo: "-",
      PAN: "LMNOP9012Q",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for clean readability
  ws["!cols"] = [
    { wch: 14 }, // EmployeeCode
    { wch: 22 }, // EmployeeName
    { wch: 32 }, // Designation
    { wch: 22 }, // Department
    { wch: 14 }, // DateOfJoining
    { wch: 12 }, // Location
    { wch: 12 }, // WorkingDays
    { wch: 10 }, // PaidDays
    { wch: 10 }, // LOPDays
    { wch: 12 }, // BasicRate
    { wch: 12 }, // BasicAmount
    { wch: 10 }, // HRARate
    { wch: 12 }, // HRAAmount
    { wch: 16 }, // SpecialAllowance
    { wch: 10 }, // PF
    { wch: 10 }, // ESIC
    { wch: 16 }, // ProfessionalTax
    { wch: 10 }, // TDS
    { wch: 16 }, // OtherDeductions
    { wch: 22 }, // BankName
    { wch: 20 }, // BankAccount
    { wch: 14 }, // PaymentMode
    { wch: 16 }, // UAN
    { wch: 14 }, // ESICNo
    { wch: 14 }, // PAN
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payroll Roster");

  XLSX.writeFile(wb, "DataTrack_Payroll_Template.xlsx");
}
