const PORT = process.env.PORT || parseInt(process.argv[2]) || 8080;

const express = require("express");
const WebSocket = require('ws');
const ytsr = require('ytsr');

// Set up static server to serve files in the directory
const app = express();
app.use(express.static("."));

// Create a server that connects express and ws
const server = require('http').createServer(app);
const wss = new WebSocket.Server({server});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

let playlists = {
  // Example
  // "Walcott Bathroom":[],
  // "Bemis Bathroom":[]
};

function getFirstYoutubeVideo(searchTerm){
  return new Promise(function(resolve,reject){
    ytsr(searchTerm, {limit:5}, function(err, result){
      // console.log(result)
      if(err||result.items.length==0){
        // Search error
        resolve()
      }
      else{
        let videoObject = result.items.filter((videoObject)=>{
          return videoObject.type=="video"
        })[0];
        if(videoObject){
          // We found it. Update everyone.
          resolve(videoObject)
        }
        else{
          // Couldn't find one, sorry
          resolve()
        }
      }
    })
  })
}

wss.on("connection", function(ws){
  ws.on("message", function(data){

    // Message can be one of three things

    // Client requests a youtube search term be played
    // {
    //   search:{
    //     term:"heyyayyayyayy",
    //     place:"Walcott Bathroom"
    //   }
    // }

    // Client removes a video at a particular index
    // {
    //   remove:{
    //     index:0,
    //     place:"Walcott Bathroom"
    //   }
    // }

    // Chrome extension requests a new location to be registered
    // {
    //   register:{
    //     place:"Walcott Bathroom"
    //   }
    // }

    // Websocket server emits in response:
    // {
    //   playlists:{
    //     "Walcott Bathroom":[...videos...]
    //   }
    // }

    // Videos come in the format

    /*

    {
      "type": "video",
      "title": "Deadpool 2: The Final Trailer",
      "link": "https://www.youtube.com/watch?v=20bpjtCbCz0",
      "thumbnail": "https://i.ytimg.com/vi/20bpjtCbCz0/hqdefault.jpg?sqp=-oaymwEXCPYBEIoBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLAzjL-f4TJj3qYV81vo2Cu-l3_9Ew",
      "author": {
        "name": "20th Century Fox",
        "ref": "https://www.youtube.com/user/FoxMovies",
        "verified": true
      },
      "description": "Be the first to see the second coming. Get #Deadpool2 tickets at http://www.Deadpool.com. After surviving a near fatal bovine ...",
      "views": 21814095,
      "duration": "2:24",
      "uploaded_at": "2 weeks ago"
    },

    */

    var message = JSON.parse(data);

    if(typeof message.search === "object"){
      console.log("SEARCH",message.search)
      if(!(typeof message.search.term === "string")||!(message.search.place in playlists)){ return; }

      getFirstYoutubeVideo(message.search.term).then(function(videoObject){
        if(videoObject){
          playlists[message.search.place].push(videoObject);
          // Update only what changed
          wss.broadcast(JSON.stringify({
            playlists:{
              [message.search.place]:playlists[message.search.place]
            }
          }));
        }
        else{
          ws.send(JSON.stringify({searcherror:true}))
        }
      })
    }

    if(typeof message.remove === "object"){
      console.log("REMOVE",message.remove)
      if(!(typeof message.remove.index === "number")||!(message.remove.place in playlists)){ return; }
      playlists[message.remove.place].splice(message.remove.index,1);

      // Update only what changed
      wss.broadcast(JSON.stringify({
        playlists:{
          [message.remove.place]:playlists[message.remove.place]
        }
      }));
    }

    if(typeof message.register === "object"){
      if(!(typeof message.register.place === "string")){ return; }

      // Add new location
      if(!(message.register.place in playlists)){
        playlists[message.register.place] = [];
      }

      // Update only what changed
      wss.broadcast(JSON.stringify({
        playlists:{
          [message.register.place]:playlists[message.register.place]
        }
      }));

    }
  });

  ws.send(JSON.stringify({
    playlists
  }));
})

server.listen(PORT, ()=>{
  console.log("Server has started on port",PORT);
})
