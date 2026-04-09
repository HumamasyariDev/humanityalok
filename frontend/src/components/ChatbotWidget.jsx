import { useState, useRef, useEffect, useCallback } from 'react';
import { FiMessageSquare, FiX, FiSend, FiCpu, FiCamera, FiUpload, FiXCircle } from 'react-icons/fi';
import Barcode from 'react-barcode';
import api from '../lib/api';

const SUGGESTIONS = [
  'Berapa tarif parkir motor?',
  'Ada slot kosong di area mana?',
  'Cek plat B 1234 ABC',
  'Cek struk PKR-000001',
];

// Parking Card component rendered inside chat
function ParkingCard({ data }) {
  const isActive = data.status === 'masuk';

  return (
    <div className="mt-2 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className={`px-3 py-2 text-xs font-semibold text-white flex items-center justify-between ${isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}>
        <span>{isActive ? 'SEDANG PARKIR' : 'SUDAH KELUAR'}</span>
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></span>
      </div>

      {/* Card Body */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div>
            <span className="text-gray-400 block">Kode Parkir</span>
            <span className="font-semibold text-gray-800">{data.kode_parkir}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Plat Nomor</span>
            <span className="font-semibold text-gray-800">{data.plat_nomor}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Jenis</span>
            <span className="text-gray-700">{data.jenis_kendaraan}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Area</span>
            <span className="text-gray-700">{data.area_parkir}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Waktu Masuk</span>
            <span className="text-gray-700">{data.waktu_masuk}</span>
          </div>
          {isActive ? (
            <div>
              <span className="text-gray-400 block">Durasi</span>
              <span className="text-gray-700">{data.durasi}</span>
            </div>
          ) : (
            <div>
              <span className="text-gray-400 block">Waktu Keluar</span>
              <span className="text-gray-700">{data.waktu_keluar}</span>
            </div>
          )}
        </div>

        {/* Cost */}
        <div className={`rounded-lg px-3 py-2 text-center ${isActive ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
          <span className="text-xs text-gray-500 block">{isActive ? 'Estimasi Biaya' : 'Total Biaya'}</span>
          <span className={`text-lg font-bold ${isActive ? 'text-emerald-600' : 'text-gray-800'}`}>
            Rp {(isActive ? data.estimasi_biaya : data.biaya_total)?.toLocaleString('id-ID') || '0'}
          </span>
          {isActive && <span className="text-[10px] text-gray-400 block">* Biaya dapat bertambah</span>}
        </div>

        {/* Barcode */}
        <div className="flex justify-center pt-1 pb-0.5 bg-white rounded-lg">
          <Barcode
            value={data.kode_parkir}
            width={1.2}
            height={35}
            fontSize={10}
            margin={3}
            displayValue={true}
          />
        </div>
      </div>
    </div>
  );
}

// Camera Modal for webcam capture
function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        if (mounted) {
          setError('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.');
        }
      }
    }
    startCamera();
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    onCapture(dataUrl);
  };

  return (
    <div className="absolute inset-0 z-10 bg-black/90 flex flex-col rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-black/50">
        <span className="text-white text-sm font-medium">Scan Struk Parkir</span>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <FiX className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-2">
        {error ? (
          <p className="text-red-400 text-sm text-center px-4">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>
      {!error && (
        <div className="flex justify-center pb-4 pt-2">
          <button
            onClick={capture}
            className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 hover:border-blue-400 transition-all shadow-lg flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Halo! Saya **SmartPark AI Assistant**.\n\nSaya bisa membantu Anda:\n- Cek **estimasi biaya parkir**\n- Cek **ketersediaan slot parkir**\n- Cek **status kendaraan** via plat nomor\n- Cek **struk parkir** via kode PKR\n- **Scan struk** via kamera atau upload gambar\n\nContoh: "Cek plat B 1234 ABC" atau "Cek PKR-000001"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !showCamera) inputRef.current?.focus();
  }, [open, showCamera]);

  // Send text message to chatbot
  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot', { message: msg });
      const assistantMsg = {
        role: 'assistant',
        content: res.data.reply,
      };
      // If parking_data is returned, attach it to the message
      if (res.data.parking_data) {
        assistantMsg.parkingData = res.data.parking_data;
      }
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send image to scan-image endpoint
  const sendImage = useCallback(
    async (dataUrl) => {
      if (loading) return;

      // Show preview in chat
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: 'Scan struk parkir...', imagePreview: dataUrl },
      ]);
      setLoading(true);

      try {
        const res = await api.post('/chatbot/scan-image', { image: dataUrl });
        const assistantMsg = {
          role: 'assistant',
          content: res.data.reply,
        };
        if (res.data.parking_data) {
          assistantMsg.parkingData = res.data.parking_data;
        }
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Maaf, gagal memproses gambar. Pastikan gambar struk terlihat jelas dan coba lagi.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  // Camera capture handler
  const handleCameraCapture = (dataUrl) => {
    setShowCamera(false);
    sendImage(dataUrl);
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Mohon upload file gambar (JPG, PNG, dll).' },
      ]);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ukuran file terlalu besar. Maksimal 5MB.' },
      ]);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      sendImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-like rendering for bold text and lists
  const renderContent = (content) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
          open
            ? 'bg-gray-800 hover:bg-gray-700 rotate-0'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30'
        }`}
      >
        {open ? (
          <FiX className="w-6 h-6 text-white" />
        ) : (
          <FiMessageSquare className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in">
          {/* Camera Modal Overlay */}
          {showCamera && (
            <CameraModal
              onCapture={handleCameraCapture}
              onClose={() => setShowCamera(false)}
            />
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FiCpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">SmartPark AI</h3>
              <p className="text-blue-100 text-xs">Biaya, Slot & Status Kendaraan</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-blue-100 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[300px] bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-md shadow-blue-600/15'
                      : 'bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  {/* Image preview for scanned struks */}
                  {msg.imagePreview && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img
                        src={msg.imagePreview}
                        alt="Struk parkir"
                        className="w-full h-auto max-h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  {renderContent(msg.content)}
                  {/* Parking Card with Barcode */}
                  {msg.parkingData && <ParkingCard data={msg.parkingData} />}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions - only show at start */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 pb-2 pt-1 flex flex-wrap gap-1.5 border-t border-gray-100 bg-white">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              {/* Camera Button */}
              <button
                onClick={() => setShowCamera(true)}
                disabled={loading}
                title="Scan struk via kamera"
                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <FiCamera className="w-4 h-4" />
              </button>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Upload gambar struk"
                className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <FiUpload className="w-4 h-4" />
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pertanyaan..."
                disabled={loading}
                className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all disabled:opacity-50 placeholder:text-gray-400"
              />

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 flex-shrink-0"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
