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
                  ->orWhere('pemilik', 'like', "%{$search}%");
            });
        }

        if ($request->has('jenis')) {
            $query->where('jenis_kendaraan', $request->jenis);
        }

        $kendaraans = $query->orderBy('id_kendaraan', 'desc')->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $kendaraans,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'plat_nomor' => 'required|string|unique:tb_kendaraan',
            'jenis_kendaraan' => 'required|string',
            'warna' => 'nullable|string',
            'pemilik' => 'nullable|string',
        ]);

        $kendaraan = Kendaraan::create($request->only([
            'plat_nomor', 'jenis_kendaraan', 'warna', 'pemilik'
        ]));

        LogAktivitas::create([
            'id_user' => $request->user()->id_user,
            'aktivitas' => "CREATE: Menambah kendaraan - {$kendaraan->plat_nomor}",
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
            'plat_nomor' => 'required|string|unique:tb_kendaraan,plat_nomor,' . $kendaraan->id_kendaraan,
            'jenis_kendaraan' => 'required|string',
            'warna' => 'nullable|string',
            'pemilik' => 'nullable|string',
        ]);

        $kendaraan->update($request->only([
            'plat_nomor', 'jenis_kendaraan', 'warna', 'pemilik'
        ]));

        LogAktivitas::create([
            'id_user' => $request->user()->id_user,
            'aktivitas' => "UPDATE: Mengupdate kendaraan - {$kendaraan->plat_nomor}",
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
            'id_user' => $request->user()->id_user,
            'aktivitas' => "DELETE: Menghapus kendaraan - {$plat}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kendaraan berhasil dihapus',
        ]);
    }
}
