dojo.provide("webapp.myMediaViewer.getMediaListDetailsImageBase");
dojo.declare("webapp.myMediaViewer.getMediaListDetailsImageBase",
  [ICTouchAPI.webWidget,dojox.dtl._Templated],
  {
    objContent    : null,
    mediaItem     : null,
    handlerLoad   : null, // Load handler for every pics.
    handlerError  : null, //Error handler for every pics
    imageTimer    : "3",
    imageRecto    : true, //At one time, only one pic is displayed.
    state         : false, //Switch on or off the frame loop
    imageTimout   : null,


    showPlay : function() {
      this.state = true;
      this.handler();
    },

    showFirst : function(){
      this.state = false;
      this.handler();
    },

    showNext : function() {
      this.state = false;
      this.imageIdx += 1;
      this.handler();
    },

    showPrevious : function() {
      this.state = false;
      this.imageIdx -= 1;
      this.handler();
    },
    
    showStop : function() {
      this.state = false;

      if(this.imageTimout !== null){
        clearTimeout(this.imageTimout);
      }

      this.resetHandler();
    },

    handler : function() {
      var img = new Image();

      if(this.imageIdx >= this.imageMax) { this.imageIdx = 0;}
      if(this.imageIdx < 0) { this.imageIdx = this.imageMax-1;}

      try{
        img.src = this.mediaItem.mediaUrl[this.imageIdx];
      } catch(err) {
        console.error("webapp.myMediaViewer.getMediaListDetailsImageBase - handler():" + err.message);
      } 
      
      this.handlerLoad  = dojo.connect(img, "onload" ,this, this.onLoad);
      this.handlerError = dojo.connect(img, "onerror",this, this.onError);
    },
        
    //Reset Handler.
    resetHandler : function() {
      dojo.disconnect(this.handlerLoad);
      dojo.disconnect(this.handlerError);
      this.handlerError = null;
      this.handlerLoad = null;
    },

    onLoad : function(event) {
      var that = this;
      this.resetHandler();

      if(this.imageRecto) {
        this.domImg2.setAttribute("src", event.target.src);
        this.domImg1.className = "hide";
        this.domImg2.className = "show";
      } 
      else {
        this.domImg1.setAttribute("src", event.target.src);
        this.domImg1.className = "show";
        this.domImg2.className = "hide";
      }

      this.imageRecto = !this.imageRecto;

      if(this.imageTimout !== null){
        clearTimeout(this.imageTimout);
      }

      if(this.state) {
        this.imageIdx += 1;
        if(this.imageIdx >= this.imageMax) { this.imageIdx = 0;}

        if(this.imageTimout !== null){
          clearTimeout(this.imageTimout);
        }
        this.imageTimout = setTimeout(function() {that.showPlay();}, this.imageTimer * 1000);
      }
    },

    onError : function(){
      var that = this;
      this.resetHandler();

      if(this.imageTimout !== null){
        clearTimeout(this.imageTimout);
      }
      this.imageTimout = setTimeout(function() {that.showPlay();}, this.imageTimer * 1000);
    },

    postCreate:function(){
      var data = webapp.myMediaViewer.data;

      this.mediaItem = data.getCurrentMediaItem();
      this.imageIdx = 0;
      this.imageMax = this.mediaItem.mediaUrl.length;
      this.state = false;

      this.subscribeToEvents();
      this.showFirst();
    },
    
    subscribeToEvents : function(){
      this.unsubscribeToEvents();
      
      this.handlePlay = dojo.subscribe("myMediaViewerPlay", this, function(){
        this.showPlay();
      }, this);

      this.handleStop = dojo.subscribe("myMediaViewerStop", this, function(){
        this.showStop();
      });

      this.handleNext = dojo.subscribe("myMediaViewerNext", this, function(){
        this.showNext();
      });

      this.handlePrevious = dojo.subscribe("myMediaViewerPrevious", this,  function(){
        this.showPrevious();
      });
    },

    unsubscribeToEvents : function(){
      var that = this;
      dojo.unsubscribe(this.handlePlay);
      dojo.unsubscribe(this.handleStop);
      dojo.unsubscribe(this.handleNext);
      dojo.unsubscribe(this.handlePrevious);
    },


    destroy : function(){//do not use except if you want to carsh the target
      this.unsubscribeToEvents();

      if(this.imageTimout !== null){
        clearTimeout(this.imageTimout);
      }
      
      if(this.handlerLoad){
        dojo.disconnect(this.handlerLoad);
        this.handlerLoad = null;
      }
      if(this.handlerError){
        dojo.disconnect(this.handlerError);
        this.handlerError = null;
      }
    }
  }

);