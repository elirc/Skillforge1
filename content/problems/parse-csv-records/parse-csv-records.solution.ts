export function parseCsv(text: string): string[][] | null {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false; // this field started with a quote
  let inQuotes = false; // currently between the quotes
  let i = 0;

  const endField = () => {
    record.push(field);
    field = "";
    quoted = false;
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
      } else {
        field += ch;
      }
      i++;
      continue;
    }

    if (ch === '"' && field === "" && !quoted) {
      inQuotes = true;
      quoted = true;
    } else if (ch === ",") {
      endField();
    } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
      if (ch === "\r") i++;
      endField();
      records.push(record);
      record = [];
    } else {
      field += ch;
    }
    i++;
  }

  if (inQuotes) return null;
  if (field !== "" || quoted || record.length > 0) {
    endField();
    records.push(record);
  }
  return records;
}
