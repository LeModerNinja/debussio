// Centralized constants
export const RATING_CATEGORIES = {
  recording: [
    { key: 'conductor_rating', label: 'Conductor', description: 'Leadership and musical direction' },
    { key: 'recording_quality_rating', label: 'Recording Quality', description: 'Sound clarity and production' },
    { key: 'orchestra_rating', label: 'Orchestra', description: 'Ensemble performance and precision' },
    { key: 'soloist_rating', label: 'Soloist', description: 'Individual performer excellence' },
    { key: 'interpretation_rating', label: 'Interpretation', description: 'Artistic vision and expression' },
    { key: 'acoustics_rating', label: 'Acoustics', description: 'Venue and recording space quality' }
  ],
  concert: [
    { key: 'conductor_rating', label: 'Conductor', description: 'Leadership and musical direction' },
    { key: 'orchestra_rating', label: 'Orchestra', description: 'Ensemble performance and precision' },
    { key: 'soloist_rating', label: 'Soloist', description: 'Individual performer excellence' },
    { key: 'interpretation_rating', label: 'Interpretation', description: 'Artistic vision and expression' },
    { key: 'acoustics_rating', label: 'Acoustics', description: 'Venue and sound quality' },
    { key: 'program_rating', label: 'Program', description: 'Selection and variety of pieces' }
  ]
} as const;

export const PIECE_CATEGORIES = {
  symphonic: {
    label: 'Symphonic',
    description: 'Symphonies, concertos, orchestral works',
    fields: ['conductor', 'orchestra', 'soloist']
  },
  chamber: {
    label: 'Chamber Music',
    description: 'String quartets, trios, small ensembles',
    fields: ['ensemble', 'players']
  },
  solo: {
    label: 'Solo',
    description: 'Piano solo, violin solo, etc.',
    fields: ['soloist', 'instrument']
  },
  vocal: {
    label: 'Vocal',
    description: 'Opera, art songs, choral works',
    fields: ['conductor', 'orchestra', 'soloist', 'choir']
  }
} as const;

export const SAMPLE_DATA = {
  composers: ['Bach', 'Mozart', 'Beethoven', 'Tchaikovsky', 'Chopin', 'Brahms'],
  orchestras: ['Berlin Philharmonic', 'Vienna Philharmonic', 'London Symphony Orchestra'],
  conductors: ['Herbert von Karajan', 'Leonard Bernstein', 'Gustavo Dudamel'],
  venues: ['Carnegie Hall', 'Vienna State Opera', 'Royal Albert Hall'],
  locations: ['New York', 'London', 'Vienna', 'Berlin', 'Paris', 'Boston']
} as const;