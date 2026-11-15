const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

test('autoplay crosses folders and advances past repeated indices', async () => {
    const handlers = {};
    const player = { play() {}, addEventListener(event, fn) { handlers[event] = fn; } };
    const element = () => ({ appendChild() {}, addEventListener() {}, dataset: {},
        querySelector() { return null; }, classList: { add() {} } });
    const folders = ['A', 'B'].map(folderName => ({ folderName,
        files: [0, 1].map(index => ({ index, url: folderName + index })) }));
    let ready;
    let saved = { folder: 'A', index: 1 };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../renderer.js'), 'utf8'), {
        document: { addEventListener(_, fn) { ready = fn; }, createElement: element,
            querySelectorAll: () => [], getElementById: id => id === 'videoPlayer' ? player : element() },
        window: { electronAPI: { fetchVideos: async () => folders } },
        localStorage: { getItem: () => JSON.stringify(saved), setItem(_, value) { saved = JSON.parse(value); } }
    });
    await ready();
    assert.equal(player.src, 'A1');
    for (const index of [0, 1]) {
        handlers.ended();
        assert.equal(player.src, 'B' + index);
        assert.deepEqual(saved, { folder: 'B', index, time: 0 });
    }
    handlers.ended();
    assert.equal(player.src, 'B1');
});
