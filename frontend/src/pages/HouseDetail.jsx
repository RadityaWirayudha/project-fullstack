import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../lib/api'
import Modal from '../components/Modal'
import { formatDate } from '../lib/format'

const currentYear = new Date().getFullYear()

export default function HouseDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [year, setYear] = useState(currentYear)
  const [residents, setResidents] = useState([])
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignForm, setAssignForm] = useState({ resident_id: '', start_date: '' })
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api.get(`/houses/${id}`, { params: { year } }).then(({ data }) => setData(data))
  }, [id, year])

  useEffect(load, [load])

  useEffect(() => {
    api.get('/residents').then(({ data }) => setResidents(data))
  }, [])

  async function handleAssign(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post(`/houses/${id}/assign-resident`, assignForm)
      setAssignOpen(false)
      setAssignForm({ resident_id: '', start_date: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan penghuni.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCheckout(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post(`/houses/${id}/checkout-resident`, { end_date: endDate })
      setCheckoutOpen(false)
      setEndDate('')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengeluarkan penghuni.')
    } finally {
      setSaving(false)
    }
  }

  if (!data) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-400">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Memuat...
      </div>
    </div>
  )

  const { house, payment_history } = data

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/houses" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali ke daftar rumah
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Rumah {house.house_number}</h1>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            house.status === 'dihuni' ? 'badge-green' : 'badge-slate'
          }`}
        >
          {house.status === 'dihuni' ? 'Dihuni' : 'Tidak Dihuni'}
        </span>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary-500" />
            <h2 className="font-semibold text-slate-800">Penghuni Saat Ini</h2>
          </div>
          {house.current_occupancy ? (
            <button
              onClick={() => { setError(''); setCheckoutOpen(true) }}
              className="btn-danger"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              Keluarkan Penghuni
            </button>
          ) : (
            <button
              onClick={() => { setError(''); setAssignOpen(true) }}
              className="btn-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Penghuni
            </button>
          )}
        </div>
        {house.current_occupancy ? (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-lg">
              {house.current_occupancy.resident.full_name[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{house.current_occupancy.resident.full_name}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Menghuni sejak {formatDate(house.current_occupancy.start_date)} &middot;{' '}
                {house.current_occupancy.resident.phone_number}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <svg className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Rumah ini sedang tidak dihuni.
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-slate-400" />
          <h2 className="font-semibold text-slate-800">Histori Penghuni</h2>
        </div>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nama Penghuni</th>
                <th className="px-4 py-3">Mulai Menghuni</th>
                <th className="px-4 py-3">Selesai</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {house.house_residents.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada histori penghuni</td></tr>
              )}
              {house.house_residents.map((hr) => (
                <tr key={hr.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{hr.resident?.full_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(hr.start_date)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{hr.end_date ? formatDate(hr.end_date) : '-'}</td>
                  <td className="px-4 py-2.5">
                    {hr.end_date ? (
                      <span className="badge-slate">Sudah pindah</span>
                    ) : (
                      <span className="badge-green">Aktif</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <h2 className="font-semibold text-slate-800">Histori Pembayaran</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Tahun {payment_history.year}</p>
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
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Bulan</th>
                <th className="px-4 py-3">Iuran Kebersihan (Rp15.000)</th>
                <th className="px-4 py-3">Iuran Satpam (Rp100.000)</th>
              </tr>
            </thead>
            <tbody>
              {payment_history.months.map((m) => (
                <tr key={m.month} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{m.label}</td>
                  <td className="px-4 py-2.5">
                    <PaidBadge paid={m.kebersihan} />
                  </td>
                  <td className="px-4 py-2.5">
                    <PaidBadge paid={m.satpam} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={assignOpen} title="Tambah Penghuni Rumah" onClose={() => setAssignOpen(false)}>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Penghuni</label>
            <select
              value={assignForm.resident_id}
              onChange={(e) => setAssignForm({ ...assignForm, resident_id: e.target.value })}
              required
              className="input-select"
            >
              <option value="">-- Pilih penghuni --</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name} ({r.resident_status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Mulai Menghuni</label>
            <input
              type="date"
              value={assignForm.start_date}
              onChange={(e) => setAssignForm({ ...assignForm, start_date: e.target.value })}
              required
              className="input-field"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      <Modal open={checkoutOpen} title="Keluarkan Penghuni" onClose={() => setCheckoutOpen(false)}>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <p>
              Penghuni <strong>{house.current_occupancy?.resident?.full_name}</strong> akan dikeluarkan dari rumah{' '}
              <strong>{house.house_number}</strong> dan tercatat dalam histori.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Selesai Menghuni</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-danger w-full">
            {saving ? 'Memproses...' : 'Keluarkan'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function PaidBadge({ paid }) {
  return paid ? (
    <span className="badge-green">
      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      Lunas
    </span>
  ) : (
    <span className="badge-red">Belum</span>
  )
}
