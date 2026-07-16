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

  if (!data) return <p className="text-slate-400">Memuat...</p>

  const { house, payment_history } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/houses" className="text-sm text-blue-600 hover:underline">&larr; Kembali ke daftar rumah</Link>
          <h1 className="text-2xl font-bold mt-1">Rumah {house.house_number}</h1>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            house.status === 'dihuni' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {house.status === 'dihuni' ? 'Dihuni' : 'Tidak Dihuni'}
        </span>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Penghuni Saat Ini</h2>
          {house.current_occupancy ? (
            <button
              onClick={() => { setError(''); setCheckoutOpen(true) }}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition"
            >
              Keluarkan Penghuni
            </button>
          ) : (
            <button
              onClick={() => { setError(''); setAssignOpen(true) }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              + Tambah Penghuni
            </button>
          )}
        </div>
        {house.current_occupancy ? (
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">{house.current_occupancy.resident.full_name}</p>
              <p className="text-sm text-slate-500">
                Menghuni sejak {formatDate(house.current_occupancy.start_date)} &middot;{' '}
                {house.current_occupancy.resident.phone_number}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Rumah ini sedang tidak dihuni.</p>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="font-semibold mb-4">Histori Penghuni</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr>
              <th className="py-2">Nama Penghuni</th>
              <th className="py-2">Mulai Menghuni</th>
              <th className="py-2">Selesai</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {house.house_residents.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-slate-400">Belum ada histori penghuni</td></tr>
            )}
            {house.house_residents.map((hr) => (
              <tr key={hr.id} className="border-b border-slate-100">
                <td className="py-2 font-medium">{hr.resident?.full_name}</td>
                <td className="py-2">{formatDate(hr.start_date)}</td>
                <td className="py-2">{hr.end_date ? formatDate(hr.end_date) : '-'}</td>
                <td className="py-2">
                  {hr.end_date ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">Sudah pindah</span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">Aktif</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Histori Pembayaran &mdash; {payment_history.year}</h2>
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
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr>
              <th className="py-2">Bulan</th>
              <th className="py-2">Iuran Kebersihan (Rp15.000)</th>
              <th className="py-2">Iuran Satpam (Rp100.000)</th>
            </tr>
          </thead>
          <tbody>
            {payment_history.months.map((m) => (
              <tr key={m.month} className="border-b border-slate-100">
                <td className="py-2 font-medium">{m.label}</td>
                <td className="py-2">
                  <PaidBadge paid={m.kebersihan} />
                </td>
                <td className="py-2">
                  <PaidBadge paid={m.satpam} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={assignOpen} title="Tambah Penghuni Rumah" onClose={() => setAssignOpen(false)}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pilih Penghuni</label>
            <select
              value={assignForm.resident_id}
              onChange={(e) => setAssignForm({ ...assignForm, resident_id: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Pilih penghuni --</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>{r.full_name} ({r.resident_status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Mulai Menghuni</label>
            <input
              type="date"
              value={assignForm.start_date}
              onChange={(e) => setAssignForm({ ...assignForm, start_date: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      <Modal open={checkoutOpen} title="Keluarkan Penghuni" onClose={() => setCheckoutOpen(false)}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleCheckout} className="space-y-4">
          <p className="text-sm text-slate-600">
            Penghuni <strong>{house.current_occupancy?.resident?.full_name}</strong> akan dikeluarkan dari rumah{' '}
            <strong>{house.house_number}</strong> dan tercatat dalam histori.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Selesai Menghuni</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
          >
            {saving ? 'Memproses...' : 'Keluarkan'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function PaidBadge({ paid }) {
  return paid ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Lunas</span>
  ) : (
    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">Belum</span>
  )
}
