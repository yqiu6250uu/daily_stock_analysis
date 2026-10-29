import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { UiLanguageProvider } from '../../../contexts/UiLanguageContext';
import { UI_LANGUAGE_STORAGE_KEY } from '../../../utils/uiLanguage';
import { OriginalReportDisclosure } from '../OriginalReportDisclosure';

describe('OriginalReportDisclosure', () => {
  beforeEach(() => window.localStorage.clear());

  it('marks a Chinese historical report and reveals the unchanged original on demand in English mode', () => {
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, 'en');
    render(<UiLanguageProvider><OriginalReportDisclosure sourceLanguage="zh"><p>原始财务证据 🎯</p></OriginalReportDisclosure></UiLanguageProvider>);
    expect(screen.getByRole('note')).toHaveTextContent('written in Chinese');
    expect(screen.queryByText('原始财务证据 🎯')).not.toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Inspect original report' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(screen.getByText('原始财务证据 🎯').closest('[lang]')).toHaveAttribute('lang', 'zh-CN');
    expect(screen.getByRole('button', { name: 'Hide original report' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not gate a report already written in the selected language', () => {
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, 'zh');
    render(<UiLanguageProvider><OriginalReportDisclosure sourceLanguage="zh"><p>原文</p></OriginalReportDisclosure></UiLanguageProvider>);
    expect(screen.getByText('原文')).toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
