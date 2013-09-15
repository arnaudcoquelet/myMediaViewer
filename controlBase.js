dojo.provide("webapp.myMediaViewer.controlBase");
dojo.declare("webapp.myMediaViewer.controlBase",[ICTouchAPI.webApplication],{
  mediaListThirdControl      : null,
  mediaListContainer         : null,
  mediaListMenu              : null,


	constructor:function(){
		//called during phone initialization, refer to the constraints and limitations guide for more information about what can be done in the constructor
		ICTouchAPI.tools.registerHomepageButton(["webapp.myMediaViewer.getMediaList","MYMEDIAVIEWER_BTN","myMediaViewer-application",_("myMedias","webapp.myMediaViewer")]);
		ICTouchAPI.tools.registerHomepageKey(["webapp.myMediaViewer.getMediaList","MYMEDIAVIEWER_BTN","myMediaViewer-application",_("myMedias","webapp.myMediaViewer")]);

    ICTouchAPI.eventServices.subscribeToEvent(this, "MPLoading", this.notifyPlayerLoading);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MPStopped", this.notifyPlayerStopped);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MPPlaying", this.notifyPlayerPlaying);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MPBuffering", this.notifyPlayerBuffering);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MPPaused", this.notifyPlayerPaused);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MPError", this.notifyPlayerError);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MPFinished", this.notifyPlayerFinished);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MPState", this.notifyPlayerState);
    ICTouchAPI.eventServices.subscribeToEvent(this, "MediaSessionInfos", this.notifyMediaSessionInfosReceived);
	},

	loaded: function(){
		//executed after controler and data constructors, refer to constraints and limitations guide for more information about what can be done in this method
	},

	load: function(){
    this.updateActionBar(null);

    //Load the settings and Medias
    this.refreshMyMedias();
	},

	buttonCallback:function(buttonId){
		var data=webapp.myMediaViewer.data;
		switch(buttonId){
			case data.BACK:
        dojo.publish("OpenHomepage");
        break;
      default:
        break;
	}},

	unload:function(){
		//called when the webapp is unloaded, unsubscrive to events here
	},

	unlock:function(WebappName){
		//executed whenever the webapp is exiting

		//do not remove this line has it could potentially block the phone
		dojo.publish("unlockTransition",[true]);
	},



//***************************************************************************************//
//MEDIA TYPE LIST
//***************************************************************************************//
  getMyMediaTypes : function ()
  {
    console.warn("getMyMediaTypes()");

    if(this.data)
    {
      if(this.data.myMediaViewerUrl){
        var url = this.data.myMediaViewerUrl + "API/medias/types"; // + this.data.mySpeedDialUser ;

        this.httpRequest({
          url: url,
          method:"get",
          responseType:"text",
          timeout : 5000,
          callback: this.gotMyMediaTypes,
          callbackError : this.errorOnHttpRequest,
          context:this
        });
      }
      else
      {
        this.updateAllSettings();

        //If not connected to the HTTP server, load what is in memory
        if(this.data.myMediaViewerList) {
          this.data._arrSpeedDials = this.data.myMediaViewerList;
          this.data.loadList();
        }
      }
    }

    //Plan for Refresh (each 5min by default)
    this.setRefreshMyMediaTypes();
  },

  gotMyMediaTypes : function(xmlStream, callBackParams)
  {
    var mediaTypes = dojo.fromJson(xmlStream);
    
    //Get the list of SpeedDials
    this.data._arrMediaTypes = mediaTypes;

    //Save to settings
    this.data.myMediaTypesList = this.data._arrMediaTypes;
    this.setMyMediaTypesList(this.data.myMediaTypesList);

    this.data.loadList();
	},

  refreshMyMediaTypes : function ()
  {
    //Load the settings
    this.updateAllSettings();

    //Refresh the MediaList
    this.getMyMediaTypes();
  },

  setRefreshMyMediaTypes: function()
  {
    //Setup a refresh every X minutes (5 by default)
    var t=this;

    if(this.data)
    {
      if(this.data._getMyMediasViewerTimeout !== null){
        clearTimeout(this.data._getMyMediasViewerTimeout);
      }
      this.data._getMyMediasListTimeout = setTimeout(function () {t.refreshMyMediaTypes();} , (t.data.myMediaViewerRefreshTimer * 1000) || (t.data._defaultRefeshTimer)) ;
    }
    else
    {
      setTimeout(function () {t.refreshMyMediaTypes();} , (t.data.myMediaViewerRefreshTimer * 1000) || (t.data._defaultRefeshTimer));
    }
  },


//***************************************************************************************//
//MEDIA LIST
//***************************************************************************************//
  getMyMedias : function ()
  {
    console.warn("getmyMedias()");

    if(this.data)
    {
      if(this.data.myMediaViewerUrl){
        var url = this.data.myMediaViewerUrl + "API/medias"; // + this.data.mySpeedDialUser ;

        this.httpRequest({
          url: url,
          method:"get",
          responseType:"text",
          timeout : 5000,
          callback: this.gotMyMedias,
          callbackError : this.errorOnHttpRequest,
          context:this
        });
      }
      else
      {
        this.updateAllSettings();
      }
    }

    //Plan for Refresh (each 5min by default)
    this.setRefreshMyMedias();
  },


  gotMyMedias : function(xmlStream, callBackParams)
  {
    var medias = dojo.fromJson(xmlStream);

    if(this.data) {
      if( this.compareObjects(this.data._arrMedias, medias) ) {

      }
      else {
        this.updateActionBar(null);

        //Get the list of Medias
        this.data._arrMedias = medias;

        //Save to settings
        this.data.myMediaViewerList = this.data._arrMedias;
        this.setMyMediaViewerList(this.data.myMediaViewerList);

        this.data.loadList();

        this.data.clearMediaDetails();
      }
    }

  },

  refreshMyMedias : function ()
  {
    //Load the settings
    this.updateAllSettings();

    //Refresh the Medias
    this.getMyMedias();
  },

  setRefreshMyMedias: function()
  {
    //Setup a refresh every X minutes (5 by default)
    var t=this;

    if(this.data)
    {
      if(this.data._getMyMediasViewerTimeout !== null){
        clearTimeout(this.data._getMyMediasViewerTimeout);
      }
      this.data._getMyMediasViewerTimeout = setTimeout(function () {t.refreshMyMedias();} , (t.data.myMediaViewerRefreshTimer * 1000) || (t.data._defaultRefeshTimer)) ;
    }
    else
    {
      setTimeout(function () {t.refreshMyMedias();} , (t.data.myMediaViewerRefreshTimer * 1000) || (t.data._defaultRefeshTimer));
    }
  },

  compareObjects: function(o1, o2) {
     var k1 = Object.keys(o1).sort();
     var k2 = Object.keys(o2).sort();
     if (k1.length != k2.length) return false;
     return k1.zip(k2, function(keyPair) {
       if(typeof o1[keyPair[0]] == "object" && typeof o2[keyPair[1]] == "object"){
         return compareObjects(o1[keyPair[0]], o2[keyPair[1]])
       } else {
         return o1[keyPair[0]] == o2[keyPair[1]];
       }
     }).all();
   },

  compareMessageList: function(a, b) {
    var test = 0;

      if (a && b)
      {
        if( ("length" in a) && ("length" in b))
        {
          if(a.length == b.length)
          {
            for(var i=0; i<a.length; i++)
            {
              if( ("Message" in a[i]) && ("Message" in b[i]))
              {
                if(a[i].Message == b[i].Message)
                {
                  test = 1;
                }
                else
                {
                  return 0;
                }
              }
              else
              { 
                return 0;
              }
            }
          }
        }
      }

      return test;
  },






  //***************************************************************************************//
  //Callbacks
  //***************************************************************************************//
  onChoiceClicked : function(intIndex) {
    this.data.intChoiceListSelected = intIndex;
  },
  
  onMenuCollapse : function() {
    this.data.clearMediaDetails();
    webapp.myMediaViewer.refreshMediaDetails(0);
  },

  //defining the callback function called when the menulist is clicked
  onMenuClick : function(value) {
    webapp.myMediaViewer.data.setCurrentMediaItem(value);
    webapp.myMediaViewer.data.loadMediaDetails(value);
    webapp.myMediaViewer.refreshMediaDetails(value);
  },


  previewMenuClicked : function(intIndex)
  {
    this.data.indexPreview = intIndex;
    // the element can be selected only if the view is loaded
    if(!this.previewMenuClickHandler){
      this.previewMenuClickHandler = dojo.subscribe("iframe.show", dojo.hitch(this, this.selectCurrentFromPreviewMenu));
    }
  },

  selectCurrentFromPreviewMenu:function(currentIframeId)
  {
    // test if it’s the good frame
    if(currentIframeId == "webapp.myMediaViewer.getMediaViewList"){
    // select the item
      this.menuList.selectItemByIndex(this.data.indexPreview, true);
    }
  },


//***************************************************************************************//
//Main View buttons
//***************************************************************************************//
  updateActionBar : function(mediaType)
  {
    this.createMainViewButtons();
    this.hideAllMainViewButtons();

    switch(mediaType)
    {
      case 'VIDEO':
        this.showMainViewVideoButtons();
        break;
      case 'AUDIO':
        this.showMainViewAudioButtons();
        break;
      case 'IMAGE':
        this.showMainViewImageButtons();
        break;
      case 'SLIDE':
        this.showMainViewSlideButtons();
        break;
      default:
        this.showMainViewRefreshButtons();
        break;
    }

    this.data.actionBarState = mediaType;
  },

  createMainViewButtons : function ()
  {
    var arrButtons = [];

    arrButtons.push({
      strButtonName: this.data.PLAY_AUDIO, // name of the button
      strButtonLabel: _("Play Audio", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-play', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPlayAudio}
    });

    arrButtons.push({
      strButtonName: this.data.PAUSE_AUDIO, // name of the button
      strButtonLabel: _("Pause Audio", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-pause', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPauseAudio}
    });

    arrButtons.push({
      strButtonName: this.data.PLAY_VIDEO, // name of the button
      strButtonLabel: _("Play Video", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-play', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPlayVideo}
    });

    arrButtons.push({
      strButtonName: this.data.PAUSE_VIDEO, // name of the button
      strButtonLabel: _("Pause Video", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-pause', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPauseVideo}
    });

    arrButtons.push({
      strButtonName: this.data.PREV_SLIDE, // name of the button
      strButtonLabel: _("Previous Slide", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-prev', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPreviousSlide}
    });

    arrButtons.push({
      strButtonName: this.data.PLAY_SLIDE, // name of the button
      strButtonLabel: _("Play Slide", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-play', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPlaySlide}
    });

    arrButtons.push({
      strButtonName: this.data.PAUSE_SLIDE, // name of the button
      strButtonLabel: _("Pause Slide", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-pause', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPauseSlide}
    });

    arrButtons.push({
      strButtonName: this.data.NEXT_SLIDE, // name of the button
      strButtonLabel: _("Next Slide", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-next', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaNextSlide}
    });

    arrButtons.push({
      strButtonName: this.data.PLAY_IMAGE, // name of the button
      strButtonLabel: _("Play Image", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-play', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaPlayImage}
    });

        arrButtons.push({
      strButtonName: this.data.REFRESH, // name of the button
      strButtonLabel: _("Refresh", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-refresh', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMyMediaViewerRefresh}
    });

    // Add buttons to appbar
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList");
    appBar.removeAllActionButtons();

    for (var i in arrButtons) {
      var objButton = new UIElements.AppButton.AppButtonControl(arrButtons[i]);
      appBar.addActionButton(objButton);
    }
  },


  hideAllMainViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.REFRESH).hide();
      appBar.getButton(this.data.PLAY_VIDEO).hide();
      appBar.getButton(this.data.PAUSE_VIDEO).hide();
      appBar.getButton(this.data.PLAY_AUDIO).hide();
      appBar.getButton(this.data.PAUSE_AUDIO).hide();
      appBar.getButton(this.data.PLAY_SLIDE).hide();
      appBar.getButton(this.data.PAUSE_SLIDE).hide();
      appBar.getButton(this.data.NEXT_SLIDE).hide();
      appBar.getButton(this.data.PREV_SLIDE).hide();
      appBar.getButton(this.data.PLAY_IMAGE).hide();
    }
  },

  showMainViewRefreshButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.REFRESH).show();
    }
  },

  showAllMainViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.REFRESH).show();
      appBar.getButton(this.data.PLAY_VIDEO).show();
      appBar.getButton(this.data.PAUSE_VIDEO).show();
      appBar.getButton(this.data.PLAY_AUDIO).show();
      appBar.getButton(this.data.PAUSE_AUDIO).show();
      appBar.getButton(this.data.PLAY_SLIDE).show();
      appBar.getButton(this.data.PAUSE_SLIDE).show();
      appBar.getButton(this.data.NEXT_SLIDE).show();
      appBar.getButton(this.data.PREV_SLIDE).show();
      appBar.getButton(this.data.PLAY_IMAGE).show();
    }
  },

  showMainViewVideoButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.REFRESH).show();
      appBar.getButton(this.data.PLAY_VIDEO).show();
      appBar.getButton(this.data.PAUSE_VIDEO).show();
    }
  },

  showMainViewAudioButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.REFRESH).show();
      appBar.getButton(this.data.PLAY_AUDIO).show();
      appBar.getButton(this.data.PAUSE_AUDIO).show();
    }
  },

  showMainViewSlideButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.REFRESH).show();
      appBar.getButton(this.data.PLAY_SLIDE).show();
      appBar.getButton(this.data.PAUSE_SLIDE).show();
      appBar.getButton(this.data.NEXT_SLIDE).show();
      appBar.getButton(this.data.PREV_SLIDE).show();
    }
  },

  showMainViewImageButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getMediaList" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.REFRESH).show();
      appBar.getButton(this.data.PLAY_IMAGE).show();
    }
  },



  refreshMenu : function ()
  {
    if(webapp.myMediaViewer.mediaListMenu !== null)
      {
        webapp.myMediaViewer.mediaListMenu.refresh({autoCollapse : true});
      }
  },

  refreshMediaDetails : function(intIndex)
  { //Reload 2/3 Part with the corresponding informations
    if(webapp.myMediaViewer.mediaListContainer !== null) 
    {
        webapp.myMediaViewer.mediaListContainer.refresh();
    }
    if(this.data) {
        var obj = this.data._arrEntries[intIndex];
        this.updateActionBar(obj.mediaType);
    }
  },

//ACTIONS
  actionMyMediaViewerRefresh: function ()
  {
    //Reload the Settings
    this.updateAllSettings();

    //Refresh the SpeedDials
    this.getMyMedias();

    /*
    if(this.data)
    {
      this.data.loadList();
      //
      this.data.clearMediaDetails();
    }*/
  },

  actionMyMediaPlayAudio : function(){
    dojo.publish("myMediaViewerPlay",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPlayAudio()");
  },

  actionMyMediaPauseAudio : function(){
    dojo.publish("myMediaViewerStop",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPauseAudio()");
  },

  actionMyMediaPlayVideo : function(){
    dojo.publish("myMediaViewerPlay",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPlayVideo()");
  },
  
  actionMyMediaPauseVideo : function(){
    dojo.publish("myMediaViewerStop",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPauseVideo()");
  },

  actionMyMediaPreviousSlide : function(){
    dojo.publish("myMediaViewerPrevious",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPreviousSlide()");
  },

  actionMyMediaPlaySlide : function(){
    dojo.publish("myMediaViewerPlay",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPlaySlide()");
  },

  actionMyMediaPauseSlide : function(){
    dojo.publish("myMediaViewerStop",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPauseSlide()");
  },

  actionMyMediaNextSlide : function(){
    dojo.publish("myMediaViewerNext",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaNextSlide()");
  },

  actionMyMediaPlayImage : function(){
    dojo.publish("myMediaViewerPlay",[]);
    ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMyMediaPlayImage()");
  },

//***************************************************************************************//
//Group View buttons
//***************************************************************************************//
  createGroupViewButtons : function ()
  {
    var arrButtons = [];
    arrButtons.push({
      strButtonName: this.data.PLAY, // name of the button
      strButtonLabel: _("Play", "webapp.myMediaViewer"), // label of the button
      strButtonIcon: 'myMediaViewer-play', // icon of the button
      strStatusText:'',
      strStatusIcon:'',
      callback: {context:this, func:this.actionMediaPlay}
    });

    // Add buttons to appbar
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getGroupView");
    appBar.removeAllActionButtons();

    for (var i in arrButtons) {
      var objButton = new UIElements.AppButton.AppButtonControl(arrButtons[i]);
      appBar.addActionButton(objButton);
    }
  },

  hideAllGroupViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getGroupView" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.PLAY).hide();
    }
  },

  showAllGroupViewButtons : function ()
  {
    var appBar = ICTouchAPI.AppBarServices.getAppBar("myMediaViewer", "getGroupView" );
    if(appBar.getAllButtons().length)
    {
      appBar.getButton(this.data.PLAY).show();
    }
  },

  actionMediaPlay: function (url)
  {
    if(url)
    {
      //Generate a call
      ICTouchAPI.debugServices.info("webapp.myMediaViewer.actionMediaPlay() - url:" + url);
    }
  },



//***************************************************************************************//
//HTTPRequest
//***************************************************************************************//
  httpRequest: function(args) {
      //Using the API
      ICTouchAPI.HttpServices.httpRequest(args);


      //Not using the API
      //if (args.method == "get") {
      //  return dojo.xhrGet(args);
      //} else if (args.method == "post") {
      //  return dojo.xhrPost(args);
      //} else {
      //  return false;
      //}
  },
  
  errorOnHttpRequest : function(error){
/*    var context = this;
    var buttons = [];
    // Create OK button to display in the popup
    buttons.push({
      strButtonLabel: _("Close","webapp.mySpeedDial"),
      callback: function () {
        // When click on OK, the popup must be removed
        ICTouchAPI.popupServices.removePopup(context.objServerPopup);
        context.objServerPopup = null;
      }
    });
    // Create the content of the popup
    var popupData = {
      strTitle: _("Error","webapp.mySpeedDial"),
      strType: "error",
      strContent: _("HTTP Server Unreachable","webapp.mySpeedDial"),
      arrPopupButtons: buttons
    };
    // Create and open the popup if not already displayed
    if (!this.objServerPopup){
      this.objServerPopup = ICTouchAPI.popupServices.addNewPopup(popupData, "MEDIUM");
    }
*/

    ICTouchAPI.debugServices.error("webapp.myMediaViewer.errorOnHttpRequest():" + _("HTTP Server Unreachable","webapp.myMediaViewer"));
  },


//***************************************************************************************//
//MULTIMEDIA Events
//***************************************************************************************//
  notifyPlayerLoading : function(objEvent) {
    dojo.publish("myMediaViewer/Loading",objEvent);
    console.warn("notifyPlayerLoading():" + objEvent);
  },

  notifyPlayerStopped : function(objEvent) {
    dojo.publish("myMediaViewer/Stopped",objEvent);
    console.warn("notifyPlayerStopped():" + objEvent);
  },

  // Stop any loading spinner that is running. If in media player mode (2nd level), call UI Media method ï¿½mediaPlayï¿½.
  notifyPlayerPlaying : function(objEvent, objEvent2) {
    dojo.publish("myMediaViewer/Playing",objEvent,objEvent2);
    console.warn("notifyPlayerPlaying():" + objEvent + ", " + objEvent2);
  },

  // Start the loading spinner on the currently displayed widget.
  notifyPlayerBuffering : function(objEvent) {
    dojo.publish("myMediaViewer/Buffering",objEvent);
    console.warn("notifyPlayerBuffering():" + objEvent);
  },

  notifyPlayerPaused : function(objEvent, objEvent2) {
    dojo.publish("myMediaViewer/Paused",objEvent,objEvent2);
    console.warn("notifyPlayerPaused():" + objEvent + ", " + objEvent2);
  },

  // Stop any loading spinner that is running.
  notifyPlayerError : function(objEvent, objEvent2, objEvent3) {
    dojo.publish("myMediaViewer/Error",objEvent,objEvent2,objEvent3);
    console.warn("notifyPlayerError():" + objEvent + ", " + objEvent2 + ", " + objEvent3);
  },


  // If we are in playlist mode, it launchs the next one. If we are in mediaPlayer mode, it stops.
  notifyPlayerFinished : function(objEvent) {
    dojo.publish("myMediaViewer/Finished",objEvent);
    console.warn("notifyPlayerFinished():" + objEvent);
  },

  // Set Media UI
  notifyPlayerState : function(intDevice, boolDistant, intIndex, intState, intTotalTime, doubleVolume) {
    dojo.publish("myMediaViewer/State",intDevice, boolDistant, intIndex, intState, intTotalTime, doubleVolume);
    console.warn("notifyPlayerState():" + intDevice + ", " + boolDistant + ", " + intIndex + ", " + intState + ", " + intTotalTime+ ", " + doubleVolume);
  },

  notifyMediaSessionInfosReceived : function(args) {
    dojo.publish("myMediaViewer/Finished",args);
    console.warn("mediaSessionInfosReceived():" + args);
  },


//***************************************************************************************//
//SETTINGS
//***************************************************************************************//
  updateAllSettings: function ()
  {
    ICTouchAPI.settingServices.getSetting("myMediaViewerUrl", this,this.getMyMediaViewerUrl);
    ICTouchAPI.settingServices.getSetting("myMediaViewerUser", this,this.getMyMediaViewerUser);
    ICTouchAPI.settingServices.getSetting("myMediaViewerRefreshTimer", this,this.getMyMediaViewerRefreshTimer);
    ICTouchAPI.settingServices.getSetting("myMediaViewerEnablePreview", this,this.getMyMediaViewerEnablePreview);

    ICTouchAPI.settingServices.subscribeToSetting(this, "myMediaViewerUrl", this.onMyMediaViewerUrlChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "myMediaViewerUser", this.onMyMediaViewerUserChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "myMediaViewerRefreshTimer", this.onMyMediaViewerRefreshTimerChanged);
    ICTouchAPI.settingServices.subscribeToSetting(this, "myMediaViewerEnablePreview", this.onMyMediaViewerEnablePreviewChanged);

    ICTouchAPI.debugServices.error("webapp.myMediaViewer.settigns - myMediaViewerUrl:" + this.data.myMediaViewerUrl);
    ICTouchAPI.debugServices.error("webapp.myMediaViewer.settigns - myMediaViewerUser:" + this.data.myMediaViewerUser);
    ICTouchAPI.debugServices.error("webapp.myMediaViewer.settigns - myMediaViewerRefreshTimer:" + this.data.myMediaViewerRefreshTimer);
    ICTouchAPI.debugServices.error("webapp.myMediaViewer.settigns - myMediaViewerEnablePreview:" + this.data.myMediaViewerEnablePreview);
  },
  
  //On Setting changed
  onMyMediaViewerUrlChanged : function(objUrl){ if (objUrl) { this.data.myMediaViewerUrl = objUrl.jsValue; }  },
  onMyMediaViewerUserChanged: function(objUser){ if(objUser){ this.data.myMediaViewerUser = objUser.jsValue; }  },
  onMyMediaViewerRefreshTimerChanged: function(objRefreshTimer){  if(objRefreshTimer){this.data.myMediaViewerRefreshTimer = objRefreshTimer.jsValue;} },
  onMyMediaViewerEnablePreviewChanged: function(objEnablePreview) { this.registerHomePageContainer(objEnablePreview); },
  onMyMediaViewerListChanged: function(objList){  if(objList){this.data.myMediaViewerList = objList.jsValue;} },
 
  //Get setting
  getMyMediaViewerUrl: function(objUrl) { if(objUrl){ this.data.myMediaViewerUrl = objUrl.jsValue; }  },
  getMyMediaViewerUser: function(objUser) { if(objUser){ this.data.myMediaViewerUser = objUser.jsValue; } },
  getMyMediaViewerRefreshTimer: function(objRefreshTimer) { if(objRefreshTimer){this.data.myMediaViewerRefreshTimer = objRefreshTimer.jsValue;} },
  getMyMediaViewerEnablePreview: function(objEnablePreview) { this.registerHomePageContainer(objEnablePreview); },
  getMyMediaViewerList: function(objList) { if(objList){this.data.myMediaViewerList = objList.jsValue;} },

  setMyMediaViewerList: function(objList) {
    if(this.data && this.data.myMediaViewerList) {
      this.data.myMediaViewerList = dojo.toJson(objList);
      ICTouchAPI.settingServices.setSettingValue( "myMediaViewerList", this.data.myMediaViewerList, this);
    }
  },

  setMyMediaTypeList: function(objList) {
    if(this.data && this.data.myMediaTypeList) {
      this.data.myMediaTypeList = dojo.toJson(objList);
      ICTouchAPI.settingServices.setSettingValue( "myMediaTypeList", this.data.myMediaTypeList, this);
    }
  },

  registerHomePageContainer : function(objSetting)
  {
    if (objSetting){
      if(this.data && this.data.myMediaViewerEnablePreview)
      {
        this.data.myMediaViewerEnablePreview = objSetting.jsValue;
      }
      
      if(objSetting.jsValue === true)
      {
        // if EnableTodoPreview=true, enable the preview
        ICTouchAPI.tools.registerHomepageContainer(["webapp.myMediaViewer.getMediaViewPreview", this]);
      }
      else
      {
        // else, disable the preview
        ICTouchAPI.tools.unregisterHomepageContainer(["webapp.myMediaViewer.getMediaViewPreview"]);
      }
    }
  },

  setHomepageContainer : function (strWebapp, div) {
    webapp.myMediaViewer.previewContainer = new webapp.myMediaViewer.getMediaViewPreview({ }, div);
  },

});
