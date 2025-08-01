// Dati demo per il sistema badge e XP
export const demoBadges = [
  {
    id: 1,
    name: 'welcome',
    description: 'Benvenuto in Civitanova Marche!',
    icon: '👋',
    category: 'achievement',
    rarity: 'common',
    xp_reward: 25,
    requirement_type: 'xp_total',
    requirement_value: 0,
    is_active: true
  },
  {
    id: 2,
    name: 'first_steps',
    description: 'Primi passi da cittadino',
    icon: '👶',
    category: 'achievement',
    rarity: 'common',
    xp_reward: 50,
    requirement_type: 'xp_total',
    requirement_value: 50,
    is_active: true
  },
  {
    id: 3,
    name: 'active_citizen',
    description: 'Cittadino attivo',
    icon: '⭐',
    category: 'civic',
    rarity: 'rare',
    xp_reward: 100,
    requirement_type: 'xp_total',
    requirement_value: 200,
    is_active: true
  },
  {
    id: 4,
    name: 'explorer',
    description: 'Esploratore della città',
    icon: '🗺️',
    category: 'explorer',
    rarity: 'rare',
    xp_reward: 150,
    requirement_type: 'xp_total',
    requirement_value: 500,
    is_active: true
  },
  {
    id: 5,
    name: 'level_master',
    description: 'Maestro di livello',
    icon: '🏆',
    category: 'achievement',
    rarity: 'epic',
    xp_reward: 300,
    requirement_type: 'level',
    requirement_value: 5,
    is_active: true
  },
  {
    id: 6,
    name: 'xp_collector',
    description: 'Collezionista di XP',
    icon: '💎',
    category: 'achievement',
    rarity: 'rare',
    xp_reward: 200,
    requirement_type: 'xp_total',
    requirement_value: 1000,
    is_active: true
  },
  {
    id: 7,
    name: 'daily_champion',
    description: 'Campione giornaliero',
    icon: '🌟',
    category: 'achievement',
    rarity: 'rare',
    xp_reward: 175,
    requirement_type: 'days_consecutive',
    requirement_value: 7,
    is_active: true
  },
  {
    id: 8,
    name: 'super_citizen',
    description: 'Super cittadino',
    icon: '🦸',
    category: 'civic',
    rarity: 'epic',
    xp_reward: 500,
    requirement_type: 'xp_total',
    requirement_value: 2000,
    is_active: true
  },
  {
    id: 9,
    name: 'legend',
    description: 'Leggenda civica',
    icon: '👑',
    category: 'achievement',
    rarity: 'legendary',
    xp_reward: 1000,
    requirement_type: 'xp_total',
    requirement_value: 5000,
    is_active: true
  }
];

export const demoUserStats = {
  total_xp: 750,
  current_level: 4,
  level_progress: 75.0,
  badges_count: 5,
  badges_list: ['welcome', 'first_steps', 'active_citizen', 'explorer', 'daily_champion'],
  rank_position: 15
};

export const demoLeaderboard = [
  {
    id: '1',
    username: 'CittadinoEsemplare',
    display_name: 'Marco Rossi',
    total_xp: 2450,
    current_level: 10,
    badges_count: 15,
    rank_position: 1
  },
  {
    id: '2',
    username: 'EsploratoreUrbano',
    display_name: 'Laura Bianchi',
    total_xp: 2100,
    current_level: 9,
    badges_count: 12,
    rank_position: 2
  },
  {
    id: '3',
    username: 'ReporterCivico',
    display_name: 'Giuseppe Verdi',
    total_xp: 1850,
    current_level: 8,
    badges_count: 10,
    rank_position: 3
  },
  {
    id: '4',
    username: 'VolontarioAttivo',
    display_name: 'Anna Neri',
    total_xp: 1600,
    current_level: 7,
    badges_count: 8,
    rank_position: 4
  },
  {
    id: '5',
    username: 'GuardianoCitta',
    display_name: 'Francesco Blu',
    total_xp: 1400,
    current_level: 6,
    badges_count: 7,
    rank_position: 5
  },
  {
    id: 'current',
    username: 'TuoUsername',
    display_name: 'Il Tuo Nome',
    total_xp: 750,
    current_level: 4,
    badges_count: 5,
    rank_position: 15
  }
];

export const xpActivities = {
  daily_login: { xp: 10, description: 'Accesso giornaliero', max_daily: 1 },
  share_content: { xp: 5, description: 'Condivisione contenuto', max_daily: 3 },
  submit_report: { xp: 25, description: 'Invio segnalazione', max_daily: 5 },
  location_visit: { xp: 30, description: 'Visita luogo', max_daily: null },
  event_participation: { xp: 75, description: 'Partecipazione evento', max_daily: null },
  helpful_comment: { xp: 15, description: 'Commento utile', max_daily: 10 },
  survey_complete: { xp: 40, description: 'Completamento sondaggio', max_daily: null },
  profile_complete: { xp: 50, description: 'Completamento profilo', max_daily: null }
};

// Funzioni helper per i dati demo
export function calculateLevel(xp: number): { level: number; progress: number; title: string } {
  const level = Math.max(1, Math.floor(xp / 250) + 1);
  const currentLevelXP = (level - 1) * 250;
  const nextLevelXP = level * 250;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  const titles = [
    'Cittadino Novizio',
    'Cittadino Attivo',
    'Cittadino Impegnato',
    'Cittadino Esperto',
    'Cittadino Veterano',
    'Cittadino Modello',
    'Ambasciatore Civico',
    'Guardiano della Città',
    'Leggenda Civica',
    'Maestro Cittadino'
  ];
  
  const title = titles[Math.min(level - 1, titles.length - 1)] || 'Maestro Cittadino';
  
  return { level, progress, title };
}

export function checkEarnedBadges(xp: number, level: number, consecutiveDays: number = 1): string[] {
  const earnedBadges: string[] = [];
  
  demoBadges.forEach(badge => {
    let earned = false;
    
    switch (badge.requirement_type) {
      case 'xp_total':
        earned = xp >= badge.requirement_value;
        break;
      case 'level':
        earned = level >= badge.requirement_value;
        break;
      case 'days_consecutive':
        earned = consecutiveDays >= badge.requirement_value;
        break;
    }
    
    if (earned) {
      earnedBadges.push(badge.name);
    }
  });
  
  return earnedBadges;
}

export function getBadgeInfo(badgeName: string) {
  return demoBadges.find(badge => badge.name === badgeName);
}

// Simulatore XP locale per demo
export class DemoXPSystem {
  private static instance: DemoXPSystem;
  private userXP: number = 0;
  private userBadges: string[] = [];
  private consecutiveDays: number = 1;
  private lastLogin: string | null = null;
  private dailyActivities: { [key: string]: number } = {};

  static getInstance(): DemoXPSystem {
    if (!DemoXPSystem.instance) {
      DemoXPSystem.instance = new DemoXPSystem();
    }
    return DemoXPSystem.instance;
  }

  constructor() {
    // Carica dati da localStorage se disponibili
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demoXPSystem');
      if (saved) {
        const data = JSON.parse(saved);
        this.userXP = data.userXP || 0;
        this.userBadges = data.userBadges || [];
        this.consecutiveDays = data.consecutiveDays || 1;
        this.lastLogin = data.lastLogin || null;
        this.dailyActivities = data.dailyActivities || {};
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demoXPSystem', JSON.stringify({
        userXP: this.userXP,
        userBadges: this.userBadges,
        consecutiveDays: this.consecutiveDays,
        lastLogin: this.lastLogin,
        dailyActivities: this.dailyActivities
      }));
    }
  }

  addXP(activityType: string, amount: number): {
    xp_earned: number;
    new_total_xp: number;
    level_up: boolean;
    new_badges: string[];
  } {
    const activity = xpActivities[activityType as keyof typeof xpActivities];
    if (!activity) {
      return { xp_earned: 0, new_total_xp: this.userXP, level_up: false, new_badges: [] };
    }

    // Controlla limiti giornalieri
    const today = new Date().toDateString();
    if (activity.max_daily) {
      const todayCount = this.dailyActivities[`${activityType}_${today}`] || 0;
      if (todayCount >= activity.max_daily) {
        return { xp_earned: 0, new_total_xp: this.userXP, level_up: false, new_badges: [] };
      }
      this.dailyActivities[`${activityType}_${today}`] = todayCount + 1;
    }

    const oldLevel = calculateLevel(this.userXP).level;
    this.userXP += amount;
    const newLevel = calculateLevel(this.userXP).level;
    
    // Controlla nuovi badge
    const oldBadges = [...this.userBadges];
    const allEarnedBadges = checkEarnedBadges(this.userXP, newLevel, this.consecutiveDays);
    this.userBadges = allEarnedBadges;
    const newBadges = allEarnedBadges.filter(badge => !oldBadges.includes(badge));

    // Aggiungi XP bonus per nuovi badge
    newBadges.forEach(badgeName => {
      const badge = getBadgeInfo(badgeName);
      if (badge && badge.xp_reward > 0) {
        this.userXP += badge.xp_reward;
      }
    });

    this.saveToStorage();

    return {
      xp_earned: amount,
      new_total_xp: this.userXP,
      level_up: newLevel > oldLevel,
      new_badges: newBadges
    };
  }

  dailyLogin(): { xp_earned: number; consecutive_days: number } {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    let xpEarned = 0;

    if (this.lastLogin !== today) {
      // Calcola giorni consecutivi
      if (this.lastLogin === yesterday) {
        this.consecutiveDays += 1;
      } else if (this.lastLogin !== null) {
        this.consecutiveDays = 1;
      }

      // XP base per login
      xpEarned = 10;

      // Bonus per giorni consecutivi
      if (this.consecutiveDays >= 7) {
        xpEarned += 20;
      } else if (this.consecutiveDays >= 3) {
        xpEarned += 10;
      }

      this.userXP += xpEarned;
      this.lastLogin = today;
      this.saveToStorage();
    }

    return {
      xp_earned: xpEarned,
      consecutive_days: this.consecutiveDays
    };
  }

  getUserStats() {
    const levelInfo = calculateLevel(this.userXP);
    return {
      total_xp: this.userXP,
      current_level: levelInfo.level,
      level_progress: levelInfo.progress,
      level_title: levelInfo.title,
      badges_count: this.userBadges.length,
      badges_list: this.userBadges,
      rank_position: Math.max(1, 20 - Math.floor(this.userXP / 100))
    };
  }

  reset() {
    this.userXP = 0;
    this.userBadges = [];
    this.consecutiveDays = 1;
    this.lastLogin = null;
    this.dailyActivities = {};
    this.saveToStorage();
  }
}