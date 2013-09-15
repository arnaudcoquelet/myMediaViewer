dojo.provide("webapp.myMediaViewer.getMediaListBase");
dojo.declare("webapp.myMediaViewer.getMediaListBase",[ICTouchAPI.webWidget,dojox.dtl._Templated],{

	constructor: function(){
		//called during phone initialization, refer to the constraints and limitations guide for more information about what can be done in the constructor
	},

	postMixInProperties:function(){
		//called after the properties of the widget have been set, refer to the constraints and limitations guide for more information
	},

	postCreate:function(){
		//called after the widget is created (DOM included) but before it is rendered
		var data=webapp.myMediaViewer.data;

		webapp.myMediaViewer.mediaListThirdControl = new UIElements.ApplicationMode.ThirdControl({
			menu: {
				name:"webapp.myMediaViewer.getMediaListItem",params:{}
			},
			container : {
				name:"webapp.myMediaViewer.getMediaListDetails",params:{}
			},
		},this.domMediaList);


		var func=dojo.hitch(webapp.myMediaViewer,webapp.myMediaViewer.buttonCallback);
		var buttonBack=new UIElements.AppButton.AppButtonControl({
			strButtonName:data.BACK,strButtonLabel:_("Back","webapp.myMediaViewer"),strButtonIcon:"generic-back",callback:func});

		ICTouchAPI.AppBarServices.addStaticButton("myMediaViewer","getMediaList",buttonBack);

		try{
			webapp.myMediaViewer.mediaListContainer        = webapp.myMediaViewer.mediaListThirdControl.getContainer();
			webapp.myMediaViewer.mediaListMenu             = webapp.myMediaViewer.mediaListThirdControl.getMenu();
		} catch(err) { console.warn("webapp.myMediaViewer.getMediaListBase - postCreate():" + err.message); }
	},



	startup: function(){
		//called after the widget and its child widget have been created and added to the DOM
	},

	destroy: function(){
		//called when the widget is deleted, write any additionnal "tear down" work here
	}
});
