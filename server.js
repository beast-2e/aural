const PORT = 8080;

const express = require("express");
const WebSocket = require('ws');
const ytsr = require('ytsr');
const loudness = require('loudness');

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


let videoList = [];
let volume = 50;
function updateVolume(){
  console.log("VOLUME SET TO", volume);
  loudness.setVolume(volume); // THIS MAY OR MAY NOT WORK
}

wss.on("connection", function(ws){
  ws.on("message", function(data){

    // Message can be one of two things
    // {
    //   type:"search",
    //   data:"Cat Videos"
    // }


    // {
    //   type:"listupdate",
    //   data: [ new video list... ]
    // }

    // where data includes videos of the form

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

    if(message.search){
      console.log("Received search term ",message.search)
      ytsr(message.search, {limit:5}, function(err, result){
        // console.log(result)
        if(err||result.items.length==0){
          // Search error
          ws.send(JSON.stringify({
            searcherror:true
          }))
        }
        else{
          let videoObject = result.items.filter((videoObject)=>{
            return videoObject.type=="video"
          })[0];
          if(videoObject){
            // We found it. Update everyone.
            videoList.push(videoObject);
            wss.broadcast(JSON.stringify({
              listupdate:videoList
            }));
            console.log("Updated list with",videoList.length,"items")
          }
          else{
            // Couldn't find one, sorry
            ws.send(JSON.stringify({
              searcherror:true
            }))
          }
        }
      })

    }
    else if(message.volume!==undefined){
      console.log("Received volume request for", message.volume)
      volume = Math.min(Math.max((+message.volume|0)||0,0),100);
      updateVolume();
      wss.broadcast(JSON.stringify({
        volume:volume
      }));
    }
    else if(message.listupdate){
      console.log("Received list update")
      // Make sure all videos have a youtube watch link
      videoList = Array.from(message.listupdate||[]);
      wss.broadcast(JSON.stringify({
        listupdate:videoList
      }));
      console.log("Updated list with",videoList.length,"items")
    }

  });
  ws.send(JSON.stringify({
    listupdate:videoList,
    volume:volume
  }));
})

server.listen(PORT, ()=>{
  console.log("Server has started on port",PORT);
})