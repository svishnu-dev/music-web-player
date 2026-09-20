const audio = document.getElementById("music");

const lyricsTrack = document.getElementById("lyrics-track");

let lyrics = [];

let currentIndex = -1;


/* =========================
   GET LYRICS FROM LRCLIB
========================= */

const url =
    "https://lrclib.net/api/search?track_name=Treat%20You%20Better&artist_name=Shawn%20Mendes";


fetch(url)

    .then(response => response.json())

    .then(data => {

        console.log(data);


        const song = data.find(item => item.syncedLyrics);


        if (!song) {

            lyricsTrack.innerHTML =
                '<p class="lyric-line active">Synced lyrics not found</p>';

            return;
        }


        /*
            LRCLIB gives us lyrics like:

            [00:12.50]First line
            [00:17.20]Second line
            [00:21.80]Third line
        */

        const lines = song.syncedLyrics.split("\n");


        lyrics = lines

            .map(line => {

                const match =
                    line.match(/\[(\d+):(\d+\.\d+)\](.*)/);


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

            })

            .filter(line => line !== null);


        console.log(lyrics);


        /*
            Create ALL lyric elements once.

            We don't create/remove lyrics
            every time the current line changes.
        */

        lyrics.forEach((lyric, index) => {

            const p = document.createElement("p");


            p.classList.add("lyric-line");


            p.textContent = lyric.text;


            p.dataset.index = index;


            lyricsTrack.appendChild(p);

        });

    })


    .catch(error => {

        console.log("Error:", error);

    });



/* =========================
   LYRIC SYNCHRONIZATION
========================= */

audio.addEventListener("timeupdate", function () {

    const offset = 5.3;

    let newIndex = -1;


    /*
        Find the lyric that should currently
        be playing.
    */

    for (let i = 0; i < lyrics.length; i++) {

        if (lyrics[i].time <= audio.currentTime + offset) {

            newIndex = i;

        }

    }


    /*
        No lyric yet
    */

    if (newIndex === -1) {
        return;
    }


    /*
        If the lyric hasn't changed,
        don't move anything.
    */

    if (newIndex === currentIndex) {
        return;
    }


    currentIndex = newIndex;


    /*
        Get all lyric elements
    */

    const lyricElements =
        document.querySelectorAll(".lyric-line");


    /*
        Highlight current lyric
    */

    lyricElements.forEach((element, index) => {

        if (index === currentIndex) {

            element.classList.add("active");

        } else {

            element.classList.remove("active");

        }

    });


    /*
        Move the ENTIRE lyric track upward.

        Every lyric has exactly 30px height.

        So:

        line 0 -> 0px
        line 1 -> -30px
        line 2 -> -60px
        line 3 -> -90px
        ...
    */

    const lineHeight = 30;


    const movement =
        currentIndex * lineHeight;


    lyricsTrack.style.transform =
        `translateY(calc(-15px - ${movement}px))`;

});



/* =========================
   PLAY / PAUSE
========================= */

const playBtn =
    document.getElementById("playBtn");


playBtn.addEventListener("click", function () {

    if (audio.paused) {

        audio.play();

        playBtn.innerHTML =
            '<span class="pause-icon"></span>';

    } else {

        audio.pause();

        playBtn.innerHTML =
            '<span class="play-icon">▶</span>';

    }

});



/* =========================
   PROGRESS BAR
========================= */

const progress =
    document.getElementById("progress");


const currentTimeDisplay =
    document.getElementById("currentTime");


const durationDisplay =
    document.getElementById("duration");



audio.addEventListener("timeupdate", function () {

    const percentage =
        (audio.currentTime / audio.duration) * 100;


    progress.value = percentage;


    progress.style.background =
        `linear-gradient(
            to right,
            #edefef ${percentage}%,
            #555 ${percentage}%
        )`;


    currentTimeDisplay.textContent =
        formatTime(audio.currentTime);


    durationDisplay.textContent =
        formatTime(audio.duration);

});



/* =========================
   FORMAT TIME
========================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);


    const secs =
        Math.floor(seconds % 60);


    return `${minutes}:${secs
        .toString()
        .padStart(2, "0")}`;

}



/* =========================
   SEEK
========================= */

progress.addEventListener("input", function () {

    const newTime =
        (progress.value / 100) *
        audio.duration;


    audio.currentTime = newTime;

});