import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    
    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;

    // Get all customer details from the Customers sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Customers!A:D",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json([]);
    }

    // Skip header row and map the data
    const customers = rows.slice(1).map((row) => ({
      name: row[0] || "",
      contact: row[1] || "",
      location: row[2] || "",
      description: row[3] || "",
    }));

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, contact, location, description } = await request.json();
    
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    
    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID!;

    // Add customer details to the Customers sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Customers!A:D",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[name, contact, location, description]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving customer details:", error);
    return NextResponse.json(
      { error: "Failed to save customer details" },
      { status: 500 }
    );
  }
}
