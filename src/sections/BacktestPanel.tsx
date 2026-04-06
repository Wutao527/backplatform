import { useState } from 'react';
import { Play, Settings, AlertCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const availableResources = [
  { code: '000001', name: '平安银行', type: 'stock', establishDate: '1987-12-22' },
  { code: '510300', name: '沪深300ETF', type: 'etf', establishDate: '2012-05-04' },
  { code: '00700', name: '腾讯控股', type: 'stock', establishDate: '2004-06-16' },
  { code: 'AAPL', name: '苹果公司', type: 'stock', establishDate: '1980-12-12' },
  { code: '110022', name: '易方达消费', type: 'fund', establishDate: '2010-08-20' },
  { code: '518880', name: '黄金ETF', type: 'etf', establishDate: '2013-07-18' },
];

const historyPlans = [
  { name: '沪深300组合测试', count: 3, period: '2020-01-01 ~ 2024-01-01', status: 'completed' },
  { name: '科技股轮动策略', count: 5, period: '2021-06-01 ~ 2024-01-01', status: 'completed' },
];

export function BacktestPanel() {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startMode, setStartMode] = useState<'fixed' | 'latest'>('fixed');
  const [backtestName, setBacktestName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showResourceList, setShowResourceList] = useState(false);

  const toggleResource = (code: string) => {
    if (selectedResources.includes(code)) {
      setSelectedResources(selectedResources.filter(c => c !== code));
    } else {
      setSelectedResources([...selectedResources, code]);
    }
  };

  const getLatestEstablishDate = () => {
    const selected = availableResources.filter(r => selectedResources.includes(r.code));
    if (selected.length === 0) return '';
    const dates = selected.map(r => new Date(r.establishDate));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return maxDate.toISOString().split('T')[0];
  };

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  const effectiveStartDate = startMode === 'latest' ? getLatestEstablishDate() : startDate;

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { stock: '股票', etf: 'ETF', fund: '基金' };
    return labels[type] || type;
  };

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
      {/* 回测计划配置 */}
      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <h3 className="text-white font-medium flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-blue-400" />
          回测配置
        </h3>

        <div className="space-y-4">
          {/* 计划名称 */}
          <div>
            <label className="text-slate-400 text-sm mb-1 block">计划名称</label>
            <Input
              placeholder="输入回测计划名称..."
              value={backtestName}
              onChange={(e) => setBacktestName(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          {/* 选择资源 */}
          <div>
            <label className="text-slate-400 text-sm mb-2 block">
              选择资源 <span className="text-blue-400">({selectedResources.length} 个)</span>
            </label>
            
            {/* 手机版展开按钮 */}
            <button
              onClick={() => setShowResourceList(!showResourceList)}
              className="md:hidden w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300"
            >
              <span>点击选择资产</span>
              {showResourceList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* 资源列表 - 桌面版始终显示，手机版可展开 */}
            <div className={`bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto ${showResourceList ? 'block' : 'hidden md:block'}`}>
              <div className="flex flex-wrap gap-2">
                {availableResources.map(item => (
                  <button
                    key={item.code}
                    onClick={() => toggleResource(item.code)}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      selectedResources.includes(item.code)
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <span className="font-mono">{item.code}</span>
                    <span className="hidden sm:inline">{item.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(item.type)}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* 已选资源展示 */}
            {selectedResources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedResources.map(code => {
                  const item = availableResources.find(r => r.code === code);
                  return item ? (
                    <span key={code} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {item.code}
                      <button onClick={() => toggleResource(code)} className="hover:text-white">×</button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* 时间设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-1 block">开始时间</label>
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setStartMode('fixed')}
                    className={`px-3 py-1.5 rounded text-sm ${
                      startMode === 'fixed' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    固定日期
                  </button>
                  <button
                    onClick={() => setStartMode('latest')}
                    className={`px-3 py-1.5 rounded text-sm ${
                      startMode === 'latest' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    按最晚成立
                  </button>
                </div>
                {startMode === 'fixed' ? (
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-300 text-sm">
                    {effectiveStartDate || '请先选择资源'}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-1 block">结束时间</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* 组合回测选项 */}
          {selectedResources.length > 1 && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>组合回测模式</span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                已选择 {selectedResources.length} 个资产，将按等权重进行组合回测
              </p>
            </div>
          )}

          {/* 运行按钮 */}
          <Button
            onClick={handleRunBacktest}
            disabled={isRunning || selectedResources.length === 0 || !endDate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12"
          >
            {isRunning ? (
              <>
                <Play className="w-4 h-4 animate-pulse mr-2" />
                回测运行中...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                开始回测
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 历史回测计划 */}
      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <h3 className="text-white font-medium mb-4">历史回测计划</h3>
        
        {/* 桌面版表格 */}
        <div className="hidden md:block bg-slate-900 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-slate-300">
              <tr>
                <th className="px-4 py-2 text-left">计划名称</th>
                <th className="px-4 py-2 text-left">资产数量</th>
                <th className="px-4 py-2 text-left">回测区间</th>
                <th className="px-4 py-2 text-left">状态</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {historyPlans.map((plan, idx) => (
                <tr key={idx} className="border-b border-slate-800">
                  <td className="px-4 py-2">{plan.name}</td>
                  <td className="px-4 py-2">{plan.count}</td>
                  <td className="px-4 py-2">{plan.period}</td>
                  <td className="px-4 py-2">
                    <span className="text-green-400 text-xs">已完成</span>
                  </td>
                  <td className="px-4 py-2">
                    <button className="text-blue-400 hover:text-blue-300 text-xs">查看报告</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 手机版卡片 */}
        <div className="md:hidden space-y-2">
          {historyPlans.map((plan, idx) => (
            <div key={idx} className="bg-slate-900 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-medium">{plan.name}</div>
                  <div className="text-slate-400 text-sm mt-1">{plan.count} 个资产</div>
                  <div className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {plan.period}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-400 text-xs">已完成</span>
                  <button className="block text-blue-400 hover:text-blue-300 text-xs mt-2">查看报告</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
