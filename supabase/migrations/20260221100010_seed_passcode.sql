insert into app_config (id, passcode_hash, trip_name)
values (1, '$2b$10$FPATE7wFEegp0mgLH9ibVuxKw1DieI7CayMRhWuiv5PkEtYXd.d2y', 'Bend 2026')
on conflict (id) do nothing;
