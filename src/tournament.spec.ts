import { reset } from './sequence';
import { Team } from './team';
import { Tournament } from './tournament';

function generateTeamData(teamSize: number) {
	return Array.from({ length: teamSize }).map((_, index) => {
		const id = index + 1;
		return {
			id: id,
			name: `Team ${id}`,
		};
	});
}

describe('Tournament', () => {
	beforeEach(() => {
		reset();
	});
	describe('Create', () => {
		let teams: Team[];

		describe('Validation', () => {
			it('should throw an error if the given team size is invalid', () => {
				const teams = generateTeamData(3);
				expect(() => Tournament.create(teams)).toThrow(
					'Invalid team size'
				);
			});
		});

		describe('More than 2 teams', () => {
			beforeEach(() => {
				teams = generateTeamData(4);
			});
			it('should create correct number of games', () => {
				const { games } = Tournament.create(teams);
				expect(games.length).toEqual(4);
			});

			it('should create correct number of games', () => {
				const { games } = Tournament.create(teams);
				expect(games).toMatchSnapshot();
			});
		});

		describe('2 teams', () => {
			beforeEach(() => {
				teams = generateTeamData(2);
			});
			it('should create correct number of games', () => {
				const { games } = Tournament.create(teams);
				expect(games.length).toEqual(1);
			});

			it('should create correct number of games', () => {
				const { games } = Tournament.create(teams);
				expect(games).toMatchSnapshot();
			});
		});
	});

	describe('Display', () => {
		let tournament: Tournament;

		describe('Complete tournament', () => {
			beforeEach(() => {
				const teams = generateTeamData(4);
				tournament = Tournament.create(teams);
				tournament.updateScore(1, 2, 1);
				tournament.updateGame(1, {
					time: new Date('2021-01-01T00:00:00Z'),
					court: 1,
				});
				tournament.updateScore(2, 3, 2);
				tournament.updateGame(2, {
					time: new Date('2021-01-02T00:00:00Z'),
					court: 2,
				});
				tournament.updateScore(3, 1, 0);
				tournament.updateGame(3, {
					time: new Date('2021-01-03T00:00:00Z'),
					court: 3,
				});
				tournament.updateScore(4, 2, 0);
				tournament.updateGame(4, {
					time: new Date('2021-01-04T00:00:00Z'),
					court: 4,
				});
			});
			it('should display tournament data correctly', () => {
				expect(
					tournament.display({
						style: {
							head: [], //disable colors in header cells
							border: [], //disable colors for the border
						},
					})
				).toMatchSnapshot();
			});
		});

		describe('Incomplete tournament', () => {
			beforeEach(() => {
				const teams = generateTeamData(4);
				tournament = Tournament.create(teams);
			});
			it('should display tournament data correctly', () => {
				expect(
					tournament.display({
						style: {
							head: [], //disable colors in header cells
							border: [], //disable colors for the border
						},
					})
				).toMatchSnapshot();
			});
		});
	});

	describe('Update score', () => {
		let tournament: Tournament;

		beforeEach(() => {
			const teams = generateTeamData(4);
			tournament = Tournament.create(teams);
		});

		describe('Validation', () => {
			it('should throw an error if the score given is invalid', () => {
				expect(() => tournament.updateScore(3, -1, 2)).toThrow(
					'Invalid score'
				);
				expect(() => tournament.updateScore(3, 1, -2)).toThrow(
					'Invalid score'
				);
				expect(() => tournament.updateScore(3, 1, 1)).toThrow(
					'Invalid score'
				);
			});

			it('should throw an error if the given game is not found', () => {
				expect(() => tournament.updateScore(7, 1, 2)).toThrow(
					'Game with id 7 not found'
				);
			});

			it('should throw an error if the home and away team are not settled', () => {
				expect(() => tournament.updateScore(3, 1, 2)).toThrow(
					'Game not settled'
				);
			});

			it('should update the score correctly', () => {
				tournament.updateScore(1, 1, 2);
				const game = tournament.games[0];
				expect(game.awayScore).toEqual(2);
				expect(game.homeScore).toEqual(1);
			});

			it.each([
				[
					{
						home: 1,
						away: 2,
						gameId: 1,
						expected: { home: 1 },
					},
				],
				[
					{
						home: 2,
						away: 1,
						gameId: 1,
						expected: { home: 2 },
					},
				],
			])(
				'should update the parent game participant correctly',
				({ home, away, gameId, expected }) => {
					tournament.updateScore(gameId, home, away);
					const game = tournament.games[3];
					expect(game).toMatchObject(expected);
				}
			);
		});
	});
});
