
/**Functions having to do with editing color of classes and assignments
 * Note: functions for saving color are located in JSOmGetsAndSets.js
 */

//needed for colorpicker
// input is text in format "rgb(R,G,B)" 
function rgbToHex(RGBcolor) {
    var inputSubstring = RGBcolor.substring(4,RGBcolor.length-2);
    var RGBstringArray = inputSubstring.split(",");
    var RGBnum = [];

    RGBstringArray.forEach(str => {
        RGBnum.push(Number(str));
      });

    return "#" + ((1 << 24) + (RGBnum[0] << 16) + (RGBnum[1] << 8) + RGBnum[2]).toString(16).slice(1);
}

function parseColor(sixDigitHexString){ //converts 6 digit hex color to array [R, G, B]
    var m = sixDigitHexString.match(/^#([0-9a-f]{6})$/i)[1];
    if(m){
        return[
            parseInt(m.substr(0,2),16),
            parseInt(m.substr(2,2),16),
            parseInt(m.substr(4,2),16)
        ];
    }
}

//takes input of array in format [R, G, B]
//adds 20 to each rgb value to make lighter version
function lightColor(RGB){ 
    var lighter = [RGB[0]+40, RGB[1]+40, RGB[2]+40];
    if(lighter[0] > 255){
        lighter[0] = 255;
    }
    if(lighter[1] > 255){
        lighter[1] = 255;
    }
    if(lighter[2] > 255){
        lighter[2] = 255;
    }
    return [lighter[0], lighter[1], lighter[2]];
}

//takes input of array in format [R, G, B]
//subtracts 20 to each rgb value to make darker version
function darkColor(RGB){ 
    var darker = [RGB[0]-40, RGB[1]-40, RGB[2]-40];
    if(darker[0] < 0){
        darker[0] = 0;
    }
    if(darker[1] < 0){
        darker[1] = 0;
    }
    if(darker[2] < 0){
        darker[2] = 0;
    }
    return [darker[0], darker[1], darker[2]];
}


//this function is called when loading a class from localstorage
//this function is called in populate page and laods the class with the color stored in local storage
function loadClassColor(className){
    classID = className.replaceAll(" ", "_");
    //console.log(classID);
    var classObj = getClass(className);
    var classColor = classObj.color;

    //parsing rgb string into array of numbers
    var inputSubstring = classColor.substring(4,classColor.length-1);
    var RGBstringArray = inputSubstring.split(",");
    var RGB = [];

    RGBstringArray.forEach(str => {
        RGB.push(Number(str));
    });

    var lighter = lightColor(RGB);
    document.getElementById(classID+'Section').style.backgroundColor = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
    document.getElementById(classID+'ClassAssignments').style.backgroundColor = "rgb("+lighter[0]+","+lighter[1]+","+lighter[2]+")";
    document.getElementById(classID+'AssignmentsOutline').style.backgroundColor = "rgb("+lighter[0]+","+lighter[1]+","+lighter[2]+")";
    var darker = darkColor(RGB);
    document.getElementById(classID+'AddAssignment').style.backgroundColor = "rgb("+darker[0]+","+darker[1]+","+darker[2]+")";
    document.getElementById(classID+'AddNewAssignmentOutline').style.backgroundColor = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";

    document.getElementById(classID+'ForceRemove').style.backgroundColor = "rgb("+darker[0]+","+darker[1]+","+darker[2]+")";

    //to added assignments
    var assignmentList = [];
    assignmentList = getAssignments(className);
    assignmentList.forEach((assignmentObj) => {
        var assignmentID = assignmentObj.name;
        assignmentID = assignmentID.replaceAll(" ", "_");
        if(assignmentObj.complete == false){
            document.getElementById('Overview'+classID+assignmentID).style.backgroundColor = "rgb("+darker[0]+","+darker[1]+","+darker[2]+")";
            document.getElementById('OutsideForSizeFix'+classID+assignmentID).style.backgroundColor = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
        } else {
            document.getElementById('Overview'+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";
            document.getElementById('OutsideForSizeFix'+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";
            document.getElementById("CheckBoxComplete"+classID+assignmentID).checked = true;
        }
    }); 
}


/**This function is used to color assignments in quick view.
 * Takes in classList containing a list of classes as objects
 * Out of efficency reasons this function is seperate from the above and not a continuation.
 * This Also lets the function be easily called from other locations without issue
 */
function colorAllAssignment(classList){
    console.log(classList);
    classList.forEach((classObj)=>{ 
        var classColor = classObj.color;
        var classID = classObj.name;
        classID = classID.replaceAll(" ", "_");
        //parsing rgb string into array of numbers
        var inputSubstring = classColor.substring(4,classColor.length-1);
        var RGBstringArray = inputSubstring.split(",");
        var RGB = [];

        RGBstringArray.forEach(str => {
            RGB.push(Number(str));
        });

        var darker = darkColor(RGB);
        //to added assignments
        var assignmentList = [];
        assignmentList = classObj.assignments;
        assignmentList.forEach((assignmentObj) => {
            var assignmentID = assignmentObj.name;
            assignmentID = assignmentID.replaceAll(" ", "_");
            if(assignmentObj.complete == false){
                document.getElementById('Overview'+classID+assignmentID).style.backgroundColor = "rgb("+darker[0]+","+darker[1]+","+darker[2]+")";
                document.getElementById('OutsideForSizeFix'+classID+assignmentID).style.backgroundColor = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
            } else {
                document.getElementById('Overview'+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";
                document.getElementById('OutsideForSizeFix'+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";
                document.getElementById("CheckBoxComplete"+classID+assignmentID).checked = true;
            }
        }); 
    });
}
src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";


function AssignmentAddHTML(className, assignmentName, assignmentPriority, assignmentStartDate, assignmentDueDate, assignmentLink, assignmentRelatedLinks, assignmentNotes, isComplete, Location){

    // name: assignmentName,                   //text
    //     class: className,                       //text
    //     priority: assignmentPriority,           //int
    //     dueDate: assignmentDueDate,             //datetime w/hour min
    //     startDate: assignmentStartDate,         //datetime w/hour min
    //     link: assignmentLink,                   //text
    //     relatedLinks: assignmentRelatedLinks,   //text
    //     notes: assignmentNotes,                 //text
    // };
    var newAssignment = assignmentName.replaceAll(" ", "_");

    var ClassNameAssignment = className.replaceAll(" ", "_");

    // var isCanvasAssignment = false;
    // var isCanvasCheck = newAssignment.substring(0, 6);
    // console.log("Assignmetn NAMNE E E: " + assignmentName);
    // console.log("isCanvasCheck: " + isCanvasCheck);
    // console.log("Assignment Notes: " + assignmentNotes);
    // if (isCanvasCheck == "Canvas"){
    //     isCanvasAssignment = true;
    // }

    var NameToAddForID= ClassNameAssignment+newAssignment;

    //makes a copy of the content in template for assignment
    var NewHTML = document.querySelector("#NewAssignmentTemp").content;

    NewHTML= NewHTML.cloneNode(true); //true makes this recursive (copy all in assignment)    
    //fixing IDs to be unique
    for(var i=0; i <NewHTML.querySelectorAll('div').length; i++){
        var cur = NewHTML.querySelectorAll('div')[i];
        cur.setAttribute('id', ''+cur.id + NameToAddForID);
        
    }
    for(var i=0; i< NewHTML.querySelectorAll('button').length; i++){
        var cur = NewHTML.querySelectorAll('button')[i];
        cur.setAttribute('id', ''+cur.id + NameToAddForID);
    }
    for(var i=0; i< NewHTML.querySelectorAll('input').length; i++){
        var cur = NewHTML.querySelectorAll('input')[i];
        cur.setAttribute('id', ''+cur.id + NameToAddForID);
    }
    for(var i=0; i< NewHTML.querySelectorAll("label").length; i++){
        var cur = NewHTML.querySelectorAll('label')[i];
        cur.setAttribute('for', ''+cur.getAttribute('for') + NameToAddForID);
    }
    for(var i=0; i< NewHTML.querySelectorAll("select").length; i++){
        var cur = NewHTML.querySelectorAll('select')[i];
        cur.setAttribute('id', ''+cur.id + NameToAddForID);
    }

    var isQuick =0; //is this a quick view item
    if(Location == ""){
        document.getElementById(ClassNameAssignment+'Assignments').appendChild(NewHTML);
    }
    else{
        
        document.getElementById(Location).appendChild(NewHTML);
        isQuick =1;
    }

    //collapse all other assignments on opening
    document.getElementById('Overview'+ NameToAddForID).setAttribute('onclick', 'closeallOtherAssignments()');


    //set up the button to link to the right dropdown on the page
    var overviewlink = document.getElementById('Overview'+ NameToAddForID);
    overviewlink.setAttribute('data-bs-target', ''+overviewlink.getAttribute("data-bs-target") + NameToAddForID);
    

    //should fix the complete button
    document.getElementById('CheckBoxComplete'+ NameToAddForID).getAttribute("onclick");
    if(typeof(onclick) != "function"){
        document.getElementById('CheckBoxComplete'+ NameToAddForID).setAttribute('onclick', "completeButton('" + assignmentName+ "','" + className +"')");
    }
    else{
        document.getElementById('CheckBoxComplete'+ NameToAddForID).onclick = function(){completeButton(assignmentName, className)};
    }
    if(isComplete === true){
        document.getElementById('CheckBoxComplete'+ NameToAddForID).complete =true;
        document.getElementById('CheckBoxComplete'+ NameToAddForID).checked =true;
    }
    else if(isComplete === false){
        document.getElementById('CheckBoxComplete'+ NameToAddForID).complete =false;
        document.getElementById('CheckBoxComplete'+ NameToAddForID).checked =false;
    }

    //remove button
    document.getElementById('removeButton'+ NameToAddForID).setAttribute('onclick', "removeAssignment('" + className + "','" + assignmentName +"','Assignment" + NameToAddForID +"')");
    //document.getElementById('removeButton'+ NameToAddForID).onclick = function(){removeAssignment(className, assignmentName, 'Assignment'+NameToAddForID)};
    // console.log('Assignment'+NameToAddForID);


    //link change
    if(typeof(onblur) != "function"){
        
        document.getElementById('AssignmentLink'+ NameToAddForID).setAttribute('onblur', "updateURL(this.innerText,'" + assignmentName+ "','" + className +"')");
    }
    else{
        document.getElementById('AssignmentLink'+ NameToAddForID).onblur = function(){updateURL(this.innerText, assignmentName, className)};
    }
    //additional link change
    if(typeof(onblur) != "function"){
        
        document.getElementById('RelatedLinks'+ NameToAddForID).setAttribute('onblur', "updateRelated(this.innerText,'" + assignmentName+ "','" + className +"')");
    }
    else{
        document.getElementById('RelatedLinks'+ NameToAddForID).onblur = function(){updateRelated(this.innerText, assignmentName, className)};
    }



    //discription change
    document.getElementById('Details'+ NameToAddForID).getAttribute("onblur");
    if(typeof(onblur) != "function"){
        
        document.getElementById('Details'+ NameToAddForID).setAttribute('onblur', "updateDiscription(this.innerText,'" + assignmentName+ "','" + className +"')");
    }
    else{
        document.getElementById('Details'+ NameToAddForID).onblur = function(){updateDiscription(this.innerText, assignmentName, className)};
    }



    //priority change
    document.getElementById('PriorityChange'+ NameToAddForID).getAttribute("onchange");
    if(typeof(onchange) != "function"){
        
        document.getElementById('PriorityChange'+ NameToAddForID).setAttribute('onchange', "updatePriority(this.options[this.selectedIndex].value,'" + assignmentName+ "','" + className +"', '"+ isQuick +"')");
    }
    else{
        document.getElementById('PriorityChange'+ NameToAddForID).onchange = function(){updatePriority(this.options[this.selectedIndex].value, assignmentName, className, isQuick)};
    }


    //name change
    if(typeof(onblur) != "function"){
        document.getElementById('Rename'+ NameToAddForID).setAttribute('value', ''+ assignmentName);
        document.getElementById('Rename'+ NameToAddForID).setAttribute('onblur', "updateName(this.value,'" + assignmentName+ "','" + className +"', '"+ isQuick +"')");
    }
    else{
        document.getElementById('Rename'+ NameToAddForID).value = ''+ assignmentName;
        document.getElementById('Rename'+ NameToAddForID).onblur = function(){updateName(this.value, assignmentName, className, isQuick)};
    }


    //start change
    if(typeof(onchange) != "function"){
        
        document.getElementById('EditStart'+ NameToAddForID).setAttribute('onblur', "updateStart(this.value,'" + assignmentName+ "','" + className +"', '"+ isQuick +"')");
        document.getElementById('EditStart'+ NameToAddForID).setAttribute('value', ""+ assignmentStartDate);
    }
    else{
        document.getElementById('EditStart'+ NameToAddForID).onblur = function(){updateStart(this.value, assignmentName, className, isQuick)};
    }

    //Due change area
    if(typeof(onchange) != "function"){
        
        document.getElementById('EditDue'+ NameToAddForID).setAttribute('onblur', "updateDue(this.value,'" + assignmentName+ "','" + className +"', '"+ isQuick +"')");
        document.getElementById('EditDue'+ NameToAddForID).setAttribute('value', ""+ assignmentDueDate);
    }
    else{
        document.getElementById('EditDue'+ NameToAddForID).onblur = function(){updateDue(this.value, assignmentName, className, isQuick)};
    }



    //set fields
    document.getElementById('PriorityField'+ NameToAddForID).innerText = "Priority: " + assignmentPriority;
    if(Location == ""){
        document.getElementById('AssignmentNameField'+ NameToAddForID).innerText = assignmentName;
    }
    else{
        document.getElementById('AssignmentNameField'+ NameToAddForID).innerText = className + " : " + assignmentName;
    }

    
    document.getElementById('Start_'+ NameToAddForID).innerText= ''+ TimeToString(assignmentStartDate);

    document.getElementById('Due_'+ NameToAddForID).innerText= ''+ TimeToString(assignmentDueDate);
    //bar stuff
    var widthProgress = getDatePercent(assignmentStartDate, assignmentDueDate);
    document.getElementById('ProgressBar' + NameToAddForID).setAttribute("style", "width: " + widthProgress + '%' + "; background-color: purple;");
    if(parseInt(widthProgress) > 90){
        document.getElementById('TimeLeftBarText2' + NameToAddForID).innerText = getTimeLeftLargestNonZero(assignmentDueDate);
        document.getElementById('TimeLeftBarText' + NameToAddForID).innerText = '';
    }
    else{
        document.getElementById('TimeLeftBarText' + NameToAddForID).innerText = getTimeLeftLargestNonZero(assignmentDueDate);
        document.getElementById('TimeLeftBarText2' + NameToAddForID).innerText = '';
    }
    

    //links
    document.getElementById('AssignmentLink'+ NameToAddForID).innerText = assignmentLink;
    document.getElementById('RelatedLinks'+ NameToAddForID).innerText = assignmentRelatedLinks;
    document.getElementById('Details'+ NameToAddForID).innerText = assignmentNotes;
    // WIP FOR INCLUDING HTML DESCRIPTIONS FOR CANVAS
    // if (isCanvasAssignment == true){
    //     document.getElementById('AssigmentDetailWrapper'+ NameToAddForID).innerHTML = 
    //     `<p>
    //     Details: <br>
    //     `+assignmentNotes+`

    //     <div class="genericWrittingBox" contenteditable="true" id="Details" onblur="updateDiscription()">
    //         <!-- Will need unique id in future-->
            
    //     </div>
    //     </p>`
        
    //     // document.getElementById('Details'+ NameToAddForID).innerText = '';
    // }
    // else{
    //     document.getElementById('Details'+ NameToAddForID).innerText = assignmentNotes;

    // }
    


}

//this function is used by the progress bar
function getDatePercent(StartDate, DueDate){
    
    var todaysDate = new Date(CurrentDateISOTime()); //defaults to today

    var max = new Date(DueDate) - new Date(StartDate);
    var left = new Date(DueDate) - todaysDate;
    var percent = (left/max*100).toFixed(3);
    if(percent < 0){ //edge case (overdue)
        percent = 0;
    }
    return percent;
}

//this function will return the largest nonzero value of the time left for the progress bar
function getTimeLeftLargestNonZero(DueDate){
    //cannot really be condensed much more than this

    var curDate = new Date(CurrentDateISOTime());
    

    var timeCheck = new Date(DueDate) - curDate
    // assignments aren't recognized as overdue, added this 
    if (timeCheck < 0){
        return "OVER DUE!!!";
    }

    var timeSec = Math.abs(new Date(DueDate) - curDate)/1000;
    
    //var Seconds = timeSec%60;
    var minutes = Math.floor(timeSec/60)%60;
    var hours = Math.floor(timeSec/3600)%24;
    var days = Math.floor(timeSec/86400)%30;
    var months = Math.floor(timeSec/(2.69*Math.pow(10,6)))%12;
    var years = Math.floor(Math.floor(timeSec/(2.69*Math.pow(10,6)))/12);

    if(years > 0){
        if(years == 1){
            return years + " Year";
        }
        return years + " Years";
    }
   // var daysBetween = (new Date( (curDate).getFullYear(), curDate.month(), 0)).getDate() - curDate.getDate() + new Date(DueDate).getDate(); //max days in month - current date + days in following month

    if(months > 0){ //30 as average length of a month
        if(months == 1){
            return months + " Month";
        }
        return months + " Months";
    }

    if(days > 0){
        if(days == 1){
            return days + " Day";
        }
        return days + " Days";
    }

    if(hours > 0){
        if(hours == 1){
            return hours + " Hour";
        }
        return hours + " Hours";
    }

    if(minutes > 0){
        if(minutes == 1){
            return minutes + " Minute";
        }
        return minutes + " Minutes";
    }
    else{
        return "OVER DUE!!!";
    }

}

function ChangeIDWith(oldName, NewName){

    for(var i=0; i <document.querySelectorAll('[id*="'+oldName+'"]').length; i++){
        var cur = document.querySelectorAll('[id*="'+oldName+'"]')[i];
        var NewName = cur.id.replaceAll(oldName, NewName);
        cur.setAttribute('id', ''+NewName);
        
    }
    for(var i=0; i< NewHTML.querySelectorAll("label").length; i++){
        var cur = NewHTML.querySelectorAll('label')[i];
        var currentTarget = cur.for;
        if(currentTarget.includes(oldName)){
            var NewName = cur.for.replaceAll(oldName, NewName);
            cur.setAttribute('for', ''+NewName);
        }
        
    }
    //unfinished
    //can be used for update in which tabs nolonger need to close on change
}
function TimeToString(time){
    var newTime = time;
    var datestruct=  new Date(newTime);
    //yyyy-mm-ddThh:mm

    if(time != null){
        newTime = datestruct.getMonth()+1;
        newTime +="/"+datestruct.getDate();
        newTime += "/"+datestruct.getFullYear();
        var ending = " AM";
        var hour = datestruct.getHours();
        if(hour > 12){
            hour = hour-12;
            ending = " PM";
        }
        
        newTime += " at " + hour;

        newTime += ":" + datestruct.getMinutes();
        newTime += ending;
        //newTime = newTime.toString();
        //newTime.split('-');
        //newTime = newTime.replaceAll('-', '/');
        //newTime = newTime.replaceAll('T', ' ');
    }
    return newTime;
}

function closeallOtherAssignments(){
        jQuery('.assignmentCollapse').collapse('hide');
}
src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";

var CurSort = "DueDate";

function sortButton(sortby){
    CurSort = sortby;
    populatePage();
}   
function sortButtonQuick(sortby){
    CurSort = sortby;
    populateQuickView();
}


//called by populating function for sorting the array
function sortAssignment(JSONOBJ){
    if(CurSort == "DueDate"){
        //order primarily by due date but first by start and priority so if something has the same duedate the one with the higher priority will go first
        JSONOBJ = sortStart(JSONOBJ);
        JSONOBJ = sortPrior(JSONOBJ);
        JSONOBJ = sortDue(JSONOBJ);
        JSONOBJ = sortComplete(JSONOBJ);
        //console.log(JSONOBJ);
    }
    else if(CurSort == "Priority"){
        JSONOBJ = sortStart(JSONOBJ);
        JSONOBJ = sortDue(JSONOBJ);
        JSONOBJ = sortPrior(JSONOBJ);
        JSONOBJ = sortComplete(JSONOBJ);
    }
    else if(CurSort == "StartDate"){
        JSONOBJ = sortDue(JSONOBJ);
        JSONOBJ = sortPrior(JSONOBJ);
        JSONOBJ = sortStart(JSONOBJ);

        JSONOBJ = sortComplete(JSONOBJ);
    }
    else if(CurSort == "TimePast"){
        JSONOBJ = sortDue(JSONOBJ);
        JSONOBJ = sortPrior(JSONOBJ);
        JSONOBJ = sortExpired(JSONOBJ);

        JSONOBJ = sortComplete(JSONOBJ);
    }
    else{
        console.log("error");
    }

    return JSONOBJ;
}
function sortDue(OBJ){
    return OBJ.sort( function(x,y){
        //using ISO date sort the extra stuff is for correctness. For source: https://stackoverflow.com/questions/12192491/sort-array-by-iso-8601-date 
        return ((x.dueDate < y.dueDate) ? -1 : ((x.dueDate > y.dueDate)) ? 1 : 0); 
    });
}
function sortPrior(OBJ){
    return OBJ.sort( function(x,y){
       return parseInt(x.priority) - parseInt(y.priority);
    });
}
function sortStart(OBJ){
    return OBJ.sort( function(x,y){
        
        //using ISO date sort the extra stuff is for correctness. For source: https://stackoverflow.com/questions/12192491/sort-array-by-iso-8601-date 
        return ((x.startDate < y.startDate) ? -1 : ((x.startDate > y.startDate)) ? 1 : 0); 
    });
}
function sortExpired(OBJ){
    return OBJ.sort( function(x,y){
        var todaysDate = new Date(CurrentDateISOTime()); //defaults to today
        var max1 = new Date(x.dueDate) - new Date(x.startDate);
        var max2 = new Date(y.dueDate) - new Date(y.startDate);
        if(max1 == 0){
            max1=1;
        }
        if(max2 ==0){
            max2=1;
        }
        var expired1 = (todaysDate - new Date(x.startDate))/max1;
        var expired2 = (todaysDate - new Date(y.startDate))/max2;
        
        return (parseFloat(expired2)-parseFloat(expired1)); 
    });
}
//sends completed to back
function sortComplete(OBJ){
    return OBJ.sort(function(x,y){
        
        return (x.complete === y.complete)? 0 : x.complete? 1 : -1; 
    });
}
/**this file contains all items having to do with getting or setting things 
 * in local storage related to class and assignment info */


//returns array of Class objects
function getClassList(){ 
    var classList = [];
    var keys = Object.keys(localStorage);
    var i = keys.length;
   
    while(i--){
        classList.push(JSON.parse(localStorage.getItem(keys[i])));
    }
   
    // console.log("CLASS LIST: " + classList);
    return classList;
}

//gets all assignments that match the requested class name
function getAssignments(className){ //returns array of assignment objects of a class
    var classList = getClassList(); //array of class objects
    var result = [];

    classList.forEach((classObj, i, array) => {
        if(classObj.name == className){
            //console.debug(classObj.assignments.length);
            result =  (classObj.assignments);
        }
        //console.debug(i);
        //console.debug(array);
    });
    return result;
}


//takes in class name and returns class obj
function getClass(className){ 
    var keys = Object.keys(localStorage);
    var i = keys.length;

    while(i--){
        var classObj = JSON.parse(localStorage.getItem(keys[i]));
        if(classObj.name == className){
            return classObj;
        }
        else if(i == 0){ //if i is 0 and the last element has been checked
            console.log("no item found");
            return null;
        }
    } 
}

// deletes class from list (WIP)
function deleteClass(className){
    var classObj = getClass(className);
    localStorage.removeItem(className);
    deleteClassDB(JSON.stringify(classObj));
}






/** 
takes in assignment name and returns assignment obj
takes in class name and assignment name
returns assignment obj in that class
*/
function getAssignment(inputClassName, inputAssignmentName){ 
    var classObj = getClass(inputClassName);
    var assignmentList = classObj.assignments;
    var result = null;
    assignmentList.forEach((assignmentObj, i, array) => {
        if(assignmentObj.name == inputAssignmentName){
            result = assignmentObj;
        }
    });
    return result;
}


function addAssignmentToClassDB(assignmentObj){
    $.ajax({
        url:"/bgAddAssignment",
        type: "POST",
        async: false,
        contentType: "application/json",
        data: assignmentObj,
        dataType: 'json',
        success: function (response){
        }
    });     
}

function deleteClassDB(classObj){
    //alert(classObj);
    $.ajax({
        url:"/bgDeleteClass",
        type: "POST",
        async: false,
        contentType: "application/json",
        data: classObj,
        dataType: 'json',
        success: function (response){
        }
    });  
}



function updateExistingAssignment(oldObj, newObj){
    $.ajax({
        url:"/bgUpdateAssignment",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({old: oldObj, new: newObj}),
        dataType: 'json',
        success: function (response){
        }
    });     
}


//adds the assignment to a class Json
function addAssignmentToClass(assignmentName, className, assignmentPriority, assignmentDueDate, assignmentStartDate, assignmentLink, assignmentRelatedLinks, assignmentNotes,isComplete, googleClass, canvasClass){
    //if one of the dates is empty asign it todays date
    console.log("AddAssignmentToClass:");
    console.log(assignmentName);
    if(assignmentStartDate == ""){ 
        assignmentStartDate = CurrentDateISOTime();
    }
    if(assignmentDueDate == ""){
        assignmentDueDate = CurrentDateISOTime();
    }

    var newAssignment ={
        name: assignmentName,                   //text
        class: className,                       //text
        priority: assignmentPriority,           //int
        dueDate: assignmentDueDate,             //datetime w/hour min
        startDate: assignmentStartDate,         //datetime w/hour min
        link: assignmentLink,                   //text
        relatedLinks: assignmentRelatedLinks,   //text
        notes: assignmentNotes,                 //text
        complete: isComplete,
        googleLocation: googleClass,
        canvasLocation: canvasClass
    };

    var assignmentJSON = JSON.stringify(newAssignment);
    addAssignmentToClassDB(assignmentJSON);

    var classList = getClassList(); //array of class objects
    
    classList.forEach((classObj, i, array) => {
        if(classObj.name == className){
            classObj.assignments.push(newAssignment);
            var jsonObj = JSON.stringify(classObj);
            localStorage.setItem(className, jsonObj);
        }
        //console.debug(i);
        //console.debug(array);
    });

}



/**
 * deletes existing class of an assignment and replaces
 * it with a class without the inputted assignment
 * @param {*} className Name of inputted class name WITH spaces
 * @param {*} assignmentID Name of assignment WITH underscores
 */
function deleteAssignment(className, assignmentID){
    assignmentName = assignmentID.replaceAll("_", " ");
    console.log(className+ " " + assignmentName);
    //copies of respective class and assignment objs & arrays
    var classObj = getClass(className);
    var assignmentObj = getAssignment(className, assignmentName);
    var assignmentList = classObj.assignments;

    console.log("DELETE: AssignmentOBJ: "+ assignmentName);
    //find index of assignment in array that needs to be removed
    var indexToRemove = assignmentList.findIndex(myAssignment =>{
        return myAssignment.name == assignmentObj.name;
    });

    //splice removes one element at the indexToRemove
    assignmentList.splice(indexToRemove,1);


    //TODO: 
    //Remove class & store it again without assignment
    deleteClass(className);
    console.log("Removing 1 assignment: "+ JSON.stringify(assignmentList));
    storeClass(classObj.name, assignmentList, classObj.color);

    //console.debug(assignmentList);
}

// should work as intended 
//edits HTML
function removeAssignment(className, assignmentName, assignmentDiv){


    //used to remove class
    var removeAssignment = assignmentDiv;
    const element = document.getElementById(removeAssignment);
    //console.debug(element);
    element.remove();


    deleteAssignment(className, assignmentName);
   
}


/**
 * 
 * Removes HTML code of a User's class and calls deleteClass()
 * @param {} inputClassName 
 */
function removeClass(inputClassName){
    // input from user
    var classDiv = inputClassName.replaceAll(" ", "_");

    //used to remove class
    const element = document.getElementById(classDiv+ 'Section');
    element.remove();
    //remove the drop down
    const collapse = document.getElementById("Collapse"+classDiv);
    collapse.remove();
    console.log("Deleting : " + inputClassName); 
    // removes class from classList
    deleteClass(inputClassName);
}

//storeClassCanvas: takes in user inputted className and an array of assignments to store in local storage
function storeCanvasClass(className, classColor, classOrder, classID){
   
        var newClass = {
            name: className, //text
            color: classColor, //text
            order: classOrder,
            ID: classID

        };
    // console.log("IN STORE CLASS FUNCTION");
    // console.log(className);
    var jsonObj = JSON.stringify(newClass); //creates JSON for assignment
    localStorage.setItem(className, jsonObj); //stores assignment in local storage as item "CLASS:className"
    // console.log("LOCAL STORAGE IN STORE CLASS FUNCTION");
    // console.log(localStorage);

}
//storeClass: takes in user inputted className and an array of assignments to store in local storage
function storeClass(className, arrayAssignments, classColor, classOrder){
   
    if(arrayAssignments.length == 0){
        var newClass = {
            name: className, //text
            assignments: [], //array of assignment objs
            color: classColor,
            order: classOrder
        };
    } else{
        var newClass = {
            name: className, //text
            assignments: arrayAssignments, //array of assignment objs
            color: classColor, 
            order: classOrder

        };
    }
    // console.log("IN STORE CLASS FUNCTION");
    // console.log(className);
    var jsonObj = JSON.stringify(newClass); //creates JSON for assignment
    localStorage.setItem(className, jsonObj); 
    //console.log("LOCAL STORAGE IN STORE CLASS FUNCTION");
    console.log("JSON given to storeClassDB: " + jsonObj);
    storeClassDB(jsonObj);  

}

//this function adds it only to local storage, not DB
function storeTempClass(className, arrayAssignments, classColor, classOrder){
   
    if(arrayAssignments.length == 0){
        var newClass = {
            name: className, //text
            assignments: [], //array of assignment objs
            color: classColor,
            order: classOrder
        };
    } else{
        var newClass = {
            name: className, //text
            assignments: arrayAssignments, //array of assignment objs
            color: classColor, 
            order: classOrder

        };
    }
    // console.log("IN STORE CLASS FUNCTION");
    // console.log(className);
    var jsonObj = JSON.stringify(newClass); //creates JSON for assignment
    localStorage.setItem(className, jsonObj); 

}



function storeClassDB(classObj){
    $.ajax({
        url:"/bgAddClass",
        type: "POST",
        async: false,
        contentType: "application/json",
        data: classObj,
        dataType: 'json',
        success: function (response){
        }
    });    
}

function completeButton(assignmentName,className){

    //getting copies of objects
    var assignmentObj = getAssignment(className, assignmentName);
    var classObj = getClass(className);
    //checks if checkbox is checked
    var assignmentID = assignmentObj.name;
    assignmentID = assignmentID.replaceAll(" ", "_");
    var classID = className.replaceAll(" ","_");
    if(document.getElementById("CheckBoxComplete"+classID+assignmentID).checked){
        //this reassigns cssText for that specific box to change to gray
        document.getElementById("Overview"+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";    
        document.getElementById("OutsideForSizeFix"+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";
        assignmentObj.complete = true;
    } else {
        //this reverts it back to our original color
        document.getElementById("Overview"+classID+assignmentID).style.backgroundColor = classObj.color;   
        document.getElementById("OutsideForSizeFix"+classID+assignmentID).style.backgroundColor =classObj.color;
        assignmentObj.complete = false;    
    }
    console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    var jsonObj = JSON.stringify(assignmentObj);
    console.log(assignmentObj.complete);
    $.ajax({
        url:"/bgUpdateAssignment",
        type: "POST",
        async: false,
        contentType: "application/json",
        data: jsonObj,
        dataType: 'json',
        success: function (response){
        }
    });


}




//this function is called when the color picker changes
//this function stores the new color into local storage
function changeClassColor(className){
    var classID = className.replaceAll(" ", "_");
    let color = document.getElementById(classID+'ColorPicker').value;
    var RGB = parseColor(color);

    //setting color update into localstorage
    var classObj = getClass(className);
    console.log(className);
    classObj.color = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
    var jsonObj = JSON.stringify(classObj);
    localStorage.setItem(className, jsonObj);


    var lighter = lightColor(RGB);
    document.getElementById(classID+'Section').style.backgroundColor = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
    document.getElementById(classID+'ClassAssignments').style.backgroundColor = "rgb("+lighter[0]+","+lighter[1]+","+lighter[2]+")";
    document.getElementById(classID+'AssignmentsOutline').style.backgroundColor = "rgb("+lighter[0]+","+lighter[1]+","+lighter[2]+")";

    var darker = darkColor(RGB);
    document.getElementById(classID+'AddAssignment').style.backgroundColor = "rgb("+darker[0]+","+darker[1]+","+darker[2]+")";
    document.getElementById(classID+'AddNewAssignmentOutline').style.backgroundColor = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";

    document.getElementById(classID+'ForceRemove').style.backgroundColor = "rgb("+darker[0]+","+darker[1]+","+darker[2]+")";

    //to added assignments
    var assignmentList = [];
    assignmentList = getAssignments(className);
    assignmentList.forEach((assignmentObj, i, array) => {
        var assignmentID = assignmentObj.name;
        assignmentID = assignmentID.replaceAll(" ", "_");
        if(assignmentObj.complete == false){
            document.getElementById('Overview'+classID+assignmentID).style.backgroundColor = "rgb("+darker[0]+","+darker[1]+","+darker[2]+")";
            document.getElementById('OutsideForSizeFix'+classID+assignmentID).style.backgroundColor = "rgb("+RGB[0]+","+RGB[1]+","+RGB[2]+")";
        } else {
            document.getElementById('Overview'+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";
            document.getElementById('OutsideForSizeFix'+classID+assignmentID).style.backgroundColor = "rgb(110, 108, 117)";
        }
    });

    var classObj = JSON.stringify(getClass(className));
    console.log(classObj);
    $.ajax({
        url:"/bgUpdateClass",
        type: "POST",
        async: false,
        contentType: "application/json",
        data: classObj,
        dataType: 'json',
        success: function (response){
        }
    });  
}

//can be used to print out the names into consol
function printClassList(){
    var classList = [];
    var keys = Object.keys(localStorage);
    var i = keys.length;

    while(i--){
        classList.push(localStorage.getItem(keys[i]));
    }
    
}


//clears everything including the storage
function clearPage(){
    
    printClassList();
    var classList = getClassList();
    classList.forEach((classObj) => {
        deleteClass(classObj.name);
    });
    localStorage.clear();
    // reset to original html
    document.getElementById('classList').innerHTML = ""
}

//updates the JSON with new discription of assignment
function updateDiscription(text, assignmentName, className){
    //getting copies of objects
    var assignmentObj = getAssignment(className, assignmentName);
    //set new details
    assignmentObj.notes = text;

    //Remove old assignment from classObj's assignments
    deleteAssignment(className, assignmentName);
    addAssignmentToClass(assignmentName, className, assignmentObj.priority, assignmentObj.dueDate, assignmentObj.startDate, assignmentObj.link, assignmentObj.relatedLinks, assignmentObj.notes,assignmentObj.complete, assignmentObj.googleLocation,assignmentObj.canvasLocation);
}
function updateURL(text, assignmentName, className){
    var assignmentObj = getAssignment(className, assignmentName);
    //set new details
    assignmentObj.link = text;
    console.log(assignmentObj.link);
    //Remove old assignment from classObj's assignments
    deleteAssignment(className, assignmentName);
    addAssignmentToClass(assignmentName, className, assignmentObj.priority, assignmentObj.dueDate, assignmentObj.startDate, assignmentObj.link, assignmentObj.relatedLinks, assignmentObj.notes,assignmentObj.complete, assignmentObj.googleLocation,assignmentObj.canvasLocation);
}
function updateRelated(text, assignmentName, className){
    var assignmentObj = getAssignment(className, assignmentName);
    //set new details
    assignmentObj.relatedLinks = text;
    //Remove old assignment from classObj's assignments
    deleteAssignment(className, assignmentName);
    addAssignmentToClass(assignmentName, className, assignmentObj.priority, assignmentObj.dueDate, assignmentObj.startDate, assignmentObj.link, assignmentObj.relatedLinks, assignmentObj.notes,assignmentObj.complete, assignmentObj.googleLocation,assignmentObj.canvasLocation);
}
function updatePriority(selected, assignmentName, className ,isQuick){
    //getting copies of objects
    //console.log(selected +" as: " + assignmentName + " class " + className);
    
    var assignmentObj = getAssignment(className, assignmentName);
    var assignmentID = assignmentName.replaceAll(' ', '_');
    var classID = className.replaceAll(' ', '_');
    //this sets the html
    
    document.getElementById("PriorityField"+classID+assignmentID).innerText = "Priority: " + selected;    
    assignmentObj.priority = selected;


    //Remove old assignment from classObj's assignments
    deleteAssignment(className, assignmentName);
    addAssignmentToClass(assignmentName, className, assignmentObj.priority, assignmentObj.dueDate, assignmentObj.startDate, assignmentObj.link, assignmentObj.relatedLinks, assignmentObj.notes,assignmentObj.complete, assignmentObj.googleLocation,assignmentObj.canvasLocation);
    
    if(isQuick == 1){
        populateQuickView();
    }
    else{
        populatePage();
    }
        
}
function updateStart(selected, assignmentName, className, isQuick){
    var assignmentObj = getAssignment(className, assignmentName);
    var assignmentID = assignmentName.replaceAll(' ', '_');
    var classID = className.replaceAll(' ', '_');
    //this sets the html
    document.getElementById("Start_"+classID+assignmentID).innerText = TimeToString(selected); 
    
    assignmentObj.startDate = selected;
    console.log(isQuick);

    //Remove old assignment from classObj's assignments
    deleteAssignment(className, assignmentName);
    addAssignmentToClass(assignmentName, className, assignmentObj.priority, assignmentObj.dueDate, assignmentObj.startDate, assignmentObj.link, assignmentObj.relatedLinks, assignmentObj.notes,assignmentObj.complete, assignmentObj.googleLocation,assignmentObj.canvasLocation);
    if(isQuick==1){
        populateQuickView();
    }
    else if(isQuick == 0){
        populatePage();
    }
}

function updateDue(selected, assignmentName, className, isQuick){
    var assignmentObj = getAssignment(className, assignmentName);
    var assignmentID = assignmentName.replaceAll(' ', '_');
    var classID = className.replaceAll(' ', '_');
    //this sets the html
    document.getElementById("Due_"+classID+assignmentID).innerText = TimeToString(selected); 
    
    assignmentObj.dueDate = selected;


    //Remove old assignment from classObj's assignments
    deleteAssignment(className, assignmentName);
    addAssignmentToClass(assignmentName, className, assignmentObj.priority, assignmentObj.dueDate, assignmentObj.startDate, assignmentObj.link, assignmentObj.relatedLinks, assignmentObj.notes,assignmentObj.complete, assignmentObj.googleLocation,assignmentObj.canvasLocation);
    if(isQuick == 1){
        populateQuickView();
    }
    else
        populatePage();
}

function updateName(text, assignmentName, className, isQuick){
    //console.log(text+ " " + assignmentName+" "+className+" "+isQuick);
    console.log(text);
    text = text.trim();
    if(text == "" || text.includes('_') === true || (getAssignment(className, text) != null && getAssignment(className, text).name != assignmentName)){
        alert("This is not a valid Assignment name. Please make sure the name contains no '_' in it, Does not already exist, or is empty");
    }

    if(text != assignmentName && text != "" && text != " " && text.includes('_') === false){//cant be an empty string and cant be the same as before idk why it breaks from that
        var assignmentObj = getAssignment(className, assignmentName);
        //set new details
        assignmentObj.name = text;
        //Remove old assignment from classObj's assignments
        deleteAssignment(className, assignmentName);
        addAssignmentToClass(assignmentObj.name, className, assignmentObj.priority, assignmentObj.dueDate, assignmentObj.startDate, assignmentObj.link, assignmentObj.relatedLinks, assignmentObj.notes,assignmentObj.complete, assignmentObj.googleLocation,assignmentObj.canvasLocation);
        if(isQuick == 1){
            populateQuickView();
        }
        else
            populatePage();
    }
    





    // if(quickview){
    //     document.getElementById("AssignmentNameField"+classID+assignmentID).innerText = ""+ className+ "; " + selected; 
    // }
    // else{
    //     document.getElementById("AssignmentNameField"+classID+assignmentID).innerText = "" + selected; 
    // }
}
function addAssignment(className, classID){
    // inputs taken from user 
    // to make it dynamic, takes className from Parameter and is used to find the -
    // associated ID for variables
    var newAssignmentDisplay = document.getElementById(''+classID+'Name').value;
    newAssignmentDisplay = newAssignmentDisplay.trim();
    // takes the space away to ensure variables are properly named
    var startTime = document.getElementById(''+classID+'Start').value; //"`+inputClassName+`Start"
    var endTime = document.getElementById(''+classID+'End').value;
    //console.log(endTime);
    var noteDetails = document.getElementById(''+classID+'Notes').value;
    var priority = document.getElementById("PriorityCreate" + classID).value;

    //when these two variables are included in the html code below
    //assignment causes whole class to close
    //************************************** */
    var relatedLinks = document.getElementById(''+classID+'RelatedLinks').value;
    var link = document.getElementById(''+classID+'Link').value;

    if(newAssignmentDisplay.includes('_') === true || newAssignmentDisplay == ""){
        alert("This is not a valid Assignment name. Please make sure the name contains no '_' in it or is an empty name");
        return;
    }
    if(getAssignment(className, newAssignmentDisplay) != null){
        alert("class already exists. Please use a different name");
        return;
    }
    
    //adds assignment to class in localstorage & server
    addAssignmentToClass(newAssignmentDisplay,className,priority,endTime,startTime, link, relatedLinks,noteDetails,false, '', '');

    populatePage();


}

function AddClass(){
    // input from user
    var inputClassNameDisplay =  document.getElementById("InputClassName").value;

    // takes the space away to ensure variables are properly named
    inputClassNameDisplay = inputClassNameDisplay.trim();

    if(inputClassNameDisplay.includes('_') === true){
        alert("This is not a valid class name. Please make sure the name contains no '_' in it");
        return;
    }
    if(getClass(inputClassNameDisplay) != null){
        alert("class already exists. Please use a different name");
        return;
    }

    //Add assignment will also call storeClass into local storage
    let emptyClass = [];
    var defaultColor = "rgb(138, 138, 138);" //default color of a new class
    storeClass(inputClassNameDisplay,emptyClass,defaultColor);

    populatePage();
} 


//WIP: removeAssignment
//edits HTML
// function removeAssignment(className, assignmentName, assignmentDiv){

//     console.log("Class name: " + className);
//     console.log("Assignment name: " + assignmentName);
//     console.log("Div name: " + assignmentDiv);
//     //used to remove class
//     var removeAssignment = assignmentName.replaceAll(" ", "_");
//     var removeClass = className.replaceAll(" ", "_");
//     // console.log("Assign Div: " + assignmentDiv);
//     const element = document.getElementById(assignmentDiv);
//     element.remove();

//     // removes class from classList
//     deleteAssignment(removeClass, removeAssignment);
// }

function populatePage(){
    // empties classList div, doesn't delete
    document.getElementById("classList").innerHTML = "";
   
    var classList = getClassList(); //array of class objects
    //console.log(classList);
    //console.debug(classList);
    // makes classes reverse display 
    // color not saved ATM
    classList.slice().reverse().forEach((classObj) => {
        var className = classObj.name;
        var assignmentList = classObj.assignments;
        assignmentList = sortAssignment(assignmentList);
        var i = assignmentList.length;
        var closest = findClosestDue(assignmentList);
        // use check to get assignments properly ordered 
        var index = 0;
        PopulateClass(className, closest, i);
        // loops through array of assignments and add each one to class
        while (index < i){
            //console.log(assignmentList[index]);
            PopulateAssignments(assignmentList[index] ,"");
            index ++;
        }
        loadClassColor(className);
    });


}

//TODO: NEED TO ADD BACK REMOVE BUTTON 
function PopulateAssignments(AssignmentInfoOBJ, Location){


    // Changes display back to original
    var ClassName= AssignmentInfoOBJ.class;
    var newAssignmentName = AssignmentInfoOBJ.name;
    // takes initial "classname+assignmentname" -> "assignmentname"
    //newAssignmentName = newAssignmentName.replace(ClassName, "");
    var startTime = AssignmentInfoOBJ.startDate;
    var endTime = AssignmentInfoOBJ.dueDate;
    var noteDetails = AssignmentInfoOBJ.notes;
    //when these two variables are included in the html code below
    //assignment causes whole class to close
    //************************************** */
    var relatedLinks = AssignmentInfoOBJ.relatedLinks;
    var link = AssignmentInfoOBJ.link;
    //console.log(AssignmentInfoOBJ.link);
    var priority = AssignmentInfoOBJ.priority; //test, still needs to be implemented
    var isComplete = AssignmentInfoOBJ.complete;
    // console.log("ASSIGNMENT NAME IN POP ASSIGN");
    // console.log(newAssignmentName);
    // console.log("ASSIGNMENT NOTES IN POP ASSIGN");
    // console.log(noteDetails);
    AssignmentAddHTML(ClassName, newAssignmentName, priority, startTime, endTime, link, relatedLinks, noteDetails, isComplete, Location);



}

function PopulateClass(className, closest, assignmentcount){
    
    // input from user
    var inputClassName =  className;
    // when removed adding assignments doesnt work will check
    var inputClassNameDisplay = inputClassName.replaceAll("_", " ");
    // takes the space away to ensure variables are properly named
    inputClassName = inputClassNameDisplay.replaceAll(" ", "_");
    inputClassName = inputClassName.trim();
    //create new div with class name 
    
    var newDiv = document.createElement('div');
    //appends to content
    //document.getElementsByTagName('body')[0].appendChild(newDiv);
    var closestAssignmentDate = 'No assignments'
    if(closest != null){
        closestAssignmentDate = TimeToString(closest.dueDate);
    }
    var upcoming= "No Upcoming Assignments";
    
    if(assignmentcount > 1){
        upcoming = "There Are <strong>" + assignmentcount + "</strong> Upcoming Assignment";
    }
    else if(assignmentcount > 0){
        upcoming = "There Is <strong>" + assignmentcount + "</strong> Upcoming Assignment";
    }
    // add code into new div need to use `` as quotes 
    // need to input dynamic info where needed
    newDiv.innerHTML += `
    <button class="ClassSection" id="`+inputClassName+`Section" type="button" data-bs-toggle="collapse" data-bs-target="#Collapse`+inputClassName+`" aria-expanded="false" aria-controls="Collapse`+inputClassName+`" data-parent="#classList" onclick=''>
        <div class="ClassName Font2">
            `+inputClassNameDisplay+`
        </div>
        <div class="DueDateSection Font2" id="Class1_DueDateOfClosestAssignment">
            `+upcoming+`
        </div> 
        <div class="DueDateSection Font2" id="Class1_TimeLeftOnClosestAssignment">
            Nearest Due Date: `+ closestAssignmentDate +`
        </div> 
    </button>


    <div class="collapse" id="Collapse`+inputClassName+`">
        <div class="ClassAssignmentsOutline" id = "`+inputClassName+`AssignmentsOutline">
            <div class="ClassAssignments" id= "`+inputClassName+`ClassAssignments">
                <div align="right" >
                    <label for="colorpicker" class="Font1">Color Picker:</label>
                    <input type="color" id="`+inputClassName+`ColorPicker" onchange="changeClassColor('`+inputClassNameDisplay+`')" value=#246A81>
                </div>

                <!-- add new assignment -->
                <button class="AddAssignmentTop" id="`+inputClassName+`AddAssignment" type="button" data-bs-toggle="collapse" data-bs-target="#Collapse`+inputClassName+`NewAssignment" aria-expanded="false" aria-controls="CollapseCourse">
                    <div class="AddAssignmentText Font2">
                        Add a new Custom Assignment
                    </div>
                </button>
                <div class="collapse" id="Collapse`+inputClassName+`NewAssignment">
                    <div class="AddAssignmentcontent" id="`+inputClassName+`AddNewAssignmentOutline">
                        <div class="AssignmentInfo clearfix">
                            <div class="leftside">
                                <div class="NewAssignmentInfoBox" id="`+inputClassName+`InfoBox">
                                    <p> 
                                        <div class="Font2">
                                            Assignment Name:
                                        </div>
                                        <div class="tooltipAddAssignment">
                                            <input class="genericWrittingBox Font1" id="`+inputClassName+`Name" placeholder="Add Name">
                                            <div class="tooltipTextAssignment Font1"><p>Names cannot contain '_' or letters specific to another language.</p> <p> The name cannot match an existing Assignment you already added to this class.</p></div>
                                        </div>
                                    </p>
                                    
                                </div>
                                <div class="NewAssignmentInfoBox">
                                    <p class="Font2">
                                        Assignment Link:
                                    </p>
                                    <textarea class="TextInfoBox Font1" contenteditable="true" id="`+inputClassName+`Link" placeholder="Add link"></textarea>
                                    
                                </div>
                                <div class="NewAssignmentInfoBox">
                                    <p class="Font2">
                                        Related Links:
                                    </p>
                                    <textarea class="TextInfoBox Font1" contenteditable="true" id="`+inputClassName+`RelatedLinks" style=" min-height: 100px" placeholder="Add links"></textarea>
                                    
                                </div>
                            </div>
                            <div class="rightside">
                                <div class="NewAssignmentInfoRightSideAreas leftside">
                                    <p class="Font2">
                                        Start date/ time: 
                                        <input class="genericWrittingBox" id="`+inputClassName+`Start" type="datetime-local" style="width=50px;"> 
                                                            
                                    </p>
                                </div>
                                <div class="NewAssignmentInfoRightSideAreas rightside">
                                    <p class="Font2"> 
                                        End date/ time: 
                                        <input class="genericWrittingBox" id="`+inputClassName+`End" type="datetime-local"> 
                                                            

                                    </p>
                                </div>
                                <div class="NewAssignmentNotes">
                                    <p class="Font2">
                                        Notes: 
                                    </p>
                                    <textarea class="TextInfoBox" contenteditable="true" id="`+inputClassName+`Notes" style="min-height: 100px;" placeholder="Add notes"></textarea>
                                </div>
                                <div class="NewAssignmentNotes">
                                    <Label for="PriorityCreate`+inputClassName+`" class="Font2">Priority:</Label>
                                    <select class="PriorityPicker" aria-label="Priority select table" id="PriorityCreate`+inputClassName+`">
                                        <option value="1" selected>1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" onclick="addAssignment('`+inputClassNameDisplay+`', '`+inputClassName+`')" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                    submit
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <!-- Class to dynamically add assignments to class -->
                <div class="demoAssignments Font1" id="`+inputClassName+`Assignments">


                
                </div>
                

                <div style="float: center;">
                    <button class="forceRemove" type="button" id="`+ inputClassName + `ForceRemove" onclick="removeClass('`+ inputClassNameDisplay +`')">Delete</button>
                </div>
            </div>
        </div>
    </div>`;
    var ClassesDiv = document.getElementById("classList");

    // var $classList = $('#classList');
    // $classList.on('show.bs.collapse','.collapse', function() {
    //     $myGroup.find('.collapse.in').collapse('hide');
    // });

    ClassesDiv.innerHTML += newDiv.innerHTML;

    document.getElementById(inputClassName+'Section').setAttribute('onclick', 'collapseOther()');
} 

function collapseOther(){
    jQuery('.collapse').collapse('hide');
}


//Generates todays date and converts it to ISO keeping its timezone offset
function CurrentDateISOTime(){

    //formula sourced from: https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
    var today = new Date(); //todays date UTC
    var offset = today.getTimezoneOffset() * 60000; //60000 timezone with milliseconds 
    var today = (new Date(Date.now() - offset)).toISOString().slice(0, -8); 
    return today;
}

//gets the closest non-past due assignment
function findClosestDue(ListAssignments){
    //console.log(ListAssignments);
    if(ListAssignments.length == 0){ //edge case for no assignments
        return null;
    }
    var currentClossest =ListAssignments[0];
    for(var i =0; i < ListAssignments.length; i++){
        if(ListAssignments[i].dueDate < currentClossest.dueDate){
            currentClossest = ListAssignments[i];
        }   
    }
    if(currentClossest ){

    }
    return currentClossest;
}


function findPastDue(listOfAssignments){

}

function LogoutUser(){
    $.ajax({
        url:"/Logout",
        type: "POST",
        success: function (response){
            window.location.replace('./login')
        }
    });
    localStorage.clear()
}

function updateClass(newClassObj){
    var jsonObj = JSON.stringify(newClassObj);
    localStorage.setItem(newClassObj.name, jsonObj);
}

$(window).resize(function(){
    $('.content').css({
        'padding-top' : $('.Mynavbar').height() +50 +'px'
    });
});


//Inspired by system from: https://stackoverflow.com/questions/18368319/toggle-css-sheets-on-click-with-javascript
function toggle(){
    var s1 = document.getElementById("DefaultFonts");
    var s2 = document.getElementById("ReadabilityFonts");
    if(s1.disabled){
        document.body.style.zoom = "100%";
        s1.disabled = undefined;
        s2.disabled = "disabled";
    }
    else{
        document.body.style.zoom = "125%";
        s1.disabled = "disabled";
        s2.disabled = undefined;
    }
}
src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";

function populateQuickView(){
    
    // empties classList div, doesn't delete
    document.getElementById("AllAssignments").innerHTML = "";
   
    var classList = getClassList(); //array of class objects

    //console.debug(classList);
    // makes classes reverse display 
    // color not saved ATM
    var assignmentList =[];

    classList.forEach((classObj) => {
        //var className = classObj.name;
        for(var i =0; i < classObj.assignments.length; i++){
            assignmentList.push(classObj.assignments[i]);
        }
        
        
        
        // use check to get assignments properly ordered 
    });

    console.log(assignmentList);
    assignmentList = sortAssignment(assignmentList);
    var size = assignmentList.length;
    // loops through array of assignments and add each one to page
    for(var i =0; i < size; i++){
        //console.log(assignmentList[index]);
        PopulateAssignments(assignmentList[i], "AllAssignments");
    }
    var classeslist = getClassList();
    colorAllAssignment(classeslist);

}
