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