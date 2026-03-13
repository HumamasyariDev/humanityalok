<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AreaParkir;
use App\Models\LogAktivitas;
use Illuminate\Http\Request;

class AreaParkirController extends Controller
{
    public function index(Request $request)
    {
        $query = AreaParkir::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_area', 'like', "%{$search}%")
                  ->orWhere('nama_area', 'like', "%{$search}%");
            });
        }

        $areas = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }

    public function all()
    {
        return response()->json([
            'success' => true,
            'data' => AreaParkir::where('status', 'aktif')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_area' => 'required|string|unique:area_parkirs',
            'nama_area' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $area = AreaParkir::create($request->only([
            'kode_area', 'nama_area', 'kapasitas', 'status'
        ]));

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'CREATE',
            'modul' => 'Area Parkir',
            'keterangan' => "Menambah area: {$area->nama_area}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Area parkir berhasil ditambahkan',
            'data' => $area,
        ], 201);
    }

    public function show(AreaParkir $areaParkir)
    {
        return response()->json([
            'success' => true,
            'data' => $areaParkir,
        ]);
    }

    public function update(Request $request, AreaParkir $areaParkir)
    {
        $request->validate([
            'kode_area' => 'required|string|unique:area_parkirs,kode_area,' . $areaParkir->id,
            'nama_area' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $areaParkir->update($request->only([
            'kode_area', 'nama_area', 'kapasitas', 'status'
        ]));

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'UPDATE',
            'modul' => 'Area Parkir',
            'keterangan' => "Mengupdate area: {$areaParkir->nama_area}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Area parkir berhasil diupdate',
            'data' => $areaParkir,
        ]);
    }

    public function destroy(Request $request, AreaParkir $areaParkir)
    {
        $nama = $areaParkir->nama_area;
        $areaParkir->delete();

        LogAktivitas::create([
            'user_id' => $request->user()->id,
            'aksi' => 'DELETE',
            'modul' => 'Area Parkir',
            'keterangan' => "Menghapus area: {$nama}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Area parkir berhasil dihapus',
        ]);
    }
}
