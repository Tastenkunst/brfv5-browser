import { ExportToCsv } from "export-to-csv";

export const exportToCsv = () => {
  const options = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: true,
    title: "My Awesome CSV",
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  };

  const localStorage = window.localStorage;

  const csvExporter = new ExportToCsv(options);

  return csvExporter.generateCsv(data);
};
