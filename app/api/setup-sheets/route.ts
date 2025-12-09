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

    // Get existing sheets first
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
    const existingSheetNames = spreadsheet.data.sheets?.map((s) => s.properties?.title) || []

    // Define all headers including the new Losses sheet
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
          "Total Sales",
          "Event",
          "Production Cost",
          "Investor Share",
          "Sales Payroll",
          "Packaging Payroll",
          "Savings",
          "Reinvestment",
        ],
      },
      { name: "Expenses", headers: ["ID", "Date", "Category", "Description", "Amount", "Notes"] },
      { name: "Withdrawals", headers: ["ID", "Date", "Type", "Amount", "Reason", "Notes"] },
      { name: "Summary", headers: ["Metric", "Value", "Last Updated"] },
      {
        name: "Losses",
        headers: [
          "ID",
          "Date",
          "Product",
          "Quantity",
          "Price",
          "Reason",
          "Potential Value" 
        ],
      },
      {
        name: "Customers",
        headers: ["Name", "Contact", "Location", "Description"]
      }
    ]

// Create or update sheets
for (const config of sheetConfigs) {
  if (!existingSheetNames.includes(config.name)) {
    // Create new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: { 
              title: config.name,
            },
          },
        }],
      },
    })

    // Add headers to the new sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${config.name}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [config.headers] },
    })
  } else {
    // Update headers in existing sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${config.name}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [config.headers] },
    })
  }
}


    return NextResponse.json({
      success: true,
      message: "Google Sheets setup complete! All sheets verified and created if needed.",
      sheetId,
    })
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Setup failed. Check your credentials and sheet permissions." }, { status: 500 })
  }
}
