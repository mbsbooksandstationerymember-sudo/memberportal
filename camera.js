/* Digital MBS Member Card - Camera / barcode scan (back camera only) */
(function() {
    'use strict';
    var barcodeScanner = null;

    function openScanModal() {
        var modal = document.getElementById('scanModal');
        var readerEl = document.getElementById('barcodeReader');
        if (!modal || !readerEl) return;
        modal.classList.add('show');
        if (typeof Html5Qrcode === 'undefined') {
            alert('Pustaka pengimbas tidak dimuat. Sila pastikan anda dalam talian.');
            closeScanModal();
            return;
        }
        readerEl.innerHTML = '';
        barcodeScanner = new Html5Qrcode('barcodeReader');
        barcodeScanner.start(
            { facingMode: 'environment' },
            { fps: 8, qrbox: { width: 250, height: 100 } },
            function(decodedText) {
                if (!barcodeScanner) return;
                barcodeScanner.stop().then(function() {
                    barcodeScanner = null;
                    closeScanModal();
                    var id = (decodedText || '').trim().toUpperCase();
                    if (id && window.MBSApp && typeof window.MBSApp.onScanSuccess === 'function') {
                        window.MBSApp.onScanSuccess(id);
                    }
                }).catch(function() {});
            },
            function() {}
        ).catch(function(err) {
            alert('Tidak dapat membuka kamera belakang: ' + (err.message || err));
            closeScanModal();
        });
    }

    function closeScanModal() {
        var modal = document.getElementById('scanModal');
        if (modal) modal.classList.remove('show');
        if (barcodeScanner) {
            barcodeScanner.stop().then(function() { barcodeScanner = null; }).catch(function() { barcodeScanner = null; });
        }
    }

    window.openScanModal = openScanModal;
    window.closeScanModal = closeScanModal;
})();
