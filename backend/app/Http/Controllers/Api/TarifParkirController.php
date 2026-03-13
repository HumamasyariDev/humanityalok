<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TarifParkir;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;

class TarifParkirController extends Controller
{
    public function index(Request $request)
    {
        $query = TarifParkir::query();

        if ($request->has('search')) {
            $query->where('jenis_kendaraan', 'like', "%{$request->search}%");
        }

        $tarifs = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $tarifs,
        ]);
    }

    public function all()
    {
        return response()->json([
            'success' => true,
            'data' => TarifParkir::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jenis_kendaraan' => 'required|string|max:255',
            'tarif_per_jam' => 'required|numeric|min:0',
            'tarif_flat' => 'nullable|numeric|min:0',
            'denda_per_jam' => 'nullable|numeric|min:0',
        ]);

        $tarif = TarifParkir::create($request->only([
            'jenis_kendaraan', 'tarif_per_jam', 'tarif_flat', 'denda_per_jam'
        ]));

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'CREATE',
            'modul' => 'Tarif Parkir',
            'keterangan' => "Menambah tarif: {$tarif->jenis_kendaraan}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tarif parkir berhasil ditambahkan',
            'data' => $tarif,
        ], 201);
    }

    public function show(TarifParkir $tarifParkir)
    {
        return response()->json([
            'success' => true,
            'data' => $tarifParkir,
        ]);
    }

    public function update(Request $request, TarifParkir $tarifParkir)
    {
        $request->validate([
            'jenis_kendaraan' => 'required|string|max:255',
            'tarif_per_jam' => 'required|numeric|min:0',
            'tarif_flat' => 'nullable|numeric|min:0',
            'denda_per_jam' => 'nullable|numeric|min:0',
        ]);

        $tarifParkir->update($request->only([
            'jenis_kendaraan', 'tarif_per_jam', 'tarif_flat', 'denda_per_jam'
        ]));

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'UPDATE',
            'modul' => 'Tarif Parkir',
            'keterangan' => "Mengupdate tarif: {$tarifParkir->jenis_kendaraan}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tarif parkir berhasil diupdate',
            'data' => $tarifParkir,
        ]);
    }

    public function destroy(Request $request, TarifParkir $tarifParkir)
    {
        $nama = $tarifParkir->jenis_kendaraan;
        $tarifParkir->delete();

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'DELETE',
            'modul' => 'Tarif Parkir',
            'keterangan' => "Menghapus tarif: {$nama}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tarif parkir berhasil dihapus',
        ]);
    }
}
