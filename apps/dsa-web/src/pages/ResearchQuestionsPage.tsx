import { useEffect, useState } from 'react';
import { ArrowUpRight, FileSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VERIFIED_DEMO_TICKERS } from '../demo/config';
import { useUiLanguage } from '../contexts/UiLanguageContext';
import { researchV02Text } from '../i18n/researchV02Text';

export default function ResearchQuestionsPage() {
  const { language } = useUiLanguage();
  const copy = researchV02Text[language];
  const [ticker, setTicker] = useState('NVDA');
  useEffect(() => { document.title = `${copy.researchQuestions} · EquityLens`; }, [copy.researchQuestions]);
  return <div className="el-v02-page el-v021-questions-page">
    <p className="el-eyebrow">EQUITYLENS / {copy.researchQuestions}</p>
    <h1>{copy.exploreQuestion}</h1><p className="el-v02-lead">{copy.questionScope}</p>
    <section className="el-v021-question-detail"><FileSearch aria-hidden="true" />
      <div><p className="el-eyebrow">01 / {copy.publicReady}</p><h2>{copy.researchQuestion}</h2>
        <p>{copy.comparableBasis}</p><p>{copy.noCausality}</p>
        <div className="el-v021-question-controls"><label>{copy.selectCompany}
          <select value={ticker} onChange={(event) => setTicker(event.target.value)}>
            {VERIFIED_DEMO_TICKERS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select></label>
          <Link to={`/research/${ticker}/questions/revenue-cash-flow`}>{copy.startQuestion}<ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  </div>;
}
