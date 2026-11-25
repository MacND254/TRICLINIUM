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
  companyDetails?: {
    businessName?: string;
    businessTagline?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessWebsite?: string;
    businessKraPin?: string;
    mpesaEnabled?: boolean;
    bankEnabled?: boolean;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankBranch?: string;
    bankSwiftCode?: string;
    mpesaPaybill?: string;
    mpesaAccount?: string;
    mpesaPhone?: string;
    paymentInstructionsFootnote?: string;
  };
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
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    maxWidth: '62%',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 7.5,
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  companyDetailLine: {
    fontSize: 7.5,
    color: '#cbd5e1',
    marginBottom: 2.5,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  quotationLabel: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  quoteRef: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0ea5e9',
    marginBottom: 5,
  },
  headerDate: {
    fontSize: 7.5,
    color: '#cbd5e1',
    marginBottom: 2.5,
  },
  // Accent bar
  accentBar: {
    backgroundColor: '#0ea5e9',
    height: 3,
  },
  // Body
  body: {
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 16,
  },
  // Subject Banner
  subjectBanner: {
    backgroundColor: '#f8fafc',
    borderLeft: '4px solid #0ea5e9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 4,
    marginBottom: 12,
    borderBottom: '1px solid #e2e8f0',
    borderRight: '1px solid #e2e8f0',
    borderTop: '1px solid #e2e8f0',
  },
  subjectLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  subjectText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  // Two-column info row
  infoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeft: '3px solid #0ea5e9',
  },
  infoBoxTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 8.5,
    color: '#1e293b',
    marginBottom: 1.5,
  },
  infoBoxHighlight: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  // Table
  tableSection: {
    marginBottom: 10,
  },
  tableSectionTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottom: '1px solid #e2e8f0',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    gap: 12,
    marginTop: 12,
  },
  termsBox: {
    flex: 1,
    padding: 9,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderTop: '2px solid #0ea5e9',
  },
  termsTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 7.5,
    color: '#475569',
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 28,
    paddingVertical: 10,
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
  companyDetails?: QuotationData['companyDetails'];
}

export function QuotationPDF({ quoteData, companyDetails }: QuotationPDFProps) {
  const subtotal = quoteData.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const taxAmount = (subtotal * quoteData.taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const c = companyDetails || quoteData.companyDetails || {};
  const bName = (c.businessName ?? '').trim() || 'TRICLINIUM SYSTEMS';
  const bTagline = (c.businessTagline ?? '').trim();
  const bAddress = (c.businessAddress ?? '').trim();
  const bPhone = (c.businessPhone ?? '').trim();
  const bEmail = (c.businessEmail ?? '').trim();
  const bWebsite = (c.businessWebsite ?? '').trim();
  const bKraPin = (c.businessKraPin ?? '').trim();

  const isFlagEnabled = (val: unknown) => val !== false && val !== 'false' && val !== 0 && val !== '0';
  const mpesaEnabled = isFlagEnabled(c.mpesaEnabled);
  const bankEnabled = isFlagEnabled(c.bankEnabled);
  const mpesaPaybill = (c.mpesaPaybill ?? '').trim();
  const mpesaAccount = (c.mpesaAccount ?? '').trim();
  const mpesaPhone = (c.mpesaPhone ?? '').trim();
  const bankName = (c.bankName ?? '').trim();
  const bankAccountName = (c.bankAccountName ?? '').trim();
  const bankAccountNumber = (c.bankAccountNumber ?? '').trim();
  const bankBranch = (c.bankBranch ?? '').trim();
  const bankSwiftCode = (c.bankSwiftCode ?? '').trim();
  const footnote = (c.paymentInstructionsFootnote ?? '').trim();

  const hasMpesa = mpesaEnabled && Boolean(mpesaPaybill || mpesaAccount || mpesaPhone);
  const hasBank = bankEnabled && Boolean(bankName || bankAccountNumber || bankAccountName);

  const contactLine = [
    bPhone ? `Phone: ${bPhone}` : '',
    bEmail ? `Email: ${bEmail}` : '',
  ].filter(Boolean).join('  |  ');

  const webKraLine = [
    bWebsite ? `Web: ${bWebsite}` : '',
    bKraPin ? `KRA PIN: ${bKraPin}` : '',
  ].filter(Boolean).join('  |  ');

  return (
    <Document
      title={`Quotation ${quoteData.quoteRef}`}
      author={bName}
      subject="Official Quotation"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{bName}</Text>
            {bTagline ? <Text style={styles.companyTagline}>{bTagline}</Text> : null}
            {bAddress ? <Text style={styles.companyDetailLine}>{bAddress}</Text> : null}
            {contactLine ? <Text style={styles.companyDetailLine}>{contactLine}</Text> : null}
            {webKraLine ? <Text style={styles.companyDetailLine}>{webKraLine}</Text> : null}
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

              {/* Payment Method Footnote */}
              {(hasMpesa || hasBank || footnote) && (
                <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#cbd5e1' }}>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 2 }}>
                    Accepted Payment Methods:
                  </Text>
                  {hasMpesa && (
                    <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 1.5 }}>
                      • {[
                        mpesaPaybill ? `M-Pesa Paybill: ${mpesaPaybill}` : 'M-Pesa',
                        mpesaAccount ? `Account: ${mpesaAccount}` : '',
                        mpesaPhone ? `Confirmation SMS: ${mpesaPhone}` : '',
                      ].filter(Boolean).join(' | ')}
                    </Text>
                  )}
                  {hasBank && (
                    <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 1.5 }}>
                      • {[
                        bankName ? `Bank EFT / RTGS: ${bankName}` : 'Bank EFT / RTGS',
                        bankAccountNumber ? `Acc: ${bankAccountNumber}` : '',
                        bankAccountName ? `Name: ${bankAccountName}` : '',
                        bankBranch ? `Branch: ${bankBranch}` : '',
                        bankSwiftCode ? `SWIFT: ${bankSwiftCode}` : '',
                      ].filter(Boolean).join(' | ')}
                    </Text>
                  )}
                  {footnote ? (
                    <Text style={{ fontSize: 6.5, color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                      Note: {footnote}
                    </Text>
                  ) : null}
                </View>
              )}
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
          <Text style={styles.footerBrand}>{bName}</Text>
        </View>
      </Page>
    </Document>
  );
}
