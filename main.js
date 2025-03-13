const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
});

ipcMain.handle('fetch-videos', async (_, folderLinks) => {
    try {
        let allFolders = [];
        const episodeRegex = /\[(\d+-\d+)\]/; // Extract episode range from file name

        for (const folderUrl of folderLinks) {
            const folderId = folderUrl.split('/').pop(); // Extract folder ID
            const response = await axios.get(`https://pixeldrain.com/api/list/${folderId}`);

            if (response.data) {
                let folderName = response.data.title.split("]")[1].split("[")[0] || `Folder ${folderId}`; // Use folder name if available
                const fileLinks = response.data.files.map((file, index) => {
                    const match = file.name.match(episodeRegex);
                    const episode = match ? match[1] : file.name; // Default to full name if no match
                    return { index, name: episode, url: `https://pixeldrain.com/api/file/${file.id}` };
                });
                allFolders.push({ folderName, files: fileLinks });
            }
        }

        return allFolders;
    } catch (error) {
        console.error('Error fetching videos:', error);
        return [];
    }
});
