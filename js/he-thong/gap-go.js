/* =========================================================
   GẶP GỠ CHỦ ĐỘNG: rủ ai đó đi chơi, câu chuyện hé lộ dần theo độ thân
   ========================================================= */
const HANG = {
  tung: { place:'sidewalk', cost:20000, where:'Trà đá vỉa hè', list:[
    { need:0, lines:[['tung','“Tao vừa nghĩ ra kế hoạch làm giàu mới: nuôi ốc.”'],['me','“Lần trước là nuôi dế mà?”'],['tung','“Dế là quá khứ. Ốc mới là tương lai.”']],
      choices:[ { icon:'😂', label:'Ủng hộ hết mình (đùa thôi)', fx:() => { rel('tung',6); S.mood += 6; }, text:'Hai đứa vẽ “đế chế ốc” lên giấy ăn. Tờ giấy ăn sau đó được dùng để lau bàn.' },
                { icon:'🤔', label:'Hỏi nghiêm túc về kế hoạch', fx:() => { rel('tung',5); S.soft += 1; }, text:'Tùng nghĩ một lúc rồi bảo: “Thật ra tao chỉ muốn làm gì đó của riêng mình.” Một câu nghiêm túc hiếm hoi.' } ] },
    { need:64, lines:[['tung','“Mày có bao giờ thấy mình đang tụt lại không?”'],['me','“Sao tự nhiên hỏi thế?”'],['tung','“Hôm qua thằng lớp trưởng khoe lên trưởng nhóm. Tao thì vẫn đang nuôi ốc… trong đầu.”']],
      choices:[ { icon:'🫂', label:'Bảo Tùng ai cũng có nhịp riêng', fx:() => { rel('tung',8); S.mood += 3; }, text:'Tùng cười, vỗ vai bạn: “Mày nói nghe như sách tự lực, nhưng tao thích.”' },
                { icon:'💻', label:'Rủ Tùng cùng học lập trình', fx:() => { rel('tung',5); S.flags.tungStudy = true; }, text:'Tùng hứa sẽ “cân nhắc nghiêm túc”. Đây là lần thứ ba trong năm cậu ấy cân nhắc nghiêm túc.' } ] },
    { need:74, lines:[['tung','“Tao có chuyện này… tao sắp đi phỏng vấn làm sales.”'],['me','“Thật á? Sao giấu tao?”'],['tung','“Sợ trượt thì mày cười. Mày đừng cười nhé.”']],
      choices:[ { icon:'🎤', label:'Giúp Tùng luyện phỏng vấn', hints:['⚡ −8'], fx:() => { rel('tung',10); S.soft += 2; S.energy -= 8; memo('Giúp Tùng luyện phỏng vấn'); }, text:'Hai đứa đóng vai HR và ứng viên đến tận khuya. Tùng trả lời câu điểm yếu là “em hơi cầu toàn”. Bạn sửa ngay.' },
                { icon:'🍀', label:'Chúc Tùng may mắn', fx:() => rel('tung',5), text:'Tùng gật đầu, uống cạn cốc trà đá như uống rượu thề.' } ] },
  ]},
  linh: { place:'cafe', cost:45000, where:'Quán cà phê trứng', list:[
    { need:0, lines:[['linh','“Tao đang học thêm về dữ liệu. Ba tháng nữa tao muốn chuyển việc.”'],['me','“Mày lúc nào cũng có kế hoạch nhỉ.”'],['linh','“Không có kế hoạch thì tao hoảng. Còn mày thì sao?”']],
      choices:[ { icon:'💬', label:'Kể thật về những lo lắng của mình', fx:() => { rel('linh',7); S.mood += 5; }, text:'Linh nghe rất chăm chú rồi bảo: “Lo lắng nghĩa là mày đang nghiêm túc với cuộc đời mình. Thế là tốt.”' },
                { icon:'😅', label:'Đùa rằng kế hoạch của mình là “sống sót”', fx:() => { rel('linh',3); S.mood += 3; }, text:'Linh cười: “Kế hoạch đó cũng hợp lệ.”' } ] },
    { need:64, lines:[['linh','“Nói mày nghe cái này, đừng kể ai nhé.”'],['linh','“Tao trượt ba cuộc phỏng vấn rồi mới đậu chỗ hiện tại. Ai cũng tưởng tao giỏi lắm.”'],['me','“Tao cũng tưởng thế thật.”']],
      choices:[ { icon:'🙏', label:'Cảm ơn Linh đã kể', fx:() => { rel('linh',8); S.mood += 4; }, text:'Bạn bỗng thấy những lần vấp ngã của mình bớt đáng sợ hẳn.' },
                { icon:'📝', label:'Hỏi Linh bí quyết vượt qua', fx:() => { rel('linh',5); S.tech += 1; S.soft += 1; }, text:'Linh bảo: “Sau mỗi lần trượt, tao ghi lại đúng ba câu mình trả lời dở nhất. Thế thôi.”' } ] },
    { need:74, lines:[['linh','“Tao nhận được lời mời làm việc ở Sài Gòn. Lương gấp rưỡi.”'],['me','“…”'],['linh','“Tao chưa quyết. Mày nghĩ sao?”']],
      choices:[ { icon:'✈️', label:'Khuyên Linh cứ đi, cơ hội hiếm có', fx:() => rel('linh',6), text:'Linh gật đầu chậm rãi: “Ừ. Nhưng mày phải vào thăm tao đấy.”' },
                { icon:'🥲', label:'Bảo sẽ nhớ Linh lắm', fx:() => { rel('linh',9); S.mood -= 2; }, text:'Linh lau vội khóe mắt: “Đồ ngốc, tao đã đi đâu.”' } ] },
  ]},
  dung: { place:'sidewalk', cost:20000, where:'Trà đá sau giờ làm', list:[
    { need:0, lines:[['dung','“Em uống gì? Anh mời. Đừng hỏi anh về code, hết giờ rồi.”'],['me','“Thế em hỏi về gì ạ?”'],['dung','“Gì cũng được, trừ code và người yêu cũ.”']],
      choices:[ { icon:'🎧', label:'Hỏi về chiếc tai nghe', fx:() => rel('dung',6), text:'Anh Dũng cười: “Đeo tai nghe để người ta không hỏi linh tinh. Thật ra nhiều lúc anh không bật nhạc đâu.”' },
                { icon:'⏳', label:'Hỏi anh làm nghề này bao lâu rồi', fx:() => { rel('dung',4); S.tech += 1; }, text:'“Tám năm. Năm đầu anh làm sập hệ thống hai lần. Nên em cứ bình tĩnh.”' } ] },
    { need:60, lines:[['dung','“Phong kể với em chuyện anh từng hát nhóm nhạc à?”'],['me','“Dạ… em có nghe qua ạ.”'],['dung','“Nhóm tên là Bốn Chàng Lập Trình. Album duy nhất bán được 37 bản.”']],
      choices:[ { icon:'🎤', label:'Xin nghe anh hát một câu', fx:() => { rel('dung',8); S.mood += 8; }, text:'Anh Dũng hát đúng một câu rồi dừng. Giọng hay đến bất ngờ. Cả quán trà đá vỗ tay.' },
                { icon:'🤔', label:'Hỏi vì sao anh bỏ nhạc', fx:() => { rel('dung',6); S.soft += 1; }, text:'“Vì code có lỗi thì còn sửa được. Hát sai trên sân khấu thì không.”' } ] },
    { need:70, lines:[['dung','“Tháng sau anh định giao em làm phần thanh toán. Khó đấy.”'],['me','“Em sợ làm hỏng ạ.”'],['dung','“Hỏng thì anh đỡ. Nhưng em phải hỏi sớm, đừng giấu.”']],
      choices:[ { icon:'💪', label:'Nhận lời', fx:() => { rel('dung',8); S.tech += 3; S.perf += 1; memo('Được anh Dũng tin tưởng giao việc khó'); }, text:'Anh Dũng gật đầu, lần đầu tiên tháo hẳn tai nghe ra khi nói chuyện với bạn.' },
                { icon:'🧭', label:'Xin thêm thời gian chuẩn bị', fx:() => rel('dung',4), text:'Anh Dũng gật đầu: “Biết lượng sức mình cũng là một kỹ năng.”' } ] },
  ]},
  mai: { place:'cafe', cost:45000, where:'Quán cà phê gần công ty', list:[
    { need:0, lines:[['mai','“Em có biết vì sao chị làm tester không?”'],['me','“Vì chị thích tìm lỗi ạ?”'],['mai','“Vì chị thích nhìn dev hoảng.” (Chị cười.)']],
      choices:[ { icon:'😱', label:'Thú nhận mình rất sợ chị', fx:() => { rel('mai',6); S.mood += 5; }, text:'Chị Mai cười to đến mức quán quay lại nhìn: “Sợ là đúng rồi em.”' },
                { icon:'🧪', label:'Hỏi cách viết code ít lỗi', fx:() => { rel('mai',4); S.tech += 2; }, text:'“Viết xong thì tự phá nó trước khi chị phá.” Một lời khuyên đáng giá cả tháng lương.' } ] },
    { need:60, lines:[['mai','“Con mèo nhà chị lại mở tủ lạnh. Lần này nó ăn hết hộp sữa chua.”'],['me','“Chị có nghĩ đến chuyện khóa tủ lạnh không?”'],['mai','“Có. Nó mở được khóa luôn.”']],
      choices:[ { icon:'🐱', label:'Đề xuất “kiểm thử” con mèo', fx:() => { rel('mai',7); S.mood += 6; }, text:'Chị Mai cười chảy nước mắt: “Em đúng là dân trong nghề.”' },
                { icon:'📸', label:'Xin xem ảnh con mèo', fx:() => { rel('mai',5); S.energy -= 3; }, text:'Chị Mai cho bạn xem 214 tấm ảnh. Bạn xem hết.' } ] },
    { need:70, lines:[['mai','“Chị đang tính học thêm để làm kiểm thử tự động. Nhưng sợ không theo kịp.”'],['me','“Chị mà còn sợ ạ?”'],['mai','“Ai mà chẳng sợ cái mới hả em.”']],
      choices:[ { icon:'🤝', label:'Đề nghị kèm chị phần code cơ bản', fx:() => { rel('mai',9); S.soft += 2; S.tech += 1; memo('Hẹn kèm chị Mai học code'); }, text:'Chị Mai bắt tay bạn: “Thỏa thuận nhé. Đổi lại chị chỉ em cách tìm bug.”' },
                { icon:'✨', label:'Động viên chị', fx:() => rel('mai',5), text:'Chị Mai mỉm cười: “Ừ, thử thì mới biết.”' } ] },
  ]},
  phong: { place:'sidewalk', cost:20000, where:'Trà đá dưới công ty', list:[
    { need:0, lines:[['phong','“Ông thấy tôi có hợp với nghề này không?”'],['me','“Sao lại hỏi thế?”'],['phong','“Hôm nay tôi làm hỏng nút đăng nhập. Ba lần.”']],
      choices:[ { icon:'🫂', label:'Kể chuyện mình cũng từng làm hỏng', fx:() => { rel('phong',7); S.mood += 3; }, text:'Phong thở phào: “May quá, không phải mình tôi.”' },
                { icon:'📖', label:'Rủ Phong cùng ôn lại kiến thức', fx:() => { rel('phong',5); S.tech += 2; S.energy -= 6; }, text:'Hai đứa ngồi ôn đến khi quán dọn hàng. Phong bảo đây là buổi học hiệu quả nhất từ hồi đại học.' } ] },
    { need:60, lines:[['phong','“Tôi nói thật nhé, tôi vào nghề vì bố mẹ bảo IT lương cao.”'],['me','“Thế ông thích làm gì?”'],['phong','“Tôi thích vẽ. Nhưng vẽ thì… ai trả lương.”']],
      choices:[ { icon:'🎨', label:'Gợi ý Phong thử thiết kế giao diện', fx:() => { rel('phong',9); S.flags.phongDesign = true; }, text:'Mắt Phong sáng lên: “Ơ, có nghề đó à? Vừa vẽ vừa được trả lương?”' },
                { icon:'🖍️', label:'Bảo Phong cứ vẽ như một sở thích', fx:() => { rel('phong',5); S.mood += 2; }, text:'Phong gật gù, rồi vẽ ngay lên giấy ăn một chân dung chibi của bạn. Khá giống.' } ] },
    { need:70, lines:[['phong','“Tôi định xin chuyển sang làm thiết kế giao diện.”'],['phong','“Nếu không có ông chắc tôi chẳng dám nghĩ đến.”']],
      choices:[ { icon:'🎉', label:'Chúc mừng Phong', fx:() => { rel('phong',8); S.mood += 8; }, text:'Phong cười tươi nhất từ hôm vào công ty. Trông cậu ấy không còn hoảng nữa.' },
                { icon:'🧋', label:'Đòi Phong bao trà sữa', fx:() => { rel('phong',6); S.mood += 5; }, text:'Phong bao bạn cốc trà sữa to nhất, thêm trân châu gấp đôi.' } ] },
  ]},
  boss: { place:'cafe', cost:45000, where:'Cà phê với sếp', minRel:55, list:[
    { need:55, lines:[['boss','“Chị muốn nghe em nói thật: tuần đầu thế nào?”']],
      choices:[ { icon:'💬', label:'Nói thật những chỗ còn bỡ ngỡ', fx:() => { rel('boss',7); S.soft += 2; }, text:'“Cảm ơn em. Người dám nói mình chưa biết thường học nhanh nhất.”' },
                { icon:'👍', label:'Bảo “mọi thứ đều ổn ạ”', fx:() => rel('boss',2), text:'“Ừ, có gì cần cứ nói chị nhé.” Chị có vẻ biết là không ổn lắm.' } ] },
    { need:68, lines:[['boss','“Hồi chị mới đi làm, chị từng khóc trong nhà vệ sinh công ty hai lần.”'],['me','“Chị á?”'],['boss','“Ừ. Nên nếu em thấy khó, đó là chuyện bình thường.”']],
      choices:[ { icon:'🙏', label:'Cảm ơn chị', fx:() => { rel('boss',8); S.mood += 8; }, text:'Bạn về nhà với cảm giác nhẹ nhõm lạ thường.' },
                { icon:'🧭', label:'Hỏi chị làm sao để vượt qua', fx:() => { rel('boss',6); S.soft += 2; }, text:'“Ngủ đủ, ăn tử tế, và đừng so mình với người khác quá nhiều.”' } ] },
  ]},
  family: { place:'room_nha', cost:0, where:'Ở nhà', list:[
    { need:0, lines:[['dad','“Dạo này có mệt không con?”'],['me','“Cũng hơi mệt bố ạ.”'],['mom','“Mệt thì nghỉ, mai mẹ nấu canh cua.”']],
      choices:[ { icon:'💬', label:'Kể cho bố mẹ nghe chuyện của mình', fx:() => { rel('family',8); S.mood += 5; }, text:'Bố mẹ nghe chăm chú. Bố bảo: “Cứ từ từ, đường còn dài.”' },
                { icon:'🚲', label:'Hỏi bố hồi trẻ bố làm gì', fx:() => rel('family',6), text:'Bố kể chuyện lương 300 nghìn mua được xe đạp. Lần thứ 41. Bạn vẫn nghe hết.' } ] },
    { need:70, lines:[['mom','“Mẹ biết con áp lực.”'],['mom','“Bố mẹ không cần con giàu, chỉ cần con khỏe và vui.”']],
      choices:[ { icon:'🤗', label:'Ôm mẹ một cái', fx:() => { rel('family',10); S.mood += 10; }, text:'Mẹ vỗ lưng bạn như hồi bạn còn bé. Bố giả vờ xem ti vi nhưng khóe mắt đỏ đỏ.' },
                { icon:'🥗', label:'Hứa sẽ ăn uống đầy đủ', fx:() => { rel('family',6); eat(10); }, text:'Mẹ gật đầu và ngay lập tức múc thêm cho bạn bát canh.' } ] },
  ]},
};
const SMALLTALK = {
  tung:'“Mày biết vì sao trà đá lên giá không? Vì đá cũng phải đi làm.”', linh:'“Tuần này tao đọc xong hai cuốn sách. Mày đọc được mấy trang rồi?”',
  dung:'“Hôm nay em làm ổn đấy. Đừng kể với ai là anh khen nhé.”', mai:'“Hôm nay chị tìm được 7 bug. Một ngày đẹp trời.”',
  phong:'“Ông ơi, tôi vừa học được cách thoát khỏi Vim. Đời tôi sang trang mới.”', boss:'“Uống gì cứ gọi, chị mời.”', family:'“Ăn cơm chưa con?”',
};
const HANG_WHO = { family:'mom' };
function hangoutPeople(){
  const list = ['tung','linh'];
  if (S.bg === 'nha') list.unshift('family');
  if (S.job && S.day >= S.job.start) list.push('phong','mai','dung','boss');
  return list;
}
const HANGOUT_ACT = { id:'hangout', icon:'👋', label:'Rủ ai đó đi chơi', slots:['afternoon','evening'], cond:() => hangoutPeople().length > 0,
  hints:['💬 Trò chuyện riêng','🤝 Thân hơn'], fx:() => { S.queue.unshift({ id:'hangout_pick', arg:S.slot }); return { silent:true }; } };

SC.hangout_pick = (slot) => ({
  icon:'👋', title:'Rủ ai đi chơi?',
  html: P('Chọn một người để dành thời gian cùng. Càng thân, họ càng kể cho bạn nhiều chuyện hơn.'),
  choices: [ ...hangoutPeople().map(k => {
      const H = HANG[k], idx = (S.hang && S.hang[k]) || 0, next = H.list[idx], v = S.rel[k];
      const locked = H.minRel && v < H.minRel;
      const hint = locked ? `🔒 Cần thân hơn (từ ${H.minRel})` : next ? (v >= next.need ? '✨ Có chuyện mới để kể' : `🔒 Chuyện tiếp theo cần thân từ ${next.need}`) : '💬 Tán gẫu';
      return { icon: PEOPLE[k].icon, label: k === 'family' ? 'Dành thời gian với bố mẹ' : `Rủ ${PEOPLE[k].name.replace(/^(Chị|Anh) /, m => m.toLowerCase())}`, desc:H.where, cost:H.cost || 0, disabled:locked, hints:[hint, `🤝 ${v}`],
        fx:() => { S.queue.unshift({ id:'hangout', arg:k }); return { silent:true }; } };
    }),
    { icon:'↩️', label:'Thôi, để hôm khác', fx:() => { S.queue.unshift({ id:'activity', arg:slot }); return { silent:true }; } } ],
});
SC.hangout = (k) => {
  const H = HANG[k];
  if (!S.hang) S.hang = {};
  const idx = S.hang[k] || 0, e = H.list[idx];
  const who = w => w === 'me' ? 'me' : w;
  const npc = k === 'family' ? 'family' : k;
  if (e && S.rel[k] >= e.need) {
    return { icon:PEOPLE[k].icon, title:`${H.where}`, bg:H.place, npc, html:'',
      talk: e.lines.map(([w, t]) => ({ w:who(w), t })),
      choices: e.choices.map(c => ({ ...c, fx:() => { S.hang[k] = idx + 1; c.fx(); return c.text; } })) };
  }
  return { icon:PEOPLE[k].icon, title:`${H.where}`, bg:H.place, npc, html: P('<span class="tip">Hai người tán gẫu vui vẻ. Thân hơn nữa thì sẽ có chuyện mới để kể.</span>'),
    talk:[ { w: HANG_WHO[k] || k, t:SMALLTALK[k] } ],
    choices:[ { icon:'😄', label:'Trò chuyện vui vẻ', fx:() => { rel(k, 4); S.mood += 5; return 'Một buổi tán gẫu không đầu không cuối, nhưng ai cũng về nhà với tâm trạng tốt hơn.'; } } ] };
};
ART.hangout = () => ({});

Object.assign(ART, {
  bill_short: () => ({ bg:'home', meExpr:'sad' }),
  plan: () => ({ bg:'home' }),
  repay: () => ({ bg:'home' }),
  payday: () => ({ bg:'office', meExpr:'happy', meAnim:'jump' }),
  house_contrib: () => ({ bg:'home', npc:'family' }),
  fam_send: () => ({ bg:'home' }),
  'ev:fam_kha': () => S.bg === 'nha'
    ? { bg:'home', npc:'family', npcExpr:'neutral', html:P('Bữa tối, bố đặt đũa xuống, giọng rất nghiêm túc.'), talk:[ { w:'dad', t:'“Bác Hùng bạn bố đang làm ở ngân hàng. Con có muốn bố nói một tiếng không? Ổn định, lương tốt, bố mẹ cũng yên tâm.”' } ] }
    : { kind:'phone', from:'family', html:'', msgs:[ 'Bố đây.', 'Bác Hùng bạn bố đang làm ở ngân hàng. Con có muốn bố nói một tiếng không? Ổn định, lương tốt, bố mẹ cũng yên tâm.' ] },
  'ev:fam_tb': () => S.bg === 'nha'
    ? { bg:'home', npc:'family', html:P('Mẹ ngồi xuống cạnh bạn sau bữa tối.'), talk:[ { w:'mom', t:'“Tháng này con tiêu hết bao nhiêu rồi? Nhớ để dành một ít, có gì còn xoay.”' } ] }
    : { kind:'phone', from:'family', html:'', msgs:[ 'Tháng này con tiêu hết bao nhiêu rồi?', 'Nhớ để dành một ít, có gì còn xoay.' ] },
  'ev:fam_kho': () => S.bg === 'nha'
    ? { bg:'home', npc:'family', npcExpr:'sad', html:P('Bạn nghe thấy bố mẹ nói chuyện nhỏ trong bếp.'), talk:[ { w:'mom', t:'“Học kỳ này em con phải đóng 2 triệu học phí. Bố mẹ đang xoay, con đừng lo nhé.”' } ] }
    : { kind:'phone', from:'family', html:'', msgs:[ 'Học kỳ này em con phải đóng 2 triệu học phí.', 'Bố mẹ đang xoay, con đừng lo nhé.' ] },
});
EV_TYPE.fam_kha = EV_TYPE.fam_tb = EV_TYPE.fam_kho = 'random';
ACTS.splice(1, 0, HANGOUT_ACT);

