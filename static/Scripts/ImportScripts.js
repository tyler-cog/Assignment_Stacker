
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
    document.getElementById('Locations').innerHTML='';
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
            PopulateImporterOptions(canvasToken, hasValidGoogleToken);
            // alert(JSON.stringify(tokens));
            // console.log("Google Status: ", hasValidGoogleToken);
            // console.log("Canvas Token: ", canvasToken);
        }
    });
    
}