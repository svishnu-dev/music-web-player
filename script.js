const audio = document.getElementById("music");
const lyricDisplay = document.getElementById("current-lyric");

let lyrics = [];

const url =
    "https://lrclib.net/api/search?track_name=Treat%20You%20Better&artist_name=Shawn%20Mendes";

fetch(url)
    .then(response => response.json())
    .then(data => {

        console.log(data);

        const songDuration = audio.duration;

const song = data.find(item =>
    item.syncedLyrics &&
    Math.abs(item.duration - songDuration) <= 2
);

        if (!song) {
            lyricDisplay.textContent = "Synced lyrics not found";
            return;
        }

        const lines = song.syncedLyrics.split("\n");

        lyrics = lines.map(line => {

            const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);

            if (!match) {
                return null;
            }

            const minutes = Number(match[1]);
            const seconds = Number(match[2]);
            const text = match[3].trim();

            return {
                time: minutes * 60 + seconds,
                text: text
            };
        }).filter(line => line !== null);

        console.log(lyrics);
    })
    .catch(error => {
        console.log("Error:", error);
    });


audio.addEventListener("timeupdate", function () {
    let offset=5.5
    let currentLyric = "";

    for (let i = 0; i < lyrics.length; i++) {

        if (lyrics[i].time <= audio.currentTime+offset) {
            currentLyric = lyrics[i].text;
        }

    }

    lyricDisplay.textContent = currentLyric;
});