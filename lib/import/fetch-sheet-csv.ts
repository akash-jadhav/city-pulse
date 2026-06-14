import { readFile } from "fs/promises";
import path from "path";

export function normalizeToCsvExportUrl(input: string): string {
  const url = input.trim();
  const sheetIdMatch = url.match(
    /\/spreadsheets(?:\/u\/\d+)?\/d\/([a-zA-Z0-9-_]+)/
  );

  if (!sheetIdMatch) {
    throw new Error(
      "Not a Google Sheets URL — paste the link from your browser's address bar when viewing the Responses sheet."
    );
  }

  const sheetId = sheetIdMatch[1];
  const gidMatch = url.match(/[#?&]gid=(\d+)/);
  const gid = gidMatch?.[1] ?? "0";

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

export function buildGvizCsvUrl(sheetId: string, gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

export function getSheetFetchUrls(input: string): string[] {
  const exportUrl = normalizeToCsvExportUrl(input);
  const sheetIdMatch = exportUrl.match(/\/d\/([a-zA-Z0-9-_]+)\//);
  const gidMatch = exportUrl.match(/gid=(\d+)/);
  if (!sheetIdMatch) return [exportUrl];

  const gvizUrl = buildGvizCsvUrl(
    sheetIdMatch[1],
    gidMatch?.[1] ?? "0"
  );
  return [exportUrl, gvizUrl];
}

function sheetFetchUrlsFromExportUrl(exportUrl: string): string[] {
  const sheetIdMatch = exportUrl.match(/\/d\/([a-zA-Z0-9-_]+)\//);
  const gidMatch = exportUrl.match(/gid=(\d+)/);
  if (!sheetIdMatch) return [exportUrl];

  return [
    exportUrl,
    buildGvizCsvUrl(sheetIdMatch[1], gidMatch?.[1] ?? "0"),
  ];
}

export function getSheetCsvUrl(): string | null {
  const directUrl =
    process.env.GOOGLE_FORM_SHEET_CSV_URL?.trim() ??
    process.env.GOOGLE_FORM_SHEET_URL?.trim();
  if (directUrl) return normalizeToCsvExportUrl(directUrl);

  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  if (!sheetId) return null;

  const gid = process.env.GOOGLE_SHEET_GID?.trim() || "0";
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

export function getSheetFetchUrlList(): string[] | null {
  const directUrl =
    process.env.GOOGLE_FORM_SHEET_CSV_URL?.trim() ??
    process.env.GOOGLE_FORM_SHEET_URL?.trim();
  if (directUrl) return getSheetFetchUrls(directUrl);

  const exportUrl = getSheetCsvUrl();
  if (!exportUrl) return null;
  return sheetFetchUrlsFromExportUrl(exportUrl);
}

function looksLikeHtml(content: string): boolean {
  const trimmed = content.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html");
}

export async function fetchSheetCsv(urlOrUrls: string | string[]): Promise<string> {
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "CityPulse-Import/1.0",
        },
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          throw new Error(
            `Failed to fetch sheet (HTTP ${res.status}). Open the sheet → Share → set "Anyone with the link" to Viewer, then retry.`
          );
        }
        throw new Error(`Failed to fetch sheet (HTTP ${res.status}).`);
      }

      const content = await res.text();
      if (looksLikeHtml(content)) {
        throw new Error("Sheet returned HTML instead of CSV.");
      }

      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw (
    lastError ??
    new Error(
      'Could not fetch sheet as CSV. Open the sheet → Share → set "Anyone with the link" to Viewer, then retry.'
    )
  );
}

export async function loadSurveyCsvContent(sourcePath?: string): Promise<{
  content: string;
  source: string;
}> {
  if (sourcePath) {
    const absolute = path.isAbsolute(sourcePath)
      ? sourcePath
      : path.join(process.cwd(), sourcePath);
    const content = await readFile(absolute, "utf-8");
    return { content, source: absolute };
  }

  const urls = getSheetFetchUrlList();
  if (!urls) {
    throw new Error(
      "No survey source configured. Set GOOGLE_FORM_SHEET_URL (or GOOGLE_FORM_SHEET_CSV_URL, or GOOGLE_SHEET_ID + GOOGLE_SHEET_GID) in .env.local, or pass a local CSV path: npm run import:survey -- path/to/file.csv"
    );
  }

  const content = await fetchSheetCsv(urls);
  return { content, source: urls[0] };
}
