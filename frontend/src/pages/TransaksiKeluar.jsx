import { useState, useRef } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiSearch, FiCheck, FiPrinter, FiClock, FiDollarSign, FiTruck } from 'react-icons/fi'
import Barcode from 'react-barcode'

export default function TransaksiKeluar() {
  const [barcode, setBarcode] = useState('')
  const [transaksi, setTransaksi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const printRef = useRef()
  const barcodeRef = useRef()

  const handleScan = async (e) => {
    e.preventDefault()
    if (!barcode.trim()) return
    setLoading(true)
    setTransaksi(null)
    setResult(null)
    try {
      const res = await api.post('/transaksi/scan-barcode', { barcode: barcode.trim() })
      if (res.data.data.status === 'keluar') {
        toast.error('Transaksi ini sudah selesai!')
        return
      }
      setTransaksi(res.data.data)
      toast.success('Kendaraan ditemukan!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Barcode tidak ditemukan')
    } finally {
      setLoading(false)
    }
  }

  const handleKeluar = async () => {
    if (!transaksi) return
    setProcessing(true)
    try {
      const res = await api.post(`/transaksi/${transaksi.id_parkir}/keluar`)
      setResult(res.data.data)
      setTransaksi(null)
      toast.success('Kendaraan berhasil keluar!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses keluar')
    } finally {
      setProcessing(false)
    }
  }

  const handlePrint = () => {
    const barcodeEl = barcodeRef.current
    const barcodeSvg = barcodeEl ? barcodeEl.querySelector('svg') : null
    const barcodeHtml = barcodeSvg ? barcodeSvg.outerHTML : ''
    const printContent = printRef.current
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
          ${printContent.innerHTML.replace('<div id="barcode-placeholder"></div>', '<div class="barcode-container">' + barcodeHtml + '</div>')}
          <script>window.print();window.close();<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
  const formatDate = (d) => d ? new Date(d).toLocaleString('id-ID') : '-'

  const calcDuration = () => {
    if (!transaksi) return { jam: 0, menit: 0 }
    const masuk = new Date(transaksi.waktu_masuk)
    const now = new Date()
    const diff = Math.floor((now - masuk) / 60000)
    return { jam: Math.floor(diff / 60), menit: diff % 60 }
  }

  const calcEstBiaya = () => {
    if (!transaksi) return 0
    const masuk = new Date(transaksi.waktu_masuk)
    const now = new Date()
    const diffJam = Math.ceil((now - masuk) / 3600000)
    const tarif = transaksi.tarif_parkir
    return diffJam * (tarif?.tarif_per_jam || 0)
  }

  const duration = calcDuration()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600 mb-1">Transaksi</p>
        <h1 className="page-title">Kendaraan Keluar</h1>
        <p className="page-subtitle">Scan kartu parkir atau masukkan kode barcode</p>
      </div>

      {/* Scan Form */}
      <div className="card">
        <form onSubmit={handleScan} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan barcode atau masukkan ID parkir..."
              className="input-field pl-11 text-lg"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : 'Cari'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        {transaksi && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiTruck className="text-blue-600" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Detail Kendaraan</h3>
                <p className="text-xs text-gray-400">Informasi kendaraan yang akan keluar</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">ID Parkir</span>
                <span className="text-sm font-bold font-mono">PKR-{transaksi.id_parkir}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Plat Nomor</span>
                <span className="text-sm font-bold text-blue-700">{transaksi.kendaraan?.plat_nomor}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Jenis</span>
                <span className="text-sm">{transaksi.kendaraan?.jenis_kendaraan}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Area</span>
                <span className="text-sm">{transaksi.area_parkir?.nama_area}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Waktu Masuk</span>
                <span className="text-sm">{formatDate(transaksi.waktu_masuk)}</span>
              </div>
              <div className="flex justify-between p-3.5 bg-blue-50 rounded-xl">
                <span className="text-sm text-blue-600 flex items-center gap-1.5"><FiClock size={14} /> Durasi</span>
                <span className="text-sm font-bold text-blue-700">{duration.jam} jam {duration.menit} menit</span>
              </div>
              <div className="flex justify-between p-3.5 bg-emerald-50 rounded-xl">
                <span className="text-sm text-emerald-600 flex items-center gap-1.5"><FiDollarSign size={14} /> Estimasi Biaya</span>
                <span className="text-sm font-bold text-emerald-700 text-lg">{formatRupiah(calcEstBiaya())}</span>
              </div>

              <button
                onClick={handleKeluar}
                disabled={processing}
                className="w-full btn-success justify-center py-3 text-base mt-2"
              >
                {processing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <><FiCheck size={18} /> Proses Keluar & Bayar</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Receipt Result */}
        {result && (
          <div>
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-xl shadow-emerald-600/20">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                  <FiCheck size={24} />
                </div>
                <h3 className="text-xl font-bold">STRUK PARKIR</h3>
                <p className="text-emerald-200 text-sm">Pembayaran Berhasil</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2 text-sm border border-white/10">
                <div className="flex justify-between"><span className="text-emerald-200">Kode</span><span className="font-bold">PKR-{result.id_parkir}</span></div>
                <div className="flex justify-between"><span className="text-emerald-200">Plat Nomor</span><span className="font-bold">{result.kendaraan?.plat_nomor}</span></div>
                <div className="flex justify-between"><span className="text-emerald-200">Jenis</span><span>{result.kendaraan?.jenis_kendaraan}</span></div>
                <div className="flex justify-between"><span className="text-emerald-200">Area</span><span>{result.area_parkir?.nama_area}</span></div>
                <div className="flex justify-between"><span className="text-emerald-200">Masuk</span><span>{formatDate(result.waktu_masuk)}</span></div>
                <div className="flex justify-between"><span className="text-emerald-200">Keluar</span><span>{formatDate(result.waktu_keluar)}</span></div>
                <div className="flex justify-between"><span className="text-emerald-200">Durasi</span><span>{result.durasi_jam} jam</span></div>
                <div className="flex justify-between"><span className="text-emerald-200">Petugas</span><span>{result.user?.nama_lengkap}</span></div>
              </div>

              <div className="flex justify-center bg-white rounded-xl p-3 mt-4" ref={barcodeRef}>
                <Barcode value={String(result.id_parkir)} width={1.5} height={50} fontSize={12} margin={5} displayValue={true} />
              </div>

              <div className="text-center mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                <p className="text-emerald-200 text-xs uppercase tracking-wider">Total Biaya</p>
                <p className="text-3xl font-bold mt-1">{formatRupiah(result.biaya_total)}</p>
              </div>

              <button onClick={handlePrint} className="w-full mt-5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20">
                <FiPrinter size={18} /> Cetak Struk
              </button>
            </div>

            {/* Hidden print content */}
            <div ref={printRef} style={{ display: 'none' }}>
              <div className="center"><h2>SMARTPARK</h2><p>Sistem Parkir Modern</p></div>
              <div className="line"></div>
              <div className="center bold">STRUK PEMBAYARAN PARKIR</div>
              <div className="line"></div>
              <div id="barcode-placeholder"></div>
              <div className="line"></div>
              <div className="row"><span>Kode</span><span>PKR-{result.id_parkir}</span></div>
              <div className="row"><span>Plat</span><span>{result.kendaraan?.plat_nomor}</span></div>
              <div className="row"><span>Jenis</span><span>{result.kendaraan?.jenis_kendaraan}</span></div>
              <div className="row"><span>Area</span><span>{result.area_parkir?.nama_area}</span></div>
              <div className="row"><span>Masuk</span><span>{formatDate(result.waktu_masuk)}</span></div>
              <div className="row"><span>Keluar</span><span>{formatDate(result.waktu_keluar)}</span></div>
              <div className="row"><span>Durasi</span><span>{result.durasi_jam} jam</span></div>
              <div className="row"><span>Petugas</span><span>{result.user?.nama_lengkap}</span></div>
              <div className="line"></div>
              <div className="total">{formatRupiah(result.biaya_total)}</div>
              <div className="line"></div>
              <div className="center"><p>Terima kasih telah menggunakan</p><p>layanan SmartPark</p></div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!transaksi && !result && (
          <div className="card flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <FiSearch className="text-emerald-400" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Scan Barcode</h3>
            <p className="text-sm text-gray-400 max-w-[240px]">Scan atau masukkan ID parkir untuk memproses kendaraan keluar</p>
          </div>
        )}
      </div>
    </div>
  )
}
