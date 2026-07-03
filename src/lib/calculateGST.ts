export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number; // e.g., 0, 5, 12, 18, 28
}

export interface CalculatedItem extends InvoiceItem {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export function calculateGST(items: InvoiceItem[], isIgst: boolean = false): CalculatedItem[] {
  return items.map(item => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gstRate) || 0;
    
    const taxable = qty * rate;
    const gst = (taxable * gstRate) / 100;
    
    return {
      ...item,
      quantity: qty,
      rate: rate,
      gstRate: gstRate,
      taxable,
      cgst: isIgst ? 0 : gst / 2,
      sgst: isIgst ? 0 : gst / 2,
      igst: isIgst ? gst : 0,
      total: taxable + gst
    };
  });
}

// Format currency in Indian Numbering System (Lakhs, Crores format)
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Convert numbers to Words in Indian numbering format
export function numberToWordsIndian(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const g = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };

  const getWords = (n: number): string => {
    if (n === 0) return 'Zero';
    let output = '';

    // Crores (1,00,00,000)
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    if (crore > 0) {
      output += getWords(crore) + ' Crore ';
    }

    // Lakhs (1,00,000)
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    if (lakh > 0) {
      output += g(lakh) + ' Lakh ';
    }

    // Thousands (1,000)
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    if (thousand > 0) {
      output += g(thousand) + ' Thousand ';
    }

    // Hundreds (100)
    const hundred = Math.floor(n / 100);
    n %= 100;
    if (hundred > 0) {
      output += g(hundred) + ' Hundred ';
    }

    if (n > 0) {
      if (output !== '') output += 'and ';
      output += g(n);
    }

    return output.trim();
  };

  const integral = Math.floor(num);
  const decimal = Math.round((num - integral) * 100);

  let words = getWords(integral) + ' Rupees';
  if (decimal > 0) {
    words += ' and ' + g(decimal) + ' Paise';
  }
  return words + ' Only';
}
