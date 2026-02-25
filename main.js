/* Digital MBS Member Card - Main app logic */
(function() {
    'use strict';
    var isRendered = false;
    var checkInterval;
    var deferredPrompt;

    function baseUrl() {
        var a = document.createElement('a');
        a.href = '.';
        return a.href;
    }
    function assetPath(name) {
        var base = baseUrl().replace(/\/$/, '');
        return name.indexOf('/') === 0 ? name : base + '/assets/' + name;
    }
    function versionUrl() {
        return baseUrl().replace(/\/$/, '') + '/version.json?t=' + Date.now();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(function(reg) {
            reg.addEventListener('updatefound', function() {
                var newWorker = reg.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', function() {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner(null);
                    }
                });
            });
            if (reg.waiting && navigator.serviceWorker.controller) {
                showUpdateBanner(null);
            }
        }).catch(function(e) { console.warn('SW reg', e); });
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            window._swReload = true;
            location.reload();
        });
    }

    function showUpdateBanner(serverVersion) {
        var banner = document.getElementById('updateBanner');
        var text = document.getElementById('updateBannerText');
        var btn = document.getElementById('updateBtn');
        if (!banner || !btn) return;
        if (text) text.textContent = serverVersion ? 'Versi baru tersedia (v' + serverVersion + ').' : 'Versi baru tersedia.';
        banner.classList.add('show');
        btn.onclick = function() {
            if (serverVersion) localStorage.setItem('mbs_version', serverVersion);
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(function(reg) {
                    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    else location.reload(true);
                });
            } else {
                location.reload(true);
            }
        };
    }

    function checkVersion() {
        fetch(versionUrl()).then(function(res) {
            if (!res.ok) return;
            return res.json();
        }).then(function(data) {
            if (!data || typeof data.version !== 'string') return;
            var serverVersion = data.version.trim();
            var stored = localStorage.getItem('mbs_version');
            if (stored !== null && stored !== serverVersion) {
                showUpdateBanner(serverVersion);
            } else if (stored === null) {
                localStorage.setItem('mbs_version', serverVersion);
            }
        }).catch(function() {});
    }

    function applyBg() {
        var saved = localStorage.getItem('mbs_background');
        var path = saved || assetPath('skin1.webp');
        if (!saved) localStorage.setItem('mbs_background', path);
        var el = document.getElementById('bgLayer');
        if (el) el.style.backgroundImage = "url('" + path + "')";
    }
    document.addEventListener('DOMContentLoaded', applyBg);

    function setBg(num) {
        var path = assetPath('skin' + num + '.webp');
        localStorage.setItem('mbs_background', path);
        var el = document.getElementById('bgLayer');
        if (el) el.style.backgroundImage = "url('" + path + "')";
        closeSkinSelector();
    }
    function openSkinSelector() { document.getElementById('skinModal').classList.add('show'); }
    function closeSkinSelector() { document.getElementById('skinModal').classList.remove('show'); }
    function openNews() { document.getElementById('newsModal').classList.add('show'); }
    function closeNews() { document.getElementById('newsModal').classList.remove('show'); }

    function cardImage(id) {
        var valid = /^\d[\d\s]*\d$/.test(id) && !/[^\d\s]/.test(id) && id.length >= 6;
        if (!valid) return { img: assetPath('png3.webp'), bg: '#334155' };
        if (id.startsWith('3') || id.startsWith('6')) return { img: assetPath('png1.webp'), bg: '#1e3a8a' };
        if (id.startsWith('9')) return { img: assetPath('png2.webp'), bg: '#991b1b' };
        return { img: assetPath('png3.webp'), bg: '#334155' };
    }

    function renderCard(id) {
        var visual = document.getElementById('visualBg');
        var info = cardImage(id);
        if (visual) {
            visual.style.backgroundImage = "url('" + info.img + "')";
            visual.style.backgroundColor = info.bg;
        }
        try {
            if (typeof JsBarcode === 'function') {
                JsBarcode('#barcode', id, { format: 'CODE128', width: 2.5, height: 80, displayValue: true, lineColor: '#000' });
            } else {
                var svg = document.getElementById('barcode');
                if (svg) {
                    svg.setAttribute('viewBox', '0 0 200 80');
                    svg.innerHTML = '<text x="100" y="45" text-anchor="middle" fill="#333" font-size="16" font-weight="bold">' + (id.replace(/</g, '&lt;')) + '</text>';
                }
            }
        } catch (e) { console.warn('Barcode', e); }
        document.getElementById('loadingScreen').classList.add('hide');
        document.getElementById('setupArea').classList.remove('show');
        document.getElementById('cardArea').classList.add('show');
        isRendered = true;
    }

    function startDetection() {
        checkInterval = setInterval(function() {
            if (isRendered) { clearInterval(checkInterval); return; }
            var savedID = localStorage.getItem('mbs_digital_id');
            if (savedID) {
                renderCard(savedID);
                clearInterval(checkInterval);
            } else {
                document.getElementById('loadingScreen').classList.add('hide');
                document.getElementById('setupArea').classList.add('show');
                clearInterval(checkInterval);
            }
        }, 300);
    }

    function activateCard() {
        var input = document.getElementById('memberInput');
        var id = (input && input.value ? input.value : '').trim().toUpperCase();
        if (!id) { alert('Sila masukkan No. Ahli.'); return; }
        localStorage.setItem('mbs_digital_id', id);
        document.getElementById('loadingScreen').classList.remove('hide');
        document.getElementById('setupArea').classList.remove('show');
        document.getElementById('cardArea').classList.remove('show');
        setTimeout(function() { renderCard(id); }, 400);
    }

    function showCard() {
        var id = localStorage.getItem('mbs_digital_id');
        if (id) { renderCard(id); } else { location.reload(); }
    }

    function openDeleteConfirm() {
        var input = document.getElementById('deleteConfirmInput');
        var btn = document.getElementById('confirmDeleteBtn');
        document.getElementById('deleteConfirmModal').classList.add('show');
        if (input) input.value = '';
        if (btn) btn.disabled = true;
        if (input) {
            input.oninput = function() {
                var ok = (input.value || '').trim().toUpperCase() === 'DELETE';
                if (btn) btn.disabled = !ok;
            };
            input.focus();
        }
    }
    function closeDeleteConfirm() {
        document.getElementById('deleteConfirmModal').classList.remove('show');
        var input = document.getElementById('deleteConfirmInput');
        if (input) input.oninput = null;
    }
    function doDelete() {
        var input = document.getElementById('deleteConfirmInput');
        if (!input || (input.value || '').trim().toUpperCase() !== 'DELETE') return;
        localStorage.removeItem('mbs_digital_id');
        isRendered = false;
        document.getElementById('cardArea').classList.remove('show');
        document.getElementById('setupArea').classList.add('show');
        closeDeleteConfirm();
    }

    /* Called by camera.js when barcode is scanned */
    window.MBSApp = {
        onScanSuccess: function(id) {
            if (!id) return;
            localStorage.setItem('mbs_digital_id', id);
            document.getElementById('loadingScreen').classList.remove('hide');
            document.getElementById('setupArea').classList.remove('show');
            document.getElementById('cardArea').classList.remove('show');
            setTimeout(function() { renderCard(id); }, 400);
        },
        onRegisterSuccess: function(cardNo) {
            if (!cardNo) return;
            localStorage.setItem('mbs_digital_id', cardNo);
            isRendered = true;
            closeRegister();
            document.getElementById('tncModal').classList.remove('show');
            renderCard(cardNo);
        }
    };

    var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWu_EnJEJeszS8tWOeACSzg9mlWGHOivWKA70-_7T449Kakqx78CX4jmi_Vf-_Zkw/exec';
    var regSignaturePad = null;
    var regHtml5QrCode = null;

    function openRegister() {
        document.getElementById('setupArea').classList.remove('show');
        document.getElementById('cardArea').classList.remove('show');
        document.getElementById('loadingScreen').classList.add('hide');
        document.getElementById('registerArea').classList.add('show');
    }
    function closeRegister() {
        document.getElementById('registerArea').classList.remove('show');
        if (isRendered) {
            document.getElementById('cardArea').classList.add('show');
        } else {
            document.getElementById('setupArea').classList.add('show');
        }
    }

    function validateRegCardNo(value) {
        var v = (value || '').trim();
        if (!v) return { ok: false, msg: 'Sila imbas no kad.' };
        if (/[a-zA-Z]/.test(v)) return { ok: false, msg: 'No kad tidak sah: mengandungi abjad. Hanya nombor dan ruang dibenarkan.' };
        var normalized = v.replace(/\s/g, '');
        var validPrefixes = ['10', '20', '24', '30', '40', '50', '60', '70', '80', '90'];
        var ok = validPrefixes.some(function(p) { return normalized.indexOf(p) === 0; });
        if (!ok) return { ok: false, msg: 'No kad tidak sah.' };
        return { ok: true };
    }
    function showRegCardNoError(msg) {
        var el = document.getElementById('regCardNoError');
        if (el) { el.textContent = msg || ''; el.style.display = msg ? 'block' : 'none'; }
    }
    function startRegScan() {
        showRegCardNoError('');
        var readerEl = document.getElementById('regReader');
        readerEl.classList.add('show');
        readerEl.innerHTML = '';
        if (regHtml5QrCode) regHtml5QrCode = null;
        regHtml5QrCode = new Html5Qrcode('regReader');
        regHtml5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 120 } },
            function(decodedText) {
                var result = validateRegCardNo(decodedText);
                if (result.ok) {
                    document.getElementById('regCardNo').value = (decodedText || '').trim();
                    showRegCardNoError('');
                } else {
                    document.getElementById('regCardNo').value = '';
                    showRegCardNoError(result.msg);
                    alert(result.msg);
                }
                regHtml5QrCode.stop().then(function() { readerEl.classList.remove('show'); regHtml5QrCode = null; }).catch(function() {});
            }
        ).catch(function(err) { alert('Kamera Error: ' + err); readerEl.classList.remove('show'); });
    }
    function openRegSignatureModal() {
        var cardNo = (document.getElementById('regCardNo').value || '').trim();
        var cardResult = validateRegCardNo(cardNo);
        if (!cardResult.ok) { showRegCardNoError(cardResult.msg); alert(cardResult.msg); return; }
        showRegCardNoError('');
        var form = document.getElementById('regForm');
        if (!form.checkValidity()) return form.reportValidity();
        document.getElementById('agreeTnC').checked = false;
        document.getElementById('btnHantar').disabled = true;
        var canvas = document.getElementById('signature-pad');
        if (!regSignaturePad) {
            regSignaturePad = new SignaturePad(canvas);
            var ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext('2d').scale(ratio, ratio);
        } else regSignaturePad.clear();
        document.getElementById('tncModal').classList.add('show');
    }
    function closeTnCModal() {
        document.getElementById('tncModal').classList.remove('show');
    }
    function clearRegSignature() {
        if (regSignaturePad) regSignaturePad.clear();
    }
    function toggleBtnHantar() {
        var btn = document.getElementById('btnHantar');
        if (btn) btn.disabled = !document.getElementById('agreeTnC').checked;
    }
    async function hantarDanDownload() {
        if (!document.getElementById('agreeTnC').checked) return alert('Sila tandakan "Saya setuju dengan terma dan syarat di atas".');
        if (!regSignaturePad || regSignaturePad.isEmpty()) return alert('Sila turunkan tandatangan!');
        var cardNoVal = (document.getElementById('regCardNo').value || '').trim();
        var cardResult = validateRegCardNo(cardNoVal);
        if (!cardResult.ok) return alert(cardResult.msg);
        document.getElementById('regLoader').classList.add('show');
        var data = {
            type: document.getElementById('regType').value,
            cardNo: cardNoVal,
            nama: (document.getElementById('regNama').value || '').toUpperCase().trim(),
            ic: (document.getElementById('regIc').value || '').trim(),
            phone: (document.getElementById('regPhone').value || '').trim(),
            alamat: (document.getElementById('regAlamat').value || '').toUpperCase().trim(),
            postcode: (document.getElementById('regPostcode').value || '').trim(),
            city: (document.getElementById('regCity').value || '').toUpperCase().trim(),
            state: document.getElementById('regState').value,
            anak: (document.getElementById('regAnak').value || '0'),
            signature: regSignaturePad.toDataURL()
        };
        function finishRegister(successMsg) {
            document.getElementById('regLoader').classList.remove('show');
            closeTnCModal();
            alert(successMsg);
            if (window.MBSApp && typeof window.MBSApp.onRegisterSuccess === 'function') {
                window.MBSApp.onRegisterSuccess(cardNoVal);
            }
        }
        try {
            var JsPDF = window.jspdf && window.jspdf.jsPDF;
            if (JsPDF) {
                var doc = new JsPDF();
                doc.setFontSize(18); doc.setFont('helvetica', 'bold');
                doc.text('MBS BOOKS & STATIONERY', 105, 20, { align: 'center' });
                doc.setFontSize(12); doc.text('PAHANG PRIDE DISCOUNT CARD - REGISTRATION RECEIPT', 105, 28, { align: 'center' });
                doc.line(20, 32, 190, 32);
                doc.setFontSize(11); doc.setFont('helvetica', 'normal');
                var y = 45;
                var info = [['JENIS MEMBER', data.type], ['NO KAD', data.cardNo], ['NAMA PENUH', data.nama], ['NO IC', data.ic], ['HANDPHONE', data.phone], ['ALAMAT', data.alamat], ['POSTCODE', data.postcode], ['CITY', data.city], ['STATE', data.state], ['BIL ANAK', data.anak]];
                info.forEach(function(item) {
                    doc.setFont('helvetica', 'bold'); doc.text(item[0] + ':', 25, y);
                    doc.setFont('helvetica', 'normal'); doc.text(String(item[1]), 75, y);
                    y += 9;
                });
                y += 8;
                doc.setFontSize(9); doc.setFont('helvetica', 'bold');
                doc.text('PENGAKUAN & SYARAT / CONFIRMATION & PDPA CONSENT', 25, y);
                y += 5; doc.setFont('helvetica', 'normal');
                var tncMsg = 'I hereby confirm that all my personal information stated above is true and complete. I authorize MBS Books & Stationery to process my information under the Personal Data Protection Act 2010 for marketing and services purposes.';
                doc.text(doc.splitTextToSize(tncMsg, 160), 25, y);
                y += 14; doc.text('Saya setuju / I agree with the terms and conditions above.', 25, y);
                y += 8; doc.setFont('helvetica', 'bold'); doc.text('TANDATANGAN / SIGNATURE', 25, y);
                doc.addImage(data.signature, 'PNG', 25, y + 2, 50, 25);
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
                doc.text('Tarikh: ' + new Date().toLocaleDateString('ms-MY'), 25, y + 32);
                doc.save('MBS_REG_' + data.cardNo + '.pdf');
            }
            await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
            finishRegister('PENDAFTARAN BERJAYA! No kad telah disimpan ke kad digital anda.');
        } catch (err) {
            console.error(err);
            finishRegister('Berjaya menghantar. Jika PDF tidak dimuat turun, sila hubungi petugas. No kad telah disimpan.');
        }
    }

    window.onload = function() {
        var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        var banner = document.getElementById('installBanner');
        var installBtn = document.getElementById('installBtn');
        var installText = document.getElementById('installText');

        if (!standalone && !isIOS) {
            window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                deferredPrompt = e;
                if (banner) banner.classList.add('show');
                if (installText) installText.textContent = 'Pasang aplikasi untuk guna offline';
            });
            if (installBtn) {
                installBtn.onclick = function() {
                    if (!deferredPrompt) return;
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function(choice) {
                        if (choice.outcome === 'accepted' && banner) banner.classList.remove('show');
                        deferredPrompt = null;
                    });
                };
            }
        } else if (isIOS && !standalone) {
            if (banner) banner.classList.add('show');
            if (installText) installText.innerHTML = 'Tekan <b>Share</b> lalu pilih <b>Add to Home Screen</b>';
            if (installBtn) installBtn.style.display = 'none';
        }
        startDetection();
        checkVersion();
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') checkVersion();
        });
    };

    window.activateCard = activateCard;
    window.showCard = showCard;
    window.openNews = openNews;
    window.closeNews = closeNews;
    window.openSkinSelector = openSkinSelector;
    window.closeSkinSelector = closeSkinSelector;
    window.setBg = setBg;
    window.openDeleteConfirm = openDeleteConfirm;
    window.closeDeleteConfirm = closeDeleteConfirm;
    window.doDelete = doDelete;
    window.openRegister = openRegister;
    window.closeRegister = closeRegister;
    window.openRegSignatureModal = openRegSignatureModal;
    window.closeTnCModal = closeTnCModal;
    window.clearRegSignature = clearRegSignature;
    window.startRegScan = startRegScan;
    window.toggleBtnHantar = toggleBtnHantar;
    window.hantarDanDownload = hantarDanDownload;
})();

