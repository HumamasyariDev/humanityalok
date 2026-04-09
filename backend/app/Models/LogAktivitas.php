<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogAktivitas extends Model
{
    use HasFactory;

    protected $table = 'tb_log_aktivitas';
    protected $primaryKey = 'id_log';
    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'aktivitas',
        'waktu_aktivitas',
    ];

    protected $casts = [
        'waktu_aktivitas' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($log) {
            if (!$log->waktu_aktivitas) {
                $log->waktu_aktivitas = now();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
