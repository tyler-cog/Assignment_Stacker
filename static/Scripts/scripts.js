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