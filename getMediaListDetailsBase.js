dojo.provide("webapp.myMediaViewer.getMediaListDetailsBase");
dojo.declare("webapp.myMediaViewer.getMediaListDetailsBase",
  [ICTouchAPI.webWidget,dojox.dtl._Templated],
  {
    objContent : null,

    postCreate:function(){
      var data = webapp.myMediaViewer.data;

      //we get the content of _arrDetails which hold our myMediaViewer and UIElements
      var mediaItem = data.getCurrentMediaItem();
      var list = data.getMediaDetails();
      var title = data.getMediaTitle();

      //the container of my UIelements
      if(mediaItem)
      {
        switch(mediaItem.mediaType)
        {
          case 'VIDEO': this.createVideoContent(mediaItem); break;
          case 'AUDIO': this.createAudioContent(mediaItem); break;
          case 'IMAGE': this.createImageContent(mediaItem); break;
          case 'SLIDE': this.createImageContent(mediaItem); break;
          default:      this.createDefaultContent(title,list); break;
        }
      }
      else{
        this.createDefaultContent('',[]);
      }
    },
    
    createDefaultContent : function(title, list)
    {
      try{
        if(this.objContent) { this.objContent.destroy();}
      } catch(err) { console.warn("webapp.myMediaViewer.getMediaListDetailsBase - createDefaultContent():" + err.message); }

      var container = new UIElements.Container.ContainerControl(
      {
        objTitle: {
          strLabel : title,
        },
        objContent: {
              name  : "UIElements.PresentationList.PresentationListControl",
              params  : {
                arrItems : list,
                boolShowLabel: true,
                boolShowIcon: true,
              }
          }
        }, this.domContainer);

      //saving a reference
      this.objContent = container.getContent();
    },

    createImageContent : function(mediaItem)
    {
      try{
        if(this.objContent) { this.objContent.destroy(); }
      } catch(err) { console.warn("webapp.myMediaViewer.getMediaListDetailsBase - createImageContent():" + err.message); }

      var container = new UIElements.Container.ContainerControl(
      {
        objTitle: {
          strLabel : mediaItem.strPrimaryContent,
        },
        objContent: {
              name  : "webapp.myMediaViewer.getMediaListDetailsImage",
              params  : {},
          }
        }, this.domContainer);

      //saving a reference
      this.objContent = container.getContent();
    },

    createVideoContent : function(mediaItem)
    {
      try{
        if(this.objContent) { this.objContent.destroy(); }
      } catch(err) { console.warn("webapp.myMediaViewer.getMediaListDetailsBase - createVideoContent():" + err.message); }

      var container = new UIElements.Container.ContainerControl(
      {
        objTitle: {
          strLabel : mediaItem.strPrimaryContent,
        },
        objContent: {
              name  : "webapp.myMediaViewer.getMediaListDetailsVideo",
              params  : {},
          }
        }, this.domContainer);

      //saving a reference
      this.objContent = container.getContent();
    },

    createAudioContent : function(mediaItem)
    {
      try{
        if(this.objContent) { this.objContent.destroy(); }
      } catch(err) { console.warn("webapp.myMediaViewer.getMediaListDetailsBase - createAudioContent():" + err.message); }

      var container = new UIElements.Container.ContainerControl(
      {
        objTitle: {
          strLabel : mediaItem.strPrimaryContent,
        },
        objContent: {
              name  : "webapp.myMediaViewer.getMediaListDetailsAudio",
              params  : {},
          }
        }, this.domContainer);

      //saving a reference
      this.objContent = container.getContent();
    },

    destroy : function(){//do not use except if you want to carsh the target
      try{
        if(this.objContent) {
          this.objContent.destroy();
        }

      } catch(err) { console.warn("webapp.myMediaViewer.getMediaListDetailsBase - destroy():" + err.message); }

      this.inherited(arguments);
    },
  }

);
