<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\Kendaraan;
use App\Models\AreaParkir;
use App\Models\TarifParkir;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TransaksiController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir', 'user']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_transaksi', 'like', "%{$search}%")
                  ->orWhereHas('kendaraan', function ($q2) use ($search) {
                      $q2->where('plat_nomor', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('tanggal_mulai') && $request->has('tanggal_selesai')) {
            $query->whereBetween('waktu_masuk', [
                $request->tanggal_mulai . ' 00:00:00',
                $request->tanggal_selesai . ' 23:59:59',
            ]);
        }

        $transaksis = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $transaksis,
        ]);
    }

    public function masuk(Request $request)
    {
        $request->validate([
            'plat_nomor' => 'required|string',
            'jenis_kendaraan' => 'required|string',
            'area_parkir_id' => 'required|exists:area_parkirs,id',
            'merk' => 'nullable|string',
            'warna' => 'nullable|string',
        ]);

        $area = AreaParkir::findOrFail($request->area_parkir_id);
        if ($area->isFull()) {
            return response()->json([
                'success' => false,
                'message' => 'Area parkir sudah penuh!',
            ], 422);
        }

        $tarif = TarifParkir::where('jenis_kendaraan', $request->jenis_kendaraan)->first();
        if (!$tarif) {
            return response()->json([
                'success' => false,
                'message' => 'Tarif untuk jenis kendaraan ini belum tersedia!',
            ], 422);
        }

        $kendaraan = Kendaraan::firstOrCreate(
            ['plat_nomor' => strtoupper($request->plat_nomor)],
            [
                'jenis_kendaraan' => $request->jenis_kendaraan,
                'merk' => $request->merk,
                'warna' => $request->warna,
            ]
        );

        $existing = Transaksi::where('kendaraan_id', $kendaraan->id)
            ->where('status', 'parkir')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan ini masih dalam status parkir!',
            ], 422);
        }

        $kodeTransaksi = 'TRX-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        $barcode = 'PKR' . time() . rand(1000, 9999);

        $transaksi = Transaksi::create([
            'kode_transaksi' => $kodeTransaksi,
            'barcode' => $barcode,
            'kendaraan_id' => $kendaraan->id,
            'area_parkir_id' => $area->id,
            'tarif_parkir_id' => $tarif->id,
            'user_id' => $request->user()->id,
            'waktu_masuk' => Carbon::now(),
            'status' => 'parkir',
        ]);

        $area->increment('terisi');

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'MASUK',
            'modul' => 'Transaksi',
            'keterangan' => "Kendaraan masuk: {$kendaraan->plat_nomor} - Area: {$area->nama_area}",
            'ip_address' => $request->ip(),
        ]);

        $transaksi->load(['kendaraan', 'areaParkir', 'tarifParkir', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil masuk parkir',
            'data' => $transaksi,
        ], 201);
    }

    public function keluar(Request $request, $id)
    {
        $request->validate([
            'metode_pembayaran' => 'required|in:tunai,kartu,e-wallet',
        ]);

        $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir'])
            ->findOrFail($id);

        if ($transaksi->status === 'selesai') {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi sudah selesai!',
            ], 422);
        }

        $waktuKeluar = Carbon::now();
        $waktuMasuk = Carbon::parse($transaksi->waktu_masuk);
        $durasiMenit = $waktuMasuk->diffInMinutes($waktuKeluar);
        $durasiJam = ceil($durasiMenit / 60);

        $tarif = $transaksi->tarifParkir;
        $totalBiaya = $tarif->tarif_flat ?? ($durasiJam * $tarif->tarif_per_jam);

        $transaksi->update([
            'waktu_keluar' => $waktuKeluar,
            'durasi_menit' => $durasiMenit,
            'total_biaya' => $totalBiaya,
            'status' => 'selesai',
            'metode_pembayaran' => $request->metode_pembayaran,
        ]);

        $transaksi->areaParkir->decrement('terisi');

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'KELUAR',
            'modul' => 'Transaksi',
            'keterangan' => "Kendaraan keluar: {$transaksi->kendaraan->plat_nomor} - Biaya: Rp " . number_format($totalBiaya),
            'ip_address' => $request->ip(),
        ]);

        $transaksi->load(['kendaraan', 'areaParkir', 'tarifParkir', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil keluar parkir',
            'data' => $transaksi,
        ]);
    }

    public function show($id)
    {
        $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir', 'user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $transaksi,
        ]);
    }

    public function struk($id)
    {
        $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir', 'user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'kode_transaksi' => $transaksi->kode_transaksi,
                'barcode' => $transaksi->barcode,
                'plat_nomor' => $transaksi->kendaraan->plat_nomor,
                'jenis_kendaraan' => $transaksi->kendaraan->jenis_kendaraan,
                'merk' => $transaksi->kendaraan->merk,
                'warna' => $transaksi->kendaraan->warna,
                'area_parkir' => $transaksi->areaParkir->nama_area,
                'tarif_per_jam' => $transaksi->tarifParkir->tarif_per_jam,
                'waktu_masuk' => $transaksi->waktu_masuk,
                'waktu_keluar' => $transaksi->waktu_keluar,
                'durasi_menit' => $transaksi->durasi_menit,
                'total_biaya' => $transaksi->total_biaya,
                'metode_pembayaran' => $transaksi->metode_pembayaran,
                'status' => $transaksi->status,
                'petugas' => $transaksi->user->name,
            ],
        ]);
    }

    public function scanBarcode(Request $request)
    {
        $request->validate(['barcode' => 'required|string']);

        $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir', 'user'])
            ->where('barcode', $request->barcode)
            ->first();

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Barcode tidak ditemukan!',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transaksi,
        ]);
    }

    public function rekap(Request $request)
    {
        $request->validate([
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date',
        ]);

        $query = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir', 'user'])
            ->where('status', 'selesai')
            ->whereBetween('waktu_masuk', [
                $request->tanggal_mulai . ' 00:00:00',
                $request->tanggal_selesai . ' 23:59:59',
            ]);

        $transaksis = $query->orderBy('waktu_masuk', 'desc')->get();

        $totalPendapatan = $transaksis->sum('total_biaya');
        $totalTransaksi = $transaksis->count();

        $perJenis = $transaksis->groupBy(function ($t) {
            return $t->kendaraan->jenis_kendaraan;
        })->map(function ($group) {
            return [
                'jumlah' => $group->count(),
                'pendapatan' => $group->sum('total_biaya'),
            ];
        });

        $perHari = $transaksis->groupBy(function ($t) {
            return Carbon::parse($t->waktu_masuk)->format('Y-m-d');
        })->map(function ($group) {
            return [
                'jumlah' => $group->count(),
                'pendapatan' => $group->sum('total_biaya'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'transaksis' => $transaksis,
                'total_pendapatan' => $totalPendapatan,
                'total_transaksi' => $totalTransaksi,
                'per_jenis' => $perJenis,
                'per_hari' => $perHari,
            ],
        ]);
    }

    public function dashboard()
    {
        $today = Carbon::today();

        $transaksiHariIni = Transaksi::whereDate('waktu_masuk', $today)->count();
        $pendapatanHariIni = Transaksi::whereDate('waktu_masuk', $today)
            ->where('status', 'selesai')
            ->sum('total_biaya');
        $kendaraanParkir = Transaksi::where('status', 'parkir')->count();
        $totalArea = AreaParkir::where('status', 'aktif')->count();
        $totalKapasitas = AreaParkir::where('status', 'aktif')->sum('kapasitas');
        $totalTerisi = AreaParkir::where('status', 'aktif')->sum('terisi');

        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Transaksi::whereDate('waktu_masuk', $date)->where('status', 'selesai')->count();
            $income = Transaksi::whereDate('waktu_masuk', $date)->where('status', 'selesai')->sum('total_biaya');
            $last7Days[] = [
                'tanggal' => $date->format('d M'),
                'jumlah' => $count,
                'pendapatan' => $income,
            ];
        }

        $recentTransaksi = Transaksi::with(['kendaraan', 'areaParkir'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $areaStatus = AreaParkir::where('status', 'aktif')
            ->select('id', 'kode_area', 'nama_area', 'kapasitas', 'terisi')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'transaksi_hari_ini' => $transaksiHariIni,
                'pendapatan_hari_ini' => $pendapatanHariIni,
                'kendaraan_parkir' => $kendaraanParkir,
                'total_area' => $totalArea,
                'total_kapasitas' => $totalKapasitas,
                'total_terisi' => $totalTerisi,
                'chart_7_hari' => $last7Days,
                'recent_transaksi' => $recentTransaksi,
                'area_status' => $areaStatus,
            ],
        ]);
    }
}
