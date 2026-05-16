# 基金定投收益计算器 (P0)

对齐 [东方财富基金定投收益计算器](https://data.eastmoney.com/money/calc/FundCalcDTSY.html)，**直接调用其同款 API**，并支持**扫描每月 1–28 日**找出历史区间内期末总资产最高的定投日。

## API（与东财页面一致）

```
GET https://fundcomapi.tiantianfunds.com/mm/FundCalculate/fundDtCalculator
```

| 参数 | 说明 |
|------|------|
| `fcode` | 基金代码 |
| `dtStartDate` | 定投开始日 |
| `dtEndDate` | 定投结束日 |
| `dtShDate` | 赎回日（可空） |
| `round` | 频率，默认 1 |
| `roundType` | 2=每月，1=每周 |
| `monthDtDay` | 每月定投日 1–28 |
| `dtAmount` | 每期金额 |
| `startDayFirstDeduction` | 开始日是否首次扣款 |

请求头需带 `Origin: https://data.eastmoney.com`、`Referer: https://data.eastmoney.com/`（开发环境由 Vite 代理自动附加）。

## 功能

- 单策略计算：基金代码、起止日、每月定投日、每期金额
- 定投记录与汇总（期数、本金、期末资产、收益率）
- 一键扫描 1–28 日，柱状图 + 排名表，自动过滤期数不一致的日期

## 开发

```bash
npm install
npm run dev
```

开发服务器将 `/api/eastmoney` 代理到 `fundcomapi.tiantianfunds.com`，避免浏览器 CORS。

等价 curl 示例：

```bash
curl 'https://fundcomapi.tiantianfunds.com/mm/FundCalculate/fundDtCalculator?fcode=159941&dtStartDate=2021-05-16&dtEndDate=2026-06-01&dtShDate=&round=1&roundType=2&monthDtDay=1&dtAmount=1000&startDayFirstDeduction=true' \
  -H 'Origin: https://data.eastmoney.com' \
  -H 'Referer: https://data.eastmoney.com/'
```

## 默认示例

- 基金：159941
- 区间：2021-05-16 ~ 2026-06-01
- 每月 1000 元

扫描结果应与直接调用 API 一致（同等期数下最优约为每月 20 日）。

## 说明

计算结果仅供参考，不构成投资建议。
