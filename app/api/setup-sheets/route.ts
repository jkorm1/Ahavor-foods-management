import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

export async function POST(request: NextRequest) {
  try {
    const { sheetId, credentials } = await request.json()

    if (!sheetId || !credentials) {
      return NextResponse.json({ error: "Missing sheetId or credentials" }, { status: 400 })
    }

    // Initialize Google Sheets
    const parsedCredentials = JSON.parse(credentials)
    const auth = new JWT({
      email: parsedCredentials.client_email,
      key: parsedCredentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    // Always clear all sheets first
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "Sales!A:Z"
    })
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "Expenses!A:Z"
    })
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "Withdrawals!A:Z"
    })
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: "Summary!A:Z"
    })

    // Define all headers
    const sheetConfigs = [
      {
        name: "Sales",
        headers: [
          "ID",
          "Date",
          "Employee",
          "Product",
          "Quantity",
          "Price",
          "Total",
          "Business Fund",
          "Employee Share",
          "Investor Share",
          "Savings",
        ],
      },
      { name: "Expenses", headers: ["ID", "Date", "Category", "Description", "Amount", "Notes"] },
      { name: "Withdrawals", headers: ["ID", "Date", "Type", "Amount", "Reason", "Notes"] },
      { name: "Summary", headers: ["Metric", "Value", "Last Updated"] },
    ]

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
    const existingSheetNames = spreadsheet.data.sheets?.map((s) => s.properties?.title) || []

    // Create or update sheets
    for (const config of sheetConfigs) {
      if (!existingSheetNames.includes(config.name)) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: { title: config.name },
              },
            }],
          },
        })
      }

      // Always update headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${config.name}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [config.headers] },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Google Sheets cleared and rebuilt with correct structure!",
      sheetId,
    })
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Setup failed. Check your credentials and sheet permissions." }, { status: 500 })
  }
}
