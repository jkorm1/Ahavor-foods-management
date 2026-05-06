// Update app/api/orders/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS
  if (!credentials) {
    throw new Error("Google Sheets credentials not configured")
  }

  const parsedCredentials = JSON.parse(credentials)
  const auth = new JWT({
    email: parsedCredentials.client_email,
    key: parsedCredentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  return google.sheets({ version: "v4", auth })
}

export async function GET(request: NextRequest) {
  try {
    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not configured")
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Orders!A2:I",
    })

    const rows = response.data.values || []
    
    // Check if there are any rows
    if (rows.length === 0) {
      return NextResponse.json([])
    }

    const orders = rows.map((row) => {
      try {
        return {
          orderId: row[0] || "",
          date: row[1] || "",
          customerName: row[2] || "",
          customerPhone: row[3] || "",
          email: row[4] || "",
          customerAddress: row[5] || "",
          items: row[6] ? JSON.parse(row[6]) : [],
          total: parseFloat(row[7]) || 0,
          note: row[8] || "",
          status: row[9] || "Pending",
        }
      } catch (error) {
        console.error("Error parsing order row:", error, row)
        return null
      }
    }).filter(order => order !== null) // Filter out any null values from parsing errors

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      )
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not configured")
    }

    // Find the row with the matching order ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Orders!A2:I",
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex((row) => row[0] === orderId)

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Update the status
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Orders!I${rowIndex + 2}`, // +2 for header and 0-based index
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[status]] },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order status" },
      { status: 500 }
    )
  }
}
