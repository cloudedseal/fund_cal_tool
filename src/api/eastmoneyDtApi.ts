/**
 * 东方财富「基金定投收益计算器」使用的计算接口
 * 页面: https://data.eastmoney.com/money/calc/FundCalcDTSY.html
 * 接口: https://fundcomapi.tiantianfunds.com/mm/FundCalculate/fundDtCalculator
 *
 * 开发环境经 Vite 代理转发，并附带与官网一致的 Origin / Referer。
 */

/** 与东财页面一致的接口根路径 */
export const EASTMONEY_DT_API_BASE =
  'https://fundcomapi.tiantianfunds.com/mm/FundCalculate'

export const EASTMONEY_DT_CALCULATOR_PATH = '/fundDtCalculator'

export const EASTMONEY_PAGE_ORIGIN = 'https://data.eastmoney.com'

export interface DtCalculatorParams {
  fcode: string
  dtStartDate: string
  dtEndDate: string
  dtShDate?: string
  /** 定投频率，与页面一致默认 1 */
  round?: number
  /** 1=每周 2=每月 */
  roundType: 1 | 2
  monthDtDay?: number
  dtAmount: number
  /** 开始日为首次扣款日 */
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

/** 构建与东财页面相同的查询参数 */
export function buildEastmoneyDtQuery(
  params: DtCalculatorParams & { monthDtDay: number },
): string {
  return new URLSearchParams({
    fcode: params.fcode.trim(),
    dtStartDate: params.dtStartDate,
    dtEndDate: params.dtEndDate,
    dtShDate: params.dtShDate ?? '',
    round: String(params.round ?? 1),
    roundType: String(params.roundType),
    monthDtDay: String(params.monthDtDay),
    dtAmount: String(params.dtAmount),
    startDayFirstDeduction: String(params.startDayFirstDeduction ?? true),
  }).toString()
}

/** 开发走 Vite 代理；生产可设 VITE_EASTMONEY_DT_API 为完整 URL 前缀 */
function getRequestUrl(query: string): string {
  const customBase = import.meta.env.VITE_EASTMONEY_DT_API as string | undefined
  if (customBase) {
    return `${customBase.replace(/\/$/, '')}${EASTMONEY_DT_CALCULATOR_PATH}?${query}`
  }
  return `/api/eastmoney${EASTMONEY_DT_CALCULATOR_PATH}?${query}`
}

/**
 * 直接调用东方财富定投计算器 API（JSON 响应，无需 jsoncallback）
 */
export async function callEastmoneyDtCalculator(
  params: DtCalculatorParams & { monthDtDay: number },
): Promise<DtCalculatorResponse> {
  const query = buildEastmoneyDtQuery(params)
  const url = getRequestUrl(query)

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Origin: EASTMONEY_PAGE_ORIGIN,
      Referer: `${EASTMONEY_PAGE_ORIGIN}/`,
    },
  })

  if (!res.ok) {
    throw new Error(`东财定投接口请求失败: HTTP ${res.status}`)
  }

  const json: DtCalculatorResponse = await res.json()
  if (!json.success) {
    throw new Error(`东财定投计算失败 (errorCode=${json.errorCode})`)
  }
  return json
}

export function parseDtResult(
  params: DtCalculatorParams & { monthDtDay: number },
  data: DtCalculatorData,
): DtResult {
  return {
    monthDtDay: params.monthDtDay,
    periods: data.dtPeriods,
    principal: parseFloat(data.totalPrincipal),
    finalAssets: parseFloat(data.finalTotalAssets),
    returnPct: parseFloat(data.dtSly),
    profit: parseFloat(data.totalSy),
    lastRecord: data.dtRecords[data.dtRecords.length - 1] ?? '',
    records: data.dtRecords,
  }
}

export async function fetchDtCalculator(
  params: DtCalculatorParams & { monthDtDay: number },
): Promise<DtResult> {
  const json = await callEastmoneyDtCalculator(params)
  return parseDtResult(params, json.data)
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
