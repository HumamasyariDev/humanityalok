<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kendaraan extends Model
{
    use HasFactory;

    protected $table = 'kendaraans';

    protected $fillable = [
        'plat_nomor',
        'jenis_kendaraan',
        'merk',
        'warna',
        'pemilik',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class);
    }
}
