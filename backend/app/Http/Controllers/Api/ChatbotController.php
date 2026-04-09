<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TarifParkir;
use App\Models\AreaParkir;
use App\Models\Kendaraan;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ChatbotController extends Controller
{
    /**
     * Handle chatbot message - AI Chatbot untuk Cek Biaya & Slot Parkir
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $userMessage = $request->message;

        // If message contains PKR code, also return parking_data for frontend barcode rendering
        $parkingData = null;
        $prkPattern = '/PKR[- ]?(\d{1,6})/i';
        if (preg_match($prkPattern, $userMessage, $prkMatches)) {
            $idParkir = (int) $prkMatches[1];
            $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir'])
                ->where('id_parkir', $idParkir)
                ->first();
            if ($transaksi) {
                $parkingData = [
                    'kode_parkir' => 'PKR-' . str_pad($transaksi->id_parkir, 6, '0', STR_PAD_LEFT),
                    'plat_nomor' => $transaksi->kendaraan->plat_nomor,
                    'jenis_kendaraan' => $transaksi->kendaraan->jenis_kendaraan,
                    'area_parkir' => $transaksi->areaParkir->nama_area ?? '-',
                    'waktu_masuk' => Carbon::parse($transaksi->waktu_masuk)->format('d/m/Y H:i'),
                    'status' => $transaksi->status,
                ];
                if ($transaksi->status === 'masuk') {
                    $waktuMasuk = Carbon::parse($transaksi->waktu_masuk);
                    $durasiMenit = $waktuMasuk->diffInMinutes(Carbon::now());
                    $durasiJam = max(1, ceil($durasiMenit / 60));
                    $parkingData['durasi'] = $this->formatDurasi($durasiMenit);
                    $parkingData['estimasi_biaya'] = $durasiJam * $transaksi->tarifParkir->tarif_per_jam;
                } else {
                    $parkingData['waktu_keluar'] = Carbon::parse($transaksi->waktu_keluar)->format('d/m/Y H:i');
                    $parkingData['durasi_jam'] = $transaksi->durasi_jam;
                    $parkingData['biaya_total'] = (int) $transaksi->biaya_total;
                }
            }
        }

        // Gather parking context data from database
        $context = $this->gatherParkingContext();

        // Detect plat nomor in user message and get realtime parking data
        $vehicleContext = $this->detectAndQueryVehicle($userMessage);

        // Detect kode parkir (PKR-XXXXXX) in user message
        $strukContext = $this->detectAndQueryStruk($userMessage);

        // Build system prompt with parking data context
        $systemPrompt = $this->buildSystemPrompt($context, $vehicleContext, $strukContext);

        // Call NVIDIA AI API
        $aiResponse = $this->callNvidiaApi($systemPrompt, $userMessage);

        $response = [
            'success' => true,
            'reply' => $aiResponse,
        ];

        if ($parkingData) {
            $response['parking_data'] = $parkingData;
        }

        return response()->json($response);
    }

    /**
     * Detect plat nomor pattern in user message and query active parking
     */
    private function detectAndQueryVehicle(string $message): ?array
    {
        // Pattern plat nomor Indonesia: B 1234 ABC, B1234ABC, AB 1234 CD, dll
        // Support format: dengan/tanpa spasi, huruf besar/kecil
        $pattern = '/\b([A-Za-z]{1,2})\s*(\d{1,4})\s*([A-Za-z]{0,3})\b/';

        if (!preg_match($pattern, $message, $matches)) {
            return null;
        }

        // Reconstruct plat nomor (uppercase, with spaces)
        $platRaw = strtoupper(trim($matches[1] . ' ' . $matches[2] . ' ' . $matches[3]));

        // Try find kendaraan with multiple format variations
        $variations = [
            $platRaw,                                    // "B 1234 ABC"
            str_replace(' ', '', $platRaw),              // "B1234ABC"
            $matches[1] . ' ' . $matches[2] . $matches[3], // "B 1234ABC"
        ];

        $kendaraan = null;
        foreach ($variations as $plat) {
            $kendaraan = Kendaraan::where('plat_nomor', strtoupper($plat))->first();
            if ($kendaraan) break;
        }

        if (!$kendaraan) {
            return [
                'found' => false,
                'plat_nomor' => $platRaw,
                'message' => "Kendaraan dengan plat nomor {$platRaw} tidak ditemukan di database.",
            ];
        }

        // Check active parking (status = masuk)
        $activeParking = Transaksi::with(['areaParkir', 'tarifParkir'])
            ->where('id_kendaraan', $kendaraan->id_kendaraan)
            ->where('status', 'masuk')
            ->first();

        if ($activeParking) {
            $waktuMasuk = Carbon::parse($activeParking->waktu_masuk);
            $now = Carbon::now();
            $durasiMenit = $waktuMasuk->diffInMinutes($now);
            $durasiJam = ceil($durasiMenit / 60);
            $jamBulat = max(1, $durasiJam); // Minimal 1 jam
            $estimasiBiaya = $jamBulat * $activeParking->tarifParkir->tarif_per_jam;

            return [
                'found' => true,
                'plat_nomor' => $kendaraan->plat_nomor,
                'jenis_kendaraan' => $kendaraan->jenis_kendaraan,
                'warna' => $kendaraan->warna ?? '-',
                'status' => 'SEDANG PARKIR',
                'waktu_masuk' => $waktuMasuk->format('d/m/Y H:i'),
                'area_parkir' => $activeParking->areaParkir->nama_area ?? '-',
                'durasi_menit' => $durasiMenit,
                'durasi_jam_display' => $this->formatDurasi($durasiMenit),
                'durasi_jam_hitung' => $jamBulat,
                'tarif_per_jam' => $activeParking->tarifParkir->tarif_per_jam,
                'estimasi_biaya' => $estimasiBiaya,
                'kode_parkir' => 'PKR-' . str_pad($activeParking->id_parkir, 6, '0', STR_PAD_LEFT),
            ];
        }

        // Check last completed parking (status = keluar)
        $lastParking = Transaksi::with(['areaParkir', 'tarifParkir'])
            ->where('id_kendaraan', $kendaraan->id_kendaraan)
            ->where('status', 'keluar')
            ->orderByDesc('waktu_keluar')
            ->first();

        if ($lastParking) {
            return [
                'found' => true,
                'plat_nomor' => $kendaraan->plat_nomor,
                'jenis_kendaraan' => $kendaraan->jenis_kendaraan,
                'warna' => $kendaraan->warna ?? '-',
                'status' => 'SUDAH KELUAR',
                'waktu_masuk' => Carbon::parse($lastParking->waktu_masuk)->format('d/m/Y H:i'),
                'waktu_keluar' => Carbon::parse($lastParking->waktu_keluar)->format('d/m/Y H:i'),
                'area_parkir' => $lastParking->areaParkir->nama_area ?? '-',
                'durasi_jam' => $lastParking->durasi_jam,
                'biaya_total' => (int) $lastParking->biaya_total,
                'kode_parkir' => 'PKR-' . str_pad($lastParking->id_parkir, 6, '0', STR_PAD_LEFT),
            ];
        }

        return [
            'found' => true,
            'plat_nomor' => $kendaraan->plat_nomor,
            'jenis_kendaraan' => $kendaraan->jenis_kendaraan,
            'warna' => $kendaraan->warna ?? '-',
            'status' => 'TIDAK ADA TRANSAKSI',
            'message' => "Kendaraan {$kendaraan->plat_nomor} terdaftar tapi tidak ada riwayat transaksi parkir.",
        ];
    }

    /**
     * Detect kode parkir (PKR-XXXXXX) in user message and query transaction
     */
    private function detectAndQueryStruk(string $message): ?array
    {
        // Pattern kode parkir: PKR-000001, PKR-123, dll
        $pattern = '/PKR[- ]?(\d{1,6})/i';

        if (!preg_match($pattern, $message, $matches)) {
            return null;
        }

        $idParkir = (int) $matches[1];
        $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir'])
            ->where('id_parkir', $idParkir)
            ->first();

        if (!$transaksi) {
            return [
                'found' => false,
                'kode_parkir' => 'PKR-' . str_pad($idParkir, 6, '0', STR_PAD_LEFT),
                'message' => "Kode parkir PKR-" . str_pad($idParkir, 6, '0', STR_PAD_LEFT) . " tidak ditemukan.",
            ];
        }

        $result = [
            'found' => true,
            'kode_parkir' => 'PKR-' . str_pad($transaksi->id_parkir, 6, '0', STR_PAD_LEFT),
            'plat_nomor' => $transaksi->kendaraan->plat_nomor,
            'jenis_kendaraan' => $transaksi->kendaraan->jenis_kendaraan,
            'area_parkir' => $transaksi->areaParkir->nama_area ?? '-',
            'waktu_masuk' => Carbon::parse($transaksi->waktu_masuk)->format('d/m/Y H:i'),
            'status' => $transaksi->status === 'masuk' ? 'SEDANG PARKIR' : 'SUDAH KELUAR',
        ];

        if ($transaksi->status === 'masuk') {
            $waktuMasuk = Carbon::parse($transaksi->waktu_masuk);
            $now = Carbon::now();
            $durasiMenit = $waktuMasuk->diffInMinutes($now);
            $durasiJam = max(1, ceil($durasiMenit / 60));
            $estimasiBiaya = $durasiJam * $transaksi->tarifParkir->tarif_per_jam;

            $result['durasi_menit'] = $durasiMenit;
            $result['durasi_jam_display'] = $this->formatDurasi($durasiMenit);
            $result['durasi_jam_hitung'] = $durasiJam;
            $result['tarif_per_jam'] = $transaksi->tarifParkir->tarif_per_jam;
            $result['estimasi_biaya'] = $estimasiBiaya;
        } else {
            $result['waktu_keluar'] = Carbon::parse($transaksi->waktu_keluar)->format('d/m/Y H:i');
            $result['durasi_jam'] = $transaksi->durasi_jam;
            $result['biaya_total'] = (int) $transaksi->biaya_total;
        }

        return $result;
    }

    /**
     * Format durasi menit ke string yang mudah dibaca
     */
    private function formatDurasi(int $menit): string
    {
        if ($menit < 60) {
            return "{$menit} menit";
        }

        $jam = floor($menit / 60);
        $sisaMenit = $menit % 60;

        if ($sisaMenit === 0) {
            return "{$jam} jam";
        }

        return "{$jam} jam {$sisaMenit} menit";
    }

    /**
     * Gather real-time parking data from database
     */
    private function gatherParkingContext(): array
    {
        $tarifs = TarifParkir::all()->map(function ($tarif) {
            return [
                'jenis_kendaraan' => $tarif->jenis_kendaraan,
                'tarif_per_jam' => (int) $tarif->tarif_per_jam,
            ];
        })->toArray();

        $areas = AreaParkir::all()->map(function ($area) {
            return [
                'nama_area' => $area->nama_area,
                'kapasitas' => $area->kapasitas,
                'terisi' => $area->terisi,
                'sisa' => $area->kapasitas - $area->terisi,
                'penuh' => $area->terisi >= $area->kapasitas,
            ];
        })->toArray();

        $today = now()->toDateString();
        $todayTransactions = Transaksi::whereDate('waktu_masuk', $today)->count();
        $currentlyParked = Transaksi::where('status', 'masuk')->count();
        $todayIncome = Transaksi::whereDate('waktu_keluar', $today)
            ->where('status', 'keluar')
            ->sum('biaya_total');

        return [
            'tarifs' => $tarifs,
            'areas' => $areas,
            'today_transactions' => $todayTransactions,
            'currently_parked' => $currentlyParked,
            'today_income' => (int) $todayIncome,
        ];
    }

    /**
     * Build system prompt with parking context + vehicle/struk data
     */
    private function buildSystemPrompt(array $context, ?array $vehicleContext, ?array $strukContext): string
    {
        $tarifInfo = '';
        foreach ($context['tarifs'] as $tarif) {
            $tarifInfo .= "- {$tarif['jenis_kendaraan']}: Rp " . number_format($tarif['tarif_per_jam'], 0, ',', '.') . "/jam\n";
        }

        $areaInfo = '';
        foreach ($context['areas'] as $area) {
            $status = $area['penuh'] ? 'PENUH' : "tersedia {$area['sisa']} slot";
            $areaInfo .= "- {$area['nama_area']}: kapasitas {$area['kapasitas']}, terisi {$area['terisi']}, {$status}\n";
        }

        // Build vehicle context section
        $vehicleSection = '';
        if ($vehicleContext) {
            $vehicleSection = "\n\nDATA KENDARAAN YANG DITANYAKAN USER (REAL-TIME):\n";
            if (!$vehicleContext['found']) {
                $vehicleSection .= $vehicleContext['message'] . "\n";
            } elseif ($vehicleContext['status'] === 'SEDANG PARKIR') {
                $vehicleSection .= "Plat Nomor: {$vehicleContext['plat_nomor']}\n";
                $vehicleSection .= "Jenis: {$vehicleContext['jenis_kendaraan']}\n";
                $vehicleSection .= "Warna: {$vehicleContext['warna']}\n";
                $vehicleSection .= "Status: SEDANG PARKIR (aktif)\n";
                $vehicleSection .= "Kode Parkir: {$vehicleContext['kode_parkir']}\n";
                $vehicleSection .= "Waktu Masuk: {$vehicleContext['waktu_masuk']}\n";
                $vehicleSection .= "Area Parkir: {$vehicleContext['area_parkir']}\n";
                $vehicleSection .= "Sudah Parkir Selama: {$vehicleContext['durasi_jam_display']}\n";
                $vehicleSection .= "Durasi Dihitung: {$vehicleContext['durasi_jam_hitung']} jam (pembulatan ke atas)\n";
                $vehicleSection .= "Tarif: Rp " . number_format($vehicleContext['tarif_per_jam'], 0, ',', '.') . "/jam\n";
                $vehicleSection .= "ESTIMASI BIAYA SAAT INI: Rp " . number_format($vehicleContext['estimasi_biaya'], 0, ',', '.') . "\n";
                $vehicleSection .= "Catatan: Biaya bisa bertambah jika durasi parkir bertambah.\n";
            } elseif ($vehicleContext['status'] === 'SUDAH KELUAR') {
                $vehicleSection .= "Plat Nomor: {$vehicleContext['plat_nomor']}\n";
                $vehicleSection .= "Jenis: {$vehicleContext['jenis_kendaraan']}\n";
                $vehicleSection .= "Status: SUDAH KELUAR (transaksi terakhir)\n";
                $vehicleSection .= "Kode Parkir: {$vehicleContext['kode_parkir']}\n";
                $vehicleSection .= "Waktu Masuk: {$vehicleContext['waktu_masuk']}\n";
                $vehicleSection .= "Waktu Keluar: {$vehicleContext['waktu_keluar']}\n";
                $vehicleSection .= "Durasi: {$vehicleContext['durasi_jam']} jam\n";
                $vehicleSection .= "Total Biaya: Rp " . number_format($vehicleContext['biaya_total'], 0, ',', '.') . "\n";
            } else {
                $vehicleSection .= $vehicleContext['message'] . "\n";
            }
        }

        // Build struk context section
        $strukSection = '';
        if ($strukContext) {
            $strukSection = "\n\nDATA STRUK/KODE PARKIR YANG DITANYAKAN USER (REAL-TIME):\n";
            if (!$strukContext['found']) {
                $strukSection .= $strukContext['message'] . "\n";
            } elseif ($strukContext['status'] === 'SEDANG PARKIR') {
                $strukSection .= "Kode Parkir: {$strukContext['kode_parkir']}\n";
                $strukSection .= "Plat Nomor: {$strukContext['plat_nomor']}\n";
                $strukSection .= "Jenis: {$strukContext['jenis_kendaraan']}\n";
                $strukSection .= "Status: SEDANG PARKIR (aktif)\n";
                $strukSection .= "Waktu Masuk: {$strukContext['waktu_masuk']}\n";
                $strukSection .= "Area Parkir: {$strukContext['area_parkir']}\n";
                $strukSection .= "Sudah Parkir Selama: {$strukContext['durasi_jam_display']}\n";
                $strukSection .= "Durasi Dihitung: {$strukContext['durasi_jam_hitung']} jam (pembulatan ke atas)\n";
                $strukSection .= "Tarif: Rp " . number_format($strukContext['tarif_per_jam'], 0, ',', '.') . "/jam\n";
                $strukSection .= "ESTIMASI BIAYA SAAT INI: Rp " . number_format($strukContext['estimasi_biaya'], 0, ',', '.') . "\n";
                $strukSection .= "Catatan: Biaya bisa bertambah jika durasi parkir bertambah.\n";
            } else {
                $strukSection .= "Kode Parkir: {$strukContext['kode_parkir']}\n";
                $strukSection .= "Plat Nomor: {$strukContext['plat_nomor']}\n";
                $strukSection .= "Jenis: {$strukContext['jenis_kendaraan']}\n";
                $strukSection .= "Status: SUDAH KELUAR\n";
                $strukSection .= "Waktu Masuk: {$strukContext['waktu_masuk']}\n";
                $strukSection .= "Waktu Keluar: {$strukContext['waktu_keluar']}\n";
                $strukSection .= "Durasi: {$strukContext['durasi_jam']} jam\n";
                $strukSection .= "Total Biaya: Rp " . number_format($strukContext['biaya_total'], 0, ',', '.') . "\n";
            }
        }

        return <<<PROMPT
Kamu adalah SmartPark AI Assistant, chatbot pintar untuk sistem manajemen parkir SmartPark.
Tugasmu adalah membantu pengguna mengecek estimasi biaya parkir, ketersediaan slot parkir, dan status kendaraan yang sedang parkir secara real-time.

DATA TARIF PARKIR SAAT INI:
{$tarifInfo}

DATA AREA PARKIR REAL-TIME:
{$areaInfo}

STATISTIK HARI INI:
- Total transaksi hari ini: {$context['today_transactions']}
- Kendaraan sedang parkir: {$context['currently_parked']}
- Pendapatan hari ini: Rp {$this->formatRupiah($context['today_income'])}
{$vehicleSection}{$strukSection}

INSTRUKSI:
1. Jawab dalam Bahasa Indonesia yang ramah dan informatif
2. Jika ditanya estimasi biaya, hitung berdasarkan tarif per jam x durasi yang disebutkan user. Pembulatan ke atas per jam.
3. Jika ditanya slot/kapasitas parkir, berikan info real-time dari data area di atas
4. Jika user menyebut PLAT NOMOR (misal: B 1234 ABC), gunakan DATA KENDARAAN YANG DITANYAKAN di atas untuk menjawab. Tampilkan info lengkap: plat, durasi parkir, estimasi biaya saat ini, area parkir, dll.
5. Jika user menyebut KODE PARKIR (misal: PKR-000001), gunakan DATA STRUK/KODE PARKIR di atas untuk menjawab.
6. Jika kendaraan sedang parkir, SELALU tampilkan estimasi biaya saat ini dan ingatkan bahwa biaya bisa bertambah.
7. Jika kendaraan sudah keluar, tampilkan detail transaksi terakhir (durasi, biaya total).
8. Jika kendaraan tidak ditemukan, beritahu user dan sarankan untuk cek ulang plat nomor/kode parkir.
9. Jika ditanya hal di luar topik parkir, arahkan kembali ke topik parkir dengan sopan
10. Gunakan format yang rapi dan mudah dibaca, gunakan **bold** untuk angka/info penting
11. Jawab dengan singkat dan jelas, maksimal 5-6 kalimat
PROMPT;
    }

    /**
     * Format number to Rupiah string
     */
    private function formatRupiah(int $amount): string
    {
        return number_format($amount, 0, ',', '.');
    }

    /**
     * Handle struk image scan - extract PKR code from image using NVIDIA Vision API
     */
    public function scanImage(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // base64 encoded image
        ]);

        $base64Image = $request->image;

        // Remove data URI prefix if present
        if (str_contains($base64Image, ',')) {
            $base64Image = explode(',', $base64Image, 2)[1];
        }

        // Call NVIDIA Vision API to extract text from image
        $extractedText = $this->callNvidiaVisionApi($base64Image);

        if (!$extractedText) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membaca gambar. Pastikan gambar struk terlihat jelas.',
            ]);
        }

        // Try to detect PKR code from extracted text
        $prkPattern = '/PKR[- ]?(\d{1,6})/i';
        if (preg_match($prkPattern, $extractedText, $matches)) {
            $idParkir = (int) $matches[1];
            $kodeParkir = 'PKR-' . str_pad($idParkir, 6, '0', STR_PAD_LEFT);

            // Query the transaction
            $strukContext = $this->detectAndQueryStruk($kodeParkir);

            if ($strukContext && $strukContext['found']) {
                // Also get parking_data for barcode rendering
                $transaksi = Transaksi::with(['kendaraan', 'areaParkir', 'tarifParkir'])
                    ->where('id_parkir', $idParkir)
                    ->first();

                $parkingData = null;
                if ($transaksi) {
                    $parkingData = [
                        'kode_parkir' => $kodeParkir,
                        'plat_nomor' => $transaksi->kendaraan->plat_nomor,
                        'jenis_kendaraan' => $transaksi->kendaraan->jenis_kendaraan,
                        'area_parkir' => $transaksi->areaParkir->nama_area ?? '-',
                        'waktu_masuk' => Carbon::parse($transaksi->waktu_masuk)->format('d/m/Y H:i'),
                        'status' => $transaksi->status,
                    ];
                    if ($transaksi->status === 'masuk') {
                        $waktuMasuk = Carbon::parse($transaksi->waktu_masuk);
                        $durasiMenit = $waktuMasuk->diffInMinutes(Carbon::now());
                        $durasiJam = max(1, ceil($durasiMenit / 60));
                        $parkingData['durasi'] = $this->formatDurasi($durasiMenit);
                        $parkingData['estimasi_biaya'] = $durasiJam * $transaksi->tarifParkir->tarif_per_jam;
                    } else {
                        $parkingData['waktu_keluar'] = Carbon::parse($transaksi->waktu_keluar)->format('d/m/Y H:i');
                        $parkingData['durasi_jam'] = $transaksi->durasi_jam;
                        $parkingData['biaya_total'] = (int) $transaksi->biaya_total;
                    }
                }

                // Build a nice AI response using the data
                $context = $this->gatherParkingContext();
                $systemPrompt = $this->buildSystemPrompt($context, null, $strukContext);
                $aiResponse = $this->callNvidiaApi($systemPrompt, "Saya scan struk parkir dan kodenya adalah {$kodeParkir}. Tolong cek statusnya.");

                $response = [
                    'success' => true,
                    'kode_parkir' => $kodeParkir,
                    'reply' => $aiResponse,
                ];
                if ($parkingData) {
                    $response['parking_data'] = $parkingData;
                }
                return response()->json($response);
            }

            return response()->json([
                'success' => true,
                'kode_parkir' => $kodeParkir,
                'reply' => "Kode parkir **{$kodeParkir}** berhasil terbaca dari gambar, namun tidak ditemukan di database. Pastikan kode parkir benar.",
            ]);
        }

        // Try to detect plat nomor
        $platPattern = '/\b([A-Za-z]{1,2})\s*(\d{1,4})\s*([A-Za-z]{0,3})\b/';
        if (preg_match($platPattern, $extractedText, $matches)) {
            $platNomor = strtoupper(trim($matches[1] . ' ' . $matches[2] . ' ' . $matches[3]));

            $vehicleContext = $this->detectAndQueryVehicle($platNomor);
            $context = $this->gatherParkingContext();
            $systemPrompt = $this->buildSystemPrompt($context, $vehicleContext, null);
            $aiResponse = $this->callNvidiaApi($systemPrompt, "Saya scan struk dan terdeteksi plat nomor {$platNomor}. Tolong cek statusnya.");

            return response()->json([
                'success' => true,
                'reply' => $aiResponse,
            ]);
        }

        return response()->json([
            'success' => true,
            'reply' => "Saya berhasil membaca gambar, tapi tidak menemukan kode parkir (PKR-XXXXXX) atau plat nomor di dalamnya. Teks yang terbaca: \"{$extractedText}\"\n\nCoba ketik kode parkir secara manual, contoh: **PKR-000001**",
        ]);
    }

    /**
     * Call NVIDIA Vision API to extract text from image
     */
    private function callNvidiaVisionApi(string $base64Image): ?string
    {
        $apiKey = config('services.nvidia.api_key');

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->withoutVerifying()->post('https://integrate.api.nvidia.com/v1/chat/completions', [
                'model' => 'microsoft/phi-3.5-vision-instruct',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Baca semua teks yang ada di gambar struk parkir ini. Fokus pada kode parkir (format PKR-XXXXXX atau PKR diikuti angka) dan plat nomor kendaraan. Tulis teks yang terbaca apa adanya tanpa penjelasan tambahan.',
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:image/jpeg;base64,{$base64Image}",
                                ],
                            ],
                        ],
                    ],
                ],
                'temperature' => 0.2,
                'max_tokens' => 300,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? null;
            }

            Log::error('NVIDIA Vision API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('NVIDIA Vision API Exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Call NVIDIA AI API (OpenAI-compatible)
     */
    private function callNvidiaApi(string $systemPrompt, string $userMessage): string
    {
        $apiKey = config('services.nvidia.api_key');

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->withoutVerifying()->post('https://integrate.api.nvidia.com/v1/chat/completions', [
                'model' => 'meta/llama-3.1-8b-instruct',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt,
                    ],
                    [
                        'role' => 'user',
                        'content' => $userMessage,
                    ],
                ],
                'temperature' => 0.5,
                'max_tokens' => 700,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';
            }

            Log::error('NVIDIA API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return 'Maaf, terjadi gangguan pada layanan AI. Silakan coba lagi nanti.';
        } catch (\Exception $e) {
            Log::error('NVIDIA API Exception', ['message' => $e->getMessage()]);
            return 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.';
        }
    }
}
