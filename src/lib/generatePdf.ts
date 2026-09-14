import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export interface GeneratePdfOptions {
  filename?: string;
  onProgress?: (status: string) => void;
}

export async function downloadPayslipPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const {
    filename = "Payslip.pdf",
    onProgress,
  } = options;

  try {
    onProgress?.("Settling typography and layout...");

    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));

    onProgress?.("Rendering 300DPI document image...");

    // High quality rasterization
    const imgData = await toPng(element, {
      quality: 1,
      pixelRatio: 3,
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

    onProgress?.("Fitting single A4 page...");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    const imgProps = pdf.getImageProperties(imgData);
    const contentAspectRatio = imgProps.height / imgProps.width;

    // Standard 8mm margins
    const marginX = 8;
    const marginY = 8;
    const availWidth = pageWidth - marginX * 2; // 194 mm
    const availHeight = pageHeight - marginY * 2; // 281 mm

    let finalWidth = availWidth;
    let finalHeight = availWidth * contentAspectRatio;

    // Strict single-page fitting: scale proportionally if height exceeds available printable height
    if (finalHeight > availHeight) {
      const scale = availHeight / finalHeight;
      finalHeight = availHeight;
      finalWidth = finalWidth * scale;
    }

    // Horizontally center if scaled down
    const posX = marginX + (availWidth - finalWidth) / 2;
    const posY = marginY;

    // Add exactly ONCE on page 1 - strictly 1 page
    pdf.addImage(
      imgData,
      "PNG",
      posX,
      posY,
      finalWidth,
      finalHeight,
      undefined,
      "FAST"
    );

    onProgress?.("Saving PDF document...");
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}

export function printPayslip(): void {
  window.print();
}
