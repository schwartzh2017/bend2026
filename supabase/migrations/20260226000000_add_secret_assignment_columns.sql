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
  people_array uuid[] := array(SELECT id FROM people);
  person_count int;
  random_word text;
begin
  person_count := array_length(people_array, 1);
  
  for person_record in select id from people loop
    -- Select a random person who is not themselves
    loop
      select id into target_record.id 
      from people 
      where id != person_record.id 
      and id != all(
        COALESCE(
          (SELECT array_agg(id) FROM people WHERE assigned_person_id = person_record.id),
          array[]::uuid[]
        )
      )
      order by random() 
      limit 1;
      
      exit when found;
    end loop;
    
    -- Select a random word
    random_word := words[1 + floor(random() * array_length(words, 1))::int];
    
    -- Update the person with their assignment
    update people 
    set assigned_person_id = target_record.id, 
        assigned_word = random_word
    where id = person_record.id;
  end loop;
end $$;
