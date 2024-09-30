import { useEffect } from "react";
import "./App.css";
import * as MKPlayerSDK from "@mediakind/mkplayer";
import { useRef } from "react";
import "./App.css";
function App() {
  let vContainerRef = useRef(null);
  let playerRef = useRef(null);
  var playerConfig = {
    key: "<APP_KEY>",
    appId: "<APP_ID>",
    ui: true,
    playback: {
      muted: false,
      autoplay: true,
      playsInline: true,
      subtitleLanguage: ["en"],
      isForcedSubtitle: true,
      preferredTech : [{
        player: 'html5',
        streaming: 'dash'
    }, {
        player: 'native',
        streaming: 'hls'
    }]
    },
    events: {
      [MKPlayerSDK.MKPlayerEvent.Error]: (e) => {
        // console.log("Encountered player error: ", JSON.stringify(e));
      },
      [MKPlayerSDK.MKPlayerEvent.SubtitleAdded]: (e) => {
        // console.log("Encountered player subtitle: ", JSON.stringify(e));
      },
      [MKPlayerSDK.MKPlayerEvent.SourceLoaded]: ()=>{
        let div = document.getElementsByClassName(
          "bmpui-label-metadata-title"
        );
        const btn = document.createElement("img");
        btn.setAttribute('src','https://cdn3.iconfinder.com/data/icons/feather-5/24/arrow-left-512.png')
        btn.classList.add("back-icon")
        btn.setAttribute('onclick', 'console.log("backpressed")')
        for (let i=0; i < div.length; i++) {
          if (div[i]?.parentNode){
            div[i]?.parentNode?.insertBefore(btn, div[i]);
          }
        }
        let fullscreenbtns = document.getElementsByClassName('bmpui-ui-fullscreentogglebutton')
        for (let i=0; i < fullscreenbtns.length; i++) {
          fullscreenbtns[i].remove()
        }
      }
    },
    enableSubtitleOverlay: true,
    // log: { level: MKPlayerSDK.MKLogLevel.Debug },
    mode: "inline",
  };

  const sourceConfig = {
    title: "Title for your source",
    description: "Brief description of your source",
    hls: "<HLS Manifest LINK>",
    dash: "<DASH Manifest LINK>",
    drm: {
      widevine: {
        LA_URL: "<WIDEVINE-LICENSE>",
        headers: { Authorization: "<TOKEN>"},
    },
    fairplay: {
        LA_URL: "<FAIRPLAY-LICENSE>",
        certificateURL: "<CERT_URL>",
        headers: { Authorization: "<TOKEN>" },
      },
    },
    subtitleTracks: [
      {
        enabled: true, // Enable subtitle when video plays
        // forced: true, // Enforce the track to show and will override user setting
        id: 1, // Just an ID value, should be unique
        kind: "subtitle", // either "caption" or "subtitle"
        label: "English (cc)", // the subtitle name being shown in Settings
        lang: "en",
        url: "<VTT LINK>", // external subtitle URL
      },
    ],
  };
  const testEME = () =>{
    // https://shaka-player-demo.appspot.com/support.html
    var keySysConfig = [{
      "initDataTypes": ["cenc"]
        //,"persistentState": "required"  // don't use or MacSafari "not supported"
        //,"persistentState": "required", "distinctiveIdentifier": "required"
        //,"audioCapabilities": [{
        //  "contentType": "audio/mp4;codecs=\"mp4a.40.2\""
        //}]
        ,"videoCapabilities": [{
      "contentType": "video/mp4;codecs=\"avc1.4D401E\"" // avc1.42E01E = ConstrainedLevel3, 4D401E=MainLevel3
      //,"robustness": "3000"
        }]
    }];
  
    var keySystems = {
      playready: ['com.microsoft.playready.recommendation', 'com.microsoft.playready'
        , 'com.microsoft.playready.hardware', 'com.youtube.playready'],
      clearkey: ['webkit-org.w3.clearkey', 'org.w3.clearkey'],
      widevine: ['com.widevine.alpha'],
      primetime: ['com.adobe.primetime', 'com.adobe.access'],
      fairplay: ['com.apple.fairplay','com.apple.fps'
        , 'com.apple.fps.1_0', 'com.apple.fps.2_0', 'com.apple.fps.3_0']
    };
  
    for(let keyArr in keySystems) {
      for(let forItemIdx in keySystems[keyArr]) {
        let keySys = keySystems[keyArr][forItemIdx];
        try {
           navigator.requestMediaKeySystemAccess(keySys, keySysConfig).
           then(function(mediaKeySystemAccess) {
           //let mkConfig = mediaKeySystemAccess.getConfiguration();
           //let sFlags = "persistentState="+mkConfig.persistentState 
           //  + ", distinctiveIdentifier="+mkConfig.distinctiveIdentifier; 
          console.log(keySys + " supported"); //+" ("+sFlags+")");
        }).catch(function(ex) {
           console.log(keySys+" not supported (" + ex.name+" "+ex.message+")." );
        });
        } catch (ex) {
          console.log(keySys+" not supported (" + ex.name+" "+ex.message+").." );
        }
      }
    }
  }
  useEffect(() => {
    load();
    // testEME()
    });

  const load = async () => {
    if (MKPlayerSDK) {
      if (playerRef) {
        await playerRef?.unload?.();
        playerRef = null;
      }

      playerRef = new MKPlayerSDK.MKPlayer(vContainerRef.current, playerConfig);
      playerRef?.load(sourceConfig).then(() => {
        if (!playerConfig.playback.autoplay) {
          playerRef?.play(); // to start playback when autoplay is disabled
          playerRef.current.currentTime = Math.max(0, 50);
          // you can also start playback from sourceloaded event handler!
        }
      });
      playerRef.isPlaying();
    } else {
      console.log("::: MKPlayer SDK not initiated yet :::");
    }
  };
  return (
    <div className="container">
      <div
        ref={vContainerRef}
        className="video-container"
        id="video-container"
      ></div>
    </div>
  );
}
export default App;

