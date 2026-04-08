<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AreaParkir extends Model
{
    use HasFactory;

    protected $table = 'tb_area_parkir';
    protected $primaryKey = 'id_area';
    public $timestamps = false;

    protected $fillable = [
        'nama_area',
        'kapasitas',
        'terisi',
    ];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class, 'id_area', 'id_area');
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
