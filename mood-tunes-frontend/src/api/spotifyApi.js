import axios from "axios";

export const fetchSpotifyTracks = async (mood, apiKey) => {
    const moodToGenreMap = {
        happy: "pop,indie_pop,feel_good",
        sad: "acoustic,piano,singer_songwriter",
        energetic: "rock,hard_rock,power_metal,workout",
        relaxed: "jazz,chill,ambient,lounge",
        romantic: "rnb,soul,romance,love_songs",
        party: "dance,edm,party,electropop",
        chill: "chill,lofi,downtempo,electronica",
        focused: "classical,study,focus,ambient",
        adventurous: "world,folk,bluegrass,latin",
        nostalgic: "80s,90s,retro,synthwave",
        aggressive: "metal,hardcore,punk,thrash",
        uplifting: "upbeat,feel_good,anthem,indie_pop",
        moody: "trip_hop,dark_ambient,dream_pop,gothic",
        fun: "disco,funk,party,electropop",
        soulful: "soul,gospel,rnb,jazz",
        experimental: "experimental,avant_garde,psychedelic",
    };

    const genre = moodToGenreMap[mood.toLowerCase()] || "pop";

    try {
        const prompt = `Generate a list of 16 songs for the mood "${mood}" using genres like ${genre}. Use the following format exactly:

1. "Song Title" Artist: Artist Name Album: Album Name
2. "Song Title" Artist: Artist Name Album: Album Name
... and so on, up to 16 songs.`;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a music recommender bot." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 500,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const rawText = response.data.choices[0].message.content;
        console.log("Raw response:", rawText);

        // Split by lines and filter out empty lines
        const lines = rawText.split("\n").map(line => line.trim()).filter(line => line);

        const tracks = [];
        lines.forEach((line, index) => {
            // Expected format:
            // 1. "Song Title" Artist: Artist Name Album: Album Name
            // We'll split by 'Artist:' and 'Album:' to isolate parts
            const numberMatch = line.match(/^(\d+)\.\s*"([^"]+)"/);
            if (!numberMatch) return; // If line doesn't start with number and quoted song name, skip

            const songName = numberMatch[2];

            // Remove the leading number and song name part to handle the rest
            const remainder = line.replace(numberMatch[0], "").trim();

            // remainder now should start with something like: Artist: Artist Name Album: Album Name
            const artistSplit = remainder.split("Artist:");
            if (artistSplit.length < 2) return;

            const afterArtist = artistSplit[1].trim();

            const albumSplit = afterArtist.split("Album:");
            if (albumSplit.length < 2) return;

            const artistName = albumSplit[0].trim();
            const albumName = albumSplit[1].trim();

            tracks.push({
                id: `track-${index}`,
                name: songName,
                artist: artistName,
                album: albumName,
                albumCover: "https://via.placeholder.com/200",
                url: "#",
            });
        });

        console.log("Parsed tracks:", tracks);
        return tracks;
    } catch (error) {
        console.error("Error fetching tracks from OpenAI:", error);
        return [];
    }
};
