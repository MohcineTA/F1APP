export interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  QualifyingResults?: QualifyingResult[];
  Results?: RaceResult[];
}

export interface QualifyingResult {
  position: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructor: {
    name: string;
    nationality: string;
  };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface RaceResult {
  position: string;
  points: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructor: {
    name: string;
    nationality: string;
  };
  Time?: { time: string };
  status: string;
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
  };
}

export type RaceStatus = 'upcoming' | 'live' | 'finished';
