import { createAddon, runCli } from "@mediaurl/sdk";
import { itemHandler, catalogHandler } from "./handlers";

const dailymotionAddon = createAddon({
	id: "dailymotion_addon",
	name: "Dailymotion Addon",
	version: "0.0.2",
	icon: "https://static1.dmcdn.net/images/neon/favicons/android-icon-192x192.png.v668e5fde9462cb3a2",
	// Trigger this addon on this kind of items
	itemTypes: ["movie", "directory"],
	triggers: [
		// Trigger this addon when an item has a `id` field
		"id",
	],
	catalogs: [
		{
			features: {
				search: { enabled: true },
				filter: [
					{
						id: "language",
						name: "Language",
						values: [
							{ value: "English", key: "us" },
							{ value: "Español", key: "es" },
							{ value: "Português brasileiro", key: "br" },
							{ value: "中文 (繁體)", key: "tw" },
							{ value: "Deutsch", key: "de" },
						],
					},
					{
						id: "duration",
						name: "Duration",
						values: [
							{ value: "6+ minutes", key: "6" },
							{ value: "12+ minutes", key: "12" },
							{ value: "18+ minutes", key: "18" },
						],
					},
					{
						id: "topics",
						name: "Topics",
						multiselect: true,
						values: [
							{ value: "Technology", key: "Technology" },
							{ value: "Entertainment", key: "Entertainment" },
							{ value: "Design", key: "Design" },
							{ value: "Business", key: "Business" },
							{ value: "Science", key: "Science" },
							{ value: "Global issues", key: "Global issues" },
						],
					},
					{
						id: "limit",
						name: "Limit",
						multiselect: true,
						values: [
							{ value: "10", key: "10 Videos" },
							{ value: "15", key: "15 Videos" },
							{ value: "20", key: "20 Videos" },
							{ value: "25", key: "25 Videos" },
						],
					},
				],
			},
			options: {
				shape: "landscape",
				displayName: true,
			},
		},
	],
});

dailymotionAddon.registerActionHandler("catalog", catalogHandler);

dailymotionAddon.registerActionHandler("item", itemHandler);

runCli([dailymotionAddon], {
	singleMode: true,
});
