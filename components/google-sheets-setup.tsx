"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GoogleSheetsSetup() {
  const [sheetId, setSheetId] = useState(
    "1jxnOIYWWLz2GfGNmdntxHr30UD6o94cWZP2X73hFalw"
  );

  const credentials = {
    type: "service_account",
    project_id: "ahavor-management",
    private_key_id: "7acb3d1e3d78c928e3eea86fd24103c1e133115f",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCJNFSV0BT46UOl\nCjoaj0sWMDx3xQMMUC3RHaNnIf75rRgECdrRR7NOkxYL7g0k1yM7Q/yRn7w6NAsb\nh+Zp7TWKKeQvUSYIyZtOi9K07sfeoBZrRT9b3YwI/KIV6rvUkzdR1eVQEi1fClwB\nU1NObwCDMKgaWDbWGzJ3aq7r0c+XZAwg7kJLoZ3y0sbrBRWOTMwtY57dtxRwBvLx\nqoA0MQEeNRiWihA2Q5GpxIKTGUkoOUrUDRjPLZBjVh8na1DGFDJW329yS/zqnupF\nXcIz0+Kun/LPf7VGFVuQKhKtPvvPOt06HRq2MNcJM+YvCgSA2FRwppW5pS+wAQ7K\npV7Uk8svAgMBAAECggEAE92Y1awwLS4RFkdZzFitBYRsbOcAnvrI93s0Go2ojlwK\nmyMWJLEd/CV9zrJkAs6HkmAwpKEdLsw0Q4M00GeBFgUkvdkhCaqvKvtBweLE264Q\nMO3w04tLaE2z5jp7gbbjDp1Ku4I2QYmNcr+u0y9tQpF79XyKTAvaDcJLm2dgiEnE\n031FvKC8nYpL41Tr4Mp2nNIJGGw0P66ys8ir10zBqelQzKVmceea3YUKXb0W/shu\nr45QNhfLbzftgl12CedAe1BiUtfGj6d/94QfRZTHrKxCCzPuN7smauV1Jr6DP6Jb\nOuMNudWWljKfLqJZDqPK3xwEAMMuZsoAHPb+0i32AQKBgQC/KEpUqjbNAqTZpJgr\nb9od6vRT5SLXfGtHwAhylHQwYWuWIleTS/cEdXG37GxiA0/iV1dkLG3IU3AbIAwP\n8N0dQAvYMmUNe59iSJyDpM3TtHFQAT3iNX9/vnNNk8LveCbcZ02e+qTgl8gx9mRW\nZt8Zczk5oWb8SuAJ1YsvDwHILwKBgQC3vuBhllfe4PBZoZdfiZ/wnoWv93AYesW3\nzo64PMp3sKW3fq+/Rj2jfEA7wFjDiS4AifTQmgIG10mgyygZHEvDu8AYVgyBbiIZ\n3DdcyGD4MfLi0EEVryD0072fBvx+WQgAW7ghW3ep1F9kOQmd/t02fLcdwMzi3Vye\nJJTrBoptAQKBgQCwsWtTqyqQgZsjWlMWA4PYF6/URH7aNDVt0wF79+EWP1aVJhVR\nH+yqgGynF7BvQKR8kUNEYxTvEMEVMaA0s+2O9f58zsg9mEGRNZEG1jUzNR1wWFV9\nXPoHeGFYGfccJzG0lQBYrVHuEB6KoDfK7bfW7Hy+2oQ5PHSuYmcPDo4VHQKBgQCp\n2yqDK77pCtlEkitjps6SWYhN5ZfbGUtDIhAu4gtsX4ChwtvmHqGGSqr6UVH82AgN\neXo1h9jNyCCJIqRbqhujwiDOnmULFOszKq6G97kkVtAnucogqHb3u/EzW/r3NYg/\nBIqPU4WoGelgtZVdV6fY4atJNtxv75/ZlQmQxcgbAQKBgGtwbpB5kx1S7qLJjqe+\nbGgsKJDLCAEZjnP0VKeP9+F9NzbNUxkWD477yzds30i4/yChkoVW6hvQ+LoInLQr\n1HFXyObCNhYL014urfJ3UUeicDZ2XeOb4uswt473sDwiSG5yHT2Fl8BINqmyCv+u\nrxMETfAm7sw8qQLXXRwalCzp\n-----END PRIVATE KEY-----\n",
    client_email: "ahavor-management@ahavor-management.iam.gserviceaccount.com",
    client_id: "106430999739496610547",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/ahavor-management%40ahavor-management.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSetup = async () => {
    if (!sheetId) {
      setMessage("Please fill in the sheet ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/setup-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId,
          credentials: JSON.stringify(credentials),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "✅ Google Sheets connected! All tables and columns created automatically. Add these env vars to Vercel Vars section: NEXT_PUBLIC_GOOGLE_SHEET_ID and GOOGLE_SHEETS_CREDENTIALS"
        );
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6 bg-amber-50 border-amber-200">
      <h2 className="text-lg font-semibold mb-4">Connect Google Sheets</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Google Sheet ID (from URL)
          </label>
          <input
            type="text"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="1abc2def3ghi4jkl5mno6pqr7stu8vwx"
            className="w-full px-3 py-2 border border-amber-300 rounded-md"
          />
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Service Account Credentials
            </label>
            <div className="w-full px-3 py-2 border border-amber-300 rounded-md bg-gray-50">
              ✓ Service account configured
            </div>
          </div>
        </div>

        <Button onClick={handleSetup} disabled={loading}>
          {loading ? "Setting up..." : "Connect & Auto-Setup Google Sheets"}
        </Button>

        {message && (
          <p
            className={`text-sm ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-4 p-3 bg-white rounded border border-amber-200 text-sm">
          <p className="font-medium mb-2">What happens when you connect:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              Creates 6 sheets automatically: Sales, Expenses, Withdrawals,
              Summary, and Losses
            </li>
            <li>Adds all column headers to each sheet</li>
            <li>Preserves existing data in all sheets</li>
            <li>Only creates new sheets if they don't exist</li>
            <li>All data syncs in real-time to your Google Sheet</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
