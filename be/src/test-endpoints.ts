import http from "http";
import app from "./index";

async function runTests() {
  const server = http.createServer(app);
  const TEST_PORT = 5099;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`[Test Server] Listening on http://localhost:${TEST_PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://localhost:${TEST_PORT}`;

  try {
    // 1. Test Health endpoint
    console.log("\n1. Testing GET /api/health...");
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log(`Status: ${healthRes.status}`, healthData);

    // 2. Test AI Pattern endpoint
    console.log("\n2. Testing POST /api/ai/pattern...");
    const aiRes = await fetch(`${baseUrl}/api/ai/pattern`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: "Giáng sinh ấm áp" })
    });
    const aiData = await aiRes.json();
    console.log(`Status: ${aiRes.status}`, aiData.themeName, "Colors:", aiData.palette);

    // 3. Test Vector Export (SVG)
    console.log("\n3. Testing POST /api/export (SVG)...");
    const exportSvgRes = await fetch(`${baseUrl}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structureType: "tuck-top",
        dimensions: { length: 150, width: 90, height: 70, paperThickness: 0.4 },
        format: "svg"
      })
    });
    const exportSvgData = await exportSvgRes.json();
    console.log(`Status: ${exportSvgRes.status}`, exportSvgData.fileName, exportSvgData.downloadUrl);

    // 4. Test Vector Export (PDF with PDFKit)
    console.log("\n4. Testing POST /api/export (PDF)...");
    const exportPdfRes = await fetch(`${baseUrl}/api/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structureType: "tuck-top",
        dimensions: { length: 150, width: 90, height: 70, paperThickness: 0.4 },
        format: "pdf"
      })
    });
    const exportPdfData = await exportPdfRes.json();
    console.log(`Status: ${exportPdfRes.status}`, exportPdfData.fileName, exportPdfData.downloadUrl);

    // 5. Test Asset Upload via Base64
    console.log("\n5. Testing POST /api/assets/upload (Base64)...");
    // Minimal 1x1 transparent PNG in base64
    const sampleBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const uploadRes = await fetch(`${baseUrl}/api/assets/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64: sampleBase64,
        fileName: "test_logo.png"
      })
    });
    const uploadData = await uploadRes.json();
    console.log(`Status: ${uploadRes.status}`, uploadData);

    // 6. Test Static File Access
    console.log("\n6. Testing Static File Retrieval...");
    if (uploadData.asset?.url) {
      const staticRes = await fetch(`${baseUrl}${uploadData.asset.url}`);
      console.log(`Static file fetch status: ${staticRes.status}, Content-Type: ${staticRes.headers.get("content-type")}`);
    }

    console.log("\nAll endpoint tests finished successfully!");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
