/* =========================================================
   v16: HỒ BÁN NGUYỆT – đường quanh hồ, ghế đá, các cô chú tập dưỡng sinh
   Chạy bộ thật: nhấn E ở cột “Xuất phát”, chạy đến cột “Quay đầu” rồi về lại cột xuất phát
   thì tính là lựa chọn “Chạy bộ quanh hồ” có sẵn (chỉ số y như bấm nút).
   ========================================================= */
const HO = { START:110, TURN:860, NEAR:30 };
PHO_ROOMS['in:lake'] = { name:'Hồ Bán Nguyệt', W:960, wall:['#BFE0FF','#A9CFF0'], floor:'tiles', fl:['#D9CDB8','#C9BCA4'], exitName:'Ra phố',
  paint:() => `<rect x="0" y="0" width="960" height="70" class="w-sky" fill="#BFE0FF"/>` + PFURN.water(0, 960) + PFURN.tree(200, 110) + PFURN.tree(420, 100) + PFURN.tree(640, 120) + PFURN.tree(900, 100)
    + PFURN.benchSeat(300, 70) + PFURN.benchSeat(560, 70) + PFURN.post(HO.START, 'XUẤT PHÁT') + PFURN.post(HO.TURN, 'QUAY ĐẦU'),
  objs:() => [obj('start', 'lap', 'Cột xuất phát', '🏃', [HO.START - 26, 88, HO.START + 26, 146], null, { x:HO.START, y:172 }, { acts:['run'] }),
              obj('bench', 'minor', 'Ghế đá', '🪑', [296, 110, 374, 156], null, { x:336, y:170 }, { minor:'lakeView' })],
  npcs:() => [],                 // người chạy bộ, đi dạo, nhóm tập dưỡng sinh: do dân số theo giờ đưa đến (song/dan-so.js)
};
// Bắt đầu chạy một vòng: đánh dấu, rồi theo dõi trong vòng lặp (hoFrame)
function hoStart(W, api){
  W.lap = { stage:0 }; api.say(api.me, 'Chạy thôi! Đến cột “Quay đầu” rồi về đây.', 2200);
}
function hoFrame(W, api){
  const L = W.lap; if (!L || W.busy) return;
  if (L.stage === 0 && W.me.x >= HO.TURN - HO.NEAR) { L.stage = 1; api.say(api.me, 'Quay đầu! Còn nửa vòng nữa.', 1600); SFX.play('pop'); }
  else if (L.stage === 1 && W.me.x <= HO.START + HO.NEAR) {
    W.lap = null; const i = W.sc.choices.findIndex(c => c.actId === 'run'); if (i < 0) return;
    W.busy = true; api.C.react(W.me, 'cheer'); SFX.play('hop');
    (async () => { if (!await api.wait(api.C.still ? 0 : 700)) return; await api.spin(W.end, ROAM.ACT_MS); if (!api.alive()) return; api.commit(W.sc.choices[i], '🏃 Chạy hết một vòng hồ.'); })();
  }
}
