-- Add external ID tracking for API integration
ALTER TABLE recordings ADD COLUMN spotify_id TEXT;
ALTER TABLE recordings ADD COLUMN musicbrainz_id TEXT;
ALTER TABLE concerts ADD COLUMN external_event_id TEXT;
ALTER TABLE concerts ADD COLUMN source TEXT DEFAULT 'user'; -- 'bachtrack', 'songkick', 'user', etc.

-- Add indexes for better performance on external IDs
CREATE INDEX idx_recordings_spotify_id ON recordings(spotify_id) WHERE spotify_id IS NOT NULL;
CREATE INDEX idx_recordings_musicbrainz_id ON recordings(musicbrainz_id) WHERE musicbrainz_id IS NOT NULL;
CREATE INDEX idx_concerts_external_event_id ON concerts(external_event_id) WHERE external_event_id IS NOT NULL;
CREATE INDEX idx_concerts_source ON concerts(source);

-- Add more detailed fields for better search and categorization
ALTER TABLE recordings ADD COLUMN popularity_score INTEGER DEFAULT 0;
ALTER TABLE recordings ADD COLUMN external_urls JSONB;
ALTER TABLE concerts ADD COLUMN tags TEXT[];
ALTER TABLE concerts ADD COLUMN price_range TEXT;

-- Create indexes for new fields
CREATE INDEX idx_recordings_popularity ON recordings(popularity_score);
CREATE INDEX idx_concerts_tags ON concerts USING GIN(tags);

-- Insert sample composers
INSERT INTO composers (name, birth_year, death_year, period, nationality) VALUES
('Ludwig van Beethoven', 1770, 1827, 'Classical/Romantic', 'German'),
('Wolfgang Amadeus Mozart', 1756, 1791, 'Classical', 'Austrian'),
('Johann Sebastian Bach', 1685, 1750, 'Baroque', 'German'),
('Pyotr Ilyich Tchaikovsky', 1840, 1893, 'Romantic', 'Russian'),
('Claude Debussy', 1862, 1918, 'Impressionist', 'French'),
('Frédéric Chopin', 1810, 1849, 'Romantic', 'Polish'),
('Antonio Vivaldi', 1678, 1741, 'Baroque', 'Italian'),
('Johannes Brahms', 1833, 1897, 'Romantic', 'German'),
('Igor Stravinsky', 1882, 1971, 'Modern', 'Russian'),
('Franz Schubert', 1797, 1828, 'Classical/Romantic', 'Austrian')
ON CONFLICT (name) DO NOTHING;

-- Insert sample pieces
INSERT INTO pieces (title, composer_id, opus_number, key_signature, genre, duration_minutes, catalog_number) 
SELECT 
    piece_data.title,
    c.id,
    piece_data.opus_number,
    piece_data.key_signature,
    piece_data.genre,
    piece_data.duration_minutes,
    piece_data.catalog_number
FROM composers c
CROSS JOIN (VALUES
    ('Symphony No. 9 in D minor "Choral"', 'Ludwig van Beethoven', 'Op. 125', 'D minor', 'Symphony', 70, NULL),
    ('Piano Sonata No. 14 "Moonlight"', 'Ludwig van Beethoven', 'Op. 27 No. 2', 'C# minor', 'Piano Sonata', 15, NULL),
    ('Symphony No. 40 in G minor', 'Wolfgang Amadeus Mozart', 'K. 550', 'G minor', 'Symphony', 35, NULL),
    ('Eine kleine Nachtmusik', 'Wolfgang Amadeus Mozart', 'K. 525', 'G major', 'Serenade', 25, NULL),
    ('The Well-Tempered Clavier, Book I', 'Johann Sebastian Bach', 'BWV 846-869', 'Various', 'Keyboard', 120, NULL),
    ('Brandenburg Concerto No. 3', 'Johann Sebastian Bach', 'BWV 1048', 'G major', 'Concerto', 12, NULL),
    ('Swan Lake Suite', 'Pyotr Ilyich Tchaikovsky', 'Op. 20', 'Various', 'Ballet Suite', 75, NULL),
    ('Piano Concerto No. 1', 'Pyotr Ilyich Tchaikovsky', 'Op. 23', 'B♭ minor', 'Piano Concerto', 35, NULL),
    ('Clair de Lune', 'Claude Debussy', 'L. 75', 'D♭ major', 'Piano Piece', 5, NULL),
    ('La Mer', 'Claude Debussy', 'L. 109', 'Various', 'Orchestral', 25, NULL),
    ('Nocturne in E♭ major', 'Frédéric Chopin', 'Op. 9 No. 2', 'E♭ major', 'Nocturne', 4, NULL),
    ('Ballade No. 1 in G minor', 'Frédéric Chopin', 'Op. 23', 'G minor', 'Ballade', 9, NULL),
    ('The Four Seasons', 'Antonio Vivaldi', 'Op. 8', 'Various', 'Violin Concertos', 40, 'RV 269-272'),
    ('Gloria in D major', 'Antonio Vivaldi', 'RV 589', 'D major', 'Sacred Choral', 30, NULL),
    ('Symphony No. 4 in E minor', 'Johannes Brahms', 'Op. 98', 'E minor', 'Symphony', 40, NULL),
    ('Hungarian Dance No. 5', 'Johannes Brahms', 'WoO 1', 'G minor', 'Dance', 3, NULL),
    ('The Rite of Spring', 'Igor Stravinsky', NULL, 'Various', 'Ballet', 35, NULL),
    ('Firebird Suite', 'Igor Stravinsky', NULL, 'Various', 'Ballet Suite', 25, NULL),
    ('Symphony No. 8 "Unfinished"', 'Franz Schubert', 'D. 759', 'B minor', 'Symphony', 25, NULL),
    ('Ave Maria', 'Franz Schubert', 'D. 839', 'B♭ major', 'Sacred Song', 4, NULL)
) AS piece_data(title, composer_name, opus_number, key_signature, genre, duration_minutes, catalog_number)
WHERE c.name = piece_data.composer_name
ON CONFLICT DO NOTHING;

-- Insert sample recordings
INSERT INTO recordings (piece_id, orchestra, conductor, soloists, label, album_title, release_year, popularity_score)
SELECT 
    p.id,
    rec_data.orchestra,
    rec_data.conductor,
    rec_data.soloists,
    rec_data.label,
    rec_data.album_title,
    rec_data.release_year,
    rec_data.popularity_score
FROM pieces p
JOIN composers c ON p.composer_id = c.id
CROSS JOIN (VALUES
    ('Symphony No. 9 in D minor "Choral"', 'Ludwig van Beethoven', 'Berlin Philharmonic', 'Herbert von Karajan', NULL, 'Deutsche Grammophon', 'Beethoven: Symphony No. 9', 1976, 95),
    ('Symphony No. 9 in D minor "Choral"', 'Ludwig van Beethoven', 'Vienna Philharmonic', 'Leonard Bernstein', 'Gundula Janowitz, Christa Ludwig', 'Deutsche Grammophon', 'Beethoven: Symphony No. 9 - Live', 1979, 90),
    ('Piano Sonata No. 14 "Moonlight"', 'Ludwig van Beethoven', NULL, NULL, 'Vladimir Ashkenazy', 'Decca', 'Beethoven: Piano Sonatas', 1972, 85),
    ('Symphony No. 40 in G minor', 'Wolfgang Amadeus Mozart', 'Vienna Philharmonic', 'Karl Böhm', NULL, 'Deutsche Grammophon', 'Mozart: Symphonies 40 & 41', 1977, 92),
    ('The Well-Tempered Clavier, Book I', 'Johann Sebastian Bach', NULL, NULL, 'Glenn Gould', 'Columbia', 'Bach: The Well-Tempered Clavier', 1962, 98),
    ('Swan Lake Suite', 'Pyotr Ilyich Tchaikovsky', 'London Symphony Orchestra', 'André Previn', NULL, 'EMI', 'Tchaikovsky: Swan Lake', 1976, 87),
    ('The Four Seasons', 'Antonio Vivaldi', 'English Chamber Orchestra', 'Nigel Kennedy', 'Nigel Kennedy', 'EMI', 'Vivaldi: The Four Seasons', 1989, 94),
    ('The Rite of Spring', 'Igor Stravinsky', 'New York Philharmonic', 'Leonard Bernstein', NULL, 'Columbia', 'Stravinsky: The Rite of Spring', 1972, 91)
) AS rec_data(piece_title, composer_name, orchestra, conductor, soloists, label, album_title, release_year, popularity_score)
WHERE p.title = rec_data.piece_title AND c.name = rec_data.composer_name
ON CONFLICT DO NOTHING;

-- Insert sample concerts
INSERT INTO concerts (title, venue, location, concert_date, start_time, orchestra, conductor, soloists, program, ticket_url, tags, price_range, source)
VALUES
('Berlin Philharmonic: Beethoven Symphony Cycle', 'Berliner Philharmonie', 'Berlin, Germany', '2024-09-15', '20:00', 'Berlin Philharmonic', 'Kirill Petrenko', NULL, 'Beethoven: Symphony No. 9 in D minor, Op. 125', 'https://www.berliner-philharmoniker.de', ARRAY['beethoven', 'symphony', 'classical'], '€45-€150', 'user'),
('Vienna New Year Concert 2024', 'Musikverein', 'Vienna, Austria', '2024-01-01', '11:15', 'Vienna Philharmonic', 'Christian Thielemann', NULL, 'Johann Strauss II: Waltzes and Polkas', 'https://www.wienerphilharmoniker.at', ARRAY['new-year', 'strauss', 'vienna'], '€50-€300', 'user'),
('Carnegie Hall: Chopin Recital', 'Carnegie Hall', 'New York, NY', '2024-08-20', '19:30', NULL, NULL, 'Daniil Trifonov', 'Chopin: Complete Nocturnes', 'https://www.carnegiehall.org', ARRAY['chopin', 'piano', 'recital'], '$35-$125', 'user'),
('London Symphony: Mahler Symphony No. 2', 'Barbican Centre', 'London, UK', '2024-10-05', '19:30', 'London Symphony Orchestra', 'Simon Rattle', 'Christine Goerke, Alice Coote', 'Mahler: Symphony No. 2 "Resurrection"', 'https://www.barbican.org.uk', ARRAY['mahler', 'symphony', 'resurrection'], '£25-£95', 'user'),
('Chicago Symphony: Tchaikovsky Spectacular', 'Symphony Center', 'Chicago, IL', '2024-11-12', '20:00', 'Chicago Symphony Orchestra', 'Riccardo Muti', 'Hilary Hahn', 'Tchaikovsky: Violin Concerto, Symphony No. 5', 'https://www.cso.org', ARRAY['tchaikovsky', 'violin-concerto'], '$29-$150', 'user'),
('La Scala: La Traviata', 'Teatro alla Scala', 'Milan, Italy', '2024-12-07', '20:00', 'Orchestra del Teatro alla Scala', 'Riccardo Chailly', 'Anna Netrebko, Francesco Meli', 'Verdi: La Traviata', 'https://www.teatroallascala.org', ARRAY['verdi', 'opera', 'la-traviata'], '€35-€250', 'user'),
('Boston Symphony: Brahms Festival', 'Symphony Hall', 'Boston, MA', '2024-09-28', '20:00', 'Boston Symphony Orchestra', 'Andris Nelsons', 'Emanuel Ax', 'Brahms: Piano Concerto No. 2, Symphony No. 4', 'https://www.bso.org', ARRAY['brahms', 'piano-concerto'], '$35-$175', 'user'),
('Royal Concertgebouw: Bach Marathon', 'Concertgebouw', 'Amsterdam, Netherlands', '2024-08-30', '15:00', 'Royal Concertgebouw Orchestra', 'Daniele Gatti', NULL, 'Bach: Brandenburg Concertos (Complete)', 'https://www.concertgebouw.nl', ARRAY['bach', 'brandenburg', 'baroque'], '€25-€85', 'user'),
('Metropolitan Opera: The Magic Flute', 'Metropolitan Opera House', 'New York, NY', '2024-10-15', '19:30', 'Metropolitan Opera Orchestra', 'James Levine', 'Diana Damrau, Lawrence Brownlee', 'Mozart: Die Zauberflöte', 'https://www.metopera.org', ARRAY['mozart', 'opera', 'magic-flute'], '$25-$300', 'user'),
('Sydney Opera House: Vivaldi Gala', 'Sydney Opera House', 'Sydney, Australia', '2024-09-08', '19:30', 'Australian Chamber Orchestra', 'Richard Tognetti', 'Giuliano Carmignola', 'Vivaldi: The Four Seasons, Gloria', 'https://www.sydneyoperahouse.com', ARRAY['vivaldi', 'four-seasons', 'baroque'], 'AUD $45-$150', 'user');