alter table people add column default_nights integer;

update people set default_nights = 3 where name = 'Haleigh Schwartz';
update people set default_nights = 3 where name = 'Liz Kaniecki';
update people set default_nights = 3 where name = 'Mike';
update people set default_nights = 2 where name = 'Evan Watson';
update people set default_nights = 1 where name = 'Jane Liggett';
update people set default_nights = 3 where name = 'Mack Peters';
update people set default_nights = 3 where name = 'Bretten Farrell';
update people set default_nights = 3 where name = 'Noelle Arneburg';
update people set default_nights = 3 where name = 'Simon Arneburg';
update people set default_nights = 2 where name = 'Zani Moore';

alter table people alter column default_nights set not null;
