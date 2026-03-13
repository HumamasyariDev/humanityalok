<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarif_parkirs', function (Blueprint $table) {
            $table->id();
            $table->string('jenis_kendaraan');
            $table->decimal('tarif_per_jam', 10, 2);
            $table->decimal('tarif_flat', 10, 2)->nullable();
            $table->decimal('denda_per_jam', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tarif_parkirs');
    }
};
