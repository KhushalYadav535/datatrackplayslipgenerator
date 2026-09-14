export interface LineItem {
  id: string;
  label: string;
  rate?: number; // Optional standard rate
  amount: number; // Actual payable amount
}

export interface PayslipData {
  logo: string | null; // data URL
  companyName: string;
  companyAddress: string;
  cityPincode: string;
  country: string;
  cinNumber: string;
  gstin: string;

  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  location: string;
  
  panNumber: string;
  uanNumber: string;
  esicNumber: string;
  insuranceCardNo: string;
  pfNumber: string;
  bankAccount: string;
  bankName: string;
  paymentMode: string;
  
  payPeriodMonth: string; // e.g. "OCT" or "October"
  payPeriodYear: string; // e.g. "2024"
  totalDays: string; // e.g. "31"
  paidDays: string; // e.g. "30"
  lopDays: string;
  payDate: string; // yyyy-mm-dd

  earnings: LineItem[];
  deductions: LineItem[];

  remarks: string;
  showStamp: boolean;
}

export const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export function currentMonthYear(): { month: string; year: string } {
  const d = new Date();
  return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyPayslip(): PayslipData {
  const { month, year } = currentMonthYear();
  return {
    logo: null,
    companyName: "",
    companyAddress: "",
    cityPincode: "",
    country: "India",
    cinNumber: "",
    gstin: "",

    employeeName: "",
    employeeId: "",
    designation: "",
    department: "",
    dateOfJoining: "",
    location: "Noida",

    panNumber: "-",
    uanNumber: "",
    esicNumber: "",
    insuranceCardNo: "-",
    pfNumber: "",
    bankAccount: "",
    bankName: "",
    paymentMode: "Bank Transfer",

    payPeriodMonth: month,
    payPeriodYear: year,
    totalDays: "31",
    paidDays: "30",
    lopDays: "1",
    payDate: new Date().toISOString().split("T")[0],

    earnings: [
      { id: makeId(), label: "BASIC", rate: 8600, amount: 8323 },
      { id: makeId(), label: "HRA", rate: 4614, amount: 4465 },
    ],
    deductions: [
      { id: makeId(), label: "PF", amount: 999 },
      { id: makeId(), label: "ESI", amount: 96 },
    ],

    remarks: "This is a computer generated statement, as such no signature required.",
    showStamp: false,
  };
}

export function samplePayslip(): PayslipData {
  return {
    logo: null,
    companyName: "iENERGIZER IT SERVICES PRIVATE LIMITED",
    companyAddress: "A-37, Sector-60",
    cityPincode: "Noida-201301",
    country: "India",
    cinNumber: "U72200DL2000PTC107563",
    gstin: "07AAACI1234A1Z9",

    employeeName: "Khushal Yadav",
    employeeId: "T276912",
    designation: "Assistant Executive Customer Service",
    department: "Rapido",
    dateOfJoining: "2024-08-07",
    location: "Noida",

    panNumber: "-",
    uanNumber: "102114127134",
    esicNumber: "6723755843",
    insuranceCardNo: "-",
    pfNumber: "DL/CPM/107563/000/276912",
    bankAccount: "247529081",
    bankName: "Kotak Bank",
    paymentMode: "Bank Transfer",

    payPeriodMonth: "OCT",
    payPeriodYear: "2024",
    totalDays: "31",
    paidDays: "30",
    lopDays: "1",
    payDate: "2024-11-01",

    earnings: [
      { id: makeId(), label: "BASIC", rate: 8600, amount: 8323 },
      { id: makeId(), label: "HRA", rate: 4614, amount: 4465 },
    ],
    deductions: [
      { id: makeId(), label: "HEADSET", amount: 1000 },
      { id: makeId(), label: "FINE", amount: 250 },
      { id: makeId(), label: "PF", amount: 999 },
      { id: makeId(), label: "ESI", amount: 96 },
    ],

    remarks: "This is a computer generated statement, as such no signature required.",
    showStamp: false,
  };
}

export function techSoftwareEngineerPayslip(): PayslipData {
  return {
    logo: null,
    companyName: "DATATRACK TECHNOLOGIES INDIA PRIVATE LIMITED",
    companyAddress: "RMZ Ecospace, Outer Ring Road, Bellandur",
    cityPincode: "Bengaluru-560103",
    country: "India",
    cinNumber: "U72900KA2018PTC112345",
    gstin: "29AABCD1234E1Z5",

    employeeName: "Aditya R. Sharma",
    employeeId: "DT-8842",
    designation: "Senior Software Engineer - Full Stack",
    department: "Cloud Platform Engineering",
    dateOfJoining: "2022-03-15",
    location: "Bengaluru",

    panNumber: "ABCDE1234F",
    uanNumber: "101234567890",
    esicNumber: "-",
    insuranceCardNo: "HLTH-DT-8842",
    pfNumber: "KN/BNG/0012345/000/0008842",
    bankAccount: "50100429184021",
    bankName: "HDFC Bank Ltd",
    paymentMode: "Bank Transfer",

    payPeriodMonth: "SEP",
    payPeriodYear: "2026",
    totalDays: "30",
    paidDays: "30",
    lopDays: "0",
    payDate: "2026-09-30",

    earnings: [
      { id: makeId(), label: "BASIC", rate: 55000, amount: 55000 },
      { id: makeId(), label: "HRA", rate: 27500, amount: 27500 },
      { id: makeId(), label: "SPECIAL ALLOWANCE", rate: 22500, amount: 22500 },
      { id: makeId(), label: "CONVEYANCE ALLOWANCE", rate: 5000, amount: 5000 },
    ],
    deductions: [
      { id: makeId(), label: "PF EMPLOYEE CONTRIB", amount: 6600 },
      { id: makeId(), label: "PROFESSIONAL TAX", amount: 200 },
      { id: makeId(), label: "TDS / INCOME TAX", amount: 4500 },
    ],

    remarks: "This is a computer generated statement, as such no signature required.",
    showStamp: true,
  };
}

export function corporateExecutivePayslip(): PayslipData {
  return {
    logo: null,
    companyName: "DATATRACK GLOBAL CONSULTING PRIVATE LIMITED",
    companyAddress: "Level 12, Tower B, Cyber City, DLF Phase 2",
    cityPincode: "Gurugram-122002",
    country: "India",
    cinNumber: "U74140HR2015PTC054321",
    gstin: "06AABCG9876H1Z2",

    employeeName: "Priya V. Nair",
    employeeId: "EXEC-104",
    designation: "Director - Business Operations",
    department: "Strategic Enterprise Growth",
    dateOfJoining: "2019-11-01",
    location: "Gurugram",

    panNumber: "VWXYZ9876G",
    uanNumber: "100987654321",
    esicNumber: "-",
    insuranceCardNo: "EXEC-MED-104",
    pfNumber: "GN/GGN/0054321/000/0000104",
    bankAccount: "001205009812",
    bankName: "ICICI Bank Ltd",
    paymentMode: "NEFT / RTGS",

    payPeriodMonth: "AUG",
    payPeriodYear: "2026",
    totalDays: "31",
    paidDays: "31",
    lopDays: "0",
    payDate: "2026-08-31",

    earnings: [
      { id: makeId(), label: "BASIC", rate: 110000, amount: 110000 },
      { id: makeId(), label: "HRA", rate: 55000, amount: 55000 },
      { id: makeId(), label: "EXECUTIVE ALLOWANCE", rate: 45000, amount: 45000 },
      { id: makeId(), label: "PERFORMANCE BONUS", rate: 20000, amount: 20000 },
    ],
    deductions: [
      { id: makeId(), label: "PROVIDENT FUND", amount: 13200 },
      { id: makeId(), label: "PROFESSIONAL TAX", amount: 200 },
      { id: makeId(), label: "TDS / TAX DEDUCTION", amount: 21500 },
    ],

    remarks: "This is a computer generated statement, as such no signature required.",
    showStamp: true,
  };
}
