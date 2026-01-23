import { google } from "googleapis"
import { JWT } from "google-auth-library"

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    // Get all data from sheets
    const [salesRes, expensesRes, withdrawalsRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Sales!A:N"
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Expenses!A:E"
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
        range: "Withdrawals!A:E"
      })
    ])

    // Process sales data
    const sales = (salesRes.data.values || []).slice(1).map((row) => ({
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

    // Process expenses data
    const expenses = (expensesRes.data.values || []).slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      category: row[2],
      description: row[3],
      amount: Number(row[4])
    }))

    // Process withdrawals data
    const withdrawals = (withdrawalsRes.data.values || []).slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      purpose: row[2],
      amount: Number(row[3]),
      type: row[4]
    }))

    // Calculate employee shares
    const employeeShares = sales.reduce((acc, sale) => {
      const existing = acc.find(e => e.employee === sale.employee)
      if (existing) {
        existing.totalShare += sale.salesPayroll + sale.packagingPayroll
        existing.salesCount += 1
      } else {
        acc.push({
          employee: sale.employee,
          totalShare: sale.salesPayroll + sale.packagingPayroll,
          salesCount: 1
        })
      }
      return acc
    }, [] as { employee: string; totalShare: number; salesCount: number }[])

    // Calculate financial summary
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0)
    const totalSavings = sales.reduce((sum, sale) => sum + sale.savings, 0)
    const totalReinvestment = sales.reduce((sum, sale) => sum + sale.reinvestment, 0)

    const summary = {
      totalSales,
      totalExpenses,
      totalWithdrawals,
      totalSavings,
      totalReinvestment,
      netProfit: totalSales - totalExpenses - totalWithdrawals,
      employeeShares
    }

    return Response.json(summary)
  } catch (error) {
    return Response.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
