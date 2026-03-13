<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kendaraan;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;

class KendaraanController extends Controller
{
    public function index(Request $request)
    {
        $query = Kendaraan::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('plat_nomor', 'like', "%{$search}%")
                  ->orWhere('merk', 'like', "%{$search}%")
                  ->orWhere('pemilik', 'like', "%{$search}%");
            });
        }

        if ($request->has('jenis')) {
            $query->where('jenis_kendaraan', $request->jenis);
        }

        $kendaraans = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $kendaraans,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'plat_nomor' => 'required|string|unique:kendaraans',
            'jenis_kendaraan' => 'required|string',
            'merk' => 'nullable|string',
            'warna' => 'nullable|string',
            'pemilik' => 'nullable|string',
        ]);

        $kendaraan = Kendaraan::create($request->only([
            'plat_nomor', 'jenis_kendaraan', 'merk', 'warna', 'pemilik'
        ]));

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'CREATE',
            'modul' => 'Kendaraan',
            'keterangan' => "Menambah kendaraan: {$kendaraan->plat_nomor}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil ditambahkan',
            'data' => $kendaraan,
        ], 201);
    }

    public function show(Kendaraan $kendaraan)
    {
        return response()->json([
            'success' => true,
            'data' => $kendaraan,
        ]);
    }

    public function findByPlat(Request $request)
    {
        $request->validate(['plat_nomor' => 'required|string']);

        $kendaraan = Kendaraan::where('plat_nomor', $request->plat_nomor)->first();

        return response()->json([
            'success' => true,
            'data' => $kendaraan,
        ]);
    }

    public function update(Request $request, Kendaraan $kendaraan)
    {
        $request->validate([
            'plat_nomor' => 'required|string|unique:kendaraans,plat_nomor,' . $kendaraan->id,
            'jenis_kendaraan' => 'required|string',
            'merk' => 'nullable|string',
            'warna' => 'nullable|string',
            'pemilik' => 'nullable|string',
        ]);

        $kendaraan->update($request->only([
            'plat_nomor', 'jenis_kendaraan', 'merk', 'warna', 'pemilik'
        ]));

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'UPDATE',
            'modul' => 'Kendaraan',
            'keterangan' => "Mengupdate kendaraan: {$kendaraan->plat_nomor}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil diupdate',
            'data' => $kendaraan,
        ]);
    }

    public function destroy(Request $request, Kendaraan $kendaraan)
    {
        $plat = $kendaraan->plat_nomor;
        $kendaraan->delete();

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'DELETE',
            'modul' => 'Kendaraan',
            'keterangan' => "Menghapus kendaraan: {$plat}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil dihapus',
        ]);
    }
}
