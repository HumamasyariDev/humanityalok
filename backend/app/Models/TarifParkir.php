<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TarifParkir extends Model
{
    use HasFactory;

    protected $table = 'tarif_parkirs';

    protected $fillable = [
        'jenis_kendaraan',
        'tarif_per_jam',
        'tarif_flat',
        'denda_per_jam',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class, 'tarif_parkir_id');
    }
}
