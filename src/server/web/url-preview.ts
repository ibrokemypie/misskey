import * as Koa from 'koa';
import * as request from 'request-promise-native';
import summaly from 'summaly';
import config from '../../config';

module.exports = async (ctx: Koa.Context) => {
	try {
		const summary = await getSummary(ctx.query.url);

		// Cache 7days
		ctx.set('Cache-Control', 'max-age=604800, immutable');

		ctx.body = summary;
	} catch (e) {
		ctx.status = 200;
		ctx.set('Cache-Control', 'max-age=86400, immutable');
		ctx.body = '{}';
	}
};

export async function getSummary(url: string) {
	const summary = config.summalyProxy ? await request.get({
		url: config.summalyProxy,
		proxy: config.proxy,
		qs: {
			url: url
		},
		json: true
	}) : await summaly(url, {
		followRedirects: false
	});

	summary.icon = wrap(summary.icon);
	summary.thumbnail = wrap(summary.thumbnail);

	return summary;
}

function wrap(url: string): string {
	return url != null
		? url.startsWith('https://') || url.startsWith('data:')
			? url
			: `https://images.weserv.nl/?url=${encodeURIComponent(url.replace(/^http:\/\//, ''))}`
		: null;
}
