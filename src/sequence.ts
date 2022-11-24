let sequenceMap = {
	tournament: 0,
	game: 0,
	team: 0,
};

export const nextTournamentId = () => {
	return ++sequenceMap.tournament;
};

export const nextGameId = () => {
	return ++sequenceMap.game;
};

export const nextTeamId = () => {
	return ++sequenceMap.team;
};

export const reset = () => {
	sequenceMap = {
		tournament: 0,
		game: 0,
		team: 0,
	};
};
