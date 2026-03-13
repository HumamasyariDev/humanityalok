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
    plat_nomor: '', jenis_kendaraan: '', area_parkir_id: '', merk: '', warna: ''
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
      setForm({ plat_nomor: '', jenis_kendaraan: '', area_parkir_id: '', merk: '', warna: '' })
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kendaraan Masuk</h1>
        <p className="text-gray-500 mt-1">Catat kendaraan masuk area parkir</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTruck className="text-blue-600" /> Data Kendaraan Masuk
          </h3>
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
                    key={t.id}
                    type="button"
                    onClick={() => setForm({...form, jenis_kendaraan: t.jenis_kendaraan})}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.jenis_kendaraan === t.jenis_kendaraan
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                value={form.area_parkir_id}
                onChange={(e) => setForm({...form, area_parkir_id: e.target.value})}
                className="input-field"
                required
              >
                <option value="">Pilih Area</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.terisi >= a.kapasitas}>
                    {a.kode_area} - {a.nama_area} (Sisa: {a.kapasitas - a.terisi}/{a.kapasitas})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Merk</label>
                <input type="text" value={form.merk} onChange={(e) => setForm({...form, merk: e.target.value})} className="input-field" placeholder="Honda" />
              </div>
              <div>
                <label className="label-field">Warna</label>
                <input type="text" value={form.warna} onChange={(e) => setForm({...form, warna: e.target.value})} className="input-field" placeholder="Hitam" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-success justify-center py-3 text-base">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <><FiCheck size={18} /> Proses Masuk</>
              )}
            </button>
          </form>
        </div>

        {/* Parking Card / Ticket Result */}
        {result && (
          <div>
            <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold">P</span>
                </div>
                <h3 className="text-xl font-bold">KARTU PARKIR</h3>
                <p className="text-blue-200 text-sm">SmartPark System</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 space-y-3">
                <div className="text-center">
                  <p className="text-blue-200 text-xs">KODE TRANSAKSI</p>
                  <p className="text-lg font-bold tracking-wider">{result.kode_transaksi}</p>
                </div>
                <div className="flex justify-center bg-white rounded-lg p-3 mt-2" ref={barcodeRef}>
                  <Barcode
                    value={result.barcode || result.kode_transaksi}
                    width={1.5}
                    height={50}
                    fontSize={12}
                    margin={5}
                    displayValue={true}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Plat Nomor</span>
                  <span className="font-bold">{result.kendaraan?.plat_nomor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Jenis</span>
                  <span>{result.kendaraan?.jenis_kendaraan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Area</span>
                  <span>{result.area_parkir?.nama_area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Waktu Masuk</span>
                  <span>{formatDate(result.waktu_masuk)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Petugas</span>
                  <span>{result.user?.name}</span>
                </div>
              </div>

              <button onClick={handlePrint} className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <FiPrinter size={18} /> Cetak Kartu Parkir
              </button>
            </div>

            {/* Hidden print content */}
            <div ref={printRef} style={{ display: 'none' }}>
              <div className="center">
                <h2>SMARTPARK</h2>
                <p>Sistem Parkir Modern</p>
              </div>
              <div className="line"></div>
              <div className="center bold">KARTU PARKIR MASUK</div>
              <div className="line"></div>
              <div id="barcode-placeholder"></div>
              <div className="line"></div>
              <div className="row"><span>Kode</span><span>{result.kode_transaksi}</span></div>
              <div className="row"><span>Plat</span><span>{result.kendaraan?.plat_nomor}</span></div>
              <div className="row"><span>Jenis</span><span>{result.kendaraan?.jenis_kendaraan}</span></div>
              <div className="row"><span>Area</span><span>{result.area_parkir?.nama_area}</span></div>
              <div className="row"><span>Masuk</span><span>{formatDate(result.waktu_masuk)}</span></div>
              <div className="row"><span>Petugas</span><span>{result.user?.name}</span></div>
              <div className="line"></div>
              <div className="center">
                <p>Simpan kartu ini dengan baik</p>
                <p>Kartu hilang dikenakan denda</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
