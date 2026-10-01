import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#334155', backgroundColor: '#ffffff', paddingBottom: 60 },
  headerBox: { backgroundColor: '#059669', padding: 40, paddingBottom: 35, flexDirection: 'row', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'column' },
  monogramBox: { width: 42, height: 42, backgroundColor: '#ffffff', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  monogramText: { color: '#059669', fontSize: 18, fontWeight: 'bold' },
  logoImage: { width: 42, height: 42, borderRadius: 6, marginBottom: 12, objectFit: 'contain', backgroundColor: '#ffffff', padding: 2 },
  businessName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  businessSubtitle: { fontSize: 10, color: '#a7f3d0' },
  headerRight: { alignItems: 'flex-end', justifyContent: 'flex-end' },
  quoteLabel: { fontSize: 9, color: '#a7f3d0', textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' },
  quoteValue: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
  content: { padding: 40, paddingTop: 30 },
  sectionLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, fontWeight: 'bold', letterSpacing: 1 },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  clientCompany: { fontSize: 11, color: '#475569' },
  clientSection: { marginBottom: 35 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#ecfdf5', padding: 12, borderBottomWidth: 2, borderBottomColor: '#10b981' },
  tableHeaderCell: { fontSize: 9, color: '#059669', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: 'center' },
  colPrice: { width: 80, textAlign: 'right' },
  summarySection: { flexDirection: 'row', marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  notesContainer: { flex: 1, paddingRight: 30 },
  notesTitle: { fontSize: 9, color: '#0f172a', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 6 },
  notesText: { fontSize: 9, color: '#64748b', lineHeight: 1.5, marginBottom: 15 },
  totalsContainer: { width: 200 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 11, color: '#64748b' },
  totalValue: { fontSize: 11, color: '#0f172a', fontWeight: 'bold' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 4 },
  grandTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  grandTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#cbd5e1' }
});

export const QuotePDF = ({ quote, client, lineItems, profile }: any) => {
  const bizName = profile?.business_name || 'My Field Service Business';
  const monogram = bizName.substring(0, 2).toUpperCase();
  
  // Custom or Fallback text
  const customPaymentText = profile?.payment_instructions || `Please make checks payable to ${bizName}. Electronic payments can be arranged upon request. A deposit may be required before work commences.`;
  const customTermsText = profile?.terms_conditions || `This estimate is valid for 30 days from the date of issue. Final invoice amounts may vary slightly based on unforeseen material costs or expanded scope of work approved by the client.`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBox}>
          <View style={styles.headerLeft}>
            {profile?.logo_url ? (
              <Image src={profile.logo_url} style={styles.logoImage} />
            ) : (
              <View style={styles.monogramBox}>
                <Text style={styles.monogramText}>{monogram}</Text>
              </View>
            )}
            <Text style={styles.businessName}>{bizName}</Text>
            <Text style={styles.businessSubtitle}>{profile?.contact_email || 'Professional Field Service'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteLabel}>Quote / Estimate</Text>
            <Text style={styles.quoteValue}>#{quote?.id?.substring(0, 6).toUpperCase()}</Text>
            <Text style={styles.quoteLabel}>Date Issued</Text>
            <Text style={styles.quoteValue}>{new Date(quote?.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.clientSection}>
            <Text style={styles.sectionLabel}>Prepared For</Text>
            <Text style={styles.clientName}>{client?.name}</Text>
            {client?.company && <Text style={styles.clientCompany}>{client?.company}</Text>}
          </View>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Amount</Text>
          </View>
          
          {lineItems?.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</Text>
            </View>
          ))}
          
          <View style={styles.summarySection}>
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Payment Instructions</Text>
              <Text style={styles.notesText}>{customPaymentText}</Text>
              
              <Text style={styles.notesTitle}>Terms & Conditions</Text>
              <Text style={styles.notesText}>{customTermsText}</Text>
            </View>
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>${Number(quote?.total_amount).toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Taxes (0%)</Text>
                <Text style={styles.totalValue}>$0.00</Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>${Number(quote?.total_amount).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.footer}>Thank you for your business. Generated by SoloBid.</Text>
      </Page>
    </Document>
  );
};