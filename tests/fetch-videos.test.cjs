const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function load(get) {
  let handler;
  const electron={app:{whenReady:()=>({then(){}})},ipcMain:{handle(name,fn){assert.equal(name,'fetch-videos');handler=fn;}}};
  const context={require:name=>name==='electron'?electron:name==='axios'?{get}:require(name),__dirname:path.join(__dirname,'..'),console:{error(){}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../main.js'),'utf8'),context);
  return links=>handler(null,links);
}
test('folder response maps episode ranges and URLs',async()=>{
  const fetchVideos=load(async url=>{
    assert.equal(url,'https://pixeldrain.com/api/list/abc');
    return {data:{title:'[One Pace] Romance Dawn [1080p]',files:[{id:'one',name:'Episode [1-3].mkv'},{id:'two',name:'Special.mkv'}]}};
  });
  const folders=JSON.parse(JSON.stringify(await fetchVideos(['https://pixeldrain.com/l/abc'])));
  assert.deepEqual(folders,[{folderName:' Romance Dawn ',files:[{index:0,name:'1-3',url:'https://pixeldrain.com/api/file/one'},{index:1,name:'Special.mkv',url:'https://pixeldrain.com/api/file/two'}]}]);
});
test('empty folder list does not call the API',async()=>{
  let calls=0; const fetchVideos=load(async()=>{calls++;});
  assert.equal((await fetchVideos([])).length,0); assert.equal(calls,0);
});
test('API failure returns an empty result',async()=>{
  const fetchVideos=load(async()=>{throw Error('offline');});
  assert.equal((await fetchVideos(['https://pixeldrain.com/l/abc'])).length,0);
});
