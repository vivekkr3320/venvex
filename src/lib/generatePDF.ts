import { jsPDF } from 'jspdf';
import { CalculatedItem, formatIndianCurrency, numberToWordsIndian } from './calculateGST';

interface BusinessProfile {
  company_name: string;
  company_address: string;
  company_gstin: string;
  bank_name: string;
  bank_account_no: string;
  bank_ifsc: string;
  logo_url?: string;
}

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  client_name: string;
  client_email: string;
  client_address: string;
  client_gstin: string;
  is_igst: boolean;
  items: CalculatedItem[];
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  grand_total: number;
}

export function generateInvoicePDF(invoice: InvoiceData, profile: BusinessProfile) {
  // Create PDF instance in A4 size (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [37, 99, 235]; // Trust Blue (#2563EB)
  const accentColor = [249, 115, 22]; // Indian Orange (#F97316)
  const textColor = [15, 23, 42]; // Near Black (#0F172A)
  const mutedTextColor = [100, 116, 139]; // Slate 500 (#64748B)
  const stampColor = [22, 163, 74]; // Success Green (#16A34A)

  // Margins
  const marginX = 15;
  let currY = 20;

  // 1. Header Section
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(profile.company_name || 'Business Name', marginX, currY);

  // Document Title (Right Aligned)
  doc.setFontSize(20);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('TAX INVOICE', 195, currY, { align: 'right' });
  
  currY += 7;

  // Company Details (Left)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  
  const companyAddressLines = doc.splitTextToSize(profile.company_address || 'Address not configured', 95);
  doc.text(companyAddressLines, marginX, currY);
  
  const addressHeight = companyAddressLines.length * 4.5;
  
  // Invoice Meta Details (Right)
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice No:`, 145, currY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_number, 195, currY, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Date:`, 145, currY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_date, 195, currY + 5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text(`Due Date:`, 145, currY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(239, 68, 68); // Red for due date
  doc.text(invoice.due_date, 195, currY + 10, { align: 'right' });

  currY += Math.max(addressHeight + 4, 15);

  // Business GSTIN
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`GSTIN: ${profile.company_gstin || 'N/A'}`, marginX, currY);
  
  currY += 8;

  // Horizontal Divider Line (Indian Orange accent)
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.6);
  doc.line(marginX, currY, 195, currY);

  currY += 8;

  // 2. Bill To & Bank Details Columns
  // Bill To (Left Column)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILL TO', marginX, currY);
  
  // Bank Details (Right Column)
  doc.text('BANK SETTLEMENT DETAILS', 115, currY);

  currY += 5;

  // Client Details (Left)
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(invoice.client_name || 'Client Name', marginX, currY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  
  const clientAddressLines = doc.splitTextToSize(invoice.client_address || 'N/A', 90);
  doc.text(clientAddressLines, marginX, currY + 4.5);
  const clientAddressHeight = clientAddressLines.length * 4;

  if (invoice.client_email) {
    doc.text(`Email: ${invoice.client_email}`, marginX, currY + 4.5 + clientAddressHeight + 1);
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`GSTIN: ${invoice.client_gstin || 'N/A'}`, marginX, currY + 4.5 + clientAddressHeight + 5.5);

  // Bank Info (Right)
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Bank Name:`, 115, currY);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.bank_name || 'N/A', 148, currY);

  doc.setFont('helvetica', 'bold');
  doc.text(`A/C Number:`, 115, currY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.bank_account_no || 'N/A', 148, currY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`IFSC Code:`, 115, currY + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(profile.bank_ifsc || 'N/A', 148, currY + 9);

  currY += Math.max(clientAddressHeight + 18, 16);

  // 3. Items Table
  // Table Header Background (Trust Blue)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(marginX, currY, 180, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Description', marginX + 3, currY + 5);
  doc.text('Qty', 110, currY + 5, { align: 'center' });
  doc.text('Rate', 130, currY + 5, { align: 'right' });
  doc.text('GST %', 155, currY + 5, { align: 'right' });
  doc.text('Amount', 190, currY + 5, { align: 'right' });

  currY += 7.5;

  // Table Body Rows
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  
  invoice.items.forEach((item) => {
    // Check if we need to spawn page
    if (currY > 230) {
      doc.addPage();
      currY = 20;
      
      // Reprint header on new page
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(marginX, currY, 180, 7.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Description', marginX + 3, currY + 5);
      doc.text('Qty', 110, currY + 5, { align: 'center' });
      doc.text('Rate', 130, currY + 5, { align: 'right' });
      doc.text('GST %', 155, currY + 5, { align: 'right' });
      doc.text('Amount', 190, currY + 5, { align: 'right' });
      currY += 7.5;
    }

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    
    // Draw row divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);

    const descLines = doc.splitTextToSize(item.description || 'Untitled Service', 85);
    const rowHeight = Math.max(descLines.length * 4.5, 7.5);
    
    doc.text(descLines, marginX + 3, currY + 4.5);
    
    doc.text(String(item.quantity), 110, currY + 4.5, { align: 'center' });
    doc.text(formatIndianCurrency(item.rate), 130, currY + 4.5, { align: 'right' });
    doc.text(`${item.gstRate}%`, 155, currY + 4.5, { align: 'right' });
    doc.text(formatIndianCurrency(item.total), 190, currY + 4.5, { align: 'right' });

    currY += rowHeight;
    doc.line(marginX, currY, 195, currY);
  });

  currY += 6;

  // 4. Amount in Words Block (Left side) & Financial Summary (Right side)
  const leftX = marginX;
  const labelX = 135;
  const valX = 195;

  const startYSummary = currY;

  // Financial Summary (Right)
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Taxable Amount:', labelX, currY);
  doc.text(formatIndianCurrency(invoice.subtotal), valX, currY, { align: 'right' });
  currY += 5;

  if (invoice.is_igst) {
    doc.text(`IGST Total:`, labelX, currY);
    doc.text(formatIndianCurrency(invoice.igst_total), valX, currY, { align: 'right' });
    currY += 5;
  } else {
    doc.text(`CGST Total:`, labelX, currY);
    doc.text(formatIndianCurrency(invoice.cgst_total), valX, currY, { align: 'right' });
    currY += 5;

    doc.text(`SGST Total:`, labelX, currY);
    doc.text(formatIndianCurrency(invoice.sgst_total), valX, currY, { align: 'right' });
    currY += 5;
  }

  // Divider before Grand Total
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]); // Saffron accent
  doc.setLineWidth(0.4);
  doc.line(labelX, currY, valX, currY);
  currY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Grand Total:', labelX, currY);
  doc.text(formatIndianCurrency(invoice.grand_total), valX, currY, { align: 'right' });

  const endYSummary = currY;

  // Write Amount in Words on the Left side
  currY = startYSummary;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AMOUNT IN WORDS', leftX, currY);
  
  currY += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const words = numberToWordsIndian(invoice.grand_total);
  const wordsLines = doc.splitTextToSize(words, 110);
  doc.text(wordsLines, leftX, currY);

  // Restore Y coordinate to the maximum of summary and words block
  currY = Math.max(endYSummary, startYSummary + 4 + wordsLines.length * 4.5) + 12;

  // 5. Verification Stamp / Footer Note
  const stampY = 242;

  // Outer stamp border (Success Green / Emerald)
  doc.setDrawColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.setLineWidth(0.8);
  doc.setFillColor(240, 253, 250); // light green bg
  doc.rect(marginX, stampY, 70, 24, 'FD');

  // Inner double border effect
  doc.setLineWidth(0.2);
  doc.rect(marginX + 1, stampY + 1, 68, 22);

  // Stamp text
  doc.setTextColor(stampColor[0], stampColor[1], stampColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('VALID GST INVOICE', marginX + 35, stampY + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text('Verified Indian Tax Document', marginX + 35, stampY + 12, { align: 'center' });
  doc.text('Secure Digital Authentication', marginX + 35, stampY + 16, { align: 'center' });
  
  // Date time stamp
  const today = new Date().toLocaleString('en-IN');
  doc.setFontSize(6.5);
  doc.text(`Generated: ${today}`, marginX + 35, stampY + 21, { align: 'center' });

  // Standard Footer terms
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Payment Terms: Net 30 days. Payments accepted via Bank Account / UPI Transfer.', marginX, stampY + 31);
  doc.text('This is a computer generated document. No physical signature is required.', marginX, stampY + 35);

  // Save the document
  doc.save(`Invoice_${invoice.invoice_number}.pdf`);
}
