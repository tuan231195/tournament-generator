import { faker } from '@faker-js/faker';
import { Game } from './game';
import { nextTeamId } from './sequence';
import { Tournament } from './tournament';
import {
	cleanup,
	getUserInput,
	isInteger,
	isPowerOf2,
	parseGameResult,
} from './utils';

async function main() {
	const teamSize = await getTeamSize();
	const teams = generateTeamData(teamSize);
	const tournament = Tournament.create(teams);
	updateGameData(tournament);
	await promptForTournamentResult(tournament);
	const winningTeam = getWinningTeam(tournament);
	console.log('Winning team is: ', winningTeam!.name);
	cleanup();
}

function getWinningTeam(tournament: Tournament) {
	const finalGame = tournament.games
		.reverse()
		.find((game) => game.type === 'win');
	if (!finalGame) {
		return null;
	}
	if (finalGame.homeScore! > finalGame.awayScore!) {
		return tournament.findTeam(finalGame.home!);
	} else {
		return tournament.findTeam(finalGame.away!);
	}
}

async function getTeamSize() {
	let teamSize: string;
	do {
		teamSize = await getUserInput('Enter the team size: ');
	} while (!(isInteger(teamSize) && isPowerOf2(+teamSize)));
	return +teamSize;
}

async function promptForTournamentResult(tournament: Tournament) {
	let remainingTeams = tournament.games.length;
	let gameIndex = 0;

	do {
		// when there are only 2 teams left, need to prompt for the 3rd position game too
		const numGames =
			remainingTeams === 2 && tournament.games.length > 2
				? remainingTeams / 2 + 1
				: remainingTeams / 2;

		for (let i = 0; i < numGames; i++) {
			const currentGame = tournament.games[gameIndex++];
			const { home, away } = await promptForGameResult(
				tournament,
				currentGame
			);
			tournament.updateScore(currentGame.id, home, away);
		}
		tournament.display();
		remainingTeams = remainingTeams / 2;
	} while (remainingTeams > 1);
}

async function promptForGameResult(tournament: Tournament, game: Game) {
	let gameResult: {
		home: number;
		away: number;
	} | null;
	const home = tournament.findTeam(game.home!);
	const away = tournament.findTeam(game.away!);
	do {
		const userInput = await getUserInput(
			`Enter the result for game #${game.id} (${home.name} - ${away.name}): `
		);
		gameResult = parseGameResult(userInput);
	} while (!gameResult);
	return gameResult;
}

function generateTeamData(teamSize: number) {
	return Array.from({ length: teamSize }).map(() => {
		const id = nextTeamId();
		return {
			id: id,
			name: `Team ${id}`,
		};
	});
}

function updateGameData(tournament: Tournament) {
	let lastDate = new Date();
	const games = tournament.games;
	const gameSize = games.length;
	Array.from({ length: gameSize }).forEach((_, index) => {
		lastDate = faker.date.soon(undefined, lastDate);
		const game = games[index];
		tournament.updateGame(game.id, {
			court: faker.datatype.number({
				max: 10,
			}),
			time: lastDate,
		});
	});
}

main();
