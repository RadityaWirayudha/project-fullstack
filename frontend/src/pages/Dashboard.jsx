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
        <h1 className="text-2xl font-bold">Dashboard &amp; Report</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Pemasukan {year}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(summary.total_income)}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Pengeluaran {year}</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{formatRupiah(summary.total_expense)}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Saldo</p>
            <p className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {formatRupiah(summary.balance)}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="font-semibold mb-4">Grafik Pemasukan vs Pengeluaran — {year}</h2>
        <div className="h-80">
          {summary && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.months} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}rb`}
                />
                <Tooltip formatter={(v) => formatRupiah(v)} />
                <Legend />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Detail Report Bulanan</h2>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>

        {monthly && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-emerald-700 mb-2">
                Pemasukan — {formatRupiah(monthly.total_income)}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2">Tanggal</th>
                    <th className="py-2">Rumah</th>
                    <th className="py-2">Keterangan</th>
                    <th className="py-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.incomes.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-slate-400">Tidak ada pemasukan</td></tr>
                  )}
                  {monthly.incomes.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="py-2">{formatDate(p.payment_date)}</td>
                      <td className="py-2">{p.house?.house_number}</td>
                      <td className="py-2">
                        {[...new Set(p.details.map((d) => `Iuran ${d.fee_type}`))].join(', ')}
                      </td>
                      <td className="py-2 text-right font-medium">{formatRupiah(p.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-700 mb-2">
                Pengeluaran — {formatRupiah(monthly.total_expense)}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2">Tanggal</th>
                    <th className="py-2">Kategori</th>
                    <th className="py-2">Deskripsi</th>
                    <th className="py-2 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.expenses.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-slate-400">Tidak ada pengeluaran</td></tr>
                  )}
                  {monthly.expenses.map((e) => (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="py-2">{formatDate(e.expense_date)}</td>
                      <td className="py-2">{e.category}</td>
                      <td className="py-2">{e.description}</td>
                      <td className="py-2 text-right font-medium">{formatRupiah(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {monthly && (
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm flex justify-between">
            <span className="font-medium">Saldo bulan {monthly.label}</span>
            <span className={`font-bold ${monthly.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatRupiah(monthly.balance)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
