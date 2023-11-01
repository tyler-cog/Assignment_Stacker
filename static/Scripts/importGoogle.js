import {PythonShell} from 'python-shell';


function getGoogleClasses(){
    //run python script to generate googleClassObjs.json
    PythonShell.run(
        'createGoogleClasses.py',
        null,
        function(err){
            if(err) throw err;
            console.log('python finished');
        }
    );
}

function parseClassListJson(){
    jsonData = require('./googleClassObjs.json');
    console.log(jsonData)
}