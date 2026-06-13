import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { isValidDataRow, mapRowToResponse, parseCsv } from "@/lib/import/csv-parser";
import type { SurveyDataset } from "@/types/survey";
import { createHash } from "crypto";

async function main() {
  const csvPath =
    process.argv[2] ??
    path.join(
      process.cwd(),
      "data/raw/Rate Your Neighbourhood! (Responses) - Form Responses 1.csv"
    );

  const content = await readFile(csvPath, "utf-8");
  const rows = parseCsv(content);
  const skipped = rows.length - rows.filter(isValidDataRow).length;
  const validRows = rows.filter(isValidDataRow);
  const responses = validRows.map((row, i) => mapRowToResponse(row, i));

  const payload = JSON.stringify({ responses });
  const checksum = createHash("sha256").update(payload).digest("hex").slice(0, 16);

  const dataset: SurveyDataset = {
    meta: {
      version: "1.0.0",
      cityId: "delhi",
      importedAt: new Date().toISOString(),
      source: "csv",
      totalResponses: responses.length,
      checksum,
    },
    responses,
  };

  const outDir = path.join(process.cwd(), "public/data");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "delhi.json");
  await writeFile(outPath, JSON.stringify(dataset, null, 2));
  if (skipped > 0) {
    console.log(
      `Skipped ${skipped} rows (Valid Data = No). Imported ${responses.length} responses → ${outPath}`
    );
  } else {
    console.log(`Imported ${responses.length} responses → ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
