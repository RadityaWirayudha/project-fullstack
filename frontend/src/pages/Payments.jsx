import { useEffect, useState } from 'react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { formatRupiah, formatDate, MONTH_NAMES } from '../lib/format'

const FEE_AMOUNTS = { kebersihan: 15000, satpam: 100000 }
const today = new Date().toISOString().slice(0, 10)

const emptyForm = {
  house_id: '',
  fee_type: 'kebersihan',
  payment_mode: 'bulanan',
  period_month: new Date().getMonth() + 1,
  period_year: new Date().getFullYear(),
  payment_date: today,
  notes: '',
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [houses, setHouses] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/payments').then(({ data }) => setPayments(data))
  }

  useEffect(() => {
    load()
    api.get('/houses').then(({ data }) => setHouses(data))
  }, [])

  const selectedHouse = houses.find((h) => h.id === Number(form.house_id))
  const activeResident = selectedHouse?.current_occupancy?.resident
  const monthCount = form.payment_mode === 'tahunan' ? 12 : 1
  const totalAmount = FEE_AMOUNTS[form.fee_type] * monthCount

  function openCreate() {
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!activeResident) {
      setError('Rumah ini tidak memiliki penghuni aktif. Tambahkan penghuni terlebih dahulu.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/payments', {
        ...form,
        resident_id: activeResident.id,
      })
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan pembayaran.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengelolaan Pembayaran</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + Catat Pembayaran
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Tanggal Bayar</th>
              <th className="px-4 py-3">Rumah</th>
              <th className="px-4 py-3">Penghuni</th>
              <th className="px-4 py-3">Jenis Iuran</th>
              <th className="px-4 py-3">Periode</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Belum ada pembayaran</td></tr>
            )}
            {payments.map((p) => {
              const types = [...new Set(p.details.map((d) => d.fee_type))]
              const periods = p.details.map((d) => new Date(d.period))
              const first = periods.length ? new Date(Math.min(...periods)) : null
              const last = periods.length ? new Date(Math.max(...periods)) : null
              const periodLabel = first
                ? first.getTime() === last.getTime()
                  ? `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`
                  : `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()} – ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`
                : '-'
              return (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">{formatDate(p.payment_date)}</td>
                  <td className="px-4 py-3 font-medium">{p.house?.house_number}</td>
                  <td className="px-4 py-3">{p.resident?.full_name}</td>
                  <td className="px-4 py-3 capitalize">{types.join(', ')}</td>
                  <td className="px-4 py-3">{periodLabel}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatRupiah(p.total_amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Catat Pembayaran Iuran" onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rumah</label>
            <select
              value={form.house_id}
              onChange={(e) => setForm({ ...form, house_id: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">-- Pilih rumah --</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.house_number} {h.current_occupancy ? `— ${h.current_occupancy.resident.full_name}` : '(kosong)'}
                </option>
              ))}
            </select>
            {selectedHouse && !activeResident && (
              <p className="mt-1 text-xs text-rose-600">Rumah ini tidak memiliki penghuni aktif.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Iuran</label>
              <select
                value={form.fee_type}
                onChange={(e) => {
                  const fee_type = e.target.value
                  setForm({
                    ...form,
                    fee_type,
                    payment_mode: fee_type === 'satpam' ? 'bulanan' : form.payment_mode,
                  })
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="kebersihan">Kebersihan (Rp15.000/bln)</option>
                <option value="satpam">Satpam (Rp100.000/bln)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode Pembayaran</label>
              <select
                value={form.payment_mode}
                onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="bulanan">Bulanan</option>
                {form.fee_type === 'kebersihan' && <option value="tahunan">Tahunan (12 bulan)</option>}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {form.payment_mode === 'tahunan' ? 'Bulan Mulai' : 'Bulan Periode'}
              </label>
              <select
                value={form.period_month}
                onChange={(e) => setForm({ ...form, period_month: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tahun</label>
              <input
                type="number"
                value={form.period_year}
                onChange={(e) => setForm({ ...form, period_year: Number(e.target.value) })}
                min={2000}
                max={2100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Bayar</label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catatan (opsional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm flex justify-between">
            <span>Total ({monthCount} bulan)</span>
            <span className="font-bold">{formatRupiah(totalAmount)}</span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
