<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksis', function (Blueprint $table) {
            $table->id();
            $table->string('kode_transaksi')->unique();
            $table->string('barcode')->unique();
            $table->foreignId('kendaraan_id')->constrained('kendaraans')->onDelete('cascade');
            $table->foreignId('area_parkir_id')->constrained('area_parkirs')->onDelete('cascade');
            $table->foreignId('tarif_parkir_id')->constrained('tarif_parkirs')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('waktu_masuk');
            $table->timestamp('waktu_keluar')->nullable();
            $table->integer('durasi_menit')->nullable();
            $table->decimal('total_biaya', 12, 2)->nullable();
            $table->enum('status', ['parkir', 'selesai'])->default('parkir');
            $table->enum('metode_pembayaran', ['tunai', 'kartu', 'e-wallet'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
