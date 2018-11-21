const debug = require('debug')('procoder-watcher');

const {parse} = require('./job');
const util = require('./util');

const jobHash = {};
const jobList = [];

function iterateFilesInDir(logDir) {
  const list = util.getFileList(logDir, '.pws');
  for (const file of list) {
    const existingJob = jobHash[file];
    if (existingJob && (existingJob.status === 'completed' || existingJob.status === 'failed')) {
      continue;
    }
    const filePath = `${logDir}${util.SEP}${file}`;
    debug(filePath);
    const newJob = parse(file.slice(0, -4), util.getFileData(filePath));
    if (!newJob) {
      continue;
    }
    if (newJob.status === 'completed') {
      newJob.endTime = util.getFileTimestamp(filePath);
    }
    jobHash[file] = newJob;
    if (existingJob) {
      updateJob(newJob);
    } else {
      addJob(newJob);
    }
  }
}

// TODO: To be optimized
function addJob(newJob) {
  debug(`A new job is added: [${newJob.source}] - ${newJob.status} : ${newJob.progress} %`);
  if (jobList.length === 0) {
    return jobList.push(newJob);
  }
  for (const [index, job] of jobList.entries()) {
    if (job.queuedTime.getTime() > newJob.queuedTime.getTime()) {
      return jobList.splice(index, 0, newJob);
    }
  }
  jobList.push(newJob);
}

// TODO: To be optimized
function updateJob(newJob) {
  for (const [index, job] of jobList.entries()) {
    if (job.id === newJob.id) {
      debug(`Job is updated: [${newJob.source}] - ${newJob.status} : ${newJob.progress} %`);
      jobList[index] = newJob;
      break;
    }
  }
}

function getLatest(num = 10) {
  return jobList.slice(-num).reverse();
}

module.exports = {
  iterate: iterateFilesInDir,
  get: getLatest
};
