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
  AND NOT EXISTS (
    SELECT 1 FROM recordings r2 
    WHERE r2.piece_id = p.id AND r2.conductor = rec_data.conductor
  );

-- Insert sample concerts
INSERT INTO concerts (title, venue, location, concert_date, start_time, orchestra, conductor, soloists, program, ticket_url, tags, price_range, source)
SELECT * FROM (VALUES
    ('Berlin Philharmonic: Beethoven Symphony Cycle', 'Berliner Philharmonie', 'Berlin, Germany', '2024-09-15', '20:00', 'Berlin Philharmonic', 'Kirill Petrenko', NULL, 'Beethoven: Symphony No. 9 in D minor, Op. 125', 'https://www.berliner-philharmoniker.de', ARRAY['beethoven', 'symphony', 'classical'], '€45-€150', 'user'),
    ('Vienna New Year Concert 2024', 'Musikverein', 'Vienna, Austria', '2024-01-01', '11:15', 'Vienna Philharmonic', 'Christian Thielemann', NULL, 'Johann Strauss II: Waltzes and Polkas', 'https://www.wienerphilharmoniker.at', ARRAY['new-year', 'strauss', 'vienna'], '€50-€300', 'user'),
    ('Carnegie Hall: Chopin Recital', 'Carnegie Hall', 'New York, NY', '2024-08-20', '19:30', NULL, NULL, 'Daniil Trifonov', 'Chopin: Complete Nocturnes', 'https://www.carnegiehall.org', ARRAY['chopin', 'piano', 'recital'], '$35-$125', 'user'),
    ('London Symphony: Mahler Symphony No. 2', 'Barbican Centre', 'London, UK', '2024-10-05', '19:30', 'London Symphony Orchestra', 'Simon Rattle', 'Christine Goerke, Alice Coote', 'Mahler: Symphony No. 2 "Resurrection"', 'https://www.barbican.org.uk', ARRAY['mahler', 'symphony', 'resurrection'], '£25-£95', 'user'),
    ('Chicago Symphony: Tchaikovsky Spectacular', 'Symphony Center', 'Chicago, IL', '2024-11-12', '20:00', 'Chicago Symphony Orchestra', 'Riccardo Muti', 'Hilary Hahn', 'Tchaikovsky: Violin Concerto, Symphony No. 5', 'https://www.cso.org', ARRAY['tchaikovsky', 'violin-concerto'], '$29-$150', 'user'),
    ('La Scala: La Traviata', 'Teatro alla Scala', 'Milan, Italy', '2024-12-07', '20:00', 'Orchestra del Teatro alla Scala', 'Riccardo Chailly', 'Anna Netrebko, Francesco Meli', 'Verdi: La Traviata', 'https://www.teatroallascala.org', ARRAY['verdi', 'opera', 'la-traviata'], '€35-€250', 'user'),
    ('Boston Symphony: Brahms Festival', 'Symphony Hall', 'Boston, MA', '2024-09-28', '20:00', 'Boston Symphony Orchestra', 'Andris Nelsons', 'Emanuel Ax', 'Brahms: Piano Concerto No. 2, Symphony No. 4', 'https://www.bso.org', ARRAY['brahms', 'piano-concerto'], '$35-$175', 'user'),
    ('Royal Concertgebouw: Bach Marathon', 'Concertgebouw', 'Amsterdam, Netherlands', '2024-08-30', '15:00', 'Royal Concertgebouw Orchestra', 'Daniele Gatti', NULL, 'Bach: Brandenburg Concertos (Complete)', 'https://www.concertgebouw.nl', ARRAY['bach', 'brandenburg', 'baroque'], '€25-€85', 'user'),
    ('Metropolitan Opera: The Magic Flute', 'Metropolitan Opera House', 'New York, NY', '2024-10-15', '19:30', 'Metropolitan Opera Orchestra', 'James Levine', 'Diana Damrau, Lawrence Brownlee', 'Mozart: Die Zauberflöte', 'https://www.metopera.org', ARRAY['mozart', 'opera', 'magic-flute'], '$25-$300', 'user'),
    ('Sydney Opera House: Vivaldi Gala', 'Sydney Opera House', 'Sydney, Australia', '2024-09-08', '19:30', 'Australian Chamber Orchestra', 'Richard Tognetti', 'Giuliano Carmignola', 'Vivaldi: The Four Seasons, Gloria', 'https://www.sydneyoperahouse.com', ARRAY['vivaldi', 'four-seasons', 'baroque'], 'AUD $45-$150', 'user')
) AS concert_data(title, venue, location, concert_date, start_time, orchestra, conductor, soloists, program, ticket_url, tags, price_range, source)
WHERE NOT EXISTS (
    SELECT 1 FROM concerts c2 
    WHERE c2.title = concert_data.title AND c2.venue = concert_data.venue
);