let ws = null;
let playlists = {};
let currentlyPlayingVideoLink = "";
let reconnectTimeout = 0;
let reconnectImmediate = false;
let status = "";
let host = "";
let place = "";
const READY_PATH = "/ready.html";

function sendStatusToPopup(){
  chrome.runtime.sendMessage({status});
  console.log(status);
}
function setStatus(message){
  if(status != message){
    status = message;
    sendStatusToPopup();
  }
}

function startWebsockets(){
  playlists = {};
  currentlyPlayingVideoLink = "";

  chrome.storage.local.get(function(storage){
    host = storage.host||"";
    place = storage.place||"";
    if(!host){
      setStatus("No host specified.")
      ws = null;
    }
    else{
      setStatus("Connecting to "+host+"...")
      ws = new WebSocket('ws://'+host);

      ws.onopen = function(event) {
        ws.send(JSON.stringify({
          register:{
            place
          }
        }))
      }

      ws.onmessage = function(event) {
        // console.log(event.data)
        var message = JSON.parse(event.data);
        if(typeof message.playlists === "object"){
          playlists = {
            ...playlists,
            ...message.playlists
          }
          if(!(place in playlists)){
            setStatus("Connected to "+host+
              (place?" but could not find \""+(place||"")+"\" in ":". Please specify from ")+"available locations: "+Object.keys(playlists).join(", "));
          }
          else if(place in message.playlists){
            let firstVideo = message.playlists[place][0];
            setStatus("Connected to "+host+" at "+place+". "+
              (firstVideo?"PLAYING "+firstVideo.title+".":"READY."));
            navigateToVideoIfChanged(firstVideo&&firstVideo.link);
          }
        }
      };

      ws.onclose = function(){
        setStatus("Disconnected from "+host+". Trying again in 5 seconds...")
        // Try to reconnect in 5 seconds
        reconnectTimeout = setTimeout(function(){startWebsockets()}, reconnectImmediate?300:5000);
        reconnectImmediate = false;
      };
    }
  })
}

function setHostAndPlace(host,place){
  chrome.storage.local.set({host, place}, function() {
    if(!ws){
      startWebsockets();
    }
    else if(ws.readyState == ws.OPEN){
      reconnectImmediate = true;
      ws.close();
    }
    else if(ws.readyState == ws.CLOSED){
      clearTimeout(reconnectTimeout);
      startWebsockets();
    }
  });
}

function navigateToVideoIfChanged(videoLink){
  if((typeof videoLink=="string") && videoLink.indexOf("https://www.youtube.com/watch")!==0){
    // Remove non-youtube videos for safety
    videoEnded();
  }
  else{
    let target = (typeof videoLink=="string") ? videoLink : "http://"+host+READY_PATH;
    if(currentlyPlayingVideoLink != target){
      currentlyPlayingVideoLink = target;
      console.log("NAVIGATING TO "+target);
      chrome.tabs.update({
          url: target
      })
    }
  }
}

function videoEnded(){
  // Force the player to renavigate on next update
  currentlyPlayingVideoLink = "";
  // Remove the first video
  if(place&&ws.readyState == ws.OPEN){
    ws.send(JSON.stringify({
      remove:{
        index: 0,
        place
      }
    }))
  }
}

chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  // Listen for a video end event
  if (message.videoended) {
    videoEnded();
  }
  if (message.requestStatus) {
    sendStatusToPopup()
  }
  if (message.saveReload) {
    setHostAndPlace(
      message.saveReload.host,
      message.saveReload.place
    )
  }
});

startWebsockets();
