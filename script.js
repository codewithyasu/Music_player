console.log("Let's Write JavaScript");

let currentAudio = new Audio();
let currentSongIndex = 0;
let allSongs = [];

// Map of filename to metadata
const songMeta = {
    "Jugraafiya": { title: "Jugraafiya", artist: "Udit Narayan, Shreya Ghoshal" },
    "Man Mera": { title: "Man Mera", artist: "Gajendra Verma" },
    "Aapke Pyaar Me": { title: "Aapke Pyaar Me", artist: "Alka Yagnik" },
    "Phir Le Aya": { title: "Phir Le Aya Dil", artist: "Pritam, Rekha Bhardwaj" },
    "Main Yahaan Hoon": { title: "Main Yahaan Hoon", artist: "Udit Narayan" },
    "Yun Hi": { title: "Yun Hi", artist: "Mohit Chauhan" },
    "Haseen": { title: "Haseen", artist: "KK" },
    "Sajde": { title: "Sajde", artist: "Faheem Abdullah, Huzaif Nazar" },
    "Shake It To The Max": { title: "Shake It To The Max", artist: "MOLIY" },
    "Superstar": { title: "Superstar", artist: "DOX" }
};

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let raw = decodeURIComponent(element.href.split("/").pop().replace(".mp3", ""));
            songs.push({
                src: "songs/" + raw + ".mp3",
                title: songMeta[raw]?.title || raw,
                artist: songMeta[raw]?.artist || "Unknown Artist"
            });
        }
    }
    return songs;
}

function playSong(song) {
    currentAudio.pause();
    currentAudio = new Audio(song.src);
    currentAudio.play();

    document.getElementById("playbar-title").innerText = song.title;
    document.getElementById("playbar-artist").innerText = song.artist;

    currentAudio.addEventListener("timeupdate", () => {
        const progress = document.getElementById("progress");
        const duration = document.getElementById("playbar-duration");

        progress.value = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
        duration.innerText = formatTime(currentAudio.currentTime);
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function setupCardEvents() {
    document.querySelectorAll("[data-song]").forEach((card, index) => {
        card.addEventListener("click", () => {
            currentSongIndex = index;
            playSong(allSongs[currentSongIndex]);
        });
    });
}

function setupControls() {
    document.querySelector(".btn-play").addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play();
        } else {
            currentAudio.pause();
        }
    });

    document.querySelector(".btn-next").addEventListener("click", () => {
        currentSongIndex = (currentSongIndex + 1) % allSongs.length;
        playSong(allSongs[currentSongIndex]);
    });

    document.querySelector(".btn-prev").addEventListener("click", () => {
        currentSongIndex = (currentSongIndex - 1 + allSongs.length) % allSongs.length;
        playSong(allSongs[currentSongIndex]);
    });

    document.getElementById("progress").addEventListener("input", (e) => {
        const seekTo = (e.target.value / 100) * currentAudio.duration;
        currentAudio.currentTime = seekTo;
    });

    document.querySelector(".btn-mute").addEventListener("click", () => {
        currentAudio.muted = !currentAudio.muted;
    });
}

async function main() {
    const songs = await getSongs();
    allSongs = songs;

    // Render Song List
    const songUL = document.querySelector(".songsList");
    songs.forEach(song => {
        const li = document.createElement("li");
        li.className = "song-item flex justify-between items-center gap-3 p-3 border rounded-md bg-[#1a1a1a] hover:bg-[#2a2a2a]";
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="icons/logo.svg" width="30">
                <div>
                    <div class="font-bold">${song.title}</div>
                    <div class="text-sm text-gray-400">${song.artist}</div>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <span class="text-sm">Play Now</span>
                <img src="icons/playing.svg" width="18" class="invert">
            </div>`;
        li.addEventListener("click", () => {
            currentSongIndex = songs.indexOf(song);
            playSong(song);
        });
        songUL.appendChild(li);
    });

    setupCardEvents();
    setupControls();
}

main();







