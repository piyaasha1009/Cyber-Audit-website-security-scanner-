import type { jsPDF } from "jspdf"

// Base64 encoded Montserrat font
const MONTSERRAT_NORMAL = "base64 encoded font data would go here"
const MONTSERRAT_BOLD = "base64 encoded font data would go here"

export function addFont(doc: jsPDF) {
  // In a real implementation, we would add the actual font data
  // For now, we'll use the default font

  // doc.addFileToVFS("Montserrat-Regular.ttf", MONTSERRAT_NORMAL);
  // doc.addFileToVFS("Montserrat-Bold.ttf", MONTSERRAT_BOLD);
  // doc.addFont("Montserrat-Regular.ttf", "Montserrat", "normal");
  // doc.addFont("Montserrat-Bold.ttf", "Montserrat", "bold");

  // For this example, we'll use the default font
  doc.setFont("helvetica")
}
