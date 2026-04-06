import { useState } from 'react';
import { Download, Search, Filter, RefreshCw, CheckCircle, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const dataTypes = [
  { id: 'all', label: '全部' },
  { id: 'fund', label: '基金' },
  { id: 'etf', label: 'ETF' },
  { id: 'stock', label: '股票' },
  { id: 'bond', label: '债券' },
];

const markets = [
  { id: 'cn', label: '中国' },
  { id: 'hk', label: '香港' },
  { id: 'us', label: '美国' },
];

const mockData = [
  { code: '000001', name: '平安银行', type: 'stock', market: 'cn', scale: 1250, establishDate: '1987-12-22' },
  { code: '510300', name: '沪深300ETF', type: 'etf', market: 'cn', scale: 520, establishDate: '2012-05-04' },
  { code: '000858', name: '五粮液', type: 'stock', market: 'cn', scale: 680, establishDate: '1998-04-21' },
  { code: '00700', name: '腾讯控股', type: 'stock', market: 'hk', scale: 3200, establishDate: '2004-06-16' },
  { code: 'AAPL', name: '苹果公司', type: 'stock', market: 'us', scale: 2800, establishDate: '1980-12-12' },
  { code: '110022', name: '易方达消费', type: 'fund', market: 'cn', scale: 180, establishDate: '2010-08-20' },
  { code: '518880', name: '黄金ETF', type: 'etf', market: 'cn', scale: 95, establishDate: '2013-07-18' },
  { code: 'BABA', name: '阿里巴巴', type: 'stock', market: 'us', scale: 2100, establishDate: '2014-09-19' },
];

const downloadedData = [
  { code: '000001', name: '平安银行', type: 'stock', market: 'cn', updateTime: '2024-01-15 14:30', status: 'updated' },
  { code: '510300', name: '沪深300ETF', type: 'etf', market: 'cn', updateTime: '2024-01-15 14:28', status: 'updated' },
  { code: '00700', name: '腾讯控股', type: 'stock', market: 'hk', updateTime: '2024-01-15 14:25', status: 'updating' },
];

export function DataDownload() {
  const [activeType, setActiveType] = useState('all');
  const [activeMarket, setActiveMarket] = useState('cn');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloading, setDownloading] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleDownload = (code: string) => {
    setDownloading([...downloading, code]);
    setTimeout(() => {
      setDownloading(prev => prev.filter(c => c !== code));
    }, 2000);
  };

  const filteredData = mockData.filter(item => {
    if (activeType !== 'all' && item.type !== activeType) return false;
    if (activeMarket !== 'all' && item.market !== activeMarket) return false;
    if (searchQuery && !item.name.includes(searchQuery) && !item.code.includes(searchQuery)) return false;
    return true;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      stock: '股票',
      etf: 'ETF',
      fund: '基金',
      bond: '债券'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
      {/* 下载区域 */}
      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            数据下载
          </h3>
          {/* 桌面版市场选择 */}
          <div className="hidden md:flex gap-2">
            {markets.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMarket(m.id)}
                className={`px-3 py-1.5 rounded text-sm ${
                  activeMarket === m.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索代码或名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>

          {/* 手机版筛选展开按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between p-2 bg-slate-700 rounded-lg text-slate-300"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选条件
            </span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* 筛选条件 */}
          <div className={`space-y-3 ${showFilters ? 'block' : 'hidden md:block'}`}>
            {/* 手机版市场选择 */}
            <div className="md:hidden">
              <label className="text-slate-400 text-xs mb-1 block">市场</label>
              <div className="flex gap-2 flex-wrap">
                {markets.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMarket(m.id)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      activeMarket === m.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 类型选择 */}
            <div>
              <label className="text-slate-400 text-xs mb-1 block">类型</label>
              <div className="flex gap-1 flex-wrap">
                {dataTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveType(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      activeType === t.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 数据列表 - 桌面版表格 */}
        <div className="hidden md:block bg-slate-900 rounded-lg overflow-hidden mt-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-slate-300">
              <tr>
                <th className="px-4 py-2 text-left">代码</th>
                <th className="px-4 py-2 text-left">名称</th>
                <th className="px-4 py-2 text-left">类型</th>
                <th className="px-4 py-2 text-left">规模(亿)</th>
                <th className="px-4 py-2 text-left">成立日期</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {filteredData.map(item => (
                <tr key={item.code} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-2 font-mono">{item.code}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline" className="text-xs">{getTypeLabel(item.type)}</Badge>
                  </td>
                  <td className="px-4 py-2">{item.scale}</td>
                  <td className="px-4 py-2">{item.establishDate}</td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(item.code)}
                      disabled={downloading.includes(item.code)}
                      className="h-7 px-3"
                    >
                      {downloading.includes(item.code) ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      <span className="ml-1">下载</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 数据列表 - 手机版卡片 */}
        <div className="md:hidden mt-3 space-y-2">
          {filteredData.map(item => (
            <div key={item.code} className="bg-slate-900 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{item.code}</span>
                    <Badge variant="outline" className="text-xs">{getTypeLabel(item.type)}</Badge>
                  </div>
                  <div className="text-slate-300 text-sm mt-1">{item.name}</div>
                  <div className="text-slate-500 text-xs mt-1">
                    规模: {item.scale}亿 | 成立: {item.establishDate}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(item.code)}
                  disabled={downloading.includes(item.code)}
                  className="h-8 px-2"
                >
                  {downloading.includes(item.code) ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 已下载资源 */}
      <div className="bg-slate-800 rounded-lg p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            已下载资源
          </h3>
          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-1.5 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              种类
            </button>
            <button className="px-3 py-1.5 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              规模
            </button>
          </div>
        </div>

        {/* 桌面版表格 */}
        <div className="hidden md:block bg-slate-900 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 text-slate-300">
              <tr>
                <th className="px-4 py-2 text-left">代码</th>
                <th className="px-4 py-2 text-left">名称</th>
                <th className="px-4 py-2 text-left">类型</th>
                <th className="px-4 py-2 text-left">市场</th>
                <th className="px-4 py-2 text-left">更新时间</th>
                <th className="px-4 py-2 text-left">状态</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {downloadedData.map(item => (
                <tr key={item.code} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-2 font-mono">{item.code}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">
                    <Badge variant="outline" className="text-xs">{getTypeLabel(item.type)}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs">{item.market === 'cn' ? '中国' : item.market === 'hk' ? '香港' : '美国'}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-400">{item.updateTime}</td>
                  <td className="px-4 py-2">
                    {item.status === 'updated' ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3" />已更新
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs">
                        <RefreshCw className="w-3 h-3 animate-spin" />更新中
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 手机版卡片 */}
        <div className="md:hidden space-y-2">
          {downloadedData.map(item => (
            <div key={item.code} className="bg-slate-900 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{item.code}</span>
                    <Badge variant="outline" className="text-xs">{getTypeLabel(item.type)}</Badge>
                  </div>
                  <div className="text-slate-300 text-sm mt-1">{item.name}</div>
                  <div className="text-slate-500 text-xs mt-1">
                    {item.market === 'cn' ? '中国' : item.market === 'hk' ? '香港' : '美国'} · {item.updateTime}
                  </div>
                </div>
                {item.status === 'updated' ? (
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
