import React, { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiSearch, FiEye, FiClock, FiPrinter, FiX } from 'react-icons/fi'
import Barcode from 'react-barcode'

export default function TransaksiList() {
  const [transaksis, setTransaksis] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [pagination, setPagination] = useState({})
  const [showStruk, setShowStruk] = useState(null)
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

  const viewStruk = async (id) => {
    try {
      const res = await api.get(`/transaksi/${id}/struk`)
      setShowStruk(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat struk')
    }
  }

  const printStruk = () => {
    if (!showStruk) return
    const barcodeEl = barcodeRef.current
    const barcodeSvg = barcodeEl ? barcodeEl.querySelector('svg') : null
    const barcodeHtml = barcodeSvg ? barcodeSvg.outerHTML : ''
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
          <div class="row"><span>Kode</span><span>${showStruk.kode_transaksi}</span></div>
          <div class="row"><span>Plat</span><span>${showStruk.plat_nomor}</span></div>
          <div class="row"><span>Jenis</span><span>${showStruk.jenis_kendaraan}</span></div>
          <div class="row"><span>Area</span><span>${showStruk.area_parkir}</span></div>
          <div class="row"><span>Masuk</span><span>${showStruk.waktu_masuk ? new Date(showStruk.waktu_masuk).toLocaleString('id-ID') : '-'}</span></div>
          <div class="row"><span>Keluar</span><span>${showStruk.waktu_keluar ? new Date(showStruk.waktu_keluar).toLocaleString('id-ID') : '-'}</span></div>
          <div class="row"><span>Durasi</span><span>${showStruk.durasi_menit ? Math.floor(showStruk.durasi_menit/60) + 'j ' + (showStruk.durasi_menit%60) + 'm' : '-'}</span></div>
          <div class="row"><span>Petugas</span><span>${showStruk.petugas}</span></div>
          <div class="line"></div>
          ${showStruk.total_biaya ? `<div class="total">Rp ${Number(showStruk.total_biaya).toLocaleString('id-ID')}</div>` : '<div class="center bold">SEDANG PARKIR</div>'}
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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daftar Transaksi</h1>
        <p className="text-gray-500 mt-1">Riwayat semua transaksi parkir</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode transaksi atau plat nomor..." className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-primary">Cari</button>
        </form>
        <div className="flex gap-2">
          {['', 'parkir', 'selesai'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === '' ? 'Semua' : s === 'parkir' ? 'Sedang Parkir' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Plat Nomor</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Masuk</th>
                <th className="px-4 py-3">Keluar</th>
                <th className="px-4 py-3">Biaya</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transaksis.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono">{t.kode_transaksi}</td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-700">{t.kendaraan?.plat_nomor}</td>
                  <td className="px-4 py-3 text-sm">{t.kendaraan?.jenis_kendaraan}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.area_parkir?.nama_area}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatDate(t.waktu_masuk)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatDate(t.waktu_keluar)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{t.total_biaya ? formatRupiah(t.total_biaya) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === 'parkir' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {t.status === 'parkir' ? 'Parkir' : 'Selesai'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewStruk(t.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Lihat Struk">
                      <FiEye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {transaksis.length === 0 && (
                <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">Tidak ada data transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => fetchTransaksis(page)} className={`px-3 py-1 rounded-lg text-sm ${page === pagination.current_page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{page}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Struk Modal */}
      {showStruk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Detail Struk</h3>
              <button onClick={() => setShowStruk(null)} className="p-2 hover:bg-gray-100 rounded-lg"><FiX size={20} /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-center bg-gray-50 rounded-lg p-3" ref={barcodeRef}>
                <Barcode
                  value={showStruk.barcode || showStruk.kode_transaksi}
                  width={1.5}
                  height={45}
                  fontSize={11}
                  margin={5}
                  displayValue={true}
                />
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Kode</span><span className="font-mono font-bold">{showStruk.kode_transaksi}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Plat Nomor</span><span className="font-bold">{showStruk.plat_nomor}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Jenis</span><span>{showStruk.jenis_kendaraan}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Area</span><span>{showStruk.area_parkir}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Masuk</span><span>{formatDate(showStruk.waktu_masuk)}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Keluar</span><span>{formatDate(showStruk.waktu_keluar)}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Durasi</span><span>{showStruk.durasi_menit ? `${Math.floor(showStruk.durasi_menit/60)}j ${showStruk.durasi_menit%60}m` : '-'}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Pembayaran</span><span className="capitalize">{showStruk.metode_pembayaran || '-'}</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Petugas</span><span>{showStruk.petugas}</span></div>
              {showStruk.total_biaya && (
                <div className="flex justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-emerald-600 font-medium">Total Biaya</span>
                  <span className="font-bold text-emerald-700 text-lg">{formatRupiah(showStruk.total_biaya)}</span>
                </div>
              )}
              {!showStruk.total_biaya && (
                <div className="p-3 bg-blue-50 rounded-lg text-center text-blue-700 font-medium">Kendaraan Masih Parkir</div>
              )}
            </div>
            <button onClick={printStruk} className="w-full btn-primary justify-center mt-4">
              <FiPrinter size={16} /> Cetak Struk
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
