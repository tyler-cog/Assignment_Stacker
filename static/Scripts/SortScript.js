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