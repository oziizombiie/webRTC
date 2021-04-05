/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var session;
var subscriber;
var publisher;

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

function removeExtraVideos(){
  let videoSubscribers = document.getElementsByClassName('OT_subscriber');
  console.log(videoSubscribers.length);
  if(videoSubscribers.length > 1){
    let sus = document.getElementById('subscriber');
    console.log(videoSubscribers);
    let r = videoSubscribers[0];
    console.log(r);
    sus.appendChild(r);
  }
}

function initializeSession() {
  session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function streamCreated(event) {
    var subscriberOptions = {
      width: '100%',
      height: '100%',
      showControls: false
    };
    
    subscriber =  session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });

  session.on('sessionDisconnected', function sessionDisconnected(event) {
    console.log('You were disconnected from the session.', event.reason);
  });

  session.on("signal:handRaised", function(event) {
    if(event.data.personHand != session.connection.connectionId){
      alert(`${event.from.id} wants to speak`);
    }
    console.log("foo signal sent from connection " + event.from.id);
    console.log("Signal data: " + event.data.personHand);
  });
  


  // initialize the publisher
  var publisherOptions = {
    width: '300px',
    fitMode: 'cover',
    showControls: false
  };
  publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, handleError);
    }
  });
}



let btn_exit = document.getElementById('exit');
let btn_video = document.getElementById('camera');
let btn_hand = document.getElementById('hand');
let btn_audio = document.getElementById('audio');
// let btn_remove = document.getElementById('removeUser');
var video_blocked = false;
var audio_blocked = false;

// btn_remove.addEventListener('click', function(){
//   btn_remove.style.display = 'none';
//   subscriber.destroy();
// })

btn_hand.addEventListener('click', function(){
    session.signal({
      type: "handRaised",
      data: {personHand: session.connection.connectionId}
    },
    function(error) {
      if (error) {
        console.log("signal error: " + error.message);
      } else {
        console.log("signal sent");
      }
    }
  );
})


btn_video.addEventListener('click', function(){
  camera();
});

btn_audio.addEventListener('click', function(){
  audio();
});

function audio(){
  publisher.publishAudio(audio_blocked);
  audio_blocked ? ( btn_audio.classList.remove('start') , btn_audio.classList.add('stop') ) : ( btn_audio.classList.add('start') , btn_audio.classList.remove('stop') )  ;
  audio_blocked = !audio_blocked;
}

function camera(){
  publisher.publishVideo(video_blocked);
  video_blocked ? ( btn_video.classList.remove('start') , btn_video.classList.add('stop') ) : ( btn_video.classList.add('start') , btn_video.classList.remove('stop') )  ;
  video_blocked = !video_blocked;
}

btn_exit.addEventListener('click', function() {
    session.disconnect();
    btn_exit.classList.remove('logout');
    btn_exit.classList.add('login');
    if(session.currentState == 'disconnected'){
      btn_exit.classList.remove('login');
      btn_exit.classList.add('logout');
      initializeSession();
    }
});


// See the config.js file.
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + '/session').then(function fetch(res) {
    return res.json();
  }).then(function fetchJson(json) {
    apiKey = json.apiKey;
    sessionId = json.sessionId;
    token = json.token;

    initializeSession();
  }).catch(function catchErr(error) {
    handleError(error);
    alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  });
}
