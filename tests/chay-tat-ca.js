// Chạy tất cả bộ kiểm thử và phân loại kết quả thật rõ (v17.6):
//   ✅ ĐẠT        đã chạy, có kiểm tra, không kiểm tra nào hỏng
//   ❌ KHÔNG ĐẠT  đã chạy nhưng có kiểm tra hỏng, bị lỗi, hoặc quá giờ
//   ⏭️ SKIP       không chạy được vì thiếu môi trường (ví dụ thiếu Playwright). KHÔNG tính là đạt.
//   ⬜ CHƯA CHẠY  không được chọn để chạy lần này
//   📊 BÁO CÁO    bộ chỉ in số liệu cân bằng để người đọc, không có tiêu chí đạt/không đạt (chạy xong không lỗi)
// Dùng:  npm test                      (tất cả, 3 luồng song song)
//        node chay-tat-ca.js --luong=1   (một luồng: chậm hơn nhưng số đo thời gian chính xác hơn)
//        node chay-tat-ca.js tri-nho cau-chuyen   (chỉ vài bộ; các bộ khác ghi là CHƯA CHẠY)
// Kết quả: in bảng, và ghi tests/ket-qua/tong-hop.md, tong-hop.json, nhật ký từng bộ trong tests/ket-qua/log/.
// Mã thoát: 0 khi mọi bộ được chọn đều ĐẠT (hoặc BÁO CÁO chạy xong); 1 nếu có KHÔNG ĐẠT hoặc SKIP.
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');

// tên (npm run …), file, cách chạy, có cần trình duyệt không, loại: kt = có kiểm tra đạt/không đạt; bc = chỉ báo cáo
const BO = [
  ['he-thong', 'kiem-thu-he-thong.js', [], 0, 'kt'],
  ['tai-chinh', 'kiem-thu-tai-chinh.js', [], 0, 'kt'],
  ['56-ngay', 'kiem-thu-56-ngay.js', [], 0, 'kt'],
  ['ngau-nhien', 'choi-ngau-nhien.js', ['40'], 0, 'kt', ['--max-old-space-size=6144']],
  ['luu-tai', 'kiem-thu-luu-tai.js', [], 0, 'kt', ['--max-old-space-size=4096']],
  ['phat-trien', 'kiem-thu-phat-trien.js', [], 0, 'kt', ['--max-old-space-size=4096']],
  ['can-bang', 'can-bang-chien-luoc.js', [], 0, 'bc'],
  ['hai-thang', 'mo-phong-hai-thang.js', [], 0, 'bc'],
  ['van-phong', 'kiem-thu-van-phong.js', [], 1, 'kt'],
  ['mo-dau', 'kiem-thu-mo-dau.js', [], 1, 'kt'],
  ['the-gioi', 'kiem-thu-the-gioi.js', [], 1, 'kt'],
  ['van-phong-di-lai', 'kiem-thu-van-phong-di-lai.js', [], 1, 'kt'],
  ['ra-pho', 'kiem-thu-ra-pho.js', [], 1, 'kt'],
  ['the-gioi-song', 'kiem-thu-the-gioi-song.js', [], 1, 'kt'],
  ['xa-giao', 'kiem-thu-xa-giao.js', [], 1, 'kt'],
  ['thanh-pho', 'kiem-thu-thanh-pho.js', [], 1, 'kt'],
  ['tri-nho', 'kiem-thu-tri-nho.js', [], 1, 'kt'],
  ['sua-loi-17-4', 'kiem-thu-sua-loi-17-4.js', [], 1, 'kt'],
  ['hoi-thoai', 'kiem-thu-hoi-thoai.js', [], 1, 'kt'],
  ['quan-song', 'kiem-thu-quan-song.js', [], 1, 'kt'],
  ['gia-dinh-cong-viec', 'kiem-thu-gia-dinh-cong-viec.js', [], 1, 'kt'],
  ['cau-chuyen', 'kiem-thu-cau-chuyen.js', [], 1, 'kt'],
  ['npc-on-dinh', 'kiem-thu-npc-on-dinh.js', [], 1, 'kt'],
  ['hieu-nang', 'kiem-thu-hieu-nang.js', [], 1, 'kt'],
];
const RIENG = ['hieu-nang'];           // đo hiệu năng: chạy một mình sau cùng, khi các bộ khác đã xong (máy rảnh thì số đo mới đúng)
const QUA_GIO = 25 * 60 * 1000;           // một bộ chạy quá chừng này thì dừng và tính là KHÔNG ĐẠT

const args = process.argv.slice(2), luong = +((args.find(a => a.startsWith('--luong=')) || '--luong=3').split('=')[1]) || 3;
const chon = args.filter(a => !a.startsWith('--'));
const sai = chon.filter(c => !BO.some(b => b[0] === c)); if (sai.length) { console.log('Không có bộ: ' + sai.join(', ')); process.exit(1); }
const KQ = path.join(__dirname, 'ket-qua'), LOG = path.join(KQ, 'log'); fs.mkdirSync(LOG, { recursive:true });

function chay([ten, file, a, , loai, node = []]){
  return new Promise(res => {
    const t0 = Date.now(), out = fs.createWriteStream(path.join(LOG, ten + '.log'));
    const env = { ...process.env }; delete env.NODE_PATH;                 // chỉ dùng thư viện cài trong tests/ (npm install), để biết máy thật có thiếu gì không
    const p = spawn(process.execPath, [...node, file, ...a], { cwd:__dirname, env });
    let text = '', quaGio = false;
    const t = setTimeout(() => { quaGio = true; p.kill('SIGKILL'); }, QUA_GIO);
    const nhan = d => { text += d; out.write(d); }; p.stdout.on('data', nhan); p.stderr.on('data', nhan);
    p.on('close', code => {
      clearTimeout(t); out.end();
      const dat = (text.match(/^✅/gm) || []).length, hong = (text.match(/^❌/gm) || []).length, giay = Math.round((Date.now() - t0) / 1000);
      let kq;
      if (quaGio) kq = 'KHÔNG ĐẠT';
      else if (code === 3) kq = 'SKIP';
      else if (code !== 0 || hong) kq = 'KHÔNG ĐẠT';
      else if (loai === 'bc') kq = 'BÁO CÁO';
      else kq = dat ? 'ĐẠT' : 'KHÔNG ĐẠT';                                // bộ có kiểm tra mà không in kiểm tra nào: coi là hỏng
      const ghiChu = quaGio ? `quá ${QUA_GIO / 60000} phút` : code === 3 ? (text.match(/SKIP: (.*)/) || [, ''])[1] : code !== 0 ? `mã thoát ${code}` : loai === 'kt' && !dat ? 'không có kiểm tra nào chạy' : '';
      const loi = (text.match(/^❌.*$/gm) || []).slice(0, 5);
      console.log(`${{ 'ĐẠT':'✅', 'KHÔNG ĐẠT':'❌', SKIP:'⏭️', 'BÁO CÁO':'📊' }[kq]} ${ten.padEnd(20)} ${kq.padEnd(10)} ${String(dat).padStart(4)} đạt ${String(hong).padStart(3)} hỏng ${String(giay).padStart(5)} giây ${ghiChu}`);
      res({ ten, file, loai, kq, dat, hong, giay, ghiChu, loi });
    });
  });
}

(async () => {
  const lam = BO.filter(b => !chon.length || chon.includes(b[0]));
  console.log(`Chạy ${lam.length} bộ, ${luong} luồng song song (Node ${process.version})\n`);
    const hang = lam.filter(b => !RIENG.includes(b[0])), kq = [];
  await Promise.all(Array.from({ length:luong }, async () => { while (hang.length) kq.push(await chay(hang.shift())); }));
  for (const b of lam.filter(b => RIENG.includes(b[0]))) kq.push(await chay(b));
  const theoTen = Object.fromEntries(kq.map(r => [r.ten, r]));
  const tat = BO.map(b => theoTen[b[0]] || { ten:b[0], file:b[1], loai:b[4], kq:'CHƯA CHẠY', dat:0, hong:0, giay:0, ghiChu:'không được chọn lần này', loi:[] });
  const dem = k => tat.filter(r => r.kq === k).length;
  const tong = { luc:new Date().toISOString(), node:process.version, luong, 'ĐẠT':dem('ĐẠT'), 'KHÔNG ĐẠT':dem('KHÔNG ĐẠT'), SKIP:dem('SKIP'), 'CHƯA CHẠY':dem('CHƯA CHẠY'), 'BÁO CÁO':dem('BÁO CÁO'),
    kiemTraDat:tat.reduce((n, r) => n + r.dat, 0), kiemTraHong:tat.reduce((n, r) => n + r.hong, 0) };
  fs.writeFileSync(path.join(KQ, 'tong-hop.json'), JSON.stringify({ tong, bo:tat }, null, 1));
  const md = [`# Kết quả kiểm thử (${tong.luc})`, '', `Node ${tong.node}, ${luong} luồng. ĐẠT ${tong['ĐẠT']} · KHÔNG ĐẠT ${tong['KHÔNG ĐẠT']} · SKIP ${tong.SKIP} · CHƯA CHẠY ${tong['CHƯA CHẠY']} · BÁO CÁO ${tong['BÁO CÁO']} · ${tong.kiemTraDat} kiểm tra đạt, ${tong.kiemTraHong} kiểm tra hỏng`, '',
    '| Bộ | Kết quả | Đạt | Hỏng | Giây | Ghi chú |', '|---|---|---|---|---|---|', ...tat.map(r => `| ${r.ten} | ${r.kq} | ${r.dat} | ${r.hong} | ${r.giay} | ${[r.ghiChu, ...r.loi].filter(Boolean).join('<br>')} |`)];
  fs.writeFileSync(path.join(KQ, 'tong-hop.md'), md.join('\n') + '\n');
  console.log(`\nTỔNG: ✅ ĐẠT ${tong['ĐẠT']} · ❌ KHÔNG ĐẠT ${tong['KHÔNG ĐẠT']} · ⏭️ SKIP ${tong.SKIP} · ⬜ CHƯA CHẠY ${tong['CHƯA CHẠY']} · 📊 BÁO CÁO ${tong['BÁO CÁO']}`);
  console.log(`${tong.kiemTraDat} kiểm tra đạt, ${tong.kiemTraHong} kiểm tra hỏng. Chi tiết: tests/ket-qua/tong-hop.md`);
  process.exit(tong['KHÔNG ĐẠT'] || tong.SKIP ? 1 : 0);
})();
