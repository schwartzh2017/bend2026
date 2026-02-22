-- Times stored as UTC. All events are in America/Los_Angeles (PST = UTC-8 in late Feb/early March).
-- To convert: intended_PT_time + 8h = UTC stored here.
-- Source: trip schedule spreadsheet (times entered as PT).
-- Note: 2026 is not a leap year; "Feb 29" in source = March 1.
insert into events (title, event_type, starts_at) values
  ('Bretten, Simon, Noelle, Mack, and Haleigh leave for Bend', 'travel',   '2026-02-27 02:00:00+00'), -- Feb 26, 6:00 PM PT
  ('Bretten, Simon, Noelle, Mack, and Haleigh arrive in Bend', 'travel',   '2026-02-27 05:00:00+00'), -- Feb 26, 9:00 PM PT
  ('Liz and Mike arrive in Bend',                              'travel',   '2026-02-27 06:00:00+00'), -- Feb 26, 10:00 PM PT
  ('We do stuff. Some people work.',                           'free',     '2026-02-27 17:00:00+00'), -- Feb 27, 9:00 AM PT
  ('Evan and Zani leave for Bend',                             'travel',   '2026-02-28 05:00:00+00'), -- Feb 27, 9:00 PM PT
  ('Evan and Zani arrive in Bend',                             'travel',   '2026-02-28 08:00:00+00'), -- Feb 28, 12:00 AM PT
  ('We ski!!!!',                                               'activity', '2026-02-28 17:00:00+00'), -- Feb 28, 9:00 AM PT
  ('We play a super fun game that Zani + Haleigh created.',    'activity', '2026-03-01 02:00:00+00'), -- Feb 28, 6:00 PM PT
  ('We explore downtown Bend, grab brunch, etc',               'activity', '2026-03-01 17:00:00+00'), -- Mar 1, 9:00 AM PT
  ('We clean up + leave for home :(',                          'travel',   '2026-03-01 23:00:00+00'); -- Mar 1, 3:00 PM PT
