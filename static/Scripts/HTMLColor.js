
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