// Ghép các file css/ và js/ trở lại vào index.html (chỉ trong bộ nhớ) để kiểm thử chạy game y như khi còn là một file.
// Dùng: const html = require('./nap-game')();   hoặc   require('./nap-game')('/đường/dẫn/index.html')
const fs = require('fs'), path = require('path');
module.exports = function napGame(file) {
  file = file || path.join(__dirname, '..', 'index.html');
  const dir = path.dirname(file);
  const doc = f => fs.readFileSync(path.join(dir, f), 'utf8');
  return fs.readFileSync(file, 'utf8')
    .replace(/(?:<link rel="stylesheet" href="(?!https?:)[^"]+">\n)+/, m => '<style>\n' + [...m.matchAll(/href="([^"]+)"/g)].map(x => doc(x[1])).join('') + '</style>\n')
    .replace(/(?:<!--[^\n]*-->\n)?(?:<script src="[^"]+"><\/script>\n)+/, m => '<script>\n' + [...m.matchAll(/src="([^"]+)"/g)].map(x => doc(x[1])).join('') + '</script>\n');
};
