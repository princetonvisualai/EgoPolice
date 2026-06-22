function initVideo() {
    video = videojs("vid", {
      plugins: {
        abLoopPlugin: {
          createButtons: false,
          loopIfBeforeStart: false,
          loopIfAfterEnd: false
        }
      }
    });
  
    $('video')[0].src = mp4_loc; 
  
    $('video')[0].addEventListener("loadedmetadata", function (e) {
      var video_width = this.videoWidth,
        video_height = this.videoHeight;
  
      $(".videobox")[0].style.setProperty('width', 'calc(80vw + 50px)');
      $(".videobox")[0].style.setProperty('height', `calc(${parseInt(80 * video_height / video_width)}vw + 50px)`);
      $(".videobox")[0].style.maxHeight = `${parseInt(900 * video_height / video_width)+50}px`;
  
      $('.videobox .video-js')[0].style.width = "calc(80vw)";
      $('.videobox .video-js')[0].style.height = `calc(${parseInt(80 * video_height / video_width)}vw)`;
      $('.videobox .video-js')[0].style.maxWidth = "900px";
      $('.videobox .video-js')[0].style.maxHeight = `${900 * video_height / video_width}px`;
    }, false);
  }
  initVideo();
  
  video.ready(function () {
    this.abLoopPlugin.setStart(start_time).setEnd(end_time + 1).playLoop();
  });
