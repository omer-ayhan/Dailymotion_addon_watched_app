import { createAddon, MovieItem } from "@mediaurl/sdk";
import axios from "axios";

const exampleAddon = createAddon({
  id: "dailymotion_addon",
  name: "Dailymotion Addon",
  version: "0.0.1",

  // Trigger this addon on this kind of items
  itemTypes: ["movie", "series"],
  triggers: [
    // Trigger this addon when an item has a `name` field
    "id",
    // or trigger it when an item has a `ids.imdb_id` field
    // "imdb_id",
  ],
});

exampleAddon.registerActionHandler("catalog", async (input, ctx) => {
  console.log(input, "catalog");
  // Here should be your website parser script, or an API call to a website to list available items

  const { data: channels } = await axios.get(
    `https://api.dailymotion.com/videos?fields=id,thumbnail_url%2Ctitle,description,created_time&country=${input.region.toLowerCase()}&search=action+movie&limit=15`
  );

  return {
    // We don't use pagination, so set `nextCursor` to `null`.
    nextCursor: null,
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
});

exampleAddon.registerActionHandler("item", async (input, ctx) => {
  const singleID = input.ids.id;
  const { data: singleVideo } = await axios.get(
    `https://api.dailymotion.com/video/${singleID}?fields=id,thumbnail_1080_url%2Ctitle,description,created_time,url,language,country`
  );

  return <MovieItem>{
    type: "movie",
    id: singleID,
    ids: {
      id: singleID,
    },
    name: singleVideo.title,
    description: singleVideo.description,
    year: new Date(singleVideo.created_time * 1000).getFullYear(),
    images: {
      poster: singleVideo.thumbnail_1080_url,
    },
    countries: [singleVideo.country],
    genres: ["Action"],
    spokenLanguages: [singleVideo.language],
  };
});

exampleAddon.registerActionHandler("source", async (input, ctx) => {
  // 	return {
  // 		type: "url",
  // 		name: "Resolve handler example",
  // 		url: `https://videocnd.example.com/resolve-example/${input.ids.imdb_id}`,
  // 		languages: ["en"],
  // 	};
  // }

  console.log(input);
  return [
    // This `url` can be played directly and don't need to be resolved.
    {
      type: "url",
      name: "1080p with 30fps",
      url: `https://thepaciellogroup.github.io/AT-browser-tests/video/ElephantsDream.mp4`,
      languages: ["en"],
    },
    // This YouTube source will be resolved by the internal YouTube resolver.
    {
      type: "externalUrl",
      name: "Direct link",
      url: `https://www.dailymotion.com/video/${input.ids.id}`,
      languages: ["en"],
    },
  ];
});

// Another resolve handler hanlding `https://test-videos.co.uk/` links
exampleAddon.addResolveHandler(
  new RegExp("//test-videos.co.uk/(.*)"),
  async (match, input, ctx) => {
    // For example, open the website here with `await fetch(input.url);` and process the output.
    if (input.url === "https://test-videos.co.uk/jellyfish/mp4-h264") {
      return [
        {
          url: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/1080/Jellyfish_1080_10s_30MB.mp4",
          quality: "1080p",
        },
        {
          url: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_30MB.mp4",
          quality: "720p",
        },
        {
          url: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_30MB.mp4",
          quality: "360p",
        },
      ];
    }

    throw new Error(`Can not resolvelink ${input.url}`);
  }
);

export { exampleAddon };
