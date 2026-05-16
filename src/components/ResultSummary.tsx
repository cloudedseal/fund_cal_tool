import type { DtResult } from '../api/fundCalculator'

interface Props {
  result: DtResult | null
}

function fmt(n: number, digits = 2) {
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function ResultSummary({ result }: Props) {
  if (!result) {
    return (
      <section className="panel result-panel empty">
        <h2>计算结果</h2>
        <p className="hint">填写参数后点击「计算收益」</p>
      </section>
    )
  }

  return (
    <section className="panel result-panel">
      <h2>计算结果</h2>
      <p className="panel-sub">截止定投赎回日的收益（数据来源：天天基金 API，与东方财富计算器一致）</p>
      <table className="summary-table">
        <thead>
          <tr>
            <th>定投总期数</th>
            <th>投入总本金（元）</th>
            <th>期末总资产（元）</th>
            <th>定投收益率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.periods}</td>
            <td>{fmt(result.principal)}</td>
            <td className="highlight">{fmt(result.finalAssets)}</td>
            <td className="highlight">{fmt(result.returnPct, 4)}%</td>
          </tr>
        </tbody>
      </table>
      <p className="extra-metric">
        总收益：<strong>{fmt(result.profit)}</strong> 元 · 末次扣款：{result.lastRecord}
      </p>
    </section>
  )
}
