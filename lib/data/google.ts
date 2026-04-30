/**
 * Fetch data from a public Google Sheet as CSV
 * URL format: https://docs.google.com/spreadsheets/d/ID/export?format=csv
 */
export async function fetchGoogleSheetData(url: string): Promise<string> {
  const sheetIdMatch = url.match(/\/d\/(.*?)(\/|$)/)
  if (!sheetIdMatch) throw new Error('Invalid Google Sheets URL. Make sure it contains the spreadsheet ID.')
  
  const sheetId = sheetIdMatch[1]
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
  
  const response = await fetch(exportUrl)
  if (!response.ok) throw new Error('Failed to fetch sheet data. Ensure the sheet is public or shared with "Anyone with the link".')
  
  return response.text()
}
