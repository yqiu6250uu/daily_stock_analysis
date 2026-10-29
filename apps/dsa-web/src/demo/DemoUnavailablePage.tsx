import { Link } from 'react-router-dom';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { equitylensText } from '../i18n/equitylensText';

export function DemoUnavailablePage() {
  const { language } = useUiLanguage();
  const copy = equitylensText[language];
  return <section className="el-demo-unavailable">
    <p className="el-eyebrow">{copy.demoLabel}</p>
    <h1>{copy.demoUnavailableTitle}</h1>
    <p>{copy.demoUnavailableBody}</p>
    <Link to="/">{copy.demoBackHome}</Link>
  </section>;
}
