import { useState } from 'react';
import { Download, TrendingUp, Activity, PieChart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reportData = {
  name: '沪深300组合测试',
  period: '2020-01-01 ~ 2024-01-01',
  totalReturn: 45.8,
  annualReturn: 9.8,
  maxDrawdown: -18.5,
  sharpeRatio: 0.85,
  volatility: 15.2,
  winRate: 58.3,
  tradeCount: 124,
};

const monthlyReturns = [
  { month: '2020-01', return: 2.5 },
  { month: '2020-02', return: -3.2 },
  { month: '2020-03', return: -5.1 },
  { month: '2020-04', return: 4.8 },
  { month: '2020-05', return: 1.2 },
  { month: '2020-06', return: 3.5 },
  { month: '2020-07', return: 6.2 },
  { month: '2020-08', return: 2.1 },
  { month: '2020-09', return: -1.5 },
  { month: '2020-10', return: 1.8 },
  { month: '2020-11', return: 4.2 },
  { month: '2020-12', return: 3.1 },
];

const holdings = [
  { code: '510300', name: '沪深300ETF', weight: 40, return: 12.5 },
  { code: '000001', name: '平安银行', weight: 30, return: 8.3 },
  { code: '00700', name: '腾讯控股', weight: 30, return: 15.2 },
];

export function ReportPanel() {
  const [selectedReport, setSelectedReport] = useState('report1');
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const mainMetrics = [
    { label: '总收益率', value: reportData.totalReturn, suffix: '%', positive: true },
    { label: '年化收益率', value: reportData.annualReturn, suffix: '%', positive: true },
    { label: '最大回撤', value: reportData.maxDrawdown, suffix: '%', positive: false },
    { label: '夏普比率', value: reportData.sharpeRatio, suffix: '', positive: true },
  ];

  const extraMetrics = [
    { label: '波动率', value: reportData.volatility, suffix: '%' },
    { label: '胜率', value: reportData.winRate, suffix: '%' },
    { label: '交易次数', value: reportData.tradeCount, suffix: '' },
  ];

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
      {/* 报告选择 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedReport('report1')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            selectedReport === 'report1' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          沪深300组合测试
        </button>
        <button
          onClick={() => setSelectedReport('report2')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            selectedReport === 'report2' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          科技股轮动策略
        </button>
      </div>

      {/* 核心指标 */}
      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            核心指标
          </h3>
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">导出报告</span>
          </Button>
        </div>

        {/* 主要指标 - 响应式网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mainMetrics.map((metric, idx) => (
            <div key={idx} className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">{metric.label}</div>
              <div className={`text-xl md:text-2xl font-bold ${
                metric.positive 
                  ? (metric.value >= 0 ? 'text-green-400' : 'text-red-400')
                  : 'text-red-400'
              }`}>
                {metric.value >= 0 && metric.positive ? '+' : ''}{metric.value}{metric.suffix}
              </div>
            </div>
          ))}
        </div>

        {/* 额外指标 - 手机版可展开 */}
        <div className="mt-3 md:block">
          <button
            onClick={() => setShowAllMetrics(!showAllMetrics)}
            className="md:hidden w-full flex items-center justify-between p-2 bg-slate-700/50 rounded-lg text-slate-400 text-sm"
          >
            <span>更多指标</span>
            {showAllMetrics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <div className={`grid grid-cols-3 gap-3 mt-3 ${showAllMetrics ? 'block' : 'hidden md:grid'}`}>
            {extraMetrics.map((metric, idx) => (
              <div key={idx} className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">{metric.label}</div>
                <div className="text-lg md:text-xl font-bold text-white">
                  {metric.value}{metric.suffix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 收益曲线 */}
      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <h3 className="text-white font-medium flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          收益曲线
        </h3>
        
        {/* 简化版柱状图 */}
        <div className="bg-slate-900 rounded-lg p-3 md:p-4">
          {/* 手机版横向滚动 */}
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 min-w-[300px] h-32 md:h-48">
              {monthlyReturns.map((item) => (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center min-w-[20px]"
                >
                  <div
                    className={`w-full ${item.return >= 0 ? 'bg-green-500/60' : 'bg-red-500/60'} rounded-t`}
                    style={{
                      height: `${Math.min(Math.abs(item.return) * 6, 100)}px`,
                      minHeight: '4px',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* 月份标签 */}
          <div className="flex justify-between mt-2 text-slate-500 text-xs">
            <span>2020-01</span>
            <span>2020-06</span>
            <span>2020-12</span>
          </div>
        </div>
      </div>

      {/* 持仓分布 */}
      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <h3 className="text-white font-medium flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-purple-400" />
          持仓分布
        </h3>
        
        {/* 桌面版表格 */}
        <div className="hidden md:block bg-slate-900 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-slate-300">
              <tr>
                <th className="px-4 py-2 text-left">代码</th>
                <th className="px-4 py-2 text-left">名称</th>
                <th className="px-4 py-2 text-left">权重</th>
                <th className="px-4 py-2 text-left">收益贡献</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {holdings.map(item => (
                <tr key={item.code} className="border-b border-slate-800">
                  <td className="px-4 py-2 font-mono">{item.code}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 md:w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${item.weight}%` }} />
                      </div>
                      <span>{item.weight}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={item.return >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {item.return >= 0 ? '+' : ''}{item.return}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 手机版卡片 */}
        <div className="md:hidden space-y-2">
          {holdings.map(item => (
            <div key={item.code} className="bg-slate-900 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{item.code}</span>
                    <span className="text-slate-300 text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${item.weight}%` }} />
                    </div>
                    <span className="text-slate-400 text-sm">{item.weight}%</span>
                  </div>
                </div>
                <span className={item.return >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {item.return >= 0 ? '+' : ''}{item.return}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
