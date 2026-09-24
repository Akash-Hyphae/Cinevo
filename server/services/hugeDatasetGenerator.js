import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const CITIES_LIST = [
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', isPopular: true },
  { id: 'delhi-ncr', name: 'Delhi-NCR', state: 'Delhi', isPopular: true },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', isPopular: true },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', isPopular: true },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', isPopular: true },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', isPopular: false },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', isPopular: false },
];

export const RAW_MOVIES = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    duration: 166,
    language: 'English',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    certificate: 'UA',
    releaseDate: '2026-03-01',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Josh Brolin'],
    director: 'Denis Villeneuve',
    rating: 8.9,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '4DX', '2D'],
  },
  {
    title: 'Oppenheimer: Director’s Cut',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, presented in glorious IMAX 70mm remastered print.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    duration: 180,
    language: 'English',
    genres: ['Biography', 'Drama', 'History'],
    certificate: 'A',
    releaseDate: '2026-02-15',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    director: 'Christopher Nolan',
    rating: 8.9,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '2D'],
  },
  {
    title: 'Interstellar: 10th Anniversary IMAX',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    duration: 169,
    language: 'English',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    certificate: 'UA',
    releaseDate: '2026-03-10',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan',
    rating: 8.8,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '4DX', '2D'],
  },
  {
    title: 'Cyberpunk: Neon Horizon',
    description: 'In a dystopian mega-city controlled by synthetic oligarchs, a rogue cyber-detective uncovers an existential secret hidden in the memory banks of an android martyr.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=sample-trailer',
    duration: 135,
    language: 'English',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    certificate: 'A',
    releaseDate: '2026-03-20',
    cast: ['Karl Urban', 'Florence Pugh', 'Hiroyuki Sanada'],
    director: 'Alex Garland',
    rating: 8.4,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '3D', '2D'],
  },
  {
    title: 'Kalki 2898 AD: Epoch',
    description: 'A modern avatar of Vishnu descends on a drought-stricken post-apocalyptic Earth to shield the harbinger of a new golden era from dark authoritarian forces.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=kalki-trailer',
    duration: 181,
    language: 'Telugu',
    genres: ['Sci-Fi', 'Mythology', 'Action'],
    certificate: 'UA',
    releaseDate: '2026-03-12',
    cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
    director: 'Nag Ashwin',
    rating: 8.6,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '3D', '2D'],
  },
  {
    title: 'Deadpool & Wolverine: Multiverse Chaos',
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy across the fractured timelines of the multiverse.',
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=deadpool-wolverine',
    duration: 128,
    language: 'English',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    certificate: 'A',
    releaseDate: '2026-03-18',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
    director: 'Shawn Levy',
    rating: 8.3,
    status: 'NOW_SHOWING',
    formats: ['3D', '4DX', '2D'],
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by tyrannical Emperors who lead Rome with an iron fist.',
    poster: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=gladiator2',
    duration: 148,
    language: 'English',
    genres: ['Action', 'Adventure', 'Drama'],
    certificate: 'A',
    releaseDate: '2026-03-22',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
    director: 'Ridley Scott',
    rating: 8.1,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '2D'],
  },
  {
    title: 'Demon Slayer: Infinity Castle Arc',
    description: 'Tanjiro and the Demon Slayer Corps are drawn into the reality-bending Infinity Castle for the final, cataclysmic confrontation against Muzan Kibutsuji and the Upper Moon demons.',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=infinity-castle',
    duration: 115,
    language: 'Japanese',
    genres: ['Animation', 'Action', 'Fantasy'],
    certificate: 'UA',
    releaseDate: '2026-03-25',
    cast: ['Natsuki Hanae', 'Akari Kito', 'Hiro Shimono', 'Yoshitsugu Matsuoka'],
    director: 'Haruo Sotozaki',
    rating: 9.1,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '4DX', '2D'],
  },
  {
    title: 'Spider-Man: Beyond the Spider-Verse',
    description: 'Miles Morales journeys across the multiverse to save the people he loves most while confronting the destined canon events and an army of alternate Spider-People.',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=spiderverse-trailer',
    duration: 140,
    language: 'English',
    genres: ['Animation', 'Action', 'Adventure'],
    certificate: 'U',
    releaseDate: '2026-04-05',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
    director: 'Joaquim Dos Santos',
    rating: 9.0,
    status: 'UPCOMING',
    formats: ['IMAX', '3D', '2D'],
  },
  {
    title: 'Jawan: Extended Unleashed',
    description: 'A driven man is set on a mission to rectify wrongs in society, accompanied by a crew of fearless women, all while confronting a monstrous arms dealer.',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=jawan-trailer',
    duration: 172,
    language: 'Hindi',
    genres: ['Action', 'Thriller'],
    certificate: 'UA',
    releaseDate: '2026-02-10',
    cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
    director: 'Atlee',
    rating: 8.2,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '4DX', '2D'],
  },
  {
    title: 'Avatar: Fire and Ash',
    description: 'Jake Sully and Neytiri encounter the Ash People, a volatile and aggressive Na\'vi clan connected to volcanic biomes on Pandora, leading to an uncharted clash of ideologies.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=avatar3',
    duration: 195,
    language: 'English',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    certificate: 'UA',
    releaseDate: '2026-04-15',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
    director: 'James Cameron',
    rating: 8.8,
    status: 'UPCOMING',
    formats: ['IMAX', '3D', '4DX'],
  },
  {
    title: 'The Batman: Part II',
    description: 'As Gotham recovers from the seawall flooding, Bruce Wayne penetrates the corrupted institutional heart of the city while a chilling underground vigilante emerges.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=batman2',
    duration: 175,
    language: 'English',
    genres: ['Crime', 'Action', 'Drama', 'Mystery'],
    certificate: 'A',
    releaseDate: '2026-05-01',
    cast: ['Robert Pattinson', 'Andy Serkis', 'Jeffrey Wright', 'Colin Farrell'],
    director: 'Matt Reeves',
    rating: 8.7,
    status: 'UPCOMING',
    formats: ['IMAX', '2D'],
  },
  {
    title: 'Mission: Impossible - The Final Reckoning',
    description: 'Ethan Hunt and the IMF team risk everything in a globe-spanning race against time to neutralize the rogue entity threatening global sovereignty.',
    poster: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=mi8-trailer',
    duration: 165,
    language: 'English',
    genres: ['Action', 'Adventure', 'Thriller'],
    certificate: 'UA',
    releaseDate: '2026-03-28',
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
    director: 'Christopher McQuarrie',
    rating: 8.5,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '4DX', '2D'],
  },
  {
    title: 'Stree 2: Night Horrors',
    description: 'In the haunted town of Chanderi, the headless entity Sarkata terrorizes the townspeople, forcing Vicky and his quirky allies to summon supernatural forces.',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=stree2',
    duration: 147,
    language: 'Hindi',
    genres: ['Comedy', 'Horror'],
    certificate: 'UA',
    releaseDate: '2026-02-28',
    cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Aparshakti Khurana'],
    director: 'Amar Kaushik',
    rating: 8.0,
    status: 'NOW_SHOWING',
    formats: ['2D'],
  },
  {
    title: 'Kantara: Chapter 1',
    description: 'The mythic origin of the forest deity and the legendary pact between the Kadamba kings and the guardians of nature, filmed across primordial Western Ghats.',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=kantara-chapter1',
    duration: 156,
    language: 'Kannada',
    genres: ['Action', 'Drama', 'Mystery'],
    certificate: 'UA',
    releaseDate: '2026-03-30',
    cast: ['Rishab Shetty', 'Jayaram', 'Rukmini Vasanth'],
    director: 'Rishab Shetty',
    rating: 8.7,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '2D'],
  },
  {
    title: 'Pushpa 2: The Rule',
    description: 'Pushpa Raj tightens his grip on the red sandalwood syndicate while facing a ruthless onslaught from SP Bhanwar Singh Shekhawat in an explosive duel of egos.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=pushpa2',
    duration: 190,
    language: 'Telugu',
    genres: ['Action', 'Crime', 'Drama'],
    certificate: 'A',
    releaseDate: '2026-03-05',
    cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    director: 'Sukumar',
    rating: 8.4,
    status: 'NOW_SHOWING',
    formats: ['2D', '4DX'],
  },
  {
    title: 'Suzume: Special Director’s Showcase',
    description: 'A seventeen-year-old high school girl journeys across disaster-stricken Japan to close mysterious supernatural doors that release destruction upon the world.',
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=suzume-trailer',
    duration: 122,
    language: 'Japanese',
    genres: ['Animation', 'Adventure', 'Fantasy'],
    certificate: 'U',
    releaseDate: '2026-03-14',
    cast: ['Nanoka Hara', 'Hokuto Matsumura', 'Eri Fukatsu'],
    director: 'Makoto Shinkai',
    rating: 8.5,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '2D'],
  },
  {
    title: 'Inception: 15th Anniversary 70mm',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=inception',
    duration: 148,
    language: 'English',
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    certificate: 'UA',
    releaseDate: '2026-03-01',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    director: 'Christopher Nolan',
    rating: 8.8,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '2D'],
  },
  {
    title: 'Salaar: Part 2 - Shouryaanga Parvam',
    description: 'The fateful bond between Deva and Varadha fractures under the weight of Khansaar\'s ancient blood laws as the Shouryaanga tribe rises from the shadows.',
    poster: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=salaar2',
    duration: 175,
    language: 'Telugu',
    genres: ['Action', 'Crime', 'Drama'],
    certificate: 'A',
    releaseDate: '2026-04-20',
    cast: ['Prabhas', 'Prithviraj Sukumaran', 'Shruti Haasan'],
    director: 'Prashanth Neel',
    rating: 8.3,
    status: 'UPCOMING',
    formats: ['IMAX', '2D'],
  },
  {
    title: 'Blade Runner 2049: IMAX Experience',
    description: 'Young Blade Runner K unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos, leading him on a quest to find Rick Deckard.',
    poster: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
    duration: 164,
    language: 'English',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    certificate: 'A',
    releaseDate: '2026-03-08',
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
    director: 'Denis Villeneuve',
    rating: 8.6,
    status: 'NOW_SHOWING',
    formats: ['IMAX', '2D'],
  },
];

export const RAW_CINEMAS = [
  {
    name: 'Cinevo Luxe Cinema Bandra',
    city: 'Mumbai',
    address: 'Level 4, Turner Road, Bandra West, Mumbai 400050',
    facilities: ['Dolby Atmos', 'Recliner VIP Lounge', 'Gourmet In-Seat Dining', 'Valet Parking'],
  },
  {
    name: 'Cinevo IMAX Phoenix Mills',
    city: 'Mumbai',
    address: 'Grand Galleria, High Street Phoenix, Lower Parel, Mumbai 400013',
    facilities: ['IMAX with Laser', 'Dolby Atmos 64-Channel', '4DX Motion Seats', 'Wheelchair Access'],
  },
  {
    name: 'Cinevo Premiere Infiniti Mall',
    city: 'Mumbai',
    address: 'Link Road, Malad West, Mumbai 400064',
    facilities: ['Dolby Atmos', 'Laser Projection', 'Family Lounge', 'Snack Bar Express'],
  },
  {
    name: 'Cinevo Director’s Cut Select Citywalk',
    city: 'Delhi-NCR',
    address: 'A-3, District Centre, Saket, New Delhi 110017',
    facilities: ['Private Auditoriums', 'IMAX Laser', 'Michelin Chef Curated Menu', 'Recliner Only'],
  },
  {
    name: 'Cinevo Grand Ambience Mall',
    city: 'Delhi-NCR',
    address: 'NH-8, Ambience Island, DLF Phase 3, Gurugram 122002',
    facilities: ['IMAX Laser', '4DX Motion', 'Dolby 7.1', 'Underground Parking'],
  },
  {
    name: 'Cinevo Laser DLF Promenade',
    city: 'Delhi-NCR',
    address: 'Nelson Mandela Marg, Vasant Kunj, New Delhi 110070',
    facilities: ['RGB 4K Laser', 'Dolby Atmos', 'VIP Recliners', 'Café Lounge'],
  },
  {
    name: 'Cinevo Superplex Forum Mall',
    city: 'Bengaluru',
    address: 'Hosur Road, Koramangala, Bengaluru 560095',
    facilities: ['IMAX with Laser', '4DX', 'Gold Class Lounge', 'Multi-level Parking'],
  },
  {
    name: 'Cinevo IMAX Orion Mall',
    city: 'Bengaluru',
    address: 'Brigade Gateway, Dr Rajkumar Road, Rajajinagar, Bengaluru 560055',
    facilities: ['IMAX Commercial Laser', 'Dolby Atmos Sound', 'Lakeview Foyer'],
  },
  {
    name: 'Cinevo Gold VR Mall',
    city: 'Bengaluru',
    address: 'Whitefield Main Road, Mahadevapura, Bengaluru 560048',
    facilities: ['Full Recliner Seating', 'Personal Butler Service', 'Dolby Atmos'],
  },
  {
    name: 'Cinevo Epic Inorbit Mall',
    city: 'Hyderabad',
    address: 'APIIC Software Layout, Mindspace, Madhapur, Hyderabad 500081',
    facilities: ['IMAX with Laser', 'Dolby 3D', '4DX Motion', 'Food Court Integration'],
  },
  {
    name: 'Cinevo Megaplex GVK One',
    city: 'Hyderabad',
    address: 'Road No. 1, Banjara Hills, Hyderabad 500034',
    facilities: ['Dolby Atmos 4K', 'Gold Class Recliners', 'Dedicated Valet'],
  },
  {
    name: 'Cinevo Grand Palladium',
    city: 'Chennai',
    address: '142 Velachery Main Road, Velachery, Chennai 600042',
    facilities: ['IMAX with Laser', 'RGB Pure Laser', 'Dolby Atmos', 'Kids Play Zone'],
  },
  {
    name: 'Cinevo Luxe Express Avenue',
    city: 'Chennai',
    address: 'Whites Road, Royapettah, Chennai 600014',
    facilities: ['Dolby Atmos', 'Recliner Seating', 'Express F&B', 'Central Metro Access'],
  },
  {
    name: 'Cinevo Royale Phoenix Marketcity',
    city: 'Pune',
    address: 'Viman Nagar, Pune 411014',
    facilities: ['IMAX Laser', 'Dolby Atmos', 'Gourmet Lounge', 'Spacious Legroom'],
  },
  {
    name: 'Cinevo Heritage South City Mall',
    city: 'Kolkata',
    address: '375 Prince Anwar Shah Road, South City Complex, Kolkata 700068',
    facilities: ['IMAX Laser 3D', 'Dolby Atmos', 'Heritage Architecture Foyer'],
  },
];

/**
 * Generate standard layout of seats (Rows A-M, 16 seats each = 208 seats)
 */
export function generateRealisticSeatLayout() {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
  const seatsPerRow = 16;
  const layout = [];

  rows.forEach((rowLetter, rIdx) => {
    let category = 'REGULAR';
    let priceMultiplier = 1.0;

    if (rIdx >= 6 && rIdx < 9) {
      category = 'PREMIUM';
      priceMultiplier = 1.4;
    } else if (rIdx >= 9) {
      category = 'RECLINER';
      priceMultiplier = 2.2;
    }

    for (let c = 1; c <= seatsPerRow; c++) {
      layout.push({
        seatId: `${rowLetter}${c}`,
        seatNumber: `${rowLetter}${c}`,
        row: rowLetter,
        column: c,
        category,
        priceMultiplier,
      });
    }
  });

  return layout;
}

/**
 * Builds the comprehensive dataset
 */
export function buildComprehensiveDataset() {
  const movies = [];
  const cinemas = [];
  const screens = [];
  const shows = [];
  const users = [];
  const bookings = [];

  // 1. Users
  const salt = bcrypt.genSaltSync(10);
  const userPasswordHash = bcrypt.hashSync('Password123!', salt);
  const adminPasswordHash = bcrypt.hashSync('AdminSecret123!', salt);

  users.push({
    _id: 'u_admin_master',
    name: 'Cinevo Master Administrator',
    email: 'admin@cinevo.com',
    password: adminPasswordHash,
    role: 'ADMIN',
    isEmailVerified: true,
    createdAt: new Date('2026-01-01'),
  });

  users.push({
    _id: 'u_demo_customer',
    name: 'Aarav Sharma',
    email: 'user@cinevo.com',
    password: userPasswordHash,
    role: 'USER',
    isEmailVerified: true,
    createdAt: new Date('2026-01-05'),
  });

  // 25 additional realistic users
  const userNames = [
    'Priya Patel', 'Rohan Verma', 'Ananya Iyer', 'Vikramaditya Rao', 'Neha Sen',
    'Kabir Kapoor', 'Sneha Reddy', 'Aditya Nair', 'Tanvi Saxena', 'Karan Malhotra',
    'Rhea Deshmukh', 'Arjun Singhania', 'Meera Bhattacharya', 'Devendra Joshi', 'Simran Arora',
    'Nikhil Chawla', 'Isha Sundaram', 'Gaurav Kulkarni', 'Pooja Hegde', 'Rahul Banerjee',
    'Tara Alva', 'Samarth Mathur', 'Anushka Dutta', 'Manish Agrawal', 'Deepika Pillai'
  ];

  userNames.forEach((name, idx) => {
    const emailPrefix = name.toLowerCase().replace(/\s+/g, '.');
    users.push({
      _id: `u_cust_${idx + 1}`,
      name,
      email: `${emailPrefix}@cinevo-audience.com`,
      password: userPasswordHash,
      role: 'USER',
      isEmailVerified: true,
      createdAt: new Date(Date.now() - (idx * 86400000 * 2)),
    });
  });

  // 2. Movies
  RAW_MOVIES.forEach((m, idx) => {
    movies.push({
      _id: `m_${idx + 1}`,
      title: m.title,
      description: m.description,
      poster: m.poster,
      backdrop: m.backdrop,
      trailerUrl: m.trailerUrl,
      duration: m.duration,
      language: m.language,
      genres: m.genres,
      certificate: m.certificate,
      releaseDate: new Date(m.releaseDate),
      cast: m.cast,
      director: m.director,
      rating: m.rating,
      status: m.status,
      formats: m.formats,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date(),
    });
  });

  // 3. Cinemas & Screens
  RAW_CINEMAS.forEach((c, cIdx) => {
    const cinemaId = `cin_${cIdx + 1}`;
    const screenIds = [];

    // 3 screens per cinema
    const screenConfigs = [
      { name: 'Screen 1 - IMAX Laser Experience', screenNumber: 1, format: 'IMAX', basePrice: 280 },
      { name: 'Screen 2 - Dolby Atmos 4K Digital', screenNumber: 2, format: '2D', basePrice: 220 },
      { name: 'Screen 3 - 4DX Motion Theatre', screenNumber: 3, format: '4DX', basePrice: 320 },
    ];

    screenConfigs.forEach((sc, scIdx) => {
      const screenId = `scr_${cIdx + 1}_${scIdx + 1}`;
      screenIds.push(screenId);
      screens.push({
        _id: screenId,
        cinemaId,
        name: sc.name,
        screenNumber: sc.screenNumber,
        rows: 12,
        seatsPerRow: 16,
        format: sc.format,
        basePrice: sc.basePrice,
        seatLayout: generateRealisticSeatLayout(),
        createdAt: new Date('2026-01-15'),
      });
    });

    cinemas.push({
      _id: cinemaId,
      name: c.name,
      city: c.city,
      address: c.address,
      facilities: c.facilities,
      screens: screenIds,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date(),
    });
  });

  // 4. Scheduled Shows (Spanning Today, Tomorrow, and Next 7 Days)
  const showTimes = [
    { hour: 9, minute: 30 },
    { hour: 13, minute: 0 },
    { hour: 16, minute: 45 },
    { hour: 20, minute: 15 },
    { hour: 23, minute: 30 },
  ];

  let showCounter = 1;
  const now = new Date();
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  // Distribute shows across 7 consecutive days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(todayZero.getTime() + dayOffset * 86400000);

    cinemas.forEach((cinema, cinIndex) => {
      // Loop each screen of this cinema
      cinema.screens.forEach((screenId, scrIndex) => {
        const screenObj = screens.find(s => s._id === screenId);
        // Pick rotating movies
        const movieIndex = (cinIndex * 3 + scrIndex + dayOffset) % movies.length;
        const selectedMovie = movies[movieIndex];

        showTimes.forEach((st, stIdx) => {
          const startTime = new Date(targetDate);
          startTime.setHours(st.hour, st.minute, 0, 0);

          const endTime = new Date(startTime.getTime() + (selectedMovie.duration + 20) * 60 * 1000);

          const base = screenObj ? screenObj.basePrice : 220;
          const pricing = {
            REGULAR: base,
            PREMIUM: Math.round(base * 1.5),
            RECLINER: Math.round(base * 2.3),
          };

          const showFormat = (screenObj && screenObj.format) ? screenObj.format : (selectedMovie.formats[0] || '2D');

          const showId = `show_${showCounter++}`;
          shows.push({
            _id: showId,
            movieId: selectedMovie._id,
            cinemaId: cinema._id,
            screenId,
            startTime,
            endTime,
            language: selectedMovie.language,
            format: showFormat,
            pricing,
            status: 'ACTIVE',
            createdAt: new Date('2026-02-01'),
            updatedAt: new Date(),
          });
        });
      });
    });
  }

  // 5. Realistic Sample Bookings for completed / past & upcoming shows
  const pastShows = shows.filter(s => new Date(s.startTime) <= new Date(Date.now() + 86400000)).slice(0, 100);

  pastShows.forEach((show, bIdx) => {
    const customer = users[(bIdx % (users.length - 2)) + 2] || users[1]; // Pick from users
    const seatRow = ['D', 'E', 'F', 'G', 'H', 'J'][bIdx % 6];
    const seatCol1 = (bIdx % 10) + 1;
    const seatCol2 = seatCol1 + 1;

    const bookedSeats = [
      {
        seatId: `${seatRow}${seatCol1}`,
        seatNumber: `${seatRow}${seatCol1}`,
        row: seatRow,
        column: seatCol1,
        category: bIdx % 2 === 0 ? 'REGULAR' : 'PREMIUM',
        price: bIdx % 2 === 0 ? show.pricing.REGULAR : show.pricing.PREMIUM,
      },
      {
        seatId: `${seatRow}${seatCol2}`,
        seatNumber: `${seatRow}${seatCol2}`,
        row: seatRow,
        column: seatCol2,
        category: bIdx % 2 === 0 ? 'REGULAR' : 'PREMIUM',
        price: bIdx % 2 === 0 ? show.pricing.REGULAR : show.pricing.PREMIUM,
      },
    ];

    const ticketAmount = bookedSeats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = bookedSeats.length * 30;
    const taxes = Math.round((ticketAmount + convenienceFee) * 0.18 * 100) / 100;
    const totalAmount = Math.round((ticketAmount + convenienceFee + taxes) * 100) / 100;

    const bookingRef = `CNV-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const bookingId = `bkg_seed_${bIdx + 1}`;

    bookings.push({
      _id: bookingId,
      userId: customer._id,
      showId: show._id,
      seats: bookedSeats,
      ticketAmount,
      convenienceFee,
      taxes,
      totalAmount,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentId: `pay_rzp_mock_${Date.now() - bIdx * 3600000}_${bIdx}`,
      orderId: `order_seed_${Date.now() - bIdx * 3600000}_${bIdx}`,
      idempotencyKey: `idemp_seed_${bookingId}`,
      bookingReference: bookingRef,
      lockExpiresAt: new Date(Date.now() + 86400000),
      createdAt: new Date(Date.now() - bIdx * 7200000),
      updatedAt: new Date(Date.now() - bIdx * 7200000),
    });
  });

  return {
    movies,
    cinemas,
    screens,
    shows,
    users,
    bookings,
  };
}
