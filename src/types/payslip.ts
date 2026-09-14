export interface LineItem {
  id: string;
  label: string;
  amount: number;
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
  pfNumber: string;
  bankAccount: string;
  bankName: string;
  paymentMode: string;
  
  payPeriodMonth: string; // e.g. "September"
  payPeriodYear: string; // e.g. "2026"
  totalDays: string;
  paidDays: string;
  lopDays: string;
  payDate: string; // yyyy-mm-dd

  earnings: LineItem[];
  deductions: LineItem[];

  showStamp: boolean;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
    location: "India",

    panNumber: "",
    uanNumber: "",
    pfNumber: "",
    bankAccount: "",
    bankName: "",
    paymentMode: "Direct Bank Transfer (NEFT/IMPS)",

    payPeriodMonth: month,
    payPeriodYear: year,
    totalDays: "30",
    paidDays: "30",
    lopDays: "0",
    payDate: new Date().toISOString().split("T")[0],

    earnings: [
      { id: makeId(), label: "Basic Salary", amount: 45000 },
      { id: makeId(), label: "House Rent Allowance (HRA)", amount: 18000 },
      { id: makeId(), label: "Special Allowance", amount: 12000 },
      { id: makeId(), label: "Conveyance Allowance", amount: 1600 },
    ],
    deductions: [
      { id: makeId(), label: "Provident Fund (Employee EPF)", amount: 1800 },
      { id: makeId(), label: "Professional Tax (PT)", amount: 200 },
      { id: makeId(), label: "Income Tax (TDS)", amount: 2500 },
    ],

    showStamp: true,
  };
}

export function samplePayslip(): PayslipData {
  const { month, year } = currentMonthYear();
  return {
    logo: null,
    companyName: "DATATRACK TECHNOLOGIES PRIVATE LIMITED",
    companyAddress: "Building 4B, 3rd Floor, Outer Ring Road Tech Zone, Bellandur",
    cityPincode: "Bengaluru, Karnataka - 560103",
    country: "India",
    cinNumber: "U72200KA2020PTC138942",
    gstin: "29AABCD1234F1Z8",

    employeeName: "Aditya R. Sharma",
    employeeId: "DT-8429",
    designation: "Senior Software Engineer",
    department: "Enterprise Cloud Platforms",
    dateOfJoining: "2022-07-14",
    location: "Bengaluru, India",

    panNumber: "ABCDE1234F",
    uanNumber: "101234567890",
    pfNumber: "KN/BNG/0048921/000/0842",
    bankAccount: "50100492817291",
    bankName: "HDFC Bank Ltd.",
    paymentMode: "Direct Bank Transfer (NEFT)",

    payPeriodMonth: month,
    payPeriodYear: year,
    totalDays: "30",
    paidDays: "30",
    lopDays: "0",
    payDate: new Date().toISOString().split("T")[0],

    earnings: [
      { id: makeId(), label: "Basic Salary", amount: 48000 },
      { id: makeId(), label: "House Rent Allowance (HRA)", amount: 19200 },
      { id: makeId(), label: "Special Allowance", amount: 12500 },
      { id: makeId(), label: "Conveyance Allowance", amount: 2400 },
      { id: makeId(), label: "Medical Allowance", amount: 1250 },
      { id: makeId(), label: "Performance Incentive", amount: 6500 },
    ],
    deductions: [
      { id: makeId(), label: "Employee Provident Fund (EPF)", amount: 3600 },
      { id: makeId(), label: "Professional Tax (PT)", amount: 200 },
      { id: makeId(), label: "Tax Deducted at Source (TDS)", amount: 4800 },
      { id: makeId(), label: "Group Health Insurance", amount: 750 },
    ],

    showStamp: true,
  };
}
