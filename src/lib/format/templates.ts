import type { TemplateConfig } from '@/types';

export const DEFAULT_TEMPLATE: TemplateConfig = {
  page: {
    width: 210, height: 297,
    marginTop: 25.4, marginBottom: 25.4,
    marginLeft: 31.8, marginRight: 31.8,
    headerDistance: 15, footerDistance: 15,
  },
  font: {
    body: '宋体', bodySize: 12,
    heading: '黑体',
    headingSizes: { h1: 16, h2: 14, h3: 12 },
    lineSpacing: 1.5,
  },
  cover: {
    enabled: true,
    fields: ['title', 'author', 'studentId', 'school', 'major', 'advisor', 'date'],
  },
  header: {
    oddPages: '毕业论文',
    evenPages: '论文题目',
  },
  reference: { style: 'gb7714' },
};

export function mergeTemplateConfig(db: Partial<TemplateConfig> | null): TemplateConfig {
  if (!db) return DEFAULT_TEMPLATE;
  return {
    page: { ...DEFAULT_TEMPLATE.page, ...(db.page || {}) },
    font: { ...DEFAULT_TEMPLATE.font, ...(db.font || {}) },
    cover: { ...DEFAULT_TEMPLATE.cover, ...(db.cover || {}) },
    header: { ...DEFAULT_TEMPLATE.header, ...(db.header || {}) },
    reference: { ...DEFAULT_TEMPLATE.reference, ...(db.reference || {}) },
  };
}
