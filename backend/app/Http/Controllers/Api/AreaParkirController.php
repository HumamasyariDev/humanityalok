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
                $q->where('nama_area', 'like', "%{$search}%");
            });
        }

        $areas = $query->orderBy('id_area', 'desc')->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }

    public function all()
    {
        return response()->json([
            'success' => true,
            'data' => AreaParkir::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_area' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
        ]);

        $area = AreaParkir::create($request->only([
            'nama_area', 'kapasitas'
        ]));

        LogAktivitas::create([
            'id_user' => $request->user()->id_user,
            'aktivitas' => "CREATE: Menambah area - {$area->nama_area}",
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
            'nama_area' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
        ]);

        $areaParkir->update($request->only([
            'nama_area', 'kapasitas'
        ]));

        LogAktivitas::create([
            'id_user' => $request->user()->id_user,
            'aktivitas' => "UPDATE: Mengupdate area - {$areaParkir->nama_area}",
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
            'id_user' => $request->user()->id_user,
            'aktivitas' => "DELETE: Menghapus area - {$nama}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Area parkir berhasil dihapus',
        ]);
    }
}
