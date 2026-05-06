import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register fonts (uses Google Fonts — works in serverless)
Font.register({
  family: 'JetBrains Mono',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD0Tg.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDba2o-flEEny0FZhsfKuT_PmZqVAA.ttf',
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: 'Fraunces',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/fraunces/v32/6NUu8FOOZAAEzbm5n7p-Whu_BAmsHA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/fraunces/v32/6NUu8FOOZAAEzbm5n7p-Whu_DAmsHA.ttf', fontWeight: 700 },
  ],
});

const NAVY = '#0A1628';
const NAVY_DARK = '#050D1A';
const GOLD = '#FFC857';
const BONE = '#F5F1E6';
const BONE_DIM = '#A8A498';
const NAVY_BORDER = '#1A2D4D';

const styles = StyleSheet.create({
  page: {
    backgroundColor: NAVY,
    padding: 0,
    fontFamily: 'Fraunces',
    color: BONE,
    position: 'relative',
  },
  // Outer frame
  frame: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    borderWidth: 2,
    borderColor: GOLD,
  },
  innerFrame: {
    position: 'absolute',
    top: 32,
    left: 32,
    right: 32,
    bottom: 32,
    borderWidth: 0.5,
    borderColor: NAVY_BORDER,
  },
  // Corner ornaments
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

  logoWrap: {
    width: 80, height: 80,
    marginBottom: 16,
  },
  logo: { width: 80, height: 80 },

  brandLine: {
    fontFamily: 'JetBrains Mono',
    fontSize: 9,
    letterSpacing: 4,
    color: GOLD,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  brandSub: {
    fontFamily: 'JetBrains Mono',
    fontSize: 7,
    letterSpacing: 3,
    color: BONE_DIM,
    textTransform: 'uppercase',
    marginBottom: 32,
  },

  certTitle: {
    fontFamily: 'JetBrains Mono',
    fontSize: 22,
    fontWeight: 700,
    color: BONE,
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  certSubtitle: {
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
    color: GOLD,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 32,
  },

  presentedTo: {
    fontFamily: 'Fraunces',
    fontSize: 12,
    color: BONE_DIM,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  studentName: {
    fontFamily: 'Fraunces',
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
    fontFamily: 'Fraunces',
    fontSize: 12,
    color: BONE_DIM,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testTitle: {
    fontFamily: 'JetBrains Mono',
    fontSize: 16,
    color: BONE,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 16,
    maxWidth: 480,
  },
  scoreLine: {
    fontFamily: 'Fraunces',
    fontSize: 14,
    color: BONE,
    marginBottom: 32,
  },
  scoreValue: {
    color: GOLD,
    fontWeight: 700,
  },

  // Footer with metadata
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
    fontFamily: 'JetBrains Mono',
    fontSize: 7,
    letterSpacing: 2,
    color: BONE_DIM,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  footerValue: {
    fontFamily: 'JetBrains Mono',
    fontSize: 9,
    color: BONE,
  },
  footerCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  signature: {
    fontFamily: 'Fraunces',
    fontSize: 14,
    color: BONE,
    fontStyle: 'italic',
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BONE_DIM,
    paddingBottom: 4,
    paddingHorizontal: 24,
  },
  signatureLabel: {
    fontFamily: 'JetBrains Mono',
    fontSize: 7,
    color: BONE_DIM,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Bottom verification strip
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
    fontFamily: 'JetBrains Mono',
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
  issuedDate: string;          // formatted, e.g. "5 May 2026"
  verifyUrl: string;           // e.g. https://rema.../verify/REMA-2026-A7F3K9
  logoDataUri: string;         // base64-encoded PNG/JPEG of REMA Club logo
  instructorName?: string;
}

export function CertificateDocument({
  studentName,
  testTitle,
  score,
  certUid,
  issuedDate,
  verifyUrl,
  logoDataUri,
  instructorName = 'Ashish Revar',
}: CertificateData) {
  return (
    <Document
      title={`REMA Club Certificate - ${certUid}`}
      author="REMA Club"
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
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image src={logoDataUri} style={styles.logo} />
          </View>

          <Text style={styles.brandLine}>REMA CLUB</Text>
          <Text style={styles.brandSub}>Reverse · Reveal · Respond</Text>

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
          <Text style={styles.verifyText}>REMA CLUB · INDEPENDENT LEARNING INITIATIVE</Text>
        </View>
      </Page>
    </Document>
  );
}
