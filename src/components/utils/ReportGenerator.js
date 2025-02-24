import jsPDF from "jspdf";
import "jspdf-autotable";

// Helper function to convert Firestore Timestamp to readable date
const formatTimestamp = (timestamp) => {
  if (typeof timestamp === "object" && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return timestamp; // If not a timestamp, return as is
};

export const generatePDF = (data, title) => {
  if (!data || data.length === 0) {
    alert("No data available for the report!");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 15);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

  // Extract column names dynamically
  const tableColumn = Object.keys(data[0]);

  // Map data rows, converting timestamps if needed
  const tableRows = data.map((row) =>
    tableColumn.map((col) => formatTimestamp(row[col]))
  );

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save(`${title}.pdf`);
};
