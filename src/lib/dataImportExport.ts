import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export type ExportFormat = 'csv' | 'json' | 'xml' | 'excel' | 'pdf';
export type ImportFormat = 'csv' | 'json' | 'xml' | 'excel';

export interface ExportOptions {
  filename: string;
  format: ExportFormat;
  data: any[];
  columns?: { key: string; label: string }[];
  title?: string;
}

export interface ImportResult {
  data: any[];
  errors?: string[];
}

export const exportData = async (options: ExportOptions): Promise<void> => {
  const { filename, format, data, columns, title } = options;

  switch (format) {
    case 'csv':
      exportCSV(data, columns, filename);
      break;
    case 'json':
      exportJSON(data, filename);
      break;
    case 'xml':
      exportXML(data, filename);
      break;
    case 'excel':
      exportExcel(data, columns, filename);
      break;
    case 'pdf':
      exportPDF(data, columns, filename, title);
      break;
  }
};

const exportCSV = (data: any[], columns: { key: string; label: string }[] | undefined, filename: string) => {
  const csv = Papa.unparse(data, {
    columns: columns?.map(c => c.key),
    header: true
  });
  
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

const exportJSON = (data: any[], filename: string) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json;charset=utf-8;');
};

const exportXML = (data: any[], filename: string) => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true
  });
  
  const xmlData = {
    root: {
      records: {
        record: data
      }
    }
  };
  
  const xml = builder.build(xmlData);
  downloadFile(xml, `${filename}.xml`, 'application/xml;charset=utf-8;');
};

const exportExcel = (data: any[], columns: { key: string; label: string }[] | undefined, filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  
  if (columns) {
    const headers = columns.map(c => c.label);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
  }
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const exportPDF = (
  data: any[],
  columns: { key: string; label: string }[] | undefined,
  filename: string,
  title?: string
) => {
  const doc = new jsPDF();
  
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 15);
  }
  
  const tableColumns = columns || Object.keys(data[0] || {}).map(key => ({ key, label: key }));
  const tableHeaders = tableColumns.map(c => c.label);
  const tableRows = data.map(row => 
    tableColumns.map(col => row[col.key]?.toString() || '')
  );
  
  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: title ? 25 : 15,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] }
  });
  
  doc.save(`${filename}.pdf`);
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = async (file: File, format: ImportFormat): Promise<ImportResult> => {
  try {
    switch (format) {
      case 'csv':
        return await importCSV(file);
      case 'json':
        return await importJSON(file);
      case 'xml':
        return await importXML(file);
      case 'excel':
        return await importExcel(file);
      default:
        throw new Error('Неподдерживаемый формат');
    }
  } catch (error) {
    return {
      data: [],
      errors: [error instanceof Error ? error.message : 'Ошибка импорта']
    };
  }
};

const importCSV = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors.map(e => e.message)
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [error.message]
        });
      }
    });
  });
};

const importJSON = async (file: File): Promise<ImportResult> => {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    return {
      data: Array.isArray(data) ? data : [data]
    };
  } catch (error) {
    return {
      data: [],
      errors: ['Некорректный JSON формат']
    };
  }
};

const importXML = async (file: File): Promise<ImportResult> => {
  const text = await file.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
  });
  
  try {
    const result = parser.parse(text);
    let data = result?.root?.records?.record || result?.records?.record || [];
    
    if (!Array.isArray(data)) {
      data = [data];
    }
    
    return { data };
  } catch (error) {
    return {
      data: [],
      errors: ['Некорректный XML формат']
    };
  }
};

const importExcel = async (file: File): Promise<ImportResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(firstSheet);
  
  return { data };
};

export const detectFileFormat = (file: File): ImportFormat | null => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'csv':
      return 'csv';
    case 'json':
      return 'json';
    case 'xml':
      return 'xml';
    case 'xlsx':
    case 'xls':
      return 'excel';
    default:
      return null;
  }
};
