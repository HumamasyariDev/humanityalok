<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create tb_user table
        Schema::create('tb_user', function (Blueprint $table) {
            $table->integer('id_user', true)->primary();
            $table->string('nama_lengkap', 50);
            $table->string('username', 50)->unique();
            $table->string('password', 100);
            $table->enum('role', ['admin', 'petugas', 'owner'])->default('petugas');
            $table->tinyInteger('status_aktif')->default(1);
        });

        // Create tb_area_parkir table
        Schema::create('tb_area_parkir', function (Blueprint $table) {
            $table->integer('id_area', true)->primary();
            $table->string('nama_area', 50);
            $table->integer('kapasitas');
            $table->integer('terisi')->default(0);
        });

        // Create tb_tarif table
        Schema::create('tb_tarif', function (Blueprint $table) {
            $table->integer('id_tarif', true)->primary();
            $table->enum('jenis_kendaraan', ['motor', 'mobil', 'lainnya']);
            $table->decimal('tarif_per_jam', 10, 0);
        });

        // Create tb_kendaraan table
        Schema::create('tb_kendaraan', function (Blueprint $table) {
            $table->integer('id_kendaraan', true)->primary();
            $table->string('plat_nomor', 15)->unique();
            $table->string('jenis_kendaraan', 20);
            $table->string('warna', 20);
            $table->string('pemilik', 100)->nullable();
            $table->integer('id_user')->nullable();
            $table->foreign('id_user')->references('id_user')->on('tb_user')->onDelete('cascade');
        });

        // Create tb_transaksi table
        Schema::create('tb_transaksi', function (Blueprint $table) {
            $table->integer('id_parkir', true)->primary();
            $table->integer('id_kendaraan');
            $table->dateTime('waktu_masuk');
            $table->dateTime('waktu_keluar')->nullable();
            $table->integer('id_tarif');
            $table->integer('durasi_jam')->nullable();
            $table->decimal('biaya_total', 10, 0)->nullable();
            $table->enum('status', ['masuk', 'keluar']);
            $table->integer('id_user');
            $table->integer('id_area');
            
            $table->foreign('id_kendaraan')->references('id_kendaraan')->on('tb_kendaraan')->onDelete('cascade');
            $table->foreign('id_tarif')->references('id_tarif')->on('tb_tarif')->onDelete('cascade');
            $table->foreign('id_user')->references('id_user')->on('tb_user')->onDelete('cascade');
            $table->foreign('id_area')->references('id_area')->on('tb_area_parkir')->onDelete('cascade');
        });

        // Create tb_log_aktivitas table
        Schema::create('tb_log_aktivitas', function (Blueprint $table) {
            $table->integer('id_log', true)->primary();
            $table->integer('id_user');
            $table->string('aktivitas', 100);
            $table->dateTime('waktu_aktivitas');
            
            $table->foreign('id_user')->references('id_user')->on('tb_user')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_log_aktivitas');
        Schema::dropIfExists('tb_transaksi');
        Schema::dropIfExists('tb_kendaraan');
        Schema::dropIfExists('tb_tarif');
        Schema::dropIfExists('tb_area_parkir');
        Schema::dropIfExists('tb_user');
    }
};
