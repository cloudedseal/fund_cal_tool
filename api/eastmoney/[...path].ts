/**
 * Vercel 生产环境代理：转发到天天基金定投计算 API
 * 开发环境仍由 vite.config.ts 的 proxy 处理
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

const UPSTREAM = 'https://fundcomapi.tiantianfunds.com'
const EASTMONEY_ORIGIN = 'https://data.eastmoney.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const segments = req.query.path
  const path = Array.isArray(segments)
    ? segments.join('/')
    : typeof segments === 'string'
      ? segments
      : ''

  if (!path) {
    res.status(400).json({ error: 'Missing API path' })
    return
  }

  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v))
    } else if (value !== undefined) {
      qs.append(key, String(value))
    }
  }
  const search = qs.toString()
  const target = `${UPSTREAM}/${path}${search ? `?${search}` : ''}`

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        Accept: '*/*',
        Origin: EASTMONEY_ORIGIN,
        Referer: `${EASTMONEY_ORIGIN}/`,
      },
    })

    const body = await upstream.text()
    res
      .status(upstream.status)
      .setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json')
      .setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      .send(body)
  } catch (e) {
    res.status(502).json({
      error: 'Upstream request failed',
      message: e instanceof Error ? e.message : String(e),
    })
  }
}
