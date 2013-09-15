dojo.provide("webapp.myMediaViewer.dataBase");
dojo.declare("webapp.myMediaViewer.dataBase",null,{

  _arrMedias               : [],
  _arrMediaTypes           : [],
  _defaultRefeshTimer      : 5 * 60 * 1000,
  _getMyMediasViewerTimeout: null,
  _getMyMediasListTimeout  : null,

  myMediaViewerUrl           : '',
  myMediaViewerUser          : '',
  myMediaViewerRefreshTimer  : 60,
  myMediaViewerEnablePreview : false,
  myMediaViewerList          : [],
  myMediaTypesList           : [],

  player : null,

	BACK:"BACK_BTN",
  HOME:"HOME_BTN",
  REFRESH: "REFRESH_BTN",

  PLAY_AUDIO: "PLAYA_BTN",
  PAUSE_AUDIO: "PAUSEA_BTN", 
  
  PLAY_VIDEO: "PLAYV_BTN",
  PAUSE_VIDEO: "PAUSEV_BTN",

  PLAY_IMAGE: "PLAYI_BTN",

  PLAY_SLIDE: "PLAYS_BTN",
  PAUSE_SLIDE: "PAUSE_BTN",
  NEXT_SLIDE: "NEXTS_BTN",
  PREV_SLIDE: "PREVS_BTN",



  // View level
  VIEW_LEVEL_1  : 0,
  VIEW_LEVEL_2  : 1,
  NB_VIEW     : 2,

  _arrEntries           : [], //the array holding our categories for the menu
  _boolLoading          : false,
  _boolNeedReload       : false,
  strMediaMenuTitle     : "MyMedias",
  strMediaTitle         : "",
  _arrDetails           : [],
  intCurrentCategory    : 0,
  intViewLevel          : 0,
  objCurrentMediaItem       : null,
  currentSettingWebapp  : "",
  intCurrentMediaItem       : 0,
  objSettingUI          : null,
  intChoiceListSelected : 0,
  objAdminButtonUI      : null,
  arrOverriddenSettings : [],
  webappView            : false,
  currentWebappName     : "",
  currentWebappViewName : "",
  objWrongSequence      : {},
  actionBarState        : null,


  

	constructor:function(){
		//called during phone initialization, refer to the constraints and limitations guide for more information about what can be done in the constructor
		var func=dojo.hitch(webapp.myMediaViewer,webapp.myMediaViewer.buttonCallback);

    this.intViewLevel = this.VIEW_LEVEL_1;

    //we load the list of the Menu Main categories and categories
    this.loadList();
	},


//----------------------------------------------------------------------------
// GUI functions
//----------------------------------------------------------------------------

  // Load the main categories then subcategory for each one
  loadList : function() {
    if( this._boolLoading ) {
      this._boolNeedReload = true;
      return;
    }

    // it seem we notify the loading of the menu
    this._boolLoading = true;
    
    // We get the SpeedDial Groups
    this.loadedMediaMenu(this._arrMedias);
  },



  //called once the main categories of the menu have been returned
  loadedMediaMenu: function(_arr) {
    this._arrEntries = [];
    
    //Parse all the Groups
    if(_arr && _arr.length >0)
    {
      for (var i = 0; i < _arr.length; i++) {
        //Main Group name
        var groupIndex = this._arrEntries.length;
        var groupName = _arr[i].type + "(" + _arr[i].list.length.toString() + ")";
        var groupIcon = _arr[i].type ? _arr[i].type + "-icon" : '';

        this._arrEntries.push({
          intIndex: groupIndex,
          strPrimaryContent: groupName,
          strType: "title",
          groupIcon: groupIcon,
        });


        //Media list
        if(_arr[i] && _arr[i].list && _arr[i].list.length > 0 )
        {
          for (var j = 0; j < _arr[i].list.length; j++) {

            try{
                var mediaIcon =  _arr[i].type ? _arr[i].type + "-icon" : '';
                var mediaName =  _arr[i].list[j].title;
                var mediaType =  _arr[i].type;
                var mediaUrl = _arr[i].list[j].url;

                this._arrEntries.push({
                  intIndex: this._arrEntries.length,
                  strPrimaryContent: mediaName,
                  strType: "normal",
                  strMainCat: groupName,
                  indexMainCat: groupIndex,
                  strSubCat: mediaName,
                  mediaUrl: mediaUrl,
                  mediaIcon: mediaIcon,
                  mediaType: mediaType,
                });
            }
            catch(err){
              console.error("webapp.myMediaViewer - loadedMediaMenu():" + err.message);
            }
          }
        }
      }
    }

    this._boolLoading = false;

    try{
      if(webapp.myMediaViewer.mediaListMenu){
        webapp.myMediaViewer.mediaListMenu.refresh();
      }
    } catch(err) { console.error("webapp.myMediaViewer - loadedMediaMenu():" + err.message);}
    

    if (this._boolNeedReload) {
      this._boolNeedReload = false;
      this.loadList();
    }
  },


  // Load the settings associated with a subcategory and make it the activ subcategory.
  // This is mostly used when a user click on a subcategory
  loadMediaDetails : function(intIndex) {
    //intIndex : index of the clicked element in the menu list

    //Reset error sequence
    this.objWrongSequence = {};

    //???
    this._checkChange=true;

    //we change the index refering to the last 'current category' up to the new 'current category' index
    this.intCurrentCategory = intIndex;

    //getting a quick reference on the clicked category
    var obj = this._arrEntries[intIndex];

    //the level of the view ? seem to be deprecqted qnd should be erased
    this.intViewLevel = this.VIEW_LEVEL_1;

    // update action Bar
    webapp.myMediaViewer.updateActionBar();

    this._arrDetails = [];
    this.strMediaTitle = obj.strSubCat;

    if(obj && obj.mediaUrl && obj.mediaUrl.length >0)
    {
      var self= this;
      self._arrDetails.push({ strLabel: "Title",
                          strContent: obj.strPrimaryContent,
                          strIcon: obj.mediaIcon,
                          strPrimaryIcon: obj.mediaIcon,
                          callback: function() { webapp.myMediaViewer.actionMediaPlay(url); }
                          });

      for (var i = 0; i < obj.mediaUrl.length; i++) {
       (function(i, self){
          var url = obj.mediaUrl[i];
              self._arrDetails.push({ strLabel: 'url',
                          strContent: obj.mediaUrl[i],
                          strIcon: obj.mediaIcon,
                          strPrimaryIcon: obj.mediaIcon,
                          callback: function() { webapp.myMediaViewer.actionMediaPlay(url); }
                        });
       })(i,self);
      }
    }
  },



  // Clears the details UI, used when switching User mode as we LoadList();
  clearMediaDetails: function() {
    //Reset error sequence
    this.objWrongSequence = {};

    // force LVL 1 - update bars - update title
    this.intViewLevel = this.VIEW_LEVEL_1;

    this.strMediaTitle = "";

    this.intCurrentCategory = undefined;
    this._arrDetails = [];

    this.intCurrentMediaItem = 0;
    this.objCurrentMediaItem = null;
  },


  getMediaTitle: function(){
    return this.strMediaTitle;
  },

  getMediaMenuTitle:function(){
    return this.strMediaMenuTitle;
  },

  getMediaMenuEntries: function(){
    return this._arrEntries;
  },

  getMediaDetails: function(){
    if( this._arrDetails === undefined ){
      return [];
    }

    return this._arrDetails;
  },

  getCurrentMediaItem : function()
  {
    try{
      return this._arrEntries[this.intCurrentMediaItem];
    } catch (err) {
      console.error("webapp.myMediaViewer.database - getCurrentMediaItem():" + err.message);
      return null;
    }
  },


  setCurrentMediaItem : function(intMediaItem) {
    this.intCurrentMediaItem = intMediaItem;
    this.objCurrentMediaItem = this._arrEntries[intMediaItem];
    //this.objCurrentMediaItem = this._arrDetails[intMedia];
  },



});
