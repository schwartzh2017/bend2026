-- Add secret assignment columns to people table
alter table people
add column assigned_person_id uuid references people(id),
add column assigned_word text;

-- Create index for faster lookups
create index people_assigned_person_id_idx on people(assigned_person_id);

-- Seed random assignments
-- Words: fun, non-explicit English words
do $$
declare
  person_record record;
  target_record record;
  words text[] := array[
    'adventure', 'sunshine', 'banjo', 'waffle', 'squirrel',
    'umbrella', 'bubble', 'cactus', 'dolphin', 'elephant',
    'flamingo', 'guitar', 'hammock', 'igloo', 'jellyfish',
    'kangaroo', 'lemonade', 'mountain', 'nectar', 'octopus',
    'paddle', 'quilt', 'rainbow', 'sunset', 'turtle',
    'unicorn', 'volcano', 'waterfall', 'xylophone', 'yodel',
    'zephyr', 'biscuit', 'cobblestone', 'dandelion', 'evergreen',
    'fiddlehead', 'gargoyle', 'huckleberry', 'innocent', 'jasmine',
    'kaleidoscope', 'lighthouse', 'marigold', 'nostalgia', 'orchid',
    'papyrus', 'quicksand', 'raspberry', 'saffron', 'thunder'
  ];
  random_word text;
begin
  if (select count(*) from people) = 0 then
    raise exception 'people table is empty — run people seed first';
  end if;

  for person_record in select id from people loop
    -- Select a random person who is not themselves and not already assigned as a target
    select id into target_record.id
    from people
    where id != person_record.id
    and id != all(
      COALESCE(
        (SELECT array_agg(assigned_person_id) FROM people WHERE assigned_person_id IS NOT NULL),
        array[]::uuid[]
      )
    )
    order by random()
    limit 1;

    -- If everyone is already a target (edge case with small groups), fall back to any non-self person
    if not found then
      select id into target_record.id
      from people
      where id != person_record.id
      order by random()
      limit 1;
    end if;

    -- Select a random word (random() is in [0,1), so index is safely in [1, array_length]
    random_word := words[1 + floor(random() * array_length(words, 1))::int];

    -- Update the person with their assignment
    update people
    set assigned_person_id = target_record.id,
        assigned_word = random_word
    where id = person_record.id;
  end loop;
end $$;
