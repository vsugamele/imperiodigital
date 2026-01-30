function pad(n) {
  return String(n).padStart(2, '0');
}

function getTomorrowDateParts(tz) {
  const now = new Date();
  // Convert "now" to parts in timezone
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const [{ value: y }, , { value: m }, , { value: d }] = fmt.formatToParts(now);
  // Create a Date at UTC midnight for today in tz by using Date.UTC and then adding a day in tz terms.
  // Simpler: parse y-m-d as local date string and add 1 day in that tz by using a Date object at noon UTC.
  // We'll compute tomorrow by using a Date constructed from y-m-d at 12:00Z then +24h and re-format.
  const anchor = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12, 0, 0));
  const tomorrowAnchor = new Date(anchor.getTime() + 24 * 60 * 60 * 1000);
  const [{ value: ty }, , { value: tm }, , { value: td }] = fmt.formatToParts(tomorrowAnchor);
  return { year: ty, month: tm, day: td };
}

function localDateTimeString({ year, month, day }, hh, mm) {
  return `${year}-${month}-${day}T${pad(hh)}:${pad(mm)}:00`;
}

module.exports = { getTomorrowDateParts, localDateTimeString };
