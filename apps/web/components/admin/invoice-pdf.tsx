// @ts-nocheck
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

export interface InvoiceLineItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  subject?: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone?: string;
  clientPin?: string;
  items: InvoiceLineItem[];
  taxRate: number; // e.g. 16 for 16%
  notes?: string;
  paymentInstructions?: string;
  preparedBy: string;
  status?: string; // DRAFT, ISSUED, PAID
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    padding: 0,
  },
  // Header
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 36,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#38bdf8',
    letterSpacing: 1.5,
  },
  companyTagline: {
    fontSize: 7.5,
    color: '#94a3b8',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  companyDetails: {
    fontSize: 7,
    color: '#cbd5e1',
    marginTop: 4,
    lineHeight: 1.3,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceBadge: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#38bdf8',
    marginTop: 4,
  },
  headerDate: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 2,
  },
  // Accent Bar
  accentBar: {
    backgroundColor: '#0284c7',
    height: 4,
  },
  // Body
  body: {
    paddingHorizontal: 36,
    paddingTop: 20,
    paddingBottom: 30,
  },
  // Subject Banner
  subjectBanner: {
    backgroundColor: '#f8fafc',
    borderLeft: '4px solid #0284c7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 20,
    borderBottom: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    borderTop: '1px solid #e2e8f0',
  },
  subjectLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  subjectText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  // Info section
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeft: '3px solid #0284c7',
  },
  infoBoxTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  infoBoxHighlight: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  infoBoxText: {
    fontSize: 8.5,
    color: '#334155',
    marginBottom: 2,
  },
  // Line items
  tableSection: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableCell: {
    fontSize: 8.5,
    color: '#334155',
  },
  tableCellBold: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colUnit: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  // Totals
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: 230,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottom: '1px solid #e2e8f0',
  },
  totalLineLabel: {
    fontSize: 8.5,
    color: '#64748b',
  },
  totalLineValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    marginTop: 3,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
  },
  grandTotalValue: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#38bdf8',
  },
  // Payment Details & Bank Details
  paymentRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  paymentBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    border: '1px solid #bae6fd',
  },
  paymentBoxTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 8,
    color: '#0c4a6e',
    lineHeight: 1.4,
  },
  paymentTextBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#075985',
  },
  // Stamp & Sign
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    paddingTop: 14,
    borderTop: '1px dashed #cbd5e1',
  },
  signBlock: {
    width: 180,
    alignItems: 'center',
  },
  signLine: {
    width: '100%',
    borderBottom: '1px solid #94a3b8',
    marginBottom: 4,
    height: 30,
  },
  signLabel: {
    fontSize: 7.5,
    color: '#64748b',
  },
  // Footer
  footer: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 36,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 7,
    color: '#64748b',
  },
  footerBrand: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#38bdf8',
    letterSpacing: 1,
  },
});

function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface InvoicePDFProps {
  invoiceData: InvoiceData;
}

export function InvoicePDF({ invoiceData }: InvoicePDFProps) {
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const taxAmount = (subtotal * invoiceData.taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <Document
      title={`Tax Invoice ${invoiceData.invoiceNumber}`}
      author="TRICLINIUM SYSTEMS"
      subject="Commercial Tax Invoice"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>TRICLINIUM SYSTEMS</Text>
            <Text style={styles.companyTagline}>CCTV SURVEILLANCE &amp; SMART SECURITY INFRASTRUCTURE</Text>
            <Text style={styles.companyDetails}>
              Westlands Commercial Hub, Ring Road, Nairobi, Kenya{'\n'}
              PIN: P051982736Z | VAT Reg: 051982736-Z | Phone: +254 700 555 199{'\n'}
              Email: accounts@triclinium.co.ke | Web: www.triclinium.co.ke
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceBadge}>TAX INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              {invoiceData.invoiceNumber
                ? invoiceData.invoiceNumber.startsWith('INV-')
                  ? invoiceData.invoiceNumber
                  : `INV-${invoiceData.invoiceNumber.replace(/^INV-/, '')}`
                : ''}
            </Text>
            <Text style={styles.headerDate}>Invoice Date: {invoiceData.date}</Text>
            <Text style={styles.headerDate}>Payment Due: {invoiceData.dueDate}</Text>
          </View>
        </View>
        <View style={styles.accentBar} />

        {/* Body */}
        <View style={styles.body}>
          {/* Invoice Subject Banner at top */}
          {invoiceData.subject ? (
            <View style={styles.subjectBanner}>
              <Text style={styles.subjectLabel}>Invoice Subject / Scope of Work</Text>
              <Text style={styles.subjectText}>{invoiceData.subject}</Text>
            </View>
          ) : null}

          {/* Bill To & Invoice Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Billed To</Text>
              <Text style={styles.infoBoxHighlight}>{invoiceData.clientName}</Text>
              {invoiceData.clientCompany && (
                <Text style={styles.infoBoxText}>{invoiceData.clientCompany}</Text>
              )}
              {invoiceData.clientPin && (
                <Text style={styles.infoBoxText}>KRA PIN: {invoiceData.clientPin}</Text>
              )}
              <Text style={styles.infoBoxText}>{invoiceData.clientEmail}</Text>
              {invoiceData.clientPhone && (
                <Text style={styles.infoBoxText}>{invoiceData.clientPhone}</Text>
              )}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Billing Overview</Text>
              <Text style={styles.infoBoxHighlight}>REF: {invoiceData.invoiceNumber}</Text>
              <Text style={styles.infoBoxText}>Issued Date: {invoiceData.date}</Text>
              <Text style={styles.infoBoxText}>Due Date: {invoiceData.dueDate}</Text>
              <Text style={styles.infoBoxText}>Prepared By: {invoiceData.preparedBy}</Text>
              {invoiceData.status && (
                <Text style={styles.infoBoxText}>Payment Status: {invoiceData.status}</Text>
              )}
            </View>
          </View>

          {/* Line Items Table */}
          <View style={styles.tableSection}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Item Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount (KES)</Text>
            </View>

            {invoiceData.items.map((item, idx) => (
              <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCellBold, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.qty}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>
                  {formatKES(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>
                  {formatKES(item.qty * item.unitPrice)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.totalLine}>
                <Text style={styles.totalLineLabel}>Net Subtotal</Text>
                <Text style={styles.totalLineValue}>{formatKES(subtotal)}</Text>
              </View>
              <View style={styles.totalLine}>
                <Text style={styles.totalLineLabel}>VAT ({invoiceData.taxRate}%)</Text>
                <Text style={styles.totalLineValue}>{formatKES(taxAmount)}</Text>
              </View>
              <View style={styles.grandTotalLine}>
                <Text style={styles.grandTotalLabel}>TOTAL PAYABLE</Text>
                <Text style={styles.grandTotalValue}>{formatKES(grandTotal)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.paymentRow}>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentBoxTitle}>M-Pesa Mobile Payment</Text>
              <Text style={styles.paymentText}>
                Paybill Business No: <Text style={styles.paymentTextBold}>247247</Text>{'\n'}
                Account Number: <Text style={styles.paymentTextBold}>{invoiceData.invoiceNumber}</Text>{'\n'}
                Send M-Pesa confirmation SMS to: <Text style={styles.paymentTextBold}>+254 700 555 199</Text>
              </Text>
            </View>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentBoxTitle}>Bank Electronic Transfer</Text>
              <Text style={styles.paymentText}>
                Bank: <Text style={styles.paymentTextBold}>Equity Bank Kenya</Text>{'\n'}
                Account Name: <Text style={styles.paymentTextBold}>TRICLINIUM SYSTEMS LTD</Text>{'\n'}
                Account No: <Text style={styles.paymentTextBold}>0180293847561</Text> | Branch: Westlands
              </Text>
            </View>
          </View>

          {/* Signature & Stamp */}
          <View style={styles.signatureRow}>
            <View>
              <Text style={{ fontSize: 7.5, color: '#64748b', marginBottom: 2 }}>
                Thank you for choosing TRICLINIUM SYSTEMS for your security solutions!
              </Text>
              <Text style={{ fontSize: 7, color: '#94a3b8' }}>
                Goods once sold remain the property of TRICLINIUM SYSTEMS until paid in full.
              </Text>
            </View>
            <View style={styles.signBlock}>
              <View style={styles.signLine} />
              <Text style={styles.signLabel}>Authorized Officer / Finance Stamp</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            TRICLINIUM SYSTEMS • Licensed Security Integrator • Westlands, Nairobi, Kenya
          </Text>
          <Text style={styles.footerBrand}>TRICLINIUM SYSTEMS</Text>
        </View>
      </Page>
    </Document>
  );
}
