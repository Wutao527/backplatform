"""
统一数据获取模块
支持：Baostock、Tushare、东方财富、yfinance
限速：所有请求间隔 > 1秒
"""

import time
import os
import requests
import yfinance as yf
import pandas as pd
from datetime import datetime
from typing import Optional, Literal

# 可选依赖
try:
    import baostock as bs
    BAOSTOCK_AVAILABLE = True
except ImportError:
    BAOSTOCK_AVAILABLE = False

try:
    import tushare as ts
    TUSHARE_AVAILABLE = True
except ImportError:
    TUSHARE_AVAILABLE = False


class DataFetcher:
    """
    统一数据获取器
    自动处理限速、错误重试、数据格式标准化
    """
    
    def __init__(self, tushare_token: Optional[str] = None):
        self.last_request_time = 0
        self.min_interval = 1.0  # 最小请求间隔 1秒
        
        # Baostock 登录状态
        self._baostock_logged_in = False
        
        # Tushare 初始化
        self._tushare_pro = None
        if TUSHARE_AVAILABLE and tushare_token:
            ts.set_token(tushare_token)
            self._tushare_pro = ts.pro_api()
    
    def _rate_limit(self):
        """限速控制：确保两次请求间隔至少1秒"""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_interval:
            sleep_time = self.min_interval - elapsed
            time.sleep(sleep_time)
        self.last_request_time = time.time()
    
    # ==================== Baostock (完全免费) ====================
    
    def _baostock_login(self):
        """Baostock 登录（只需一次）"""
        if not BAOSTOCK_AVAILABLE:
            raise ImportError("Baostock not installed. Run: pip install baostock")
        
        if not self._baostock_logged_in:
            self._rate_limit()
            lg = bs.login()
            if lg.error_code != '0':
                raise Exception(f"Baostock login failed: {lg.error_msg}")
            self._baostock_logged_in = True
    
    def get_baostock(self, code: str, start: str, end: str) -> pd.DataFrame:
        """
        使用 Baostock 获取 A 股数据
        code: 600000 (自动转换格式 sh.600000)
        """
        self._baostock_login()
        self._rate_limit()
        
        # 转换代码格式
        if code.startswith('6'):
            bs_code = f"sh.{code}"
        elif code.startswith('0') or code.startswith('3'):
            bs_code = f"sz.{code}"
        else:
            bs_code = code
        
        # 查询历史数据
        rs = bs.query_history_k_data_plus(
            bs_code,
            "date,code,open,high,low,close,volume,amount,turn,pctChg",
            start_date=start.replace('-', ''),
            end_date=end.replace('-', ''),
            frequency="d",
            adjustflag="3"  # 复权方式：3=不复权，2=前复权，1=后复权
        )
        
        if rs.error_code != '0':
            raise Exception(f"Baostock error: {rs.error_msg}")
        
        # 解析数据
        data_list = []
        while rs.next():
            row = rs.get_row_data()
            data_list.append({
                'date': row[0],
                'code': row[1].replace('sh.', '').replace('sz.', ''),
                'open': float(row[2]) if row[2] else None,
                'high': float(row[3]) if row[3] else None,
                'low': float(row[4]) if row[4] else None,
                'close': float(row[5]) if row[5] else None,
                'volume': float(row[6]) if row[6] else 0,
                'amount': float(row[7]) if row[7] else 0,
                'turnover': float(row[8]) if row[8] else None,
                'pct_chg': float(row[9]) if row[9] else None,
            })
        
        return pd.DataFrame(data_list)
    
    # ==================== Tushare (需Token) ====================
    
    def get_tushare(self, code: str, start: str, end: str) -> pd.DataFrame:
        """
        使用 Tushare 获取数据
        code: 000001.SZ 或 600000.SH 格式
        """
        if not TUSHARE_AVAILABLE:
            raise ImportError("Tushare not installed. Run: pip install tushare")
        
        if self._tushare_pro is None:
            raise Exception("Tushare token not set. Initialize with DataFetcher(tushare_token='your_token')")
        
        self._rate_limit()
        
        # 转换代码格式
        if '.' not in code:
            if code.startswith('6'):
                ts_code = f"{code}.SH"
            else:
                ts_code = f"{code}.SZ"
        else:
            ts_code = code
        
        # 获取日线数据
        df = self._tushare_pro.daily(
            ts_code=ts_code,
            start_date=start.replace('-', ''),
            end_date=end.replace('-', '')
        )
        
        if df.empty:
            return pd.DataFrame()
        
        # 标准化列名
        df = df.rename(columns={
            'trade_date': 'date',
            'open': 'open',
            'high': 'high',
            'low': 'low',
            'close': 'close',
            'vol': 'volume',
            'amount': 'amount',
        })
        df['code'] = code.replace('.SH', '').replace('.SZ', '')
        df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
        
        return df[['date', 'code', 'open', 'high', 'low', 'close', 'volume', 'amount']]
    
    def get_tushare_fund(self, code: str, start: str, end: str) -> pd.DataFrame:
        """Tushare 获取场内基金(ETF)数据"""
        if not TUSHARE_AVAILABLE or self._tushare_pro is None:
            raise Exception("Tushare not initialized")
        
        self._rate_limit()
        
        # ETF 代码格式
        if code.startswith('5'):
            ts_code = f"{code}.SH"
        else:
            ts_code = f"{code}.SZ"
        
        df = self._tushare_pro.fund_daily(
            ts_code=ts_code,
            start_date=start.replace('-', ''),
            end_date=end.replace('-', '')
        )
        
        if df.empty:
            return pd.DataFrame()
        
        df = df.rename(columns={
            'trade_date': 'date',
            'open': 'open',
            'high': 'high',
            'low': 'low',
            'close': 'close',
            'vol': 'volume',
        })
        df['code'] = code
        df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
        
        return df[['date', 'code', 'open', 'high', 'low', 'close', 'volume']]
    
    # ==================== 东方财富 (免费网页API) ====================
    
    def get_eastmoney(self, code: str, market: Literal['stock', 'etf'], start: str, end: str) -> pd.DataFrame:
        """
        东方财富网页 API
        market: 'stock' 或 'etf'
        """
        self._rate_limit()
        
        # 判断市场代码
        if code.startswith('6') or code.startswith('5'):
            secid = f"1.{code}"  # 上海
        else:
            secid = f"0.{code}"  # 深圳
        
        url = "http://push2his.eastmoney.com/api/qt/stock/kline/get"
        params = {
            "secid": secid,
            "fields1": "f1,f2,f3,f4,f5,f6",
            "fields2": "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
            "klt": "101",  # 日线
            "fqt": "0",    # 不复权
            "beg": start.replace('-', ''),
            "end": end.replace('-', ''),
            "ut": "fa5fd1943c7b386f172d6893dbfba10b",
        }
        
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if 'data' not in data or not data['data'] or 'klines' not in data['data']:
            return pd.DataFrame()
        
        # 解析 kline 数据: date,open,close,high,low,volume,amount,amplitude,pct_chg,change,turnover
        klines = data['data']['klines']
        rows = []
        for line in klines:
            parts = line.split(',')
            rows.append({
                'date': parts[0],
                'code': code,
                'open': float(parts[1]),
                'close': float(parts[2]),
                'high': float(parts[3]),
                'low': float(parts[4]),
                'volume': float(parts[5]),
                'amount': float(parts[6]),
                'amplitude': float(parts[7]) if len(parts) > 7 else None,
                'pct_chg': float(parts[8]) if len(parts) > 8 else None,
                'change': float(parts[9]) if len(parts) > 9 else None,
                'turnover': float(parts[10]) if len(parts) > 10 else None,
            })
        
        return pd.DataFrame(rows)
    
    # ==================== yfinance (全球数据) ====================
    
    def get_yfinance(self, symbol: str, start: str, end: str) -> pd.DataFrame:
        """
        yfinance 获取全球数据
        symbol: AAPL, MSFT, SPY, QQQ, 000001.SS(上证指数)等
        """
        self._rate_limit()
        
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=start, end=end)
        
        if df.empty:
            return pd.DataFrame()
        
        # 标准化
        df = df.reset_index()
        df.columns = [c.lower().replace(' ', '_') for c in df.columns]
        df = df.rename(columns={
            'date': 'date',
            'open': 'open',
            'high': 'high',
            'low': 'low',
            'close': 'close',
            'volume': 'volume',
        })
        df['code'] = symbol
        df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
        
        return df[['date', 'code', 'open', 'high', 'low', 'close', 'volume']]
    
    # ==================== 统一接口 ====================
    
    def fetch(self, 
              code: str, 
              source: Literal['baostock', 'tushare', 'eastmoney', 'yfinance'],
              start: str, 
              end: str,
              market: Optional[str] = None) -> pd.DataFrame:
        """
        统一获取接口
        
        Parameters:
            code: 股票/基金代码
            source: 数据源名称
            start: 开始日期 '2024-01-01'
            end: 结束日期 '2024-12-31'
            market: 可选，用于某些数据源判断市场
        
        Returns:
            DataFrame with columns: date, code, open, high, low, close, volume, [amount]
        """
        if source == 'baostock':
            return self.get_baostock(code, start, end)
        elif source == 'tushare':
            if market == 'fund':
                return self.get_tushare_fund(code, start, end)
            return self.get_tushare(code, start, end)
        elif source == 'eastmoney':
            return self.get_eastmoney(code, market or 'stock', start, end)
        elif source == 'yfinance':
            return self.get_yfinance(code, start, end)
        else:
            raise ValueError(f"Unknown source: {source}. Available: baostock, tushare, eastmoney, yfinance")
    
    def fetch_with_fallback(self, 
                           code: str,
                           sources: list,
                           start: str,
                           end: str,
                           market: Optional[str] = None) -> pd.DataFrame:
        """
        带自动降级策略的数据获取
        按顺序尝试多个数据源，直到成功
        """
        last_error = None
        
        for source in sources:
            try:
                print(f"Trying source: {source} for {code}...")
                df = self.fetch(code, source, start, end, market)
                if not df.empty:
                    print(f"Success: Got {len(df)} records from {source}")
                    return df
            except Exception as e:
                last_error = e
                print(f"Failed {source}: {e}")
                continue
        
        raise Exception(f"All sources failed. Last error: {last_error}")
    
    def __del__(self):
        """析构时登出 Baostock"""
        if self._baostock_logged_in and BAOSTOCK_AVAILABLE:
            bs.logout()


# ==================== 便捷函数 ====================

def create_fetcher(tushare_token: Optional[str] = None) -> DataFetcher:
    """工厂函数，创建配置好的 Fetcher"""
    return DataFetcher(tushare_token=tushare_token)


# 预定义数据源优先级（按可靠性排序）
SOURCE_PRIORITY = {
    'cn_stock': ['tushare', 'baostock', 'eastmoney'],  # Tushare 最稳定
    'cn_etf': ['tushare', 'eastmoney', 'baostock'],
    'us_stock': ['yfinance'],
    'us_etf': ['yfinance'],
    'global': ['yfinance'],
}


if __name__ == '__main__':
    # 测试代码
    print("Testing DataFetcher...")
    
    fetcher = create_fetcher()
    
    # 测试东方财富
    print("\n1. Testing Eastmoney (510300 ETF):")
    try:
        df = fetcher.get_eastmoney('510300', 'etf', '2024-01-01', '2024-01-10')
        print(f"Got {len(df)} records")
        print(df.head())
    except Exception as e:
        print(f"Error: {e}")
    
    # 测试 Baostock
    print("\n2. Testing Baostock (600000):")
    try:
        df = fetcher.get_baostock('600000', '2024-01-01', '2024-01-10')
        print(f"Got {len(df)} records")
        print(df.head())
    except Exception as e:
        print(f"Error: {e}")
    
    # 测试 yfinance
    print("\n3. Testing yfinance (SPY):")
    try:
        df = fetcher.get_yfinance('SPY', '2024-01-01', '2024-01-10')
        print(f"Got {len(df)} records")
        print(df.head())
    except Exception as e:
        print(f"Error: {e}")
    
    print("\nDone!")
