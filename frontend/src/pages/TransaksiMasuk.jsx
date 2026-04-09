import { useState, useEffect, useRef } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { FiTruck, FiMapPin, FiCheck, FiPrinter } from 'react-icons/fi'
import Barcode from 'react-barcode'

export default function TransaksiMasuk() {
  const [areas, setAreas] = useState([])
  const [tarifs, setTarifs] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    plat_nomor: '', jenis_kendaraan: '', id_area: '', warna: ''
  })
  const printRef = useRef()
  const barcodeRef = useRef()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [areaRes, tarifRes] = await Promise.all([
        api.get('/area-parkir-all'),
        api.get('/tarif-parkir-all'),
      ])
      setAreas(areaRes.data.data)
      setTarifs(tarifRes.data.data)
    } catch (err) {
      toast.error('Gagal memuat data')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/transaksi/masuk', {
        ...form,
        plat_nomor: form.plat_nomor.toUpperCase(),
      })
      setResult(res.data.data)
      toast.success('Kendaraan berhasil masuk parkir!')
      setForm({ plat_nomor: '', jenis_kendaraan: '', id_area: '', warna: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses kendaraan masuk')
    } finally {
      setLoading(false)
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
          <title>Kartu Parkir</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px; }
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

  const formatDate = (d) => new Date(d).toLocaleString('id-ID')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-blue-600 mb-1">Transaksi</p>
        <h1 className="page-title">Kendaraan Masuk</h1>
        <p className="page-subtitle">Catat kendaraan yang masuk area parkir</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiTruck className="text-blue-600" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Data Kendaraan</h3>
              <p className="text-xs text-gray-400">Isi data kendaraan yang masuk</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Plat Nomor *</label>
              <input
                type="text"
                value={form.plat_nomor}
                onChange={(e) => setForm({...form, plat_nomor: e.target.value.toUpperCase()})}
                className="input-field text-lg font-bold tracking-wider"
                placeholder="B 1234 ABC"
                required
              />
            </div>
            <div>
              <label className="label-field">Jenis Kendaraan *</label>
              <div className="grid grid-cols-2 gap-2">
                {tarifs.map((t) => (
                  <button
                    key={t.id_tarif}
                    type="button"
                    onClick={() => setForm({...form, jenis_kendaraan: t.jenis_kendaraan})}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.jenis_kendaraan === t.jenis_kendaraan
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {t.jenis_kendaraan}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-field">Area Parkir *</label>
              <select
                value={form.id_area}
                onChange={(e) => setForm({...form, id_area: e.target.value})}
                className="input-field"
                required
              >
                <option value="">Pilih Area</option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area} disabled={a.terisi >= a.kapasitas}>
                    {a.nama_area} (Sisa: {a.kapasitas - a.terisi}/{a.kapasitas})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Warna</label>
                <input type="text" value={form.warna} onChange={(e) => setForm({...form, warna: e.target.value})} className="input-field" placeholder="Hitam" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-success justify-center py-3 text-base">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <><FiCheck size={18} /> Proses Masuk</>
              )}
            </button>
          </form>
        </div>

        {/* Parking Card Result */}
        {result && (
          <div>
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                  <span className="text-2xl font-bold">P</span>
                </div>
                <h3 className="text-xl font-bold">KARTU PARKIR</h3>
                <p className="text-blue-200 text-sm">SmartPark System</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-white/10">
                <div className="text-center">
                  <p className="text-blue-200 text-xs uppercase tracking-wider">Kode Parkir</p>
                  <p className="text-lg font-bold tracking-wider">PKR-{String(result.id_parkir).padStart(6, '0')}</p>
                </div>
                <div className="flex justify-center bg-white rounded-xl p-3" ref={barcodeRef}>
                  <Barcode value={`PKR-${String(result.id_parkir).padStart(6, '0')}`} width={1.5} height={50} fontSize={12} margin={5} displayValue={true} />
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-blue-200">Plat Nomor</span><span className="font-bold">{result.kendaraan?.plat_nomor}</span></div>
                <div className="flex justify-between"><span className="text-blue-200">Jenis</span><span>{result.kendaraan?.jenis_kendaraan}</span></div>
                <div className="flex justify-between"><span className="text-blue-200">Area</span><span>{result.area_parkir?.nama_area}</span></div>
                <div className="flex justify-between"><span className="text-blue-200">Waktu Masuk</span><span>{formatDate(result.waktu_masuk)}</span></div>
                <div className="flex justify-between"><span className="text-blue-200">Petugas</span><span>{result.user?.nama_lengkap || result.user?.name}</span></div>
              </div>

              <button onClick={handlePrint} className="w-full mt-5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20">
                <FiPrinter size={18} /> Cetak Kartu Parkir
              </button>
            </div>

            {/* Hidden print content */}
            <div ref={printRef} style={{ display: 'none' }}>
              <div className="center"><h2>SMARTPARK</h2><p>Sistem Parkir Modern</p></div>
              <div className="line"></div>
              <div className="center bold">KARTU PARKIR MASUK</div>
              <div className="line"></div>
              <div id="barcode-placeholder"></div>
              <div className="line"></div>
              <div className="row"><span>Kode</span><span>PKR-{String(result.id_parkir).padStart(6, '0')}</span></div>
              <div className="row"><span>Plat</span><span>{result.kendaraan?.plat_nomor}</span></div>
              <div className="row"><span>Jenis</span><span>{result.kendaraan?.jenis_kendaraan}</span></div>
              <div className="row"><span>Area</span><span>{result.area_parkir?.nama_area}</span></div>
              <div className="row"><span>Masuk</span><span>{formatDate(result.waktu_masuk)}</span></div>
              <div className="row"><span>Petugas</span><span>{result.user?.nama_lengkap || result.user?.name}</span></div>
              <div className="line"></div>
              <div className="center"><p>Simpan kartu ini dengan baik</p><p>Kartu hilang dikenakan denda</p></div>
            </div>
          </div>
        )}

        {/* Empty state when no result */}
        {!result && (
          <div className="card flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <FiMapPin className="text-blue-400" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Kartu Parkir</h3>
            <p className="text-sm text-gray-400 max-w-[240px]">Kartu parkir akan tampil di sini setelah proses kendaraan masuk</p>
          </div>
        )}
      </div>
    </div>
  )
}
