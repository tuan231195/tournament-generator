import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

let rl: readline.Interface;

export const isPowerOf2 = (size: number) => {
	return size > 1 && (size & (size - 1)) === 0;
};

export const isInteger = (num: string) => {
	return parseInt(num, 10).toString() === num;
};

export const getUserInput = (question: string) => {
	if (!rl) {
		rl = readline.createInterface({ input, output });
	}
	return rl.question(question);
};

export const parseGameResult = (result: string) => {
	const match = result.trim().match(/(\d+)\s*\-\s*(\d+)/);
	if (!match) {
		return null;
	}
	const [, home, away] = match;
	return {
		home: +home,
		away: +away,
	};
};

export const cleanup = () => {
	if (!rl) {
		return;
	}
	rl.close();
};
