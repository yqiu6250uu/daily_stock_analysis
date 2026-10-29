import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { StaticDemoAuthProvider } from './contexts/AuthContext';
import { UiLanguageProvider } from './contexts/UiLanguageContext';
import { DemoUnavailablePage } from './demo/DemoUnavailablePage';
import CompanyResearchPage from './pages/CompanyResearchPage';
import ResearchHomePage from './pages/ResearchHomePage';
import ResearchToolsPage from './pages/ResearchToolsPage';
import RevenueCashFlowResearchPage from './pages/RevenueCashFlowResearchPage';
import MyResearchPage from './pages/MyResearchPage';
import './App.css';

const router = createBrowserRouter([{
  element: <Shell><Outlet /></Shell>,
  children: [
    { path: '/', element: <ResearchHomePage /> },
    { path: '/research', element: <CompanyResearchPage /> },
    { path: '/research/:ticker', element: <CompanyResearchPage /> },
    { path: '/research/:ticker/questions/revenue-cash-flow', element: <RevenueCashFlowResearchPage /> },
    { path: '/my-research', element: <MyResearchPage /> },
    { path: '/tools', element: <ResearchToolsPage mode="index" /> },
    { path: '/tools/metrics', element: <ResearchToolsPage mode="metrics" /> },
    { path: '/tools/compare', element: <ResearchToolsPage mode="compare" /> },
    { path: '/tools/screener', element: <ResearchToolsPage mode="screener" /> },
    { path: '*', element: <DemoUnavailablePage /> },
  ],
}]);

export default function DemoApp() {
  return <UiLanguageProvider><StaticDemoAuthProvider><RouterProvider router={router} /></StaticDemoAuthProvider></UiLanguageProvider>;
}
