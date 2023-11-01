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

function CT(Option){
    $('#ImportInfo').collapse();
    if(Option == "none"){
        $('#ImportInfo').collapse("hide");
    }
    else if(Option == "Canvas"){
        clearImportCont(); //clear any other content

        addinfoGet("#CanvasInfoTemp");
        var check;
        $('#ImportInfo').collapse("show");
    }
    else if(Option == "Google"){
        clearImportCont();

        addinfoGet("#ClassRoomTemp");
        $('#ImportInfo').collapse("show");
    }
    
}
function clearImportCont(){
    document.getElementById("CollapseCont").innerHTML ="";
}


function addinfoGet(fromTemp){
    var NewHTML = document.querySelector(fromTemp).content;
    NewHTML= NewHTML.cloneNode(true);
    document.getElementById("CollapseCont").append(NewHTML);
}


function  ImportAPICanvas(){
    document.getElementById('SelectLocation').innerHTML = `<div class="loader"></div>`;
    // var userToken = document.getElementById("CanvasConnect").value;
    //function for api call here (return file or bool)
    // getCanvasCoursesJSON();
    storeUserToken();
    getCanvasCourses();
    //populate options here (with json results)
    
}


function assignmentGooglePop(ClassList){
    var listlen = ClassList.length;
    document.getElementById('SelectLocation').innerHTML = ``;
    //var optionObj = ; //will hold the options

    //add options for dropdown to temperary div
    var userClasses = getClassList();
    console.log("USER CLASSES");
    console.log(userClasses);


    

    for(var i =0; i < listlen; i++){
        var NewHTML = document.querySelector('#PlaceLocTemp').content;
        NewHTML= NewHTML.cloneNode(true);
        //document.getElementById("CollapseCont").append(NewHTML);


        //note: this works because there is only one of each
        var cur = NewHTML.querySelectorAll('div')[0]; //div
        cur.setAttribute('id', '' + cur.id +i);
        
        cur = NewHTML.querySelectorAll('select')[0]; //select
        cur.setAttribute('id', '' + cur.id +i);
        //console.log(cur.id);

        //console.log(NewHTML.querySelectorAll('select'));
        cur = NewHTML.querySelectorAll('label')[0]; //label
        cur.setAttribute('id', ''+ cur.id +i);
        cur.setAttribute('for', ''+ cur.for +i);

        //add all valid options
        
        //document.getElementById('NewLoc'+ i).innerHTML += optionObj.innerHTML;
        document.getElementById('SelectLocation').appendChild(NewHTML);

        // used number to determine order later on, what are other options? 
        // added 1 to make it look more presentable 
        document.getElementById('locText'+i).innerText = (ClassList[i].order + 1) +  ': Place Contents from "' + ClassList[i].name + '" into:';
       
        for(var j =0; j < userClasses.length; j++){
            // optionObj.innerHTML += `<option value="`+ ClassList[i].name +`" selected> `+ ClassList[i].name +`</option>`;
            var opt = document.createElement('option');
            opt.value= userClasses[j].name;
            opt.innerHTML = userClasses[j].name;
            //console.log('NewLoc'+ i);
            document.getElementById('NewLoc'+ i).appendChild(opt);
        }
        
    }

    var but = document.createElement('button');
    but.setAttribute('class',"importbutton");
    but.innerHTML = 'Submit Changes';
    but.setAttribute('onclick', 'FinalizeGoogle()');

    //flask does not play nice with multi class so this is needed
    var centDiv = document.createElement('div');
    centDiv.setAttribute('class', 'CenterElement');
    centDiv.appendChild(but);
    
    document.getElementById('SelectLocation').appendChild(centDiv);
    return; //returns nothing atm
}


function assignmentCanvasPop(ClassList){
    var listlen = ClassList.length;
    document.getElementById('SelectLocation').innerHTML = ``;
    //var optionObj = ; //will hold the options

    //add options for dropdown to temperary div
    console.log("COURSESLIST BEFORE");
    console.log(ClassList);
    console.log("COURSESLIST AFER");
    console.log(courseList);
    var userClasses = getClassList();
    console.log("USER CLASSES");
    console.log(userClasses);


    
    var i = 0
    ClassList.forEach(classObj => {
        var NewHTML = document.querySelector('#PlaceLocTemp').content;
        NewHTML= NewHTML.cloneNode(true);
        //document.getElementById("CollapseCont").append(NewHTML);


        //note: this works because there is only one of each
        var cur = NewHTML.querySelectorAll('div')[0]; //div
        cur.setAttribute('id', '' + cur.id +i);
        
        cur = NewHTML.querySelectorAll('select')[0]; //select
        cur.setAttribute('id', '' + cur.id +i);
        //console.log(cur.id);

        //console.log(NewHTML.querySelectorAll('select'));
        cur = NewHTML.querySelectorAll('label')[0]; //label
        cur.setAttribute('id', ''+ cur.id +i);
        cur.setAttribute('for', ''+ cur.for +i);

        //add all valid options
        
        //document.getElementById('NewLoc'+ i).innerHTML += optionObj.innerHTML;
        document.getElementById('SelectLocation').appendChild(NewHTML);

        // used number to determine order later on, what are other options? 
        // added 1 to make it look more presentable 
        // var courseCount = parseInt(key) + 1;
        document.getElementById('locText'+i).innerText = (classObj.order + 1) + ': Place Contents from "' + classObj.name + '" into:';
       
        for(var j =0; j < userClasses.length; j++){
            // optionObj.innerHTML += `<option value="`+ ClassList[i].name +`" selected> `+ ClassList[i].name +`</option>`;
            var opt = document.createElement('option');
            opt.value= userClasses[j].name;
            opt.innerHTML = userClasses[j].name;
            //console.log('NewLoc'+ i);
            document.getElementById('NewLoc'+ i).appendChild(opt);
        }
        i++;
    });

    var but = document.createElement('button');
    but.setAttribute('class',"importbutton");
    but.innerHTML = 'Submit Changes';
    but.setAttribute('onclick', 'FinalizeCanvas()');

    //flask does not play nice with multi class so this is needed
    var centDiv = document.createElement('div');
    centDiv.setAttribute('class', 'CenterElement');
    centDiv.appendChild(but);
    
    document.getElementById('SelectLocation').appendChild(centDiv);
    return; //returns nothing atm
}


function ImportAPIGoogle(){
    document.getElementById('SelectLocation').innerHTML = `<div class="loader"></div>`;

    //function for api call here (return file or bool)
    var classList = [];
    //on success it will call display classList
    
    //classList = getClassList();
    //assignmentPop(classList);
    classList = getGoogleJSONs();

}

//this function calls python script to generate googleClassObjs.json
//and call assignmentPop to generate the collapses
function getGoogleJSONs(){

    var classList = [];
    $.ajax({
        url:"/bgGoogleImport",
        type: "GET",
        async: false,
        contentType: "application/json",
        success: function (response){
            if(response == "NO TOKEN"){
                alert("Please connect your Google account");
                location.href = "./GoogleSignIn";
            } else{
                classList = JSON.parse(response);
                assignmentGooglePop(classList);
                storeGoogleImports(classList);   
            }
        }
    });
    return classList;
}

function storeUserToken(){
    // probably will be moved later but this puts userToken in "memory" (?)
    // console.log(userToken);
    var userToken = document.getElementById("CanvasConnect").value;
    $.ajax({
        type: "POST",
        url: '/bgGetUserToken',
        contentType: "application/json",
        async: false,
        data: JSON.stringify({token: userToken}),
        dataType: "json",
        success: function(response) {
            console.log(response);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

// used to create a new class from import
function storeCourseID(courseINFO){
    // probably will be moved later but this puts userToken in "memory" (?)
    // console.log(userToken);
    // var userToken =  '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm';
    console.log("STORING THIS COURSE INFO: " + courseINFO.name)
    storeUserToken()
    $.ajax({
        type: "POST",
        async: false,
        url: '/bgStoreCourseINFO',
        contentType: "application/json",
        data: JSON.stringify({  name: courseINFO.name,
                                id: courseINFO.ID


        }),
        dataType: "json",
        success: function(response) {
            console.log(response);
            try{
                getCanvasAssignment();
            }
            catch(err) {
                print("error occured, retrying")
                getCanvasAssignment();
              }
        },
        error: function(err) {
            console.log(err);
        }
    });
}

// used to add to a manual created class
function storeCourseManualID(courseINFO){
    // probably will be moved later but this puts userToken in "memory" (?)
    // console.log(userToken);
    // var userToken =  '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm';
    console.log("STORING THIS COURSE INFO: " + courseINFO.name)
    storeUserToken()
    $.ajax({
        type: "POST",
        async: false,
        url: '/bgStoreCourseINFO',
        contentType: "application/json",
        data: JSON.stringify({  name: courseINFO.name,
                                id: courseINFO.ID


        }),
        dataType: "json",
        success: function(response) {
            console.log(response);
        },
        error: function(err) {
            console.log(err);
        }
    });
}
// Gets the courses to display to user, user chooses what to import
// TODO: Need to find a way to pass user token
function getCanvasCourses(){
    // let userInfo = {
    //     'token' : '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm'
    // };
    // token = '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm';
    // const token = JSON.stringify(token);
    var classList = [];
    
    $.ajax({
        url:`/bgGetCanvasCourses`,
        type: "GET", 
        async: false,
        contentType: "application/json",
        success: function (response){
            if(response == 'INVALID CANVAS TOKEN'){
               alert("Invalid Token Entry: Please try again!") 
            } else{
                courseList = JSON.parse(response);
                console.log("Successfully Imported CourseNames \n"+ response);
                assignmentCanvasPop(courseList);
                storeCanvasImports(courseList);                
            }


            // console.log("STORING \n\n")
            // console.log(localStorage);
        }
    });
    return classList;
}


// TODO: Need to find a way to pass user token
function getCanvasAssignment(){
    // let userInfo = {
    //     'token' : '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm'
    // };
    // token = '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm';
    // const token = JSON.stringify(token);
    var classObj = {};
    
    $.ajax({
        url:`/bgGetCanvasAssignments`,
        type: "GET", 
        async: false,
        contentType: "application/json",
        success: function (response){
            classObj = JSON.parse(response);
            console.log("Successfully Imported ClassList \n"+ response);
            storeClass(classObj.name,classObj.assignments,classObj.color);
            console.log("Successfully Imported Class \n"+ classObj.name);
            // assignmentPop(classList);
            // storeImports(classList);
            // console.log("STORING \n\n")
            // console.log(localStorage);
        }
    });
    // return classObj;
}


function getCanvasAssignmentManual(selClassName){
    // let userInfo = {
    //     'token' : '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm'
    // };
    // token = '15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm';
    // const token = JSON.stringify(token);
    var classObj = {};
    
    $.ajax({
        url:`/bgGetCanvasAssignments`,
        type: "GET", 
        async: false,
        contentType: "application/json",
        success: function (response, selClassName){
            classObj = JSON.parse(response);
            console.log("Successfully Imported ClassListASDFASDFADSF \n"+ response);
            console.log("SELCALSSNAME \n"+ selClassName);
            // addToClass(selClassName, classObj.assignments);
            console.log("CLASS OBJ ASSIGNMENTS : " + classObj.assignments);

        }
    });
    return classObj;
}

//this function makes an ajax call to add assignments from an imported class INTO an already existing class
//this function takes in a className that is currently in DB storage and adds all the assignments in assignment list
function appendAssignmentList(className, importAssignmentList){
    console.log(className);
    console.log(importAssignmentList);
    classObj = getClass(className);
    assignmentList = classObj.assignments;

    importAssignmentList.forEach(importAssignmentObj => {
        importAssignmentObj.class = className;
        assignmentList.push(importAssignmentObj);
        console.log(JSON.stringify(importAssignmentObj));
    });

    classObj.assignments = assignmentList;
    var jsonObj = JSON.stringify(classObj);
    localStorage.setItem(className, jsonObj);
}




function storeGoogleImports(classList){
    classList.forEach(classObj => {
        importClassName = "IMPORTING-TEMP"+classObj.name;
        // importAssignment = classObj.assignments;
        importColor = classObj.color;
        importOrder = classObj.order;
        importAssign = classObj.assignments;
        // console.log("IMPORT FROM CANVAS");
        // console.log(importClassName);
        storeTempClass(importClassName, importAssign, importColor, importOrder);
    });
    // console.log("AFTER STORING CLASSES");
    // console.log(localStorage);

}

function storeCanvasImports(classList){
    console.log("STOREIMPORTSCANVAS");
    console.log(classList);
    classList.forEach(classObj => {
        importClassName = "IMPORTING-TEMP"+classObj.name;
        // importAssignment = classObj.assignments;
        importColor = classObj.color;
        importOrder = classObj.order;
        importID = classObj.id;
        // console.log("IMPORT FROM CANVAS");
        // console.log(importClassName);
        storeCanvasClass(importClassName,importColor, importOrder, importID);
    });
    // console.log("AFTER STORING CLASSES");
    // console.log(localStorage);

}


function appendAssignmentListDB(className, assignmentList){
    jsonObj = JSON.stringify({class: className, assignments: assignmentList});
    $.ajax({
        url:"/bgAddImportedAssignments",
        type: "POST",
        contentType: "application/json",
        data: jsonObj,
        async: false,
        dataType: 'json',
        success: function (response){
        }
    });
}



//this function will pull all TEMP classes from local storage & remove them
function getTempClassObjs(){
    classList = getClassList();
    // console.log("CLASS LIST IN LOCAL STORAGE");
    // console.log(classList);
    importedClassObjs = []; // array of classObjs
    classList.forEach(classObj => {
        className = classObj.name;
        if(className.startsWith("IMPORTING-TEMP")){
            //rename classObj copy
            classObj.name = className.substring(14);
            //append imported classObj without IMPORTING-TEMP
            importedClassObjs.push(classObj);
            //delete item in localstorage with IMPORTING-TEMP
            deleteClass(className);
        }
    });
    return importedClassObjs;
}

function FinalizeGoogle(){
    //these are the classObjs that were imported
    var importedClassObjs = getTempClassObjs();
    //TODO implement logic to iterate through loc0-locX
    for(var i = 0; i < importedClassObjs.length;i++){
        // gets the selected className to import to
        var selecter = document.getElementById('NewLoc'+ i);
       
        var selClassName = selecter.options[selecter.selectedIndex].value;
        // console.log("selecterthtgh");
        // console.log(selecter.selectedIndex);
        if(selClassName != "None"){
            if (selClassName == "New"){
                // checks the inner text to find correct order 
                var check = document.getElementById('locText'+i).innerText;
                var order = check.substr(0, check.indexOf(':'));
                // change order to int to compare with order of classes
                // takes out fake 1 
                order = parseInt(check) - 1;
                // loops back through list to find the correct class via order
                for(var j = 0; j < importedClassObjs.length;j++){
                    if (importedClassObjs[j].order == order){
                        // stores class and populates page when user goes to Home.html
                        storeClass(importedClassObjs[j].name,importedClassObjs[j].assignments,importedClassObjs[j].color, importedClassObjs[j].order);
                    }
                }    
            }
            else{
                // checks the inner text to find correct order 
                var check = document.getElementById('locText'+i).innerText;
                var order = check.substr(0, check.indexOf(':'));
                // change order to int to compare with order of classes
                // takes out fake 1 
                order = parseInt(check) - 1;
                // loops back through list to find the correct class via order
                for(var j = 0; j < importedClassObjs.length;j++){
                    if (importedClassObjs[j].order == order){
                        appendAssignmentList(selClassName, importedClassObjs[j].assignments);
                        appendAssignmentListDB(selClassName, importedClassObjs[j].assignments);
                    }
                }
            }
        }
    }
    //clear content when done
    document.getElementById('SelectLocation').innerHTML ='';
    generatePopulateGets();
}


function FinalizeCanvas(){
    // TODO: Need to implement loader 
    // var loadDiv = document.createElement('div');
    // loadDiv.setAttribute('class', 'loader');
    // // loadDiv.appendChild(but);
    
    // document.getElementById('SelectLocation').appendChild(loadDiv);
    // document.getElementById('SelectLocation').innerHTML = `<div class="loader"></div>`;
    //these are the classObjs that were imported
    var importedClassObjs = getTempClassObjs();
    //TODO implement logic to iterate through loc0-locX
    var storeCourseList = {}
    for(var i = 0; i < importedClassObjs.length;i++){
        // gets the selected className to import to
        var selecter = document.getElementById('NewLoc'+ i);
       
        var selClassName = selecter.options[selecter.selectedIndex].value;
        
       
        if(selClassName != "None"){
            // creates new Class from import
            if (selClassName == "New"){

                // checks the inner text to find correct order 
                var check = document.getElementById('locText'+i).innerText;
                var order = check.substr(0, check.indexOf(':'));
                // change order to int to compare with order of classes
                // takes out fake 1 
                order = parseInt(check) - 1;

                // loops back through list to find the correct class via order
                for(var j = 0; j < importedClassObjs.length;j++){
                    if (importedClassObjs[j].order == order){
                        console.log("Adding THIS COURSE ");
                        console.log(importedClassObjs[j].name);
                        storeCourseList["name"] = importedClassObjs[j].name
                        storeCourseList["ID"] = importedClassObjs[j].ID
                        storeCourseID(importedClassObjs[j]);
                        
                       
                    }
                }    
            }
             // adds to already existing class
            else{
                // checks the inner text to find correct order 
                var check = document.getElementById('locText'+i).innerText;
                var order = check.substr(0, check.indexOf(':'));
                // change order to int to compare with order of classes
                // takes out fake 1 
                order = parseInt(check) - 1;
                // loops back through list to find the correct class via order
                for(var k = 0; k < importedClassObjs.length;k++){
                    if (importedClassObjs[k].order == order){
                        storeCourseManualID(importedClassObjs[k]);
                        classObj = getCanvasAssignmentManual(selClassName);
                        appendAssignmentList(selClassName, classObj.assignments);
                        appendAssignmentListDB(selClassName, classObj.assignments);
                    }
                }
            }
        }
    }
    //clear content when done
    document.getElementById('SelectLocation').innerHTML ='';
    generatePopulateGets();
}

function PopulateImporterOptions(Canvas, Google){
    //todo
    if(Canvas != ''){
        CreateOptionPannel(Canvas, 'Canvas', 'CanvasDelete', 'CanvasForceImport');
    }
    if(Google == 1){
        CreateOptionPannel('Google Account Linked', 'Google Classroom', 'GoogleDelete', 'GoogleForceImport');
    }

    
}

function CreateOptionPannel(info, Type, deleteFunctionName, RequestFuctionName){

    
    var id = Type.replaceAll(' ', '_');
    var Data = info; 

    var NewHTML = document.querySelector("#currentAPITemp").content;

    NewHTML= NewHTML.cloneNode(true); //true makes this recursive (copy all in assignment)    
    
    //fix all ids befor adding
    for(var i=0; i <NewHTML.querySelectorAll('div').length; i++){
        var cur = NewHTML.querySelectorAll('div')[i];
        cur.setAttribute('id', ''+cur.id + id);
        
    }
    for(var i=0; i< NewHTML.querySelectorAll('button').length; i++){
        var cur = NewHTML.querySelectorAll('button')[i];
        cur.setAttribute('id', ''+cur.id + id);
    }
    for(var i=0; i< NewHTML.querySelectorAll('input').length; i++){
        var cur = NewHTML.querySelectorAll('input')[i];
        cur.setAttribute('id', ''+cur.id + id);
    }
    for(var i=0; i< NewHTML.querySelectorAll("label").length; i++){
        var cur = NewHTML.querySelectorAll('label')[i];
        cur.setAttribute('for', ''+cur.getAttribute('for') + id);
    }
    for(var i=0; i< NewHTML.querySelectorAll("select").length; i++){
        var cur = NewHTML.querySelectorAll('select')[i];
        cur.setAttribute('id', ''+cur.id + id);
    } 


    document.getElementById('Locations').appendChild(NewHTML);
    //can use getelementByID after adding


    var overviewlink = document.getElementById('View'+ id);
    overviewlink.setAttribute('data-bs-target', ''+overviewlink.getAttribute("data-bs-target") + id);


    if(typeof(onclick) != "function"){
        document.getElementById('RequestB'+ id).setAttribute('onclick', ""+RequestFuctionName+"('" + id + "','" + Data +"')");
    }
    // else{
    //     document.getElementById('RequestB'+ id).onclick = function(){ForceRequest(id, Data)};
    // }

    if(typeof(onclick) != "function"){
        document.getElementById('RemoveB'+ id).setAttribute('onclick', ''+deleteFunctionName+"('" + id + "','" + Data +"')");
    }
    // else{
    //     document.getElementById('RemoveB'+ id).onclick = function(){DeleteRequest(id, Data)};
    // }
    

    

    document.getElementById('LocationType'+ id).innerText = Type;
    if(Data.length >35){
        Data =Data.substr(0, 35);
    }
    document.getElementById('info'+ id).innerHTML =Data;
}


/**
 * This function is desinged to forcfully make a server side update of the content comming from this source
 */
function GoogleDelete(){
    $.ajax({
        url:"/bgDeleteCurrUserGoogleData",
        type: "GET",
        async: false,
        contentType: "application/json",
        success: function (response){
            location.reload();
        }
    });
}
/**
 * this function is used to send a request to the server to stop the import from this location and delete all related information to the process 
 */
function GoogleForceImport(){
    $.ajax({
        url:"/refreshGoogleClasses",
        type: "GET",
        async: false,
        contentType: "application/json",
        success: function (response){
            location.reload();
        }
    });
}


/**
 * this function is used to send a request to the server to stop the import from this location and delete all related information to the process 
 */
function CanvasDelete(importType, token){
    $.ajax({
        url:"/bgDeleteCurrUserCanvasData",
        type: "GET",
        async: false,
        contentType: "application/json",
        success: function (response){
            location.reload();
        }
    });
}

function CanvasForceImport(importType, token){
    $.ajax({
        url:"/refreshCanvasClasses",
        type: "GET",
        async: false,
        contentType: "application/json",
        success: function (response){
            location.reload();
        }
    });
}

/**
 * This function is called by the remove phone number button
 */
function RemovePhoneNumberButton(){
    //call function do deal with db
    document.getElementById('PhoneNumberField').value ='';
    var noNumber= document.getElementById('PhoneNumberField').value;

    $.ajax({
        url:"/bgRemoveNum",
        type: "POST",
        async: false,
        contentType: "application/json",
        success: function (){
            // classList = JSON.parse(response);
            // assignmentGooglePop(classList);
            // storeGoogleImports(classList);
            console.log("Phone Number Removed Successfully");
        }
    });
    // var test = returnUserPhoneNumber();
    // console.log("test");
    // console.log(test);
}
/**
 * Called by set phone number button
 */
function AddNumberButton(){ 
    var number = document.getElementById('PhoneNumberField').value;
    var numWithoutDash = number.replaceAll('-', '');
    console.log(number + " " +numWithoutDash);
    if(numWithoutDash.length != 10){
        alert("This is not a valid number. Please follow the format 'xxx-xxx-xxxx'");
        return;
    }
    //call function for working with database here
    // sendSMS(numWithoutDash, sendNotif);
    storeNum = {}
    storeNum["phoneNum"] = numWithoutDash;
    storeNum = JSON.stringify(storeNum);
    $.ajax({
        url:"/bgStoreNum",
        type: "POST",
        async: false,
        contentType: "application/json",
        data: storeNum,
        success: function (){
            // classList = JSON.parse(response);
            // assignmentGooglePop(classList);
            // storeGoogleImports(classList);
            console.log("Phone Number Updated Successfully");
        }
    });
    // var test = returnUserPhoneNumber();
    // console.log("test");
    // console.log(test);
}

/**
 * Makes an ajax call to get current user's phone number
 */
function returnUserPhoneNumber() {
    var phoneNum;
    $.ajax({
        url:"/bgGetUserPhone",
        type: "POST",
        async: false,
        contentType: "application/json",
        success: function (response){
            // console.log("Number returned");
            // console.log(response);
            phoneNum = response;
            return response;
        }
    });
    // console.log("num is " + num);
    return phoneNum;
}

//this function will remove temp objects when leaving page
window.onbeforeunload = function(){
    temp = getTempClassObjs();
    //console.log("leaving");
}
function generatePopulateGets(){
    var canvasToken;
    var hasValidGoogleToken;
    $.ajax({
        url:"/bgGetCurrUserTokens",
        type: "GET",
        async: false,
        contentType: "application/json",
        success: function (response){
            tokens = JSON.parse(response);
            canvasToken = tokens.canvas;
            hasValidGoogleToken = tokens.google;
            // alert(JSON.stringify(tokens));
            // console.log("Google Status: ", hasValidGoogleToken);
            // console.log("Canvas Token: ", canvasToken);
        }
    });
    PopulateImporterOptions(canvasToken, hasValidGoogleToken);
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