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
        // Drop old tables
        Schema::dropIfExists('transaksis');
        Schema::dropIfExists('kendaraans');
        Schema::dropIfExists('log_aktivitas');
        Schema::dropIfExists('area_parkirs');
        Schema::dropIfExists('tarif_parkirs');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration drops tables, so we don't recreate them in reverse
    }
};
