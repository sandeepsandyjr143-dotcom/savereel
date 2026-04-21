'use strict';

const stats = {
  visits:       0,
  yt_info_ok:   0,
  yt_info_fail: 0,
  ig_info_ok:   0,
  ig_info_fail: 0,
  yt_download:  0,
  ig_download:  0,
  errors:       {},
  startedAt:    new Date().toISOString(),
};

function inc(key) {
  if (key in stats) stats[key]++;
}

function incError(code) {
  stats.errors[code] = (stats.errors[code] || 0) + 1;
}

function snapshot() {
  const uptimeSecs = Math.floor((Date.now() - new Date(stats.startedAt).getTime()) / 1000);
  const totalFetch = stats.yt_info_ok + stats.yt_info_fail + stats.ig_info_ok + stats.ig_info_fail;
  const totalOk    = stats.yt_info_ok + stats.ig_info_ok;
  return {
    ...stats,
    uptimeSeconds:    uptimeSecs,
    fetchSuccessRate: totalFetch ? `${((totalOk / totalFetch) * 100).toFixed(1)}%` : 'n/a',
  };
}

module.exports = { inc, incError, snapshot };
