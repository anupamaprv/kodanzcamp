/**
 * Map marker icons that Google Maps needs as raw values.
 * Office pin: a teardrop pin with a suitcase drawn inside, so it reads as
 * "work" without a text letter. Self-contained SVG so no icon font is needed.
 */
export const OFFICE_PIN = { width: 24, height: 36, tipX: 12, tipY: 34 };

export function officePinIcon(g: any, color = "#7c4dbc") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
<path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 8 10.5 22 10.5 22S22.5 20 22.5 12c0-5.8-4.7-10.5-10.5-10.5z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
<path d="M9.6 10.4V8.6a1.9 1.9 0 0 1 1.9-1.9h1a1.9 1.9 0 0 1 1.9 1.9v1.8" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
<rect x="6.6" y="10.4" width="10.8" height="7.4" rx="1.5" fill="#ffffff"/>
<path d="M6.6 13.8h10.8" stroke="${color}" stroke-width="1.3"/>
<rect x="10.7" y="12.6" width="2.6" height="2.4" rx="0.7" fill="${color}"/>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    anchor: new g.maps.Point(OFFICE_PIN.tipX, OFFICE_PIN.tipY),
  };
}
