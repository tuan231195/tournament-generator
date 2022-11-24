import { isInteger, isPowerOf2, parseGameResult } from './utils';

describe('isInteger', () => {
	it('should check if a string is an integer', () => {
		expect(isInteger('1')).toBeTruthy();
		expect(isInteger('1.4')).toBeFalsy();
		expect(isInteger('')).toBeFalsy();
		expect(isInteger('adsfasd')).toBeFalsy();
	});
});

describe('isPowerOf2', () => {
	it('should check if a number is the power of 2', () => {
		expect(isPowerOf2(2)).toBeTruthy();
		expect(isPowerOf2(4)).toBeTruthy();
		expect(isPowerOf2(1)).toBeFalsy();
		expect(isPowerOf2(3)).toBeFalsy();
		expect(isPowerOf2(0.5)).toBeFalsy();
	});
});

describe('parseGameResult', () => {
	it('should parse game result correctly', () => {
		expect(parseGameResult(' 1 - 2 ')).toEqual({
			home: 1,
			away: 2,
		});
		expect(parseGameResult('1-2')).toEqual({
			home: 1,
			away: 2,
		});
		expect(parseGameResult(' 1 @ 2 ')).toEqual(null);
	});
});
