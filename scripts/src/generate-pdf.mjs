import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const files = [
  { label: "Database Schema", path: "lib/db/src/schema/todos.ts" },
  { label: "OpenAPI Spec", path: "lib/api-spec/openapi.yaml" },
  { label: "API Routes — todos.ts", path: "artifacts/api-server/src/routes/todos.ts" },
  { label: "App Entry — App.tsx", path: "artifacts/todo-app/src/App.tsx" },
  { label: "Layout — layout.tsx", path: "artifacts/todo-app/src/components/layout.tsx" },
  { label: "Home Page — home.tsx", path: "artifacts/todo-app/src/pages/home.tsx" },
  { label: "Calendar Page — calendar.tsx", path: "artifacts/todo-app/src/pages/calendar.tsx" },
  { label: "Stats Page — stats.tsx", path: "artifacts/todo-app/src/pages/stats.tsx" },
  { label: "Create Todo — create-todo.tsx", path: "artifacts/todo-app/src/components/todo/create-todo.tsx" },
  { label: "Todo Item — todo-item.tsx", path: "artifacts/todo-app/src/components/todo/todo-item.tsx" },
  { label: "Todo List — todo-list.tsx", path: "artifacts/todo-app/src/components/todo/todo-list.tsx" },
];

const doc = new PDFDocument({ margin: 40, size: "A4" });
const outPath = "taskbook-source-code.pdf";
const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

// ── Cover page ──────────────────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, doc.page.height).fill("#1a1a2e");
doc.fill("#ffffff")
   .fontSize(32)
   .font("Helvetica-Bold")
   .text("Taskbook", 40, 200, { align: "center" });
doc.fontSize(16)
   .font("Helvetica")
   .fillColor("#aaaacc")
   .text("Full-Stack Todo Application — Source Code", 40, 250, { align: "center" });
doc.fillColor("#777799")
   .fontSize(11)
   .text("Stack: React + Vite  •  Express 5  •  PostgreSQL  •  Drizzle ORM", 40, 290, { align: "center" });
doc.text(`Generated: ${new Date().toDateString()}`, 40, 315, { align: "center" });

// ── Table of Contents ────────────────────────────────────────────────────────
doc.addPage();
doc.fill("#1a1a2e").rect(0, 0, doc.page.width, 60).fill();
doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold").text("Table of Contents", 40, 18);
doc.fillColor("#111111");

let y = 80;
files.forEach((f, i) => {
  doc.fontSize(11).font("Helvetica")
     .fillColor("#333333")
     .text(`${i + 1}.  ${f.label}`, 40, y)
     .fillColor("#888888")
     .text(f.path, 200, y);
  y += 22;
});

// ── Source files ─────────────────────────────────────────────────────────────
for (const file of files) {
  doc.addPage();

  // Section header bar
  doc.rect(0, 0, doc.page.width, 54).fill("#1a1a2e");
  doc.fillColor("#ffffff").fontSize(15).font("Helvetica-Bold").text(file.label, 40, 14);
  doc.fillColor("#8888bb").fontSize(10).font("Helvetica").text(file.path, 40, 34);

  const code = fs.readFileSync(file.path, "utf8");
  const lines = code.split("\n");

  doc.fillColor("#111111");
  let cy = 70;
  const lineHeight = 13;
  const pageBottom = doc.page.height - 40;

  for (let i = 0; i < lines.length; i++) {
    if (cy + lineHeight > pageBottom) {
      doc.addPage();
      cy = 40;
    }

    const lineNum = String(i + 1).padStart(4, " ");
    // Line number
    doc.fillColor("#aaaaaa").fontSize(8.5).font("Courier").text(lineNum, 40, cy, { width: 28, lineBreak: false });
    // Code
    const text = lines[i].replace(/\t/g, "  ");
    doc.fillColor("#111111").fontSize(8.5).font("Courier").text(text || " ", 72, cy, { width: 490, lineBreak: false });
    cy += lineHeight;
  }
}

doc.end();

stream.on("finish", () => {
  console.log(`PDF written to: ${outPath}`);
});
