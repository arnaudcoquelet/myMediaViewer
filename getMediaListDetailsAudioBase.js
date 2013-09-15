dojo.provide("webapp.myMediaViewer.getMediaListDetailsAudioBase");
dojo.declare("webapp.myMediaViewer.getMediaListDetailsAudioBase",
  [ICTouchAPI.webWidget,dojox.dtl._Templated],
  {
    objContent    : null,
    mediaItem     : null,
    player        : null,
    handlePlay    : null,
    handleStop    : null,
    handleNext    : null,
    handlePrevious: null,
    handleMPLoading     : null,
    handleMPStopped     : null,
    handleMPPlaying     : null,
    handleMPBuffering   : null,
    handleMPPaused      : null,
    handleMPError       : null,
    handleMPFinished    : null,
    handleMPState       : null,
    handleMediaSessionInfos: null,


    showPlay : function() {
      this.playAudio();
    },

    showNext : function() {
      this.audioIdx += 1;
      this.playAudio();
    },

    showPrevious : function() {
      this.audioIdx -= 1;
      this.playAudio();
    },
    
    showStop : function() {
      this.stopAudio();
    },

        
    //SetAudio
    createAudio : function() {
      this.player = new UIElements.Media.Audio(
      {
           boolCanPause                : false,
           boolSeekable                : false,
           strMediaPath                : this.mediaItem.mediaUrl[this.audioIdx],
           clbkPlay                    : function(){},
           clbkPause                   : function(){},
           boolShowSliderButton        : true,
           boolIconOnSliderButton      : false,
      }, this.domAudio);

    },

    playAudio : function() {
      var data = webapp.myMediaViewer.data;

      this.player.setToTime(0);
      //this.player.mediaPlay();

      var index = this.audioIdx + 1;
      var url = this.mediaItem.mediaUrl[this.audioIdx];

      ICTouchAPI.APIServices.IctMPInterface.playMedia({params: {idFile :index, filePath : url}, context: this });
      ICTouchAPI.APIServices.IctMPInterface.getMediaSessionInfos({context:this, callback: function(args){this.notifyMediaSessionInfosReceived(args);} });
    },

    stopAudio : function() {
      var data = webapp.myMediaViewer.data;
      var index = this.audioIdx + 1;

      this.player.mediaPause();
      ICTouchAPI.APIServices.IctMPInterface.playPauseMP({params: {idFile: index}, context: this });
    },

    postCreate:function(){
      var data = webapp.myMediaViewer.data;

      this.mediaItem = data.getCurrentMediaItem();
      this.audioIdx = 0;
      this.AudioMax = this.mediaItem.mediaUrl.length;

      this.createAudio();
      this.subscribeToEvents();
    },
    
    notifyPlayerError : function(objEvent) {
       var data = webapp.myMediaViewer.data;
       console.error("webapp.myMediaViewer.getMediaListDetailsAudioBase - notifyPlayerError()");
    },

    subscribeToEvents : function(){
      this.unsubscribeToEvents();

      this.handleMPLoading         = dojo.subscribe("myMediaViewer/Loading",   this, function(){ this.notifyPlayerLoading();             }, this);
      this.handleMPStopped         = dojo.subscribe("myMediaViewer/Stopped",   this, function(){ this.notifyPlayerStopped();             }, this);
      this.handleMPPlaying         = dojo.subscribe("myMediaViewer/Playing",   this, function(){ this.notifyPlayerPlaying();             }, this);
      this.handleMPBuffering       = dojo.subscribe("myMediaViewer/Buffering", this, function(){ this.notifyPlayerBuffering();           }, this);
      this.handleMPPaused          = dojo.subscribe("myMediaViewer/Paused",    this, function(){ this.notifyPlayerPaused();              }, this);
      this.handleMPError           = dojo.subscribe("myMediaViewer/Error",     this, function(){ this.notifyPlayerError();               }, this);
      this.handleMPFinished        = dojo.subscribe("myMediaViewer/Finished",  this, function(){ this.notifyPlayerFinished();            }, this);
      this.handleMPState           = dojo.subscribe("myMediaViewer/State",     this, function(){ this.notifyPlayerState();               }, this);
      this.handleMediaSessionInfos = dojo.subscribe("myMediaViewer/Finished",  this, function(){ this.notifyMediaSessionInfosReceived(); }, this);
      
      this.handlePlay     = dojo.subscribe("myMediaViewerPlay",     this, function(){this.showPlay();},     this);
      this.handleStop     = dojo.subscribe("myMediaViewerStop",     this, function(){this.showStop();},     this);
      this.handleNext     = dojo.subscribe("myMediaViewerNext",     this, function(){this.showNext();},     this);
      this.handlePrevious = dojo.subscribe("myMediaViewerPrevious", this, function(){this.showPrevious();}, this);
    },

    unsubscribeToEvents : function(){
      var that = this;
      dojo.unsubscribe(this.handlePlay);
      dojo.unsubscribe(this.handleStop);
      dojo.unsubscribe(this.handleNext);
      dojo.unsubscribe(this.handlePrevious);

      dojo.unsubscribe(this.handleMPLoading);
      dojo.unsubscribe(this.handleMPStopped);
      dojo.unsubscribe(this.handleMPPlaying);
      dojo.unsubscribe(this.handleMPBuffering);
      dojo.unsubscribe(this.handleMPPaused);
      dojo.unsubscribe(this.handleMPError);
      dojo.unsubscribe(this.handleMPFinished);
      dojo.unsubscribe(this.handleMPState);
      dojo.unsubscribe(this.handleMediaSessionInfos);
    },

//***************************************************************************************//
//MULTIMEDIA Events
//***************************************************************************************//
  notifyPlayerLoading : function(objEvent) {

  },

  notifyPlayerStopped : function(objEvent) {

  },

  notifyPlayerPlaying : function(objEvent, objEvent2) {
    if(objEvent && objEvent.value && (objEvent.value==-100 || objEvent.value==-200)) {
      return ;
    }

    if(this.player!=null) {
        var max = intDuration>250 ? intDuration-250 : 1;
        this.player.setMediaDuration(max);
        this.player.mediaPlay();
    }
  },

  notifyPlayerBuffering : function(objEvent) {

  },

  notifyPlayerPaused : function(objEvent, objEvent2) {
    var intTime = 0;
    if(objEvent2 && objEvent2.value){
      intTime = objEvent2.value;
    }

    if(this.player!=null) {
      this.player.setToTime(intTime/1000);
      this.player.mediaPause();
    }
  },

  notifyPlayerError : function(objEvent, objEvent2, objEvent3) {
    ICTouchAPI.popupServices.errorPopup(_("Error", "ICTouchAPI"), _("Could not load media", "webapp.myMediaViewer"), _("Ok", "ICTouchAPI"), 666); // id ?
  },

  notifyPlayerFinished : function(objEvent) {
    //Unselect played file in file list
    if(objEvent!=null) {
        if(objEvent.value && (objEvent.value==-100 || objEvent.value==-200)) {

          return ;
        }
    }
  },

  notifyPlayerState : function(intDevice, boolDistant, intIndex, intState, intTotalTime, doubleVolume) {
    if(intState.value===2) {

    }
    else {

    }

    if(this.player) {
      var max = intTotalTime.value>250 ? intTotalTime.value-250 : 1;
      this.player.setMediaDuration(max);
      this.player.setToTime((intIndex.value)/1000);
      if(intState.value===2) {
        this.player.mediaPlay();
      }
      else {
        this.player.mediaPause();
      }
    }
  },

  notifyMediaSessionInfosReceived : function(args) {
    if(this.player) {
          var max = args.totalTime>250 ? args.totalTime-250 : 1;
          this.player.setMediaDuration(max);
          this.player.setToTime((args.currentIndex)/1000);
          if(args.sessionState===2) {
            this.player.mediaPlay();
          }
          else {
            this.player.mediaPause();
          }
    }
  },

    destroy : function(){//do not use except if you want to carsh the target     
      this.unsubscribeToEvents();
    },
  }

);