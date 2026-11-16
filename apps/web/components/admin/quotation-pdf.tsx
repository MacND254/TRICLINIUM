// @ts-nocheck
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

export interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface QuotationData {
  quoteRef: string;
  subject?: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone?: string;
  items: LineItem[];
  taxRate: number; // e.g. 16 for 16%
  notes?: string;
  paymentTerms: string;
  preparedBy: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    padding: 0,
  },
  // Header
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 36,
    paddingVertical: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  companyName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
    letterSpacing: 2,
  },
  companyTagline: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 3,
    letterSpacing: 1,
  },
  companyDetails: {
    fontSize: 7,
    color: '#cbd5e1',
    marginTop: 4,
    lineHeight: 1.35,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  quotationLabel: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  quoteRef: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
    marginTop: 4,
  },
  headerDate: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 2,
  },
  // Accent bar
  accentBar: {
    backgroundColor: '#0ea5e9',
    height: 3,
  },
  // Body
  body: {
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 36,
  },
  // Subject Banner
  subjectBanner: {
    backgroundColor: '#f8fafc',
    borderLeft: '4px solid #0ea5e9',
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
  // Two-column info row
  infoRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  infoBox: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeft: '3px solid #0ea5e9',
  },
  infoBoxTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoBoxText: {
    fontSize: 9,
    color: '#1e293b',
    marginBottom: 2,
  },
  infoBoxHighlight: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  // Table
  tableSection: {
    marginBottom: 20,
  },
  tableSectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingVertical: 9,
    borderBottom: '1px solid #e2e8f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  // Column widths
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colUnit: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  // Totals
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  totalsBox: {
    width: 220,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderBottom: '1px solid #e2e8f0',
  },
  totalLineLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  totalLineValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    marginTop: 2,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
  },
  // Terms & Notes
  bottomRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 24,
  },
  termsBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderTop: '2px solid #0ea5e9',
  },
  termsTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  termsText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 36,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 7,
    color: '#475569',
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
    letterSpacing: 1,
  },
});

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface QuotationPDFProps {
  quoteData: QuotationData;
}

export function QuotationPDF({ quoteData }: QuotationPDFProps) {
  const subtotal = quoteData.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const taxAmount = (subtotal * quoteData.taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <Document
      title={`Quotation ${quoteData.quoteRef}`}
      author="TRICLINIUM"
      subject="Official Quotation"
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
              Email: sales@triclinium.co.ke | Web: www.triclinium.co.ke
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quotationLabel}>OFFICIAL QUOTATION</Text>
            <Text style={styles.quoteRef}>
              {quoteData.quoteRef
                ? quoteData.quoteRef.startsWith('QT-')
                  ? quoteData.quoteRef
                  : `QT-${quoteData.quoteRef.replace(/^QT-/, '')}`
                : ''}
            </Text>
            <Text style={styles.headerDate}>Date: {quoteData.date}</Text>
            <Text style={styles.headerDate}>Valid Until: {quoteData.validUntil}</Text>
          </View>
        </View>
        <View style={styles.accentBar} />

        {/* Body */}
        <View style={styles.body}>
          {/* Quotation Title / Scope of Work Banner at top */}
          {quoteData.subject ? (
            <View style={styles.subjectBanner}>
              <Text style={styles.subjectLabel}>Quotation Title / Scope of Work</Text>
              <Text style={styles.subjectText}>{quoteData.subject}</Text>
            </View>
          ) : null}

          {/* Client & Quote Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Prepared For</Text>
              <Text style={styles.infoBoxHighlight}>{quoteData.clientName}</Text>
              {quoteData.clientCompany && (
                <Text style={styles.infoBoxText}>{quoteData.clientCompany}</Text>
              )}
              <Text style={styles.infoBoxText}>{quoteData.clientEmail}</Text>
              {quoteData.clientPhone && (
                <Text style={styles.infoBoxText}>{quoteData.clientPhone}</Text>
              )}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Quote Details</Text>
              <Text style={styles.infoBoxHighlight}>{quoteData.quoteRef}</Text>
              <Text style={styles.infoBoxText}>Issued: {quoteData.date}</Text>
              <Text style={styles.infoBoxText}>Valid Until: {quoteData.validUntil}</Text>
              <Text style={styles.infoBoxText}>Prepared By: {quoteData.preparedBy}</Text>
            </View>
          </View>

          {/* Line Items Table */}
          <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>Line Items</Text>

            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>

            {/* Table Rows */}
            {quoteData.items.map((item, idx) => (
              <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCellBold, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.qty}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>
                  {formatCurrency(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>
                  {formatCurrency(item.qty * item.unitPrice)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsRow}>
            <View style={styles.totalsBox}>
              <View style={styles.totalLine}>
                <Text style={styles.totalLineLabel}>Subtotal</Text>
                <Text style={styles.totalLineValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.totalLine}>
                <Text style={styles.totalLineLabel}>Tax ({quoteData.taxRate}%)</Text>
                <Text style={styles.totalLineValue}>{formatCurrency(taxAmount)}</Text>
              </View>
              <View style={styles.grandTotalLine}>
                <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Terms & Notes */}
          <View style={styles.bottomRow}>
            <View style={styles.termsBox}>
              <Text style={styles.termsTitle}>Payment Terms</Text>
              <Text style={styles.termsText}>{quoteData.paymentTerms}</Text>
            </View>
            {quoteData.notes && (
              <View style={styles.termsBox}>
                <Text style={styles.termsTitle}>Notes &amp; Remarks</Text>
                <Text style={styles.termsText}>{quoteData.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This quotation is valid until {quoteData.validUntil}. Prices subject to change after expiry.
          </Text>
          <Text style={styles.footerBrand}>TRICLINIUM</Text>
        </View>
      </Page>
    </Document>
  );
}
