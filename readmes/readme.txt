jsWin Library Crawford Computing Copyright 2024 by Jonathan Crawford                                                                                   
This is a windowing library for websites.                                                                                                              
                                                                                                                                                        
To create a Window Manager instance use:                                                                                                              
  let wm = new jsWin(elementID,options, function(system) { //code here, system.options.background = "", system.options.openWindow(data);  })          
Where elementID is the ID of the div that will house the Window Manager, and options are the options. wm is now equal to the internal appID           
                                                                                                                                                        
The following are the default options:                                                                                                                
  defaultOptions = {                                                                                                                                    
    minHeight: 200,                                                                                                                                     
    minWidth: 200,                                                                                                                                      
    getDataFn: undefined,                                                                                                                               
    dataURL: "",                                                                                                                                        
    taskbar: false,                                                                                                                                     
    taskbarItems: ['start','trays','details','datetime'],                                                                                               
    customTaskbarItems: [],                                                                                                                             
    startMenuItems: [],                                                                                                                                 
    icons: [], //not implemented                                                                                                                        
    background: '',                                                                                                                                     
    themes: {'light': 'light', 'blue': 'blue'},                                                                                                         
    themePrefix: 'light',                                                                                                                               
    borderRadius: '10',                                                                                                                                 
    projectTitle: 'jsWin',                                                                                                                              
    version: "0.0.1",                                                                                                                                   
    data: {};                                                                                                                                           
  };                                                                                                                                                    
                                                                                                                                                        
  minHeight and minWidth: the smallest the windows can be resized                                                                                       
  getDataFn: send in your getData(url, callback) function, it should take the url and a function to call upon response.                                 
    With this the window data for apps can be stored server-side and loaded only when needed.                                                           
    You can also use this to have your apps work with data from your database.                                                                          
  dataURL: the data url to send to getDataFn. this can be "site.com/getdata.php&sentinel=" + sentinel, the library will add what is needed.             
    For example window[reqData] = "getSettings", this will add &mode=getSettings. check for mode in your php, and return the json data to use.          
    To access the data you can find it in pane.data from any window app. Learn more in the window creation readme.                                      
  taskbar: do you want to show a taskbar?                                                                                                               
  taskbarItems: what you want and the order of the taskbar items, an array of strings.                                                                  
    valid items are:                                                                                                                                    
      "start": start menu button                                                                                                                        
      "buttons": the buttons defined in taskbarButtons                                                                                                  
      "trays": the window tray buttons                                                                                                                  
      "details": this shows project name and version                                                                                                    
      "datetime": this shows the date and time                                                                                                          
  customtaskbaritems: an array of item detail lists [{name:"",click:"",content: htmlStr }[,{}...] ] this defines custom items for the taskbar           
  startMenuItems: [ {name: "", click:""} [,{}...] ] this populates the start menu                                                                       
  icons: an array of icon detail lists [{name:"",image:"",click:""[,position: {x:0,y:0}]}[,{}...] ].                                                    
    If no position is set, they will be positioned in order top-left to bottom-left then working to the right.                                          
  background: url to a background image                                                                                                                 
  themes: the included themes, you can send in any custom themes here. check jsWin.css for instructions on creating themes, and/or make a theme changer 
  themePrefix: what theme to use                                                                                                                        
  borderRadius: the radius to use if the window.roundCorners flag is set to true                                                                        
  projectTitle: your project or website name                                                                                                            
  version: your project version, you can always get the jsWin version (from defaultOptions) with jsWin.version() even if you set a version in options.  
  data: data to be bound to elements goes here. (See below)                                                                                             
                                                                                                                                                        
  These are reactive! If you change an option later (from within the function you sent in), the window manager will respond, for example:               
    system.options.background = newImageUrl; // this will change the background                                                                         
    system.options.themePrefix = blue; // will change the theme dynamically to blue for all windows and the taskbar.                                    
                                                                                                                                                        
  For taskbar items.content and in window content, you can use the following:                                                                           
    jsw-bind="", two-way binding: this just adds a little more functionality. Usage:                                                                    
      <span jsw-bind="variable"></span>                                                                                                                 
      wm.options.data.variable = value;                                                                                                                 
    --OR--                                                                                                                                              
      <span jsw-bind="myObject.varable"></span>                                                                                                         
      wm.options.data.myObject.myVaraible = value;                                                                                                      
    Either will put the value as the innerText, (or value for input fields) and will react like Angular if changed.                                     
    For example, a user name entry app, you can do wm.options.data.user = {fName: "Jon", lName: "Doe" }; and <input type="text" jsw-bind="user.fname"/> 
  jsw-click="" and thin in here has acces to system, and in a window, the window object or "pane"                                                       
    example: <button jsw-click="system.dialogBox("Hello World");">Say Hi!</button>                                                                      
                                                                                                                                                        
 In startMenuItems and customTaskbarItems, the click property has access to system.                                                                     
 In customeTaskbarItems, if you add a click property the system will make it a button. You can skip the click property and in content use jsw-click     
                                                                                                                                                        