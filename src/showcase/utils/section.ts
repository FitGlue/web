export function stripBullet(line: string): string {
  return line.trim().replace(/^•\s*/, '');
}

export function splitLines(content: string): string[] {
  return content.split('\n').filter((l) => l.trim());
}

export function normalizeToLines(content: string): string[] {
  const normalized = content.includes('\n') ? content : content.replace(/ • /g, '\n• ');
  return normalized.split('\n').filter((l) => l.trim());
}

export function extractEmojiPrefix(text: string): { emoji: string; rest: string } {
  if (!text) return { emoji: '', rest: '' };
  const cp = text.codePointAt(0) ?? 0;
  if (cp <= 0xFF) return { emoji: '', rest: text };
  const chars = [...text];
  const emoji = chars[0] ?? '';
  return { emoji, rest: text.slice(emoji.length).trim() };
}

export function getIntensityClass(label: string): string {
  const l = label.toLowerCase();
  if (l === 'recovery' || l === 'detraining') return 'recovery';
  if (l === 'easy' || l === 'optimal') return 'easy';
  if (l === 'moderate' || l === 'building') return 'moderate';
  if (l === 'hard' || l === 'threshold' || l === 'overreaching') return 'hard';
  return 'extreme';
}

export function getIntensityColor(label: string): string {
  const l = label.toLowerCase();
  if (l === 'easy') return '#4ADE80';
  if (l === 'moderate') return '#FBBF24';
  if (l === 'hard') return '#FB923C';
  if (l.includes('very hard') || l === 'threshold') return '#EF4444';
  if (l === 'max' || l === 'extreme') return '#DC2626';
  return '#FBBF24';
}
