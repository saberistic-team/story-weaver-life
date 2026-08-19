
insert into public.profiles (id, username, display_name, bio, favorite_genres, story_points, level, is_creator, onboarded, streak_days) values
('11111111-0000-4000-8000-000000000001','sarahvale','Sarah Vale',$b$Writes trains, tunnels, and the people who miss their last chance to get off. Nine years as a night-shift dispatcher gave me all the material I will ever need.$b$,'{Mystery,Thriller}',9840,27,true,true,12),
('11111111-0000-4000-8000-000000000002','okonkwo_j','Jide Okonkwo',$b$Speculative fiction out of Lagos and Leeds. I build worlds with rules and then let strangers break them.$b$,'{Sci-Fi,Adventure}',8120,24,true,true,6),
('11111111-0000-4000-8000-000000000003','mirakade','Mira Kade',$b$Horror is just intimacy with the lights off. I host the slow games, the ones that take a week.$b$,'{Horror,Thriller}',7460,22,true,true,21),
('11111111-0000-4000-8000-000000000004','tomasreyes','Tomas Reyes',$b$Romance, mostly. Comedy when the room needs it. I believe every collaborative story eventually becomes a love story.$b$,'{Romance,Comedy}',6390,20,true,true,4),
('11111111-0000-4000-8000-000000000005','elenaborm','Elena Borm',$b$Cartographer by training, fantasist by accident. My Story Bibles are longer than my books.$b$,'{Fantasy,Adventure}',7020,21,true,true,9),
('11111111-0000-4000-8000-000000000006','danielash','Daniel Ash',$b$Former paramedic. I write the fifteen minutes before everything changes. Three hundred games hosted and counting.$b$,'{Thriller,Mystery}',5880,19,true,true,3);

insert into public.profiles (id, username, display_name, bio, favorite_genres, story_points, level, onboarded)
select
  ('22222222-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  lower(fn[1 + (i % 18)]) || '_' || lower(ln[1 + ((i*7) % 18)]) || i,
  fn[1 + (i % 18)] || ' ' || ln[1 + ((i*7) % 18)],
  bios[1 + (i % 6)],
  array[genres[1 + (i % 8)], genres[1 + ((i*3) % 8)]],
  120 + (i * 37) % 2400,
  1 + ((i * 37) % 2400) / 100,
  true
from generate_series(1,54) i,
lateral (select
  array['Ava','Noah','Ines','Kofi','Lena','Marco','Priya','Sam','Tariq','Yuki','Dana','Owen','Rosa','Hugo','Nadia','Felix','Clara','Emeka'] as fn,
  array['Hart','Okafor','Lindqvist','Moreau','Bello','Sato','Duarte','Novak','Rahman','Iversen','Costa','Weber','Nakamura','Silva','Kaur','Doyle','Aluko','Bright'] as ln,
  array['Mystery','Horror','Sci-Fi','Fantasy','Romance','Thriller','Comedy','Adventure'] as genres,
  array[
    $b$Two sentences at a time is exactly my attention span.$b$,
    $b$I joined for one game and stayed for eleven. Ask me about the tunnel.$b$,
    $b$Lurker turned contributor. Mostly I write endings.$b$,
    $b$I like being handed a story mid-sentence and having to make it work.$b$,
    $b$Night-shift reader. Weekend writer.$b$,
    $b$Here to ruin your cliffhanger in the nicest possible way.$b$] as bios) arrs;

insert into public.wallets (user_id, sparks) select id, 150 + (abs(hashtext(username)) % 3200) from public.profiles;
insert into public.spark_transactions (user_id, amount, reason)
select id, 100, 'Welcome to StoryPass' from public.profiles
union all select id, 25, 'Completed a story game' from public.profiles where not is_creator
union all select id, 50, 'Contribution selected for the chapter' from public.profiles where (abs(hashtext(username)) % 10) < 6;
insert into public.story_point_transactions (user_id, amount, reason) select id, story_points, 'Lifetime storytelling activity' from public.profiles;
insert into public.user_achievements (user_id, achievement_code)
select p.id, a.code from public.profiles p join public.achievements a on true
where (abs(hashtext(p.username || a.code)) % 100) < 35 on conflict do nothing;

insert into public.series (id, slug, title, tagline, description, genre, voice, creator_id, canon_mode, follower_count, reader_count) values
('33333333-0000-4000-8000-000000000001','the-last-train','The Last Train','Some passengers never get off.',$b$Maya Ortiz boards the 11:47 out of Bellhaven every weeknight. On the third Tuesday of October the train does not stop where it should, and the people in carriage four begin to remember lives they have not lived yet. A slow-burn mystery written by hundreds of strangers, one turn at a time.$b$,'Mystery',$b$restrained, cold-weather prose, short declaratives, dread built from timetables$b$,'11111111-0000-4000-8000-000000000001','creator',14820,98400),
('33333333-0000-4000-8000-000000000002','the-conductor','The Conductor','Someone has to keep the timetable.',$b$A companion series to The Last Train, told from the other side of the glass. The conductor has worked this line for forty-one years and has never once been asked his name.$b$,'Mystery',$b$wry, formal, an old man explaining rules he did not write$b$,'11111111-0000-4000-8000-000000000001','creator',6240,41200),
('33333333-0000-4000-8000-000000000003','forty-seven-years','Forty-Seven Years','She came back. Earth did not wait.',$b$The last astronaut returned after forty-seven years. Everyone was waiting for her except her. A generation-gap science fiction series about the woman who left and the planet that grew up without her.$b$,'Sci-Fi',$b$lucid, technical warmth, long sentences that resolve quietly$b$,'11111111-0000-4000-8000-000000000002','collaborative',11360,72800),
('33333333-0000-4000-8000-000000000004','the-quiet-house','The Quiet House','It has been listening for a very long time.',$b$Six housemates, one lease, and a building that rearranges itself when nobody is counting doors. Written in week-long games where every contributor sees only what their character would see.$b$,'Horror',$b$intimate, present tense, ordinary domestic detail turned wrong$b$,'11111111-0000-4000-8000-000000000003','creator',9970,58300),
('33333333-0000-4000-8000-000000000005','saltwater-letters','Saltwater Letters','Two people, one island, eleven years of bad timing.',$b$A romance told entirely in the gaps between visits. Contributors write one letter each and never see the reply until publication.$b$,'Romance',$b$warm, epistolary, generous with silence$b$,'11111111-0000-4000-8000-000000000004','collaborative',8410,50100),
('33333333-0000-4000-8000-000000000006','the-cartographers-guild','The Cartographers Guild','Maps are promises. Some of them lie.',$b$In Ardenmoor a map is a legal document, and the Guild that draws them decides where rivers are allowed to run. High fantasy with a rules-heavy Story Bible and a community that argues about borders.$b$,'Fantasy',$b$lyrical, formal, guild politics rendered as weather$b$,'11111111-0000-4000-8000-000000000005','collaborative',10240,63700),
('33333333-0000-4000-8000-000000000007','ninety-seconds','Ninety Seconds','The call came in at 4:02.',$b$Each chapter covers ninety seconds of real time. A paramedic thriller where the turn timer is the plot.$b$,'Thriller',$b$clipped, procedural, no adverbs, adrenaline in the white space$b$,'11111111-0000-4000-8000-000000000006','creator',7690,44900),
('33333333-0000-4000-8000-000000000008','the-understudy','The Understudy','Break a leg. Someone already did.',$b$A comedy of catastrophes set backstage at a regional theatre where the lead keeps mysteriously falling ill. Fast games, four rounds, maximum chaos.$b$,'Comedy',$b$fast, farcical, dialogue-forward, everyone slightly lying$b$,'11111111-0000-4000-8000-000000000004','chaos',5320,31800);

insert into public.books (series_id, slug, title, subtitle, description, sequence, status, published_at)
select s.id, v.slug, v.title, v.subtitle, v.description, v.seq, v.status::public.book_status, now() - (v.seq * interval '40 days')
from (values
 ('the-last-train','the-last-train-book-one','Book One: The 11:47','Chapters 1 to 6',$b$The first six chapters, in which Maya misses her stop and the timetable stops making sense.$b$,1,'published'),
 ('the-last-train','the-last-train-book-two','Book Two: Carriage Four','Chapters 7 to 12',$b$The passengers compare notes. Not all of them are passengers.$b$,2,'published'),
 ('the-last-train','the-last-train-book-three','Book Three: Bellhaven','In progress',$b$The line goes back to where it started, which is the one place nobody wanted to return to.$b$,3,'in_progress'),
 ('the-conductor','the-conductor-book-one','Book One: The Timetable',null,$b$Forty-one years of rules, told by the man who enforces them.$b$,1,'published'),
 ('the-conductor','the-conductor-book-two','Book Two: Unscheduled Stops',null,$b$What happens when the train stops somewhere that is not on any map.$b$,2,'published'),
 ('forty-seven-years','forty-seven-years-book-one','Book One: Reentry',null,$b$Splashdown, quarantine, and a press conference nobody prepared her for.$b$,1,'published'),
 ('forty-seven-years','forty-seven-years-book-two','Book Two: The Grandchildren',null,$b$Her crew left families behind. Those families have opinions.$b$,2,'published'),
 ('forty-seven-years','forty-seven-years-book-three','Book Three: Second Launch','In progress',$b$They want her to go again. She has not said no.$b$,3,'in_progress'),
 ('the-quiet-house','the-quiet-house-book-one','Book One: The Lease',null,$b$Six signatures on a document nobody read closely.$b$,1,'published'),
 ('the-quiet-house','the-quiet-house-book-two','Book Two: Counting Doors',null,$b$There were nine. There are eleven. Nobody built anything.$b$,2,'published'),
 ('saltwater-letters','saltwater-letters-book-one','Book One: Off Season',null,$b$Eleven years of letters between an island and everywhere else.$b$,1,'published'),
 ('the-cartographers-guild','the-cartographers-guild-book-one','Book One: The Ardenmoor Survey',null,$b$A junior cartographer is sent to measure a valley that refuses to hold still.$b$,1,'published'),
 ('the-cartographers-guild','the-cartographers-guild-book-two','Book Two: The Disputed Coast',null,$b$Two guilds, one shoreline, and a tide that answers to neither.$b$,2,'published'),
 ('ninety-seconds','ninety-seconds-book-one','Book One: Nightshift',null,$b$Eight calls. One night. Real time.$b$,1,'published'),
 ('the-understudy','the-understudy-book-one','Book One: Opening Night',null,$b$The lead is unwell again. The understudy is delighted and terrified.$b$,1,'published')
) as v(series_slug, slug, title, subtitle, description, seq, status)
join public.series s on s.slug = v.series_slug;

create temporary table _prose (i int primary key, para text, rough text);
insert into _prose values
(0,$p$Maya reached the platform at 11:44 and the board still said on time, which was the first lie of the evening.$p$,$p$maya got to the platform at like 11:44 and the board said on time which was the first lie of the night i guess$p$),
(1,$p$The carriage smelled of wet coats and vending machine coffee. Four people sat inside it and none of them looked up.$p$,$p$the carriage smelled like wet coats and that vending machine coffee smell, 4 people inside, nobody looked up at all$p$),
(2,$p$Later she would describe it as the moment the clock hesitated. Not stopped. Hesitated, the way a person does before admitting something.$p$,$p$later she said it was like the clock hesitated, not stopped exactly, hesitated like a person does before they admit something$p$),
(3,$p$The tunnel took longer than it should have. She counted, because counting was the only thing left to do.$p$,$p$the tunnel took way longer than normal and she counted because there wasnt anything else to do$p$),
(4,$p$A man in a grey coat sat down opposite her and said, without introduction, that he had been on this train since Thursday.$p$,$p$this guy in a grey coat sits down across from her and just says he has been on the train since thursday, no hello nothing$p$),
(5,$p$There is a particular quiet that belongs to buildings at four in the morning, and the house had learned to imitate it perfectly.$p$,$p$theres a certain quiet that houses have at 4am and this house had gotten really good at faking it$p$),
(6,$p$Nobody agreed on how many doors there were. That was the part that frightened her, more than the sounds.$p$,$p$nobody could agree how many doors there were and honestly that scared her more than the noises did$p$),
(7,$p$From orbit the coastline had been a single confident line. Up close it was mud, argument, and a woman shouting about a fence.$p$,$p$from up in orbit the coast was one clean line, close up its just mud and arguing and some woman yelling about a fence$p$),
(8,$p$Forty-seven years is not a long time for a star. It is an entire life for a hallway, a marriage, a way of pronouncing a word.$p$,$p$47 years is nothing to a star but its a whole lifetime for a hallway or a marriage or how you say a word$p$),
(9,$p$The Guild recorded the river three feet east of where the river had chosen to be, and the river, being older than the Guild, ignored the correction.$p$,$p$the guild wrote the river down 3 feet east of where it actually was and the river just ignored them, its older than they are$p$),
(10,$p$He wrote to her in October and she answered in March, which they both understood to be quick.$p$,$p$he wrote to her in oct and she wrote back in march and for them that was basically fast$p$),
(11,$p$The call came in at 4:02. By 4:03 the kitchen had four people in it and none of them were breathing normally.$p$,$p$call came in at 4:02, by 4:03 theres 4 people in that kitchen and nobody is breathing right$p$),
(12,$p$Backstage the understudy was already in costume, which everybody later agreed was suspicious, given that the lead had not yet fallen ill.$p$,$p$the understudy was already in costume backstage which everyone agreed after was pretty suspicious since the lead hadnt even gotten sick yet$p$),
(13,$p$She had rehearsed the sentence for eleven years and still delivered it to the wrong person.$p$,$p$she practiced that sentence for 11 years and still said it to the wrong person lol$p$);

create temporary table _ct (n int, title text, subtitle text);
insert into _ct values
(1,'The 11:47','Maya misses nothing, and everything'),(2,'Carriage Four',null),(3,'The Hesitating Clock',null),(4,'Thursday Man',null),(5,'Bellhaven, Northbound',null),(6,'What the Board Said',null),
(7,'Six Passengers, Nine Tickets',null),(8,'The Long Tunnel',null),(9,'A Secret, Kept Badly',null),(10,'The Woman Who Waited',null),(11,'Timetable for the Dead',null),(12,'Return Fare',null),
(13,'Rules of the Line',null),(14,'Forty-One Years',null),(15,'The Nameless Post',null),(16,'Unscheduled Stop',null),(17,'The Station That Was Not There',null),
(18,'Splashdown','Reentry, hour one'),(19,'Quarantine',null),(20,'Press Conference',null),(21,'The Grandchildren',null),(22,'Ground Truth',null),(23,'Second Launch',null),
(24,'The Lease',null),(25,'Housemates',null),(26,'Counting Doors',null),(27,'Four in the Morning',null),(28,'The Eleventh Door',null),(29,'What the House Heard',null),
(30,'Off Season',null),(31,'October, March',null),(32,'The Wrong Person',null),(33,'Eleven Years Late',null),
(34,'The Ardenmoor Survey',null),(35,'A River, Corrected',null),(36,'The Disputed Coast',null),(37,'Tidewriting',null),
(38,'4:02',null),(39,'Ninety Seconds',null),(40,'Opening Night',null);

create temporary table _cb (n int, book_slug text, seq int);
insert into _cb
select n, case
  when n<=6 then 'the-last-train-book-one' when n<=12 then 'the-last-train-book-two'
  when n<=15 then 'the-conductor-book-one' when n<=17 then 'the-conductor-book-two'
  when n<=20 then 'forty-seven-years-book-one' when n<=22 then 'forty-seven-years-book-two' when n<=23 then 'forty-seven-years-book-three'
  when n<=26 then 'the-quiet-house-book-one' when n<=29 then 'the-quiet-house-book-two'
  when n<=33 then 'saltwater-letters-book-one'
  when n<=35 then 'the-cartographers-guild-book-one' when n<=37 then 'the-cartographers-guild-book-two'
  when n<=39 then 'ninety-seconds-book-one' else 'the-understudy-book-one' end,
 0 from generate_series(1,40) n;
update _cb c set seq = s.rn from (select n, row_number() over (partition by book_slug order by n) rn from _cb) s where s.n = c.n;

insert into public.chapters (series_id, book_id, slug, sequence, title, subtitle, summary, published_content, raw_content, read_count, like_count, published_at)
select b.series_id, b.id,
  'ch-' || t.n || '-' || regexp_replace(lower(t.title), '[^a-z0-9]+', '-', 'g'),
  cb.seq, t.title, t.subtitle,
  (select para from _prose where i = (t.n * 3) % 14),
  (select string_agg(para, E'\n\n' order by k)
     from (select k, (select para from _prose where i = (t.n * 5 + k) % 14) as para from generate_series(0,5) k) q),
  (select string_agg(rough, E'\n\n' order by k)
     from (select k, (select rough from _prose where i = (t.n * 5 + k) % 14) as rough from generate_series(0,5) k) q),
  1400 + (t.n * 733) % 40000, 40 + (t.n * 97) % 900,
  now() - ((41 - t.n) * interval '6 days')
from _ct t join _cb cb on cb.n = t.n join public.books b on b.slug = cb.book_slug;

insert into public.games (series_id, book_id, host_id, title, premise, genre, status, visibility_mode, rounds, turn_seconds, max_chars, min_players, max_players, chapter_sequence, started_at, completed_at, current_round)
select c.series_id, c.book_id, s.creator_id, c.title, coalesce(nullif(c.summary,''), s.tagline), s.genre, 'completed', 'contextual', 8, 90, 400, 3, 6,
  c.sequence, c.published_at - interval '2 days', c.published_at - interval '1 day', 8
from public.chapters c join public.series s on s.id = c.series_id;

update public.chapters c set source_game_id = g.id
from public.games g
where g.status = 'completed' and g.series_id = c.series_id and g.book_id = c.book_id and g.chapter_sequence = c.sequence;

insert into public.contributions (game_id, chapter_id, author_id, position, original_text, char_count, created_at)
select c.source_game_id, c.id, p.id, k,
  (select rough from _prose where i = (c.sequence * 5 + k) % 14),
  length((select rough from _prose where i = (c.sequence * 5 + k) % 14)),
  c.published_at - interval '2 days' + (k * interval '4 minutes')
from public.chapters c
cross join generate_series(0,5) k
join lateral (select id from public.profiles where not is_creator order by md5(id::text || c.id::text || k::text) limit 1) p on true;

insert into public.contribution_polish_versions (contribution_id, polished_text, style, model)
select co.id, (select para from _prose where i = (ch.sequence * 5 + co.position) % 14), 'balanced', 'google/gemini-3.5-flash'
from public.contributions co join public.chapters ch on ch.id = co.chapter_id;

insert into public.chapter_contributors (chapter_id, user_id, contribution_count)
select chapter_id, author_id, count(*) from public.contributions where chapter_id is not null group by 1,2
on conflict do nothing;

insert into public.games (series_id, host_id, title, premise, genre, status, visibility_mode, rounds, turn_seconds, max_chars, min_players, max_players, current_round, started_at, reward_sparks)
select s.id, s.creator_id, v.title, v.premise, s.genre, v.status::public.game_status, v.vis::public.visibility_mode, v.rounds, v.secs, 400, 2, v.maxp, v.cur,
  case when v.status='active' then now() - interval '18 minutes' else null end, v.reward
from (values
 ('the-last-train','The 12:03 to Nowhere',$b$A second train appears on the Bellhaven board. It has never existed. Six passengers board it anyway.$b$,'active','contextual',12,90,6,7,25),
 ('the-quiet-house','The Basement Inventory',$b$The landlord asks the housemates to count everything in the basement. The list keeps getting longer than the room.$b$,'active','blind',10,120,5,4,40),
 ('forty-seven-years','Debrief, Room 9',$b$Six people who never left Earth interview the one who did. Only one of them is telling the truth about why.$b$,'active','open',8,120,6,5,30),
 ('ninety-seconds','Call Sign Delta',$b$4:02am. A kitchen fire, a locked door, and ninety seconds of oxygen left in the tank.$b$,'active','contextual',6,60,4,3,25),
 ('the-understudy','Act Two, Slight Problem',$b$The lead has vanished between acts. The audience is still seated. Somebody has to go on.$b$,'active','open',4,60,8,2,20),
 ('the-cartographers-guild','The Valley That Moved',$b$A junior cartographer measures the same valley twice and gets two different answers. The Guild wants a third.$b$,'waiting','contextual',10,90,6,0,35),
 ('saltwater-letters','Letters from the Mainland',$b$One letter each. Nobody reads the replies until the chapter publishes.$b$,'waiting','blind',8,180,8,0,30),
 ('the-conductor','The Rulebook, Page Forty',$b$A page of the timetable that no conductor has ever been allowed to read aloud.$b$,'waiting','contextual',8,90,5,0,25),
 ('the-last-train','Bellhaven, Southbound',$b$The line reverses for the first time in forty-one years. Nobody knows what is at the other end.$b$,'waiting','contextual',12,90,6,0,50),
 ('the-quiet-house','Housewarming',$b$New tenants. Same lease. The house is on its best behaviour, which is worse.$b$,'waiting','blind',10,120,6,0,35)
) as v(series_slug,title,premise,status,vis,rounds,secs,maxp,cur,reward)
join public.series s on s.slug = v.series_slug;

insert into public.game_players (game_id, user_id, seat_order, is_host)
select g.id, g.host_id, 0, true from public.games g where g.status in ('active','waiting');
insert into public.game_players (game_id, user_id, seat_order)
select g.id, p.id, k
from public.games g
cross join lateral generate_series(1, greatest(g.current_round % g.max_players, case when g.status='active' then 3 else 1 end)) k
join lateral (select id from public.profiles where not is_creator order by md5(id::text || g.id::text || k::text) limit 1) p on true
on conflict do nothing;

insert into public.game_turns (game_id, round, turn_index, player_id, status, starts_at, ends_at)
select g.id, 1 + gp.seat_order, gp.seat_order, gp.user_id,
  case when gp.seat_order = 1 then 'active' when gp.seat_order < 1 then 'submitted' else 'pending' end::public.turn_status,
  case when gp.seat_order = 1 then now() else null end,
  case when gp.seat_order = 1 then now() + make_interval(secs => g.turn_seconds) else null end
from public.games g join public.game_players gp on gp.game_id = g.id
where g.status = 'active';

insert into public.game_challenges (game_id, round, kind, text, reward_sparks)
select g.id, 1, k.kind, k.text, 25 from public.games g
join lateral (select * from (values
  ('twist','Someone in this scene is lying. Do not say who.'),
  ('challenge','Introduce a new character without naming them.'),
  ('challenge','End your contribution with a question.'),
  ('constraint','Do not use the word remember.'),
  ('twist','Something that was described earlier turns out to be wrong.')
) as t(kind,text) order by md5(g.id::text || t.kind) limit 1) k on true
where g.status in ('active','waiting');

insert into public.story_bible_entries (series_id, kind, name, body, sort_order)
select s.id, v.kind, v.name, v.body, v.so from (values
 ('the-last-train','character','Maya Ortiz',$b$Thirty-four. Archivist at the Bellhaven municipal records office. Rides the 11:47 five nights a week. Counts things when frightened. Status: aboard.$b$,1),
 ('the-last-train','character','The Man in the Grey Coat',$b$Claims to have boarded on Thursday. Which Thursday is disputed. Never carries a ticket. Status: unresolved.$b$,2),
 ('the-last-train','location','Bellhaven Station',$b$Two platforms, one working clock. Built 1911. The southbound platform has been closed since the accident and nobody who works there will say which accident.$b$,3),
 ('the-last-train','rule','The Timetable Is Binding',$b$If the board says a train exists, it exists. If the board changes its mind, so does the world. Contributors may bend geography but never the timetable.$b$,4),
 ('the-last-train','timeline','Third Tuesday, October',$b$The night the 11:47 did not stop at Ashgrove. All canon events are dated from here.$b$,5),
 ('the-last-train','mystery','Who closed the southbound platform?',$b$Open since Chapter 2. Community theories: the Guild, the conductor, Maya herself.$b$,6),
 ('the-last-train','canon','Carriage four holds more people than it seats',$b$Approved by creator in Chapter 8 review.$b$,7),
 ('the-last-train','theme','Missed chances, measured in minutes',$b$Tone: restrained. Never explain the supernatural. Let the timetable do it.$b$,8),
 ('the-quiet-house','character','Rosalind Vey',$b$Signed the lease first. Keeps the door count in a notebook nobody else is allowed to see.$b$,1),
 ('the-quiet-house','rule','The House Never Speaks',$b$It rearranges, it waits, it listens. It does not have dialogue. Any contribution giving the house a voice is non-canon.$b$,2),
 ('the-quiet-house','mystery','What is behind the eleventh door?',$b$Open. Creator canon only.$b$,3),
 ('forty-seven-years','character','Cdr. Ada Nwosu',$b$Left Earth at thirty-one. Returned at seventy-eight by the calendar and thirty-four by her own body. Speaks a version of English that stopped updating in the 2070s.$b$,1),
 ('forty-seven-years','rule','Physics Is Not Negotiable',$b$Relativity holds. Contributors may invent culture, politics and grief, but not new propulsion.$b$,2),
 ('the-cartographers-guild','rule','A Map Is A Legal Document',$b$What the Guild draws becomes true within one season. This is the central engine of the series. Do not break it for convenience.$b$,1),
 ('the-cartographers-guild','location','Ardenmoor Valley',$b$Measured eleven times, eleven different results. Currently under third survey.$b$,2)
) as v(series_slug,kind,name,body,so) join public.series s on s.slug = v.series_slug;

insert into public.polls (series_id, chapter_id, question, closes_at)
select c.series_id, c.id, 'What should happen next?', now() + interval '2 days'
from public.chapters c where c.sequence = 6;
insert into public.poll_options (poll_id, text, vote_count, sort_order)
select p.id, v.text, v.votes, v.so from public.polls p
cross join (values
 ('Maya discovers the hidden station', 4218, 1),
 ('Daniel disappears between carriages', 3110, 2),
 ('The train changes what happened yesterday', 2704, 3)
) as v(text,votes,so);

insert into public.follows (follower_id, target_type, target_id)
select p.id, 'series', s.id from public.profiles p join public.series s on true
where (abs(hashtext(p.username || s.slug)) % 100) < 45 on conflict do nothing;
insert into public.follows (follower_id, target_type, target_id)
select p.id, 'creator', c.id from public.profiles p join public.profiles c on c.is_creator and c.id <> p.id
where (abs(hashtext(p.username || c.username)) % 100) < 30 on conflict do nothing;

insert into public.likes (user_id, target_type, target_id)
select p.id, 'chapter', ch.id from public.profiles p join public.chapters ch on true
where (abs(hashtext(p.username || ch.slug)) % 100) < 22 on conflict do nothing;

insert into public.comments (user_id, target_type, target_id, body, created_at)
select p.id, 'chapter', ch.id, v.body, ch.published_at + interval '3 hours'
from public.chapters ch
join lateral (select * from (values
 ($b$I wrote two sentences in round five and seeing them land inside an actual chapter is a strange and wonderful feeling.$b$),
 ($b$The pacing in this one is unreal considering nine different people wrote it.$b$),
 ($b$Reading the Behind the Story view for this chapter honestly made me want to join the next game.$b$),
 ($b$Whoever wrote the grey coat paragraph, you ruined my evening in the best way.$b$),
 ($b$Third time reading. Still noticing new things in the timetable details.$b$)
) t(body) order by md5(ch.slug || t.body) limit 2) v on true
join lateral (select id from public.profiles order by md5(id::text || ch.slug || v.body) limit 1) p on true;

insert into public.notifications (user_id, kind, title, body, link)
select p.id, 'chapter_published', 'A new chapter just published', 'The Last Train: Return Fare is live.', '/series/the-last-train'
from public.profiles p where (abs(hashtext(p.username)) % 100) < 60;
insert into public.notifications (user_id, kind, title, body, link)
select p.id, 'game_starting', 'A game you follow is filling up', 'Bellhaven, Southbound needs two more players.', '/play'
from public.profiles p where (abs(hashtext(p.username)) % 100) < 35;

drop table _prose; drop table _ct; drop table _cb;
