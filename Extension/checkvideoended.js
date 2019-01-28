function attachListener(){
  let videoElements = document.getElementsByTagName("video");
  if(videoElements.length>0){
    videoElements[0].addEventListener("ended",function(){
      // alert("end");
      chrome.runtime.sendMessage({data: "videoended"}, function(response) {
        // console.log(response.farewell);
      });
    })
  }
  else{
    // Couldn't find a video, maybe page isn't loaded?
    // Try again soon.
    setTimeout(attachListener, 500);
  }
}
attachListener();


