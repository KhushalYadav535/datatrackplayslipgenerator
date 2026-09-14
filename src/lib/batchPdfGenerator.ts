import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { PayslipData } from "@/types/payslip";

export interface BatchExportOptions {
  batchName?: string;
  onProgress?: (current: number, total: number, currentName: string) => void;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function cleanStringForFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
}

/**
 * Capture an element as a strictly fitted single A4 page inside a jsPDF instance
 */
async function captureElementToPdfPage(
  element: HTMLElement,
  pdfInstance: jsPDF,
  isFirstPage: boolean = true
): Promise<void> {
  const imgData = await toPng(element, {
    quality: 1,
    pixelRatio: 2.5,
    cacheBust: true,
    backgroundColor: "#ffffff",
    style: {
      backgroundColor: "#ffffff",
      margin: "0",
      boxShadow: "none",
      width: "100%",
      maxWidth: "800px",
    },
  });

  const pageWidth = pdfInstance.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = pdfInstance.internal.pageSize.getHeight(); // 297 mm
  const imgProps = pdfInstance.getImageProperties(imgData);
  const contentAspectRatio = imgProps.height / imgProps.width;

  const marginX = 8;
  const marginY = 8;
  const availWidth = pageWidth - marginX * 2;
  const availHeight = pageHeight - marginY * 2;

  let finalWidth = availWidth;
  let finalHeight = availWidth * contentAspectRatio;

  if (finalHeight > availHeight) {
    const scale = availHeight / finalHeight;
    finalHeight = availHeight;
    finalWidth = finalWidth * scale;
  }

  const posX = marginX + (availWidth - finalWidth) / 2;
  const posY = marginY;

  if (!isFirstPage) {
    pdfInstance.addPage();
  }

  pdfInstance.addImage(imgData, "PNG", posX, posY, finalWidth, finalHeight, undefined, "FAST");
}

/**
 * Export all employee payslips as a ZIP archive of individual single-page PDFs
 */
export async function exportBatchAsZip(
  renderContainer: HTMLElement,
  employees: PayslipData[],
  renderEmployeeCallback: (emp: PayslipData) => Promise<void>,
  options: BatchExportOptions = {}
): Promise<void> {
  const { onProgress } = options;
  const zip = new JSZip();

  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  const total = employees.length;

  for (let i = 0; i < total; i++) {
    const emp = employees[i];
    onProgress?.(i + 1, total, emp.employeeName || `Employee ${i + 1}`);

    // Update DOM with this employee's data
    await renderEmployeeCallback(emp);
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Create an individual A4 PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    await captureElementToPdfPage(renderContainer, pdf, true);

    const pdfBlob = pdf.output("blob");
    const code = cleanStringForFilename(emp.employeeId || `EMP${i + 1}`);
    const name = cleanStringForFilename(emp.employeeName || "Employee");
    const filename = `Payslip_${code}_${name}_${emp.payPeriodMonth}_${emp.payPeriodYear}.pdf`;

    zip.file(filename, pdfBlob);
  }

  onProgress?.(total, total, "Compressing ZIP archive...");
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const zipFilename = `DataTrack_Payslips_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
  triggerBrowserDownload(zipBlob, zipFilename);
}

/**
 * Export all employee payslips combined into a single multi-page PDF (1 A4 page per employee)
 */
export async function exportBatchAsCombinedPdf(
  renderContainer: HTMLElement,
  employees: PayslipData[],
  renderEmployeeCallback: (emp: PayslipData) => Promise<void>,
  options: BatchExportOptions = {}
): Promise<void> {
  const { onProgress } = options;

  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }

  const masterPdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const total = employees.length;

  for (let i = 0; i < total; i++) {
    const emp = employees[i];
    onProgress?.(i + 1, total, emp.employeeName || `Employee ${i + 1}`);

    await renderEmployeeCallback(emp);
    await new Promise((resolve) => setTimeout(resolve, 80));

    await captureElementToPdfPage(renderContainer, masterPdf, i === 0);
  }

  onProgress?.(total, total, "Finalizing Master PDF document...");
  const pdfFilename = `DataTrack_All_Employees_Payslips_${new Date().toISOString().slice(0, 10)}.pdf`;
  masterPdf.save(pdfFilename);
}
