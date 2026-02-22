-- Enforce amount_cents > 0 at the database level [M5]
-- Prevents zero or negative expense amounts from being inserted directly
-- even if the API validation layer is bypassed.
alter table expenses add constraint expenses_amount_cents_positive check (amount_cents > 0);

-- Auto-update updated_at on row modification for expenses and settlements [M4]
-- Without this, updated_at only reflects the INSERT time, not subsequent UPDATEs.
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger expenses_set_updated_at
  before update on expenses
  for each row execute function update_updated_at_column();

create trigger settlements_set_updated_at
  before update on settlements
  for each row execute function update_updated_at_column();
