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
                $q->whereHas('kendaraan', function ($q2) use ($search) {
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

        $transaksis = $query->orderBy('waktu_masuk', 'desc')
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
            'id_area' => 'required|exists:tb_area_parkir,id_area',
            'warna' => 'nullable|string',
        ]);

        $area = AreaParkir::findOrFail($request->id_area);
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
                'warna' => $request->warna,
            ]
        );

        $existing = Transaksi::where('id_kendaraan', $kendaraan->id_kendaraan)
            ->where('status', 'masuk')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Kendaraan ini masih dalam status parkir!',
            ], 422);
        }

        $transaksi = Transaksi::create([
            'id_kendaraan' => $kendaraan->id_kendaraan,
            'id_area' => $area->id_area,
            'id_tarif' => $tarif->id_tarif,
            'id_user' => $request->user()->id_user,
            'waktu_masuk' => Carbon::now(),
            'status' => 'masuk',
        ]);

        $area->increment('terisi');

        LogAktivitas::create([
            'id_user' => $request->user()->id_user,
            'aktivitas' => "MASUK: Kendaraan masuk - {$kendaraan->plat_nomor} - Area: {$area->nama_area}",
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
        $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir'])
            ->findOrFail($id);

        if ($transaksi->status === 'keluar') {
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
        $biayaTotal = $durasiJam * $tarif->tarif_per_jam;

        $transaksi->update([
            'waktu_keluar' => $waktuKeluar,
            'durasi_jam' => $durasiJam,
            'biaya_total' => $biayaTotal,
            'status' => 'keluar',
        ]);

        $transaksi->areaParkir->decrement('terisi');

        LogAktivitas::create([
            'id_user' => $request->user()->id_user,
            'aktivitas' => "KELUAR: Kendaraan keluar - {$transaksi->kendaraan->plat_nomor} - Biaya: Rp " . number_format($biayaTotal),
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
                'plat_nomor' => $transaksi->kendaraan->plat_nomor,
                'jenis_kendaraan' => $transaksi->kendaraan->jenis_kendaraan,
                'warna' => $transaksi->kendaraan->warna,
                'area_parkir' => $transaksi->areaParkir->nama_area,
                'tarif_per_jam' => $transaksi->tarifParkir->tarif_per_jam,
                'waktu_masuk' => $transaksi->waktu_masuk,
                'waktu_keluar' => $transaksi->waktu_keluar,
                'durasi_jam' => $transaksi->durasi_jam,
                'biaya_total' => $transaksi->biaya_total,
                'status' => $transaksi->status,
                'petugas' => $transaksi->user->nama_lengkap,
            ],
        ]);
    }

    public function scanBarcode(Request $request)
    {
        $request->validate(['barcode' => 'required|string']);

        $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir', 'user'])
            ->where('id_parkir', $request->barcode)
            ->first();

        if (!$transaksi) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan!',
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
            ->where('status', 'keluar')
            ->whereBetween('waktu_masuk', [
                $request->tanggal_mulai . ' 00:00:00',
                $request->tanggal_selesai . ' 23:59:59',
            ]);

        $transaksis = $query->orderBy('waktu_masuk', 'desc')->get();

        $totalPendapatan = $transaksis->sum('biaya_total');
        $totalTransaksi = $transaksis->count();

        $perJenis = $transaksis->groupBy(function ($t) {
            return $t->kendaraan->jenis_kendaraan;
        })->map(function ($group) {
            return [
                'jumlah' => $group->count(),
                'pendapatan' => $group->sum('biaya_total'),
            ];
        });

        $perHari = $transaksis->groupBy(function ($t) {
            return Carbon::parse($t->waktu_masuk)->format('Y-m-d');
        })->map(function ($group) {
            return [
                'jumlah' => $group->count(),
                'pendapatan' => $group->sum('biaya_total'),
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
            ->where('status', 'keluar')
            ->sum('biaya_total');
        $kendaraanParkir = Transaksi::where('status', 'masuk')->count();
        $totalArea = AreaParkir::count();
        $totalKapasitas = AreaParkir::sum('kapasitas');
        $totalTerisi = AreaParkir::sum('terisi');

        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = Transaksi::whereDate('waktu_masuk', $date)->where('status', 'keluar')->count();
            $income = Transaksi::whereDate('waktu_masuk', $date)->where('status', 'keluar')->sum('biaya_total');
            $last7Days[] = [
                'tanggal' => $date->format('d M'),
                'jumlah' => $count,
                'pendapatan' => $income,
            ];
        }

        $recentTransaksi = Transaksi::with(['kendaraan', 'areaParkir'])
            ->orderBy('waktu_masuk', 'desc')
            ->limit(5)
            ->get();

        $areaStatus = AreaParkir::select('id_area', 'nama_area', 'kapasitas', 'terisi')
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
