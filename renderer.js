document.addEventListener('DOMContentLoaded', async () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const folderList = document.getElementById('folderList');

    const pixelDrainFolders = [
        'https://pixeldrain.com/l/pvG4Abkj',
        'https://pixeldrain.com/l/15ZENNeo',
        'https://pixeldrain.com/l/tMvvu6Yq',
        'https://pixeldrain.com/l/FV9EJ5ve',
        'https://pixeldrain.com/l/3LcuJRuQ',
        'https://pixeldrain.com/l/w2hAukxX',
        'https://pixeldrain.com/l/MbJLcYcA',
        'https://pixeldrain.com/l/TBaw1Tp6',
        'https://pixeldrain.com/l/s4DEnuS5',
        'https://pixeldrain.com/l/xMf7ZMzv',
        'https://pixeldrain.com/l/b9XwPSBA',
        'https://pixeldrain.com/l/ABkpM5Nr',
        'https://pixeldrain.com/l/f4Kt9jzH',
        'https://pixeldrain.com/l/TYiY6GU4',
        'https://pixeldrain.com/l/mo4QoCFk',
        'https://pixeldrain.com/l/HsuguvD3',
        'https://pixeldrain.com/l/kTb436Vv',
        'https://pixeldrain.com/l/59HCmx6N',
        'https://pixeldrain.com/l/mUdZdtXz',
        'https://pixeldrain.com/l/ybXdFXtN',
        'https://pixeldrain.com/l/HoiVPVa9',
        'https://pixeldrain.com/l/Br89QGLT',
        'https://pixeldrain.com/l/eo9wEgfe',
        'https://pixeldrain.com/l/B7K3GLhN',
        'https://pixeldrain.com/l/enZf6R88',
        'https://pixeldrain.com/l/1EvkpXLD',
        'https://pixeldrain.com/l/WjxroZSq',
        'https://pixeldrain.com/l/JNBvnBsg',
        'https://pixeldrain.com/l/gcFZLsPn',
        'https://pixeldrain.com/l/JhEhtVpm',
        'https://pixeldrain.com/l/PGjvkoYC',
        'https://pixeldrain.com/l/ETokmVWr',
        'https://pixeldrain.com/l/5pVTECas',
        'https://pixeldrain.com/l/HgqaUnRr',
        'https://pixeldrain.com/l/ce5RfrJA',
        'https://pixeldrain.com/l/G2iWxohw'
    ];

    const folders = await window.electronAPI.fetchVideos(pixelDrainFolders);

    if (folders.length > 0) {
        let lastPlayedData = JSON.parse(localStorage.getItem('lastPlayedVideo')) || {};
        let lastPlayedIndex = lastPlayedData.index || 0;
        let lastPlayedFolder = lastPlayedData.folder || folders[0].folderName;
        let lastPlayedTime = lastPlayedData.time || 0;
        let lastPlayedVideo = null;
        let currentActive = null;
        let allVideos = folders.flatMap(folder => folder.files);

        // Clear any previously active classes before assigning new ones
        document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));

        folders.forEach(folder => {
            const folderHeader = document.createElement('h3');
            folderHeader.textContent = folder.folderName;
            folderList.appendChild(folderHeader);

            const ul = document.createElement('ul');
            folder.files.forEach((video, index) => {
                const li = document.createElement('li');
                li.textContent = `Episode ${video.name}`;
                li.dataset.index = video.index;
                li.dataset.folder = folder.folderName;

                if (video.index === lastPlayedIndex && folder.folderName === lastPlayedFolder) {
                    li.classList.add('active');
                    lastPlayedVideo = video;
                    currentActive = li;
                }

                li.addEventListener('click', () => {
                    document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
                    li.classList.add('active');
                    currentActive = li;
                    lastPlayedIndex = video.index;
                    lastPlayedFolder = folder.folderName;
                    localStorage.setItem('lastPlayedVideo', JSON.stringify({ index: lastPlayedIndex, folder: lastPlayedFolder, time: 0 }));
                    videoPlayer.src = video.url;
                    videoPlayer.play();
                });
                ul.appendChild(li);
            });
            folderList.appendChild(ul);
        });

        if (lastPlayedVideo) {
            videoPlayer.src = lastPlayedVideo.url;
            videoPlayer.currentTime = lastPlayedTime;
            videoPlayer.play();
        }

        videoPlayer.addEventListener('play', () => {
            document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
            const newActive = folderList.querySelector(`li[data-index='${lastPlayedIndex}'][data-folder='${lastPlayedFolder}']`);
            if (newActive) {
                newActive.classList.add('active');
            }
        });

        videoPlayer.addEventListener('timeupdate', () => {
            localStorage.setItem('lastPlayedVideo', JSON.stringify({ index: lastPlayedIndex, folder: lastPlayedFolder, time: videoPlayer.currentTime }));
        });

        videoPlayer.addEventListener('ended', () => {
            let nextIndex = allVideos.findIndex(video => video.index === lastPlayedIndex) + 1;
            if (nextIndex < allVideos.length) {
                lastPlayedIndex = allVideos[nextIndex].index;
                lastPlayedFolder = allVideos[nextIndex].folderName;
                localStorage.setItem('lastPlayedVideo', JSON.stringify({ index: lastPlayedIndex, folder: lastPlayedFolder, time: 0 }));
                videoPlayer.src = allVideos[nextIndex].url;
                videoPlayer.play();
                document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
                const newActive = folderList.querySelector(`li[data-index='${lastPlayedIndex}'][data-folder='${lastPlayedFolder}']`);
                if (newActive) {
                    newActive.classList.add('active');
                }
            }
        });
    }
});