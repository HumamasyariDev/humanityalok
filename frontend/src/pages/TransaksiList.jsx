import React, { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiSearch, FiEye, FiClock, FiPrinter, FiX, FiList } from 'react-icons/fi'
import Barcode from 'react-barcode'

export default function TransaksiList() {
  const [transaksis, setTransaksis] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [pagination, setPagination] = useState({})
  const [showStruk, setShowStruk] = useState(null)
  const [strukId, setStrukId] = useState(null)
  const barcodeRef = React.useRef()

  useEffect(() => { fetchTransaksis() }, [status])

  const fetchTransaksis = async (page = 1) => {
    try {
      const params = { page, per_page: 10 }
      if (search) params.search = search
      if (status) params.status = status
      const res = await api.get('/transaksi', { params })
      setTransaksis(res.data.data.data)
      setPagination(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat data transaksi')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTransaksis()
  }

  const viewStruk = async (id_parkir) => {
    try {
      const res = await api.get(`/transaksi/${id_parkir}/struk`)
      setShowStruk(res.data.data)
      setStrukId(id_parkir)
    } catch (err) {
      toast.error('Gagal memuat struk')
    }
  }

  const printStruk = () => {
    if (!showStruk) return
    const barcodeEl = barcodeRef.current
    const barcodeSvg = barcodeEl ? barcodeEl.querySelector('svg') : null
    const barcodeHtml = barcodeSvg ? barcodeSvg.outerHTML : ''
    const durasiText = showStruk.durasi_jam ? `${showStruk.durasi_jam} jam` : '-'
    const win = window.open('', '', 'width=400,height=700')
    win.document.write(`
      <html>
        <head>
          <title>Struk Parkir</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px; }
            .total { font-size: 18px; font-weight: bold; text-align: center; margin: 10px 0; }
            .barcode-container { text-align: center; margin: 10px 0; }
            .barcode-container svg { max-width: 100%; height: auto; }
            h2 { margin: 5px 0; }
            p { margin: 3px 0; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="center"><h2>SMARTPARK</h2><p>Sistem Parkir Modern</p></div>
          <div class="line"></div>
          <div class="center bold">STRUK PARKIR</div>
          <div class="line"></div>
          <div class="barcode-container">${barcodeHtml}</div>
          <div class="line"></div>
          <div class="row"><span>Kode</span><span>PKR-${strukId}</span></div>
          <div class="row"><span>Plat</span><span>${showStruk.plat_nomor}</span></div>
          <div class="row"><span>Jenis</span><span>${showStruk.jenis_kendaraan}</span></div>
          <div class="row"><span>Area</span><span>${showStruk.area_parkir}</span></div>
          <div class="row"><span>Masuk</span><span>${showStruk.waktu_masuk ? new Date(showStruk.waktu_masuk).toLocaleString('id-ID') : '-'}</span></div>
          <div class="row"><span>Keluar</span><span>${showStruk.waktu_keluar ? new Date(showStruk.waktu_keluar).toLocaleString('id-ID') : '-'}</span></div>
          <div class="row"><span>Durasi</span><span>${durasiText}</span></div>
          <div class="row"><span>Petugas</span><span>${showStruk.petugas}</span></div>
          <div class="line"></div>
          ${showStruk.biaya_total ? `<div class="total">Rp ${Number(showStruk.biaya_total).toLocaleString('id-ID')}</div>` : '<div class="center bold">SEDANG PARKIR</div>'}
          <div class="line"></div>
          <div class="center"><p>Terima kasih</p></div>
          <script>window.print();window.close();<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
  const formatDate = (d) => d ? new Date(d).toLocaleString('id-ID') : '-'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-400 mt-4">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600 mb-1">Transaksi</p>
        <h1 className="page-title">Daftar Transaksi</h1>
        <p className="page-subtitle">Riwayat semua transaksi parkir</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-3 flex-1">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari plat nomor..." className="input-field pl-11" />
            </div>
            <button type="submit" className="btn-primary">Cari</button>
          </form>
          <div className="flex gap-1.5">
            {[
              { value: '', label: 'Semua' },
              { value: 'masuk', label: 'Parkir' },
              { value: 'keluar', label: 'Selesai' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  status === s.value
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3.5">Kode</th>
                <th className="px-6 py-3.5">Plat Nomor</th>
                <th className="px-6 py-3.5">Jenis</th>
                <th className="px-6 py-3.5">Area</th>
                <th className="px-6 py-3.5">Masuk</th>
                <th className="px-6 py-3.5">Keluar</th>
                <th className="px-6 py-3.5">Biaya</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transaksis.map((t) => (
                <tr key={t.id_parkir} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">PKR-{t.id_parkir}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.kendaraan?.plat_nomor}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.kendaraan?.jenis_kendaraan}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.area_parkir?.nama_area}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{formatDate(t.waktu_masuk)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{formatDate(t.waktu_keluar)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{t.biaya_total ? formatRupiah(t.biaya_total) : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      t.status === 'masuk' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {t.status === 'masuk' ? 'Parkir' : 'Selesai'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => viewStruk(t.id_parkir)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Lihat Struk">
                      <FiEye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {transaksis.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                    <FiList className="mx-auto mb-2" size={28} />
                    <p className="text-sm">Tidak ada data transaksi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
            <div className="flex gap-1.5">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => fetchTransaksis(page)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === pagination.current_page ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{page}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Struk Modal */}
      {showStruk && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Detail Struk</h3>
              <button onClick={() => { setShowStruk(null); setStrukId(null) }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <FiX size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center bg-gray-50 rounded-xl p-3" ref={barcodeRef}>
                <Barcode value={`PKR-${String(strukId).padStart(6, '0')}`} width={1.5} height={45} fontSize={11} margin={5} displayValue={true} />
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Kode</span><span className="font-mono font-bold">PKR-{strukId}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Plat Nomor</span><span className="font-bold">{showStruk.plat_nomor}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Jenis</span><span>{showStruk.jenis_kendaraan}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Warna</span><span>{showStruk.warna}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Area</span><span>{showStruk.area_parkir}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Tarif</span><span>{formatRupiah(showStruk.tarif_per_jam)}/jam</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Masuk</span><span>{formatDate(showStruk.waktu_masuk)}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Keluar</span><span>{formatDate(showStruk.waktu_keluar)}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Durasi</span><span>{showStruk.durasi_jam ? `${showStruk.durasi_jam} jam` : '-'}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-xl text-sm"><span className="text-gray-500">Petugas</span><span>{showStruk.petugas}</span></div>
              {showStruk.biaya_total ? (
                <div className="flex justify-between p-3.5 bg-emerald-50 rounded-xl">
                  <span className="text-emerald-600 font-semibold text-sm">Total Biaya</span>
                  <span className="font-bold text-emerald-700 text-lg">{formatRupiah(showStruk.biaya_total)}</span>
                </div>
              ) : (
                <div className="p-3.5 bg-blue-50 rounded-xl text-center text-blue-700 font-semibold text-sm">Kendaraan Masih Parkir</div>
              )}
            </div>
            <button onClick={printStruk} className="w-full btn-primary justify-center mt-5">
              <FiPrinter size={16} /> Cetak Struk
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
