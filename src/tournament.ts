import { Game, GameData } from './game';
import { nextGameId, nextTournamentId } from './sequence';
import { Team } from './team';
import { isPowerOf2 } from './utils';
const Table = require('cli-table3');

export class Tournament {
	id!: number;
	games: Game[] = [];
	teams: Team[] = [];

	static create(teams: Team[]) {
		const tournamentId = nextTournamentId();
		const teamSize = teams.length;
		// team size is not power of 2
		if (!isPowerOf2(teamSize)) {
			throw new Error(`Invalid team size`);
		}

		let currentRoundSize = teamSize / 2;
		let roundNum = 1;

		let currentRoundGames: Game[] = [];
		let previousRoundGames: Game[] = [];

		const tournament = new Tournament();
		tournament.teams = teams;
		tournament.id = nextTournamentId();

		while (currentRoundSize >= 1) {
			for (let i = 0; i < currentRoundSize; i++) {
				const game: Game = new Game({
					type: 'win',
					tournamentId,
					id: nextGameId(),
					round: roundNum,
					...(roundNum === 1 && {
						home: teams[2 * i].id,
						away: teams[2 * i + 1].id,
					}),
				});
				tournament.games.push(game);
				currentRoundGames.push(game);
				if (roundNum > 1) {
					// when the current round number is greater than 1, we can't determine the exact participant teams. Therefore, we must save references to the previous (children) games
					const childGames = [
						previousRoundGames[2 * i],
						previousRoundGames[2 * i + 1],
					];
					game.homeFrom = childGames[0].id;
					game.awayFrom = childGames[1].id;
				}
			}
			if (currentRoundSize === 1 && previousRoundGames.length >= 2) {
				// add the 3rd place game
				const bronzeGame: Game = {
					type: 'lose',
					tournamentId,
					id: nextGameId(),
					round: roundNum,
					homeFrom: previousRoundGames[0].id,
					awayFrom: previousRoundGames[1].id,
				};
				tournament.games.push(bronzeGame);
			}
			previousRoundGames = currentRoundGames;
			currentRoundGames = [];
			currentRoundSize = currentRoundSize / 2;
			roundNum++;
		}

		return tournament;
	}

	findTeam(id: number) {
		const team = this.teams.find((team) => team.id === id);
		if (!team) {
			throw new Error(`Team ${id} not found`);
		}
		return team;
	}

	updateGame(id: number, data: GameData) {
		const game = this.games.find((game) => game.id === id);
		if (!game) {
			throw new Error(`Game with ${id} not found`);
		}
		game.court = data.court;
		game.time = data.time;
	}

	updateScore(id: number, homeScore: number, awayScore: number) {
		if (homeScore < 0 || awayScore < 0 || homeScore === awayScore) {
			throw new Error('Invalid score');
		}
		const game = this.games.find((game) => game.id === id);
		if (!game) {
			throw new Error(`Game with id ${id} not found`);
		}
		const { home, away } = game;
		if (!home || !away) {
			throw new Error('Game not settled');
		}

		game.homeScore = homeScore;
		game.awayScore = awayScore;
		const parentGames = this.games.filter(
			(parentGame) =>
				parentGame.homeFrom === game.id ||
				parentGame.awayFrom === game.id
		);
		if (!parentGames.length) {
			return;
		}
		const winParentGame = parentGames.find(
			(parentGame) => parentGame.type === 'win'
		);
		const loseParentGame = parentGames.find(
			(parentGame) => parentGame.type === 'lose'
		);
		const winningTeam = homeScore > awayScore ? home : away;
		const losingTeam = homeScore < awayScore ? home : away;

		if (winParentGame) {
			if (winParentGame.homeFrom === game.id) {
				winParentGame.home = winningTeam;
			} else {
				winParentGame.away = winningTeam;
			}
		}
		if (loseParentGame) {
			if (loseParentGame.homeFrom === game.id) {
				loseParentGame.home = losingTeam;
			} else {
				loseParentGame.away = losingTeam;
			}
		}
	}

	display(styles: Record<string, unknown> = {}) {
		console.log('-------- Current tournament result ----------');
		const table = new Table({
			head: [
				'ID',
				'Round',
				'Home',
				'Away',
				'Time',
				'Home Score',
				'Away Score',
				'Court',
			],
			...styles,
		});

		table.push(
			...this.games.map((game) => {
				let homeDescription: string;
				let awayDescription: string;
				if (game.home) {
					homeDescription = this.findTeam(game.home).name;
				} else {
					homeDescription = `${
						game.type === 'win' ? 'Winner' : 'Loser'
					} of game ${game.homeFrom}`;
				}

				if (game.away) {
					awayDescription = this.findTeam(game.away).name;
				} else {
					awayDescription = `${
						game.type === 'win' ? 'Winner' : 'Loser'
					} of game ${game.awayFrom}`;
				}
				return [
					game.id,
					game.round,
					homeDescription,
					awayDescription,
					game.time?.toISOString() ?? '',
					game.homeScore ?? '',
					game.awayScore ?? '',
					game.court ?? '',
				];
			})
		);
		console.log(table.toString());
		return table.toString();
	}
}
