import { google } from "googleapis"
import { JWT } from "google-auth-library"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

   
  const dateValue = new Date(data.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const total = Number(data.quantity) * Number(data.price);
    const id = Date.now().toString();
    
    const row = [
      id,
      dateValue,
      data.employee,
      data.product,
      data.quantity,
      data.price,
      total,
      data.event || "Normal",
      data.productionCost,
      data.investorShare,
      data.salesPayroll,
      data.packagingPayroll,
      data.savings,
      data.reinvestment
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Sales!A:N",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] }
    });

    return Response.json({ 
      success: true, 
      data: { 
        id,
        ...data,
        total
      }
    });
  } catch (error) {
    console.error("Sales API error:", error);
    return Response.json({ error: "Failed to record sale" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Sales!A:N"
    })

    const rows = response.data.values || []
    const sales = rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      employee: row[2],
      product: row[3],
      quantity: Number(row[4]),
      price: Number(row[5]),
      total: Number(row[6]),
      event: row[7],
      productionCost: Number(row[8]),
      investorShare: Number(row[9]),
      salesPayroll: Number(row[10]),
      packagingPayroll: Number(row[11]),
      savings: Number(row[12]),
      reinvestment: Number(row[13])
    }))

    const uniqueDays = new Set(sales.map(sale => sale.date)).size;

    return Response.json({ 
      sales,
      uniqueDays 
    })
  } catch (error) {
    return Response.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}
