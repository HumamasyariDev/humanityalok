<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksis';

    protected $fillable = [
        'kode_transaksi',
        'barcode',
        'kendaraan_id',
        'area_parkir_id',
        'tarif_parkir_id',
        'user_id',
        'waktu_masuk',
        'waktu_keluar',
        'durasi_menit',
        'total_biaya',
        'status',
        'metode_pembayaran',
    ];

    protected $casts = [
        'waktu_masuk' => 'datetime',
        'waktu_keluar' => 'datetime',
        'total_biaya' => 'decimal:2',
    ];

    public function kendaraan()
    {
        return $this->belongsTo(Kendaraan::class);
    }

    public function areaParkir()
    {
        return $this->belongsTo(AreaParkir::class, 'area_parkir_id');
    }

    public function tarifParkir()
    {
        return $this->belongsTo(TarifParkir::class, 'tarif_parkir_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
