/**
 * Map marker icons that Google Maps needs as raw values.
 * Office pin: a teardrop pin with a suitcase drawn inside, so it reads as
 * "work" without a text letter. Self-contained SVG so no icon font is needed.
 * Sizes are the SVG's own pixels: no scaling is applied, so the anchor below
 * puts the pin's tip exactly on the saved ZIP's coordinates.
 */
export const OFFICE_PIN = { width: 28, height: 42, tipX: 14, tipY: 40 };

export function officePinIcon(g: any, color = "#7c4dbc") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 42" width="28" height="42">
<path d="M14 1.75C7.23 1.75 1.75 7.23 1.75 14c0 9.33 12.25 25.67 12.25 25.67S26.25 23.33 26.25 14c0-6.77-5.48-12.25-12.25-12.25z" fill="${color}" stroke="#ffffff" stroke-width="1.6"/>
<path d="M11 11.9V9.4a2.4 2.4 0 0 1 2.4-2.4h1.2A2.4 2.4 0 0 1 17 9.4v2.5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
<rect x="7" y="11.9" width="14" height="9" rx="2" fill="#ffffff"/>
<rect x="7" y="15.2" width="14" height="2.3" fill="${color}"/>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    anchor: new g.maps.Point(OFFICE_PIN.tipX, OFFICE_PIN.tipY),
  };
}
