import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const NAVY = '#0A1628';
const GOLD = '#FFC857';
const BONE = '#F5F1E6';
const BONE_DIM = '#A8A498';
const NAVY_BORDER = '#1A2D4D';

const styles = StyleSheet.create({
  page: {
    backgroundColor: NAVY,
    padding: 0,
    fontFamily: 'Times-Roman',
    color: BONE,
    position: 'relative',
  },
  frame: {
    position: 'absolute',
    top: 24, left: 24, right: 24, bottom: 24,
    borderWidth: 2,
    borderColor: GOLD,
  },
  innerFrame: {
    position: 'absolute',
    top: 32, left: 32, right: 32, bottom: 32,
    borderWidth: 0.5,
    borderColor: NAVY_BORDER,
  },
  cornerTL: {
    position: 'absolute', top: 24, left: 24,
    width: 48, height: 48,
    borderTopWidth: 4, borderLeftWidth: 4, borderColor: GOLD,
  },
  cornerTR: {
    position: 'absolute', top: 24, right: 24,
    width: 48, height: 48,
    borderTopWidth: 4, borderRightWidth: 4, borderColor: GOLD,
  },
  cornerBL: {
    position: 'absolute', bottom: 24, left: 24,
    width: 48, height: 48,
    borderBottomWidth: 4, borderLeftWidth: 4, borderColor: GOLD,
  },
  cornerBR: {
    position: 'absolute', bottom: 24, right: 24,
    width: 48, height: 48,
    borderBottomWidth: 4, borderRightWidth: 4, borderColor: GOLD,
  },

  content: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 72,
    paddingBottom: 48,
    alignItems: 'center',
  },

  brandLine: {
    fontFamily: 'Courier',
    fontSize: 9,
    letterSpacing: 4,
    color: GOLD,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  brandSub: {
    fontFamily: 'Courier',
    fontSize: 7,
    letterSpacing: 3,
    color: BONE_DIM,
    textTransform: 'uppercase',
    marginBottom: 32,
  },

  certTitle: {
    fontFamily: 'Courier',
    fontSize: 22,
    fontWeight: 700,
    color: BONE,
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  certSubtitle: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: GOLD,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 32,
  },

  presentedTo: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    color: BONE_DIM,
    marginBottom: 12,
  },
  studentName: {
    fontFamily: 'Times-Roman',
    fontSize: 36,
    fontWeight: 700,
    color: GOLD,
    marginBottom: 4,
    textAlign: 'center',
  },
  nameUnderline: {
    width: 240,
    height: 1,
    backgroundColor: GOLD,
    marginBottom: 24,
  },

  forCompletion: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    color: BONE_DIM,
    marginBottom: 8,
  },
  testTitle: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: BONE,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 16,
    maxWidth: 480,
  },
  scoreLine: {
    fontFamily: 'Times-Roman',
    fontSize: 14,
    color: BONE,
    marginBottom: 8,
  },
  scoreValue: {
    color: GOLD,
    fontWeight: 700,
  },
  appreciation: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: BONE_DIM,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 80,
  },

  footer: {
    position: 'absolute',
    bottom: 64,
    left: 80,
    right: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerCol: { flexDirection: 'column' },
  footerLabel: {
    fontFamily: 'Courier',
    fontSize: 7,
    letterSpacing: 2,
    color: BONE_DIM,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  footerValue: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: BONE,
  },
  footerCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  signature: {
    fontFamily: 'Times-Roman',
    fontSize: 14,
    color: BONE,
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BONE_DIM,
    paddingBottom: 4,
    paddingHorizontal: 24,
  },
  signatureLabel: {
    fontFamily: 'Courier',
    fontSize: 7,
    color: BONE_DIM,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  verifyStrip: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderTopColor: NAVY_BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verifyText: {
    fontFamily: 'Courier',
    fontSize: 7,
    color: BONE_DIM,
    letterSpacing: 1,
  },
});

export interface CertificateData {
  studentName: string;
  testTitle: string;
  score: number;
  certUid: string;
  issuedDate: string;
  verifyUrl: string;
  logoDataUri?: string;        // kept in interface for future use, not rendered
  instructorName?: string;
}

export function CertificateDocument({
  studentName,
  testTitle,
  score,
  certUid,
  issuedDate,
  verifyUrl,
  instructorName = 'Ashish Revar',
}: CertificateData) {
  return (
    <Document
      title={`EpochZero Learn Certificate - ${certUid}`}
      author="EpochZero Learn"
      subject={`Certificate of Completion for ${testTitle}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Decorative frames */}
        <View style={styles.frame} />
        <View style={styles.innerFrame} />
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />

        <View style={styles.content}>
          {/* Branding — no logo until added later */}
          <Text style={styles.brandLine}>EpochZero Learn</Text>
          <Text style={styles.brandSub}>Multi-Domain Tech Learning Hub</Text>

          <Text style={styles.certTitle}>Certificate</Text>
          <Text style={styles.certSubtitle}>of Completion</Text>

          <Text style={styles.presentedTo}>This certifies that</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <View style={styles.nameUnderline} />

          <Text style={styles.forCompletion}>has successfully completed the assessment</Text>
          <Text style={styles.testTitle}>{testTitle}</Text>

          <Text style={styles.scoreLine}>
            with a score of <Text style={styles.scoreValue}>{score}%</Text>
          </Text>

          <Text style={styles.appreciation}>
            Your effort and curiosity in pursuing this assessment is recognised and appreciated.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.footerLabel}>Issued On</Text>
            <Text style={styles.footerValue}>{issuedDate}</Text>
          </View>

          <View style={styles.footerCenter}>
            <Text style={styles.signature}>{instructorName}</Text>
            <Text style={styles.signatureLabel}>Course Instructor</Text>
          </View>

          <View style={[styles.footerCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.footerLabel}>Certificate ID</Text>
            <Text style={styles.footerValue}>{certUid}</Text>
          </View>
        </View>

        {/* Verification strip */}
        <View style={styles.verifyStrip}>
          <Text style={styles.verifyText}>VERIFY: {verifyUrl}</Text>
          <Text style={styles.verifyText}>EPOCHZERO LEARN · learn.epochzero.net</Text>
        </View>
      </Page>
    </Document>
  );
}
