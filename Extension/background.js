let ws = null;
let videoList = [];
let currentVideoLink = "";

function startWebsockets(){
  ws = new WebSocket('ws://localhost:8080');
  ws.onopen = function() {
    console.log("Websocket connected.")
    // ws.send('');
  };

  ws.onmessage = function(event) {
    console.log("I got ",event.data);
    var message = JSON.parse(event.data);
    if(message.listupdate){
      videoList = message.listupdate;
      videoListWasUpdated();
    }
  };

  ws.onclose = function(){
    // Try to reconnect in 5 seconds
    setTimeout(function(){startWebsockets()}, 5000);
  };
}
startWebsockets();

function broadcastNewVideoList(){
  ws.send(JSON.stringify({
    listupdate:videoList
  }))
}

function videoListWasUpdated(){
  console.log(videoList)
  loadFirstVideo();
  // Do something with the new list
}

function loadNextVideo(){
  videoList.shift();
  while(videoList[0]&&(!videoList[0].link||videoList[0].link.indexOf("https://www.youtube.com/watch")!==0)){
    // Discard inelligible videos;
    videoList.shift();
  }
  broadcastNewVideoList();
  loadFirstVideo(true);
}

function loadFirstVideo(loadAnyways){
  let videoLink = videoList[0] && videoList[0].link || "";
  if(videoLink != currentVideoLink||loadAnyways){
    loadVideo(videoLink);
  }
  currentVideoLink = videoLink;
}

function loadVideo(videoLink){
  chrome.tabs.update(/*sender.tab.tabID,*/ {
      url: (videoLink?videoLink:"http://example.com")
  })
}

chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  // Listen for a video end event
  if (message.data == "videoended") {
    console.log("I GOT IT")
    // Navigate the tab to the next video
    loadNextVideo();
  }
});