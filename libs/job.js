const {xml2js} = require('xml-js');
const {getFileBaseName, SEP} = require('./util');

class Job {
  constructor(type, source, queuedTime) {
    this.type = type;
    this.source = source;
    this.queuedTime = queuedTime;
    this.status = 'queued';
    this.error = null;
    this.progress = 0;
    this.destination = '';
    this.endTime = null;
    this.fileSize = 0;
  }
}

function parseJob(data) {
  const job = xml2js(data, {compact: true});
  const {cnpsXML} = job;
  if (!cnpsXML) {
    return null;
  }

  const type = cnpsXML._attributes.TypeName;
  if (type !== 'TRANSCODINGJOB' || !cnpsXML.WorkerData || !cnpsXML.JobSubmitInfo) {
    return null;
  }

  const error = checkError(cnpsXML.Failures.Errors);
  const source = getFileBaseName(cnpsXML.WorkerData.Sources.SourceFiles._attributes.File_0, SEP);
  const queuedTime = getQueuedTime(cnpsXML.JobSubmitInfo._attributes.Name);
  const res = new Job(type, source, queuedTime);
  if (error) {
    res.status = 'failed';
    res.error = error;
    return res;
  }

  const progress = parseInt(cnpsXML._attributes['PROGRESS.DWD'], 10);
  res.progress = progress;
  if (progress < 100) {
    res.status = 'started';
    return res;
  }

  res.status = 'completed';
  res.destination = getFileBaseName(cnpsXML.WorkerData.Destinations.Module_0.TargetFiles._attributes.File_0, SEP);
  res.fileSize = parseInt(cnpsXML.WorkerData.Destinations.Module_0.TargetFiles._attributes['FileSize_0.QWD'], 10);
  return res;
}

function checkError(obj) {
  if (!obj || Object.keys(obj).length === 0) {
    return null;
  }
  return obj;
}

function getQueuedTime(name) {
  const left = name.indexOf('(');
  const right = name.indexOf(')');
  if (left === -1 || right === -1 || left >= right) {
    return null;
  }
  return new Date(name.slice(left + 1, right));
}

exports.parse = parseJob;
