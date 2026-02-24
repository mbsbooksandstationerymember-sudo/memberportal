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
        }
    };

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
})();
