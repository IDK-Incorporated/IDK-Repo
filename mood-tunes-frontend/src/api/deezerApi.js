// src/api/deezerApi.js

export const initializeDeezer = () => {
    return new Promise((resolve) => {
        // Wait for the Deezer SDK to load
        window.DZ.init({
            appId: process.env.REACT_APP_DEEZER_APP_ID, // You'll need to set this in your .env file
            channelUrl: `${window.location.origin}/deezer_channel.html`,
        });
        resolve();
    });
};

export const fetchDeezerTracks = async (mood) => {
    // Map moods to Deezer genres or search queries
    const moodToQueryMap = {
        happy: 'happy',
        sad: 'sad',
        energetic: 'energetic',
        relaxed: 'relax',
        romantic: 'romantic',
        party: 'party',
        chill: 'chill',
        // Add more mappings as needed
    };

    const query = moodToQueryMap[mood.toLowerCase()] || 'pop';

    try {
        const response = await fetch(
            `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=16`
        );
        const data = await response.json();

        // Format the returned tracks
        return data.data.map((track) => ({
            id: track.id.toString(),
            name: track.title || 'Unknown Title',
            album: track.album?.title || 'Unknown Album',
            artist: track.artist?.name || 'Unknown Artist',
            albumCover: track.album?.cover_medium || 'https://via.placeholder.com/200',
            url: track.link || '#',
            previewUrl: track.preview || null,
        }));
    } catch (error) {
        console.error('Error fetching Deezer tracks:', error);
        return [];
    }
};
