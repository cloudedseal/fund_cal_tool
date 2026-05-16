import type { DtResult } from '../api/eastmoneyDtApi'

interface Props {
  result: DtResult | null
}

export function DtRecordsTable({ result }: Props) {
  if (!result?.records.length) return null

  return (
    <section className="panel">
      <h2>定投记录</h2>
      <div className="table-scroll">
        <table className="records-table">
          <thead>
            <tr>
              <th>#</th>
              <th>定投日期</th>
            </tr>
          </thead>
          <tbody>
            {result.records.map((date, i) => (
              <tr key={date + i}>
                <td>{i + 1}</td>
                <td>{date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
