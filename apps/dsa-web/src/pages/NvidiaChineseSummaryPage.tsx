import { useEffect } from 'react';
import { ArrowLeft, Download, FileSpreadsheet, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import summary from '../content/nvidiaChineseSummary.md?raw';
import './NvidiaChinaParadoxPage.css';

const files = `${import.meta.env.BASE_URL}research/nvidia-china-paradox/`;

export default function NvidiaChineseSummaryPage() {
  useEffect(() => { document.title = '英伟达研究中文摘要 · EquityLens'; }, []);
  return <main className="el-showcase el-nvda-research el-nvda-summary-page">
    <Link to="/research/nvidia-china-paradox" className="el-showcase-back"><ArrowLeft aria-hidden="true" />返回完整研究页</Link>
    <div className="el-nvda-summary-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown></div>
    <div className="el-nvda-summary-downloads">
      <a href={`${files}NVIDIA_Equity_Research_Report.pdf`} download><FileText aria-hidden="true" />下载完整英文报告 <Download aria-hidden="true" /></a>
      <a href={`${files}NVIDIA_Three_Path_Review_Model.xlsx`} download><FileSpreadsheet aria-hidden="true" />下载三路径审阅模型 <Download aria-hidden="true" /></a>
    </div>
    <p className="el-nvda-model-caveat">模型经 LibreOffice 隔离重算，原生 Microsoft Excel 全量重算仍为 OPEN；研究假设、价格口径和正式评级尚待审定。</p>
  </main>;
}
