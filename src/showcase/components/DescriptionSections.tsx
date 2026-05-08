import React from 'react';
import { MuscleHeatmapSection } from './sections/MuscleHeatmapSection';
import { WorkoutSummarySection } from './sections/WorkoutSummarySection';
import { IntervalsSection } from './sections/IntervalsSection';
import { HRZonesSection } from './sections/HRZonesSection';
import { GoalSection } from './sections/GoalSection';
import { StreakSection } from './sections/StreakSection';
import { EffortSection } from './sections/EffortSection';

export interface DescriptionSection {
  emoji: string;
  title: string;
  content: string;
  _location?: DescriptionSection;
  _weather?: DescriptionSection;
  _merged?: boolean;
}

function extractLeadingEmoji(text: string): { emoji: string; rest: string } {
  if (!text) return { emoji: '📝', rest: '' };
  if (text.charCodeAt(0) < 0x200) return { emoji: '•', rest: text };
  // eslint-disable-next-line no-misleading-character-class
  const match = text.match(/^(\p{Emoji_Presentation}|\p{Emoji}️)(‍(\p{Emoji_Presentation}|\p{Emoji}️))*/u);
  if (match) return { emoji: match[0], rest: text.slice(match[0].length) };
  return { emoji: '•', rest: text };
}

export function parseDescriptionSections(text: string): DescriptionSection[] {
  if (!text) return [];

  const cleaned = text.replace(/\n?\n?Posted via FitGlue\s*💪/g, '').trim();
  if (!cleaned) return [];

  const lines = cleaned.split('\n');
  const sections: DescriptionSection[] = [];
  let currentSection: DescriptionSection | null = null;
  const preHeaderContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const prevLine = i > 0 ? lines[i - 1].trim() : '';

    const startsWithEmoji = trimmedLine.length > 0 && trimmedLine.codePointAt(0)! > 0xFF;
    const endsWithColon =
      trimmedLine.endsWith(':') && trimmedLine.length > 1 && startsWithEmoji;
    const isSingleLineSection =
      prevLine === '' && i > 0 && startsWithEmoji && trimmedLine.includes(':');

    if (endsWithColon || isSingleLineSection) {
      if (currentSection === null && preHeaderContent.length > 0) {
        const content = preHeaderContent.join('\n').trim();
        if (content) sections.push({ emoji: '📝', title: 'Description', content });
        preHeaderContent.length = 0;
      }
      if (currentSection !== null) sections.push(currentSection);

      let emoji: string, title: string, sectionContent: string;
      if (endsWithColon) {
        const headerText = trimmedLine.slice(0, -1).trim();
        const r = extractLeadingEmoji(headerText);
        emoji = r.emoji;
        title = r.rest.trim() || 'Section';
        sectionContent = '';
      } else {
        const colonIdx = trimmedLine.indexOf(':');
        const headerText = trimmedLine.slice(0, colonIdx).trim();
        const r = extractLeadingEmoji(headerText);
        emoji = r.emoji;
        title = r.rest.trim() || 'Section';
        sectionContent = trimmedLine.slice(colonIdx + 1).trim();
      }
      currentSection = { emoji, title, content: sectionContent };
    } else if (currentSection === null) {
      preHeaderContent.push(line);
    } else {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection !== null) {
    currentSection.content = currentSection.content.trim();
    sections.push(currentSection);
  } else if (preHeaderContent.length > 0) {
    const content = preHeaderContent.join('\n').trim();
    if (content) sections.push({ emoji: '📝', title: 'Description', content });
  }

  return sections;
}

const GRAPH_SECTION_MAP: Record<string, boolean> = {
  'Heart Rate': true,
  'Pace': true,
  'Power': true,
  'Cadence': true,
  'Speed': true,
  'Elevation': true,
};

interface Props {
  text: string;
  hasGraphs: Set<string>;
  hasHybridRace: boolean;
  onUserDescription?: (text: string) => void;
  onAISummary?: (section: DescriptionSection) => void;
}

export const DescriptionSections: React.FC<Props> = ({
  text,
  hasGraphs,
  hasHybridRace,
  onUserDescription,
  onAISummary,
}) => {
  const sections = parseDescriptionSections(text);

  const userDescSection = sections.find((s) => s.title === 'Description');
  const aiSummarySection = sections.find((s) => s.title === 'AI Summary');
  const enricherSections = sections.filter(
    (s) => s.title !== 'Description' && s.title !== 'AI Summary'
  );

  // Notify parent of user description & AI summary (rendered elsewhere)
  React.useEffect(() => {
    if (userDescSection?.content) onUserDescription?.(userDescSection.content);
    if (aiSummarySection) onAISummary?.(aiSummarySection);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (sections.length === 0) return null;

  const filtered = enricherSections.filter((section) => {
    if (GRAPH_SECTION_MAP[section.title] && hasGraphs.has(section.title)) return false;
    if (hasHybridRace) {
      const t = section.title.toLowerCase();
      if (t.startsWith('hyrox') || t.startsWith('athx')) return false;
    }
    return true;
  });

  const locationSection = filtered.find((s) => s.title === 'Location');
  const weatherSection = filtered.find((s) => s.title === 'Weather');
  const merged = filtered.filter((s) => s.title !== 'Location' && s.title !== 'Weather');
  if (locationSection || weatherSection) {
    merged.push({
      title: 'Conditions',
      emoji: '🌍',
      content: '',
      _location: locationSection,
      _weather: weatherSection,
      _merged: true,
    });
  }

  if (merged.length === 0) return null;

  return (
    <>
      {merged.map((section, idx) => (
        <SectionCard key={`${section.title}-${idx}`} section={section} idx={idx} />
      ))}
    </>
  );
};

const SectionCard: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const { title } = section;

  if (title === 'Muscle Heatmap') return <MuscleHeatmapSection section={section} idx={idx} />;
  if (title === 'Workout Summary') return <WorkoutSummarySection section={section} idx={idx} />;
  if (title.startsWith('Intervals')) return <IntervalsSection section={section} idx={idx} />;
  if (title === 'Heart Rate Zones') return <HRZonesSection section={section} idx={idx} />;
  if (title.includes('Goal Progress')) return <GoalSection section={section} idx={idx} />;
  if (title === 'Streak Tracker') return <StreakSection section={section} idx={idx} />;
  if (title.startsWith('Effort Score')) return <EffortSection section={section} idx={idx} />;
  if (title === 'Conditions' && section._merged) return <ConditionsSection section={section} idx={idx} />;

  const lines = section.content.split('\n').filter((l) => l.trim());
  const bulletLines = lines.filter((l) => l.trim().startsWith('•'));
  if (bulletLines.length > 0 && bulletLines.length === lines.length) {
    return <BulletListSection section={section} idx={idx} />;
  }
  if (lines.length <= 1 && section.content.includes(' • ')) {
    return <CompactPillsSection section={section} idx={idx} />;
  }
  if (lines.length <= 1 && section.content.trim()) {
    return <CompactPillsSection section={section} idx={idx} />;
  }

  return (
    <div
      className="showcase-section glass-card description-section-card"
      style={{ animationDelay: `${idx * 0.1}s` }}
    >
      <div className="section-header">
        <h2>{section.emoji} {section.title}</h2>
      </div>
      <pre className="activity-description">{section.content}</pre>
    </div>
  );
};

const BulletListSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const lines = section.content.split('\n').filter((l) => l.trim());
  return (
    <div
      className="showcase-section glass-card description-section-card"
      style={{ animationDelay: `${idx * 0.1}s` }}
    >
      <div className="section-header">
        <h2>{section.emoji} {section.title}</h2>
      </div>
      <div className="bullet-list-rows">
        {lines.map((line, i) => {
          const clean = line.replace(/^•\s*/, '').trim();
          const colonIdx = clean.indexOf(':');
          if (colonIdx > 0) {
            return (
              <div key={i} className="bullet-stat-row">
                <span className="bullet-stat-label">{clean.slice(0, colonIdx).trim()}</span>
                <span className="bullet-stat-value">{clean.slice(colonIdx + 1).trim()}</span>
              </div>
            );
          }
          return <div key={i} className="bullet-stat-row-simple">• {clean}</div>;
        })}
      </div>
    </div>
  );
};

const CompactPillsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const parts = section.content.split(' • ').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return (
      <div
        className="showcase-section glass-card description-section-card compact-pill-section"
        style={{ animationDelay: `${idx * 0.1}s` }}
      >
        <div className="section-header">
          <h2>{section.emoji} {section.title}</h2>
        </div>
        <div className="compact-pill-value">{section.content}</div>
      </div>
    );
  }
  return (
    <div
      className="showcase-section glass-card description-section-card compact-pill-section"
      style={{ animationDelay: `${idx * 0.1}s` }}
    >
      <div className="section-header">
        <h2>{section.emoji} {section.title}</h2>
      </div>
      <div className="enhanced-pills">
        {parts.map((p, i) => (
          <span key={i} className="stat-pill">
            <span className="stat-pill-value">{p}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const ConditionsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const renderSub = (sub: DescriptionSection | undefined) => {
    if (!sub) return null;
    return (
      <div className="conditions-sub">
        <div className="section-header" style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9rem' }}>{sub.emoji} {sub.title}</h3>
        </div>
        <pre className="activity-description" style={{ fontSize: '0.85rem' }}>{sub.content}</pre>
      </div>
    );
  };
  return (
    <div
      className="showcase-section glass-card description-section-card"
      style={{ animationDelay: `${idx * 0.1}s` }}
    >
      <div className="section-header">
        <h2>{section.emoji} {section.title}</h2>
      </div>
      {renderSub(section._location)}
      {renderSub(section._weather)}
    </div>
  );
};

export const AISummaryCard: React.FC<{ section: DescriptionSection; idx?: number }> = ({ section, idx = 0 }) => (
  <div
    className="showcase-section glass-card description-section-card ai-summary-card"
    style={{ animationDelay: `${idx * 0.1}s` }}
  >
    <div className="section-header ai-summary-header">
      <h2>{section.emoji} {section.title}</h2>
    </div>
    <div className="ai-summary-prose">{section.content}</div>
  </div>
);
