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
