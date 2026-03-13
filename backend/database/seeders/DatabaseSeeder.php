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
            'name' => 'Administrator',
            'email' => 'admin@parkir.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Petugas Parkir',
            'email' => 'petugas@parkir.com',
            'password' => Hash::make('password'),
            'role' => 'petugas',
        ]);

        User::create([
            'name' => 'Owner',
            'email' => 'owner@parkir.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
        ]);

        // Create default tarif
        TarifParkir::create([
            'jenis_kendaraan' => 'Motor',
            'tarif_per_jam' => 2000,
            'denda_per_jam' => 1000,
        ]);

        TarifParkir::create([
            'jenis_kendaraan' => 'Mobil',
            'tarif_per_jam' => 5000,
            'denda_per_jam' => 2000,
        ]);

        TarifParkir::create([
            'jenis_kendaraan' => 'Truk',
            'tarif_per_jam' => 10000,
            'denda_per_jam' => 5000,
        ]);

        TarifParkir::create([
            'jenis_kendaraan' => 'Bus',
            'tarif_per_jam' => 15000,
            'denda_per_jam' => 7000,
        ]);

        // Create default area parkir
        AreaParkir::create([
            'kode_area' => 'A1',
            'nama_area' => 'Area Motor Utama',
            'kapasitas' => 50,
            'status' => 'aktif',
        ]);

        AreaParkir::create([
            'kode_area' => 'A2',
            'nama_area' => 'Area Motor Belakang',
            'kapasitas' => 30,
            'status' => 'aktif',
        ]);

        AreaParkir::create([
            'kode_area' => 'B1',
            'nama_area' => 'Area Mobil Lantai 1',
            'kapasitas' => 25,
            'status' => 'aktif',
        ]);

        AreaParkir::create([
            'kode_area' => 'B2',
            'nama_area' => 'Area Mobil Lantai 2',
            'kapasitas' => 25,
            'status' => 'aktif',
        ]);

        AreaParkir::create([
            'kode_area' => 'C1',
            'nama_area' => 'Area Truk & Bus',
            'kapasitas' => 10,
            'status' => 'aktif',
        ]);
    }
}
