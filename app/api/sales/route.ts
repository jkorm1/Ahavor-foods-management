import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { calculateSaleSplit } from "@/lib/financial-logic"
import { addSale } from "@/lib/transaction-store"

interface SaleData {
  date: string;
  employee: string;
  product: string;
  quantity: string | number;
  price: string | number;
  productionCost: number;
  investorShare: number;
  salesPayroll: number;
  packagingPayroll: number;
  savings: number;
  reinvestment: number;
  event: string; // Changed from eventType to event
}

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
   
    
    // Validate required fields
    if (!data.date || !data.employee || !data.product || !data.quantity || !data.price) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate numeric fields
    const numericFields = ['productionCost', 'investorShare', 'salesPayroll', 'packagingPayroll', 'savings', 'reinvestment'];
    for (const field of numericFields) {
      const value = Number(data[field]);
      if (isNaN(value) || value < 0) {
        return Response.json({ 
          error: `Invalid ${field}: ${data[field]}` 
        }, { status: 400 });
      }
      data[field] = value;
    }

    const total = Number(data.quantity) * Number(data.price);
    
    // Validate total
    if (isNaN(total) || total <= 0) {
      return Response.json({ error: "Invalid total amount" }, { status: 400 });
    }

    const sale = await addSale({
      date: data.date,
      employee: data.employee,
      product: data.product,
      quantity: Number(data.quantity),
      price: Number(data.price),
      total: Math.round(total * 100) / 100,
      productionCost: Math.round((total * 0.63) * 100) / 100,
      investorShare: Math.round((total * 0.12) * 100) / 100,
      salesPayroll: Math.round((total * 0.06944) * 100) / 100,
      packagingPayroll: Math.round((total * 0.06944) * 100) / 100,
      savings: Math.round((total * 0.05556) * 100) / 100,
      reinvestment: Math.round((total * 0.05556) * 100) / 100,
      event: data.event, // Now using single event field
    });

    return Response.json({ success: true, data: sale });
  } catch (error) {
    console.error("Sales API error:", error);
    return Response.json({ error: "Failed to record sale" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const { getSales } = await import("@/lib/transaction-store")
    const sales = await getSales()

     // Calculate unique days with sales
     const uniqueDays = new Set(sales.map(sale => sale.date)).size;

    return Response.json({ 
      sales,
      uniqueDays 
    })
  } catch (error) {
    return Response.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}
