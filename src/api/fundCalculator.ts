export interface DtCalculatorParams {
  fcode: string
  dtStartDate: string
  dtEndDate: string
  dtShDate?: string
  round?: number
  roundType: 1 | 2
  monthDtDay?: number
  dtAmount: number
  startDayFirstDeduction?: boolean
}

export interface DtCalculatorData {
  dtPeriods: number
  totalPrincipal: string
  finalTotalAssets: string
  dtSly: string
  totalSy: string
  dtRecords: string[]
}

export interface DtCalculatorResponse {
  success: boolean
  errorCode: number
  data: DtCalculatorData
}

export interface DtResult {
  monthDtDay: number
  periods: number
  principal: number
  finalAssets: number
  returnPct: number
  profit: number
  lastRecord: string
  records: string[]
}

function buildQuery(params: DtCalculatorParams & { monthDtDay: number }): string {
  const q = new URLSearchParams({
    fcode: params.fcode.trim(),
    dtStartDate: params.dtStartDate,
    dtEndDate: params.dtEndDate,
    dtShDate: params.dtShDate ?? '',
    round: String(params.round ?? 1),
    roundType: String(params.roundType),
    monthDtDay: String(params.monthDtDay),
    dtAmount: String(params.dtAmount),
    startDayFirstDeduction: String(params.startDayFirstDeduction ?? true),
  })
  return q.toString()
}

export async function fetchDtCalculator(
  params: DtCalculatorParams & { monthDtDay: number },
): Promise<DtResult> {
  const url = `/api/fund/mm/FundCalculate/fundDtCalculator?${buildQuery(params)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  const json: DtCalculatorResponse = await res.json()
  if (!json.success) throw new Error(`计算失败 (errorCode=${json.errorCode})`)

  const d = json.data
  return {
    monthDtDay: params.monthDtDay,
    periods: d.dtPeriods,
    principal: parseFloat(d.totalPrincipal),
    finalAssets: parseFloat(d.finalTotalAssets),
    returnPct: parseFloat(d.dtSly),
    profit: parseFloat(d.totalSy),
    lastRecord: d.dtRecords[d.dtRecords.length - 1] ?? '',
    records: d.dtRecords,
  }
}

export async function scanMonthDays(
  params: DtCalculatorParams,
  onProgress?: (done: number, total: number) => void,
): Promise<DtResult[]> {
  const results: DtResult[] = []
  for (let day = 1; day <= 28; day++) {
    results.push(await fetchDtCalculator({ ...params, monthDtDay: day }))
    onProgress?.(day, 28)
  }
  return results
}

export function rankByFinalAssets(results: DtResult[]): DtResult[] {
  const maxPeriods = Math.max(...results.map((r) => r.periods))
  const fair = results.filter((r) => r.periods === maxPeriods)
  return [...fair].sort((a, b) => b.finalAssets - a.finalAssets)
}

export function getMaxPeriods(results: DtResult[]): number {
  return Math.max(...results.map((r) => r.periods))
}
