const test = require('ava');
const request = require('supertest');
const proxyquire = require('proxyquire');

test.beforeEach(() => {
  delete require.cache[require.resolve('../../app')];
});

function jobTemplate(source, queuedTime, error = '', progress = 0, destination = '', fileSize = 0) {
  return `
  <?xml version="1.0" encoding="UTF-8"?>
  <cnpsXML
    TypeName="TRANSCODINGJOB"
    PROGRESS.DWD="${progress}">
    <JobSubmitInfo 
      Name="Job (${queuedTime.toLocaleString()})" />
    <Failures><Warnings/><Errors>${error}</Errors></Failures>
    <WorkerData>
      <Sources Duration.QWD="20980159201">
        <SourceFiles File_0="/path/from/${source}"/>
      </Sources>
      <Destinations>
        <Module_0>
          <TargetFiles 
            File_0="/path/to/${destination}" 
            FileSize_0.QWD="${fileSize}" />
        </Module_0>
      </Destinations>
    </WorkerData>
  </cnpsXML>
  `;
}

const mockFs = {
  readdirSync: () => {
    return ['xxx.pws', 'yyy.pws', 'zzz.pws'];
  },
  statSync: filePath => {
    let mtime = 0;
    if (filePath.endsWith('xxx.pws')) {
      mtime = 1000;
    } else if (filePath.endsWith('yyy.pws')) {
      mtime = 2000;
    } else if (filePath.endsWith('zzz.pws')) {
      mtime = 3000;
    }
    return {
      isFile: () => {
        return true;
      },
      mtime: new Date(mtime)
    };
  },
  readFileSync: filePath => {
    if (filePath.endsWith('xxx.pws')) {
      return jobTemplate('xxx.avi', new Date(0), '', 100, 'xxx.mp4', 1000);
    }
    if (filePath.endsWith('yyy.pws')) {
      return jobTemplate('yyy.avi', new Date(1000), '', 100, 'yyy.mp4', 2000);
    }
    if (filePath.endsWith('zzz.pws')) {
      return jobTemplate('zzz.avi', new Date(2000), '<Error1 />');
    }
  }
};

test('logs:nan', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/logs/a');
  t.is(res.status, 400);
});

test('logs:negative', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/logs/-1');
  t.is(res.status, 400);
});

test('logs:many', async t => {
  const app = require('../../app');
  const res = await request(app).get('/api/logs/129');
  t.is(res.status, 400);
});

test('encode:read-completed', async t => {
  const mockUtil = proxyquire('../../libs/util', {fs: mockFs});
  const mockLog = proxyquire('../../libs/log', {'./util': mockUtil});
  const mockApi = proxyquire('../../routes/api', {'../libs/log': mockLog});
  const app = proxyquire('../../app', {'./routes/api': mockApi});
  const res = await request(app).get('/api/logs/10');
  t.is(res.status, 200);
});
