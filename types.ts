
export enum MbtiType {
  ISTJ = 'ISTJ', ISFJ = 'ISFJ', INFJ = 'INFJ', INTJ = 'INTJ',
  ISTP = 'ISTP', ISFP = 'ISFP', INFP = 'INFP', INTP = 'INTP',
  ESTP = 'ESTP', ESFP = 'ESFP', ENFP = 'ENFP', ENTP = 'ENTP',
  ESTJ = 'ESTJ', ESFJ = 'ESFJ', ENFJ = 'ENFJ', ENTJ = 'ENTJ',
}

export type BigFiveTrait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';

export type BigFive = Record<BigFiveTrait, number>;

export interface Profile {
  id: string;
  image: string; // base64 string
  nickname: string;
  mbti: MbtiType;
  bigFive: BigFive;
  relation: string;
  appearance: string;
  notes: string;
  createdAt: string; // ISO string
}
