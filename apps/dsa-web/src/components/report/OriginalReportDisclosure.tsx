import type React from 'react';
import { useState } from 'react';
import { useUiLanguage } from '../../contexts/UiLanguageContext';
import type { ReportLanguage } from '../../types/analysis';
import { normalizeReportLanguage } from '../../utils/reportLanguage';

interface OriginalReportDisclosureProps {
  sourceLanguage?: ReportLanguage;
  children: React.ReactNode;
}

/** Keep stored research intact while making its source language explicit. */
export const OriginalReportDisclosure: React.FC<OriginalReportDisclosureProps> = ({ sourceLanguage, children }) => {
  const { language, t } = useUiLanguage();
  const [expanded, setExpanded] = useState(false);
  const originalLanguage = normalizeReportLanguage(sourceLanguage);
  if (language === originalLanguage) return <>{children}</>;

  const languageName = t(originalLanguage === 'en'
    ? 'report.languageEnglish'
    : originalLanguage === 'ko' ? 'report.languageKorean' : 'report.languageChinese');

  return <div className="space-y-4">
    <div className="rounded-lg border border-subtle bg-secondary/40 p-4 text-sm text-foreground" role="note">
      <p>{t('report.originalLanguageNotice', { language: languageName })}</p>
      <button type="button" className="mt-3 font-semibold text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
        {t(expanded ? 'report.hideOriginal' : 'report.viewOriginal')}
      </button>
    </div>
    {expanded && <div lang={originalLanguage === 'zh' ? 'zh-CN' : originalLanguage}>{children}</div>}
  </div>;
};
