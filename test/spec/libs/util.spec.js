const proxyquire = require('proxyquire');
const test = require('ava');

const mockFs = {
  readdirSync: () => {
    return ['myFile', 'myDir', 'myFile.abc', '.myFile.abc'];
  },
  statSync: path => {
    return {
      isFile: () => {
        if (path.endsWith('myDir')) {
          return false;
        }
        return true;
      },
      mtime: new Date(10000)
    };
  },
  readFileSync: () => {
    return 'abcdef';
  }
};

const util = proxyquire('../../../libs/util', {fs: mockFs});

test('util:getFileList', t => {
  let list = util.getFileList('/path/to', 'abc');
  t.is(list.length, 1);
  t.is(list[0], 'myFile.abc');
  list = util.getFileList('/path/to', '.abc');
  t.is(list.length, 1);
  t.is(list[0], 'myFile.abc');
});

test('util:getFileData', t => {
  const data = util.getFileData('/path/to/file');
  t.is(data, 'abcdef');
});

test('util:getFileTimestamp', t => {
  const date = util.getFileTimestamp('/path/to/file');
  t.is(date.getTime(), 10000);
});

test('util:getFileBaseName', t => {
  const baseName = util.getFileBaseName('/path/to/file', '/');
  t.is(baseName, 'file');
});
