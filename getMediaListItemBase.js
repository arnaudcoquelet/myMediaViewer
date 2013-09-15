dojo.provide("webapp.myMediaViewer.getMediaListItemBase");
dojo.declare("webapp.myMediaViewer.getMediaListItemBase",
  [ICTouchAPI.webWidget, dojox.dtl._Templated],
  {
    postCreate:function(){
      var data = webapp.myMediaViewer.data;

      //getting the entries list : main category, category
      var mediaMenuList = data.getMediaMenuEntries();
            
      //defining the callback function called when the menulist is collapsed
      var callbackCollapsed = dojo.hitch(webapp.myMediaViewer, webapp.myMediaViewer.onMenuCollapse);
            
      //creating the conatiner for the menulist (1/3 panel)
      var container = new UIElements.Container.ContainerControl(
      {
        objTitle: {
          strLabel    : _("MyMedias","webapp.myMediaViewer"),
        },
        //the menu list
        objContent: {
          name    :   "UIElements.MenuList.MenuListControl",
          params  :
          {
            arrItems: mediaMenuList,
            callback: function(value) { webapp.myMediaViewer.onMenuClick(value); },
            boolAutoCollapse: true,
            funcCollapsed: callbackCollapsed
          },
        },
      }, this.domList);

    },
  });