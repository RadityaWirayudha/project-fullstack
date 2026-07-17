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
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengelolaan Pembayaran</h1>
          <p className="text-sm text-slate-500 mt-1">Catat iuran kebersihan dan satpam</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Catat Pembayaran
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-header">Tanggal Bayar</th>
              <th className="table-header">Rumah</th>
              <th className="table-header">Penghuni</th>
              <th className="table-header">Jenis Iuran</th>
              <th className="table-header">Periode</th>
              <th className="table-header text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Belum ada pembayaran</td></tr>
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
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                  <td className="table-cell text-slate-600">{formatDate(p.payment_date)}</td>
                  <td className="table-cell font-medium text-slate-800">{p.house?.house_number}</td>
                  <td className="table-cell text-slate-600">{p.resident?.full_name}</td>
                  <td className="table-cell">
                    {types.map((t) => (
                      <span key={t} className="badge-slate capitalize mr-1">{t}</span>
                    ))}
                  </td>
                  <td className="table-cell text-slate-600">{periodLabel}</td>
                  <td className="table-cell text-right font-semibold text-emerald-600">{formatRupiah(p.total_amount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Catat Pembayaran Iuran" onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rumah</label>
            <select
              value={form.house_id}
              onChange={(e) => setForm({ ...form, house_id: e.target.value })}
              required
              className="input-select"
            >
              <option value="">-- Pilih rumah --</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.house_number} {h.current_occupancy ? `— ${h.current_occupancy.resident.full_name}` : '(kosong)'}
                </option>
              ))}
            </select>
            {selectedHouse && !activeResident && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                Rumah ini tidak memiliki penghuni aktif.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Iuran</label>
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
                className="input-select"
              >
                <option value="kebersihan">Kebersihan (Rp15.000/bln)</option>
                <option value="satpam">Satpam (Rp100.000/bln)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mode Pembayaran</label>
              <select
                value={form.payment_mode}
                onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
                className="input-select"
              >
                <option value="bulanan">Bulanan</option>
                {form.fee_type === 'kebersihan' && <option value="tahunan">Tahunan (12 bulan)</option>}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {form.payment_mode === 'tahunan' ? 'Bulan Mulai' : 'Bulan Periode'}
              </label>
              <select
                value={form.period_month}
                onChange={(e) => setForm({ ...form, period_month: Number(e.target.value) })}
                className="input-select"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun</label>
              <input
                type="number"
                value={form.period_year}
                onChange={(e) => setForm({ ...form, period_year: Number(e.target.value) })}
                min={2000}
                max={2100}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Bayar</label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Catatan (opsional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field"
              placeholder="Tambahkan catatan..."
            />
          </div>
          <div className="rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-600">Total ({monthCount} bulan)</span>
            <span className="text-base font-bold text-primary-700">{formatRupiah(totalAmount)}</span>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
