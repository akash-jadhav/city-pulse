import { isValidDataRow, mapRowToResponse, parseCsv } from "@/lib/import/csv-parser";
import {
  buildCityDatasets,
  formatCitySummary,
} from "@/lib/import/build-city-datasets";
import { enrichResponsesWithCityNames } from "@/lib/import/geocode";
import { loadSurveyCsvContent } from "@/lib/import/fetch-sheet-csv";

async function main() {
  const sourcePath = process.argv[2];
  const { content, source } = await loadSurveyCsvContent(sourcePath);
  console.log(`Loading survey data from ${source}`);

  const rows = parseCsv(content);
  const skipped = rows.length - rows.filter(isValidDataRow).length;
  const validRows = rows.filter(isValidDataRow);
  const mapped = validRows.map((row, i) => mapRowToResponse(row, i));
  const responses = await enrichResponsesWithCityNames(mapped);
  const { manifest, writtenFiles } = await buildCityDatasets(responses);

  const summary = formatCitySummary(manifest);
  console.log(
    `Geocoded ${responses.length} responses → ${manifest.cities.length} cities: ${summary}`
  );
  console.log(`Wrote ${writtenFiles.join(", ")}`);

  if (skipped > 0) {
    console.log(`Skipped ${skipped} rows (Valid Data = No).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
