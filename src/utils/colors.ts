export const hexToRgb = (hex: string) => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  
  return { r, g, b };
};

export const interpolateColor = (hex1: string, hex2: string, factor: number) => {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  
  // Clamp factor
  factor = Math.max(0, Math.min(1, factor));
  
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  
  return { r, g, b, string: `rgb(${r}, ${g}, ${b})` };
};
