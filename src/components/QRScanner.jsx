import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const qrRegionId = 'qr-reader';

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          console.log("✅ QR Scanned:", decodedText);
          if (onScan) onScan(decodedText);

          // ✅ Do NOT stop the scanner immediately here
          // Let the parent component decide what to do
        },
        (err) => {
          // Silent errors while scanning
        }
      )
      .then(() => {
        isRunningRef.current = true;
      })
      .catch((err) => {
        console.error('❌ Scanner failed to start:', err);
      });

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            isRunningRef.current = false;
            return scannerRef.current.clear();
          })
          .catch((err) => {
            console.warn('❌ Cleanup error:', err);
          });
      }
    };
  }, [onScan]);

  return <div id={qrRegionId} style={{ width: '250px', margin: 'auto' }} />;
};

export default QRScanner;
