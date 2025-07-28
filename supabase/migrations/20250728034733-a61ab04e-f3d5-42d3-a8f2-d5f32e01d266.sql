-- Insert sample composers (if they don't exist)
INSERT INTO composers (name, birth_year, death_year, period, nationality) 
SELECT name, birth_year, death_year, period, nationality
FROM (VALUES
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
) AS t(name, birth_year, death_year, period, nationality)
WHERE NOT EXISTS (SELECT 1 FROM composers WHERE composers.name = t.name);

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
  AND NOT EXISTS (
    SELECT 1 FROM pieces p2 
    WHERE p2.title = piece_data.title AND p2.composer_id = c.id
  );