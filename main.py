"""
回测平台 FastAPI 后端
支持多数据源：Baostock、Tushare、东方财富、yfinance
"""

import os
import json
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from data_fetcher import DataFetcher, SOURCE_PRIORITY

# 初始化
app = FastAPI(title="回测平台 API", version="1.1.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据获取器（从环境变量读取 Tushare Token）
TUSHARE_TOKEN = os.getenv('TUSHARE_TOKEN')
fetcher = DataFetcher(tushare_token=TUSHARE_TOKEN)

# ==================== 数据模型 ====================

class DownloadRequest(BaseModel):
    code: str
    source: str = "eastmoney"  # baostock, tushare, eastmoney, yfinance
    start: str = "2024-01-01"
    end: str = "2024-12-31"
    market: Optional[str] = None  # stock, etf

class BacktestRequest(BaseModel):
    code: str
    strategy: str = "simple_ma"  # 策略名称
    start: str = "2024-01-01"
    end: str = "2024-12-31"
    params: dict = {}  # 策略参数

class FundInfo(BaseModel):
    code: str
    name: str
    market: str  # cn_stock, cn_etf, us_stock, us_etf

# ==================== 支持的标的列表 ====================

FUNDS_DB = {
    "cn_etfs": [
        {"code": "510300", "name": "沪深300ETF", "market": "cn_etf"},
        {"code": "510500", "name": "中证500ETF", "market": "cn_etf"},
        {"code": "159915", "name": "创业板ETF", "market": "cn_etf"},
        {"code": "588000", "name": "科创50ETF", "market": "cn_etf"},
        {"code": "512000", "name": "券商ETF", "market": "cn_etf"},
        {"code": "512690", "name": "酒ETF", "market": "cn_etf"},
        {"code": "159928", "name": "消费ETF", "market": "cn_etf"},
        {"code": "512170", "name": "医疗ETF", "market": "cn_etf"},
        {"code": "515030", "name": "新能源车ETF", "market": "cn_etf"},
        {"code": "159995", "name": "芯片ETF", "market": "cn_etf"},
    ],
    "cn_stocks": [
        {"code": "000001", "name": "平安银行", "market": "cn_stock"},
        {"code": "000858", "name": "五粮液", "market": "cn_stock"},
        {"code": "600519", "name": "贵州茅台", "market": "cn_stock"},
        {"code": "000333", "name": "美的集团", "market": "cn_stock"},
        {"code": "002415", "name": "海康威视", "market": "cn_stock"},
        {"code": "600036", "name": "招商银行", "market": "cn_stock"},
        {"code": "601318", "name": "中国平安", "market": "cn_stock"},
        {"code": "600276", "name": "恒瑞医药", "market": "cn_stock"},
    ],
    "us_etfs": [
        {"code": "SPY", "name": "标普500ETF", "market": "us_etf"},
        {"code": "QQQ", "name": "纳指100ETF", "market": "us_etf"},
        {"code": "IWM", "name": "罗素2000ETF", "market": "us_etf"},
        {"code": "VTI", "name": "全美股票ETF", "market": "us_etf"},
        {"code": "BND", "name": "全债市ETF", "market": "us_etf"},
        {"code": "VEA", "name": "发达市场ETF", "market": "us_etf"},
        {"code": "VWO", "name": "新兴市场ETF", "market": "us_etf"},
        {"code": "GLD", "name": "黄金ETF", "market": "us_etf"},
    ],
    "us_stocks": [
        {"code": "AAPL", "name": "苹果", "market": "us_stock"},
        {"code": "MSFT", "name": "微软", "market": "us_stock"},
        {"code": "GOOGL", "name": "谷歌", "market": "us_stock"},
        {"code": "AMZN", "name": "亚马逊", "market": "us_stock"},
        {"code": "TSLA", "name": "特斯拉", "market": "us_stock"},
        {"code": "NVDA", "name": "英伟达", "market": "us_stock"},
        {"code": "META", "name": "Meta", "market": "us_stock"},
        {"code": "BRK-B", "name": "伯克希尔", "market": "us_stock"},
    ]
}

# ==================== API 路由 ====================

@app.get("/")
def root():
    """服务状态检查"""
    return {
        "name": "回测平台 API (Multi-Source)",
        "version": "1.1.0",
        "sources": ["baostock", "tushare", "eastmoney", "yfinance"],
        "rate_limit": "1 request/sec",
        "tushare_configured": TUSHARE_TOKEN is not None,
        "time": datetime.now().isoformat()
    }

@app.get("/api/funds")
def get_funds(category: Optional[str] = None):
    """获取支持的基金/股票列表"""
    if category and category in FUNDS_DB:
        return {"category": category, "data": FUNDS_DB[category]}
    
    # 返回所有
    all_funds = []
    for cat, funds in FUNDS_DB.items():
        all_funds.extend(funds)
    
    return {
        "categories": list(FUNDS_DB.keys()),
        "total": len(all_funds),
        "sources": {
            "baostock": "完全免费，A股基础数据",
            "tushare": "需Token，数据最全" if TUSHARE_TOKEN else "需Token(未配置)",
            "eastmoney": "免费网页API，实时数据",
            "yfinance": "Yahoo Finance，全球数据"
        },
        "data": all_funds
    }

@app.post("/api/download")
def download_data(req: DownloadRequest):
    """
    下载历史数据
    自动限速：1秒/请求
    """
    try:
        # 验证 source
        valid_sources = ['baostock', 'tushare', 'eastmoney', 'yfinance']
        if req.source not in valid_sources:
            raise HTTPException(400, f"Invalid source. Use: {valid_sources}")
        
        # 获取数据
        df = fetcher.fetch(
            code=req.code,
            source=req.source,
            start=req.start,
            end=req.end,
            market=req.market
        )
        
        if df.empty:
            return {
                "success": False,
                "error": "No data returned",
                "code": req.code,
                "source": req.source
            }
        
        # 保存到文件（可选）
        os.makedirs("/tmp/data", exist_ok=True)
        filename = f"{req.code}_{req.start}_{req.end}.csv"
        filepath = f"/tmp/data/{filename}"
        df.to_csv(filepath, index=False)
        
        return {
            "success": True,
            "code": req.code,
            "source": req.source,
            "records": len(df),
            "date_range": {
                "start": df['date'].iloc[0] if not df.empty else None,
                "end": df['date'].iloc[-1] if not df.empty else None
            },
            "columns": list(df.columns),
            "filename": filename,
            "sample": df.head(3).to_dict('records'),
            "preview": {
                "open": df['open'].iloc[-1] if not df.empty else None,
                "close": df['close'].iloc[-1] if not df.empty else None,
                "volume": df['volume'].iloc[-1] if not df.empty else None,
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "code": req.code,
            "source": req.source
        }

@app.post("/api/download/batch")
def download_batch(codes: List[str], source: str = "eastmoney", start: str = "2024-01-01", end: str = "2024-12-31"):
    """
    批量下载（自动限速，顺序执行）
    """
    results = []
    errors = []
    
    for code in codes:
        try:
            result = download_data(DownloadRequest(
                code=code,
                source=source,
                start=start,
                end=end
            ))
            results.append(result)
        except Exception as e:
            errors.append({"code": code, "error": str(e)})
    
    return {
        "total": len(codes),
        "success": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }

@app.post("/api/download/smart")
def download_smart(code: str, start: str = "2024-01-01", end: str = "2024-12-31", market: Optional[str] = None):
    """
    智能下载：自动选择最佳数据源
    按优先级尝试多个源，直到成功
    """
    market_type = market or 'cn_stock'
    sources = SOURCE_PRIORITY.get(market_type, ['eastmoney'])
    
    if market_type.startswith('us'):
        sources = ['yfinance']
    
    try:
        df = fetcher.fetch_with_fallback(
            code=code,
            sources=sources,
            start=start,
            end=end,
            market=market
        )
        
        return {
            "success": True,
            "code": code,
            "source_used": getattr(fetcher, '_last_success_source', 'unknown'),
            "records": len(df),
            "data": df.to_dict('records')
        }
        
    except Exception as e:
        return {
            "success": False,
            "code": code,
            "error": str(e)
        }

@app.post("/api/backtest")
def run_backtest(req: BacktestRequest):
    """
    执行简单回测（示例实现）
    """
    try:
        # 先获取数据
        market = "cn_etf" if req.code.isdigit() else "us_etf"
        source = "eastmoney" if market.startswith("cn") else "yfinance"
        
        df = fetcher.fetch(req.code, source, req.start, req.end, market)
        
        if df.empty:
            return {"success": False, "error": "No data available"}
        
        # 简单策略：双均线交叉
        df['ma_short'] = df['close'].rolling(window=5).mean()
        df['ma_long'] = df['close'].rolling(window=20).mean()
        
        # 生成信号
        df['signal'] = 0
        df.loc[df['ma_short'] > df['ma_long'], 'signal'] = 1
        df['position'] = df['signal'].shift(1)
        
        # 计算收益
        df['returns'] = df['close'].pct_change()
        df['strategy_returns'] = df['position'] * df['returns']
        
        # 统计
        total_return = (df['strategy_returns'].sum()) * 100
        buy_hold_return = ((df['close'].iloc[-1] / df['close'].iloc[0]) - 1) * 100
        
        trades = df[df['signal'] != df['signal'].shift(1)].shape[0]
        
        return {
            "success": True,
            "code": req.code,
            "strategy": req.strategy,
            "period": f"{req.start} to {req.end}",
            "total_return_pct": round(total_return, 2),
            "buy_hold_return_pct": round(buy_hold_return, 2),
            "trades": trades,
            "data_points": len(df),
            "sample_signals": df[['date', 'close', 'ma_short', 'ma_long', 'signal']].tail(10).to_dict('records')
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/status")
def get_status():
    """系统状态"""
    return {
        "status": "running",
        "version": "1.1.0",
        "sources": {
            "baostock": True,
            "tushare": TUSHARE_TOKEN is not None,
            "eastmoney": True,
            "yfinance": True
        },
        "rate_limit": "1 request/sec",
        "supported_markets": list(SOURCE_PRIORITY.keys())
    }

# ==================== 启动 ====================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
