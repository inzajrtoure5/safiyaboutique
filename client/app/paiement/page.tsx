'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';



function PaiementContent() {
  const searchParams = useSearchParams();
  const total = searchParams.get('total');
  const [qrCode, setQrCode] = useState<string>('');
  const [lienPaiement, setLienPaiement] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasMerchantCode, setHasMerchantCode] = useState(false);

  useEffect(() => {
    if (total) {
      setLoading(true);
      // Générer le lien de paiement WAVE
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${baseUrl}/api/wave/generer-paiement?montant=${total}`)
        .then(res => res.json())
        .then(data => {
          if (data.lien) setLienPaiement(data.lien);
          if (data.qrCode) setQrCode(data.qrCode);
          if (data.merchantCode) setHasMerchantCode(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors de la génération du paiement:', err);
          // Fallback si l'API n'est pas disponible
          setLienPaiement(`https://wave.com/pay?amount=${total}`);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [total]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-6 py-8 md:py-12">
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-4 md:p-6 lg:p-8 max-w-md w-full">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="luxury-title text-2xl md:text-3xl text-[#1A1A1A] mb-2 font-light">Paiement WAVE</h1>
          <div className="mt-4 md:mt-6">
            <p className="luxury-title text-3xl md:text-4xl font-light text-[#1A1A1A] mb-2">
              {total ? parseInt(total).toLocaleString() : '0'} FCFA
            </p>
            <p className="luxury-text text-[#8B7355] font-light">Montant à payer</p>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A1A1A]"></div>
            <p className="luxury-text text-[#8B7355] mt-4 font-light">Génération du paiement...</p>
          </div>
        ) : (
          <>
            {qrCode && hasMerchantCode && (
              <div className="mb-6 flex flex-col items-center">
                <p className="luxury-text text-sm text-[#8B7355] mb-3 text-center font-light">
                  Scannez le QR code avec votre application WAVE
                </p>
                <div className="bg-white p-3 md:p-4 rounded-sm shadow-sm border border-[#E5E5E5]">
                  <img src={qrCode} alt="QR Code WAVE" className="w-48 h-48 md:w-64 md:h-64 mx-auto" />
                </div>
              </div>
            )}
            
            {lienPaiement && (
              <div className="mb-6">
                <a
                  href={lienPaiement}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#1A1A1A] text-white py-4 px-6 rounded-sm hover:bg-[#2A2A2A] transition-all duration-300 text-center font-medium text-sm uppercase tracking-wider"
                >
                  Payer avec WAVE
                </a>
              </div>
            )}
            
            {!qrCode && !lienPaiement && (
              <div className="text-center py-8">
                <p className="luxury-text text-[#8B7355] mb-4 font-light">
                  Impossible de générer le paiement. Veuillez réessayer plus tard.
                </p>
                <Link
                  href="/panier"
                  className="inline-block luxury-text text-sm uppercase tracking-wider bg-[#1A1A1A] text-white px-6 py-3 rounded-sm hover:bg-[#2A2A2A] transition-all duration-300"
                >
                  Retour au panier
                </Link>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link
                href="/panier"
                className="luxury-text text-sm text-[#8B7355] hover:text-[#1A1A1A] transition-colors font-light"
              >
                ← Retour au panier
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaiementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A1A1A]"></div>
          <p className="luxury-text text-[#8B7355] mt-4 font-light">Chargement...</p>
        </div>
      </div>
    }>
      <PaiementContent />
    </Suspense>
  );
}
