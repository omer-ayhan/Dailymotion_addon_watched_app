import { ActionHandlers, MovieItem } from "@mediaurl/sdk";
import axios from "axios";

const catalogHandler: ActionHandlers["catalog"] = async (input, ctx) => {
	const filter: any = input.filter;

	await ctx.requestCache([input.search, input.filter, input.cursor], {
		ttl: Infinity,
		refreshInterval: "1h",
	});

	const { fetch } = ctx;
	const cursor: number = <number>input.cursor || 1;
	// Here should be your website parser script, or an API call to a website to list available items
	const channels = await fetch(
		`https://api.dailymotion.com/videos?fields=id,thumbnail_url%2Ctitle,description,created_time&country=${
			filter.language || "de"
		}&search=${input.topics || "Action"}&limit=${
			Number(filter.limit) || 15
		}&longer_than=${filter.duration || 6}&page=${cursor}`
	).then((res) => res.json());

	return {
		// We don't use pagination, so set `nextCursor` to `null`.
		nextCursor: channels.list.length >= 25 ? cursor + 1 : null,
		items: channels.list.map(({ id, title, thumbnail_url, created_time }) => ({
			type: "movie",
			id,
			ids: {
				id,
			},
			name: title,
			year: new Date(created_time * 1000).getFullYear(),
			images: {
				poster: thumbnail_url,
			},
		})),
	};
};

const itemHandler: ActionHandlers["item"] = async (input, ctx) => {
	const { fetch } = ctx;
	const singleID = input.ids.id;

	const singleVideo = await fetch(
		`https://api.dailymotion.com/video/${singleID}?fields=id,thumbnail_1080_url%2Ctitle,description,created_time,url,language,country`
	).then((res) => res.json());

	const videoSource = await fetch(
		`https://www.dailymotion.com/json/video/${singleID}&fields=stream_h264_sd_url,tiny_url`
	).then((res) => res.json());

	return <MovieItem>{
		type: "movie",
		id: singleID,
		ids: {
			id: singleID,
		},
		name: singleVideo.title,
		description: singleVideo.description,
		releaseDate: `${new Date(singleVideo.created_time * 1000)}`,
		images: {
			poster: singleVideo.thumbnail_1080_url,
		},
		countries: [singleVideo.country],
		sources: videoSource?.stream_h264_sd_url
			? [
					{
						type: "url",
						name: "Watch Video",
						url: videoSource.stream_h264_sd_url,
					},
					{
						type: "externalUrl",
						name: "Direct Link",
						url: videoSource.tiny_url,
					},
			  ]
			: [
					{
						type: "externalUrl",
						name: "Direct Link",
						url: videoSource.tiny_url,
					},
			  ],
	};
};

export { catalogHandler, itemHandler };
