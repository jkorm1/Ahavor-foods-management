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
    const id = Date.now().toString();
    const dateValue = new Date(data.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });


 // Use the date directly as received from the form
    const row = [
      id,
      dateValue,
      data.category,
      data.description,
      data.amount
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Expenses!A:E",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] }
    })

    return Response.json({ success: true, data: { id, ...data } })
  } catch (error) {
    return Response.json({ error: "Failed to record expense" }, { status: 400 })
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
      range: "Expenses!A:E"
    })

    const rows = response.data.values || []
    const expenses = rows.slice(1).map((row) => ({
      id: row[0],
      date: row[1],
      category: row[2],
      description: row[3],
      amount: Number(row[4])
    }))

    return Response.json(expenses)
  } catch (error) {
    return Response.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return Response.json({ error: "Missing expense ID" }, { status: 400 });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    
    const sheets = google.sheets({ version: "v4", auth });

    // Get the spreadsheet metadata to find the Expenses sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
    });

    // Log all sheets for debugging
    console.log("All sheets:", spreadsheet.data.sheets?.map(s => ({
      title: s.properties?.title,
      sheetId: s.properties?.sheetId
    })));

    // Find the Expenses sheet by name
    const expensesSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === "Expenses"
    );

    if (!expensesSheet || !expensesSheet.properties?.sheetId) {
      console.error("Expenses sheet not found");
      return Response.json({ error: "Expenses sheet not found" }, { status: 404 });
    }

    console.log("Found Expenses sheet with ID:", expensesSheet.properties.sheetId);

    // First, get all data to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      range: "Expenses!A:E"
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);

    if (rowIndex === -1) {
      console.error("Expense not found with ID:", id);
      return Response.json({ error: "Expense not found" }, { status: 404 });
    }

    console.log("Deleting row at index:", rowIndex);

    // Delete the row using the correct sheet ID
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: expensesSheet.properties.sheetId, // Use the actual sheet ID
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });

    console.log("Successfully deleted expense with ID:", id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return Response.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}

