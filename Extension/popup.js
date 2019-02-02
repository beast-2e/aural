$status = document.getElementById("status");
$host = document.getElementById("host");
$place = document.getElementById("place");
$saveReload = document.getElementById("saveReload");

chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  console.log(message)
  if (message.status) {
    $status.innerText = message.status;
  }
});

chrome.storage.local.get(function(storage){
  $host.value = storage.host||"";
  $place.value = storage.place||"";
})

$saveReload.addEventListener("click",function(){
  chrome.runtime.sendMessage({
    saveReload:{
      host:$host.value,
      place:$place.value
    }
  });
})

chrome.runtime.sendMessage({requestStatus:true});