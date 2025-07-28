import { supabase } from '@/integrations/supabase/client';

// Test data arrays for generating random content
const composers = [
  'Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach',
  'Frédéric Chopin', 'Pyotr Ilyich Tchaikovsky', 'Claude Debussy',
  'Johannes Brahms', 'Antonio Vivaldi', 'Franz Schubert', 'Igor Stravinsky'
];

const pieces = [
  'Symphony No. 9', 'Piano Concerto No. 1', 'Brandenburg Concerto No. 3',
  'Nocturne in E-flat major', 'Swan Lake', 'Clair de Lune',
  'Violin Concerto', 'The Four Seasons', 'Ave Maria', 'The Rite of Spring'
];

const orchestras = [
  'Berlin Philharmonic', 'Vienna Philharmonic', 'London Symphony Orchestra',
  'New York Philharmonic', 'Royal Concertgebouw Orchestra', 'Chicago Symphony Orchestra',
  'Boston Symphony Orchestra', 'Cleveland Orchestra', 'Philadelphia Orchestra'
];

const conductors = [
  'Herbert von Karajan', 'Leonard Bernstein', 'Claudio Abbado',
  'Gustavo Dudamel', 'Simon Rattle', 'Riccardo Muti',
  'Daniel Barenboim', 'Mariss Jansons', 'Esa-Pekka Salonen'
];

const venues = [
  'Carnegie Hall', 'Vienna State Opera', 'Royal Albert Hall',
  'Walt Disney Concert Hall', 'Musikverein', 'Concertgebouw',
  'Symphony Hall Boston', 'Berlin Philharmonie', 'La Scala'
];

const cities = [
  'New York', 'Vienna', 'London', 'Los Angeles', 'Berlin',
  'Amsterdam', 'Boston', 'Milan', 'Paris', 'Tokyo'
];

const notes = [
  'Absolutely stunning performance with incredible dynamics.',
  'The orchestra was in perfect sync, truly mesmerizing.',
  'Beautiful interpretation, very moving and emotional.',
  'Technically brilliant but perhaps lacking some passion.',
  'A revelatory performance that brought new insights to this familiar work.',
  'The acoustics were perfect, every note crystal clear.',
  'Outstanding soloists, especially the violin section.',
  'A transcendent experience that left me speechless.'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomRating(): number {
  return Math.floor(Math.random() * 5) + 1; // 1-5 stars
}

function getRandomDate(): string {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

export async function generateTestData() {
  console.log('🎵 Starting test data generation...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ User must be logged in to generate test data');
      return;
    }

    console.log('👤 Generating for user:', user.email);

    // Generate random recordings
    console.log('🎼 Creating recording entries...');
    for (let i = 0; i < 5; i++) {
      const composer = getRandomElement(composers);
      const piece = getRandomElement(pieces);
      const orchestra = getRandomElement(orchestras);
      const conductor = getRandomElement(conductors);

      // Create or find composer
      let { data: existingComposer } = await supabase
        .from('composers')
        .select('id')
        .ilike('name', composer)
        .single();

      let composerId;
      if (!existingComposer) {
        const { data: newComposer } = await supabase
          .from('composers')
          .insert({ name: composer })
          .select('id')
          .single();
        composerId = newComposer?.id;
      } else {
        composerId = existingComposer.id;
      }

      if (!composerId) continue;

      // Create or find piece
      let { data: existingPiece } = await supabase
        .from('pieces')
        .select('id')
        .eq('composer_id', composerId)
        .ilike('title', piece)
        .single();

      let pieceId;
      if (!existingPiece) {
        const { data: newPiece } = await supabase
          .from('pieces')
          .insert({
            title: piece,
            composer_id: composerId
          })
          .select('id')
          .single();
        pieceId = newPiece?.id;
      } else {
        pieceId = existingPiece.id;
      }

      if (!pieceId) continue;

      // Create or find recording
      let { data: existingRecording } = await supabase
        .from('recordings')
        .select('id')
        .eq('piece_id', pieceId)
        .eq('conductor', conductor)
        .eq('orchestra', orchestra)
        .single();

      let recordingId;
      if (!existingRecording) {
        const { data: newRecording } = await supabase
          .from('recordings')
          .insert({
            piece_id: pieceId,
            conductor: conductor,
            orchestra: orchestra
          })
          .select('id')
          .single();
        recordingId = newRecording?.id;
      } else {
        recordingId = existingRecording.id;
      }

      if (!recordingId) continue;

      // Create user entry
      await supabase
        .from('user_entries')
        .insert({
          user_id: user.id,
          entry_type: 'recording',
          recording_id: recordingId,
          rating: getRandomRating(),
          notes: getRandomElement(notes),
          entry_date: getRandomDate()
        });

      console.log(`✅ Created recording entry: ${composer} - ${piece}`);
    }

    // Generate random concerts
    console.log('🎭 Creating concert entries...');
    for (let i = 0; i < 3; i++) {
      const venue = getRandomElement(venues);
      const city = getRandomElement(cities);
      const orchestra = getRandomElement(orchestras);
      const conductor = getRandomElement(conductors);
      const concertTitle = `${orchestra} performs ${getRandomElement(composers)}`;

      // Create concert
      const { data: newConcert } = await supabase
        .from('concerts')
        .insert({
          title: concertTitle,
          venue: venue,
          location: city,
          concert_date: getRandomDate(),
          orchestra: orchestra,
          conductor: conductor,
          program: `${getRandomElement(pieces)}, ${getRandomElement(pieces)}`,
          source: 'user'
        })
        .select('id')
        .single();

      if (!newConcert) continue;

      // Create user entry
      await supabase
        .from('user_entries')
        .insert({
          user_id: user.id,
          entry_type: 'concert',
          concert_id: newConcert.id,
          rating: getRandomRating(),
          notes: getRandomElement(notes),
          entry_date: getRandomDate()
        });

      console.log(`✅ Created concert entry: ${concertTitle}`);
    }

    console.log('🎉 Test data generation complete!');
    console.log('📊 Check your Library page to see the entries');
    console.log('🔍 Or check Supabase dashboard > Table Editor > user_entries');

  } catch (error) {
    console.error('❌ Error generating test data:', error);
  }
}

console.log('📦 Test data generator loaded');