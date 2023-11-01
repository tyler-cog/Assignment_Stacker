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