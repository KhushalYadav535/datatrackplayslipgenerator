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
    filename = "DataTrack_Payslip.pdf",
    onProgress,
  } = options;

  try {
    onProgress?.("Authenticating document fonts & layout...");

    // Ensure all web and system fonts are completely settled
    if (typeof document !== "undefined" && document.fonts) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));

    onProgress?.("Rendering 300DPI corporate document graphics...");

    // Capture using html-to-image with pixelRatio 3 for razor-sharp vector-like clarity
    const imgData = await toPng(element, {
      quality: 1,
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#ffffff",
      style: {
        backgroundColor: "#ffffff",
        margin: "0",
        boxShadow: "none",
      },
    });

    onProgress?.("Composing official A4 PDF...");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgProps = pdf.getImageProperties(imgData);
    const contentAspectRatio = imgProps.height / imgProps.width;

    // Standard 8mm margins for authentic corporate edge-to-edge balance
    const marginX = 8;
    const marginY = 8;
    const printableWidth = pageWidth - marginX * 2;
    const renderedHeight = printableWidth * contentAspectRatio;

    if (renderedHeight <= pageHeight - marginY * 2) {
      // Fits on a single A4 page cleanly
      pdf.addImage(
        imgData,
        "PNG",
        marginX,
        marginY,
        printableWidth,
        renderedHeight,
        undefined,
        "FAST"
      );
    } else {
      // Handles multipage if user has many allowance line items
      let heightLeft = renderedHeight;
      let position = marginY;

      pdf.addImage(
        imgData,
        "PNG",
        marginX,
        position,
        printableWidth,
        renderedHeight,
        undefined,
        "FAST"
      );
      heightLeft -= (pageHeight - marginY * 2);

      while (heightLeft > 0) {
        position = position - (pageHeight - marginY * 2);
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          marginX,
          position,
          printableWidth,
          renderedHeight,
          undefined,
          "FAST"
        );
        heightLeft -= (pageHeight - marginY * 2);
      }
    }

    onProgress?.("Finalizing download...");
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}

export function printPayslip(): void {
  window.print();
}
