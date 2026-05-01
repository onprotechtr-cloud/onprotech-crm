"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center px-6 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-2xl mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M6.343 17.657a9 9 0 010-12.728m2.829 9.9a5 5 0 010-7.072M12 12h.01"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Internet Bağlantısı Yok
        </h1>
        <p className="text-slate-400 mb-2">
          Şu anda çevrimdışısınız. Sayfayı görüntülemek için internet
          bağlantınızı kontrol edin.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Bağlantı sağlandığında sayfa otomatik olarak yenilenecektir.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Yeniden Dene
        </button>
        <p className="text-slate-600 text-xs mt-8">ONPROTECH CRM</p>
      </div>
    </div>
  );
}
