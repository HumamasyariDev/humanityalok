<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AreaParkir extends Model
{
    use HasFactory;

    protected $table = 'area_parkirs';

    protected $fillable = [
        'kode_area',
        'nama_area',
        'kapasitas',
        'terisi',
        'status',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class, 'area_parkir_id');
    }

    public function isFull(): bool
    {
        return $this->terisi >= $this->kapasitas;
    }

    public function sisaKapasitas(): int
    {
        return $this->kapasitas - $this->terisi;
    }
}
