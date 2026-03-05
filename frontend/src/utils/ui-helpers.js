import { formatDistanceToNow } from 'date-fns';

export const GAMES_LIST = [
    'Roblox',
    'Minecraft',
    'Counter-Strike 2',
    'League of Legends',
    'Dota 2',
    'Genshin Impact',
    'Fortnite',
    'Valorant',
    'Overwatch 2',
    'Apex Legends',
    'Sea of Thieves',
    'Destiny 2',
    'Rainbow Six Siege',
    'Dead by Daylight',
    'Ark: Survival Evolved',
    'Call of Duty: Warzone',
    'Team Fortress 2',
    'The Elder Scrolls Online',
    'Among Us',
    'Fall Guys: Ultimate Knockout'
];

export const GAME_COLORS = {
    'Roblox': 'bg-red-600 text-white',
    'Minecraft': 'bg-green-600 text-white',
    'Counter-Strike 2': 'bg-orange-500 text-white',
    'League of Legends': 'bg-blue-600 text-white',
    'Dota 2': 'bg-red-700 text-white',
    'Genshin Impact': 'bg-indigo-400 text-white',
    'Fortnite': 'bg-purple-600 text-white',
    'Valorant': 'bg-red-500 text-white',
    'Overwatch 2': 'bg-orange-600 text-white',
    'Apex Legends': 'bg-red-600 text-white',
    'Sea of Thieves': 'bg-teal-600 text-white',
    'Destiny 2': 'bg-slate-700 text-white',
    'Rainbow Six Siege': 'bg-blue-800 text-white',
    'Dead by Daylight': 'bg-gray-800 text-white',
    'Ark: Survival Evolved': 'bg-green-800 text-white',
    'Call of Duty: Warzone': 'bg-emerald-700 text-white',
    'Team Fortress 2': 'bg-orange-500 text-white',
    'The Elder Scrolls Online': 'bg-yellow-700 text-white',
    'Among Us': 'bg-red-500 text-white',
    'Fall Guys: Ultimate Knockout': 'bg-pink-500 text-white'
};

export const STATUS_COLORS = {
    open: 'bg-blue-100 text-blue-800 border-blue-600',
    matched: 'bg-[#0cf3e1] text-gray-900 border-gray-900', // Neo-brutalist cyan
    completed: 'bg-gray-200 text-gray-700 border-gray-900',
    failed: 'bg-red-100 text-red-800 border-red-600'
};

export const formatCurrency = (amount) => {
    if (!amount) return '◈0.00';
    return `◈${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

export const formatTimeAgo = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Deterministic avatar gradient based on userId string
const AVATAR_GRADIENTS = [
    'from-blue-400 to-purple-600',
    'from-green-400 to-teal-600',
    'from-orange-400 to-red-600',
    'from-pink-400 to-rose-600',
    'from-indigo-400 to-blue-600',
    'from-yellow-400 to-orange-600',
    'from-teal-400 to-cyan-600',
    'from-purple-400 to-indigo-600',
];

export const getAvatarGradient = (id = '') => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};
