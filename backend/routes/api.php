<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TarifParkirController;
use App\Http\Controllers\Api\AreaParkirController;
use App\Http\Controllers\Api\KendaraanController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\LogAktivitasController;
use App\Http\Controllers\Api\ChatbotController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [TransaksiController::class, 'dashboard']);

    // Users (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Tarif Parkir (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('tarif-parkir', TarifParkirController::class);
    });
    Route::get('/tarif-parkir-all', [TarifParkirController::class, 'all']);

    // Area Parkir (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('area-parkir', AreaParkirController::class);
    });
    Route::get('/area-parkir-all', [AreaParkirController::class, 'all']);

    // Kendaraan (Admin & Petugas)
    Route::middleware('role:admin,petugas')->group(function () {
        Route::apiResource('kendaraan', KendaraanController::class);
        Route::post('/kendaraan/find-plat', [KendaraanController::class, 'findByPlat']);
    });

    // Transaksi (Admin & Petugas)
    Route::middleware('role:admin,petugas')->group(function () {
        Route::get('/transaksi', [TransaksiController::class, 'index']);
        Route::post('/transaksi/masuk', [TransaksiController::class, 'masuk']);
        Route::post('/transaksi/{id}/keluar', [TransaksiController::class, 'keluar']);
        Route::get('/transaksi/{id}', [TransaksiController::class, 'show']);
        Route::get('/transaksi/{id}/struk', [TransaksiController::class, 'struk']);
        Route::post('/transaksi/scan-barcode', [TransaksiController::class, 'scanBarcode']);
    });

    // Rekap Transaksi (Admin & Owner)
    Route::middleware('role:admin,owner')->group(function () {
        Route::get('/rekap', [TransaksiController::class, 'rekap']);
    });

    // Log Aktivitas (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/log-aktivitas', [LogAktivitasController::class, 'index']);
    });

    // AI Chatbot - Cek Biaya & Slot Parkir (All authenticated users)
    Route::post('/chatbot', [ChatbotController::class, 'chat']);
    Route::post('/chatbot/scan-image', [ChatbotController::class, 'scanImage']);
});
