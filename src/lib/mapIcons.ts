/**
 * Map marker icons that Google Maps needs as raw values.
 * Office pin: a teardrop pin with a suitcase inside (handle, body, band and
 * two vertical straps), so it reads as "work" without a text letter. The
 * design is authored in a 36x54 box and drawn at 1.25x — at smaller sizes the
 * internal straps blur into the body. Self-contained SVG, so no icon font is
 * needed and no scaling is applied at draw time: the anchor below puts the
 * pin's tip exactly on the saved ZIP's coordinates.
 */
const SCALE = 1.25;
export const OFFICE_PIN = { width: 36 * SCALE, height: 54 * SCALE, tipX: 18 * SCALE, tipY: 51 * SCALE };

export function officePinIcon(g: any, color = "#7c4dbc") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 54" width="${OFFICE_PIN.width}" height="${OFFICE_PIN.height}">
<path d="M18 2.25C9.3 2.25 2.25 9.3 2.25 18c0 12 15.75 33 15.75 33S33.75 30 33.75 18c0-8.7-7.05-15.75-15.75-15.75z" fill="${color}" stroke="#16324a" stroke-width="1.4"/>
<path d="M13 15.4v-3.6a3.6 3.6 0 0 1 3.6-3.6h2.8a3.6 3.6 0 0 1 3.6 3.6v3.6" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
<rect x="9" y="15.4" width="18" height="11.6" rx="2.6" fill="#ffffff"/>
<rect x="9" y="19.6" width="18" height="3" fill="${color}"/>
<rect x="12.6" y="15.4" width="1.9" height="11.6" fill="${color}"/>
<rect x="21.5" y="15.4" width="1.9" height="11.6" fill="${color}"/>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    anchor: new g.maps.Point(OFFICE_PIN.tipX, OFFICE_PIN.tipY),
  };
}
