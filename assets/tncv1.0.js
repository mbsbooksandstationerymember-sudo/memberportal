// Digital MBS - Terms & Conditions v1.0
// Single source of truth for TERMA, SYARAT & PENGESAHAN text (front-end).
// Backend (code.gs) receives the exact text + version via POST (tncEn, tncMy, tncVersion) when user registers.

(function (global) {
    var TNC_EN = 'I agree to participate & abide at MBS Books & Stationery Pahang Pride Discount Card Term & Conditions. I hereby confirm that all my personal information stated above is true and complete. I hereby irrevocably consent and authorized MBS Books & Stationery to process any of my information and to release the same to any related and/or associate company within the MBS Books & Stationery existing of future business partners of strategic alliances and/or any other 3rd party as MBS may in its absolute discretion deem necessary or expedient for the purpose of marketing and promotion of products and services. This shall constitute the consent required under the Personal Data Protection Act 2010.';
    var TNC_MY = 'Saya bersetuju untuk menyertai & mematuhi Terma & Syarat Kad Diskaun MBS Books & Stationery Pahang Pride. Saya dengan ini mengesahkan bahawa semua maklumat peribadi saya yang dinyatakan di atas adalah benar & lengkap. Saya dengan ini memberi kebenaran & kuasa kepada MBS Books & Stationery untuk memproses maklumat saya dan untuk mengeluarkannya kepada mana-mana syarikat berkaitan dan/atau bersekutu dalam MBS Books & Stationery serta rakan kongsi perniagaan atau pakatan strategik semasa atau akan datang dan/atau mana-mana pihak ketiga lain sebagaimana yang difikirkan perlu bagi tujuan pemasaran dan promosi produk serta perkhidmatan. Ini merupakan persetujuan yang diperlukan di bawah Akta Perlindungan Data Peribadi 2010.';

    global.MBS_TNC_V1 = {
        version: '1.0',
        textEn: TNC_EN,
        textMy: TNC_MY,
        modalHtml:
            '<strong>ENGLISH</strong><br>' +
            TNC_EN +
            '<br><br>' +
            '<strong>BAHASA MELAYU</strong><br>' +
            TNC_MY
    };
})(window);