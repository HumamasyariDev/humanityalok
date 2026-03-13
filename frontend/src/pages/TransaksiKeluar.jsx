import { useState, useRef } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiSearch, FiCheck, FiPrinter, FiClock, FiDollarSign } from 'react-icons/fi'
import Barcode from 'react-barcode'

export default function TransaksiKeluar() {
  const [barcode, setBarcode] = useState('')
  const [transaksi, setTransaksi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [metode, setMetode] = useState('tunai')
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
      if (res.data.data.status === 'selesai') {
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
      const res = await api.post(`/transaksi/${transaksi.id}/keluar`, {
        metode_pembayaran: metode,
      })
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
    return tarif?.tarif_flat || (diffJam * (tarif?.tarif_per_jam || 0))
  }

  const duration = calcDuration()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kendaraan Keluar</h1>
        <p className="text-gray-500 mt-1">Scan kartu parkir atau masukkan barcode</p>
      </div>

      {/* Scan Form */}
      <div className="card">
        <form onSubmit={handleScan} className="flex gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan barcode atau masukkan kode barcode..."
              className="input-field pl-11 text-lg"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Cari'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        {transaksi && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Detail Kendaraan</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Kode Transaksi</span>
                <span className="font-bold">{transaksi.kode_transaksi}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Plat Nomor</span>
                <span className="font-bold text-blue-700 text-lg">{transaksi.kendaraan?.plat_nomor}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Jenis</span>
                <span>{transaksi.kendaraan?.jenis_kendaraan}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Area</span>
                <span>{transaksi.area_parkir?.nama_area}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Waktu Masuk</span>
                <span>{formatDate(transaksi.waktu_masuk)}</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 flex items-center gap-1"><FiClock size={16} /> Durasi</span>
                <span className="font-bold text-blue-700">{duration.jam} jam {duration.menit} menit</span>
              </div>
              <div className="flex justify-between p-3 bg-emerald-50 rounded-lg">
                <span className="text-emerald-600 flex items-center gap-1"><FiDollarSign size={16} /> Estimasi Biaya</span>
                <span className="font-bold text-emerald-700 text-lg">{formatRupiah(calcEstBiaya())}</span>
              </div>

              {/* Payment Method */}
              <div className="pt-2">
                <label className="label-field">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {['tunai', 'kartu', 'e-wallet'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetode(m)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                        metode === m
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {m === 'e-wallet' ? 'E-Wallet' : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleKeluar}
                disabled={processing}
                className="w-full btn-success justify-center py-3 text-base mt-2"
              >
                {processing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
            <div className="card bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FiCheck size={24} />
                </div>
                <h3 className="text-xl font-bold">STRUK PARKIR</h3>
                <p className="text-emerald-200 text-sm">Pembayaran Berhasil</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Kode</span>
                  <span className="font-bold">{result.kode_transaksi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Plat Nomor</span>
                  <span className="font-bold">{result.kendaraan?.plat_nomor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Jenis</span>
                  <span>{result.kendaraan?.jenis_kendaraan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Area</span>
                  <span>{result.area_parkir?.nama_area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Masuk</span>
                  <span>{formatDate(result.waktu_masuk)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Keluar</span>
                  <span>{formatDate(result.waktu_keluar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Durasi</span>
                  <span>{Math.floor((result.durasi_menit || 0) / 60)} jam {(result.durasi_menit || 0) % 60} menit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Pembayaran</span>
                  <span className="capitalize">{result.metode_pembayaran}</span>
                </div>
              </div>

              <div className="flex justify-center bg-white rounded-lg p-3 mt-3" ref={barcodeRef}>
                <Barcode
                  value={result.barcode || result.kode_transaksi}
                  width={1.5}
                  height={50}
                  fontSize={12}
                  margin={5}
                  displayValue={true}
                />
              </div>

              <div className="text-center mt-4 p-4 bg-white/10 rounded-xl">
                <p className="text-emerald-200 text-xs">TOTAL BIAYA</p>
                <p className="text-3xl font-bold">{formatRupiah(result.total_biaya)}</p>
              </div>

              <button onClick={handlePrint} className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <FiPrinter size={18} /> Cetak Struk
              </button>
            </div>

            {/* Hidden print content */}
            <div ref={printRef} style={{ display: 'none' }}>
              <div className="center">
                <h2>SMARTPARK</h2>
                <p>Sistem Parkir Modern</p>
              </div>
              <div className="line"></div>
              <div className="center bold">STRUK PEMBAYARAN PARKIR</div>
              <div className="line"></div>
              <div id="barcode-placeholder"></div>
              <div className="line"></div>
              <div className="row"><span>Kode</span><span>{result.kode_transaksi}</span></div>
              <div className="row"><span>Plat</span><span>{result.kendaraan?.plat_nomor}</span></div>
              <div className="row"><span>Jenis</span><span>{result.kendaraan?.jenis_kendaraan}</span></div>
              <div className="row"><span>Area</span><span>{result.area_parkir?.nama_area}</span></div>
              <div className="row"><span>Masuk</span><span>{formatDate(result.waktu_masuk)}</span></div>
              <div className="row"><span>Keluar</span><span>{formatDate(result.waktu_keluar)}</span></div>
              <div className="row"><span>Durasi</span><span>{Math.floor((result.durasi_menit || 0) / 60)}j {(result.durasi_menit || 0) % 60}m</span></div>
              <div className="row"><span>Bayar</span><span style={{textTransform:'capitalize'}}>{result.metode_pembayaran}</span></div>
              <div className="line"></div>
              <div className="total">{formatRupiah(result.total_biaya)}</div>
              <div className="line"></div>
              <div className="center">
                <p>Terima kasih telah menggunakan</p>
                <p>layanan SmartPark</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
