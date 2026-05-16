import type { DtCalculatorParams } from '../api/eastmoneyDtApi'

export interface FormState extends DtCalculatorParams {
  monthDtDay: number
}

interface Props {
  value: FormState
  onChange: (value: FormState) => void
  onCalculate: () => void
  onScan: () => void
  loading: boolean
  scanning: boolean
}

export function CalculatorForm({
  value,
  onChange,
  onCalculate,
  onScan,
  loading,
  scanning,
}: Props) {
  const set = <K extends keyof FormState>(key: K, v: FormState[K]) =>
    onChange({ ...value, [key]: v })

  const busy = loading || scanning

  return (
    <form
      className="calc-form"
      onSubmit={(e) => {
        e.preventDefault()
        onCalculate()
      }}
    >
      <div className="form-grid">
        <label>
          <span>基金代码 *</span>
          <input
            required
            value={value.fcode}
            onChange={(e) => set('fcode', e.target.value)}
            placeholder="如 159941"
          />
        </label>

        <label>
          <span>定投开始日 *</span>
          <input
            required
            type="date"
            value={value.dtStartDate}
            onChange={(e) => set('dtStartDate', e.target.value)}
          />
        </label>

        <label>
          <span>定投结束日</span>
          <input
            type="date"
            value={value.dtEndDate}
            onChange={(e) => set('dtEndDate', e.target.value)}
          />
        </label>

        <label>
          <span>定投赎回日</span>
          <input
            type="date"
            value={value.dtShDate ?? ''}
            onChange={(e) => set('dtShDate', e.target.value)}
          />
        </label>

        <label>
          <span>定投周期 *</span>
          <select
            value={value.roundType}
            onChange={(e) => set('roundType', Number(e.target.value) as 1 | 2)}
          >
            <option value={2}>每月</option>
            <option value={1}>每周</option>
          </select>
        </label>

        <label>
          <span>定投日（月 1–28）*</span>
          <input
            required
            type="number"
            min={1}
            max={28}
            value={value.monthDtDay}
            onChange={(e) => set('monthDtDay', Number(e.target.value))}
          />
        </label>

        <label>
          <span>每期金额（元）*</span>
          <input
            required
            type="number"
            min={1}
            step={1}
            value={value.dtAmount}
            onChange={(e) => set('dtAmount', Number(e.target.value))}
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={value.startDayFirstDeduction ?? true}
            onChange={(e) => set('startDayFirstDeduction', e.target.checked)}
          />
          <span>开始日为首次扣款日</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={busy}>
          {loading ? '计算中…' : '计算收益'}
        </button>
        <button
          type="button"
          className="secondary"
          disabled={busy || value.roundType !== 2}
          onClick={onScan}
          title={value.roundType !== 2 ? 'P0 仅支持按月扫描 1–28 日' : undefined}
        >
          {scanning ? '扫描中…' : '扫描最优定投日 (1–28)'}
        </button>
      </div>
    </form>
  )
}
