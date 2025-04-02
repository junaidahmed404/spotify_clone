console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;

        // Fetch the songs.json file instead of the folder
        let response = await fetch(`${folder}/songs.json`);
        if (!response.ok) throw new Error("Failed to load songs");

        let data = await response.json();
        songs = data.songs; 

        // Show all the songs in the playlist
        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Harry</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>`;
        }

        // Attach event listeners to play songs
        document.querySelectorAll(".songList li").forEach(e => {
            e.addEventListener("click", () => playMusic(e.querySelector(".info div").innerText.trim()));
        });

        return songs;
    } catch (error) {
        console.error("Error loading songs:", error);
    }
}


const playMusic = (track, pause = false) => {
    if (!track) {
        console.error("No track provided to playMusic()");
        return;
    }
    
    let songPath = `${currFolder}/${track}`;
    console.log("Playing:", songPath);

    currentSong.src = songPath;  // Fix path
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};


async function displayAlbums() {
    try {
        let response = await fetch(`songs/albums.json`);
        if (!response.ok) throw new Error("Failed to load albums");

        let data = await response.json();
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        data.albums.forEach(album => {
            cardContainer.innerHTML += `
                <div data-folder="${album.folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="${album.cover}" alt="">
                    <h2>${album.title}</h2>
                    <p>${album.description}</p>
                </div>`;
        });

        // Attach event listeners to load songs when an album is clicked
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                console.log("Fetching Songs for", card.dataset.folder);
                songs = await getSongs(`songs/${card.dataset.folder}`);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });

    } catch (error) {
        console.error("Error loading albums:", error);
    }
}


async function main() {
    console.log("Initializing Music Player...");
    
    await getSongs("songs/ncs"); // Default album
    if (songs.length > 0) playMusic(songs[0], true);

    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index - 1) >= 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if ((index + 1) < songs.length) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
        document.querySelector(".volume img").src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            e.target.src = "img/mute.svg";
        } else {
            currentSong.volume = 0.1;
            e.target.src = "img/volume.svg";
        }
    });
}

main();


main() 