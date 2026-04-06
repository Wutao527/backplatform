import { useState } from 'react';
import { Database, LineChart, FileText, Settings, Menu, X } from 'lucide-react';
import { DataDownload } from './sections/DataDownload';
import { BacktestPanel } from './sections/BacktestPanel';
import { ReportPanel } from './sections/ReportPanel';

function App() {
  const [activeTab, setActiveTab] = useState('data');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'data', label: '数据管理', icon: Database },
    { id: 'backtest', label: '回测', icon: LineChart },
    { id: 'report', label: '报告', icon: FileText },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* 导航栏 - 桌面版 */}
      <nav className="hidden md:flex h-14 bg-slate-900 border-b border-slate-700 items-center px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2 mr-8">
          <LineChart className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-semibold text-white">回测平台</span>
        </div>
        
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 导航栏 - 手机版 */}
      <nav className="md:hidden h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-blue-400" />
          <span className="text-base font-semibold text-white">回测平台</span>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* 手机版菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 bg-slate-900 border-b border-slate-700 z-40">
          <div className="p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto pb-20 md:pb-4">
        {activeTab === 'data' && <DataDownload />}
        {activeTab === 'backtest' && <BacktestPanel />}
        {activeTab === 'report' && <ReportPanel />}
        {activeTab === 'settings' && (
          <div className="p-8 text-center text-slate-400">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>设置功能开发中...</p>
          </div>
        )}
      </main>

      {/* 手机版底部导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400'
                  : 'text-slate-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
