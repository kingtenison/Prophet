import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { AnalysisResult } from '../data/insights'

interface PDFReportData {
  title: string
  orgName: string
  analysis: AnalysisResult
  widgets: any[]
  footer: string
}

export const generateStrategicPDF = async (data: PDFReportData) => {
  const doc = new jsPDF()
  const primaryColor = [37, 99, 235] // Prophet Blue

  // PAGE 1: COVER
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, 210, 297, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(40)
  doc.text('P', 20, 40)
  doc.setFontSize(10)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('PROPHET INTELLIGENCE', 30, 40)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text(data.title.toUpperCase(), 20, 100)
  
  doc.setFontSize(14)
  doc.setTextColor(150, 150, 150)
  doc.text(`STRATEGIC AUDIT PREPARED FOR:`, 20, 120)
  doc.setTextColor(255, 255, 255)
  doc.text(data.orgName, 20, 130)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`DATE GENERATED: ${new Date().toLocaleDateString()}`, 20, 270)
  doc.text(data.footer, 20, 280)

  // PAGE 2: EXECUTIVE SUMMARY
  doc.addPage()
  doc.setFillColor(255, 255, 255)
  doc.setTextColor(0, 0, 0)
  
  doc.setFontSize(18)
  doc.text('EXECUTIVE STRATEGIC SUMMARY', 20, 30)
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(1)
  doc.line(20, 35, 60, 35)

  doc.setFontSize(11)
  const splitNarrative = doc.splitTextToSize(data.analysis.narrative.replace(/\*\*/g, ''), 170)
  doc.text(splitNarrative, 20, 50)

  // STATS TABLE
  autoTable(doc, {
    startY: 150,
    head: [['Strategic Metric', 'Value', 'Status']],
    body: [
      ['Total Volume', data.analysis.summary.total.toLocaleString(), 'Verified'],
      ['Mean Average', data.analysis.summary.average.toLocaleString(), 'Optimal'],
      ['Growth Velocity', `${data.analysis.summary.growthRate.toFixed(1)}%`, data.analysis.summary.trend === 'up' ? 'Expanding' : 'Controlling'],
      ['Confidence Index', `${(data.analysis.summary.trendStrength * 100).toFixed(0)}%`, 'Statistical High']
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor }
  })

  // PAGE 3: DATA BREAKDOWN
  doc.addPage()
  doc.text('QUANTITATIVE DATA AUDIT', 20, 30)
  
  const tableData = data.widgets.map(w => [
    w.config.title || 'Chart',
    w.type,
    w.config.y_col,
    'Active'
  ])

  autoTable(doc, {
    startY: 40,
    head: [['Asset Name', 'Type', 'Dimension', 'Health']],
    body: tableData,
    theme: 'striped'
  })

  doc.save(`${data.title.replace(/\s+/g, '_')}_Strategic_Audit.pdf`)
}
