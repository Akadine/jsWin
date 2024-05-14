/**********************************************************************************************************************************************************/
/* jsWin Library Crawford Computing Copyright 2024 by Jonathan Crawford                                                                                   */
/* This is a windowing library for websites.                                                                                                              */
/*                                                                                                                                                        */
/*  To create a Window Manager instance use:                                                                                                              */
/*    let wm = new jsWin(elementID,options, function(system) { //code here, system.options.background = "", system.options.openWindow(data);  })          */
/*  Where elementID is the ID of the div that will house the Window Manager, and options are the options. wm is now equal to the internal appID           */
/*                                                                                                                                                        */
/*  The following are the default options:                                                                                                                */
/*  defaultOptions = {                                                                                                                                    */
/*    minHeight: 200,                                                                                                                                     */
/*    minWidth: 200,                                                                                                                                      */
/*    getDataFn: undefined,                                                                                                                               */
/*    dataURL: "",                                                                                                                                        */
/*    taskbar: false,                                                                                                                                     */
/*    taskbarItems: ['start','trays','details','datetime'],                                                                                               */
/*    customTaskbarItems: [],                                                                                                                             */
/*    startMenuItems: [],                                                                                                                                 */
/*    icons: [], //not implemented                                                                                                                        */
/*    background: '',                                                                                                                                     */
/*    themes: {'light': 'light', 'blue': 'blue'},                                                                                                         */
/*    themePrefix: 'light',                                                                                                                               */
/*    borderRadius: '10',                                                                                                                                 */
/*    projectTitle: 'jsWin',                                                                                                                              */
/*    version: "0.0.1",                                                                                                                                   */
/*    data: {};                                                                                                                                           */
/*  };                                                                                                                                                    */
/*                                                                                                                                                        */
/*  minHeight and minWidth: the smallest the windows can be resized                                                                                       */
/*  getDataFn: send in your getData(url, callback) function, it should take the url and a function to call upon response.                                 */
/*    With this the window data for apps can be stored server-side and loaded only when needed.                                                           */
/*    You can also use this to have your apps work with data from your database.                                                                          */
/*  dataURL: the data url to send to getDataFn. this can be "site.com/getdata.php&sentinel=" + sentinel, the library will add what is needed.             */
/*    For example window[reqData] = "getSettings", this will add &mode=getSettings. check for mode in your php, and return the json data to use.          */
/*    To access the data you can find it in pane.data from any window app. Learn more in the window creation readme.                                      */
/*  taskbar: do you want to show a taskbar?                                                                                                               */
/*  taskbarItems: what you want and the order of the taskbar items, an array of strings.                                                                  */
/*    valid items are:                                                                                                                                    */
/*      "start": start menu button                                                                                                                        */
/*      "buttons": the buttons defined in taskbarButtons                                                                                                  */
/*      "trays": the window tray buttons                                                                                                                  */
/*      "details": this shows project name and version                                                                                                    */
/*      "datetime": this shows the date and time                                                                                                          */
/*  customtaskbaritems: an array of item detail lists [{name:"",click:"",content: htmlStr }[,{}...] ] this defines custom items for the taskbar           */
/*  startMenuItems: [ {name: "", click:""} [,{}...] ] this populates the start menu                                                                       */
/*  icons: an array of icon detail lists [{name:"",image:"",click:""[,position: {x:0,y:0}]}[,{}...] ].                                                    */
/*    If no position is set, they will be positioned in order top-left to bottom-left then working to the right.                                          */
/*  background: url to a background image                                                                                                                 */
/*  themes: the included themes, you can send in any custom themes here. check jsWin.css for instructions on creating themes, and/or make a theme changer */
/*  themePrefix: what theme to use                                                                                                                        */
/*  borderRadius: the radius to use if the window.roundCorners flag is set to true                                                                        */
/*  projectTitle: your project or website name                                                                                                            */
/*  version: your project version, you can always get the jsWin version (from defaultOptions) with jsWin.version() even if you set a version in options.  */
/*  data: data to be bound to elements goes here. (See below)                                                                                             */
/*                                                                                                                                                        */
/*  These are reactive! If you change an option later (from within the function you sent in), the window manager will respond, for example:               */
/*    system.options.background = newImageUrl; // this will change the background                                                                         */
/*    system.options.themePrefix = blue; // will change the theme dynamically to blue for all windows and the taskbar.                                    */
/*                                                                                                                                                        */
/*  For taskbar items.content and in window content, you can use the following:                                                                           */
/*    jsw-bind="", two-way binding: this just adds a little more functionality. Usage:                                                                    */
/*      <span jsw-bind="variable"></span>                                                                                                                 */
/*      wm.options.data.variable = value;                                                                                                                 */
/*    --OR--                                                                                                                                              */
/*      <span jsw-bind="myObject.varable"></span>                                                                                                         */
/*      wm.options.data.myObject.myVaraible = value;                                                                                                      */
/*    Either will put the value as the innerText, (or value for input fields) and will react like Angular if changed.                                     */
/*    For example, a user name entry app, you can do wm.options.data.user = {fName: "Jon", lName: "Doe" }; and <input type="text" jsw-bind="user.fname"/> */
/*  jsw-click="" and thin in here has acces to system, and in a window, the window object or "pane"                                                       */
/*    example: <button jsw-click="system.dialogBox("Hello World");">Say Hi!</button>                                                                      */
/*                                                                                                                                                        */
/* In startMenuItems and customTaskbarItems, the click property has access to system.                                                                     */
/* In customeTaskbarItems, if you add a click property the system will make it a button. You can skip the click property and in content use jsw-click     */
/*                                                                                                                                                        */
/**********************************************************************************************************************************************************/
/********************************************************************************************************************************************************/
/* Helper functions                                                                                                                                     */
/*   jswinUI.rectangle(top,left,bottom,right); rectangle(otherRectangle); //creates a rectangle                                                         */
/*   let rect = new jsWinUI.rectangle(0,0,100,200); //creates a rectangle                                                                               */
/*   rect.top, rect.left, rect.bottom, rect.right  //gives us those values back                                                                         */
/*   rect.width, rect,height, rect.area, rect.perimeter //calculated internaly                                                                          */
/*   rectangle.isRectangle({rectangle}); //returns true if the rectangle is valid to be use as otherRectangle Rectangle constructor                     */
/*   Valid rectangles:                                                                                                                                  */
/*     rect = {top: {number}, left: {number}, bottom: {number}, right: {number}, [,otherProperties] };                                                  */
/*     rect = {x: {number}, y: {number}, width: {number}, height: {number} [,otherProperties] };                                                        */
/*                                                                                                                                                      */
/* Resizable usage:                                                                                                                                     */
/*	let options = {                                                                                                                                     */
/*      element: {DOM Element}, handles: {string}, size {num}, [alsoResize: {array of elements}],                                                       */
/*      [minWidth: {number}], [minHeight: {number}], [maxWidth: {number}], [maxHeight: {number}],                                                       */
/*      [uiBounds: {rectangle}, [resize: {function} ], [stop: {function}]                                                                               */
/*  };                                                                                                                                                  */
/*  let myResizable = new jsWinUI.resizable( options );                                                                                                 */
/* To clean up upon removal call myResizable.remove();                                                                                                  */
/* Give the element a start size and position it absolutley, even if top and left are set to 0px. Border is optional, but you want to see it.           */
/*   <div id="Resizable" style="height: 100px; width: 200px; top: 80px; left: 140px; border: 5px solid black; position: absolute;">I'm Resizable</div>  */
/*   <script>                                                                                                                                           */
/*		let myResizable = new jsWinUI.resizable.({ //if element is removed, we can clear out this object with Resizable.RemoveInstance(Resizable.id);   */
/*			element: document.getElementById("Resizable"), //required                                                                                   */
/*          start: function(event, options, handleName) { } // optional, call before resize                                                             */
/*			handles: "n, s, e, w, nw, ne, sw, se", //only send in the ones you want, default: "sw"                                                      */
/*          size: 20, //size in pixels you want the handles. default: 5                                                                                 */
/*			alsoResize: {element1,element2}, //optional                                                                                                 */
/*			resize: function(event, options, handleName) { //optional, called after default resize is done. you want to know which handle...            */
/*				//set another element size based on this element size, etc                                                                              */
/*              if(handleName === "e") { //the element to the right is resized as well                                                                  */
/*				    options.alsoResize[0].style.width = options.uiBounds.width - element.style.width;                                                   */
/*                  options.alsoResize[0].style.right = element.style.left;                                                                             */
/*              } else if (handleName === "s") { //the element below is resized as well                                                                 */
/*				    options.alsoResize[1].style.height = options.uiBounds.height - element.style.height;                                                */
/*				    options.alsoResize[1].style.top = options.element.style.bottom;                                                                     */
/*              }                                                                                                                                       */
/*              options.yourProperty //whatever you need to do                                                                                          */
/*			},                                                                                                                                          */
/*          minWidth: 100, minHeight: 100, maxWidth: 400, maxHeight: 500, //the min and max size for the Resizable                                      */
/*          uiBounds: new jsWinUI.Rectangle(50,50,600,400), //cannot resize outside these bounds, notice "new"                                          */
/*          stop: function(event, options, handleName){}, //optional, called on mouseup when done resizing                                              */
/*          yourProperty: whatever // optional, whatever you need named whatever you want for use in resize or stop                                     */
/*		});                                                                                                                                             */
/*	  </script>                                                                                                                                         */
/*                                                                                                                                                      */
/* draggable usage:                                                                                                                                     */
/*	let options = { element: {DOM Element}, handles: { [elementName,] },[alsoDrag: { [elementName,] }, [drag: {function} ], [stop: {function}];         */
/*  let myDraggable = new jsWinUI.draggable( options );                                                                                                 */
/* To clean up upon removal call myDragable.remove();                                                                                                   */
/* Give the element a start size and position it absolutley, even if top and left are set to 0px. Border is optional, but you want to see it.           */
/*   <div id="Draggable" style="height: 100px; width: 200px; top: 300px; left: 140px; border: 5px solid black; position: absolute;">I'm draggable</div> */
/*   <script>                                                                                                                                           */
/*		let myDraggable = new jsWinUI.draggable({ //if element is removed, we can clear out this object with draggable=undefined;                       */
/*			element: document.getElementById("Draggable"), //required                                                                                   */
/*			handles: "title body", //only send in the ones you want, optional                                                                           */
/*          start: function(event, options, handleName) { } // optional, called before drag                                                             */
/*          drag: function(event, options) { //optional                                                                                                 */
/*				//set another element position based on this element position, etc. here we move a stack together                                       */
/*				options.alsoDrag[0].style.top = options.element.style.bottom; options.alsoDrag[0].style.left = options.element.style.left;              */
/*				options.alsoDrag[1].style.top = options.alsoDrag[0].style.bottom; options.alsoDrag[1].style.left = options.element.style.left;          */
/*              options.yourProperty //whatever you need to do                                                                                          */
/*			},                                                                                                                                          */
/*          stop: function(event, options, handleName){}, //optional, called on mouseup when done dragging                                              */
/*          yourProperty: whatever // optional, whatever you need named whatever you want for use in resize or stop                                     */
/*		});                                                                                                                                             */
/*	  </script>                                                                                                                                         */
/*                                                                                                                                                      */
/*  FadeIn usage:                                                                                                                                       */
/*    jsWinUI.fadeIN(DOM Element, speed, delay);                                                                                                        */
/*      Notes: send in the element, speed is how much opacity to add each step ("fast" = .25, "slow" = .05, default is .1)                              */
/*        delay is milliseconds between each step, default is 50                                                                                        */
/*                                                                                                                                                      */
/*  FadeOut usage:                                                                                                                                      */
/*    jsWinUI.fadeOut(DOM Element, speed, delay);                                                                                                       */
/*      Notes: send in the element, speed is how much opacity to add each step ("fast" = .25, "slow" = .05, default is .1)                              */
/*        delay is milliseconds between each step, default is 50                                                                                        */
/*                                                                                                                                                      */
/********************************************************************************************************************************************************/
/******************************************************************************/
/* HTMLMAKER Copyright 2024 Crawford Computing by Jonathan Crawford           */
/*                                                                            */
/* USAGE:                                                                     */
/* var element1 = {                                                           */ 
/*      tag: 'button',                                                        */
/*      name: 'my-button',                                                    */
/*      id: 'my-button',                                                      */
/*      class: 'button-class',                                                */
/*      text: 'Click Me!',                                                    */
/*      onclick: 'function(args)',                                            */
/* };                                                                         */
/*                                                                            */
/* // Generate HTML string for element1                                       */
/* var htmlString1 = HTMLMAKER.makeString(element1);                          */
/*                                                                            */
/* var element2 = {                                                           */
/*      tag: 'div',                                                           */
/*      id: 'my-container',                                                   */
/*      class: 'container-class',                                             */
/*      innerHTML: htmlString1                                                */
/* };                                                                         */
/*                                                                            */
/* // Use makeElement to create a DOM element for element2                    */
/* // Use makeElement takes a string and recursivley adds the blocks          */
/* // this effectively compiles the string into real HTML.                    */
/* var combined = HTMLMAKER.makeElement(HTMLMAKER.makeString(element2));      */
/*                                                                            */
/* // Append the combined element to the document body                        */
/* document.body.append(combined);                                            */
/*                                                                            */
/* you can create any element with any nodes. no sanity, so be carefull       */
/*                                                                            */
/* // you can also chain it:                                                  */                      
/* let message = "<br />" + Hello! + "<br /><br />";                          */
/* let htmlString = HTMLMAKER.makeString({                                    */
/*     tag: 'div',                                                            */
/*     class: 'border-box',                                                   */
/*     innerHTML: HTMLMAKER.makeString({                                      */
/*         tag: 'div',                                                        */ 
/*         class: 'center-container',                                         */
/*         innerHTML: message + HTMLMAKER.makeString({ //messaage + button    */
/*             tag: 'button',                                                 */
/*             onclick: 'myFunction()',                                       */
/*             text: 'Continue'                                               */        
/*         })                                                                 */
/*     })                                                                     */
/* });                                                                        */
/*                                                                            */
/* //so you made some dynamic html and you like how it looks? let's save it!  */
/* let extractedHtml = decodeHTML(document.getElementByID(my-contaner);       */
/* // now just save the extractedHtml as a file or in a database              */
/******************************************************************************/

/***********/
/* jsWinUI */
/***********/
var jsWinUI = (function(){
	/**
	 * @brief this function initializes the Resizable object
	 * @param _options {object} a dictionary of options. { element: DOMElement } required, the element to be resized
	 *
	 */
	function resizable(_options) {
		// Instance data
		this.options = Object.assign({}, resizable.defaultOptions, _options);
		this.initialPos = {};
		this.handlers = {};
		this.activeHandle = "";

		// Validate options
		if (!this.options.element || !(this.options.element instanceof Element)) {
			console.error("Resizable: [FATAL] 'element' option is required and must be a DOM element.");
			return;
		}
		
		// Validate uiBounds
		if (this.options.uiBounds !== undefined) {
			let tempRect = new jsWinUI.rectangle(this.options.uiBounds);
			this.options.uiBounds = tempRect.good ? tempRect : undefined;
			if (!tempRect.good) { console.error("Resizable: [WARNING] 'uiBounds' option was malformed for " + this.option.element.getAttribute("id") );}
		}
		
		// Initialize handles
		this.initHandles();
	}

	// Default options
	resizable.defaultOptions = {
		handles: "sw",
		size: 5
	};

	/**
	 * @brief this function initializes handles
	 *
	 */
	resizable.prototype.initHandles = function() {
		// Create handles
        let handleNames = this.options.handles.split(',').map(handle => handle.trim()); // Trim each handle name
		
		document.addEventListener("mousemove", event => {
			this.repositionHandles();
		});
		
		//set up the handles
        handleNames.forEach(handleName => {
			//create the handle
			let handle = document.createElement("div");
			handle.style.position = "absolute";
			handle.id = handleName;
            document.body.appendChild(handle);
            if (this.options.zindex) { handle.style.zIndex = this.options.zindex; }

			//store reference in the dictionary
			this.handlers[handleName] = { "handle": handle, "name": handleName };
            
			// position handle
            this.placeHandle(handle, handleName);
			
			// Add mouse enter event listener
			handle.addEventListener("mouseenter", event => {
				// Change cursor based on handle name
				document.body.classList.add("handle-" + handleName);
			});
			
			// Add mouse leave event listener
			handle.addEventListener("mouseleave", event => {
				// Change cursor based on handle name
				document.body.classList.remove("handle-" + handleName);
			});
			
            // Add mouse down event listener
            handle.addEventListener("mousedown", event => {		
				//we are consuming the event
				event.preventDefault();
				
				//mouse start position
				this.initialPos = {
					x: event.clientX,
					y: event.clientY
				};
				
				//set this handle's name as the active handle
				this.activeHandle = handleName;
				
				//crate the mousemove event listener and store its reference
				this.handlers[handleName].movefn = event => {
                    //we are consuming the event
				    event.preventDefault();
                    //run start function
                    if (typeof this.options.start === "function") {
						this.options.start(event, this.options, handleName);
					}
                    //resize it
					this.resizeElement(event, handleName);
				};
				
				//add the mousemove handler
				document.addEventListener("mousemove", this.handlers[handleName].movefn);
            });
			
			//crate the mouseup event listener and store its reference
			this.handlers[handleName].upfn = event => {
				if (this.activeHandle != undefined && this.activeHandle != "" && this.handlers[this.activeHandle].movefn) { //are we even in our own element?
					//we are consuming the event
					event.preventDefault();
					
					//remove the mousemove handler
					document.removeEventListener("mousemove", this.handlers[this.activeHandle].movefn);
					
					//no active handle anymore
					this.activeHandle = "";
					
					//makes sure all the handles are repositioned
					this.repositionHandles();
					
					//call the custom stop handler
					if (typeof this.options.stop === "function") {
						this.options.stop(event, this.options, handleName);
					}
				}
			};

            // Add mouseup event listener
			document.addEventListener("mouseup", this.handlers[handleName].upfn);
        });
	};
	
	/**
	 * @brief this function deconstructs the object
	 */
	resizable.prototype.remove = function(){
		this.removeHandles();
	};
			
	/**
	 * @brief this function removes all tha handles
	 */
	resizable.prototype.removeHandles = function() {
		Object.values(this.handlers).forEach(handler => {
			if (handler.movefn !== undefined) { document.removeEventListener("mousemove", handler.movefn); }
			if (handler.upfn !== undefined) { document.removeEventListener("mouseup", handler.upfn); }
			if (handler.handle !== undefined) { handler.handle.remove(); }
		});
	};
		
	/**
	 * @brief this function positions and sizes the handles
	 * @param handle {element} the handle to position and size
	 * @param handleName {string} the handle name
	 */
	resizable.prototype.placeHandle = function(handle, handleName) {
		//the rectangle of the element to be resized
		let elementRect = this.options.element.getBoundingClientRect();
		
		//we want the corner handles to be usable, side handle length is our element's side length minus 2 corner handles
		let buffer = this.options.size + this.options.size;
 
		switch (handleName) {
			case "n": //the top side
				//set the left
				handle.style.left = (elementRect.left + this.options.size) + "px";
				//set the top
				handle.style.top = elementRect.top + "px";
				//set the width, minus the two corners
				handle.style.width = (elementRect.right - elementRect.left - buffer) + "px";
				//set the height
				handle.style.height = this.options.size  + "px";
				break;
			case "s": //the bottom side
				//set the left
				handle.style.left = (elementRect.left + this.options.size) + "px";
				//set the top
				handle.style.top = (elementRect.bottom - this.options.size) + "px";
				//set the width minus the two corners
				handle.style.width = (elementRect.right - elementRect.left - buffer) + "px";
				//set the height
				handle.style.height = this.options.size + "px";
				break;
			case "e": //the left side
				//set the top
				handle.style.top = (elementRect.top + this.options.size) + "px";
				//set the left
				handle.style.left = (elementRect.right - this.options.size) + "px";
				//set the width
				handle.style.width = this.options.size + "px";
				//set the height minus the two corners
				handle.style.height = (elementRect.bottom - elementRect.top - buffer) + "px";
				break;
			case "w": //the right side
				//set the top
				handle.style.top = (elementRect.top + this.options.size) + "px";
				//set the left
				handle.style.left = elementRect.left + "px";
				//set the width
				handle.style.width = this.options.size + "px";
				//set the height minus the two corners
				handle.style.height = (elementRect.bottom - elementRect.top - buffer) + "px";
				break;
			case "ne": //the top right corner
				//set the top
				handle.style.top = elementRect.top + "px";
				//set the left
				handle.style.left = (elementRect.right - this.options.size) + "px";
				//set the width
				handle.style.width = this.options.size + "px";
				//set the height
				handle.style.height = this.options.size + "px";			
				break;
			case "nw": //the top left corner
				//set the top
				handle.style.top = elementRect.top + "px";
				//set the left
				handle.style.left = elementRect.left + "px";
				//set the width
				handle.style.width = this.options.size + "px";
				//set the height
				handle.style.height = this.options.size + "px";	
				break;
			case "se": //the bottom right corner
				//set the top
				handle.style.top = (elementRect.bottom - this.options.size) + "px";
				//set the left
				handle.style.left = (elementRect.right - this.options.size) + "px";
				//set the width
				handle.style.width = this.options.size + "px";
				//set the height
				handle.style.height = this.options.size + "px";	
				break;
			case "sw": //the bottom left corner
				//set the top
				handle.style.top = (elementRect.bottom - this.options.size) + "px";
				//set the left
				handle.style.left = elementRect.left + "px";
				//set the width
				handle.style.width = this.options.size + "px";
				//set the height
				handle.style.height = this.options.size + "px";	
				break;
		}
	};
	
	/**
	 * @brief this function repositions all tha handles
	 */
	resizable.prototype.repositionHandles = function() {
		Object.values(this.handlers).forEach(handler => {
			this.placeHandle(handler.handle, handler.name);
		});
	};
		
	/**
	 * @brief this function handles the default resize operation
	 * @param event {event} the event
	 * @param handleName {string} the handle to reposition
	 */
	resizable.prototype.resizeElement = function(event, handleName) {
		//the the deltas
		let dx = event.clientX - this.initialPos.x;
		let dy = event.clientY - this.initialPos.y;
		
		//get the current size
		let tempRect = this.options.element.getBoundingClientRect();	
		
		let elementRect = new jsWinUI.rectangle({
			top: tempRect.top ,
			left: tempRect.left,
			bottom: tempRect.bottom,
			right: tempRect.right
		});
		
		// only resize if handle matches the side
		if (handleName === "n" || handleName[0] === "n") { //top border
			let canResize = true;
			
			//new element location
			let newLoc = new jsWinUI.rectangle({
				top: elementRect.top + dy,
				left: elementRect.left,
				bottom: elementRect.bottom,
				right: elementRect.right
			});
			
			//make sure in bounds
			if (this.options.minHeight !== undefined && newLoc.height < this.options.minHeight) { canResize = false; }
			if (this.options.maxHeight !== undefined && newLoc.height > this.options.maxHeight) { canResize = false; }
			if (this.options.uiBounds !== undefined && newLoc.top < this.options.uiBounds.top) { canResize = false; }
			//if we are in bounds
			if(canResize) {
				//set the new width
				this.options.element.style.height = newLoc.height + "px";
				//calculate the new top
				this.options.element.style.top = newLoc.top + "px";
			} else {
				this.checkInside(event, handleName);
			}
		}
		if (handleName === "s" || handleName[0] === "s") { //bottom border
			let canResize = true;
			//new element location
			let newLoc = new jsWinUI.rectangle({
				top: elementRect.top,
				left: elementRect.left,
				bottom: elementRect.bottom + dy,
				right: elementRect.right
			});
			//make sure in bounds
			if (this.options.minHeight !== undefined && newLoc.height < this.options.minHeight) { canResize = false; }
			if (this.options.maxHeight !== undefined && newLoc.height > this.options.maxHeight) { canResize = false; }
			if (this.options.uiBounds !== undefined && newLoc.bottom > (this.options.uiBounds.bottom) ) { 
				canResize = false; 
			}
			//if we are in bounds
			if(canResize) {
				this.options.element.style.height = newLoc.height + "px";
			} else {
				this.checkInside(event, handleName);
			}
		}
		if (handleName === "e" || handleName[1] === "e") { //right border
			let canResize = true;
			//new element location
			let newLoc = new jsWinUI.rectangle({
				top: elementRect.top,
				left: elementRect.left,
				bottom: elementRect.bottom,
				right: elementRect.right + dx
			});
			//make sure in bounds
			if (this.options.minWidth !== undefined && newLoc.width < this.options.minWidth) { canResize = false; }
			if (this.options.maxWidth !== undefined && newLoc.width > this.options.maxWidth) { canResize = false; }
			if (this.options.uiBounds !== undefined && newLoc.right > (this.options.uiBounds.right) ) { 
				canResize = false; 
			}
			//if we are in bounds
			if(canResize) {
				this.options.element.style.width = newLoc.width + "px";
			} else {
				this.checkInside(event, handleName);
			}
		}
		if (handleName === "w" || handleName[1] === "w") { //left Border
			let canResize = true;
			//new element location
			let newLoc = new jsWinUI.rectangle({
				top: elementRect.top,
				left: elementRect.left + dx,
				bottom: elementRect.bottom,
				right: elementRect.right
			});
			//make sure in bounds		
			if (this.options.minWidth !== undefined && newLoc.width < this.options.minWidth) { canResize = false; }
			if (this.options.maxWidth !== undefined && newLoc.width > this.options.maxWidth) { canResize = false; }
			if (this.options.uiBounds !== undefined && newLoc.left < this.options.uiBounds.left) { canResize = false; }
			//if we are in bounds
			if(canResize) {
				//set the new width
				this.options.element.style.width = newLoc.width + "px";
				//calculate the new left
				this.options.element.style.left = newLoc.left + "px";
			} else {
				this.checkInside(event, handleName);
			}
		}
		
		//set the new start position
		this.initialPos = {
			x: event.clientX,
			y: event.clientY
		};
		
		//call the custom handler
		if (typeof this.options.resize === "function") {
			this.options.resize(event, this.options, handleName);
		}
		
		//reposition the handle
		let handle = this.handlers[handleName].handle;
		this.placeHandle(handle, handleName);
	};
	
	/**
	 * @brief this function checks if event x/y is inside the element, if not we fire the mouseup handler
	 * @param event {event} the event
	 * @param handleName {string} the handle to check
	 */
	resizable.prototype.checkInside = function(event, handleName) {
		let elementRect = new jsWinUI.rectangle( this.options.element.getBoundingClientRect() );
		if (!elementRect.containsPoint( { x: event.clientX, y: event.clientY } ) ) {
			document.body.classList.remove("handle-" + handleName);
			this.handlers[handleName].upfn(event);
		}
	};
	
	/**
	 * @brief this function initializes the DRAGGABLE object
	 * @param _options {object} a dictionary of options. { element: DOMElement } required, the element to be resized
	 *
	 */
    function draggable(_options) {
		// Instance data
		this.options = _options;
		this.initialPos = {};
		this.handlers = {};
		this.activeHandle = "";
		
		// Validate required options
        if (!this.options.element || !(this.options.element instanceof Element)) {
            console.error("DRAGGABLE: 'element' option is required and must be a DOM element.");
            return;
        }
		
		
		// Validate uiBounds
		if (this.options.uiBounds !== undefined) {
			let tempRect = new jsWinUI.rectangle(this.options.uiBounds);
			this.options.uiBounds = tempRect.good ? tempRect : undefined;
			if (!tempRect.good) { console.error("Resizable: [WARNING] 'uiBounds' option was malformed for " + this.options.element.getAttribute("id") );}
		}
		
		// Initialize handles
		this.initHandles();
	}
	
	/**
	 * @brief this function initializes handles
	 *
	 */
	draggable.prototype.initHandles = function() {
		// Create handles
		let handleNames = [];
		if (this.options.handles) {
			handleNames = this.options.handles.split(',').map(handle => handle.trim()); // Trim each handle name
		} else { 
			handleNames[0] = this.options.element.getAttribute("id");
		}
		//set up the handles
        handleNames.forEach(handleName => {
			//get the handle
            let handle = document.getElementById(handleName);
			
			//store reference in the dictionary
			this.handlers[handleName] = {};
			this.handlers[handleName] = { "handle": handle, "name": handleName };
            
			
			// Add mouse enter event listener
			handle.addEventListener("mouseenter", event => {
				// Change cursor
				document.body.classList.add("handle-pointer");
			});
			
			// Add mouse leave event listener
			handle.addEventListener("mouseleave", event => {
				// Change cursor 
				document.body.classList.remove("handle-pointer");
			});
			
            // Add mouse down event listener
            handle.addEventListener("mousedown", event => {
				//we are consuming the event
				event.preventDefault();
				
				// Change cursor 
				document.body.classList.remove("handle-pointer");
				document.body.classList.add("handle-grabbing");
				
				//mouse start position
				this.initialPos = {
					x: event.clientX,
					y: event.clientY
				};
                
                //element start position
                this.initialElemPos = {
                    top: parseFloat(this.options.element.style.top.split('p')[0]),
                    left: parseFloat(this.options.element.style.left.split('p')[0])
                };
                
                // Calculate the mouse anchor
                this.mouseAnchor = {
                    x: this.initialElemPos.left - event.clientX,
                    y: this.initialElemPos.top - event.clientY
                };
				
				//set this handle's name as the active handle
				this.activeHandle = handleName;
				
				//crate the mousemove event listener and store its reference
				this.handlers[handleName].movefn = event => {
                    //we are consuming the event
				    event.preventDefault();
                    //run start function
                    if (typeof this.options.start === "function") {
						this.options.start(event, this.options, handleName);
					}
                    //move it
					this.moveElement(event, handleName);
				};
				
				//add the mousemove handler
				document.addEventListener("mousemove", this.handlers[handleName].movefn);
            });

			//crate the mouseup event listener and store its reference
			this.handlers[handleName].upfn = event => {
				if (this.activeHandle != undefined && this.activeHandle != "" && this.handlers[this.activeHandle].movefn) { //are we even in our own element?
					//we are consuming the event
					event.preventDefault();
					
					// Change cursor
					document.body.classList.remove("handle-grabbing");
					//document.body.classList.add("handle-pointer");
					
					//remove the mousemove handler
					document.removeEventListener("mousemove", this.handlers[this.activeHandle].movefn);
					
					//no active handle anymore
					this.activeHandle = "";
					
					//call the custom stop handler
					if (typeof this.options.stop === "function") {
						this.options.stop(event, this.options);
					}
				}
            };
			
            // Add mouseup event listener
			document.addEventListener("mouseup", this.handlers[handleName].upfn);
        });
	};
	
	/**
	 * @brief this function handles the default move operation
	 * @param event {event} the event
	 */
	draggable.prototype.moveElement = function(event, handleName) {
		// Calculate the delta from initial mouse position to current mouse position
        let dy = event.clientY - this.initialPos.y;
        let dx = event.clientX - this.initialPos.x;

        // Calculate the new element position based on the mouse movement and mouse anchor
        let newTop = event.clientY + this.mouseAnchor.y;
        let newLeft = event.clientX + this.mouseAnchor.x;

        // Check if the new position is within the bounds of uiBounds, adjust if necessary
        if (this.options.uiBounds !== undefined) {
            newTop = Math.max(this.options.uiBounds.top, Math.min(this.options.uiBounds.bottom - this.options.element.offsetHeight, newTop));
            newLeft = Math.max(this.options.uiBounds.left, Math.min(this.options.uiBounds.right - this.options.element.offsetWidth, newLeft));
        }

        // Update the element's position
        this.options.element.style.top = newTop + "px";
        this.options.element.style.left = newLeft + "px";

        // Update the initial position for the next mouse move
        this.initialPos = {
            x: event.clientX,
            y: event.clientY
        };
        
        //update element start position
        this.initialElemPos = {
            top: parseFloat(this.options.element.style.top.split('p')[0]),
            left: parseFloat(this.options.element.style.left.split('p')[0])
        };

        // Call the custom handler
        if (typeof this.options.drag === "function") {
            this.options.drag(event, this.options);
        }

    };	
    
    // Function to check if the mouse is within the bounds of the handle
    draggable.prototype.isMouseWithinHandle = function(event, handleName) {
        let handleRect = document.getElementById(handleName).getBoundingClientRect();
        return (
            event.clientX >= handleRect.left &&
            event.clientX <= handleRect.right &&
            event.clientY >= handleRect.top &&
            event.clientY <= handleRect.bottom
        );
    };
	
	/**
	 * @brief this function removes an instance, and deletes its data members.
	 * @param _id {number} this instance ID
	 */
    draggable.prototype.remove = function() {
		this.removeHandles();
    };
	
	/**
	 * @brief this function removes all tha handles
	 */
	draggable.prototype.removeHandles = function() {
		Object.values(this.handlers).forEach(handler => {
			if (handler.movefn !== undefined) { document.removeEventListener("mousemove", handler.movefn); }
			if (handler.upfn !== undefined) { document.removeEventListener("mouseup", handler.upfn); }
		});
	};
				
	/**
	 * @brief this helper function describes a rectangle.
	 * @param _top {number | Rectangle} the top y coordinate or a Rectangle object
	 * @param _left {number} the left x coordinate
	 * @param _bottom {number} the bottom y coordinate
	 * @param _right {number} the right x coordinate
	 */
	function rectangle(_top,_left,_bottom,_right) {
		//what was set in?
		this.type = "bad";
		this.other = {};
		
		//figure out what was sent in
		if (typeof _top === 'object') {
			//it's an object, what type?
			if (rectangle.isRectangleTL(_top) ) { this.type = "tl"; this.other = _top;}
			else if (rectangle.isRectangleXY(_top) ) { this.type = "xy"; this.other = _top;}
			else { this.error = "Object was not a rectangle."; }
		} else if (_top !== undefined  && _left !== undefined && _bottom !== undefined && _right !== undefined) {
			//were numbers sent in?
			this.type = "norm";
		} else { this.error = "Missing arguments."; }
		
		if (this.type === "norm") {
			//test if numbers were sent in
			this.top = Number(_top);
			this.left = Number(_left);
			this.bottom = Number(_bottom);
			this.right = Number(_right);
			if (isNaN(this.top) || isNaN(this.left) || isNaN(this.right) || isNaN(this.bottom) ) {
				//something had no numbers
				this.type = "bad";
				this.error = "An argument was not a number.";
			}
		} else if (this.type === "tl") {
			//other is a tl rectangle
			this.top = parseFloat(this.other.top);
			this.left = parseFloat(this.other.left);
			this.bottom = parseFloat(this.other.bottom);
			this.right = parseFloat(this.other.right);
		} else if (this.type === "xy") {
			//other is an xy rectangle
			this.top = parseFloat(this.other.y);
			this.left = parseFloat(this.other.x);
			this.bottom = parseFloat(this.other.y) + parseFloat(this.other.height);
			this.right = parseFloat(this.other.x) + parseFloat(this.other.width);
		} 
		if (this.type !== "bad") {
			//all good, calculate the other properties
			this.width = this.right - this.left;
			this.height = this.bottom - this.top;
			this.area = this.width * this.height;
			this.perimeter = (this.width * 2) +  (this.height * 2);
			this.good = true;
            this.type = "jsw";
		} else {
			//something went wrong
			this.good = false;
			console.log("Rectangle: " + this.error); 
		}
	}
	
	/**
	 * @brief this function checks if a point is inside this rectangle object
	 * @param point { x: {num}, y: {num}  } a point object to test
	 */
	rectangle.prototype.containsPoint = function(point = undefined) {
		let inside = true;
		if (point === undefined || point.x === undefined || point.y === undefined || isNaN(point.x) || isNaN(point.y) ) { 
			console.log("Rectangle: Point to test is not a valid point object.");
			//can't be inside if point is invalid
			inside = false;
		} else {
			//if x is outside, it is outside
			if (point.x < this.left || point.x > this.right) { inside = false; }
			//if y is outside it is outside
			if (point.y < this.top || point.y > this.bottom) { inside = false; }
			//if both passed it is inside
		}
		return inside;
	};
	
	/**
	 * @brief this function checks if the other object is a top/left/bottom/right rectangle object
	 * @param obj {object} an object to test
	 */
	rectangle.isRectangleTL = function(obj) {
		return (
			typeof obj === 'object' &&
			'top' in obj &&
			'left' in obj &&
			'bottom' in obj &&
			'right' in obj
		);	
	};
	
	/**
	 * @brief this function checks if the other object is a nx/y/width/height rectangle object
	 * @param obj {object} an object to test
	 */
	rectangle.isRectangleXY = function(obj) {
		return (
			typeof obj === 'object' &&
			'x' in obj &&
			'y' in obj &&
			'width' in obj &&
			'height' in obj
		);
	};
	
	/**
	 * @brief this function checks if the other object is any rectangle object
	 * @param obj {object} an object to test
	 */
	rectangle.isRectangle = function(obj) { return (Rectangle.isRectangleTL(obj) || Rectangle.isRectangleXY(obj) ); };
	
	/**
	 * @brief this function fades an object in
	 * @param _el {Element} a DOM element to fade in
	 * @param _speed {number|string} this is how much is added each step, "slow" = .05, "fast" = .25, default is .1
	 * @param _delay {number} delay in millisecond between each step, default = 50
	 */
	function fadeIn(_el, _speed = 0.1, _delay = 50) {
		//check for element existance
		let el = null;
		if (_el instanceof Element) {
			//it's an Element, try to grab it from the DOM
			el = document.getElementById(_el.getAttribute("id"));
		} else {
			//it is not an element			
			console.log("Element is not an Element");
		}
		
		if (!el) {
			//it is not in the DOM
			console.log("Element is not in the DOM");
		} else {
			//all good, set up the animation
			let speed = (_speed==="fast")? 0.25 : (_speed==="slow") ? 0.05 : _speed;
			let opacity = 0;
			let delay = _delay;
			
			//set initial opacity
			el.style.opacity =  opacity; 
            el.style.visibility = "visible";
            el.style.display = "";
			
			//set up the animation loop
			const fadeInStep = () => {
				//add speed
				opacity += speed;
				if (opacity > 1) { opacity = 1; }
				//set new opacity
				el.style.opacity = opacity;
				if (opacity < 1) {
					//loop until opacity is 1
					setTimeout(fadeInStep, delay);
				}
			};
			
			//start the animation loop
			fadeInStep();
		}
	}
	
	/**
	 * @brief this function fades an object out
	 * @param _el {Element} a DOM element to fade out
	 * @param _speed {number|string} this is how much is added each step, "slow" = .05, "fast" = .25, default is .1
	 * @param _delay {number} delay in millisecond between each step, default = 50
	 */
	function fadeOut(_el, _speed = 0.1, _delay = 50) {
		//check for element existance
		let el = null;
		if (_el instanceof Element) {
			//it's an Element, try to grab it from the DOM
			el = document.getElementById(_el.getAttribute("id"));
		} else {
			//it is not an element			
			console.log("Element is not an Element");
		}
		
		if (!el) {
			//it is not in the DOM
			console.log("Element is not in the DOM");
		} else {
			//all good, set up the animation
			let speed = (_speed==="fast")? 0.25 : (_speed==="slow") ? 0.05 : _speed;
			let opacity = 1;
			let delay = _delay;
			
			//set initial opacity
			el.style.opacity =  opacity; 
            el.style.visibility = "visible";
            el.style.display = "";
			
			//set up the animation loop
			const fadeOutStep = () => {
				//add speed
				opacity = opacity - speed;
				if (opacity < 0) { opacity = 0; }
				//set new opacity
				el.style.opacity = opacity;
				if (opacity > 0) {
					//loop until opacity is 1
					setTimeout(fadeOutStep, delay);
				} else {
					//reset
					el.style.opacity = 1;
                    el.style.visibility = "hidden";
                    el.style.display = "none";
				}					
					
			};
			
			//start the animation loop
			fadeOutStep();
		}
	}
	
	return {
		resizable: resizable,
		draggable: draggable,
		rectangle: rectangle,
		fadeIn: fadeIn,
		fadeOut: fadeOut
	};
	
})();

/*************/
/* HTMLMAKER */
/*************/
var HTMLMAKER = (function () {		
	/**
	* This function creates an html string from an array of nodes names and values
	* There is no sanity here.
	* @param {array} elementData an array of options for the element
	* 
	* @returns {string} the HTML in a string
	*/
	function makeString(elementData) {
		//we at least need a tag type, div or a span, ect.
		if (elementData.tag === undefined || elementData.tag === "") { 
			return ''; 
		}
		
		//start the opening tag
		var htmlString = '<' + elementData.tag;
		
		//add nodes
		for (var key in elementData) {
			if (elementData.hasOwnProperty(key) && 
					key !== "tag" && 
					key !== 'text' && 
					key !== 'innerHTML') {
				htmlString += ' ' + key + '="' + elementData[key] + '"';
			}
		}

		// Close the opening tag
		htmlString += '>';

		// Add inner text or content
		if (elementData.text) {
			htmlString += elementData.text;
		}
		//either or here, exclude text to add another HTML string here
		// Add inner HTML content
		else if (elementData.innerHTML) {
			htmlString += elementData.innerHTML;
		}
		
		// Close the element
		htmlString += '</' + elementData.tag + '>';

		return htmlString;
	}
	
	/**
	* This function creates an htmldom element from an html string
	* @param {string} htmlString the string
	* 
	* @returns {DOMelement} the HTML DOM element
	*/
	function makeElement(htmlString) {
		try {
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlString.trim();
			
			// If there's only one child element, return it directly
			if (tempDiv.childNodes.length === 1) {
				return makeElement.createDOMFromNode(tempDiv.firstChild);
			} else {
				// If there are multiple child nodes, create a container element
				// and append the children to it
				var container = document.createElement('div');
				while (tempDiv.childNodes.length > 0) {
					container.appendChild(makeElement.createDOMFromNode(tempDiv.childNodes[0]));
				}
				return container;
			}
		} catch (error) {
			console.error("HTMLMAKER: Error creating element:", error);
			return null;
		}
	}
    
    // Function to recursively create DOM elements from child nodes
    makeElement.createDOMFromNode = function(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            var element = document.createElement(node.tagName.toLowerCase());
            // Copy attributes
            for (let i = 0; i < node.attributes.length; i++) {
                var attr = node.attributes[i];
                element.setAttribute(attr.nodeName, attr.nodeValue);
            }
            // Recursively process child nodes
            for (let i = 0; i < node.childNodes.length; i++) {
                var child = node.childNodes[i];
                element.appendChild(makeElement.createDOMFromNode(child));
            }
            return element;
        }
    };
	
	/**
	* This function creates an html string from aDOM element
	* @param {DOMelement} domElement an HTML DOM element
	* 
	* @returns {string} the HTML in a string
	*/
	function decodeHTML(domElement) {
		if (!domElement) {
			console.error("HTMLMAKER: Invalid DOM element or null string.");
			return '';
		}
		
		let htmlString = '';
		try {
			htmlString = domElement.outerHTML;
			return htmlString;
		} catch (error) {
			console.error("HTMLMAKER: Invalid DOM element:", error);
			return '';
		}		
	}
	
	/**
	* This function checks if a sring is a single tag
	* @param htmlString {string} the string to test
	* 
	* @returns {boolean} true if just a single tag
	*/
	function isSingleTag(htmlString) {
		// Define a regular expression to match a single opening tag without a closing tag
		var regex = /^<[^>]+>$/;
		// Test if the HTML string matches the regular expression
		return regex.test(htmlString);
	}

	return {
		makeString: makeString,
		makeElement: makeElement,
		decodeHTML: decodeHTML,
		isSingleTag: isSingleTag
	};
})();

/**********************/
/* Main jsWin Library */
/**********************/
function jsWin(_elementID = "", _options = {}, _startFN = function(){}) {
    
    //default window manager options
    let defaultOptions = {
        minHeight: 100,
        minWidth: 200,
        getDataFn: undefined,
        dataURL: "",
        taskbar: false,
        taskbarItems: ['start','trays','details','datetime'],
        customTaskbarItems: [],
        startMenuItems: [],
        icons: [],
        background: '',
        themes: {'light': 'light', 'blue': 'blue'},
        themePrefix: 'light',
        borderRadius: '10',
        projectTitle: 'jsWin',
        version: "0.0.6"
    };

    //default window data
    let defaultWindowData = {
        id: undefined, // *Required* Specifies the unique 3+ digit identifier of the window model. IDs below 200 are reserved for the system.
        title: "", // *Required* Specifies the title of the window.
        content: "", // *Required*  Specifies the HTML content to be displayed within the window.
        height: undefined, // Specifies the height of the window in pixels. If unset, the minimum system value will be used.
        width: undefined, // Specifies the width of the window in pixels.  If unset, the minimum system value will be used.
        top: undefined, // Specifies the top position of the window in pixels. If set, the window will be positioned from the top of the screen. If both top and bottom are set, bottom takes precedence.
        left: undefined, // Specifies the left position of the window in pixels. If set, the window will be positioned from the left of the screen. If niether left and right are set, window will be centered horizontally.
        bottom: undefined, // Specifies the bottom position of the window in pixels. If set, the window will be positioned from the bottom of the screen. If neither top and bottom are set, window will be centered vertically.
        right: undefined, // Specifies the right position of the window in pixels. If set, the window will be positioned from the right of the screen. If both left and right are set, right takes precedence.
        showMinimize: true, // Specifies whether the window should have a minimize button.
        showMaximize: true, // Specifies whether the window should have a maximize button.
        showExit: true, // Specifies whether the window should have an exit or close button.
        showTitlebar: true, // Specifies whether the window should have a title bar. If set to false, the window will not have a title bar.
        showTray: true, // Specifies whether to show a tray button in the task bar for the window. Be sure you have a way to close the window if set to false!
        showBorder: true, // Specifies whether to show a border around the window.
        roundCorners: false, // Specifies whether the window should have rounded corners.
        transparent: false, // Specifies whether the window should have a transparent background. use this with titlebar=false and noBorder = true to customize your window completely. 
        drag: true, // Specifies whether the window can be dragged by the user.
        resize: true, // Specifies whether the window can be resized by the user.
        oneInstance: false, // Specifies whether only one instance of the window can be opened. If set to true, attempting to open another instance will be prevented.
        isModal: false, // Specifies whether the window should be modal. If set to true, the window will block interactions with other windows until closed. 
        canBookmark: false, // Will add search parameters to the titlebar so user can bookmark and come back to the app. You must implement this functionality, the just puts url?app=title in the title bar
        mustLogin: false, // Specifies whether the user must login to see the app they have bookmarked. You must implement this functionality, this is just a parameter for you to use.
        startMaximized: false, // Will start the window maximized.
        requireJS: undefined, // Specifies JavaScript file list required for the window. This option enables developers to include specific JavaScript files that are essential for the functionality or presentation of the window.
        reqData: undefined, // Specifies whether the window needs data from the database. This option allows developers to define the type of data required for the window's content. This requies that a getDataFn by set.
        onLoad: undefined, // Specifies a callback function to be executed when the window is loaded. Developers can define custom logic to be performed when the window is opened.
        onExit: undefined, // Specifies a callback function to be executed when the window is closed or exited. Developers can define custom logic or cleanup tasks to be performed when the window is closed or exited.
        onMaximize: undefined, // Specifies a callback function to be executed when the window is maximized. Developers can define custom logic to be performed when the window is maximized.
        onMinimize: undefined, // Specifies a callback function to be executed when the window is minimized. Developers can define custom logic to be performed when the window is minimized.
        onRestore: undefined, // Specifies a callback function to be executed when the window is restored from a maximized or minimized state. Developers can define custom logic to be performed when the window is restored.
        onDrag: undefined, // Specifies a callback function to be executed when the window is dragged. Developers can define custom logic to be performed when the window is dragged.
        onResize: undefined, // Specifies a callback function to be executed when the window is resized. Developers can define custom logic to be performed when the window is resized.
        onMultiple: undefined, // Specifies a callback function to be executed when a multiple window is opened, works with oneInstance. Developers can define custom logic to be performed when a second window is opened.
        onFocus: undefined, // Specifies a callback function to be executed when the window gains focus.
        loseFocus: undefined, // Specifies a callback function to be executed when the windo loses focus.
        //internal properties, no need to set
        data: {}, // this is set by reqData so you can use it in content
    };
    
    //encapsulation, allowing for true private and public functions
    function windowManager(_elementID, _startFN) {
                
        // Merge user-provided options with defaults, and set a setter proxy to react to changes
        this.options = new Proxy(Object.assign({}, defaultOptions, _options), {
            set: (target, property, value) => {
                // Update the property
                target[property] = value;

                // change background image source
                if (property === 'background') { this.updateBackground(); }
                
                // remove and rebuild taskbar
                if (
                    property === 'taskbar' || 
                    property === 'version' || 
                    property === 'projectTitle' ||
                    property === 'themePrefix' || 
                    property === "taskbarItems" ||
                    property === "taskbarButtons" 
                ) {
                    this.removeTaskbar();
                    if (this.options.taskbar) { this.taskbarIDs = this.makeTaskbar(); }
                }
                
                // change the class tag for everything
                if (property === 'themePrefix') {
                    //todo: make a function to handle this
                }
                
                // change icon properties
                if (property === "icons") {
                    //todo: remove and readd icons using current settings
                }

                // Indicate that the operation was successful
                return true;
            }
        });
        
        let securityTag = document.getElementById("jsWinAppSecurity");
        if (securityTag) {
            //we may have a hacker
            console.log("Window Manager: (WARNING) Unauthorized attempt to initialize. App instance with id " + securityTag.getAttribute("app-id") + " already running."); 
            //sanity, do nothing, shouldn't type any code in the address bar anyways.
        } else if (this.initialized) { 
            console.log("Window Manager: (WARNING) Already initialized. Do not call init directly."); 
            //sanity, do nothing, shouldn't call init directly anyways.
        } else if (_elementID === "") {
            console.log("Window Manager: (FATAL) You must provide an Element ID");
            //sanity, if no element we can't do anything
        } else {
            //set the initialized flag
            this.initialized = true;

            //the element to create the window manager in
            this.element = document.getElementById(_elementID);

            //are we on mobile?
            this.isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            //menus
            this.menuIndex = -1;

            //panelist
            this.paneList = [];

            //sanity
            if (!(this.element instanceof Element)) {
                console.log("Window Manager: (FATAL) Element with id: " + _elementID + "must be a valid DOM element.");
                return null;
            }    
            if (this.options.getDataFn === undefined) {
                console.log("Window Manager: (WARNING) No getDataFn function set, window data can only be retrieved locally.");
            }

            //stretch it out
            this.element.style.height = "100%";
            this.element.style.width = "100%";

            //uiBounds
            this.uiBounds = this.getViewportSize();
            this.uiBounds.x = this.uiBounds.y = 0;
            this.uiBounds = new jsWinUI.rectangle(this.uiBounds);


            //the id, so we don't bump heads with any other element IDs
            this.appID = Math.floor((Math.random() * 999) + 1);

            //security tag
            this.element.appendChild(HTMLMAKER.makeElement(HTMLMAKER.makeString({
                'tag': 'div', 'id': 'jsWinAppSecurity', 'app-id': this.appID, 'style': 'display: none;'
            })));

            //make a taskbar
            if(this.options.taskbar){ this.taskbarIDs = this.makeTaskbar(); }

            //background
            if(this.options.background !== "") { this.backgroundID = this.makeBackground(); }

            //size reactiveness    
            window.addEventListener("resize", event => {
                this.onViewportResize();
            });
        }
    }
        
    /**
     * @brief This function gets the size of the viewport in the browser window.
     * @return {height: number, width: number} The height and width of the viewport
     */
   windowManager.prototype.getViewportSize = function(){
        let boundingRect = this.element.getBoundingClientRect();
        return {
            //2 here is window pane border width, this should be a customizable system option
            height: boundingRect.height + ( this.options.taskbar ? -50: 0) - 2,
            width: boundingRect.width - 2
        };
    };
        
    /**
     * @brief this function sets the UIBounds and resizes the Window Manager system
     */
    windowManager.prototype.onViewportResize = function() { 
        //UI bounds
        this.uiBounds = this.getViewportSize();
        this.uiBounds.x = this.uiBounds.y = 0;
        this.uiBounds = new jsWinUI.rectangle(this.uiBounds);

        //2 here is window pane border width, this should be a customizable system option
        //background and taskbar are full size
        let size = {height: (this.uiBounds.height + 2) + "px", width: (this.uiBounds.width + 2) + "px" };

        // background size
        if(this.options.background !== "") {                
            let background = document.getElementById(this.backgroundID);
            background.style.height = size.height;
            background.style.width = size.width;
        }

        //taskbar width
        document.getElementById(this.taskbarIDs.taskBarID).style.width = size.width;

        //update resizables and draggables

        for (let index in this.paneList) {
            let pane = this.paneList[index];
            if (pane.resizeable !== undefined) { pane.resizeable.options.uiBounds = this.uiBounds; }
            if (pane.draggable !== undefined) { pane.draggable.options.uiBounds = this.uiBounds; }
            if (pane.big) { 
                //set internal data
                pane.x = 1;
                pane.y = 1;
                pane.height = this.uiBounds.height;
                pane.width = this.uiBounds.width;

                //ids
                let paneID = pane.elIDs.containerID;
                let titleID = pane.elIDs.titlebarID;
                let contentID = pane.elIDs.contentID;

                //elements
                let objParent = document.getElementById(paneID); //entire window
                let objTitle = document.getElementById(titleID);
                let objChild = document.getElementById(contentID);

                //set it
                objParent.style.top = pane.y + "px";
                pane.top = pane.y;
                objParent.style.left = pane.x + "px";
                pane.left = pane.x;
                objParent.style.width = pane.width + "px";
                objParent.style.height = pane.height + "px";

                objChild.style.width = objParent.style.width;
                objChild.style.height = (objParent.style.height.split('p')[0] - objTitle.style.height.split('p')[0]) + "px";
                let z = 0;
            }
        }
    };
        
    /**
     * @brief this function creates the taskbar element and adds it to the app element as a child
     * @return {string, string} the taskbar and tray container element IDs
     */
    windowManager.prototype.makeTaskbar = function() {
        //ids
        let taskBarID = "taskbar-" + this.appID;
        let trayContainerID = "trays-" + this.appID;
        let startButtonID = "start-" + this.appID;
        let startTDID = "start-td-" + this.appID;
        let buttonsTDID = "buttons-td-" + this.appID;
        let traysTDID = "trays-td-" + this.appID;
        let projectTDID = "project-td-" + this.appID;
        
        //button
        let startButton = HTMLMAKER.makeString({ 
            tag: 'button', 
            id: startButtonID, 
            class: (options.themePrefix + "-start-menu"), 
            innerHTML: "Menu"
        });

        //tray container
        let trayContainer = HTMLMAKER.makeString({ tag: 'div', id: trayContainerID });

        //table data
        let startTD = HTMLMAKER.makeString({
            tag: 'td',
            id: startTDID,
            style: 'width: 62px; flex: 0 0 auto;',
            innerHTML: HTMLMAKER.makeString({ tag: 'div', style: 'overflow: visible;', innerHTML: startButton })
        });

        let traysTD = HTMLMAKER.makeString({
            tag: 'td',
            id: traysTDID,
            style: 'flex-grow: 4; min-width: 100px; display: flex; height: 50px; justify-content: left; align-items: center;',
            innerHTML: HTMLMAKER.makeString({ tag: 'div', style: "overflow: auto;", innerHTML: trayContainer })
        });

        let projectTD = HTMLMAKER.makeString({
            tag: 'td',
            id: projectTDID,
            style: 'max-width: 80px; min-width: 40px; width: auto; flex-grow: 1;',
            innerHTML: HTMLMAKER.makeString({
                tag: 'div',
                style: 'display: flex; height: 50px; justify-content: center; align-items: center; max-width: 80px; min-width: 40px; width: auto; flex-grow: 1;',
                innerHTML: this.options.projectTitle + "<br />Ver: " + this.options.version
            })
        });

        let customItems = this.options.customTaskbarItems.map(item => {
            let id = item.name + "-button-" + this.appID;
            let content = HTMLMAKER.makeString({
                tag: item.click ? 'button' : 'div',
                id: id,
                style: item.click ? 'height: 44px; width: 60px;' : 'max-width: 120px; min-width: 60px; width: auto;',
                class: item.click ? (options.themePrefix + "-start-menu") : "",
                innerHTML: item.content ? item.content : item.name
            });
            return {
                id : id,
                click: item.click,
                content: content
            };
        });
        
        let customIndex = 0;
        let row = this.options.taskbarItems.map(item => {
            switch(item) {
                case "start":
                    return startTD;
                case "trays":
                    return traysTD;
                case "details":
                    return projectTD;
                case "custom":
                    if (customItems.length > customIndex) {
                        let customItem = customItems[customIndex];
                        customIndex++;
                        return HTMLMAKER.makeString({
                            tag: 'td',
                            style: 'display: flex; justify-content: center; align-items: center; width: 60px;' + (customItem.click ? 'width: 62px;': 'width: fit-content;'),
                            innerHTML: customItem.content
                        });
                    } else {
                        console.log("Window Manager: (WARNING) Custom taskbar item not found, skipping.");
                        return "";
                    }
                    break;
                // Add additional cases for other taskbar items as needed
                default:
                    console.log("Window Manager: (WARNING) invalid task bar item, skipping.");
                    return ""; // Handle unknown items or add an error check
            }
        }).filter(item => item !== "").join(""); // Join all HTML strings into one string


        //taskbar, the container and navbar classes are provided by bootstrap.css
        let taskbar = HTMLMAKER.makeElement(HTMLMAKER.makeString({
            tag: 'div',
            id: taskBarID,
            class: (options.themePrefix + "-tray container-fluid navbar navbar-fixed-bottom"),
            innerHTML: HTMLMAKER.makeString({
                tag: 'table',
                width: '100%',
                innerHTML: HTMLMAKER.makeString({ 
                    tag: 'tr',
                    style: 'display: flex;',
                    innerHTML: row 
                })
            })
        }));

        //put it in the dom
        this.element.appendChild(taskbar);
        
        //attach click handlers, get elements first for sanity            
        let startButtonEl =  document.getElementById(startButtonID);
        let buttonsEl =  document.getElementById(buttonsTDID);
        let traysEl =  document.getElementById(traysTDID);
        let projectEl =  document.getElementById(projectTDID);
        
        let customEL = customItems.map(item => {
            return document.getElementById(item.id);
        });

        //start menu click
        if (startButtonEl) { startButtonEl.addEventListener("click", this.startMenuButtonClick); }

        // Close the start menu if we click anywhere else on the task bar
        if (buttonsEl) { buttonsEl.addEventListener("click", this.closeStartMenuOnClick); }
        if (traysEl) { traysEl.addEventListener("click", this.closeStartMenuOnClick); }
        if (projectEl) { projectEl.addEventListener("click", this.closeStartMenuOnClick); }
        
        for (const [index, element] of customEL.entries()) {
            if (this.options.customTaskbarItems[index].click === "system.startMenu();" || this.options.customTaskbarItems[index].click === "system.startMenu()" ) {
                element.addEventListener("click", this.startMenuButtonClick); 
            } else {
                element.addEventListener("click", this.closeStartMenuOnClick);
                if (this.options.customTaskbarItems[index].click) {
                    element.setAttribute("jsw-click", this.options.customTaskbarItems[index].click);
                    this.setupClickBinding(element);
                }
            }
            this.setupDataBinding(element);
            
        }
        
        //return necessary ids
        return {
            taskBarID: taskBarID,
            startButtonID: startButtonID,
            startTD: startTD,
            traysTD: traysTD,
            projectTD: projectTD,
            customItems: customItems,
            trayContainerID: trayContainerID,
        };
    };

    /**
     * @brief this function removes the taskbar and it's event handlers
     */
    windowManager.prototype.removeTaskbar = function() {
        //todo: remove the tray buttons and their event handlers
        for (var pane in this.paneList) { 
            //closeWindow.removeTray(paneList.pane);
        }

        // get elements first for sanity            
        let startButtonEl =  document.getElementById(this.taskbarIDs.startButtonID);
        let buttonsEl =  document.getElementById(this.taskbarIDs.buttonsTDID);
        let traysEl =  document.getElementById(this.taskbarIDs.traysTDID);
        let projectEl =  document.getElementById(this.taskbarIDs.projectTDID);
        let datetimeEl =  document.getElementById(this.taskbarIDs.datetimeTDID);

        //remove event handlers
        if (startButtonEl) { startButtonEl.removeEventListener("click", this.startMenuButtonClick); }
        if (buttonsEl) { buttonsEl.removeEventListener("click", this.closeStartMenuOnClick); }
        if (traysEl) { traysEl.removeEventListener("click", this.closeStartMenuOnClick); }
        if (projectEl) { projectEl.removeEventListener("click", this.closeStartMenuOnClick); }
        if (datetimeEl) { datetimeEl.removeEventListener("click", this.closeStartMenuOnClick); }
        //remove taskbar
        document.getElementById(this.taskbarIDs.taskBarID).remove();
    };
        
    /**
     * @brief this function creates the background element and adds it to the app element as a child
     * @param rand {number} the id.
     * @return {string} the background element IDs
     */
    windowManager.prototype.makeBackground = function() {
        //id
        let backID = "background-" + this.appID;

        //size
        let size = "height: " + this.uiBounds.height + "px; width: " + this.uiBounds.width + "px;";

        //the background container
        let background = HTMLMAKER.makeElement(HTMLMAKER.makeString({ 
            tag: 'div', 
            id: backID + "-container", 
            innerHTML: HTMLMAKER.makeString({ 
                tag: 'img', 
                id: backID, 
                src: this.options.background,
                style: size
            })
        }));

        //put it in the dom
        this.element.appendChild(background);

        background.addEventListener("click", event => {		
            //we are consuming the event
            event.preventDefault();
            //close the menu
            this.closeStartMenuOnClick(event);
        });

        return backID;
    };

    /**
     * @brief this function updates the background
     */
    windowManager.prototype.updateBackground = function() { 
        if(this.backgroundID !== undefined) {
            let background = document.getElementById(this.backgroundID);
            background.setAttribute('src', this.options.background);
        } else {
            this.backgroundID = this.makeBackground();
        }    
    };

    /**
     * This function handles the start menu click.
     * @param {Object} event the click event. 
     * 
     */
    windowManager.prototype.startMenuButtonClick = function(event) {
        //we are consuming the event
        event.preventDefault();
        this.system.startMenu(); // build and show the start menu
    }.bind(this);
        
    /**
     * This function auto closes the start menu.
     * @param {Object} event the click event. 
     * 
     */
    windowManager.prototype.closeStartMenuOnClick = function(event) {
        //check the open windows
        if (Object.keys(this.system.paneList).length !== 0) {
            for (let pane of this.system.paneList) {
                // Check if the clicked element is not an open menu
                if(pane.id === 1){ 
                    let win = document.getElementById(pane.elIDs.containerID);
                    if(!this.system.isDescendant(win, event.target)) { this.system.closeWindow(pane.objID); }
                }
            }
        }
    }.bind(this);

    /**
     * This function loads window from a url or takes data and sends the data to OpenWindow()
     * @param {String\Object} _test the string url or thwe window data
     *
     * @return {Integer} id the window objID
     *
     */
    windowManager.prototype.openWindow = function(_test){
        //did we send in a url?
        if (typeof _test === String) {
            //is there a get data function?
            if (this.options.getDataFn === undefined) {
                console.log("Window Manager: (Warning) No get data function set, Cannot load window data from backend.");
                return -1;
            }
            //get the window data
            let callBack = function(data) {                    
                return this.openWindow.showWindow(data);
            };
            options.getDataFn(_test, callBack);        
        } else { 
            return this.showWindow(_test); 
        }
    };

    /**
     * @brief This function adds a window with page contents to array
     * @param {Object} _data the window data object.
     *
     * @return {Integer} id the window objID
     *
     */
    windowManager.prototype.showWindow = function(_data) {
        let data = Object.assign({}, defaultWindowData, _data);

        //can we open it?
        let canOpen = true;			
        if (data.oneInstance === true) { // if the app can only have one instance
            for (let pane of this.paneList) {
                if(pane.title === data.title){ //find machting title
                    canOpen = false; //found it, set flag, stop loop
                    if(pane.id===1) {
                        this.closeWindow(pane.objID); //toggling the menu
                    }
                } 
            }
        }

        //if we cannot, execute onMultple and return
        if (!canOpen) {
            if (data.oneInstance === true && data.onMultiple !== undefined ) {
                this.executeCodeString(data.onMultiple, _data);
            }
            return -1;
        }            

        //open overlay first
        if(data.isModal) {
            let modalID = this.modalOverlay();
            this.options.taskbar = false;
            //concatenant onExit
            if (data.onExit === undefined) { data.onExit = ""; }
            data.onExit += "system.closeWindow(" + modalID + "); system.options.taskbar = true;";
        }

        this.paneList.push(data);

        let index = this.paneList.length - 1;
        this.paneList[index].index = index;
        //we need a unique objID
        //assume not unique
        let unique = false; 
        while(!unique) {
            this.paneList[index].objID = Math.floor((Math.random() * 9999) + 1); 
            let soFar = true; //assume unique soFar
            for (let i = 0; i < index; i++) { //check each objID
                if(this.paneList[index].objID === this.paneList[i].objID ){
                    soFar = false; //not unique
                }
            }
            if(soFar === true) { //unique, let's stop
                unique = true;
            } 
        }
        //set a unique window id				
        this.paneList[index].windID = this.paneList[index].id + "-obj" + this.paneList[index].objID;
        let windID = this.paneList[index].windID;

        //load required data
        if (data.reqData !== undefined ) {
            let url = this.options.dataurl + "&mode=" + data.reqData;
            let callback = function(reqData) {
                this.paneList[index].data = reqData;
            };
            this.options.getDataFn(url, callback);
        }

        //if scripts needed load them first		
        if(this.paneList[index].requireJS !== undefined) { //does this array exist?
            this.paneList[index].loadedScripts = [];
            for (var js in this.paneList[index].requireJS) { //it does, loop through items in array
                let script = this.paneList[index].requireJS[js];
                let scriptID = this.loadScript(script); //load each script
                this.paneList[index].loadedScripts.push(scriptID);
            }//let that load, we'll come back to it					
        }

        this.paneList[index].elIDs = this.makeWindow(this.paneList[index]);

        callBack = function(windID) {
            let index = -1;
            for (var pane in this.paneList) { //find machting unique objID
                if(this.paneList[pane].windID === windID ){                                        
                    index = pane;
                    break;
                }
            }

            let objParent = document.getElementById(this.paneList[index].elIDs.containerID); //entire window
            //titlebar 
            let objTitle = document.getElementById(this.paneList[index].elIDs.titlebarID);
            //contentpane 
            let objContent = document.getElementById(this.paneList[index].elIDs.contentID);

            //should be customizable
            if (objTitle) { objTitle.style.height = "20px"; }

            //make sure new window on top
            let max = this.getMaxZ();
            objParent.style.zIndex = max;
            this.paneList[index].zindex = max;

            //calculate size
            let yPad = 50;
            let xPad = 10;
            if (this.paneList[index].showTitlebar) { yPad += parseInt(objTitle.style.height.split('p')[0]); }
            if (this.paneList[index].height === undefined || this.paneList[index].height > this.uiBounds.height - yPad ) { this.paneList[index].height = this.uiBounds.height - yPad; }
            if (this.paneList[index].width === undefined || this.paneList[index].width  > this.uiBounds.width - xPad ) { this.paneList[index].width = this.uiBounds.width - xPad; }

            //set size
            objParent.style.backgroundSize = '100% 100%'; // set backgroud image size
            objParent.style.height = this.paneList[index].height + "px";
            objParent.style.width = this.paneList[index].width + "px";
            objContent.style.height = (this.paneList[index].titlebar ? this.paneList[index].height - objTitle.style.height.split('p')[0] : this.paneList[index].height) + "px" ;
            objContent.style.width = this.paneList[index].width + "px";
            let startHeight = this.paneList[index].height;

            //is it a menu?
            if (this.paneList[index].id === 100) { this.menuIndex = index; }

            //get content size
            let contentWidth =  objParent.style.width.split('p')[0];
            let contentHeight = objContent.style.height.split('p')[0];

            //if windows is set to a position
            if ( this.paneList[index].top !== undefined || this.paneList[index].bottom !== undefined ) {
                if (this.paneList[index].top !== undefined) { this.paneList[index].y = this.paneList[index].top; }
                else if(this.paneList[index].bottom !== undefined && this.paneList[index].height !== undefined) { this.paneList[index].y = this.paneList[index].top = this.uiBounds.height - this.paneList[index].bottom - this.paneList[index].height; }
            } else {
                // else center on screen or fill mobile screen
                let trayHeight = this.options.taskbar ? 50 : 0;
                if (startHeight < this.uiBounds.height){ this.paneList[index].y = this.paneList[index].top = (this.uiBounds.height - trayHeight - startHeight) / 2; }
                else { objParent.style.height = this.uiBounds.height + "px"; }
            }
            if ( this.paneList[index].left !== undefined || this.paneList[index].right !== undefined ) {
                if (this.paneList[index].left !== undefined) { this.paneList[index].x = this.paneList[index].left;}
                else if(this.paneList[index].right !== undefined && this.paneList[index].width !== undefined) { this.paneList[index].x = this.paneList[index].left = this.uiBounds.width - this.paneList[index].right - this.paneList[index].width; }
            } else {
                // else center on screen or fill mobile screen
                if (contentWidth < this.uiBounds.width) { this.paneList[index].x = this.paneList[index].left = (this.uiBounds.width - contentWidth) / 2; } 
                else { objParent.style.width = this.uiBounds.width + "px"; }
            }

            //set position
            objParent.style.top = this.paneList[index].y + "px";
            objParent.style.left = this.paneList[index].x + "px";

            //get content size incase values changed
            contentWidth =  objParent.style.width.split('p')[0];
            contentHeight = objContent.style.height.split('p')[0];

            //set content size
            objContent.style.width = contentWidth + "px";
            objContent.style.height = contentHeight + "px";

            //close the start menu on click unless we are the start menu
            if (this.paneList[index].id !== 100 && this.menuIndex !== index) {
                objParent.addEventListener("click", this.closeStartMenuOnClick);
            }

            //border
            if (!this.paneList[index].showBorder) { objParent.style.border = "0px solid transparent"; }

            //transparency
            if(this.paneList[index].transparent) { 
                objContent.style.backgroundColor = "transparent"; 
                objParent.style.backgroundColor = "transparent";
            }

            //round corners
            if(this.paneList[index].roundCorners) {
                objParent.classList.add("rounded-corners");
                objParent.style.setProperty('--border-radius', this.options.borderRadius + "px");
            } else {
                objParent.classList.remove("rounded-corners");
            }

            //tray button
            if(this.paneList[index].showTray) { 
                this.paneList[index].trayIDs = this.makeTrayButton(this.paneList[index]); 
            }

            //todo: add menu an nav widgets

            //start maximized?
            if (this.paneList[index].startMaximized) { this.maxWindow(this.paneList[index].objID); }                

            //make draggable
            if (this.paneList[index].drag === true) {
                this.paneList[index].draggable = new jsWinUI.draggable({
                    element: objParent,
                    handles: objTitle.getAttribute("id"),
                    uiBounds: this.uiBounds,
                    pane: this.paneList[index],
                    system: this,
                    drag: function(event, options){ 
                        //ids
                        let paneID = options.pane.elIDs.containerID;
                        
                        options.pane.x = options.pane.left = this.element.style.left.split('p')[0];
                        options.pane.y = options.pane.top = this.element.style.top.split('p')[0];

                        if (options.pane.onDrag !== undefined) {
                            options.system.executeCodeString(options.pane.onDrag, options.pane); 
                        }                            
                    }
                });
            }                

            //make resizable
            if (this.paneList[index].resize === true) {
                this.paneList[index].resizeable = new jsWinUI.resizable({
                    element: objParent,
                    zindex: this.paneList[index].zindex + 1,
                    minWidth: this.options.minWidth,
                    minHeight: this.options.minHeight,
                    handles: "n, s, e, w, nw, ne, sw, se",
                    uiBounds: this.uiBounds,
                    pane: this.paneList[index],
                    system: this,
                    start: function (event,options){
                        let max = options.system.getMaxZ(options.pane.index);
                        options.pane.zindex = max;
                        this.element.style.zIndex = max;
                        options.zindex = max + 1;
                    },
                    resize: function(event,options,handleName) {
                         //ids
                        let titleID = options.pane.elIDs.titlebarID;
                        let contentID = options.pane.elIDs.contentID;

                        //elements
                        let objTitle = document.getElementById(titleID);
                        let objChild = document.getElementById(contentID);

                        options.pane.left = options.pane.x = this.element.style.left;
                        options.pane.top = options.pane.y = this.element.style.top; 
                        options.pane.width = this.element.style.width;
                        options.pane.height = this.element.style.height;
                        objChild.style.width = this.element.style.width;
                        objChild.style.height = this.element.style.height;
                        objTitle.style.width = this.element.style.width;
                        
                        if (options.pane.onResize !== undefined) { 
                            options.system.executeCodeString(options.pane.onResize, options.pane); 
                        }
                    }
                });
            }              

            //show the window
            jsWinUI.fadeIn(objParent, 'fast');
            //show the tray
            if(this.paneList[index].showTray && this.paneList[index].trayIDS) {
                //sanity, does it really exist?
                let tray = document.getElementById(this.paneList[index].trayIDS.trayID);
                if (tray) {
                    jsWinUI.fadeIn(tray, 'fast');        
                }
            }                

            if(this.paneList[index].onLoad) {                                        
                //make sure scripts are loaded in case onLoad function needs them
                setTimeout(function() { 
                    //execute onLoad
                    this.executeCodeString(this.paneList[index].onLoad, this.paneList[index]); 
                },10); 
            }

        }.bind(this);

        setTimeout(function (){callBack(windID);},100);

        return this.paneList[index].objID;            
    };

    /**
     * @brief This function makes the window and adds it to the DOM
     * @param {object} the array indice for this window pane 
     */
    windowManager.prototype.makeWindow = function(pane) {
        let containerID = "app" + this.appID + "-window" + pane.windID;
        let titlebarID = "app" + this.appID + "-titlebar" + pane.windID;
        let contentID = "app" + this.appID + "-content" + pane.windID;
        let exitButtonID = "app" + this.appID + "-exitButton" + pane.windID;
        let minButtonID = "app" + this.appID + "-minButton" + pane.windID;
        let maxButtonID = "app" + this.appID + "-maxButton" + pane.windID;

        let bookmarkTitle = pane.title + " - " + this.options.projectTitle + "&app=" + pane.title;

        let title = HTMLMAKER.makeString({
            tag: 'span',
            style: 'float: left; text-align: left',
            innerHTML: ( (pane.canBookmark) ? bookmarkTitle : pane.title)
        });

        let exitButton = HTMLMAKER.makeString({
            tag: 'button',
            id: exitButtonID,
            style: 'float: right; text-align: right',
            innerHTML: 'X'
        });

        let maxButton = HTMLMAKER.makeString({
            tag: 'button',
            id: maxButtonID,
            style: 'float: right; text-align: right',
            innerHTML: '&#9635;'
        });

        let minButton = HTMLMAKER.makeString({
            tag: 'button',
            id: minButtonID,
            style: 'float: right; text-align: right',
            innerHTML: '&#9644;'
        });

        let titlebar = HTMLMAKER.makeString({
            tag: 'div',
            id: titlebarID,
            class: this.options.themePrefix + "-title-bar",
            innerHTML: title + ( (pane.showExit)?exitButton:"") + ( (pane.showMaximize)?maxButton:"") + ( (pane.showMinimize)?minButton:"")
        });

        let body = HTMLMAKER.makeString({
            tag: 'div',
            id: contentID,
            class: this.options.themePrefix + "-pane-body",
            innerHTML: pane.content
        });

        let windowPane = HTMLMAKER.makeElement(HTMLMAKER.makeString({
            tag: 'div',
            id: containerID,
            style: 'display: none;',
            class: this.options.themePrefix + "-window",
            innerHTML: ( (pane.showTitlebar)?titlebar:"") + body
        }));

        this.element.appendChild(windowPane);

        //set up data binding
        this.setupDataBinding(document.getElementById(contentID));

        //set up click binding
        this.setupClickBinding(document.getElementById(contentID), pane, (pane.id === 1) );

        //attach click handlers, get elements first for sanity            
        let exitButtonEl = document.getElementById(exitButtonID);
        let maxButtonEl = document.getElementById(maxButtonID);
        let minButtonEl = document.getElementById(minButtonID);

        if (exitButtonEl) { 
            exitButtonEl.addEventListener("click", () => {
                this.exitButtonClick(event, pane.objID);
            });
        }
        if (maxButtonEl) { 
            maxButtonEl.addEventListener("click", () => {
                this.maxButtonClick(event, pane.objID);
            });
        }
        if (minButtonEl) { 
            minButtonEl.addEventListener("click", () => {
                this.minButtonClick(event, pane.objID);
            });
        }

        return {
            containerID: containerID,
            titlebarID: titlebarID,
            contentID: contentID,
            exitButtonID: exitButtonID,
            maxButtonID: maxButtonID,
            minButtonID: minButtonID
        };
    };
        
    /**
     * @brief this function puts a string of text on the clipboard
     * @param {string} text the text to copy  
     **/
    windowManager.prototype.copyTextToClipboard = function(text) {
        if (!navigator.clipboard) {
            //fall back
            let textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";  // To avoid scrolling to bottom
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                let successful = document.execCommand("copy");
                let msg = successful ? "successful" : "unsuccessful";
                console.log("WindowManager: (NOTICE) Fallback copy was " + msg);
            } catch (err) {
                console.error("WindowManager: (WARNING) Fallback copy Unable to copy text", err);
            }
            document.body.removeChild(textArea);
            return;
        }
        navigator.clipboard.writeText(text).then(function() {
            console.log("WindowManager: (NOTICE) Text copied to clipboard: " + text);
        }, function(err) {
            console.error("WindowManager: (WARNING) Unable to copy text to clipboard: " + err);
        });
    };

    /**
     * @brief This function makes the window tray button and adds it to the DOM
     * @param {object} the array indice for this window pane 
     */
    windowManager.prototype.makeTrayButton = function(pane) {
        //id
        let trayID = "app" + this.appID + "-tray" + pane.windID;
        let restoreButtonID = "app" + this.appID + "-tray-restore" + pane.windID;
        let exitButtonID = "app" + this.appID + "-tray-exit" + pane.windID;

        //restore button
        let restoreButton = HTMLMAKER.makeString({
            tag: 'button',
            id: restoreButtonID,
            style: 'float: left; overflow: hidden; white-space: nowrap; border: none; background: none; text-align: left',
            innerHTML: pane.title
        });

        //exit button
        let exitButton = HTMLMAKER.makeString({
            tag: 'button',
            id: exitButtonID,
            style: 'float: right; border: none; background: none; text-align: right',
            innerHTML: 'X'
        });


        //tray element
        let tray = HTMLMAKER.makeElement(HTMLMAKER.makeString({
            tag: 'div',
            id: trayID,
            style: 'position: relative; float: left; padding: 1px; overflow: hidden;',
            innerHTML: HTMLMAKER.makeString({
                tag: 'div',
                class: this.options.themePrefix + "-tray-bar",
                innerHTML: restoreButton + exitButton
            })
        }));

        //add to dom
        document.getElementById(this.taskbarIDs.trayContainerID).appendChild(tray);
        let tempRect = tray.getBoundingClientRect();
        tray.style.minWidth = tempRect.width + "px";
        //attach event listeners
        document.getElementById(restoreButtonID).addEventListener("click", () => {
            this.minButtonClick(event, pane.objID);
        });
        document.getElementById(exitButtonID).addEventListener("click", () => {
            this.exitButtonClick(event, pane.objID);
        });

        //return the ids
        return {
            trayID: trayID,
            restoreButtonID: restoreButtonID,
            exitButtonID: exitButtonID
        };
    };
        
    /**
     * This function handles the window's max button click.
     * @param {Object} event the click event.
     * @param {Integer} the window object ID
     * 
     */
    windowManager.prototype.maxButtonClick = function(event, objID) {
        //we are consuming the event
        event.preventDefault();
        this.system.maxWindow(objID);
    }.bind(this);
        
    /**
     * This function handles the window's restore button click.
     * @param {Object} event the click event.
     * @param {Integer} the window object ID
     * 
     */
    windowManager.prototype.minButtonClick = function(event, objID) {
        //we are consuming the event
        event.preventDefault();
        this.system.minWindow(objID);
    }.bind(this);

    /**
     * This function handles the window's exit button click.
     * @param {Object} event the click event.
     * @param {Integer} the window object ID
     * 
     */
    windowManager.prototype.exitButtonClick = function(event, objID) {
        //we are consuming the event
        event.preventDefault();
        this.system.closeWindow(objID);
    }.bind(this);
        
    /**
     * This function closes a window.
     * @param {String} _winObjID the objID of the window.
     * @param {String|Object} _data the url or data of the next window to open. OPTIONAL
     *
     */
    windowManager.prototype.closeWindow = function(_winObjID, _data) {
        for (let [index, pane] of this.paneList.entries()) {
            // find matching unique objID
            if (pane.objID === _winObjID) {
                //ids
                let paneID = pane.elIDs.containerID;
                let trayID = (pane.trayIDs) ? pane.trayIDs.trayID : "";

                //elements
                let paneEl = document.getElementById(paneID);
                let trayEl = document.getElementById(trayID);

                //sanity, if it exist, hide it
                if (paneEl) { jsWinUI.fadeOut(paneEl, 'fast'); }
                if (trayEl) { jsWinUI.fadeOut(trayEl, 'fast'); }

                if (pane.requireJS !== undefined) {                    
                    for (let id of pane.loadedScripts) {
                        document.getElementById(id).remove();
                    }
                }

                //execute onExit
                if(pane.onExit !== "" && pane.onExit !== undefined) {
                   this.executeCodeString(pane.onExit, pane);
                }

                //was this the start menu?
                if (pane.id === 100) { this.menuIndex = -1; }

                //draggable
                if (pane.draggable !== undefined) { pane.draggable.remove(); }

                //resizeable
                if (pane.resizeable !== undefined) { pane.resizeable.remove(); }

                //remove it
                this.paneList.splice(index, 1);
                if (paneEl || trayEl) {
                    //wait for fade out
                    setTimeout( this.removePaneElements(paneEl,trayEl),250);                        
                }
                // fix indexes
                for (let [i, updatedPane] of this.paneList.entries()) {
                    updatedPane.index = i;
                }

                //open the next window
                if (_data) {
                    this.showWindow(_data);
                }

                break; // found it, took it out, stop loop
            }
        }
    };
        
    /**
     * This function removes window DOM elements.
     * @param {Element} paneEl the window element.
     * @param {Element} trayEl the window's tray button element.
     */
    windowManager.prototype.removePaneElements = function(_paneEl, _trayEl) {
        if (_paneEl) { _paneEl.remove(); }
        if (_trayEl) { _trayEl.remove(); }     
    };
        
    /**
     * This function maximizes or restores a window.
     * @param {String} _winObjID the objID of the window.
     *
     */
    windowManager.prototype.maxWindow = function(_winObjID) {
        for (let [index,pane] of this.paneList.entries()) { //find machting unique objID
            if(pane.objID === _winObjID ){
                //ids
                let paneID = pane.elIDs.containerID;
                let titleID = pane.elIDs.titlebarID;
                let contentID = pane.elIDs.contentID;

                //elements
                let objParent = document.getElementById(paneID); //entire window
                let objTitle = document.getElementById(titleID);
                let objChild = document.getElementById(contentID);


                //sanity
                if(pane.big === undefined) {
                    pane.big = false;
                }

                //toggle size
                //go big
                if(pane.big === false) {
                    pane.restoreRect =  new jsWinUI.rectangle( { x: pane.x, y: pane.y, width: pane.width, height: pane.height });
                    pane.big = true;
                    pane.savebig = true;
                    if (pane.min === true) {
                        pane.savemin = true;
                        pane.min = false;
                    }

                    this.onViewportResize();	//resizer method will handle the rest

                    if(pane.onMaximize !== "" && pane.onMaximize !== undefined) {
                        this.executeCodeString(pane.onMaximize, pane);
                    }
                } else { //restore
                    pane.big = false;
                    pane.savebig = false;

                    //reset the size
                    objParent.style.top = pane.restoreRect.top + "px";
                    objParent.style.left = pane.restoreRect.left + "px";
                    objParent.style.width = pane.restoreRect.width + "px";
                    objParent.style.height = pane.restoreRect.height + "px";

                    pane.top = pane.y = pane.restoreRect.top;
                    pane.left = pane.x = pane.restoreRect.left;
                    pane.height = pane.restoreRect.height;
                    pane.width = pane.restoreRect.width;

                    //reset the size
                    objChild.style.width = pane.restoreRect.width + "px";
                    objChild.style.height = (pane.restoreRect.height - objTitle.style.height.split('p')[0]) + "px";

                    pane.restoreRect = undefined; //reclaim

                    if(pane.onRestore !== "" && pane.onRestore !== undefined) {
                        this.executeCodeString(pane.onrestore, pane);
                    }
                }
                let max = this.getMaxZ(index);
                objParent.style.zIndex = max;
                if (pane.menus !== undefined) {
                    for (let menu of pane.menus){
                        menu.Refresh();
                    }
                }
                break; //found it, stop loop
            }
        }
    };
        
    /**
	 * This function minimizes a window.
	 * @param {String} _winObjID the objID of the window.
	 *
	 */
	windowManager.prototype.minWindow = function(_winObjID) {
		for (let [index, pane] of this.paneList.entries()) { //find machting unique objID
			if(pane.objID === _winObjID ){ 
				if(pane.min === true) {
					let objParent = document.getElementById(pane.elIDs.containerID); //entire window
                    //make sure new window on top
                    max = this.getMaxZ(index);
                    objParent.style.zIndex = max;
                    //fade in
                    jsWinUI.fadeIn(objParent, "fast");
                    //not min
					pane.min = false;
                    //handler
                    if(pane.onRestore !== "" && pane.onRestore !== undefined) {
                        this.executeCodeString(pane.onrestore, pane);
                    }
					break; //found it, added it back, stop loop
				} else {
					let objParent = document.getElementById(pane.elIDs.containerID); //entire window
					//fade in
                    jsWinUI.fadeOut(objParent, "fast");
                    //is min
					pane.min = true;
                    //handler
                    if(pane.onMinimize !== "" && pane.onMinimize !== undefined) {
                        this.executeCodeString(pane.onMinimize, pane);
                    }
				}
				//refresh the menus
				if (pane.hasMenu) {
					for (let menu of pane.menus){
						menu.Refresh();
					}
				}

				break; //found it, stop loop
			}
		}
	};
    
    /*
     * @brief This function executes dynamically loaded code strings
     * @param {string} _codeString the code to ececute
     * @param {object} _pane the window data for the window we are in
     */
    windowManager.prototype.executeCodeString = function(_codeString = "", _pane = undefined) {
        if (_codeString !=="") {
            let script = HTMLMAKER.makeElement(HTMLMAKER.makeString({
                tag: 'script',
                text: `
                     var dynamicFunction = function(system, pane) {
                        "use strict";
                        ${_codeString};
                    }
                `
            }));

            this.element.appendChild(script);
            dynamicFunction(this,_pane);
            script.remove();
            dynamicFunction = undefined;
        }
    };
        
    /**
     * @brief This function loads a script. We don't want to inudate the users browser from the start.
     * @param {String} url the url of the script to load.
     * @param {String} callback a code string to be evaluated on load. OPTIONAL.
     *
     * @return {Integer} scriptID the id of the script element. 
     *
     */
    windowManager.prototype.loadScript = function(_url, _callback = "", _pane = undefined) {
        let scriptID = "app" + this.appID + "-sctipt" + Math.floor((Math.random() * 999) + 1);
        let script = document.createElement("script");

        script.type = "text/javascript";
        script.src = _url;
        script.id = scriptID;

        // Bind the window.onload to the script.onload
        var onLoadCallback = function() {
            if (_callback !== "") {
                this.executeCodeString(_callback, _pane);
            }
        };

        script.onload = onLoadCallback;
        document.head.appendChild(script);

        return scriptID;
    }  ; 

    /**
     * @brief this function sets up basic click binding reactivity
     * @param {Element} _element - The HTML element to bind properties of chileren in.
     */
    windowManager.prototype.setupClickBinding = function(_element, _pane = undefined, isStartMenu = false) {
        const targetElements = _element.querySelectorAll(`[jsw-click]`);
        if (targetElements) {
            // Call the separate function to bind the property for each matching element
            targetElements.forEach(targetElement => {
                targetElement.addEventListener('click', () =>  {
                    this.executeCodeString(targetElement.getAttribute('jsw-click'), _pane);
                    if (isStartMenu) { 
                        for (let pane of this.paneList) {
                            if(pane.id === 1){
                                this.closeStartMenuOnClick(pane.objID); 
                            }
                        }
                    }
                });
            });
        }
    };
        
    /**
     * @brief this function sets up data binding reactivity
     * @param {Element} _element - The HTML element to bind properties of chileren in.
     */
    windowManager.prototype.setupDataBinding = function(_element) {
        const data = this.options.data;

        // Find all elements with jsw-bind attribute
        const elementsWithBinding = _element.querySelectorAll('[jsw-bind]');

        elementsWithBinding.forEach(targetElement => {
            // Extract property path from jsw-bind attribute
            const bindAttribute = targetElement.getAttribute('jsw-bind');
            const propertyPath = bindAttribute.split('.');

            // Traverse data object based on property path
            let currentData = data;
            for (const property of propertyPath) {
                if (currentData.hasOwnProperty(property)) {
                    currentData = currentData[property];
                } else {
                    // Property not found, exit loop
                    currentData = null;
                    break;
                }
            }

            // Bind property if found
            if (currentData !== null) {
                this.bindProperty(data, targetElement, propertyPath[propertyPath.length - 1]);
            }
        });
    };
        
    /**
     * @brief Sets up data binding for a property of a data object.
     * 
     * @param {object} dataObject - The data object containing the property to bind.
     * @param {Element} targetElement - The HTML element to bind the property to.
     * @param {string} key - The name of the property to bind.
     */
    windowManager.prototype.bindProperty = function(dataObject, targetElement, key) {
        // Check if the targetElement is an input element
        const isInput = targetElement.tagName.toLowerCase() === 'input';

        if (isInput) {
            const inputType = targetElement.type.toLowerCase();

            if (inputType === 'radio' || inputType === 'checkbox') {
                // Set initial checked state for radio buttons and checkboxes
                targetElement.checked = dataObject[key];

                // Set up a getter/setter for the bound property
                Object.defineProperty(dataObject, key, {
                    get() {
                        return targetElement.checked;
                    },
                    set(newValue) {
                        targetElement.checked = newValue;
                    },
                    enumerable: true,
                    configurable: true
                });

                // Listen for change events to update the data object
                targetElement.addEventListener('change', function(event) {
                    dataObject[key] = event.target.checked;
                });
            } else {
                // Set initial value for other input types
                targetElement.value = dataObject[key];

                // Set up a getter/setter for the bound property
                Object.defineProperty(dataObject, key, {
                    get() {
                        return targetElement.value;
                    },
                    set(newValue) {
                        targetElement.value = newValue;
                    },
                    enumerable: true,
                    configurable: true
                });

                // Listen for input events to update the data object
                targetElement.addEventListener('input', function(event) {
                    dataObject[key] = event.target.value;
                });
            }
        } else {
            // Set initial text content for non-input elements
            targetElement.innerText = dataObject[key];

            // Set up a getter/setter for the bound property
            Object.defineProperty(dataObject, key, {
                get() {
                    return targetElement.innerText;
                },
                set(newValue) {
                    targetElement.innerText = newValue;
                },
                enumerable: true,
                configurable: true
            });
        }
    };

        
    /**
     * This function checks if an element is a descendant of another element.
     * @param {Element} _parent the parent element.
     * @param {Element} _child the supposed child element.
     *
     * @return {Boolean} result the result of the check 
     *
     */
    windowManager.prototype.isDescendant = function(_parent, _child) {
        //all descendants of _parent
        let descendants = _parent.getElementsByTagName('*');

        //look for _child
        for (let i = 0; i < descendants.length; i++) {
            if (descendants[i] === _child) {
                //found it, it is a descendant
                return true;
            }
        }

        //did not find it, not a descendant
        return false;
    };
        
    /**
     * @brief This function bases all z-indexes to a minimum then returns the highest.
     * @param {Integet} _i the index of the window gaining focus. nothing is sent for a new window. OPTIONAL.
     *
     * @return {Integer} zindex the z-index of the top window. 
     *
     */
    windowManager.prototype.getMaxZ = function(_i = -1) {
        let i = _i;
        // Define the lowest z-index value
        let lowestZIndex = 100;

        // Initialize max to a value lower than lowestZIndex
        let max = lowestZIndex - 1;
        let topIndex = -1;

        // Extract and sort z-indexes
        let zIndexes = [];
        for (let index in this.paneList) {
            let pane = this.paneList[index];
            let z = parseInt(document.getElementById(pane.elIDs.containerID).style.zIndex, 10);
            if (!isNaN(z)) {
                zIndexes.push(z);
            }
        }
        zIndexes.sort((a, b) => a - b);

        // Reset z-indexes starting from lowestZIndex
        zIndexes.forEach((z, index) => {
            let newZIndex = lowestZIndex + index;
            let pane = this.paneList[index];
            // Set the new z-index for the corresponding window
            document.getElementById(pane.elIDs.containerID).style.zIndex = newZIndex;
            this.paneList[index].zindex = newZIndex;
        });

        //find the top.
        for (let index in this.paneList) {
            let pane = this.paneList[index];
            let z = parseInt(document.getElementById(pane.elIDs.containerID).style.zIndex, 10);
            if (!isNaN(z) && z > max) { 
                max = z; topIndex = index; 				
            }
        }

        //did we gain focus?
        let gainFocus = (topIndex !== i);

        // Execute onFocus and loseFocus if applicable
        if (gainFocus) { 
            for (let index in this.paneList) {
                let pane = this.paneList[index];
                if (index===i && pane.onFocus !== undefined && pane.onFocus !== "" && i !== -1) { this.executeCodeString(pane.onFocus, pane); }
                else if (index!==i && pane.loseFocus !== undefined && pane.loseFocus !== "") { this.executeCodeString(pane.loseFocus, pane); }
            }
        }

        if (i===-1) {max++;}
        return gainFocus ? max + 1 : max;
    };
        
    //built in windows
    /**
     * @brief This function defines the start menu
     * @param {object} the array indice for this window pane 
     */
    windowManager.prototype.startMenu = function(pane) {
        let box = {};

        let menuID = "mainmenu-" + this.appID;

        if (this.options.startMenuItems.length === 0) {
            console.log("Window Manager: (WARNING) no start menu items.");
            return -1;
        }

        let buttons = this.options.startMenuItems.map(item => {
            return HTMLMAKER.makeString({
                tag: 'td',
                width: '50%',
                innerHTML: HTMLMAKER.makeString({
                    tag: 'div',
                    class: 'center-container',
                    innerHTML: HTMLMAKER.makeString({
                        'tag': 'button',
                        'jsw-click': item.click,
                        'text': item.name

                    })
                })
            });                
        });

        let tableRows = "";
        let rowIndex = 0;
        for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex=buttonIndex+2) {
            let tdata = buttons[buttonIndex];
            if (buttonIndex+1 < buttons.length) {
                tdata += buttons[buttonIndex+1];
            }
            tableRows += HTMLMAKER.makeString({
                tag: 'tr',
                height: '55px',
                innerHTML: tdata
            });
        }

        let mainmenu = HTMLMAKER.makeString({
            tag: 'div',
            id: menuID,
            class: "container-fluid center-container",
            innerHTML: HTMLMAKER.makeString({
                tag: 'table',
                width: '100%',
                innerHTML: tableRows
            })
        });

        let title = HTMLMAKER.makeString({
            tag: 'div',
            class: 'center-container',
            innerHTML: HTMLMAKER.makeString({
                tag: 'h4',
                text: this.options.projectTitle
            })
        });

        box.content = title + mainmenu; 
        box.title = "Start Menu";
        box.height = 200;
        box.width = 320;
        box.left = 2;
        box.bottom = 2;
        box.drag = false;
        box.transparent = false;
        box.resize = false;
        box.showTitlebar = false;
        box.oneInstance = true;
        box.roundCorners = true;
        box.showTray = false;
        box.id = 1;
        return this.openWindow(box);
    };
        
    /**
     * @brief This function opens a blocking modal overlay.
     *
     * @return {Integer} objID the id of the overlay. 
     */
    windowManager.prototype.modalOverlay = function() {
        let box = [];
        let htmlString = "<div id='overlay' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); z-index: 2000;'></div>";

        box.content = htmlString;        
        box.title = "Overlay";
        box.height = 0;
        box.width = 0;
        box.top = 0;
        box.left = 0;
        box.drag = false;
        box.showTitlebar = false;
        box.oneInstance = true;
        box.showTray = false;
        box.oneInstance = true;
        box.roundCorners = true;
        box.showBorder = false;
        box.transparent = true;
        box.id = 2;
        return this.openWindow(box);
    };
        
    /**
     * @brief This function opens a dialog box.
     *
     * @param {String} _msg the message to show
     * @param {Boolean} _modal is this a modal window? (Optional)
     * @return {Integer} objID the id of the dialog box. 
     */
    windowManager.prototype.dialogBox = function(_msg, _modal = false) {
        let box = [];
        let message = "<br />" + _msg + "<br /><br />";
        let htmlString = HTMLMAKER.makeString({
            'tag': 'div', 'innerHTML': HTMLMAKER.makeString({
                'tag': 'div', 'class': 'center-container', 'innerHTML': message + HTMLMAKER.makeString({
                    'tag': 'button', 'jsw-click': 'system.closeWindow(pane.objID)', 'text': 'Continue'
                })
            })
        });

        box.content = htmlString;        
        box.title = "Alert";
        box.height = 130;
        box.width = 250;
        box.top = 100;
        box.drag = true;
        box.transparent = false;
        box.resize = false;
        box.showMaximize = false;
        box.oneInstance = true;
        box.roundCorners = true;
        box.isModal = _modal;
        box.id = 3;
        return this.openWindow(box);
    };
        
    /**
     * @brief This function opens a yes/no box.
     *
     * @param {String} _msg the message to show
     * @param {Function} _yesFN fuction to run on yes click
     * @param {Function} _noFN (optional) fuction to run on no click
     * @param {Boolean} _modal  (optional) is this a modal window?
     * @return {Integer} objID the id of the dialog box. 
     */
    windowManager.prototype.yesNoBox = function(_msg, _yesFN, _noFN = function(){}, _modal = false) {
        let box = [];
        let yesFN = _yesFN;
        let noFN = _noFN;
        let message = "<br />" + _msg + "<br /><br />";

        windowManager.yesNoBox.reply = function(response) {                    
            if(response === "yes") { yesFN(); }
            if(response === "no") { noFN(); }
        };

        let htmlString = HTMLMAKER.makeString({
            'tag': 'div', 'innerHTML': HTMLMAKER.makeString({
                'tag': 'div', 'class': 'center-container', 'innerHTML': message + HTMLMAKER.makeString({
                    'tag': 'button', 'jsw-click': "system.closeWindow(pane.objID); system.yesNoBox.reply('no');", 'text': 'Cancel'
                }) + '&nbsp;&nbsp;&nbsp;' + 
                HTMLMAKER.makeString({
                    'tag': 'button', 'jsw-click': "system.closeWindow(pane.objID); system.yesNoBox.reply('yes');", 'text': 'Continue'
                }) 
            })
        });

        box.content = htmlString;        
        box.title = "Confirm";
        box.height = 130;
        box.width = 250;
        box.top = 100;
        box.drag = true;
        box.resize = false;
        box.showMaximize = false;
        box.oneInstance = true;
        box.roundCorners = true;
        box.isModal = _modal;
        box.id = 4;
        return this.openWindow(box);                
    };
        
    /**
     * @brief This function opens a question box.
     *
     * @param {String} _msg the question to show
     * @param {Function} _yesFN fuction to run on a correct or any answer if no compare is set
     * @param {Function} _noFN (optional) fuction to on an incorrect answer
     * @param {String} _compare value to compare to
     * @param {Boolean} _modal  (optional) is this a modal window?
     * @return {Integer} objID the id of the dialog box. 
     */
    windowManager.prototype.questionBox = function(_msg, _yesFN, _noFN = function(){}, _compare = undefined, _modal = false) {
        let box = [];
        let yesFN = _yesFN;
        let noFN = _noFN;
        let message = "<br />" + _msg + "<br />";

        windowManager.questionBox.reply = function(objID) {
            let value = $("#question-" + objID).val();
            if  (_compare===undefined) {
                closeWindow(objID);
                yesFN(value);
            } else {
                if(_compare === value) {
                    $("#error-" + objID).hide();
                    closeWindow(objID);
                    yesFN(value);
                } else {
                    $("#error-" + objID).show();
                    noFN(value, objID);
                }
            }

        };

        let htmlString = HTMLMAKER.makeString({
            'tag': 'div', 'innerHTML': HTMLMAKER.makeString({
                'tag': 'div', 'class': 'center-container', 'innerHTML': message + '<br /><br />' +
                HTMLMAKER.makeString({
                    'tag': 'input', 'type':'text', 'style': 'width: 100px;', 'id': 'question-{{pane.objID}}'
                }) + '&nbsp;&nbsp;&nbsp;' +
                HTMLMAKER.makeString({
                    'tag': 'button', 'jsw-click': 'system.questionBox.reply(pane.objID)', 'text': 'Continue'
                }) + '<br /><br />' +
                HTMLMAKER.makeString({
                    'tag': 'span', 'id': 'error-{{pane.objID}}', 'style': 'display: none', 'class': 'error', 'text': 'Please try again.'
                })
            })
        });

        box.content = htmlString;        
        box.title = "Question";
        box.height = 180;
        box.width = 300;
        box.top = 100;
        box.drag = true;
        box.resize = false;
        box.showMaximize = false;
        box.oneInstance = true;
        box.roundCorners = true;
        box.isModal = _modal;
        box.id = 5;
        return this.openWindow(box);
    };
        
     /**
     * @brief This function gets the jsWin version.
     *
     * @return {string} the version string 
     *
     */
    windowManager.prototype.version = function() { 
        console.log("jsWin Version: " + defaultOptions.version);
        return defaultOptions.version; 
    };      
    
    //init
    this.system = new windowManager(_elementID, _startFN);
    
    //run the start function
    if (typeof _startFN === "function") {
        _startFN(this.system);
    }
    
    //return only the id
    return this.system.appID;
}