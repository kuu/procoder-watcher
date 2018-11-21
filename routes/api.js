const express = require('express');
const {get} = require('../libs/log');

const router = express.Router();
const MAX_LOG_ENTRY = 128;

/* GET the last {num} log entries in reverse chronological order */
router.get('/logs/:num', (req, res) => {
  const num = Number.parseInt(req.params.num, 10);
  if (Number.isNaN(num) || num <= 0 || num > MAX_LOG_ENTRY) {
    res.status(400);
    return res.send(`"num" should be an integer between 1 to ${MAX_LOG_ENTRY}`);
  }
  res.json(get(num));
});

module.exports = router;
