export interface GameData {
	time: Date;
	court: number;
}

export class Game {
	id!: number;
	type!: 'win' | 'lose';
	tournamentId!: number;
	round!: number;
	homeScore?: number;
	awayScore?: number;
	home?: number;
	homeFrom?: number;
	away?: number;
	awayFrom?: number;
	time?: Date;
	court?: number;

	constructor(data: Partial<Game>) {
		Object.assign(this, data);
	}
}
