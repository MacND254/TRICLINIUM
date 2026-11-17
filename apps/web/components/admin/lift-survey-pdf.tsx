// @ts-nocheck
import React from 'react';
import { Document, Page, View, Text, StyleSheet, Svg, Rect, Line, Polygon, G, Text as SvgText } from '@react-pdf/renderer';

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
    color: '#000000',
    padding: 18,
  },
  reportContainer: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    flexDirection: 'column',
    height: '100%',
  },
  // Top Header
  headerRow1: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  projectTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626', // Red banner as in sample
    letterSpacing: 0.5,
  },
  headerRow2: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  mainTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8', // Blue title as in sample
    letterSpacing: 0.3,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#000000',
    paddingLeft: 8,
  },
  dateLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginRight: 4,
  },
  dateValue: {
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  // Middle Technical Diagrams Row
  diagramsRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    flexDirection: 'row',
    height: 125,
    backgroundColor: '#ffffff',
  },
  diagramColShaft: {
    width: '37%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  diagramColEntrance: {
    width: '28%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  diagramColButton: {
    width: '18%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  diagramColPit: {
    width: '17%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  pitBoxRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    padding: 3,
  },
  pitBoxLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  pitBoxVal: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    marginTop: 1,
    textAlign: 'center',
  },
  overheadBoxRow: {
    padding: 3,
  },
  // Data Tables Container
  tablesRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    flexDirection: 'row',
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  tableColShaft: {
    width: '37%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  tableColEntrance: {
    width: '28%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  tableColButton: {
    width: '18%',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  tableColHeight: {
    width: '17%',
  },
  tableHeaderTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#ffffff',
  },
  tableHeaderCells: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#ffffff',
  },
  thCell: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    paddingVertical: 2,
    borderRightWidth: 0.5,
    borderRightColor: '#000000',
  },
  trReq: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    backgroundColor: '#ffffff',
  },
  tdReqLabel: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
    textAlign: 'center',
    paddingVertical: 1.5,
  },
  tdReqVal: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    textAlign: 'center',
    paddingVertical: 1.5,
    borderRightWidth: 0.5,
    borderRightColor: '#000000',
  },
  trRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    minHeight: 12,
  },
  tdCell: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    paddingVertical: 1.5,
    borderRightWidth: 0.5,
    borderRightColor: '#000000',
  },
  // Bottom Observations Section
  obsSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  obsTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginBottom: 3,
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
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  obsNum: {
    width: 14,
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
  },
  obsText: {
    flex: 1,
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    borderBottomWidth: 0.5,
    borderBottomColor: '#94a3b8',
    paddingBottom: 0.5,
  },
  // Sign-off / Signature Footer
  signSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
  },
  signBox: {
    width: '48%',
  },
  signTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  signLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  signLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    width: 70,
  },
  signValue: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000000',
    paddingBottom: 1,
  },
  watermarkBrand: {
    position: 'absolute',
    bottom: 2,
    right: 8,
    fontSize: 5.5,
    color: '#64748b',
    fontFamily: 'Helvetica',
  },
});

// ================= TECHNICAL DIAGRAM SVGS =================

function ShaftPlanSvg({ liftLabel = 'L1 ELE.' }: { liftLabel?: string }) {
  return (
    <Svg width="180" height="115" viewBox="0 0 210 135">
      {/* Outer & Inner Hoistway Wall Structure (Exclusive of walls) */}
      <Path
        d="M 24 104 L 24 20 L 186 20 L 186 104 L 132 104 L 132 90 L 168 90 L 168 34 L 42 34 L 42 90 L 78 90 L 78 104 Z"
        fill="#f1f5f9"
        stroke="#334155"
        strokeWidth="1.2"
      />

      {/* Lift Car Cabin (Red Rectangle in clear shaft void) */}
      <Rect
        x="64"
        y="42"
        width="82"
        height="38"
        fill="#fff1f2"
        stroke="#dc2626"
        strokeWidth="1.2"
      />
      <SvgText
        x="105"
        y="65"
        fontSize="9"
        fontFamily="Helvetica-Bold"
        fill="#dc2626"
        textAnchor="middle"
      >
        {liftLabel}
      </SvgText>

      {/* ================= INNER WALL DIMENSIONS (EXCLUSIVE OF WALLS) ================= */}

      {/* Dimension C (Rear Inner Wall Length - measuring between inner corners x=42 and x=168 at y=34) */}
      <Line x1="42" y1="32" x2="42" y2="10" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="168" y1="32" x2="168" y2="10" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="42" y1="14" x2="168" y2="14" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="42,14 47,12 47,16" fill="#000000" />
      <Polygon points="168,14 163,12 163,16" fill="#000000" />
      <SvgText x="105" y="11" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000" textAnchor="middle">C</SvgText>

      {/* Dimension D (Front Inner Wall Length - measuring between inner corners x=42 and x=168 at y=90) */}
      <Line x1="42" y1="92" x2="42" y2="118" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="168" y1="92" x2="168" y2="118" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="42" y1="114" x2="168" y2="114" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="42,114 47,112 47,116" fill="#000000" />
      <Polygon points="168,114 163,112 163,116" fill="#000000" />
      <SvgText x="105" y="124" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000" textAnchor="middle">D</SvgText>

      {/* Dimension A (Left Inner Wall Length - measuring between inner corners y=34 and y=90 at x=42) */}
      <Line x1="40" y1="34" x2="14" y2="34" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="40" y1="90" x2="14" y2="90" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="18" y1="34" x2="18" y2="90" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="18,34 16,39 20,39" fill="#000000" />
      <Polygon points="18,90 16,85 20,85" fill="#000000" />
      <SvgText x="9" y="66" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000" textAnchor="middle">A</SvgText>

      {/* Dimension B (Right Inner Wall Length - measuring between inner corners y=34 and y=90 at x=168) */}
      <Line x1="170" y1="34" x2="196" y2="34" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="170" y1="90" x2="196" y2="90" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />
      <Line x1="192" y1="34" x2="192" y2="90" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="192,34 190,39 194,39" fill="#000000" />
      <Polygon points="192,90 190,85 194,85" fill="#000000" />
      <SvgText x="201" y="66" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000" textAnchor="middle">B</SvgText>

      {/* Dimension E (Front Opening Width between return jambs x=78 to x=132) */}
      <Line x1="78" y1="98" x2="132" y2="98" stroke="#000000" strokeWidth="0.8" strokeDasharray="2,2" />
      <Polygon points="78,98 83,96 83,100" fill="#000000" />
      <Polygon points="132,98 127,96 127,100" fill="#000000" />
      <SvgText x="105" y="95" fontSize="8" fontFamily="Helvetica-Bold" fill="#000000" textAnchor="middle">E</SvgText>

      {/* Technical Sub-Annotation */}
      <SvgText x="105" y="132" fontSize="5" fontFamily="Helvetica" fill="#64748b" textAnchor="middle">
        INNER LENGTH OF SHAFT WALLS (EXCLUSIVE OF WALLS)
      </SvgText>
    </Svg>
  );
}

function EntranceViewSvg() {
  return (
    <Svg width="130" height="110" viewBox="0 0 140 125">
      {/* Dimension F (Width) - Top arrow */}
      <Line x1="25" y1="14" x2="125" y2="14" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="23,14 29,12 29,16" fill="#000000" />
      <Polygon points="127,14 121,12 121,16" fill="#000000" />
      <SvgText x="75" y="10" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000" textAnchor="middle">F</SvgText>

      {/* Dimension G (Height) - Left arrow */}
      <Line x1="14" y1="22" x2="14" y2="118" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="14,20 12,26 16,26" fill="#000000" />
      <Polygon points="14,120 12,114 16,114" fill="#000000" />
      <SvgText x="6" y="70" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000">G</SvgText>

      {/* Door Frame Outer Rectangle */}
      <Rect
        x="25"
        y="22"
        width="100"
        height="96"
        fill="#f8fafc"
        stroke="#000000"
        strokeWidth="1.2"
      />

      {/* Center Landing Door Opening Line (Split doors) */}
      <Line
        x1="75"
        y1="22"
        x2="75"
        y2="118"
        stroke="#000000"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    </Svg>
  );
}

function HallButtonCutoutSvg() {
  return (
    <Svg width="80" height="110" viewBox="0 0 90 125">
      {/* Dimension H (Width) - Top arrow */}
      <Line x1="20" y1="20" x2="60" y2="20" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="18,20 24,18 24,22" fill="#000000" />
      <Polygon points="62,20 56,18 56,22" fill="#000000" />
      <SvgText x="40" y="14" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000" textAnchor="middle">H</SvgText>

      {/* Cutout Box Rectangle */}
      <Rect
        x="20"
        y="26"
        width="40"
        height="76"
        fill="#f8fafc"
        stroke="#000000"
        strokeWidth="1.2"
      />

      {/* Dimension I (Height) - Right arrow */}
      <Line x1="70" y1="26" x2="70" y2="102" stroke="#000000" strokeWidth="0.8" />
      <Polygon points="70,24 68,30 72,30" fill="#000000" />
      <Polygon points="70,104 68,98 72,98" fill="#000000" />
      <SvgText x="76" y="67" fontSize="9" fontFamily="Helvetica-Bold" fill="#000000">I</SvgText>
    </Svg>
  );
}

// ================= SINGLE LIFT SHEET PAGE =================

function LiftReportPage({
  report,
  lift,
  liftIndex,
  totalLifts,
}: {
  report: LiftSurveyReportData;
  lift: LiftSectionData;
  liftIndex: number;
  totalLifts: number;
}) {
  const liftLabel = totalLifts > 1 ? `L${lift.liftNumber || liftIndex + 1} ELE.` : 'L1 ELE.';
  const liftSubtitle =
    totalLifts > 1
      ? `(LIFT ${lift.liftNumber || liftIndex + 1} OF ${totalLifts}: ${lift.liftName || `LIFT ${lift.liftNumber}`})`
      : '(SINGLE LIFT SHAFT)';

  // Build standard 12 observations list
  const observationsList: string[] = [];
  for (let i = 0; i < 12; i++) {
    observationsList.push(report.observations && report.observations[i] ? report.observations[i] : '');
  }

  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.reportContainer}>
        {/* Top Header - Project Name Banner */}
        <View style={styles.headerRow1}>
          <Text style={styles.projectTitle}>
            PROJECT NAME: {report.projectName.toUpperCase()}
          </Text>
        </View>

        {/* Title & Date Bar */}
        <View style={styles.headerRow2}>
          <Text style={styles.mainTitle}>
            TRICLINIUM SYSTEMS - BUILDING SURVEY REPORT {liftSubtitle}
          </Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>DATE:</Text>
            <Text style={styles.dateValue}>{report.date || new Date().toISOString().split('T')[0]}</Text>
          </View>
        </View>

        {/* Technical Diagrams Row */}
        <View style={styles.diagramsRow}>
          {/* Sketch 1: Shaft Plan */}
          <View style={styles.diagramColShaft}>
            <ShaftPlanSvg liftLabel={liftLabel} />
          </View>

          {/* Sketch 2: Entrance View */}
          <View style={styles.diagramColEntrance}>
            <EntranceViewSvg />
          </View>

          {/* Sketch 3: Hall Button Cut Out */}
          <View style={styles.diagramColButton}>
            <HallButtonCutoutSvg />
          </View>

          {/* Specifications Box */}
          <View style={styles.diagramColPit}>
            <View style={styles.pitBoxRow}>
              <Text style={styles.pitBoxLabel}>PIT DEPTH IN MM:-</Text>
              <Text style={styles.pitBoxVal}>{lift.pitDepth || 'not accessible'}</Text>
            </View>
            <View style={styles.overheadBoxRow}>
              <Text style={styles.pitBoxLabel}>OVERHEAD HEIGHT (MM):</Text>
              <Text style={styles.pitBoxVal}>{lift.overheadHeight || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Main Measurement Tables */}
        <View style={styles.tablesRow}>
          {/* Table 1: SHAFT PLAN */}
          <View style={styles.tableColShaft}>
            <Text style={styles.tableHeaderTitle}>SHAFT PLAN</Text>
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
              <Text style={[styles.tdReqLabel, { width: '20%', borderRightWidth: 0.5, borderRightColor: '#000' }]}>
                Required Dim.
              </Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.a || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.b || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.c || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%' }]}>{lift.requiredDimensions?.d || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '16%', borderRightWidth: 0 }]}>{lift.requiredDimensions?.e || ''}</Text>
            </View>

            {/* Floor Measurement Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={styles.trRow}>
                <Text style={[styles.tdCell, { width: '20%', fontFamily: 'Helvetica-Bold' }]}>{fl.floorName}</Text>
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
            <Text style={styles.tableHeaderTitle}>ENTRANCE VIEW</Text>
            <View style={styles.tableHeaderCells}>
              <Text style={[styles.thCell, { width: '30%' }]}>FLOOR NO</Text>
              <Text style={[styles.thCell, { width: '35%' }]}>F</Text>
              <Text style={[styles.thCell, { width: '35%', borderRightWidth: 0 }]}>G</Text>
            </View>

            {/* Required Dimensions Row */}
            <View style={styles.trReq}>
              <Text style={[styles.tdReqLabel, { width: '30%', borderRightWidth: 0.5, borderRightColor: '#000' }]}>
                Required Dim.
              </Text>
              <Text style={[styles.tdReqVal, { width: '35%' }]}>{lift.requiredDimensions?.f || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '35%', borderRightWidth: 0 }]}>{lift.requiredDimensions?.g || ''}</Text>
            </View>

            {/* Floor Measurement Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={styles.trRow}>
                <Text style={[styles.tdCell, { width: '30%', fontFamily: 'Helvetica-Bold' }]}>{fl.floorName}</Text>
                <Text style={[styles.tdCell, { width: '35%' }]}>{fl.f || ''}</Text>
                <Text style={[styles.tdCell, { width: '35%', borderRightWidth: 0 }]}>{fl.g || ''}</Text>
              </View>
            ))}
          </View>

          {/* Table 3: HALL BUTTON CUT OUT */}
          <View style={styles.tableColButton}>
            <Text style={styles.tableHeaderTitle}>HALL BUTTON CUT OUT</Text>
            <View style={styles.tableHeaderCells}>
              <Text style={[styles.thCell, { width: '50%' }]}>H</Text>
              <Text style={[styles.thCell, { width: '50%', borderRightWidth: 0 }]}>I</Text>
            </View>

            {/* Empty required row to align with siblings */}
            <View style={styles.trReq}>
              <Text style={[styles.tdReqVal, { width: '50%' }]}>{lift.requiredDimensions?.h || ''}</Text>
              <Text style={[styles.tdReqVal, { width: '50%', borderRightWidth: 0 }]}>{lift.requiredDimensions?.i || ''}</Text>
            </View>

            {/* Floor Measurement Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={styles.trRow}>
                <Text style={[styles.tdCell, { width: '50%' }]}>{fl.h || ''}</Text>
                <Text style={[styles.tdCell, { width: '50%', borderRightWidth: 0 }]}>{fl.i || ''}</Text>
              </View>
            ))}
          </View>

          {/* Table 4: FLOOR TO FLOOR HEIGHT */}
          <View style={styles.tableColHeight}>
            <Text style={styles.tableHeaderTitle}>FLOOR TO FLOOR HT</Text>
            <View style={styles.tableHeaderCells}>
              <Text style={[styles.thCell, { width: '45%' }]}>FLOOR</Text>
              <Text style={[styles.thCell, { width: '55%', borderRightWidth: 0 }]}>HT</Text>
            </View>

            {/* Required row to align */}
            <View style={styles.trReq}>
              <Text style={[styles.tdReqLabel, { width: '45%', borderRightWidth: 0.5, borderRightColor: '#000' }]}>-</Text>
              <Text style={[styles.tdReqVal, { width: '55%', borderRightWidth: 0 }]}>-</Text>
            </View>

            {/* Floor Height Rows */}
            {lift.floors?.map((fl, idx) => (
              <View key={idx} style={styles.trRow}>
                <Text style={[styles.tdCell, { width: '45%', fontFamily: 'Helvetica-Bold' }]}>{fl.floorName}</Text>
                <Text style={[styles.tdCell, { width: '55%', borderRightWidth: 0, fontFamily: 'Helvetica-Bold' }]}>
                  {fl.height || ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Observations / Comments */}
        <View style={styles.obsSection}>
          <Text style={styles.obsTitle}>OBSERVATION / COMMENTS:</Text>
          <View style={styles.obsGrid}>
            {/* Column 1: Items 1 - 6 */}
            <View style={styles.obsCol}>
              {observationsList.slice(0, 6).map((obs, idx) => (
                <View key={idx} style={styles.obsItem}>
                  <Text style={styles.obsNum}>{idx + 1}</Text>
                  <Text style={styles.obsText}>{obs || ''}</Text>
                </View>
              ))}
            </View>

            {/* Column 2: Items 7 - 12 */}
            <View style={styles.obsCol}>
              {observationsList.slice(6, 12).map((obs, idx) => (
                <View key={idx} style={styles.obsItem}>
                  <Text style={styles.obsNum}>{idx + 7}</Text>
                  <Text style={styles.obsText}>{obs || ''}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Signatures & Approvals */}
        <View style={styles.signSection}>
          {/* Survey Conducted By */}
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>SURVEY CONDUCTED BY:</Text>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>NAME:</Text>
              <Text style={styles.signValue}>{report.surveyorName || 'TRICLINIUM Lead Lift Surveyor'}</Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>SIGNATURE:</Text>
              <Text style={[styles.signValue, { fontStyle: 'italic', color: '#1e40af' }]}>
                {report.surveyorName ? `Verified & Signed (${report.surveyorName.split(' ')[0]})` : ''}
              </Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>DATE:</Text>
              <Text style={styles.signValue}>{report.surveyorSignDate || report.date}</Text>
            </View>
          </View>

          {/* Checked By Field Operation Director */}
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>CHECKED BY:</Text>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>FIELD OPERATION DIR.:</Text>
              <Text style={styles.signValue}>{report.directorName || 'Field Operations Director'}</Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>SIGNATURE:</Text>
              <Text style={[styles.signValue, { fontStyle: 'italic', color: '#1e40af' }]}>
                {report.directorName ? `Approved & Certified` : ''}
              </Text>
            </View>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>DATE:</Text>
              <Text style={styles.signValue}>{report.directorSignDate || report.date}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.watermarkBrand}>
          TRICLINIUM SYSTEMS · Engineering &amp; Lift Infrastructure Division · Westlands, Nairobi · Ref: {report.surveyNumber}
        </Text>
      </View>
    </Page>
  );
}

// ================= FULL DOCUMENT COMPONENT =================

export function BuildingSurveyReportPDF({ report }: { report: LiftSurveyReportData }) {
  const lifts = report.lifts && report.lifts.length > 0 ? report.lifts : [
    {
      liftNumber: 1,
      liftName: 'Lift 1',
      pitDepth: 'not accessible',
      overheadHeight: '4634',
      requiredDimensions: { a: '', b: '', c: '2004', d: '2000', e: '', f: '963', g: '2207', h: '', i: '' },
      floors: report.floorNames?.map((fn) => ({
        floorName: fn,
        a: '', b: '', c: '', d: '', e: '',
        f: '', g: '', h: '', i: '', height: '',
      })) || [],
    },
  ];

  return (
    <Document
      title={`Building Survey Report - ${report.projectName || 'Lift Survey'}`}
      author="TRICLINIUM SYSTEMS"
      subject="Elevator & Lift Shaft Building Survey Report"
      keywords="Lift Survey, Shaft Plan, Elevator Measurements, TRICLINIUM"
    >
      {lifts.map((lift, index) => (
        <LiftReportPage
          key={lift.liftNumber || index}
          report={report}
          lift={lift}
          liftIndex={index}
          totalLifts={lifts.length}
        />
      ))}
    </Document>
  );
}
