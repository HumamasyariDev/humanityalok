<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TarifParkir;
use App\Models\AreaParkir;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

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

        // Gather parking context data from database
        $context = $this->gatherParkingContext();

        // Build system prompt with parking data context
        $systemPrompt = $this->buildSystemPrompt($context);

        // Call NVIDIA AI API
        $aiResponse = $this->callNvidiaApi($systemPrompt, $userMessage);

        return response()->json([
            'success' => true,
            'reply' => $aiResponse,
        ]);
    }

    /**
     * Gather real-time parking data from database
     */
    private function gatherParkingContext(): array
    {
        // Get all tarif data
        $tarifs = TarifParkir::all()->map(function ($tarif) {
            return [
                'jenis_kendaraan' => $tarif->jenis_kendaraan,
                'tarif_per_jam' => (int) $tarif->tarif_per_jam,
            ];
        })->toArray();

        // Get all area parkir with kapasitas
        $areas = AreaParkir::all()->map(function ($area) {
            return [
                'nama_area' => $area->nama_area,
                'kapasitas' => $area->kapasitas,
                'terisi' => $area->terisi,
                'sisa' => $area->kapasitas - $area->terisi,
                'penuh' => $area->terisi >= $area->kapasitas,
            ];
        })->toArray();

        // Get today's stats
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
     * Build system prompt with parking context
     */
    private function buildSystemPrompt(array $context): string
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

        return <<<PROMPT
Kamu adalah SmartPark AI Assistant, chatbot pintar untuk sistem manajemen parkir SmartPark.
Tugasmu adalah membantu pengguna mengecek estimasi biaya parkir dan ketersediaan slot parkir.

DATA TARIF PARKIR SAAT INI:
{$tarifInfo}

DATA AREA PARKIR REAL-TIME:
{$areaInfo}

STATISTIK HARI INI:
- Total transaksi hari ini: {$context['today_transactions']}
- Kendaraan sedang parkir: {$context['currently_parked']}
- Pendapatan hari ini: Rp {$this->formatRupiah($context['today_income'])}

INSTRUKSI:
1. Jawab dalam Bahasa Indonesia yang ramah dan informatif
2. Jika ditanya estimasi biaya, hitung berdasarkan tarif per jam x durasi yang disebutkan user. Pembulatan ke atas per jam.
3. Jika ditanya slot/kapasitas parkir, berikan info real-time dari data area di atas
4. Jika ditanya hal di luar topik parkir, arahkan kembali ke topik parkir dengan sopan
5. Gunakan format yang rapi dan mudah dibaca
6. Jawab dengan singkat dan jelas, maksimal 3-4 kalimat kecuali perlu detail
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
     * Call NVIDIA AI API (OpenAI-compatible)
     */
    private function callNvidiaApi(string $systemPrompt, string $userMessage): string
    {
        $apiKey = config('services.nvidia.api_key');

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://integrate.api.nvidia.com/v1/chat/completions', [
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
                'temperature' => 0.7,
                'max_tokens' => 512,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';
            }

            \Log::error('NVIDIA API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return 'Maaf, terjadi gangguan pada layanan AI. Silakan coba lagi nanti.';
        } catch (\Exception $e) {
            \Log::error('NVIDIA API Exception', ['message' => $e->getMessage()]);
            return 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.';
        }
    }
}
