const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    fetchVideos: (folderLinks) => ipcRenderer.invoke('fetch-videos', folderLinks)
});