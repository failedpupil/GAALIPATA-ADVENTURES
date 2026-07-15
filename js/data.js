// ============================================================
// data.js — LocalStorage Data Layer + Seed Data
// Karnataka Travel Recommendation Website
// ============================================================

const DB_KEY = 'karnataka_travel_locations';
const PLANS_DB_KEY = 'karnataka_travel_plans';
const ADMIN_KEY = 'karnataka_admin_auth';
const ADMIN_PASSWORD = 'admin123';

// ---------- LocalStorage CRUD Helpers ----------

const DataStore = {
    getAll() {
        const raw = localStorage.getItem(DB_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    },

    save(locations) {
        localStorage.setItem(DB_KEY, JSON.stringify(locations));
    },

    get(id) {
        return this.getAll().find(loc => loc.id === id) || null;
    },

    add(location) {
        const locations = this.getAll();
        location.id = this.generateId();
        location.createdAt = new Date().toISOString();
        locations.push(location);
        this.save(locations);
        return location;
    },

    update(id, updates) {
        const locations = this.getAll();
        const idx = locations.findIndex(loc => loc.id === id);
        if (idx === -1) return null;
        locations[idx] = { ...locations[idx], ...updates, updatedAt: new Date().toISOString() };
        this.save(locations);
        return locations[idx];
    },

    delete(id) {
        const locations = this.getAll().filter(loc => loc.id !== id);
        this.save(locations);
    },

    generateId() {
        return 'loc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // ---------- Plans CRUD ----------

    getAllPlans() {
        const raw = localStorage.getItem(PLANS_DB_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    },

    savePlans(plans) {
        localStorage.setItem(PLANS_DB_KEY, JSON.stringify(plans));
    },

    getPlan(id) {
        return this.getAllPlans().find(p => p.id === id) || null;
    },

    addPlan(plan) {
        const plans = this.getAllPlans();
        plan.id = 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        plan.createdAt = new Date().toISOString();
        plans.push(plan);
        this.savePlans(plans);
        return plan;
    },

    updatePlan(id, updates) {
        const plans = this.getAllPlans();
        const idx = plans.findIndex(p => p.id === id);
        if (idx === -1) return null;
        plans[idx] = { ...plans[idx], ...updates, updatedAt: new Date().toISOString() };
        this.savePlans(plans);
        return plans[idx];
    },

    deletePlan(id) {
        const plans = this.getAllPlans().filter(p => p.id !== id);
        this.savePlans(plans);
    },

    // ---------- Seed Data Handling ----------

    // Check if seed data has been loaded
    isSeeded() {
        return localStorage.getItem('karnataka_seeded') === 'true';
    },

    markSeeded() {
        localStorage.setItem('karnataka_seeded', 'true');
    },

    // Reset to seed data
    reset() {
        localStorage.removeItem(DB_KEY);
        localStorage.removeItem(PLANS_DB_KEY);
        localStorage.removeItem('karnataka_seeded');
        this.seedData();
    }
};

// ---------- Categories & Constants ----------

const CATEGORIES = {
    heritage: { label: 'Heritage', icon: '<i class="ri-ancient-gate-line"></i>', color: '#E8A838' },
    beach: { label: 'Beach', icon: '<i class="ri-sun-line"></i>', color: '#00D4AA' },
    hillstation: { label: 'Hill Station', icon: '<i class="ri-landscape-line"></i>', color: '#4CAF50' },
    temple: { label: 'Temple', icon: '<i class="ri-building-4-line"></i>', color: '#FF6B6B' },
    wildlife: { label: 'Wildlife', icon: '<i class="ri-bear-smile-line"></i>', color: '#FF9800' },
    waterfall: { label: 'Waterfall', icon: '<i class="ri-drop-line"></i>', color: '#42A5F5' },
    adventure: { label: 'Adventure', icon: '<i class="ri-footprint-line"></i>', color: '#AB47BC' },
    city: { label: 'City', icon: '<i class="ri-building-2-line"></i>', color: '#78909C' }
};

const SEASONS = ['Summer', 'Monsoon', 'Winter', 'Year-round'];
const TRANSPORT = ['Car', 'Bus', 'Train', 'Flight'];
const DURATIONS = ['Day trip', 'Weekend', '3-5 days', 'Week+'];

// ---------- Seed Data: 18 Karnataka Destinations ----------

const SEED_LOCATIONS = [
    {
        id: 'seed_001',
        name: 'Hampi',
        lat: 15.335,
        lng: 76.46,
        district: 'Vijayanagara',
        category: 'heritage',
        description: 'A UNESCO World Heritage Site, Hampi is a sprawling complex of ancient ruins from the Vijayanagara Empire. Explore boulder-strewn landscapes dotted with magnificent temples, royal enclosures, and stone chariots.',
        bestSeasons: ['Winter', 'Summer'],
        transport: ['Car', 'Bus', 'Train'],
        estimatedCost: 5000,
        duration: '3-5 days',
        rating: 5,
        highlights: ['Virupaksha Temple', 'Stone Chariot', 'Lotus Mahal', 'Matanga Hill Sunrise'],
        image: ''
    },
    {
        id: 'seed_002',
        name: 'Coorg (Kodagu)',
        lat: 12.3375,
        lng: 75.8069,
        district: 'Kodagu',
        category: 'hillstation',
        description: 'Known as the Scotland of India, Coorg is a misty paradise of coffee plantations, lush green hills, and cascading waterfalls. Perfect for nature lovers and adventure seekers.',
        bestSeasons: ['Monsoon', 'Winter'],
        transport: ['Car'],
        estimatedCost: 8000,
        duration: '3-5 days',
        rating: 5,
        highlights: ['Abbey Falls', 'Raja\'s Seat', 'Dubare Elephant Camp', 'Coffee Plantations'],
        image: ''
    },
    {
        id: 'seed_003',
        name: 'Gokarna',
        lat: 14.55,
        lng: 74.32,
        district: 'Uttara Kannada',
        category: 'beach',
        description: 'A serene coastal town with pristine beaches, Gokarna offers a perfect mix of spirituality and beach life. The crescent-shaped Om Beach and secluded Half Moon Beach are must-visits.',
        bestSeasons: ['Winter'],
        transport: ['Car', 'Bus', 'Train'],
        estimatedCost: 4000,
        duration: 'Weekend',
        rating: 4,
        highlights: ['Om Beach', 'Kudle Beach', 'Half Moon Beach', 'Mahabaleshwar Temple'],
        image: ''
    },
    {
        id: 'seed_004',
        name: 'Mysore',
        lat: 12.2958,
        lng: 76.6394,
        district: 'Mysore',
        category: 'heritage',
        description: 'The City of Palaces, Mysore is famous for its grand royal heritage, vibrant Dasara celebrations, and exquisite silk sarees. The illuminated Mysore Palace is a sight to behold.',
        bestSeasons: ['Year-round'],
        transport: ['Car', 'Bus', 'Train'],
        estimatedCost: 6000,
        duration: '3-5 days',
        rating: 5,
        highlights: ['Mysore Palace', 'Chamundi Hills', 'Brindavan Gardens', 'Mysore Zoo'],
        image: ''
    },
    {
        id: 'seed_005',
        name: 'Jog Falls',
        lat: 14.2295,
        lng: 74.8123,
        district: 'Shimoga',
        category: 'waterfall',
        description: 'India\'s second-highest plunge waterfall at 253 meters. During monsoon, the four distinct cascades — Raja, Rani, Rover, and Rocket — merge into a thundering wall of water.',
        bestSeasons: ['Monsoon'],
        transport: ['Car', 'Bus'],
        estimatedCost: 3000,
        duration: 'Weekend',
        rating: 5,
        highlights: ['Monsoon View', 'British-era Power Station', 'Tunga River Trek', 'Sunset Point'],
        image: ''
    },
    {
        id: 'seed_006',
        name: 'Chikmagalur',
        lat: 13.3153,
        lng: 75.7754,
        district: 'Chikmagalur',
        category: 'hillstation',
        description: 'The birthplace of coffee in India, Chikmagalur is nestled in the Western Ghats with stunning peaks, dense forests, and aromatic coffee estates stretching across the hills.',
        bestSeasons: ['Monsoon', 'Winter'],
        transport: ['Car'],
        estimatedCost: 6000,
        duration: '3-5 days',
        rating: 5,
        highlights: ['Mullayanagiri Peak', 'Baba Budangiri', 'Hebbe Falls', 'Coffee Plantations'],
        image: ''
    },
    {
        id: 'seed_007',
        name: 'Kabini',
        lat: 11.9464,
        lng: 76.3547,
        district: 'Mysore',
        category: 'wildlife',
        description: 'One of India\'s finest wildlife destinations, Kabini is home to herds of wild elephants, elusive leopards, and the famous black panther. The backwaters offer magical sunset experiences.',
        bestSeasons: ['Winter', 'Summer'],
        transport: ['Car'],
        estimatedCost: 12000,
        duration: 'Weekend',
        rating: 5,
        highlights: ['Jungle Safari', 'Boat Safari', 'Black Panther Sighting', 'Kabini Backwaters'],
        image: ''
    },
    {
        id: 'seed_008',
        name: 'Bandipur National Park',
        lat: 11.6686,
        lng: 76.634,
        district: 'Chamarajanagar',
        category: 'wildlife',
        description: 'Part of the Nilgiri Biosphere Reserve, Bandipur is a tiger reserve with rich biodiversity. Spot tigers, elephants, deer, and exotic bird species amid dry deciduous forests.',
        bestSeasons: ['Winter'],
        transport: ['Car', 'Bus'],
        estimatedCost: 5000,
        duration: 'Weekend',
        rating: 4,
        highlights: ['Tiger Safari', 'Gopalaswamy Betta', 'Elephant Sighting', 'Nature Trails'],
        image: ''
    },
    {
        id: 'seed_009',
        name: 'Nandi Hills',
        lat: 13.3702,
        lng: 77.6835,
        district: 'Chikkaballapur',
        category: 'hillstation',
        description: 'A quick escape from Bangalore, Nandi Hills is famous for breathtaking sunrise views above the clouds. The ancient fort and Tipu Sultan\'s summer retreat add historical charm.',
        bestSeasons: ['Year-round'],
        transport: ['Car'],
        estimatedCost: 1500,
        duration: 'Day trip',
        rating: 4,
        highlights: ['Sunrise Above Clouds', 'Tipu\'s Drop', 'Nandi Temple', 'Paragliding'],
        image: ''
    },
    {
        id: 'seed_010',
        name: 'Murdeshwar',
        lat: 14.0937,
        lng: 74.4854,
        district: 'Uttara Kannada',
        category: 'temple',
        description: 'Home to the world\'s second-tallest Shiva statue at 123 feet, Murdeshwar sits dramatically on a headland with the Arabian Sea on three sides. The 20-story gopura offers panoramic views.',
        bestSeasons: ['Winter'],
        transport: ['Car', 'Train'],
        estimatedCost: 3000,
        duration: 'Weekend',
        rating: 4,
        highlights: ['Giant Shiva Statue', '20-Story Gopura', 'Beach Sunset', 'Netrani Island Diving'],
        image: ''
    },
    {
        id: 'seed_011',
        name: 'Badami',
        lat: 15.918,
        lng: 75.675,
        district: 'Bagalkot',
        category: 'heritage',
        description: 'The ancient Chalukyan capital features stunning rock-cut cave temples dating back to the 6th century. The red sandstone cliffs surrounding Agastya Lake create a dramatic setting.',
        bestSeasons: ['Winter'],
        transport: ['Car', 'Bus'],
        estimatedCost: 3500,
        duration: 'Weekend',
        rating: 4,
        highlights: ['Cave Temples', 'Agastya Lake', 'Bhutanatha Temples', 'Fort Climb'],
        image: ''
    },
    {
        id: 'seed_012',
        name: 'Dandeli',
        lat: 15.2488,
        lng: 74.6171,
        district: 'Uttara Kannada',
        category: 'adventure',
        description: 'Karnataka\'s adventure capital set in dense deciduous forests along the Kali River. Offering white-water rafting, kayaking, jungle trails, and incredible birdwatching opportunities.',
        bestSeasons: ['Winter'],
        transport: ['Car'],
        estimatedCost: 5000,
        duration: 'Weekend',
        rating: 4,
        highlights: ['White Water Rafting', 'Syntheri Rocks', 'Kavala Caves', 'Hornbill Spotting'],
        image: ''
    },
    {
        id: 'seed_013',
        name: 'Udupi',
        lat: 13.3409,
        lng: 74.7421,
        district: 'Udupi',
        category: 'temple',
        description: 'Famous for the Krishna Temple and its unique dining tradition, Udupi is a spiritual and culinary destination. The nearby beaches of Malpe and St. Mary\'s Island add coastal charm.',
        bestSeasons: ['Winter'],
        transport: ['Car', 'Bus', 'Train'],
        estimatedCost: 3000,
        duration: 'Weekend',
        rating: 4,
        highlights: ['Krishna Temple', 'Malpe Beach', 'St. Mary\'s Island', 'Udupi Cuisine'],
        image: ''
    },
    {
        id: 'seed_014',
        name: 'Agumbe',
        lat: 13.5023,
        lng: 75.0628,
        district: 'Shimoga',
        category: 'hillstation',
        description: 'Known as the Cherrapunji of South India, Agumbe receives the heaviest rainfall in Karnataka. This biodiversity hotspot is famous for its sunset viewpoint and king cobra sightings.',
        bestSeasons: ['Monsoon'],
        transport: ['Car'],
        estimatedCost: 3500,
        duration: 'Weekend',
        rating: 4,
        highlights: ['Sunset View Point', 'Barkana Falls', 'King Cobra Tracking', 'Rainforest Treks'],
        image: ''
    },
    {
        id: 'seed_015',
        name: 'Belur & Halebidu',
        lat: 13.1623,
        lng: 75.8653,
        district: 'Hassan',
        category: 'heritage',
        description: 'Twin temple towns showcasing the pinnacle of Hoysala architecture. The Chennakeshava Temple at Belur and Hoysaleswara Temple at Halebidu feature incredibly intricate stone carvings.',
        bestSeasons: ['Year-round'],
        transport: ['Car', 'Bus'],
        estimatedCost: 2500,
        duration: 'Day trip',
        rating: 5,
        highlights: ['Chennakeshava Temple', 'Hoysaleswara Temple', 'Intricate Carvings', 'Yagachi Dam'],
        image: ''
    },
    {
        id: 'seed_016',
        name: 'Yana',
        lat: 14.573,
        lng: 74.592,
        district: 'Uttara Kannada',
        category: 'adventure',
        description: 'A hidden gem in the Western Ghats, Yana features two massive crystalline limestone rock formations — Bhairaveshwara Shikhara and Mohini Shikhara — rising dramatically from dense forest.',
        bestSeasons: ['Monsoon', 'Winter'],
        transport: ['Car'],
        estimatedCost: 2500,
        duration: 'Weekend',
        rating: 4,
        highlights: ['Rock Formations', 'Forest Trek', 'Vibhooti Falls', 'Cave Temple'],
        image: ''
    },
    {
        id: 'seed_017',
        name: 'Bangalore Heritage Walk',
        lat: 12.9716,
        lng: 77.5946,
        district: 'Bangalore Urban',
        category: 'city',
        description: 'India\'s Silicon Valley has a rich heritage side. Explore Bangalore Palace, Tipu Sultan\'s Summer Palace, Lalbagh\'s crystal palace, and the bustling old-world charm of Basavanagudi.',
        bestSeasons: ['Year-round'],
        transport: ['Car', 'Bus', 'Train', 'Flight'],
        estimatedCost: 3000,
        duration: 'Day trip',
        rating: 4,
        highlights: ['Bangalore Palace', 'Lalbagh Gardens', 'Tipu Sultan Palace', 'Cubbon Park'],
        image: ''
    },
    {
        id: 'seed_018',
        name: 'Shivanasamudra Falls',
        lat: 12.2927,
        lng: 77.163,
        district: 'Mandya',
        category: 'waterfall',
        description: 'Where the Kaveri River plunges in twin waterfalls — Gaganachukki and Bharachukki. One of Asia\'s first hydroelectric power stations was built here in 1902.',
        bestSeasons: ['Monsoon'],
        transport: ['Car'],
        estimatedCost: 1500,
        duration: 'Day trip',
        rating: 4,
        highlights: ['Gaganachukki Falls', 'Bharachukki Falls', 'Coracle Ride', 'Historic Power Station'],
        image: ''
    },
    {
        id: 'seed_019',
        name: 'Kavaledurga',
        lat: 13.7147, lng: 75.1209, district: 'Shimoga', category: 'heritage',
        description: 'An ancient hill fort in the Western Ghats known for its scenic views and historical ruins.',
        bestSeasons: ['Monsoon', 'Winter'], transport: ['Car'], estimatedCost: 1000, duration: 'Day trip', rating: 4,
        highlights: ['Hill Fort', 'Stone Walls', 'Trekking', 'Scenic Views'], image: ''
    },
    {
        id: 'seed_020',
        name: 'Halige (Handi hodiyo jaaga)',
        lat: 13.7000, lng: 75.1000, district: 'Shimoga', category: 'adventure',
        description: 'A beautiful and adventurous spot nestled in the dense forests of the Western Ghats.',
        bestSeasons: ['Winter'], transport: ['Car'], estimatedCost: 500, duration: 'Day trip', rating: 3,
        highlights: ['Forest Trails', 'Nature Walk'], image: ''
    },
    {
        id: 'seed_021',
        name: 'Talasi abbi Falls (Hidden falls)',
        lat: 13.7088, lng: 75.0560, district: 'Shimoga', category: 'waterfall',
        description: 'A pristine hidden waterfall surrounded by lush greenery, perfect for nature enthusiasts.',
        bestSeasons: ['Monsoon', 'Winter'], transport: ['Car'], estimatedCost: 500, duration: 'Day trip', rating: 4,
        highlights: ['Hidden Waterfall', 'Jungle Trek'], image: ''
    },
    {
        id: 'seed_022',
        name: 'Kupparagundi falls',
        lat: 13.6900, lng: 75.0300, district: 'Shimoga', category: 'waterfall',
        description: 'A serene waterfall offering a peaceful escape into nature. (Visit if time permits)',
        bestSeasons: ['Monsoon'], transport: ['Car'], estimatedCost: 500, duration: 'Day trip', rating: 3,
        highlights: ['Waterfall', 'Photography'], image: ''
    },
    {
        id: 'seed_023',
        name: 'Paramathma Movie Shooting Spot',
        lat: 13.6800, lng: 75.0100, district: 'Shimoga', category: 'adventure',
        description: 'The scenic location where the Kannada blockbuster Paramathma was shot.',
        bestSeasons: ['Year-round'], transport: ['Car'], estimatedCost: 0, duration: 'Day trip', rating: 4,
        highlights: ['Movie Location', 'Scenic Beauty'], image: ''
    },
    {
        id: 'seed_024',
        name: 'Thombattu Falls (Kantara Movie Falls)',
        lat: 13.6288, lng: 74.9221, district: 'Udupi', category: 'waterfall',
        description: 'The majestic waterfall featured in the blockbuster movie Kantara.',
        bestSeasons: ['Monsoon', 'Winter'], transport: ['Car'], estimatedCost: 500, duration: 'Day trip', rating: 5,
        highlights: ['Kantara Location', 'Waterfall', 'Nature'], image: ''
    },
    {
        id: 'seed_025',
        name: 'Kamalashile Sri Durgaparameshwari',
        lat: 13.6826, lng: 74.9080, district: 'Udupi', category: 'temple',
        description: 'A revered temple dedicated to Goddess Durgaparameshwari, located on the banks of the Kubja river. (Day 1 Stay)',
        bestSeasons: ['Year-round'], transport: ['Car', 'Bus'], estimatedCost: 1500, duration: 'Overnight', rating: 5,
        highlights: ['Ancient Temple', 'River Kubja', 'Cave'], image: ''
    },
    {
        id: 'seed_026',
        name: 'Keshavanatheshwara Temple',
        lat: 13.7300, lng: 74.8900, district: 'Udupi', category: 'temple',
        description: 'An ancient temple known for its spiritual significance and peaceful environment. Visited by Rishabh Shetty.',
        bestSeasons: ['Year-round'], transport: ['Car'], estimatedCost: 0, duration: 'Day trip', rating: 4,
        highlights: ['Ancient Architecture', 'Spiritual Retreat'], image: ''
    },
    {
        id: 'seed_027',
        name: 'Belkal Theertha falls',
        lat: 13.7844, lng: 74.8870, district: 'Udupi', category: 'waterfall',
        description: 'A spectacular waterfall located near Karnataka\'s most beautiful village, surrounded by dense forests.',
        bestSeasons: ['Monsoon', 'Winter'], transport: ['Car'], estimatedCost: 500, duration: 'Day trip', rating: 5,
        highlights: ['Beautiful Village', 'Forest Trek', 'Waterfall'], image: ''
    },
    {
        id: 'seed_028',
        name: 'Kollur Mookambika Temple',
        lat: 13.8654, lng: 74.8143, district: 'Udupi', category: 'temple',
        description: 'One of the most prominent pilgrimage centers in South India, nestled in the foothills of the Western Ghats.',
        bestSeasons: ['Year-round'], transport: ['Car', 'Bus'], estimatedCost: 1000, duration: 'Day trip', rating: 5,
        highlights: ['Mookambika Temple', 'Kodachadri View', 'Pilgrimage'], image: ''
    },
    {
        id: 'seed_029',
        name: 'Champaka Sarasi',
        lat: 13.9000, lng: 74.8500, district: 'Udupi', category: 'heritage',
        description: 'An ancient stepwell/pond with rich historical significance.',
        bestSeasons: ['Winter'], transport: ['Car'], estimatedCost: 200, duration: 'Day trip', rating: 3,
        highlights: ['Historical Stepwell', 'Architecture'], image: ''
    },
    {
        id: 'seed_030',
        name: 'Malgudi days Museum',
        lat: 14.0416, lng: 75.2530, district: 'Shimoga', category: 'heritage',
        description: 'A museum dedicated to the classic TV series Malgudi Days, located at the Arasalu railway station.',
        bestSeasons: ['Year-round'], transport: ['Car', 'Train'], estimatedCost: 300, duration: 'Day trip', rating: 4,
        highlights: ['Malgudi Days', 'Railway Station', 'Nostalgia'], image: ''
    },
    {
        id: 'seed_031',
        name: 'Guli Guli Shankara Temple',
        lat: 13.8821, lng: 75.0296, district: 'Shimoga', category: 'temple',
        description: 'A beautiful temple dedicated to Lord Shiva, surrounded by nature. (Visit if time permits)',
        bestSeasons: ['Year-round'], transport: ['Car'], estimatedCost: 0, duration: 'Day trip', rating: 4,
        highlights: ['Shiva Temple', 'Peaceful'], image: ''
    }
];

// ---------- Curated Plans Data ----------

const SEED_PLANS = [
    {
        id: 'plan_08',
        title: 'Gaalipata Adventures Plan',
        days: '2 Days',
        theme: 'adventure',
        description: 'A packed 2-day adventure covering historical forts, hidden waterfalls, movie shooting spots, and ancient temples. (25/07 - 26/07)',
        route: [
            'seed_017', 'seed_019', 'seed_020', 'seed_021', 'seed_022', 'seed_023', 'seed_024', 'seed_025', 
            'seed_026', 'seed_027', 'seed_028', 'seed_029', 'seed_030', 'seed_031', 'seed_017'
        ]
    }
];

// ---------- Seed Data Loader ----------

DataStore.seedData = function () {
    const locationsSeeded = this.isSeeded();
    
    // Seed locations if not seeded
    if (!locationsSeeded) {
        this.save(SEED_LOCATIONS);
        this.markSeeded();
        console.log('✅ Seeded', SEED_LOCATIONS.length, 'Karnataka locations');
    }
    
    // Seed plans if they don't exist yet
    const currentPlans = this.getAllPlans();
    if (currentPlans.length === 0) {
        this.savePlans(SEED_PLANS);
        console.log('✅ Seeded', SEED_PLANS.length, 'curated plans');
    }
};
