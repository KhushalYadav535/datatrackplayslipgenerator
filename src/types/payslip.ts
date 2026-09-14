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
