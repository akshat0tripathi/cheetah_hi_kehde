
import { MbtiType, BigFiveTrait } from './types';

export const MBTI_TYPES: MbtiType[] = Object.values(MbtiType);

export const BIG_FIVE_TRAITS: { key: BigFiveTrait; name: string; color: string; }[] = [
    { key: 'openness', name: 'Openness', color: '#8884d8' },
    { key: 'conscientiousness', name: 'Conscientiousness', color: '#82ca9d' },
    { key: 'extraversion', name: 'Extraversion', color: '#ffc658' },
    { key: 'agreeableness', name: 'Agreeableness', color: '#ff8042' },
    { key: 'neuroticism', name: 'Neuroticism', color: '#f54242' },
];
