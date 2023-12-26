import { sleep } from '@portkey-v1/utils';
import Imap from 'imap';
type CodeItem = {
  code: string;
  from: string;
  date: string;
};
type InitMailParams = {
  user: string;
  password: string;
  host: string;
  port: number;
};

let total;
var imap;
const codeMap: { [key: string]: CodeItem } = {};
async function getNewMail(id?: string) {
  const num = total || id;
  if (!num) return;
  const f = imap.seq.fetch(num + ':*', {
    bodies: ['HEADER.FIELDS (FROM)', 'TEXT'],
  });
  f.on('message', function (msg, seqno) {
    let prefix = '(#' + seqno + ') ';
    codeMap[prefix] = {} as any;
    msg.on('body', function (stream, info) {
      let buffer = '';
      stream.on('data', function (chunk) {
        const str = chunk.toString('utf8');
        const list = str.match(/\d{6}/g);
        if (Array.isArray(list)) {
          codeMap[prefix].code = list.find(i => i.length > 5);
        }
        buffer += chunk.toString('utf8');
      });
      stream.once('end', function () {
        if (info.which !== 'TEXT') {
          const header = Imap.parseHeader(buffer);
          codeMap[prefix].from = header.from[0];
        }
      });
    });
    msg.once('attributes', function (attrs) {
      codeMap[prefix].date = attrs.date;
      console.log(codeMap, '====codeMap');
    });
    msg.once('end', function () {
      console.log(prefix + 'Finished');
    });
    f.once('error', function (err) {
      console.log('Fetch error: ' + err);
    });
    f.once('end', function () {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
}
export async function initMail(params: InitMailParams) {
  return new Promise((resolve, reject) => {
    imap = new Imap({
      ...params,
      tls: true,
      keepalive: {
        interval: 10000,
        idleInterval: 0,
        forceNoop: true,
      },
    });

    imap.once('ready', function () {
      function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
      }
      openInbox(function (err, box) {
        if (err) return reject(err);
        total = box.messages.total;
        getNewMail(total);
        resolve(total);
      });
    });
    imap.once('error', function (err) {
      console.log(err);
    });

    imap.once('end', function () {
      console.log('Connection ended');
    });
    imap.on('mail', function (mail) {
      getNewMail(mail);
    });
    imap.connect();
  });
}
export async function getCode(time: number, reCount = 0) {
  if (reCount > 10) throw new Error('timeOut');
  let codeItem: CodeItem | undefined = undefined;
  const list = Object.values(codeMap);
  for (let i = 0; i < list.length; i++) {
    const element: CodeItem = list[i];
    if (!codeItem) codeItem = element;
    if (new Date(codeItem.date).getTime() < new Date(codeItem.date).getTime()) codeItem = element;
  }
  if (codeItem && codeItem.from?.includes('portkey') && new Date(codeItem.date).getTime() > time) return codeItem;
  await sleep(5000);
  return getCode(time, ++reCount);
}
