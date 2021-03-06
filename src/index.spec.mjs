/* eslint-env jasmine */

import path from 'path';

import webpack from 'webpack';
import MemoryFs from 'memory-fs';

import {Exception} from './exception';

const exceptionMessagePrefix = (new Exception('')).message;

async function webpackAsync(options, properties) {
	const compiler = webpack(options);
	if (properties) {
		for (const p of Object.keys(properties)) {
			compiler[p] = properties[p];
		}
	}
	const stats = await new Promise((resolve, reject) => {
		compiler.run((err, stats) => {
			if (stats) {
				if (!err && stats.hasErrors()) {
					// eslint-disable-next-line prefer-destructuring
					err = stats.compilation.errors[0];
				}
			}
			if (err) {
				reject(err);
				return;
			}
			resolve(stats);
		});
	});
	return {
		compiler,
		stats
	};
}

async function webpackMemory(info) {
	const fnCode = 'test.js';
	const fnMap = `${fnCode}.map`;
	const {compiler, stats} = await webpackAsync({
		entry: info.entry,
		mode: 'development',
		devtool: 'source-map',
		output: {
			filename: fnCode,
			path: '/'
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					use: {
						loader: path.resolve('.')
					}
				}
			]
		}
	}, {
		outputFileSystem: new MemoryFs()
	});
	const fsData = compiler.outputFileSystem.data;
	const code = fsData[fnCode].toString('utf8');
	const map = fsData[fnMap].toString('utf8');
	return {
		compiler,
		stats,
		code,
		map
	};
}

function listSources(map, skipWebpack = true, sorted = true) {
	const sources = map.sources || [];
	const sourcesContent = map.sourcesContent || [];
	const pairs = [];
	for (let i = 0; i < sources.length; i++) {
		const source = sources[i];
		if (skipWebpack && !source.indexOf('webpack:///webpack/')) {
			continue;
		}
		pairs.push({
			source,
			content: sourcesContent[i]
		});
	}
	if (sorted) {
		pairs.sort((a, b) => {
			if (a < b) {
				return -1;
			}
			if (b < a) {
				return 1;
			}
			return 0;
		});
	}
	return {
		names: pairs.map(e => e.source),
		pairs
	};
}

describe('index', () => {
	describe('fixtures', () => {
		it('content', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/content/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/content/one.js',
				'webpack:///spec/fixtures/content/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('indexed', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/indexed/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/indexed/one.js',
				'webpack:///spec/fixtures/indexed/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('external', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/external/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/external/one.js',
				'webpack:///spec/fixtures/external/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('content-and-external', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/content-and-external/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/content-and-external/one.js',
				'webpack:///spec/fixtures/content-and-external/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('datauri-base64', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/datauri-base64/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/datauri-base64/one.js',
				'webpack:///spec/fixtures/datauri-base64/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('datauri-utf8', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/datauri-utf8/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/datauri-utf8/one.js',
				'webpack:///spec/fixtures/datauri-utf8/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('root-relative', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/root-relative/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/root-relative/root/one.js',
				'webpack:///spec/fixtures/root-relative/root/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('root-relative-dot', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/root-relative-dot/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/root-relative-dot/one.js',
				'webpack:///spec/fixtures/root-relative-dot/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('root-relative-dot-slash', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/root-relative-dot-slash/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/root-relative-dot-slash/one.js',
				'webpack:///spec/fixtures/root-relative-dot-slash/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('root-relative-parent', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/root-relative-parent/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/root/one.js',
				'webpack:///spec/fixtures/root/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('external-root', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/external-root/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/external-root/map/src/one.js',
				'webpack:///spec/fixtures/external-root/map/src/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('sources-relative', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/sources-relative/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/sources-relative/one.js',
				'webpack:///spec/fixtures/sources-relative/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('url-relative', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/url-relative/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/url-relative/one.js',
				'webpack:///spec/fixtures/url-relative/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('url-encoded', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/url-encoded/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/url-encoded/one.js',
				'webpack:///spec/fixtures/url-encoded/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('url-decoded', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/url-decoded/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///spec/fixtures/url-decoded/one.js',
				'webpack:///spec/fixtures/url-decoded/two.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('none', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/none/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///./spec/fixtures/none/min.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings).toEqual([]);
		});

		it('external-missing-one', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/external-missing-one/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///./spec/fixtures/external-missing-one/min.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings.length).toBe(1);
			const {message} = warnings[0].warning;
			expect(message.indexOf(exceptionMessagePrefix)).toBe(0);
		});

		it('external-missing-all', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/external-missing-all/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///./spec/fixtures/external-missing-all/min.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings.length).toBe(1);
			const {message} = warnings[0].warning;
			expect(message.indexOf(exceptionMessagePrefix)).toBe(0);
		});

		it('datauri-bad', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/datauri-bad/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///./spec/fixtures/datauri-bad/min.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings.length).toBe(1);
			const {message} = warnings[0].warning;
			expect(message.indexOf(exceptionMessagePrefix)).toBe(0);
		});

		it('map-json-invalid', async () => {
			const {stats, map} = await webpackMemory({
				entry: './spec/fixtures/map-json-invalid/min'
			});
			const mapData = JSON.parse(map);
			const sources = listSources(mapData);
			expect(sources.names).toEqual([
				'webpack:///./spec/fixtures/map-json-invalid/min.js'
			]);
			for (const pair of sources.pairs) {
				expect(typeof pair.content).toBe('string');
			}
			const {errors, warnings} = stats.compilation;
			expect(errors).toEqual([]);
			expect(warnings.length).toBe(1);
			const {message} = warnings[0].warning;
			expect(message.indexOf(exceptionMessagePrefix)).toBe(0);
		});
	});
});
