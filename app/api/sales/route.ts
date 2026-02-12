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
    const id = Date.now().toString();
      const total = Number(data.quantity) * Number(data.price);
    const profitPerPiece = 12.00; // Total profit split per piece
    const actualProfit = total * (profitPerPiece / 25.00); // Converting to percentage of total sale

    const row = [
      id,
      dateValue,
      data.employee,
      data.product,
      data.quantity,
      data.price,
      total,
      data.event || "Normal",
      total - actualProfit, // Production Cost (25 - 12 = 13)
      actualProfit * (1.20/12.00), // Tithe (1.20 of 12.00 profit)
      actualProfit * (1.50/12.00), // Founder Pay
      actualProfit * (1.00/12.00), // Business Savings
      actualProfit * (1.00/12.00), // Leadership Payroll
      actualProfit * (2.70/12.00), // Sales Payroll
      actualProfit * (0.30/12.00), // Sales Payroll Savings
      actualProfit * (0.50/12.00), // Packaging Payroll
      actualProfit * (1.80/12.00), // Investor Share
      actualProfit * (2.00/12.00)  // Reinvestment
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
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Sales!A:R" // Updated to include all columns
    });

    const rows = response.data.values || [];
    const sales = rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      employee: row[2],
      product: row[3],
      quantity: Number(row[4]),
      price: Number(row[5]),
      total: Number(row[6]),
      event: row[7] || "Normal",
      productionCost: Number(row[8]) || 0,
      tithe: Number(row[9]) || 0,
      founderPay: Number(row[10]) || 0,
      businessSavings: Number(row[11]) || 0,
      leadershipPayroll: Number(row[12]) || 0,
      salesPayroll: Number(row[13]) || 0,
      salesPayrollSavings: Number(row[14]) || 0,
      packagingPayroll: Number(row[15]) || 0,
      investorShare: Number(row[16]) || 0,
      reinvestment: Number(row[17]) || 0,
    }));

    return Response.json(sales);
  } catch (error) {
    return Response.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}
