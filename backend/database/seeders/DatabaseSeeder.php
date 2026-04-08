<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TarifParkir;
use App\Models\AreaParkir;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Create default users
        User::create([
            'nama_lengkap' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status_aktif' => 1,
        ]);

        User::create([
            'nama_lengkap' => 'Petugas Parkir',
            'username' => 'petugas',
            'password' => Hash::make('password'),
            'role' => 'petugas',
            'status_aktif' => 1,
        ]);

        User::create([
            'nama_lengkap' => 'Owner',
            'username' => 'owner',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'status_aktif' => 1,
        ]);

        // Create default tarif
        TarifParkir::create([
            'jenis_kendaraan' => 'motor',
            'tarif_per_jam' => 2000,
        ]);

        TarifParkir::create([
            'jenis_kendaraan' => 'mobil',
            'tarif_per_jam' => 5000,
        ]);

        TarifParkir::create([
            'jenis_kendaraan' => 'lainnya',
            'tarif_per_jam' => 10000,
        ]);

        // Create default area parkir
        AreaParkir::create([
            'nama_area' => 'Area Motor Utama',
            'kapasitas' => 50,
        ]);

        AreaParkir::create([
            'nama_area' => 'Area Motor Belakang',
            'kapasitas' => 30,
        ]);

        AreaParkir::create([
            'nama_area' => 'Area Mobil Lantai 1',
            'kapasitas' => 25,
        ]);

        AreaParkir::create([
            'nama_area' => 'Area Mobil Lantai 2',
            'kapasitas' => 25,
        ]);

        AreaParkir::create([
            'nama_area' => 'Area Truk & Bus',
            'kapasitas' => 10,
        ]);
    }
}
