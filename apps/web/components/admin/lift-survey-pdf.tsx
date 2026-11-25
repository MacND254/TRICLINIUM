// @ts-nocheck
import React from 'react';
import { Document, Page, View, Text, StyleSheet, Svg, Rect, Line, Polygon, G, Text as SvgText, Image as PdfImage } from '@react-pdf/renderer';
import { SHAFT_PLAN_IMAGE_DATA_URI } from '@/lib/shaft-plan-image';

export interface LiftFloorMeasurement {
  floorName: string;
  // Shaft Plan (mm)
  a: string;
  b: string;
  c: string;
  d: string;
  e: string;
  // Entrance View (mm)
  f: string;
  g: string;
  // Hall Button Cut Out (mm)
  h: string;
  i: string;
  // Floor to Floor Height (mm)
  height: string;
}

export interface LiftSectionData {
  liftNumber: number;
  liftName: string;
  pitDepth: string;
  overheadHeight: string;
  requiredDimensions: {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
    g: string;
    h: string;
    i: string;
  };
  floors: LiftFloorMeasurement[];
}

export interface LiftSurveyReportData {
  surveyNumber: string;
  projectName: string;
  clientName?: string;
  siteLocation?: string;
  buildingName?: string;
  date: string;
  numberOfLifts: number;
  numberOfStops: number;
  floorNames: string[];
  status?: string;
  lifts: LiftSectionData[];
  observations: string[];
  surveyorName?: string;
  surveyorSignDate?: string;
  directorName?: string;
  directorSignDate?: string;
  notes?: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    padding: 14,
  },
  reportContainer: {
    borderWidth: 1.5,
    borderColor: '#0f172a',
    borderRadius: 4,
    borderStyle: 'solid',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },

  // ================= 1. EXECUTIVE BRAND HEADER =================
  brandHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLeft: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#38bdf8',
    letterSpacing: 1.5,
    marginBottom: 2.5,
  },
  companyTagline: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    marginBottom: 3,
    letterSpacing: 0.8,
  },
  companyDetails: {
    fontSize: 6,
    color: '#cbd5e1',
  },
  brandRight: {
    alignItems: 'flex-end',
  },
  reportBadge: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  reportRef: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#38bdf8',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerMeta: {
    fontSize: 6.5,
    color: '#94a3b8',
    marginTop: 1.5,
  },

  // Signature Triclinium Accent Bar
  accentBar: {
    backgroundColor: '#0284c7',
    height: 3,
  },

  // ================= 2. PROJECT & SITE SUMMARY RIBBON =================
  summaryRibbon: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'column',
  },
  summaryLabel: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginTop: 1,
  },
  targetBadge: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#0284c7',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  targetBadgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
  },

  // ================= 3. TECHNICAL DIAGRAMS ROW =================
  diagramsRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    flexDirection: 'row',
    height: 118,
    backgroundColor: '#ffffff',
  },
  diagramColShaft: {
    width: '37%',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  diagramColEntrance: {
    width: '28%',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  diagramColButton: {
    width: '18%',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  diagramColPit: {
    width: '17%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 3.5,
    backgroundColor: '#f8fafc',
  },
  diagramHeaderRibbon: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 2,
  },

  // Pit Depth & Overhead Cards
  paramCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 3,
    padding: 4,
    marginBottom: 3,
  },
  paramLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  paramValue: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginTop: 2,
    textAlign: 'center',
  },

  // ================= 4. MAIN ENGINEERING DATA TABLES =================
  tablesRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    flexDirection: 'row',
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  tableColShaft: {
    width: '37%',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  tableColEntrance: {
    width: '28%',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  tableColButton: {
    width: '18%',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  tableColHeight: {
    width: '17%',
  },
  tableHeaderTitle: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 2.5,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tableHeaderCells: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    backgroundColor: '#1e293b',
  },
  thCell: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 2,
    color: '#94a3b8',
    borderRightWidth: 0.5,
    borderRightColor: '#334155',
  },
  // Required Dimensions Row (Brand Highlighted)
  trReq: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    backgroundColor: '#f0f9ff',
  },
  tdReqLabel: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
    textAlign: 'center',
    paddingVertical: 2,
    borderRightWidth: 0.5,
    borderRightColor: '#cbd5e1',
  },
  tdReqVal: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'center',
    paddingVertical: 2,
    borderRightWidth: 0.5,
    borderRightColor: '#cbd5e1',
  },
  // Floor Rows (Zebra striped)
  trRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    minHeight: 11.5,
  },
  trRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    minHeight: 11.5,
  },
  tdCell: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    paddingVertical: 1.5,
    color: '#1e293b',
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0',
  },
  tdFloorName: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 1.5,
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    borderRightWidth: 0.5,
    borderRightColor: '#cbd5e1',
  },
  tdHeightCell: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 1.5,
    color: '#0369a1',
    backgroundColor: '#f0f9ff',
  },

  // ================= 5. OBSERVATIONS & COMMENTS =================
  obsSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    backgroundColor: '#f8fafc',
  },
  obsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  obsTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    letterSpacing: 0.4,
  },
  obsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  obsCol: {
    width: '49%',
  },
  obsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1.5,
  },
  obsNum: {
    width: 14,
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
  },
  obsText: {
    flex: 1,
    fontSize: 6.2,
    fontFamily: 'Helvetica',
    color: '#334155',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 0.5,
  },

  // ================= 6. OFFICIAL SIGNATURES & VALIDATION =================
  signSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    backgroundColor: '#ffffff',
  },
  signBox: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    padding: 4,
    backgroundColor: '#ffffff',
  },
  signTitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0284c7',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  signLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1.5,
  },
  signLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    width: 65,
  },
  signValue: {
    fontSize: 6.2,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 0.5,
  },

  // ================= 7. EXECUTIVE FOOTER WATERMARK =================
  footerBar: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 5.5,
    color: '#94a3b8',
    fontFamily: 'Helvetica',
  },
  footerBrandHighlight: {
    color: '#38bdf8',
    fontFamily: 'Helvetica-Bold',
  },
  footerRef: {
    fontSize: 5.5,
    color: '#cbd5e1',
    fontFamily: 'Helvetica-Bold',
  },
});

// ================= TECHNICAL DIAGRAM SVGS & IMAGES =================

function ShaftPlanImage() {
  return (
    <PdfImage
      src={SHAFT_PLAN_IMAGE_DATA_URI}
      style={{
        width: 148,
        height: 98,
        objectFit: 'contain',
      }}
    />
  );
}

function EntranceViewSvg() {
  return (
    <Svg width="125" height="106" viewBox="0 0 140 125">
      {/* Dimension F (Width) - Top arrow */}
      <Line x1="25" y1="14" x2="125" y2="14" stroke="#0284c7" strokeWidth="0.8" />
      <Polygon points="23,14 29,12 29,16" fill="#0284c7" />
      <Polygon points="127,14 121,12 121,16" fill="#0284c7" />
      <SvgText x="75" y="10" fontSize="9" fontFamily="Helvetica-Bold" fill="#0f172a" textAnchor="middle">
        F
      </SvgText>

      {/* Dimension G (Height) - Left arrow */}
      <Line x1="14" y1="22" x2="14" y2="118" stroke="#0284c7" strokeWidth="0.8" />
      <Polygon points="14,20 12,26 16,26" fill="#0284c7" />
      <Polygon points="14,120 12,114 16,114" fill="#0284c7" />
      <SvgText x="6" y="70" fontSize="9" fontFamily="Helvetica-Bold" fill="#0f172a">
        G
      </SvgText>

      {/* Door Frame Outer Rectangle */}
      <Rect
        x="25"
        y="22"
        width="100"
        height="96"
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth="1.2"
      />

      {/* Center Landing Door Opening Line (Split doors) */}
      <Line
        x1="75"
        y1="22"
        x2="75"
        y2="118"
        stroke="#0284c7"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    </Svg>
  );
}

function HallButtonCutoutSvg() {
  return (
    <Svg width="75" height="106" viewBox="0 0 90 125">
      {/* Dimension H (Width) - Top arrow */}
      <Line x1="20" y1="20" x2="60" y2="20" stroke="#0284c7" strokeWidth="0.8" />
      <Polygon points="18,20 24,18 24,22" fill="#0284c7" />
      <Polygon points="62,20 56,18 56,22" fill="#0284c7" />
      <SvgText x="40" y="14" fontSize="9" fontFamily="Helvetica-Bold" fill="#0f172a" textAnchor="middle">
        H
      </SvgText>

      {/* Cutout Box Rectangle */}
      <Rect
        x="20"
        y="26"
        width="40"
        height="76"
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth="1.2"
      />

      {/* Dimension I (Height) - Right arrow */}
      <Line x1="70" y1="26" x2="70" y2="102" stroke="#0284c7" strokeWidth="0.8" />
      <Polygon points="70,24 68,30 72,30" fill="#0284c7" />
      <Polygon points="70,104 68,98 72,98" fill="#0284c7" />
      <SvgText x="76" y="67" fontSize="9" fontFamily="Helvetica-Bold" fill="#0f172a">
        I
      </SvgText>
    </Svg>
  );
}

// ================= SINGLE LIFT SHEET PAGE =================

function LiftReportPage({
  report,
  lift,
  liftIndex,
  totalLifts,
  companyDetails,
}: {
  report: LiftSurveyReportData;
  lift: LiftSectionData;
  liftIndex: number;
  totalLifts: number;
  companyDetails?: any;
}) {
  const liftLabel = totalLifts > 1 ? `L${lift.liftNumber || liftIndex + 1} ELE.` : 'L1 ELE.';

  // Build standard 12 observations list
  const observationsList: string[] = [];
  for (let i = 0; i < 12; i++) {
    observationsList.push(report.observations && report.observations[i] ? report.observations[i] : '');
  }

  const bName = (companyDetails?.businessName ?? '').trim() || 'TRICLINIUM SYSTEMS';
  const bTagline = (companyDetails?.businessTagline ?? '').trim();
  const bAddress = (companyDetails?.businessAddress ?? '').trim();
  const bPhone = (companyDetails?.businessPhone ?? '').trim();
  const bKraPin = (companyDetails?.businessKraPin ?? '').trim();

  const detailParts = [
    bAddress,
    bPhone ? `Tel: ${bPhone}` : '',
    bKraPin ? `KRA PIN: ${bKraPin}` : '',
  ].filter(Boolean);

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.reportContainer}>
        {/* 1. Executive Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.brandLeft}>
            <Text style={styles.companyName}>{bName}</Text>
            {bTagline ? <Text style={styles.companyTagline}>{bTagline}</Text> : null}
            {detailParts.length > 0 ? (
              <Text style={styles.companyDetails}>
                {detailParts.join('  ·  ')}
              </Text>
            ) : null}
          </View>
          <View style={styles.brandRight}>
            <Text style={styles.reportBadge}>BUILDING SURVEY REPORT</Text>
            <Text style={styles.reportRef}>{report.surveyNumber}</Text>
            <Text style={styles.headerMeta}>
              Date: {report.date || new Date().toISOString().split('T')[0]} | Status: {report.status || 'OFFICIAL'}
            </Text>
          </View>
        </View>

        {/* Brand Accent Bar */}
        <View style={styles.accentBar} />

        {/* 2. Project & Site Summary Ribbon */}
        <View style={styles.summaryRibbon}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Project Name</Text>
            <Text style={styles.summaryValue}>{report.projectName.toUpperCase()}</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Client / Premises</Text>
            <Text style={[styles.summaryValue, { color: '#334155' }]}>
              {report.clientName || report.buildingName || 'COMMERCIAL COMPLEX'}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Site Location</Text>
            <Text style={[styles.summaryValue, { color: '#334155' }]}>
              {report.siteLocation || 'NAIROBI'}
            </Text>
          </View>

          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>
              {lift.liftName || `LIFT ${lift.liftNumber || liftIndex + 1}`} ({liftIndex + 1} OF {totalLifts}) · {report.floorNames?.length || 0} STOPS
            </Text>
          </View>
        </View>

        {/* 3. Technical Diagrams Row */}
        <View style={styles.diagramsRow}>
          {/* Sketch 1: Shaft Plan */}
          <View style={styles.diagramColShaft}>
            <Text style={styles.diagramHeaderRibbon}>1. Shaft Plan Dimensions</Text>
            <ShaftPlanImage />
          </View>

          {/* Sketch 2: Entrance View */}
          <View style={styles.diagramColEntrance}>
            <Text style={styles.diagramHeaderRibbon}>2. Entrance View Dimensions</Text>
            <EntranceViewSvg />
          </View>

          {/* Sketch 3: Hall Button Cut Out */}
          <View style={styles.diagramColButton}>
            <Text style={styles.diagramHeaderRibbon}>3. Hall Button Cut Out</Text>
            <HallButtonCutoutSvg />
          </View>

          {/* Vertical Parameters Cards */}
          <View style={styles.diagramColPit}>
            <Text style={[styles.diagramHeaderRibbon, { textAlign: 'left', marginBottom: 4 }]}>
              4. Vertical Parameters
            </Text>

            <View style={styles.paramCard}>
              <Text style={styles.paramLabel}>Pit Depth (MM)</Text>
              <Text style={styles.paramValue}>{lift.pitDepth || 'not accessible'}</Text>
            </View>

            <View style={styles.paramCard}>
              <Text style={styles.paramLabel}>Overhead Height (MM)</Text>
              <Text style={styles.paramValue}>{lift.overheadHeight || '-'}</Text>
            </View>
          </View>
        </View>

        {/* 4. Main Measurement Tables */}
        <View style={styles.tablesRow}>
          {/* Table 1: SHAFT PLAN */}
          <View style={styles.tableColShaft}>
            <Text style={styles.tableHeaderTitle}>SHAFT PLAN (MM)</Text>
            <View style={styles.tableHeaderCells}>
              <Text style={[styles.thCell, { width: '20%' }]}>FLOOR NO</Text>
              <Text style={[styles.thCell, { width: '16%' }]}>A</Text>
              <Text style={[styles.thCell, { width: '16%' }]}>B</Text>
              <Text style={[styles.thCell, { width: '16%' }]}>C</Text>
              <Text style={[styles.thCell, { width: '16%' }]}>D</Text>
              <Text style={[styles.thCell, { width: '16%', borderRightWidth: 0 }]}>E</Text>
            </View>

            {/* Required Dimensions Row */}
            <View style={styles.trReq}>
              <Text style={[styles.tdReqLabel, { width: '20%' }]}>Required Dim.</Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.a || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.b || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.c || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.d || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%', borderRightWidth: 0 }]}>
                {lift.requiredDimensions?.e || ''}
              </Text>
            </View>

            {/* Floor Measurement Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={idx % 2 === 1 ? styles.trRowAlt : styles.trRow}>
                <Text style={[styles.tdFloorName, { width: '20%' }]}>{fl.floorName}</Text>
                <Text style={[styles.tdCell, { width: '16%' }]}>{fl.a || ''}</Text>
                <Text style={[styles.tdCell, { width: '16%' }]}>{fl.b || ''}</Text>
                <Text style={[styles.tdCell, { width: '16%' }]}>{fl.c || ''}</Text>
                <Text style={[styles.tdCell, { width: '16%' }]}>{fl.d || ''}</Text>
                <Text style={[styles.tdCell, { width: '16%', borderRightWidth: 0 }]}>{fl.e || ''}</Text>
              </View>
            ))}
          </View>

          {/* Table 2: ENTRANCE VIEW */}
          <View style={styles.tableColEntrance}>
            <Text style={styles.tableHeaderTitle}>ENTRANCE VIEW (MM)</Text>
            <View style={styles.tableHeaderCells}>
              <Text style={[styles.thCell, { width: '30%' }]}>FLOOR NO</Text>
              <Text style={[styles.thCell, { width: '35%' }]}>F</Text>
              <Text style={[styles.thCell, { width: '35%', borderRightWidth: 0 }]}>G</Text>
            </View>

            {/* Required Dimensions Row */}
            <View style={styles.trReq}>
              <Text style={[styles.tdReqLabel, { width: '30%' }]}>Required Dim.</Text>
              <Text style={[styles.tdReqVal, { width: '35%' }]}>{lift.requiredDimensions?.f || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '35%', borderRightWidth: 0 }]}>
                {lift.requiredDimensions?.g || ''}
              </Text>
            </View>

            {/* Floor Measurement Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={idx % 2 === 1 ? styles.trRowAlt : styles.trRow}>
                <Text style={[styles.tdFloorName, { width: '30%' }]}>{fl.floorName}</Text>
                <Text style={[styles.tdCell, { width: '35%' }]}>{fl.f || ''}</Text>
                <Text style={[styles.tdCell, { width: '35%', borderRightWidth: 0 }]}>{fl.g || ''}</Text>
              </View>
            ))}
          </View>

          {/* Table 3: HALL BUTTON CUT OUT */}
          <View style={styles.tableColButton}>
            <Text style={styles.tableHeaderTitle}>HALL BUTTON CUT OUT (MM)</Text>
            <View style={styles.tableHeaderCells}>
              <Text style={[styles.thCell, { width: '50%' }]}>H</Text>
              <Text style={[styles.thCell, { width: '50%', borderRightWidth: 0 }]}>I</Text>
            </View>

            {/* Required Row */}
            <View style={styles.trReq}>
              <Text style={[styles.tdReqVal, { width: '50%' }]}>{lift.requiredDimensions?.h || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '50%', borderRightWidth: 0 }]}>
                {lift.requiredDimensions?.i || ''}
              </Text>
            </View>

            {/* Floor Measurement Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={idx % 2 === 1 ? styles.trRowAlt : styles.trRow}>
                <Text style={[styles.tdCell, { width: '50%' }]}>{fl.h || ''}</Text>
                <Text style={[styles.tdCell, { width: '50%', borderRightWidth: 0 }]}>{fl.i || ''}</Text>
              </View>
            ))}
          </View>

          {/* Table 4: FLOOR TO FLOOR HEIGHT */}
          <View style={styles.tableColHeight}>
            <Text style={styles.tableHeaderTitle}>FLOOR HEIGHT (MM)</Text>
            <View style={styles.tableHeaderCells}>
              <Text style={[styles.thCell, { width: '45%' }]}>FLOOR</Text>
              <Text style={[styles.thCell, { width: '55%', borderRightWidth: 0 }]}>HT</Text>
            </View>

            {/* Required row to align */}
            <View style={styles.trReq}>
              <Text style={[styles.tdReqLabel, { width: '45%' }]}>-</Text>
              <Text style={[styles.tdReqVal, { width: '55%', borderRightWidth: 0 }]}>-</Text>
            </View>

            {/* Floor Height Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={idx % 2 === 1 ? styles.trRowAlt : styles.trRow}>
                <Text style={[styles.tdFloorName, { width: '45%' }]}>{fl.floorName}</Text>
                <Text style={[styles.tdHeightCell, { width: '55%' }]}>
                  {fl.height || ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5. Observations / Technical Comments */}
        <View style={styles.obsSection}>
          <View style={styles.obsTitleRow}>
            <Text style={styles.obsTitle}>OBSERVATIONS &amp; SITE TECHNICAL NOTES:</Text>
          </View>
          <View style={styles.obsGrid}>
            {/* Column 1: Items 1 - 6 */}
            <View style={styles.obsCol}>
              {observationsList.slice(0, 6).map((obs, idx) => (
                <View key={idx} style={styles.obsItem}>
                  <Text style={styles.obsNum}>{(idx + 1).toString().padStart(2, '0')}.</Text>
                  <Text style={styles.obsText}>{obs || ''}</Text>
                </View>
              ))}
            </View>

            {/* Column 2: Items 7 - 12 */}
            <View style={styles.obsCol}>
              {observationsList.slice(6, 12).map((obs, idx) => (
                <View key={idx} style={styles.obsItem}>
                  <Text style={styles.obsNum}>{(idx + 7).toString().padStart(2, '0')}.</Text>
                  <Text style={styles.obsText}>{obs || ''}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 6. Signatures & Official Validation */}
        <View style={styles.signSection}>
          {/* Survey Conducted By */}
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>SURVEY CONDUCTED &amp; VERIFIED BY:</Text>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>LEAD SURVEYOR:</Text>
              <Text style={styles.signValue}>{report.surveyorName || 'TRICLINIUM Lead Lift Surveyor'}</Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>VERIFICATION:</Text>
              <Text style={[styles.signValue, { color: '#0284c7', fontFamily: 'Helvetica-Bold' }]}>
                {report.surveyorName ? `✓ Field Verified & Digitally Recorded (${report.surveyorName.split(' ')[0]})` : '✓ Field Survey Logged'}
              </Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>DATE:</Text>
              <Text style={styles.signValue}>{report.surveyorSignDate || report.date}</Text>
            </View>
          </View>

          {/* Checked By Field Operation Director */}
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>CHECKED &amp; APPROVED BY (DIRECTOR / ENG.):</Text>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>APPROVAL AUTH.:</Text>
              <Text style={styles.signValue}>{report.directorName || 'Field Operations Director'}</Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>CERTIFICATION:</Text>
              <Text style={[styles.signValue, { color: '#0284c7', fontFamily: 'Helvetica-Bold' }]}>
                {report.directorName ? `✓ Certified for Lift Shaft Compliance` : '✓ Pending Engineering Review'}
              </Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>DATE:</Text>
              <Text style={styles.signValue}>{report.directorSignDate || report.date}</Text>
            </View>
          </View>
        </View>

        {/* 7. Executive Footer Bar */}
        <View style={styles.footerBar}>
          <Text style={styles.footerBrand}>
            <Text style={styles.footerBrandHighlight}>TRICLINIUM SYSTEMS</Text> · Elevator &amp; Escalator Engineering Division · Precision Infrastructure Analytics
          </Text>
          <Text style={styles.footerRef}>
            Ref: {report.surveyNumber} · Sheet {liftIndex + 1} of {totalLifts}
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ================= FULL DOCUMENT COMPONENT =================

export function BuildingSurveyReportPDF({
  report,
  companyDetails,
}: {
  report: LiftSurveyReportData;
  companyDetails?: any;
}) {
  const lifts = report.lifts && report.lifts.length > 0 ? report.lifts : [
    {
      liftNumber: 1,
      liftName: 'Lift 1',
      pitDepth: '',
      overheadHeight: '',
      requiredDimensions: { a: '', b: '', c: '', d: '', e: '', f: '', g: '', h: '', i: '' },
      floors: report.floorNames?.map((fn) => ({
        floorName: fn,
        a: '', b: '', c: '', d: '', e: '',
        f: '', g: '', h: '', i: '', height: '',
      })) || [],
    },
  ];

  const bName = companyDetails?.businessName || 'TRICLINIUM SYSTEMS';

  return (
    <Document
      title={`Building Survey Report - ${report.projectName || 'Lift Survey'}`}
      author={bName}
      subject="Elevator & Lift Shaft Building Survey Report"
      keywords="Lift Survey, Shaft Plan, Elevator Measurements, TRICLINIUM SYSTEMS"
    >
      {lifts.map((lift, index) => (
        <LiftReportPage
          key={lift.liftNumber || index}
          report={report}
          lift={lift}
          liftIndex={index}
          totalLifts={lifts.length}
          companyDetails={companyDetails}
        />
      ))}
    </Document>
  );
}
