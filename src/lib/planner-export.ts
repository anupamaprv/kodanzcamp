import { CAMPS, SUMMER_WEEKS, weekLabel } from "@/lib/camps";
import type { Activity, Kid, Plan } from "@/lib/family";

export function calendarRows(kids: Kid[], plans: Plan[], activities: Activity[]) {
  return kids.flatMap((kid) => SUMMER_WEEKS.map((week) => ({
    kid, week,
    camps: plans.filter((p) => p.kid_id === kid.id && p.week === week).map((p) => CAMPS.find((c) => c.id === p.camp_id)).filter((c) => c !== undefined),
    activities: activities.filter((a) => a.week === week && (a.kid_id === null || a.kid_id === kid.id)),
  })));
}

const escapeIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");

export function buildPlannerIcs(kids: Kid[], plans: Plan[], activities: Activity[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kodanz//Family Summer//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Kodanz summer 2027"];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  for (const row of calendarRows(kids, plans, activities)) {
    const end = new Date(`${row.week}T12:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 5);
    const events = [
      ...row.camps.map((c) => ({ id: c.id, title: c.name, location: c.address, description: `${c.provider}${c.hours ? ` · ${c.hours}` : ""}` })),
      ...row.activities.map((a) => ({ id: a.id, title: a.label, location: "", description: "Personal activity" })),
    ];
    for (const event of events) lines.push("BEGIN:VEVENT", `UID:${row.kid.id}-${event.id}-${row.week}@kodanz`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${row.week.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, "")}`, `SUMMARY:${escapeIcs(`${row.kid.name}: ${event.title}`)}`, `LOCATION:${escapeIcs(event.location)}`, `DESCRIPTION:${escapeIcs(event.description)}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  // RFC 5545 folds at 75 octets, not characters (child names can be Unicode).
  return lines.map((line) => {
    const parts: string[] = [];
    let chunk = "";
    let bytes = 0;
    for (const char of line) {
      const length = new TextEncoder().encode(char).length;
      if (bytes + length > 75) { parts.push(chunk); chunk = " "; bytes = 1; }
      chunk += char; bytes += length;
    }
    parts.push(chunk);
    return parts.join("\r\n");
  }).join("\r\n") + "\r\n";
}

export async function buildPlannerPdf(kids: Kid[], plans: Plan[], activities: Activity[]) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  // Fixed document palette; independent of the app's theme.
  const ink = rgb(0.12, 0.23, 0.3), teal = rgb(0.15, 0.5, 0.48), lilac = rgb(0.48, 0.3, 0.6);
  const safe = (s: string) => s.replace(/[^\x20-\x7e\xa0-\xff]/g, "-");
  for (const kid of kids) {
    const page = pdf.addPage([842, 595]);
    const text = (s: string, x: number, y: number, size = 10, color = ink, strong = false) => page.drawText(safe(s), { x, y, size, font: strong ? bold : font, color });
    text("KODANZ / SUMMER 2027", 32, 557, 13, teal, true);
    text(`${kid.name} - Full summer calendar`, 32, 530, 21, ink, true);
    text("June 7 - September 3, 2027  |  Planned, not booked", 32, 510);
    text("WEEK", 40, 483, 9, ink, true);
    text("CAMPS / PERSONAL ACTIVITIES", 175, 483, 9, ink, true);
    calendarRows([kid], plans, activities).forEach((row, index) => {
      const y = 453 - index * 31;
      page.drawRectangle({ x: 32, y: y - 9, width: 778, height: 30, color: row.activities.length ? rgb(0.96, 0.93, 0.98) : index % 2 ? rgb(0.95, 0.97, 0.97) : rgb(1, 1, 1) });
      text(weekLabel(row.week), 40, y, 10, ink, true);
      const names = [...row.camps.map((c) => c.name), ...row.activities.map((a) => a.label)];
      const label = safe(names.join(" / ") || "Open - no camp planned");
      let size = 10;
      while (size > 5 && font.widthOfTextAtSize(label, size) > 615) size -= 0.5;
      let fitted = label;
      while (font.widthOfTextAtSize(fitted, size) > 615) fitted = fitted.slice(0, -4) + "...";
      text(fitted, 175, y, size, row.activities.length ? lilac : row.camps.length ? teal : ink);
    });
    text("Teal: camps   |   Purple rows: personal activities", 32, 26, 9);
  }
  return new Blob([new Uint8Array(await pdf.save())], { type: "application/pdf" });
}

export function downloadCalendar(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function deliverCalendar(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if (error instanceof Error && error.name === "AbortError") return; }
  }
  downloadCalendar(blob, filename);
}