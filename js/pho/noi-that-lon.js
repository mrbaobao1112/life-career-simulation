/* =========================================================
   v16: BÊN TRONG CÁC NƠI LỚN – thư viện, trung tâm thương mại, bến xe khách
   ========================================================= */
/* ----- Thư viện quận: giá sách, bàn đọc; học ở đây tính đúng như “Học thêm” ở nhà ----- */
PHO_ROOMS['in:lib'] = { name:'Thư viện quận', W:480, wall:['#EDE6D6','#D2C6AC'], floor:'floor', fl:['#B8A88E','#A69579'],
  paint:() => PFURN.shelf(90, 70, 100) + PFURN.shelf(170, 70, 100) + PFURN.shelf(390, 70, 100) + OFURN.desk(260, 70, false, '#8C6E54') + FURN.chair(342, 152) + PFURN.sign(240, 20, 'XIN GIỮ TRẬT TỰ', '#2F6FD1'),
  objs:() => [obj('desk', 'act', 'Bàn đọc', '📖', [258, 80, 332, 156], [258, 0, 332, 156], { x:342, y:164, face:true }, { acts:['study','prep','cv','jobs','budget'], act:'act-type', x:342, y:156, face:true, scr:true }),
              obj('shelf', 'minor', 'Giá sách', '📚', [88, 48, 242, 150], [88, 0, 242, 152], { x:166, y:166 }, { minor:'book' })],
  npcs:() => [{ who:'p', x:440, y:152, act:'act-read', look:PASSER(1), label:'Cô thủ thư', left:true }],
};
/* ----- Trung tâm thương mại: cửa hàng quần áo, đồ gia dụng, thang cuốn, quầy thu ngân ----- */
PHO_ROOMS['in:mall'] = { name:'Trung tâm thương mại', W:620, wall:['#F4F6F9','#DCE3EC'], floor:'tiles', fl:['#E3E8EF','#CCD4DE'],
  paint:() => PFURN.rack(90) + PFURN.rack(170) + PFURN.shelf(260, 80, 80) + PFURN.escalator(380) + PFURN.counter(500, 80, '#9D4EDD') + PFURN.sign(130, 30, 'THỜI TRANG', '#E07A5F') + PFURN.sign(300, 30, 'ĐỒ GIA DỤNG', '#2E9E5B') + PFURN.sign(540, 66, 'THU NGÂN', '#9D4EDD'),
  objs:() => [obj('clothes', 'minor', 'Cửa hàng quần áo', '👕', [86, 76, 234, 152], [86, 0, 234, 154], { x:160, y:168 }, { minor:'tryon' }),
              obj('cups', 'minor', 'Đồ gia dụng', '☕', [258, 66, 342, 152], [258, 0, 342, 154], { x:300, y:168 }, { minor:'cups' }),
              obj('cashier', 'act', 'Quầy thu ngân', '🛍️', [496, 94, 584, 152], [496, 0, 584, 154], { x:540, y:168 }, { acts:['shop'], act:'act-talk' })],
  npcs:() => [{ who:'p', x:560, y:150, act:'', look:PASSER(3), label:'Thu ngân', left:true }],
};
/* ----- Bến xe khách: quầy vé (về quê, đi chơi cả ngày), ghế chờ, xe khách ----- */
PHO_ROOMS['in:bus'] = { name:'Bến xe khách', W:520, wall:['#E9EEF4','#C9D2DE'], floor:'tiles', fl:['#C9BCA4','#B9AC94'],
  paint:() => PFURN.booth(90, 'BÁN VÉ') + PFURN.benchSeat(200, 90) + PFURN.bus(330),
  objs:() => [obj('ticket', 'act', 'Quầy vé', '🎫', [88, 66, 162, 152], [88, 0, 162, 154], { x:126, y:166 }, { acts:['trip_home','trip_friend'], act:'act-talk' }),
              obj('bench', 'minor', 'Ghế chờ', '🪑', [196, 110, 294, 156], [198, 0, 292, 150], { x:246, y:168 }, { minor:'wait' })],
  npcs:() => [],
};
/* ----- Cổng phường: không có bên trong, làm giấy tờ ngay ở cổng (việc cả ngày) ----- */
