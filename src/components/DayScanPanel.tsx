import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DtResult } from '../api/fundCalculator'
import { getMaxPeriods, rankByFinalAssets } from '../api/fundCalculator'

interface Props {
  results: DtResult[] | null
  progress: { done: number; total: number } | null
  selectedDay: number | null
}

function fmt(n: number) {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

export function DayScanPanel({ results, progress, selectedDay }: Props) {
  if (progress) {
    return (
      <section className="panel scan-panel">
        <h2>扫描最优定投日</h2>
        <p className="hint">
          正在请求 {progress.done}/{progress.total} …
        </p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(progress.done / progress.total) * 100}%` }}
          />
        </div>
      </section>
    )
  }

  if (!results?.length) return null

  const maxPeriods = getMaxPeriods(results)
  const ranked = rankByFinalAssets(results)
  const best = ranked[0]
  const uneven = results.filter((r) => r.periods !== maxPeriods)

  const chartData = [...results]
    .sort((a, b) => a.monthDtDay - b.monthDtDay)
    .map((r) => ({
      day: `${r.monthDtDay}日`,
      dayNum: r.monthDtDay,
      finalAssets: r.finalAssets,
      fair: r.periods === maxPeriods,
    }))

  return (
    <section className="panel scan-panel">
      <h2>扫描最优定投日</h2>
      {best && (
        <div className="best-banner">
          <strong>
            同等期数（{maxPeriods} 期）下最优：每月 {best.monthDtDay} 日
          </strong>
          <span>
            期末 {fmt(best.finalAssets)} 元 · 收益率 {best.returnPct.toFixed(4)}% · 总收益{' '}
            {fmt(best.profit)} 元
          </span>
          {selectedDay != null && selectedDay !== best.monthDtDay && (
            <span className="vs-current">
              当前选择 {selectedDay} 日，比最优少{' '}
              {fmt(
                best.finalAssets -
                  (results.find((r) => r.monthDtDay === selectedDay)?.finalAssets ?? 0),
              )}{' '}
              元
            </span>
          )}
        </div>
      )}

      {uneven.length > 0 && (
        <p className="warn">
          提示：结束日导致 {uneven.map((r) => r.monthDtDay).join('、')} 日仅 {uneven[0].periods}{' '}
          期（其余 {maxPeriods} 期），排名已按期数相同组对比。
        </p>
      )}

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={1} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(Number(v) / 10000).toFixed(0)}万`}
              width={48}
            />
            <Tooltip
              formatter={(v) => [`${fmt(Number(v))} 元`, '期末总资产']}
              labelFormatter={(l) => `每月${l}`}
            />
            <Bar dataKey="finalAssets" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.dayNum}
                  fill={
                    entry.dayNum === best?.monthDtDay
                      ? '#e74c3c'
                      : entry.dayNum === selectedDay
                        ? '#3498db'
                        : entry.fair
                          ? '#52a675'
                          : '#b0b0b0'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-scroll">
        <table className="rank-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>定投日</th>
              <th>期数</th>
              <th>期末总资产</th>
              <th>总收益</th>
              <th>收益率</th>
              <th>末次扣款</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr
                key={r.monthDtDay}
                className={
                  r.monthDtDay === best?.monthDtDay
                    ? 'row-best'
                    : r.monthDtDay === selectedDay
                      ? 'row-selected'
                      : ''
                }
              >
                <td>{i + 1}</td>
                <td>每月 {r.monthDtDay} 日</td>
                <td>{r.periods}</td>
                <td>{fmt(r.finalAssets)}</td>
                <td>{fmt(r.profit)}</td>
                <td>{r.returnPct.toFixed(4)}%</td>
                <td>{r.lastRecord}</td>
              </tr>
            ))}
            {uneven
              .sort((a, b) => a.monthDtDay - b.monthDtDay)
              .map((r) => (
                <tr key={`u-${r.monthDtDay}`} className="row-uneven">
                  <td>—</td>
                  <td>每月 {r.monthDtDay} 日</td>
                  <td>{r.periods}</td>
                  <td colSpan={4}>期数不足，未纳入公平排名</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
