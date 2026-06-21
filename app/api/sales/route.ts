import { google } from "googleapis"
import { JWT } from "google-auth-library"

function buildRow(data: any) {
  const dateValue = new Date(data.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const id = data.id || (Date.now().toString() + Math.random().toString(36).slice(2, 7));
  const total = Number(data.quantity) * Number(data.price);
  const profitPerPiece = 12.00; // Total profit split per piece
  const actualProfit = total * (profitPerPiece / 25.00); // Converting to percentage of total sale

  return [
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
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Accept either a single sale object, or { sales: [...] } / a raw array for multiple sales at once
    const salesArray: any[] = Array.isArray(body)
      ? body
      : Array.isArray(body.sales)
        ? body.sales
        : [body];

    if (salesArray.length === 0) {
      return Response.json({ error: "No sales provided" }, { status: 400 });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!)
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    const sheets = google.sheets({ version: "v4", auth })

    const rows = salesArray.map((data, i) => {
      // Make sure each row gets a unique id even when submitted in the same millisecond
      const dataWithId = { ...data, id: data.id || (Date.now().toString() + "-" + i) };
      return buildRow(dataWithId);
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Sales!A:N",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: rows }
    });

    return Response.json({
      success: true,
      count: rows.length,
      data: salesArray.map((data, i) => ({
        id: rows[i][0],
        ...data,
        total: Number(data.quantity) * Number(data.price)
      }))
    });
  } catch (error) {
    console.error("Sales API error:", error);
    return Response.json({ error: "Failed to record sale(s)" }, { status: 500 });
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
    const sales = rows.slice(1).map((row) => {
      // Parse the date from the format "MM/DD/YYYY" to "YYYY-MM-DD"
      let dateStr = row[1] || "";
      if (dateStr) {
        const dateParts = dateStr.split("/");
        if (dateParts.length === 3) {
          dateStr = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
      }
      
      return {
        id: row[0],
        date: dateStr,
        employee: row[2],
        product: row[3],
        quantity: Number(row[4]) || 0,
        price: Number(row[5]) || 0,
        total: Number(row[6]) || 0,
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
      };
    });

    console.log("Processed sales data:", sales); // Debug log
    return Response.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return Response.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return Response.json({ error: "Missing sale ID" }, { status: 400 });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    
    const sheets = google.sheets({ version: "v4", auth });

    // Get the spreadsheet metadata to find the Sales sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
    });

    // Log all sheets for debugging
    console.log("All sheets:", spreadsheet.data.sheets?.map(s => ({
      title: s.properties?.title,
      sheetId: s.properties?.sheetId
    })));

    // Find the Sales sheet by name
    const salesSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === "Sales"
    );

    if (!salesSheet || !salesSheet.properties?.sheetId) {
      console.error("Sales sheet not found");
      return Response.json({ error: "Sales sheet not found" }, { status: 404 });
    }

    console.log("Found Sales sheet with ID:", salesSheet.properties.sheetId);

    // First, get all data to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Sales!A:R"
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);

    if (rowIndex === -1) {
      console.error("Sale not found with ID:", id);
      return Response.json({ error: "Sale not found" }, { status: 404 });
    }

    console.log("Deleting row at index:", rowIndex);

    // Delete the row using the correct sheet ID
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: salesSheet.properties.sheetId, // Use the actual sheet ID
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    console.log("Successfully deleted sale with ID:", id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return Response.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}