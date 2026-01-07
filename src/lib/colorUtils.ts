export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use HSL for better control over tone
  // Hue is determined by the hash (0-360)
  const h = Math.abs(hash) % 360;

  // Saturation: 60-80% for vibrancy
  const s = 70;

  // Lightness: 85-95% for pastel backgrounds
  const l = 90;

  // Darker version for text
  const textL = 30;

  return {
    style: {
      backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
      color: `hsl(${h}, ${s}%, ${textL}%)`,
      borderColor: `hsl(${h}, ${s}%, ${l - 10}%)` // Slightly darker border
    },
    className: 'border' // Add a border class to ensure visibility if needed
  };
}
