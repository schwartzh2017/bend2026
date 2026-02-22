alter table grocery_items
  add constraint grocery_items_category_check
  check (category in ('produce', 'protein', 'dairy', 'drinks', 'snacks', 'alcohol', 'other'));
