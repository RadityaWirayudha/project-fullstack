import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts'
import api from '../lib/api'
import { formatRupiah, formatDate, MONTH_NAMES } from '../lib/format'

const currentYear = new Date().getFullYear()

export default function Dashboard() {
  const [year, setYear] = useState(currentYear)
  const [summary, setSummary] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [monthly, setMonthly] = useState(null)

  useEffect(() => {
    api.get('/reports/summary', { params: { year } }).then(({ data }) => setSummary(data))
  }, [year])

  useEffect(() => {
    api.get('/reports/monthly', { params: { year, month } }).then(({ data }) => setMonthly(data))
  }, [year, month])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan laporan tahun {year}</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input-select w-auto"
        >
          {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="stat-card bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-emerald-700">Total Pemasukan</p>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{formatRupiah(summary.total_income)}</p>
            <p className="text-xs text-emerald-600/60 mt-1">Tahun {year}</p>
          </div>
          <div className="stat-card bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600/10 text-rose-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-rose-700">Total Pengeluaran</p>
            </div>
            <p className="text-2xl font-bold text-rose-700">{formatRupiah(summary.total_expense)}</p>
            <p className="text-xs text-rose-600/60 mt-1">Tahun {year}</p>
          </div>
          <div className={`stat-card border ${summary.balance >= 0 ? 'bg-gradient-to-br from-slate-50 to-blue-50/50 border-blue-200' : 'bg-gradient-to-br from-slate-50 to-rose-50 border-rose-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${summary.balance >= 0 ? 'bg-blue-600/10 text-blue-600' : 'bg-rose-600/10 text-rose-600'}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">Saldo</p>
            </div>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
              {formatRupiah(summary.balance)}
            </p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-slate-800">Grafik Pemasukan vs Pengeluaran</h2>
          <span className="badge-slate text-xs">{year}</span>
        </div>
        <div className="h-80">
          {summary && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.months} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}rb`}
                />
                <Tooltip
                  formatter={(v) => formatRupiah(v)}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
                />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-slate-800">Detail Report Bulanan</h2>
            <p className="text-xs text-slate-400 mt-0.5">Data pemasukan dan pengeluaran per bulan</p>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="input-select w-auto"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>

        {monthly && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-semibold text-emerald-700">
                  Pemasukan — {formatRupiah(monthly.total_income)}
                </h3>
              </div>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Rumah</th>
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.incomes.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Tidak ada pemasukan</td></tr>
                    )}
                    {monthly.incomes.map((p) => (
                      <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 text-slate-600">{formatDate(p.payment_date)}</td>
                        <td className="px-4 py-2.5 font-medium">{p.house?.house_number}</td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {[...new Set(p.details.map((d) => `Iuran ${d.fee_type}`))].join(', ')}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-emerald-600">{formatRupiah(p.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <h3 className="text-sm font-semibold text-rose-700">
                  Pengeluaran — {formatRupiah(monthly.total_expense)}
                </h3>
              </div>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Deskripsi</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.expenses.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Tidak ada pengeluaran</td></tr>
                    )}
                    {monthly.expenses.map((e) => (
                      <tr key={e.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 text-slate-600">{formatDate(e.expense_date)}</td>
                        <td className="px-4 py-2.5">
                          <span className="badge-slate">{e.category}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{e.description}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-rose-600">{formatRupiah(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {monthly && (
          <div className="mt-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
              <span className="font-medium text-slate-700">Saldo bulan {monthly.label}</span>
            </div>
            <span className={`text-lg font-bold ${monthly.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatRupiah(monthly.balance)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
