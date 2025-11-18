import { calculateSaleSplit } from "@/lib/financial-logic"
import { addSale } from "@/lib/transaction-store"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.date || !data.employee || !data.product || !data.quantity || !data.price) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const total = Number(data.quantity) * Number(data.price)
    
    // Validate the calculated values
    if (isNaN(total) || total <= 0) {
      return Response.json({ error: "Invalid total amount" }, { status: 400 })
    }

    const sale = await addSale({
      date: data.date,
      employee: data.employee,
      product: data.product,
      quantity: Number(data.quantity),
      price: Number(data.price),
      total: Math.round(total * 100) / 100,
      businessFund: Number(data.businessFund),
      employeeShare: Number(data.employeeShare),
      investorShare: Number(data.investorShare),
      savings: Number(data.savings),
    })

    return Response.json({ success: true, data: sale })
  } catch (error) {
    console.error("Sales API error:", error)
    return Response.json({ error: "Failed to record sale" }, { status: 500 })
  }
}


export async function GET() {
  try {
    const { getSales } = await import("@/lib/transaction-store")
    const sales = await getSales()
    return Response.json(sales)
  } catch (error) {
    return Response.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}
