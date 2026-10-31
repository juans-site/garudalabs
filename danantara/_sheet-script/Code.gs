/** Garuda Labs – simpan koreksi sentimen dari dashboard ke Google Sheet.
 *  Pasang: Extensions > Apps Script > tempel file ini > Deploy > New deployment > Web app
 *  Execute as: Me · Who has access: Anyone  → salin URL /exec ke dashboard (app.js: SHEET_WRITE_URL).
 */
const KUNCI = 'garuda-danantara-2026';               // samakan dengan SHEET_WRITE_KEY di app.js
const TAB_OK = ['Data Bersih', 'Komentar'];
const NILAI_OK = ['Positif', 'Negatif', 'Netral'];

function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents || '{}');
    if (b.key !== KUNCI) return out({ ok: false, error: 'Kunci salah' });
    if (!TAB_OK.includes(b.tab)) return out({ ok: false, error: 'Tab tidak dikenal' });
    const sh = SpreadsheetApp.getActive().getSheetByName(b.tab);
    const data = sh.getDataRange().getValues(), head = data[0];
    const cNo = head.indexOf('No'), cSent = head.indexOf('Sentimen'), cCat = head.indexOf('Catatan Klasifikasi');
    if (cNo < 0 || cSent < 0) return out({ ok: false, error: 'Kolom No/Sentimen tidak ditemukan' });
    const idx = {}; for (let i = 1; i < data.length; i++) idx[String(data[i][cNo])] = i + 1;
    let n = 0; const lock = LockService.getScriptLock(); lock.waitLock(10000);
    (b.rows || []).slice(0, 500).forEach(r => {
      const row = idx[String(r.no)], v = NILAI_OK.find(x => x.toLowerCase() === String(r.sentimen || '').toLowerCase());
      if (!row || !v) return;
      sh.getRange(row, cSent + 1).setValue(v);
      if (cCat >= 0) sh.getRange(row, cCat + 1).setValue('Manual (dashboard) ' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm'));
      n++;
    });
    lock.releaseLock();
    return out({ ok: true, updated: n });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
