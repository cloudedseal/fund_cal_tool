import { useCallback, useMemo, useState } from 'react'
import {
  fetchDtCalculator,
  scanMonthDays,
  type DtResult,
} from './api/fundCalculator'
import { CalculatorForm, type FormState } from './components/CalculatorForm'
import { DayScanPanel } from './components/DayScanPanel'
import { DtRecordsTable } from './components/DtRecordsTable'
import { ResultSummary } from './components/ResultSummary'
import './App.css'

const defaultForm: FormState = {
  fcode: '159941',
  dtStartDate: '2021-05-16',
  dtEndDate: '2026-06-01',
  dtShDate: '',
  round: 1,
  roundType: 2,
  monthDtDay: 1,
  dtAmount: 1000,
  startDayFirstDeduction: true,
}

function App() {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [result, setResult] = useState<DtResult | null>(null)
  const [scanResults, setScanResults] = useState<DtResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<{ done: number; total: number } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  const params = useMemo(
    () => ({
      fcode: form.fcode,
      dtStartDate: form.dtStartDate,
      dtEndDate: form.dtEndDate,
      dtShDate: form.dtShDate || undefined,
      round: form.round,
      roundType: form.roundType,
      dtAmount: form.dtAmount,
      startDayFirstDeduction: form.startDayFirstDeduction,
    }),
    [form],
  )

  const handleCalculate = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchDtCalculator({ ...params, monthDtDay: form.monthDtDay })
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '计算失败')
    } finally {
      setLoading(false)
    }
  }, [form, params])

  const handleScan = useCallback(async () => {
    setError(null)
    setScanning(true)
    setScanProgress({ done: 0, total: 28 })
    setScanResults(null)
    try {
      const data = await scanMonthDays(params, (done, total) => {
        setScanProgress({ done, total })
      })
      setScanResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '扫描失败')
    } finally {
      setScanning(false)
      setScanProgress(null)
    }
  }, [params])

  return (
    <div className="app">
      <header className="app-header">
        <h1>基金定投收益计算器</h1>
        <p className="subtitle">
          对齐{' '}
          <a
            href="https://data.eastmoney.com/money/calc/FundCalcDTSY.html"
            target="_blank"
            rel="noreferrer"
          >
            东方财富定投计算器
          </a>
          · 支持扫描每月 1–28 日找最优扣款日
        </p>
      </header>

      <main className="app-main">
        <section className="panel form-panel">
          <h2>定投参数</h2>
          <CalculatorForm
            value={form}
            onChange={setForm}
            onCalculate={handleCalculate}
            onScan={handleScan}
            loading={loading}
            scanning={scanning}
          />
          {error && <p className="error">{error}</p>}
        </section>

        <ResultSummary result={result} />
        <DtRecordsTable result={result} />
        <DayScanPanel
          results={scanResults}
          progress={scanning ? scanProgress : null}
          selectedDay={form.monthDtDay}
        />
      </main>

      <footer className="app-footer">
        计算结果仅供参考，不构成投资建议。数据来自天天基金开放接口。
      </footer>
    </div>
  )
}

export default App
