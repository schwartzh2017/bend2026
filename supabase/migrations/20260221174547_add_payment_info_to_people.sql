alter table people add column payment_method text check (payment_method in ('venmo', 'cashapp', 'zelle'));
alter table people add column payment_handle text;
