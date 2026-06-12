import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
         Header, Footer, PageNumber, NumberFormat, TableOfContents,
         BorderStyle, TabStopPosition, TabStopType,
         convertInchesToTwip, PageBreak } from 'docx';
import type { TemplateConfig } from '@/types';

function mmToTwip(mm: number): number {
  return Math.round(mm / 25.4 * 1440);
}

function ptToHalfPt(pt: number): number {
  return pt * 2;
}

export function buildSectionOptions(config: TemplateConfig) {
  const { page } = config;
  return {
    properties: {
      pageSize: {
        width: mmToTwip(page.width),
        height: mmToTwip(page.height),
      },
      margin: {
        top: mmToTwip(page.marginTop),
        bottom: mmToTwip(page.marginBottom),
        left: mmToTwip(page.marginLeft),
        right: mmToTwip(page.marginRight),
        header: mmToTwip(page.headerDistance),
        footer: mmToTwip(page.footerDistance),
      },
    },
  };
}

export function buildHeader(config: TemplateConfig, chapterTitle?: string): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: chapterTitle || config.header.oddPages,
            font: config.font.body,
            size: ptToHalfPt(9),
          }),
        ],
      }),
    ],
  });
}

export function buildFooter(config: TemplateConfig): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            font: config.font.body,
            size: ptToHalfPt(9),
          }),
        ],
      }),
    ],
  });
}

export function buildBodyParagraph(config: TemplateConfig, text: string): Paragraph {
  const { font } = config;
  return new Paragraph({
    spacing: {
      line: Math.round(font.lineSpacing * 240),
      after: 0,
    },
    indent: { firstLine: convertInchesToTwip(0.74) },
    children: [
      new TextRun({
        text,
        font: font.body,
        size: ptToHalfPt(font.bodySize),
      }),
    ],
  });
}

export function buildHeading(config: TemplateConfig, text: string, level: 1 | 2 | 3): Paragraph {
  const { font } = config;
  const sizes = { 1: font.headingSizes.h1, 2: font.headingSizes.h2, 3: font.headingSizes.h3 };
  const headingLevels = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
  return new Paragraph({
    heading: headingLevels[level],
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        font: font.heading,
        size: ptToHalfPt(sizes[level]),
        bold: true,
      }),
    ],
  });
}

export function formatReferenceGB7714(ref: {
  authors: string; title: string; type: string;
  journal?: string; year: string; volume?: string; issue?: string; pages?: string;
  publisher?: string; city?: string;
}): string {
  const authors = ref.authors.replace(/\s+/g, '');
  let result = `${authors}. ${ref.title}[${ref.type}]. `;
  if (ref.type === 'J' && ref.journal) {
    result += `${ref.journal}, ${ref.year}`;
    if (ref.volume) result += `, ${ref.volume}`;
    if (ref.issue) result += `(${ref.issue})`;
    if (ref.pages) result += `: ${ref.pages}`;
  } else if (ref.type === 'M' && ref.publisher) {
    result += `${ref.city || ''}: ${ref.publisher}, ${ref.year}`;
  } else if (ref.type === 'D') {
    result += `${ref.city || ''}: ${ref.publisher || ''}, ${ref.year}`;
  }
  return result + '.';
}
