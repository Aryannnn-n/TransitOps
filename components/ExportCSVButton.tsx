"use client";

interface ExportCSVButtonProps {
  data: any[];
  filename: string;
  headers: string[];
}

export function ExportCSVButton({ data, filename, headers }: ExportCSVButtonProps) {
  function downloadCSV() {
    const csvRows: string[] = [];
    
    // Add header row
    csvRows.push(headers.join(","));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] !== undefined ? row[header] : "";
        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button onClick={downloadCSV}>
      Export to CSV
    </button>
  );
}
