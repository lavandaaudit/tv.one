document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('tv-player');
    const vIdLabel = document.getElementById('v-id');
    const list = document.getElementById('tv-list');
    
    let videoIds = [];
    let initialStart = true;
    const VIDEO_DIR = 'videos/';

    // Utility: Check if file exists
    async function checkFile(url) {
        try {
            const res = await fetch(url + '?v=' + Math.random(), { method: 'HEAD' });
            return res.ok;
        } catch(e) {
            return false;
        }
    }

    // Scan for available videos incrementally
    async function scanArchive() {
        let id = 1;
        let consecutiveMiss = 0;
        const totalPossible = 1000;

        while (consecutiveMiss < 10 && id <= totalPossible) {
            const url = `${VIDEO_DIR}${id}.mp4`;
            const ok = await checkFile(url);
            
            if (ok) {
                videoIds.push(id);
                createPlaylistBtn(id);
                consecutiveMiss = 0;
                
                // If it's the first one found and we need to start
                if (initialStart && id === 1) {
                    playVideo(1);
                    initialStart = false;
                }
            } else {
                consecutiveMiss++;
            }
            id++;
            
            // Minimal pause to keep UI responsive during long scans
            if (id % 50 === 0) await new Promise(r => setTimeout(r, 5));
        }

        // If scan finished and we haven't started playing (e.g. #1 was missing)
        if (initialStart && videoIds.length > 0) {
            playVideo(videoIds[0]);
            initialStart = false;
        }
    }

    function createPlaylistBtn(id) {
        if (!list) return;
        const btn = document.createElement('div');
        btn.className = 'tv-item-btn';
        btn.textContent = id;
        btn.dataset.id = id;
        btn.onclick = () => {
            initialStart = false; // User manually started
            playVideo(id);
        };
        list.appendChild(btn);
    }

    function playVideo(id) {
        if (!player) return;
        player.src = `${VIDEO_DIR}${id}.mp4`;
        vIdLabel.textContent = `#${id}`;
        
        // Update playlist UI
        document.querySelectorAll('.tv-item-btn').forEach(b => b.classList.remove('active'));
        const activeItem = document.querySelector(`.tv-item-btn[data-id="${id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        player.play().catch(e => console.log("Waiting for user interaction to play..."));
    }

    // TV Mode ends -> go to random next
    player.onended = () => {
        if (videoIds.length === 0) return;
        const nextIdx = Math.floor(Math.random() * videoIds.length);
        playVideo(videoIds[nextIdx]);
    };

    // User click to unmute (standard browser policy)
    window.addEventListener('click', () => {
        if (player.paused) player.play();
        player.muted = false;
    }, { once: true });

    // Bootstrap
    scanArchive();
});
