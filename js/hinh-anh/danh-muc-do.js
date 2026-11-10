/* =========================================================
   DANH MỤC ĐỒ: mỗi món là một dòng dữ liệu, sẵn sàng cho cửa hàng sau này
   status: 'default' (có sẵn) | 'locked' (cần mở khóa, chưa dùng trong bản này)
   ========================================================= */
const CATALOG = [
  { id:'hair_short', layer:'hair', group:'Kiểu tóc', name:'Ngắn gọn', fit:['nam'], status:'default' },
  { id:'hair_spiky', layer:'hair', group:'Kiểu tóc', name:'Dựng ngược', fit:['nam'], status:'default' },
  { id:'hair_side',  layer:'hair', group:'Kiểu tóc', name:'Rẽ ngôi', fit:['nam'], status:'default' },
  { id:'hair_bob',   layer:'hair', group:'Kiểu tóc', name:'Bob', fit:['nu'], status:'default' },
  { id:'hair_long',  layer:'hair', group:'Kiểu tóc', name:'Dài', fit:['nu'], status:'default' },
  { id:'hair_bun',   layer:'hair', group:'Kiểu tóc', name:'Búi', fit:['nu'], status:'default' },
  { id:'hair_pixie', layer:'hair', group:'Kiểu tóc', name:'Tém', fit:['nam','nu'], status:'default' },
  { id:'hc_black', layer:'hairColor', group:'Màu tóc', name:'Đen',          value:'#2B2321', status:'default' },
  { id:'hc_dark',  layer:'hairColor', group:'Màu tóc', name:'Nâu đen',      value:'#4A3226', status:'default' },
  { id:'hc_brown', layer:'hairColor', group:'Màu tóc', name:'Nâu hạt dẻ',   value:'#7B4A2E', status:'default' },
  { id:'hc_honey', layer:'hairColor', group:'Màu tóc', name:'Nâu mật ong',  value:'#B9814A', status:'default' },
  { id:'hc_wine',  layer:'hairColor', group:'Màu tóc', name:'Đỏ rượu vang', value:'#7A2E40', status:'default' },
  { id:'hc_ash',   layer:'hairColor', group:'Màu tóc', name:'Xám khói',     value:'#7D8896', status:'default' },
  { id:'skin_1', layer:'skin', group:'Màu da', name:'Trắng hồng', value:'#FFE6D5', status:'default' },
  { id:'skin_2', layer:'skin', group:'Màu da', name:'Sáng',       value:'#FFD6BA', status:'default' },
  { id:'skin_3', layer:'skin', group:'Màu da', name:'Ngăm',       value:'#E8B48C', status:'default' },
  { id:'skin_4', layer:'skin', group:'Màu da', name:'Nâu',        value:'#C68A62', status:'default' },
  { id:'out_pajama', layer:'outfit', slot:'sleep',  kind:'pajama', group:'Trang phục', name:'Đồ ngủ kẻ sọc',    value:'#8FB4E3', status:'default' },
  { id:'out_shirt',  layer:'outfit', slot:'work',   kind:'shirt',  group:'Trang phục', name:'Sơ mi trắng',      value:'#FFFFFF', status:'default' },
  { id:'out_tee',    layer:'outfit', slot:'casual', kind:'tee',    group:'Trang phục', name:'Áo phông cam đào', value:'#F2946E', status:'default' },
  { id:'acc_none', layer:'acc', group:'Phụ kiện', name:'Không đeo gì', status:'default' },
];
const CAT = Object.fromEntries(CATALOG.map(i => [i.id, i]));
const catBy = layer => CATALOG.filter(i => i.layer === layer && i.status === 'default');
function defaultLook(gender){
  return { hair: gender === 'nu' ? 'hair_long' : 'hair_short', hairColor:'hc_black', skin:'skin_2',
           sleep:'out_pajama', work:'out_shirt', casual:'out_tee', acc:'acc_none' };
}
function lookToL(look, ctx, g){
  const out = CAT[look[ctx]] || CAT.out_tee;
  return { hair:look.hair, hairColor:CAT[look.hairColor].value, skin:CAT[look.skin].value, outfit:{ kind:out.kind, color:out.value }, acc:[], g };
}

