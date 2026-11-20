/* =========================================================
   v17.5 – PHASE 4: CHUYỆN TỰ NẢY SINH (số liệu và câu chữ; cách chạy ở song/cau-chuyen.js)
   Không phải kịch bản cố định: mỗi chuyện chỉ bắt đầu khi các hệ thống sẵn có đủ điều kiện
   (trí nhớ NPC, quan hệ, sự kiện thế giới, lịch sinh hoạt), và diễn biến theo lựa chọn của bạn.
   - linh: gặp Linh, nói chuyện vui (Linh nhớ) và đủ thân → vài hôm sau Linh nhắn rủ đi thư viện → nhận / từ chối / lờ đi
           → nhận thì chiều hôm hẹn Linh đợi ở Thư viện quận → học cùng → Linh nhớ và nhắc lại sau này. Không đến thì Linh buồn.
   - lanh: hai đồng nghiệp tranh luận (sự kiện thế giới) → hôm sau giận, ít sang bàn nhau, không chào hỏi
           → một hôm có việc chung ở chỗ họp → nói chuyện, làm lành → nhớ và nhắc lại khi chào nhau.
   Thêm chuyện mới: thêm số liệu và câu ở đây, thêm một mục vào bảng CC_STORIES (song/cau-chuyen.js).
   ========================================================= */
const CC = {
  ON:true,                   // tắt (false) thì không có chuyện tự nảy sinh nào (mọi thứ như trước)
  LINH:{
    REL:58,                  // Linh thân với bạn từ mức này trở lên mới rủ
    NHO:5,                   // trong chừng này ngày gần đây phải có lần gặp, nói chuyện vui với Linh
    CD:12,                   // xong một lần (dù nhận hay không) thì chừng này ngày sau mới có thể rủ lại
    CHO:[1, 2],              // từ lúc đủ điều kiện, chừng này ngày sau Linh mới nhắn (không nhắn ngay)
    XA:6,                    // ngày hẹn phải trong vòng chừng này ngày tới (có việc thì hẹn ngày nghỉ)
    NHAN:2, LO:-3, LO_TIN:-1,// nhận lời: quan hệ +; hẹn rồi không đến: −; lờ tin nhắn: −
  },
  LANH:{
    GIAM:3,                  // hôm sau trận tranh luận: hai người nhạt đi thêm chừng này (ngoài mức giảm sẵn có)
    GIAN:1,                  // giận ít nhất chừng này ngày (không sang bàn nhau, không chào)
    LEN:5,                   // làm lành: thân lại chừng này
    HET:4,                   // quá chừng này ngày mà chưa có dịp gặp (nghỉ, cuối tuần) thì tự nguôi
    P:.7,                    // trong giờ làm, mỗi lần cân nhắc sự kiện, khả năng có việc chung để làm lành
  },
};
const CC_LOI = {
  linh:{
    ly:{ hangout:'Hôm trước đi cà phê với mày vui ghê.', ht:'Hôm trước gặp mày nói chuyện vui ghê.', '*':'Dạo này gặp mày vui ghê.' },   // lý do Linh nhắn (theo chuyện Linh nhớ)
    moi:(ngay) => `${ngay} rảnh không? Chiều ra Thư viện quận học cùng tao nhé 📚`,
    nhan:['Đi chứ! Tao mang laptop.', 'Ok, tao đi!'], tu_choi:['Hôm đó tao bận mất rồi 😅'],
    dap_nhan:(ngay) => `Chốt! Chiều ${ngay}, tao đợi ở thư viện nhé.`, dap_tu_choi:'Ừ không sao, hôm khác nhé.',
    lo_tin:'Chắc mày bận. Thôi để hôm khác vậy.',
    lo_hen:'Chiều nay tao đợi ở thư viện mãi không thấy mày 😕',
    hen_note:'Hẹn Linh chiều nay ở Thư viện quận.',
    gap:'Đây rồi! Ngồi đây, tao giữ chỗ cho mày.',
  },
  lanh:{
    viec:{ dung:'Anh Dũng', mai:'Chị Mai', phong:'Phong' },
    goi:(a, b) => `${a}, ${b} ra đây xem chung phần này nhé.`,
    noi:[['Vụ hôm trước… tôi nói hơi nặng lời.', 'Tôi cũng thế. Làm cùng nhau tiếp nhé.', 'Ừ. Phần này chia đôi.'],
         ['Hôm trước căng quá nhỉ.', 'Ừ, nghĩ lại thì cách của ông cũng hợp lý.', 'Thôi, xong việc này đi uống trà đá.']],
  },
};
// Cảnh học cùng Linh ở thư viện
SC.cc_hoc = () => ({ icon:'📚', title:'Học cùng Linh ở thư viện', bg:'library', npc:'linh', html:'',
  talk:[{ w:'linh', t:'“Tao ôn chương 2, mày học gì thì học. Một tiếng rồi nghỉ năm phút nhé.”' }, { w:'me', t:'“Chốt. Ai cầm điện thoại trước thì bao trà sữa.”' }],
  choices:[
    { icon:'🤓', label:'Học nghiêm túc đến khi thư viện đóng cửa', hints:['🧠 +2', '⚡ −8'], fx:() => { S.tech += 2; S.energy -= 8; rel('linh', 5); ccLinhXong(); S.queue = S.queue.filter(r => r.id !== 'activity');
      return { text:'Hai tiếng không ai đụng vào điện thoại. Lúc về Linh bảo: “Lâu lắm rồi tao mới học vào thế này.”', bg:'library', npc:'linh', npcExpr:'happy' }; } },
    { icon:'🌳', label:'Học một lúc rồi rủ Linh ra hồ đi dạo', hints:['🙂 +5'], fx:() => { S.mood += 5; rel('linh', 6); ccLinhXong(); S.queue = S.queue.filter(r => r.id !== 'activity');
      return { text:'Học được một tiếng thì hai đứa ra hồ. Linh kể chuyện luận văn, bạn kể chuyện công việc. Gió hồ mát.', bg:'lake', npc:'linh', npcExpr:'happy' }; } },
  ] });
// Linh nhớ buổi thư viện (nhắc lại khi gặp, hoặc khi bạn bắt chuyện)
Object.assign(MEM_LINES, { cc_thuvien:{ pos:{ linh:['Hôm trước học ở thư viện hiệu quả ghê, tuần sau đi tiếp nhé!', 'Nhờ hôm học cùng mày mà tao xong chương 2 rồi đấy.'] },
                                        neg:{ linh:['Hôm trước mày cho tao leo cây ở thư viện đấy nhé.'] } } });
// Hai đồng nghiệp nhớ hôm làm lành (lần chào nhau sau đó)
Object.assign(MEM_NPC, { lamlanh:[['Hôm trước làm chung ăn ý đấy nhỉ.', 'Ừ, lần sau cứ thế.'], ['Phần chia đôi hôm trước chạy ngon rồi.', 'Thế là ổn.']] });
// Bắt chuyện (bộ ghép hội thoại Phase 1): nhắc chuyện đang diễn ra
HT.push(
  { who:'linh', g:'cuocsong', when:() => typeof ccLinhDaHoc === 'function' && ccLinhDaHoc(), say:['Hôm học ở thư viện vui ghê.', 'Ừ, lần sau đi tiếp.', 'Mày nhớ mang sạc nhé, hôm trước tao hết pin.'] },
  { who:'mai', g:'congviec', at:'office', when:() => typeof ccGian === 'function' && ccGian('mai'), say:['Hôm qua chị với người ta to tiếng quá…', 'Chuyện công việc thôi chị ạ.', 'Ừ. Để chị tìm dịp nói chuyện lại.'] },
  { who:'dung', g:'congviec', at:'office', when:() => typeof ccGian === 'function' && ccGian('dung'), say:['Hôm qua anh hơi nóng.', 'Ai cũng có lúc thế mà anh.', 'Ừ. Mai anh sang nói chuyện lại.'] },
  { who:'phong', g:'congviec', at:'office', when:() => typeof ccGian === 'function' && ccGian('phong'), say:['Hôm qua tôi lỡ cãi nhau một trận.', 'Rồi sẽ ổn thôi.', 'Mong thế…'] },
);
