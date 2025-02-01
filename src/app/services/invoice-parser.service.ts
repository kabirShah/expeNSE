import { Injectable } from '@angular/core';

interface ParsedItem {
  quantity: string;
  description: string;
  rate: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})

export class InvoiceParserService {
  parseInvoiceText(text: string): ParsedItem[] {
    const lines = text.split('\n');
    const parsedItems: ParsedItem[] = []; // Explicitly define the type
    const itemPattern = /^(\d+)\s+([\w\s]+)\s+([\d.]+)\s+([\d.]+)$/;

    lines.forEach((line) => {
      const match = line.match(itemPattern);
      if (match) {
        parsedItems.push({
          quantity: match[1],
          description: match[2],
          rate: parseFloat(match[3]),
          total: parseFloat(match[4]),
        });
      }
    });

    return parsedItems;
  }
}
