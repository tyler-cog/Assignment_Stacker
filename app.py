## GOOGLE API IMPORTS
from __future__ import print_function
from getpass import getuser

import os.path
import sys
import shutil

import json
from datetime import date
from datetime import datetime
from datetime import timedelta
from xml.dom.minidom import TypeInfo
from dateutil import tz

import google.oauth2.credentials
import google_auth_oauthlib.flow 
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
import googleapiclient.discovery
from googleapiclient.errors import HttpError
## END OF GOOGLE API IMPORTS

#Canvas
import requests
import re
from requests.structures import CaseInsensitiveDict

import vonage
import time

import flask
import flask_session
from flask import Flask
from flask import flash
from flask import request
from flask import jsonify 
from flask import session
from flask_wtf import FlaskForm
from sqlalchemy import outerjoin
from wtforms import StringField, SubmitField, PasswordField
from wtforms.validators import DataRequired
from flask import url_for
from flask import request
from flask import redirect
from flask_sqlalchemy import SQLAlchemy
from flask import render_template
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
#pip install flask_assets for this to work
from flask_assets import Bundle, Environment

#import threading
import time

js = Bundle('Scripts/HTMLColor.js', 'Scripts/AssignmentCreatingScripts.js', 'Scripts/SortScript.js', 'Scripts/JSONGetsAndSets.js', 'Scripts/scripts.js', 'Scripts/QuickViewScript.js', output='gen/home.js')
js2 = Bundle('Scripts/HTMLColor.js', 'Scripts/scripts.js', 'Scripts/QuickViewScript.js','Scripts/JSONGetsAndSets.js','Scripts/SortScript.js','Scripts/AssignmentCreatingScripts.js', output='gen/quick.js')
js3 = Bundle('Scripts/JSONGetsAndSets.js', 'Scripts/ImportScripts.js', 'Scripts/AssignmentCreatingScripts.js', 'Scripts/scripts.js', output='gen/import.js')
app = Flask(__name__)

assets = Environment(app)
assets.register('home_js', js)
assets.register('quick_js', js2)
assets.register('import_js', js3)

#Google Scopes
SCOPES = ['https://www.googleapis.com/auth/classroom.courses.readonly', 'https://www.googleapis.com/auth/classroom.coursework.me']

#initialize database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://jtolkphovgxpcs:f8678953153080b775c3ca08bb6abfb45fb82015bfc79e9f5ba38994e708f5cb@ec2-52-86-115-245.compute-1.amazonaws.com:5432/dfh67sk8i9h2b'
app.config['SECRET_KEY'] = "Superduper secret key NOBODY KNOWS WHAT IT IS"
db = SQLAlchemy(app)

#Flask login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))

#db model
class Users(db.Model, UserMixin):
    id = db.Column(db.Integer,primary_key = True, nullable = False )
    userName = db.Column(db.String(100), nullable = False, unique = True)
    userPassword = db.Column(db.String(100), nullable = False)
    classes = db.Column(db.Text, nullable = True)
    googleToken = db.Column(db.Text, nullable = True)
    canvasBearer = db.Column(db.String(200), nullable = True)
    phone = db.Column(db.String(20), nullable = True)

    #function that returns string when something is added for testing
    #returns UserInfoObj 
    def __repr__(self):
        return '{\n"UserName": "'+self.userName+'",\n "Password": "'+ self.userPassword+'",\n "canvasBearer": "'+ self.canvasBearer +'",\n "googleToken": "'+self.googleToken+'",\n "classObjs": '+self.classes+',\n "Phone": '+self.phone+'\n}'

############# Queries needed for refreshing DB ####################


@app.route('/refreshGoogleClasses', methods = ['GET', 'POST'])
def refreshGoogleDB():
    #get a list of all existing users
    userList = Users.query.all()
    numUsers = len(userList)

    #iterate through all existing users
    for i in range(numUsers):
        userID = userList[i].id
        token = userList[i].googleToken
        if(token != '{}'):
            # print(str(credsDictionary))
            # sys.stdout.flush()
            # print(str(json.loads(token)))
            # sys.stdout.flush()
            creds = google.oauth2.credentials.Credentials(**json.loads(token))
            # gets classList of loadedUse token 
            incomingClassList = refreshGoogleJSONs(creds)
            if(incomingClassList != []):
                #incomingClassList = [{'name': 'CSCE315', 'color': 'rgb(162, 214, 161);', 'assignments': [{'name': 'HW1', 'class': 'CSCE315', 'priority': 3, 'dueDate': '2022-05-13T23:59', 'startDate': '2022-04-13T00:36', 'link': 'https://classroom.google.com/c/NTAwMjk2MDEyNTU4/a/NTAwMjk2MDEyNjI1/details', 'relatedLinks': '', 'notes': 'This is a test HW assignment.\nThis would be the instructions of an assignment.', 'googleLocation': 'CSCE315', 'canvasLocation': '', 'complete': False}], 'order': 0}, {'name': 'Project 3 Demo Course', 'color': 'rgb(162, 214, 161);', 'assignments': [{'name': 'FINAL', 'class': 'Project 3 Demo Course', 'priority': 3, 'dueDate': '2022-05-19T23:59', 'startDate': '2022-04-13T16:58', 'link': 'https://classroom.google.com/c/MzU0NDUyMDYwODEy/a/NTAwNDQ5MTUzMzQy/details', 'relatedLinks': '', 'notes': 'Very difficult test, not fun.', 'googleLocation': 'Project 3 Demo Course', 'canvasLocation': '', 'complete': False}, {'name': 'MIDTERM ', 'class': 'Project 3 Demo Course', 'priority': 3, 'dueDate': '2022-05-06T23:59', 'startDate': '2022-04-13T16:57', 'link': 'https://classroom.google.com/c/MzU0NDUyMDYwODEy/a/NTAwNDQ5MTUzMTg5/details', 'relatedLinks': '', 'notes': 'Whoa, its the instructions for my midterm!', 'googleLocation': 'Project 3 Demo Course', 'canvasLocation': '', 'complete': False}], 'order': 1}]
                incomingAssignmentList = getAssignments(incomingClassList)
                existingClassList = getUserClasses(userID)
                for j in range(len(existingClassList)):
                    existingAssignments = existingClassList[j]['assignments']
                    currentClass = existingClassList[j]['name']
                    #this calls function that returns a list of all googleClasses contained in a class
                    containedGoogleClasses = getAllGoogleLocationsInExistingClass(existingClassList[j])
                    refreshedAssignments = refreshGoogleAssignmentList(existingAssignments, incomingAssignmentList, containedGoogleClasses, currentClass)
                    print(str(refreshedAssignments))
                    sys.stdout.flush()
                    #replace the existing class' assignmentList with the refreshedAssignments
                    existingClassList[j]['assignments'] = refreshedAssignments
                    #print(Users.query.filter_by(id = userID).first().classes)
                    #print(str(existingClassList[j]))
                Users.query.filter_by(id = userID).first().classes = json.dumps(existingClassList)
                

    db.session.commit()
    return str(existingClassList[0])

@app.route('/refreshCanvasClasses', methods = ['GET', 'POST'])
def refreshCanvasDB():
    #get a list of all existing users
    userList = Users.query.all()
    numUsers = len(userList)

    #iterate through all existing users
    for i in range(numUsers):
        userID = userList[i].id
        token = userList[i].canvasBearer
        if(token != ''):
            # i think is canvastoken
            # canvasBearer = json.loads(token)
            # print(str(credsDictionary))
            # sys.stdout.flush()
            # creds = google.oauth2.credentials.Credentials(**credsDictionary)
            # gets classList of loadedUse token 
            incomingClassList = refreshCanvasJSONs()
            
            if(incomingClassList != []):
                #incomingClassList = [{'name': 'CSCE315', 'color': 'rgb(162, 214, 161);', 'assignments': [{'name': 'HW1', 'class': 'CSCE315', 'priority': 3, 'dueDate': '2022-05-13T23:59', 'startDate': '2022-04-13T00:36', 'link': 'https://classroom.google.com/c/NTAwMjk2MDEyNTU4/a/NTAwMjk2MDEyNjI1/details', 'relatedLinks': '', 'notes': 'This is a test HW assignment.\nThis would be the instructions of an assignment.', 'googleLocation': 'CSCE315', 'canvasLocation': '', 'complete': False}], 'order': 0}, {'name': 'Project 3 Demo Course', 'color': 'rgb(162, 214, 161);', 'assignments': [{'name': 'FINAL', 'class': 'Project 3 Demo Course', 'priority': 3, 'dueDate': '2022-05-19T23:59', 'startDate': '2022-04-13T16:58', 'link': 'https://classroom.google.com/c/MzU0NDUyMDYwODEy/a/NTAwNDQ5MTUzMzQy/details', 'relatedLinks': '', 'notes': 'Very difficult test, not fun.', 'googleLocation': 'Project 3 Demo Course', 'canvasLocation': '', 'complete': False}, {'name': 'MIDTERM ', 'class': 'Project 3 Demo Course', 'priority': 3, 'dueDate': '2022-05-06T23:59', 'startDate': '2022-04-13T16:57', 'link': 'https://classroom.google.com/c/MzU0NDUyMDYwODEy/a/NTAwNDQ5MTUzMTg5/details', 'relatedLinks': '', 'notes': 'Whoa, its the instructions for my midterm!', 'googleLocation': 'Project 3 Demo Course', 'canvasLocation': '', 'complete': False}], 'order': 1}]
                
                incomingAssignmentList = getAssignments(incomingClassList)
                # print("incoming assignment List")
                # print(incomingAssignmentList)
                existingClassList = getUserClasses(userID)
                # print("OLD CLASSES")
                # print(existingClassList)
                # print()
                for j in range(len(existingClassList)):
                    existingAssignments = existingClassList[j]['assignments']
                    currentClass = existingClassList[j]['name']
                    # print("currentclass")
                    # print(currentClass)
                    # print()
                    # print("existing assignments List")
                    # print(existingAssignments)
                    # print()
                    #this calls function that returns a list of all canvasClasses contained in a class
                    containedCanvasClasses = getAllCanvasClassesInExistingClass(existingClassList[j])
                    refreshedAssignments = refreshCanvasAssignmentList(existingAssignments, incomingAssignmentList, containedCanvasClasses, currentClass)
                    # print("Refreshed assignments")
                    # print(str(refreshedAssignments))
                    sys.stdout.flush()
                    #replace the existing class' assignmentList with the refreshedAssignments
                    existingClassList[j]['assignments'] = refreshedAssignments
                    #print(Users.query.filter_by(id = userID).first().classes)
                    #print(str(existingClassList[j]))
                # print()
                # print("NEW CLASSES")
                # print(existingClassList)
                currClasses = Users.query.filter_by(id = userID).first().classes
                # print("curr classes")
                # print(currClasses)
                Users.query.filter_by(id = userID).first().classes = json.dumps(existingClassList)
                

    db.session.commit()
    return str(existingClassList)

#tool function to get UserClasses
#returns it as a list of dictionarires
def getUserClasses(userID):
    classText = Users.query.filter_by(id = userID).first().classes
    if(classText == '{}' or classText == '' or classText == []):
        returnList = []
    else:
        returnList = json.loads(classText)

    # print("getUserClasses ReturnList: "+ str(type(returnList)))
    # print(returnList)
    # sys.stdout.flush()
    return returnList

@app.route("/bgGetUserPhone", methods = ['GET', 'POST'])
def getUserPhone():
    phoneNum = Users.query.filter_by(id = current_user.id).first().phone
    if(phoneNum == '{}' or phoneNum == '' or phoneNum == []):
        returnNum = ''
    else:
        returnNum = json.loads(phoneNum)

    # print("getUserClasses ReturnList: "+ str(type(returnList)))
    # print(returnList)
    # sys.stdout.flush()
    return returnNum
#this function takes in a classObj
#it returns a list of every googleClass that it contains
def getAllGoogleLocationsInExistingClass(classObj):
    assignmentList = classObj['assignments']
    googleClasses = []

    for i in range(len(assignmentList)):
        if assignmentList[i]['googleLocation'] in googleClasses:
            pass
        else:
            googleClasses.append(assignmentList[i]['googleLocation'])

    return googleClasses

#this function takes in a list of incoming assignments, a list of a class' existing assignments,
    # and a list of all of the googleClasses stored in that class
#it returns an updated list of assignments for that class 
def refreshGoogleAssignmentList(existingAssignments, incomingAssignmentList, googleLocations, className): 
    updatedAssignments = [] #result list

    #iterate through all existing assignments
    for i in range (len(existingAssignments)):
        #add all manual assignments first
        if(existingAssignments[i]['googleLocation'] == ''):
            updatedAssignments.append(existingAssignments[i])

    #iterate through all incomingAssignments
    for i in range (len(incomingAssignmentList)):
        #check if this class is stored within this class
        if incomingAssignmentList[i]['googleLocation'] in googleLocations:
            incomingAssignmentList[i]['class'] = className
            updatedAssignments.append(incomingAssignmentList[i])

    #print(updatedAssignments)
    return updatedAssignments

#it returns a list of every canvasClass that it contains
def getAllCanvasClassesInExistingClass(classObj):
    assignmentList = classObj['assignments']
    canvasClasses = []

    for i in range(len(assignmentList)):
        if assignmentList[i]['canvasLocation'] in canvasClasses:
            pass
        else:
            canvasClasses.append(assignmentList[i]['canvasLocation'])

    return canvasClasses       

#it returns an updated list of assignments for that class 
def refreshCanvasAssignmentList(existingAssignments, incomingAssignmentList, canvasLocations, className): 
    updatedAssignments = [] #result list
    
    #iterate through all existing assignments
    for i in range (len(existingAssignments)):
        #add all manual assignments first
        if(existingAssignments[i]['canvasLocation'] == ''):
            if (existingAssignments[i]['complete'] == True):
                continue
            else:
                updatedAssignments.append(existingAssignments[i])

    #iterate through all incomingAssignments
    completeCheck = False
    for i in range (len(incomingAssignmentList)):
        #check if this class is stored within this class
        if incomingAssignmentList[i]['canvasLocation'] in canvasLocations:
            incomingAssignmentList[i]['class'] = className
            # check existing assignments for completetion / pass over info 
            for j in range (len(existingAssignments)):
                if (incomingAssignmentList[i]['name'] == existingAssignments[j]['name']):
                    if (existingAssignments[j]['complete'] == True):
                        completeCheck = True
                        continue
                    incomingAssignmentList[i]['notes'] = existingAssignments[j]['notes']
                    incomingAssignmentList[i]['relatedLinks'] = existingAssignments[j]['relatedLinks']

            if (completeCheck == True):
                completeCheck = False
                continue
            updatedAssignments.append(incomingAssignmentList[i])
    return updatedAssignments

#this function takes a list of classes and returns a list of assignments
def getAssignments(incomingClassList):
    result = []
    for i in range(len(incomingClassList)):
        assignments = incomingClassList[i]['assignments']
        for j in range(len(assignments)):
            result.append(assignments[j])
    return result

#gets a class of a user
def getClass(className, userID):
    classList = getUserClasses(userID)
    for i in range(len(classList)):
        if(classList[i]['name'] == className):
            return classList[i]
    
    return {}



def loadRefreshToken(userID):
    tokenText = Users.query.filter_by(id = userID).first().googleToken
    return json.loads(tokenText)
    

def refreshGoogleJSONs(creds):

    try:
        service = googleapiclient.discovery.build('classroom', 'v1', credentials=creds)

        # Call the Classroom API
        results = service.courses().list().execute()
        courses = results.get('courses', [])


        classList = []
        if not courses:
            return 'NONE'
        # used to keep track of classes 
        order = 0
        # Prints the names of the courses
        for course in courses:
            # Class name that will be stored
            className = course['name']
            # print(className)
            # print("\n")

            #classID for accessing coursework
            classID = course['id']

            #all users assignments in a course
            coursework = service.courses().courseWork().list(courseId=classID).execute()
            assignments = coursework.get('courseWork', [])


            # iterate through all of their coursework and create assignmentObjs in dictionarys
            assignmentList = []
            for assignment in assignments:
                #create a new assignmentObj to make JSON
                assignmentObj = {}
                assignmentObj['name'] = assignment['title']
                assignmentObj['class'] = className
                assignmentObj['priority'] = 3

                # NEED TO PARSE DATE AND TIME CORRECTLY FOR OUR FORMATTING
                assignmentDueDateGoogle = assignment['dueDate']
                assignmentDueTimeGoogle = assignment['dueTime']
                dueYear = assignmentDueDateGoogle['year']

                if(assignmentDueDateGoogle['month'] < 10):
                    dueMonth = '0'+str(assignmentDueDateGoogle['month'])
                else:
                    dueMonth = ''+str(assignmentDueDateGoogle['month'])
                    
                if(assignmentDueDateGoogle['day'] < 10):
                    dueDay = '0'+str(assignmentDueDateGoogle['day'])
                else:
                    dueDay = ''+str(assignmentDueDateGoogle['day'])
                dueHour = (assignmentDueTimeGoogle['hours'] + 19) % 24
                dueMin = assignmentDueTimeGoogle['minutes']
                
                objDueDate = str(dueYear)+ '-' + str(dueMonth)+ '-' + str(dueDay) + 'T' + str(dueHour) + ':' + str(dueMin)
                assignmentObj['dueDate'] = objDueDate


                startDateTime = str(assignment['creationTime'])

                ## Creating DateTime datatypes for comparison
                dueDateYear = int(dueYear)
                dueDateMonth = int(dueMonth)
                dueDateDay = int(dueDay)

                dueDate = date(dueDateYear, dueDateMonth, dueDateDay)
                delta = dueDate - date.today()

                ##checks if assignment is less than one days overdue, if not then displays
                isNotPastAssignment = delta > timedelta(days = 1)



                assignmentObj['startDate'] = startDateTime[0:16]


                assignmentObj['link'] = assignment['alternateLink']

                # WIP
                assignmentObj['relatedLinks'] = ''


                assignmentObj['notes'] = assignment['description']

                assignmentObj['googleLocation'] = className

                assignmentObj['canvasLocation'] = ''


                #check if the assignment has a submission
                assignmentID = assignment['id']
                studentSubmissions = service.courses().courseWork().studentSubmissions().list(courseId=classID, courseWorkId = assignmentID).execute()
                submissions = studentSubmissions.get('studentSubmissions', [])
                for submission in submissions:
                    if(submission['assignmentSubmission'] == {}):
                        assignmentObj['complete'] = False
                    else:    
                        assignmentObj['complete'] = True

                if(isNotPastAssignment):
                    assignmentList.append(assignmentObj)
            
            

            #creating classObj for each course
            #store assignmentList of each course
            #set default color for added courses
            classObj = {}
            classObj['name'] = className
            classObj['color'] = 'rgb(162, 214, 161);'
            classObj['assignments'] = assignmentList
            classObj['order'] = order
            order += 1

            classList.append(classObj)


        return classList

    except HttpError as error:
            print('An error occurred: %s' % error)

# @app.route('/refreshCanvasCourse', methods = ['GET', 'POST'])
def refreshCanvasJSONs():
    url = "https://canvas.tamu.edu/api/v1/courses?include=items&per_page=1000/"

    #eventually will take bearer token as an argument
    #token = "15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm"
    token = Users.query.filter_by(id = current_user.id).first().canvasBearer
    # print("TOKEN IN COURSES")
    # print(token)
    if(token == ''):
        return 'INVALID CANVAS TOKEN IN DATABASE'

    headers = {'Authorization' : 'Bearer '+ token}

    # print("Token")
    # print(token)
    resp = requests.get(url, headers=headers)

    # finds the max enrollment_term_id -> courses w/ this are in current semester 
    maxID = 0
    for ID in resp.json():
        # print(ID)
        currID = ID["enrollment_term_id"]
        if currID > maxID:
            maxID = currID

    # creates dictionary w/ current semesters courseIDs as the key and names as the values
    # this is done by looping through the courses again to find the ones with maxID
    courseList = []
    orderCount = 0
    for course in resp.json():
        if course["enrollment_term_id"] == maxID:     
            courseID = course["id"]
            # getting rid of JAPN for testing
            if courseID == 123752: continue
            # if courseID == 133720: continue

            # creates Dict of needed courseINFO
            courseDict = {}
            courseDict['name'] = checkInvalidChar(course["name"])
            courseDict['id'] = courseID
            courseDict['order'] = orderCount
            orderCount += 1
            courseList.append(courseDict)

    # grabs courseINFO that was passed in
    # time.sleep(1)
    # courseINFO = session.get("courseINFO")
    # courseName = courseINFO['name']
    # courseID = courseINFO['id']

    classList = []
    order = 0
    for course in courseList:
        # was used before change, may not be needed anymore
        # makes a call to get moduleINFO for each course 
        stringID = str(course['id'])
        # takes course name and replaces : since it creates error later 
        # TODO: what should the courseName be? Spaces? underscores? 
        courseName = checkInvalidChar(course['name'])
        # courseName = courseName.replace(' ','_')
        #print(courseName)

        # NOTE: currently call for assignments, takes less time, no timeout in heroku 
        url = "https://canvas.tamu.edu/api/v1/courses/"+stringID+"/assignments?include=items&per_page=1000/"

        # eventually will take bearer token as an argument
        # token = "15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm"
        headers = {'Authorization' : 'Bearer '+ token}

        resp = requests.get(url, headers=headers)
        assignmentList = []
        for assignment in resp.json():
            # moduleID = module["id"]
            # moduleDict[moduleID] = module["name"]  
            # TODO: Noticed some dates are null for assignments need to check
            assignmentObj = {}
            assignmentNameCheck = checkInvalidChar(assignment['name'])
            assignmentObj['name'] = assignmentNameCheck
            assignmentObj['class'] = courseName
            assignmentObj['priority'] = 3
            # issues with due date being null
            if (assignment['due_at'] == None):
                # print(assignmentNameCheck + " is null")
                dueDateNone = str(date.today())
                dueDateNone += "T23:59"
                assignmentObj['dueDate'] = dueDateNone
                dueDate = None
            else:
                # [:-4] gets rid of milliseconds which cause issues with dates

                assignDate = assignment['due_at'][:-1]
                assignDate = assignDate.replace('T', " ")
                
                # taken from https://stackoverflow.com/questions/4770297/convert-utc-datetime-string-to-local-datetime#comment7256053_4771733
                # METHOD 2: Auto-detect zones:
                from_zone = tz.tzutc()
                to_zone = tz.tzlocal()
                # utc = datetime.utcnow()
                utc = datetime.strptime(assignDate, '%Y-%m-%d %H:%M:%S')
                
                # Tell the datetime object that it's in UTC time zone since 
                # datetime objects are 'naive' by default
                utc = utc.replace(tzinfo=from_zone)
                
                # Convert time zone
                dueTimeFinal = str(utc.astimezone(to_zone))
                
                # parses info from date to use in final date
                dueDateNew = dueTimeFinal[0:10]
                dueTimeEnd = dueTimeFinal[13:16]
                dueTimeChange = dueTimeFinal[11:13]
                
                # creates new final due Date for assignment
                dueDateFinal = (dueDateNew + "T" + dueTimeChange + dueTimeEnd)
                #print(assignmentNameCheck + " due time is " + dueDateFinal)
                assignmentObj['dueDate'] = dueDateFinal
                
                # parses info from date to use in checking if overdue
                dueDateYear = int(assignment['due_at'][0:4])
                dueDateMonth = int(assignment['due_at'][5:7])
                dueDateDay = int(assignment['due_at'][8:10])

                dueDate = date(dueDateYear, dueDateMonth, dueDateDay)
                
            # startDate should be unlock or created at? 
            # [:-4] gets rid of milliseconds which cause issues with dates
            if (assignment['unlock_at'] == None):
                # print(assignmentNameCheck + " is null")
                startDateNone = str(date.today())
                startDateNone += "T23:59"
                assignmentObj['startDate'] = startDateNone
            else:
                # [:-4] gets rid of milliseconds which cause issues with dates
                # print(assignmentNameCheck + " is unlocked at " + assignment['unlock_at'])
                # assignmentObj['startDate'] = assignment['unlock_at'][:-4]
                assignDate = assignment['unlock_at'][:-1]
                assignDate = assignDate.replace('T', " ")
                
                # METHOD 2: Auto-detect zones:
                from_zone = tz.tzutc()
                to_zone = tz.tzlocal()
            
                utc = datetime.strptime(assignDate, '%Y-%m-%d %H:%M:%S')
            
                # Tell the datetime object that it's in UTC time zone since 
                # datetime objects are 'naive' by default
                utc = utc.replace(tzinfo=from_zone)
            
                # Convert time zone
                unlockTimeFinal = str(utc.astimezone(to_zone))

                # splits unlock time so I can append them to the correct format 
                unlockDateNew = unlockTimeFinal[0:10]
                unlockTimeEnd = unlockTimeFinal[13:16]
                unlockTimeChange = unlockTimeFinal[11:13]
                
                    # splits unlock time so I can append them to the correct format 
                unlockDateFinal = (unlockDateNew + "T" + unlockTimeChange + unlockTimeEnd)
                #print(assignmentNameCheck + " unlocks at " + unlockDateFinal)
                assignmentObj['startDate'] = unlockDateFinal
            
            assignmentObj['link'] = assignment['html_url']
            assignmentObj['relatedLinks'] = ''
            assignmentObj['googleLocation'] = ''
            assignmentObj['canvasLocation'] = courseName
            assignmentObj['complete'] = False
            assignmentObj['notes'] = ''
            # assignmentObj['notes'] = ''
            # descrip = "<h2><strong><img src=\"https://canvas.tamu.edu/courses/133720/files/36534984/download?verifier=1lviDEMOpbDLX3Z9OkQQtnVxqNSJoga5lGamNUvT\" alt=\"\" width=\"45\" height=\"45\" data-decorative=\"true\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534984\" data-api-returntype=\"File\">Week 1 Discussion</strong></h2><p>This discussion is meant to introduce you to the discussion process and to your peers. It is set up similar to the weekly discussion, but mostly you will get points just for participating. You will be split into groups of 10–15 other students in the class, this selection is random, and you will be kept with your same group members from week to week, so get to know your new friends/colleagues.&nbsp;</p><p>&nbsp;</p><h3><strong><img src=\"https://canvas.tamu.edu/courses/133720/files/36534966/download?verifier=luLPvdhYbR8Z4pJaQh5nL2y0gWM2jdoJKU1tdANk\" alt=\"\" width=\"45\" height=\"45\" data-decorative=\"true\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534966\" data-api-returntype=\"File\">Guidelines</strong></h3><p><span style=\"font-size: 14pt;\">To receive credit for the week:</span></p><ul><li><strong><span style=\"font-size: 14pt;\">note, the following dates are adjusted for this first week, initial responses will normally be due </span><span style=\"font-size: 18.6667px;\">Wednesdays</span><span style=\"font-size: 14pt;\"> and </span><span style=\"font-size: 18.6667px;\">replies</span><span style=\"font-size: 14pt;\"> on Fridays<br></span></strong></li><li><span style=\"background-color: #f1c40f;\"><strong><span style=\"font-size: large;\">Also note, in all future discussions you will be required to copy and paste your initial post into a&nbsp;separate assignment in the modules to check it with TurnItIn. I do not require that for this discussion.</span></strong></span></li><li><span style=\"font-size: 14pt;\"><span style=\"text-decoration: underline;\"><strong>by Friday Jan. 21 11:59pm</strong></span> respond to the prompt below in at least 150 words<br></span></li><li><span style=\"font-size: 14pt;\"><span style=\"text-decoration: underline;\"><strong>by Monday Jan. 24 11:59pm</strong></span> reply to at least two (2) other students' response (no word min.) with a thoughtful response to their reply</span><ul><li><span style=\"font-size: 14pt;\">Perhaps, a classmate asks a question, and you know the answer, you can respond. </span></li><li><span style=\"font-size: 14pt;\">Perhaps you classmate makes a good or interesting point, expand on that.&nbsp;</span></li><li><span style=\"font-size: 14pt;\">Try to respond to to someone that does not have a reply yet.</span></li></ul></li></ul><p>I will also monitor these discussions, and answer questions where I see a need. There are 300 of you in this course though, so I will not be able to respond to everyone each week. If you have a specific question about a topic, feel free to email me or come to my virtual office hours! I am always happy to talk more geology :)</p><p><br>BE RESPECTFUL of everyone. I will have no tolerance for rude, discriminatory, or <span>condescension</span>. If I see this behavior at all, that student will receive a zero credit for this discussion. See full statement in the syllabus.</p><p><strong><span style=\"font-size: 18pt;\">Rubric</span></strong></p><p>To see the Rubric for grading click the radio button in the upper right and \"Show Rubric.\" This will be the same rubric from week to week, but since this is \"about you\" this week, you will earn full points as long as you say something about yourself in at least 150 words and respond to two peers.&nbsp;</p><p><img src=\"https://canvas.tamu.edu/courses/133720/files/36909942/preview?verifier=t7neDCfzXxtdhtwQSBmBmzEnR1ZqZu4athYQwXX7\" alt=\"Select rubric using radio button in upper right corner of discussion page\" width=\"1309\" height=\"361\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36909942\" data-api-returntype=\"File\"></p><p>&nbsp;</p><p><img id=\"716858\" src=\"https://canvas.tamu.edu/courses/133720/files/36534950/preview?verifier=O8bwdnTElOhtFG6p1PZXcgSB1RzZLU5Z8dG0JsAu\" alt=\"magnifying-glass.png\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534950\" data-api-returntype=\"File\"><strong><span style=\"font-size: 18pt;\">The Prompt</span></strong></p><p><span style=\"font-size: 14pt;\">I want to treat this week as a \"get to know each other\" week. This class may be asynchronous, but you still have a community that you belong to, discussions help us remember that. Since you will be working with this group of peers for the next few weeks (I might change up groups half-way through the semester if needed) you should get to know one another. So in 150 or more words, tell us about yourself in as much or as little detail as you wish to provide. Some things you could to talk about:</span></p><ul><li><span style=\"font-size: 14pt;\">your major</span></li><li><span style=\"font-size: 14pt;\">hobbies</span></li><li><span style=\"font-size: 14pt;\">pets</span></li><li><span style=\"font-size: 14pt;\">do you have a favorite rock/mineral?</span></li><li><span style=\"font-size: 14pt;\">what are you looking forward to most in this class?<br></span></li><li><span style=\"font-size: 14pt;\">is this your first asynchronous class? </span><ul><li><span style=\"font-size: 14pt;\">If not, do you have tips for staying on track?</span></li></ul></li><li><span style=\"font-size: 14pt;\">something else?</span></li><li><span style=\"font-size: 14pt;\">Please include a picture, of yourself, your pet, your favorite meme (keep it clean), something that helps us get to know YOU!</span><ul><li><span style=\"font-size: 14pt;\"><span>at the top of the text box will be a little icon of mountains and a sun that says \"images\" when you mouse over</span></span></li><li><span style=\"font-size: 14pt;\"><span>this is used to show you how to upload an image for future discussions</span></span></li><li><a class=\"inline_disabled\" href=\"https://community.canvaslms.com/t5/Student-Guide/How-do-I-embed-an-image-in-a-discussion-reply-as-a-student/ta-p/313\" target=\"_blank\"><span style=\"font-size: 14pt;\"><span>Canvas Guide on How to Embed an image in a post/reply</span></span></a></li></ul></li><li><span style=\"font-size: 14pt;\">ASK a question! What do you want to know about your peers? Do you want advice for studying? Do you want advice for a good coffee place in town?&nbsp;</span></li></ul><p>&nbsp;</p><h3><strong><img src=\"https://canvas.tamu.edu/courses/133720/files/36534892/download?verifier=i47lB0P1Vf0QQvhJTig99hRn5Ct3p1ywJNA06P8F\" alt=\"\" width=\"45\" height=\"45\" data-decorative=\"true\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534892\" data-api-returntype=\"File\">Technical Support</strong></h3><p>Need help using Canvas Discussions? If so, please review the following guide:</p><ul><li><a class=\"external\" title=\"\" href=\"https://community.canvaslms.com/docs/DOC-10701#jive_content_id_Discussions\" target=\"_blank\"><span>Canvas Student Guide - Discussions</span></a></li></ul>"
            # descrip = "<p><strong>Consider 1</strong> of the 7 principles to universal design from the video.&nbsp;</p><p><iframe title="YouTube video player" src="https://www.youtube.com/embed/G-tHuD7R8cs/" width="560" height="315" allowfullscreen="allowfullscreen" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></p><p><span style="text-decoration: underline;">7 Principles of Universal Design:</span></p><ol><li>Equitable use</li><li>Flexibility in use</li><li>Simple and intuitive use</li><li>Perceptible information</li><li>Tolerance for error</li><li>Low physical effort</li><li>Size and space for approach and use</li></ol><p><strong>Discuss</strong> how this principle applies to software.&nbsp; You can support your discussion with a specific example.</p>"
            # if (assignment['description'] == None):
            #     assignmentObj['notes'] = ""
            # else:
                # desc = replaceQuote(assignment['description'])
            # print("DESC: " + desc)
                # assignmentObj['notes'] = desc
            #assignment['description']
            

            #check if the assignment has a submission
            # submission = assignment['has_submitted_submissions']
            # if(submission == False):
            #     assignmentObj['complete'] = False
            # else:    
            #     assignmentObj['complete'] = True
            # dueDate = date(dueDateYear, dueDateMonth, dueDateDay)

            # assignmentObj['complete'] = False
            if (dueDate != None):
                delta = dueDate - date.today()
                # print("Delta is " + delta)
                ##checks if assignment is less than one day overdue, if not then displays
                isNotPastAssignment = delta > timedelta(days = 1)
                if(isNotPastAssignment):
                    assignmentList.append(assignmentObj)
                else:
                    pass
                    #print("PAST ASSIGNMENT IS: " + assignmentObj['name'])
            else:
                assignmentList.append(assignmentObj)

    # create classobj for each class

        classObj = {}
        classObj['name'] = checkInvalidChar(courseName)
        classObj['color'] = 'rgb(162, 214, 161);'
        classObj['assignments'] = assignmentList
        order += 1
        classObj['order'] = order

        classList.append(classObj)
    # courseNameUnderScores = courseName.replace(' ','_')
    ##write classObj to JSON file
    # with open("./static/Scripts/Canvas"+courseNameUnderScores+".json", "w") as outfile:
    #     json.dump(classObj, outfile) 
    # session.pop("courseINFO", None)
    # jsonStr = json.dumps(classObj)
    # print(classList)
    return classList


##create signup form
class CreateAccountForm(FlaskForm):
    username = StringField("Enter valid email address", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    confirm = PasswordField("Confrim Password", validators=[DataRequired()])
    submit = SubmitField("Submit")

#login form
class LoginForm(FlaskForm):
    username = StringField("Enter valid email address", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Submit")


#login page
@app.route("/login", methods = ['GET', 'POST'])
@app.route("/Login", methods = ['GET', 'POST'])
@app.route("/user/login", methods = ['GET', 'POST'])
@app.route("/user/Login", methods = ['GET', 'POST'])
def login():
    form = LoginForm()
    if form.is_submitted():
        enteredUserName = form.username.data
        #first instance of User with that email in database
        User = Users.query.filter_by(userName = enteredUserName).first()
        #app.logger.info(User)
        #if no instance
        if (User == None):
            flash("There are no users registered with that username!")
        else:
            #check if entered password matches userPassword
            if (form.password.data == User.userPassword):
                login_user(User)
                #loadGoogleToken(User.id)
                return redirect('/Home')
            else:
                flash("Wrong Password - Try Again!")
    return render_template('Login.html', form = form)

#logout
@app.route('/logout', methods=['GET', 'POST'])
@app.route('/Logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    current_user = None
    if os.path.exists('token.json'):
        os.remove('token.json')
    flash("Logout successful")
    return '/login'


@app.route("/setup", methods = ['GET', 'POST'])
@app.route("/Signup", methods = ['GET', 'POST'])
@app.route("/CreateAccount.html", methods = ['GET', 'POST'])
@app.route("/user/Signup", methods = ['GET', 'POST'])
def add_user():
    empty = {}
    emptyJSON = json.dumps(empty)
    form = CreateAccountForm()
    if form.is_submitted():
        enteredUserName = form.username.data
        if (Users.query.filter_by(userName = enteredUserName).first() == None):
            if ((form.password.data == form.confirm.data)):
                user = Users(userName = form.username.data, userPassword = form.password.data,classes = emptyJSON, googleToken = emptyJSON, canvasBearer = "", phone = "" )
                db.session.add(user)
                db.session.commit()
                return redirect('/Home')
            else:
                flash("Password entries do not match!")
        else:
            flash("That username is already registered!")

    return render_template('CreateAccount.html', form = form)


@app.route("/bgAddImportedAssignments", methods = ['GET', 'POST'])
def AddImportedAssignments():

    dataObj = json.loads(request.data)
    #app.logger.info(type(dataObj))

    className = dataObj['class']
    assignments = dataObj['assignments']

    classObj = getClass(className, current_user.id)

    classList = getUserClasses(current_user.id)
    for i in range(len(classList)):
        if(classList[i] == classObj):
            #app.logger.info(classObj)
            for x in range(len(assignments)):
                classList[i]['assignments'].append(assignments[x])

    Users.query.filter_by(id = current_user.id).first().classes = json.dumps(classList)
    db.session.commit()

    #app.logger.info(str(classList))

    return getClass(className, current_user.id)



@app.route("/bgUpdateAssignment", methods = ['GET', 'POST'])
def updateAssignment():
    assignmentObj = json.loads(request.data)

    userClasslist = getUserClasses(current_user.id)
    assignments = []
    #iterate through classList of a user
    for i in range(len(userClasslist)):
        #find class for assignment
        if(userClasslist[i]['name'] == assignmentObj['class']):
            assignments = userClasslist[i]['assignments']
            #iterate through assignmentlist
            for j in range(len(assignments)):
                #find assignment
                if(assignments[j]['name'] == assignmentObj['name']):
                    #replace assignment
                    #app.logger.info("REPLACING: " + str(assignments[j]))
                    #app.logger.info("WITH: " + str(assignmentObj))
                    assignments[j] = assignmentObj
            #replace assignmentlist in class
            userClasslist[i]['assignments'] = assignments
            
    Users.query.filter_by(id = current_user.id).first().classes = json.dumps(userClasslist)
    db.session.commit()
    return json.dumps(userClasslist)


@app.route("/bgAddAssignment", methods = ['GET', 'POST'])
def addAssignment():
    assignmentObj = json.loads(request.data)
    #app.logger.info(assignmentObj)

    userClasslist = getUserClasses(current_user.id)
    assignments = []

    #iterate through classList of a user
    for i in range(len(userClasslist)):
        #find class for assignment
        if(userClasslist[i]['name'] == assignmentObj['class']):
            assignments = userClasslist[i]['assignments']

            assignments.append(assignmentObj)

            userClasslist[i]['assignments'] = assignments
    
    #update and commit to db
    Users.query.filter_by(id = current_user.id).first().classes = json.dumps(userClasslist)
    db.session.commit()
    
    #app.logger.info(str(userClasslist))
    return (str(userClasslist))


@app.route("/bgAddClass", methods = ['GET', 'POST'])
def addClass():
    #time.sleep(1)
    classObj = json.loads(request.data)
    #app.logger.info(type(classObj))


    userClassList = getUserClasses(current_user.id)
    

    isDuplicate = False
    for i in range(len(userClassList)):
        if(classObj['name'] == userClassList[i]['name']):
            isDuplicate = True


    if not isDuplicate:
        userClassList.append(classObj)
        #app.logger.info(json.dumps(userClassList))

        Users.query.filter_by(id = current_user.id).first().classes = json.dumps(userClassList)
        db.session.commit()

    return str(classObj)


@app.route("/bgDeleteClass", methods = ['GET', 'POST'])
def deleteClass():

    classObj = json.loads(request.data)
    #print("Deleting ClassObj : " + str(classObj))
    # print(classObj)
    userClassList = getUserClasses(current_user.id)
    # print("userClassList : ")
    # print(userClassList)
    for i in range(len(userClassList)):
        if(userClassList[i]['name'] == classObj['name']):
            #app.logger.info("DELETING: " + userClassList[i]['name'])
            #print("DELETING: " + userClassList[i]['name'])   
            userClassList.remove(userClassList[i])
            break     
    #print(userClassList)
    sys.stdout.flush()
    if(len(json.dumps(userClassList)) == 0):
        Users.query.filter_by(id = current_user.id).first().classes = '{}'
    else:    
        Users.query.filter_by(id = current_user.id).first().classes = json.dumps(userClassList)
    #print("UserClassList After Deletion: " + str(userClassList))
    db.session.commit()

    return str(classObj)


@app.route("/bgUpdateClass", methods = ['GET', 'POST'])
def updateClass():

    classObj = json.loads(request.data)
    
    userClassList = getUserClasses(current_user.id)
    for i in range(len(userClassList)):
        if(userClassList[i]['name'] == classObj['name']):
            userClassList[i] = classObj
            break


    Users.query.filter_by(id = current_user.id).first().classes = json.dumps(userClassList)
    db.session.commit()

    return str(classObj)


## this function will be called any time home or addlocation window closes
@app.route("/bgUpdateUserClasses", methods = ['GET', 'POST'])
def updateUserClasses():
    #classList is an array of JSON
    classList = json.loads(request.data)
    ## Gets the userInfo of current user
    id = current_user.id
    currUser = Users.query.get_or_404(id)

    currUser.classes = str(request.data)
    db.session.commit()
    #app.logger.info(currUser.classes)
    #convert userInfo JSON into a dictionary
    #userDict = json.loads(str(currUser))

    return str(classList)


## this function will be called any time home or addlocation window opens
@app.route("/bgLoadUserClasses", methods = ['GET', 'POST'])
def loadUserClasses():
    userClassList = getUserClasses(current_user.id)
    #app.logger.info(json.dumps(userClassList))
    return json.dumps(userClassList)

@app.route("/")
@app.route("/Home.html")
@app.route("/Home")
@login_required
def Home():
    return render_template("Home.html")

@app.route("/Quick_View.html")
@app.route("/Quick_View")
@login_required
def Quick_View():
    return render_template("Quick_View.html")

@app.route("/AddLocation.html")
@app.route("/AddLocation")
@login_required
def AddLocation():
    return render_template("AddLocation.html")


def loadGoogleToken(userID):
    tokenText = Users.query.filter_by(id = userID).first().googleToken
    tokenJSON = json.loads(tokenText)
    if os.path.exists('token.json'):
        os.remove('token.json')
    if(tokenText != '{}'):
        with open('token.json', 'w') as tokenfile:
            tokenfile.write(tokenText)
    return tokenJSON

@app.route('/GoogleSignIn', methods=['GET', 'POST'])
def googleSignIn():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file('client_secret.json', SCOPES)
    flow.redirect_uri = 'https://assignment-stacker.herokuapp.com/AuthorizeGoogle'
    authorization_url, state = flow.authorization_url(access_type='offline', include_granted_scopes='true', prompt='consent')
    flask.session['state'] = state

    return redirect(authorization_url)

@app.route('/AuthorizeGoogle', methods=['GET', 'POST'])
def AuthorizeGoogle():
    state = flask.session['state']
    
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file('client_secret.json', scopes = SCOPES, state = state)
    flow.redirect_uri = url_for('AuthorizeGoogle', _external = True)

    authorization_response = flask.request.url
    # print(str(authorization_response))
    # sys.stdout.flush()
    flow.fetch_token(authorization_response = authorization_response)

    creds = flow.credentials

    flask.session['credentials'] = credentials_to_dict(creds)
    Users.query.filter_by(id = current_user.id).first().googleToken = json.dumps(credentials_to_dict(creds))
    db.session.commit()

    return redirect('/AddLocation')


# tool function for credentials
def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}


#background process happening without any refreshing
@app.route('/bgGoogleImport', methods=['GET', 'POST'])
def getGoogleJSONs():

    currUser = Users.query.filter_by(id = current_user.id).first()

    if currUser.googleToken == '{}':
        return 'NO TOKEN'

    else:
        # print(str(type(json.loads(currUser.googleToken))))
        # sys.stdout.flush()
        creds = google.oauth2.credentials.Credentials(**json.loads(currUser.googleToken))

        try:
            service = googleapiclient.discovery.build('classroom', 'v1', credentials=creds)

            # Call the Classroom API
            results = service.courses().list().execute()
            courses = results.get('courses', [])


            classList = []
            if not courses:
                return 'NONE'
            # used to keep track of classes 
            order = 0
            # Prints the names of the courses
            for course in courses:
                # Class name that will be stored
                className = course['name']
                # print(className)
                # print("\n")

                #classID for accessing coursework
                classID = course['id']

                #all users assignments in a course
                coursework = service.courses().courseWork().list(courseId=classID).execute()
                assignments = coursework.get('courseWork', [])


                # iterate through all of their coursework and create assignmentObjs in dictionarys
                assignmentList = []
                for assignment in assignments:
                    #create a new assignmentObj to make JSON
                    assignmentObj = {}
                    assignmentObj['name'] = (assignment['title'])[0:15]
                    assignmentObj['class'] = className
                    assignmentObj['priority'] = 3

                    # NEED TO PARSE DATE AND TIME CORRECTLY FOR OUR FORMATTING
                    assignmentDueDateGoogle = assignment['dueDate']
                    assignmentDueTimeGoogle = assignment['dueTime']
                    dueYear = assignmentDueDateGoogle['year']

                    if(assignmentDueDateGoogle['month'] < 10):
                        dueMonth = '0'+str(assignmentDueDateGoogle['month'])
                    else:
                        dueMonth = ''+str(assignmentDueDateGoogle['month'])
                        
                    if(assignmentDueDateGoogle['day'] < 10):
                        dueDay = '0'+str(assignmentDueDateGoogle['day'])
                    else:
                        dueDay = ''+str(assignmentDueDateGoogle['day'])
                    dueHour = (assignmentDueTimeGoogle['hours'] + 19) % 24
                    dueMin = assignmentDueTimeGoogle['minutes']
                    
                    objDueDate = str(dueYear)+ '-' + str(dueMonth)+ '-' + str(dueDay) + 'T' + str(dueHour) + ':' + str(dueMin)
                    assignmentObj['dueDate'] = objDueDate


                    startDateTime = str(assignment['creationTime'])

                    ## Creating DateTime datatypes for comparison
                    dueDateYear = int(dueYear)
                    dueDateMonth = int(dueMonth)
                    dueDateDay = int(dueDay)

                    dueDate = date(dueDateYear, dueDateMonth, dueDateDay)
                    delta = dueDate - date.today()

                    ##checks if assignment is less than one days overdue, if not then displays
                    isNotPastAssignment = delta > timedelta(days = 1)



                    assignmentObj['startDate'] = startDateTime[0:16]


                    assignmentObj['link'] = assignment['alternateLink']

                    # WIP
                    assignmentObj['relatedLinks'] = ''


                    assignmentObj['notes'] = assignment['description']

                    assignmentObj['googleLocation'] = className

                    assignmentObj['canvasLocation'] = ''


                    #check if the assignment has a submission
                    assignmentID = assignment['id']
                    studentSubmissions = service.courses().courseWork().studentSubmissions().list(courseId=classID, courseWorkId = assignmentID).execute()
                    submissions = studentSubmissions.get('studentSubmissions', [])
                    for submission in submissions:
                        if(submission['assignmentSubmission'] == {}):
                            assignmentObj['complete'] = False
                        else:    
                            assignmentObj['complete'] = True

                    if(isNotPastAssignment):
                        assignmentList.append(assignmentObj)
                
                

                #creating classObj for each course
                #store assignmentList of each course
                #set default color for added courses
                classObj = {}
                classObj['name'] = className
                classObj['color'] = 'rgb(162, 214, 161);'
                classObj['assignments'] = assignmentList
                classObj['order'] = order
                order += 1

                classList.append(classObj)



            ##write classObj to JSON file
            # with open("./static/Scripts/googleClassObjs.json", "w") as outfile:
            #     json.dump(classList, outfile) 

            jsonStr = json.dumps(classList)
            return jsonStr
                
        except HttpError as error:
            print('An error occurred: %s' % error)


#background process happening without any refreshing
# @app.route('/bgGetCanvasUser', methods=['GET', 'POST'])
# def getCanvasUser(token):
#     url = "https://canvas.tamu.edu/api/v1/users/self"

#     #eventually will take bearer token as an argument
#     token = "15924~j9hFN1TVjJHgUCE7CyTdrKaWKSLsf8yIRaCtCfQlXp4PkASi8ts3UJEqn2ackRq1"
#     headers = {'Authorization' : 'Bearer '+ token}

#     resp = requests.get(url, headers=headers)

#     return (resp.json())

@app.route('/bgGetCurrUserTokens', methods=['GET', 'POST'])
def sendToken():
    canvasToken = Users.query.filter_by(id = current_user.id).first().canvasBearer
    hasValidGoogleToken = 0

    if(Users.query.filter_by(id = current_user.id).first().googleToken != '{}'):
        hasValidGoogleToken = 1

    tokens = {}
    tokens['canvas'] = canvasToken
    tokens['google'] = hasValidGoogleToken

    return json.dumps(tokens)

@app.route('/bgDeleteCurrUserCanvasData', methods=['GET', 'POST'])
def deleteCanvasInfo():
    Users.query.filter_by(id = current_user.id).first().canvasBearer = ''

    userClassList = getUserClasses(current_user.id)

    for classObj in userClassList:
        assignmentList = classObj['assignments']
        updatedAssignmentList = []
        #iterate through assignments and remove all assignments with a canvasLocation
        for assignmentObj in assignmentList:
            if(assignmentObj['canvasLocation'] == ''):
                updatedAssignmentList.append(assignmentObj)
        #reassign classList object with updated list
        classObj['assignments'] = updatedAssignmentList

    # check for empty classes
    updatedUserClassList = []

    for classObj in userClassList:
        if(classObj['assignments'] != []):
            updatedUserClassList.append(classObj)



    Users.query.filter_by(id = current_user.id).first().classes = json.dumps(updatedUserClassList)
    db.session.commit()

    return json.dumps(userClassList)

@app.route('/bgDeleteCurrUserGoogleData', methods=['GET', 'POST'])
def deleteGoogleInfo():
    Users.query.filter_by(id = current_user.id).first().googleToken = '{}'

    userClassList = getUserClasses(current_user.id)

    for classObj in userClassList:
        assignmentList = classObj['assignments']
        updatedAssignmentList = []
        #iterate through assignments and remove all assignments with a canvasLocation
        for assignmentObj in assignmentList:
            if(assignmentObj['googleLocation'] == ''):
                updatedAssignmentList.append(assignmentObj)
        #reassign classList object with updated list
        classObj['assignments'] = updatedAssignmentList

    # check for empty classes
    updatedUserClassList = []

    for classObj in userClassList:
        if(classObj['assignments'] != []):
            updatedUserClassList.append(classObj)


    Users.query.filter_by(id = current_user.id).first().classes = json.dumps(updatedUserClassList)
    db.session.commit()

    return json.dumps(userClassList)


#will call for all courses of a user
@app.route('/bgGetCanvasCourses', methods=['GET', 'POST'])
def getCanvasCourses():
    url = "https://canvas.tamu.edu/api/v1/courses?include=items&per_page=1000/"

    #eventually will take bearer token as an argument
    #token = "15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm"
    token = Users.query.filter_by(id = current_user.id).first().canvasBearer
    # print("TOKEN IN COURSES")
    # print(token)
    if(token == ''):
        return 'INVALID CANVAS TOKEN'
    

    headers = {'Authorization' : 'Bearer '+ token}

    # print("Token")
    # print(token)
    resp = requests.get(url, headers=headers)

    # finds the max enrollment_term_id -> courses w/ this are in current semester 
    maxID = 0
    for ID in resp.json():
        # print(ID)
        currID = ID["enrollment_term_id"]
        if currID > maxID:
            maxID = currID

    # creates dictionary w/ current semesters courseIDs as the key and names as the values
    # this is done by looping through the courses again to find the ones with maxID
    courseList = []
    orderCount = 0
    for course in resp.json():
        if course["enrollment_term_id"] == maxID:     
            courseID = course["id"]
            # getting rid of JAPN for testing
            if courseID == 123752: continue
            # if courseID == 133720: continue

            # creates Dict of needed courseINFO
            courseDict = {}
            courseDict['name'] = checkInvalidChar(course["name"])
            courseDict['id'] = courseID
            courseDict['order'] = orderCount
            orderCount += 1
            courseList.append(courseDict)

    jsonStr = json.dumps(courseList)
    return jsonStr
    # return (courseDict)

## Gets Inputted user canvas token
app.secret_key = 'dljsaklqk24e21cjn!Ew@@dsa5'
@app.route('/bgGetUserToken', methods=['POST'])
def get_post_json():   
    #15924~KJuUhLJlwLsiJtdeMxfBRsLUqCke0oLpL3HXAbGbJA27hdtWUeXplyWFshm9yFGS (Fred Token)
    # stores user Token 
    tokenDictionary = json.loads(request.data)

    isValidToken = ValidateCanvasBearer(tokenDictionary['token'])

    if isValidToken:
        # print("token true")
        # print(tokenDictionary['token'])
        Users.query.filter_by(id = current_user.id).first().canvasBearer = tokenDictionary['token']
        db.session.commit()
    else:
        # print("token false")
        # print(tokenDictionary['token'])
        tokenCheck = Users.query.filter_by(id = current_user.id).first().canvasBearer 
        if (tokenCheck == ''):
            db.session.commit()
        else:
            db.session.commit() 
        #return jsonify(status="error")

    return jsonify(status="success")

def ValidateCanvasBearer(token): 
    ## Make a test API call
    ## Return false if invalid
    url = "https://canvas.tamu.edu/api/v1/courses?include=items&per_page=1000/"

    # eventually will take bearer token as an argument
    # token = "15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm"
    headers = {'Authorization' : 'Bearer '+ token}

    resp = requests.get(url, headers=headers)
    # print("resp")
    # print(resp.status_code)
    if (resp.status_code == 200):
        # print("TRUE")
        return True
    else:
        # print("FALSE")
        return False



@app.route('/bgStoreCourseINFO', methods=['POST'])
def storeCourseINFO():    
    # stores user courseINFO
    courseData = request.get_json()
    session["courseINFO"] = courseData
    courseStuff = session.get("courseINFO")
    courseName  = courseStuff['name']
    #print("This course has been stored in the session: " + courseName)
    courseID  = courseStuff['id']
    return jsonify(status="success", data=courseData)



#function will call for assignments in a course
@app.route('/bgGetCanvasAssignments', methods=['GET', 'POST'])
def getCanvasAssignments():

    courseDict = {}
    # takes Token from session to use to access APIs
    token = Users.query.filter_by(id = current_user.id).first().canvasBearer

    # grabs courseINFO that was passed in
    time.sleep(1)
    courseINFO = session.get("courseINFO")
    courseName = (courseINFO['name'])
    courseID = courseINFO['id']

    # was used before change, may not be needed anymore
    order = 0
    
    # makes a call to get moduleINFO for each course 
    stringID = str(courseID)
    # takes course name and replaces : since it creates error later 
    # TODO: what should the courseName be? Spaces? underscores? 
    courseName = courseName.replace(':','')
    # courseName = courseName.replace(' ','_')
    #print(courseName)

    # NOTE: currently call for assignments, takes less time, no timeout in heroku 
    url = "https://canvas.tamu.edu/api/v1/courses/"+stringID+"/assignments?include=items&per_page=1000/"

    # eventually will take bearer token as an argument
    # token = "15924~zDtK69ahwZSbptMsKxYMYJM52mhuubfGvpL1ws6hA3XQpYEWtX4a6YZByEacZGgm"
    headers = {'Authorization' : 'Bearer '+ token}

    resp = requests.get(url, headers=headers)
    assignmentList = []
    for assignment in resp.json():
        # moduleID = module["id"]
        # moduleDict[moduleID] = module["name"]  
        # TODO: Noticed some dates are null for assignments need to check
        assignmentObj = {}
        assignmentNameCheck = checkInvalidChar(assignment['name'])
        assignmentObj['name'] = assignmentNameCheck[0:15]
        assignmentObj['class'] = courseName
        assignmentObj['priority'] = 3
        # issues with due date being null
        if (assignment['due_at'] == None):
            # print(assignmentNameCheck + " is null")
            dueDateNone = str(date.today())
            dueDateNone += "T23:59"
            assignmentObj['dueDate'] = dueDateNone
            dueDate = None
        else:
            # [:-4] gets rid of milliseconds which cause issues with dates

            assignDate = assignment['due_at'][:-1]
            assignDate = assignDate.replace('T', " ")
            
            # taken from https://stackoverflow.com/questions/4770297/convert-utc-datetime-string-to-local-datetime#comment7256053_4771733
            # METHOD 2: Auto-detect zones:
            from_zone = tz.tzutc()
            to_zone = tz.tzlocal()
            # utc = datetime.utcnow()
            utc = datetime.strptime(assignDate, '%Y-%m-%d %H:%M:%S')
            
            # Tell the datetime object that it's in UTC time zone since 
            # datetime objects are 'naive' by default
            utc = utc.replace(tzinfo=from_zone)
            
            # Convert time zone
            dueTimeFinal = str(utc.astimezone(to_zone))
            
            # parses info from date to use in final date
            dueDateNew = dueTimeFinal[0:10]
            dueTimeEnd = dueTimeFinal[13:16]
            dueTimeChange = dueTimeFinal[11:13]
            
            # creates new final due Date for assignment
            dueDateFinal = (dueDateNew + "T" + dueTimeChange + dueTimeEnd)
            #print(assignmentNameCheck + " due time is " + dueDateFinal)
            assignmentObj['dueDate'] = dueDateFinal
            
            # parses info from date to use in checking if overdue
            dueDateYear = int(assignment['due_at'][0:4])
            dueDateMonth = int(assignment['due_at'][5:7])
            dueDateDay = int(assignment['due_at'][8:10])

            dueDate = date(dueDateYear, dueDateMonth, dueDateDay)
            
        # startDate should be unlock or created at? 
        # [:-4] gets rid of milliseconds which cause issues with dates
        if (assignment['unlock_at'] == None):
            # print(assignmentNameCheck + " is null")
            startDateNone = str(date.today())
            startDateNone += "T23:59"
            assignmentObj['startDate'] = startDateNone
        else:
            # [:-4] gets rid of milliseconds which cause issues with dates
            # print(assignmentNameCheck + " is unlocked at " + assignment['unlock_at'])
            # assignmentObj['startDate'] = assignment['unlock_at'][:-4]
            assignDate = assignment['unlock_at'][:-1]
            assignDate = assignDate.replace('T', " ")
            
            # METHOD 2: Auto-detect zones:
            from_zone = tz.tzutc()
            to_zone = tz.tzlocal()
        
            utc = datetime.strptime(assignDate, '%Y-%m-%d %H:%M:%S')
        
            # Tell the datetime object that it's in UTC time zone since 
            # datetime objects are 'naive' by default
            utc = utc.replace(tzinfo=from_zone)
        
            # Convert time zone
            unlockTimeFinal = str(utc.astimezone(to_zone))

            # splits unlock time so I can append them to the correct format 
            unlockDateNew = unlockTimeFinal[0:10]
            unlockTimeEnd = unlockTimeFinal[13:16]
            unlockTimeChange = unlockTimeFinal[11:13]
            
                # splits unlock time so I can append them to the correct format 
            unlockDateFinal = (unlockDateNew + "T" + unlockTimeChange + unlockTimeEnd)
            #print(assignmentNameCheck + " unlocks at " + unlockDateFinal)
            assignmentObj['startDate'] = unlockDateFinal
        
        assignmentObj['link'] = assignment['html_url']
        assignmentObj['relatedLinks'] = ''
        assignmentObj['googleLocation'] = ''
        assignmentObj['canvasLocation'] = courseName
        assignmentObj['complete'] = False
        assignmentObj['notes'] = ''
        # assignmentObj['notes'] = ''
        # descrip = "<h2><strong><img src=\"https://canvas.tamu.edu/courses/133720/files/36534984/download?verifier=1lviDEMOpbDLX3Z9OkQQtnVxqNSJoga5lGamNUvT\" alt=\"\" width=\"45\" height=\"45\" data-decorative=\"true\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534984\" data-api-returntype=\"File\">Week 1 Discussion</strong></h2><p>This discussion is meant to introduce you to the discussion process and to your peers. It is set up similar to the weekly discussion, but mostly you will get points just for participating. You will be split into groups of 10–15 other students in the class, this selection is random, and you will be kept with your same group members from week to week, so get to know your new friends/colleagues.&nbsp;</p><p>&nbsp;</p><h3><strong><img src=\"https://canvas.tamu.edu/courses/133720/files/36534966/download?verifier=luLPvdhYbR8Z4pJaQh5nL2y0gWM2jdoJKU1tdANk\" alt=\"\" width=\"45\" height=\"45\" data-decorative=\"true\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534966\" data-api-returntype=\"File\">Guidelines</strong></h3><p><span style=\"font-size: 14pt;\">To receive credit for the week:</span></p><ul><li><strong><span style=\"font-size: 14pt;\">note, the following dates are adjusted for this first week, initial responses will normally be due </span><span style=\"font-size: 18.6667px;\">Wednesdays</span><span style=\"font-size: 14pt;\"> and </span><span style=\"font-size: 18.6667px;\">replies</span><span style=\"font-size: 14pt;\"> on Fridays<br></span></strong></li><li><span style=\"background-color: #f1c40f;\"><strong><span style=\"font-size: large;\">Also note, in all future discussions you will be required to copy and paste your initial post into a&nbsp;separate assignment in the modules to check it with TurnItIn. I do not require that for this discussion.</span></strong></span></li><li><span style=\"font-size: 14pt;\"><span style=\"text-decoration: underline;\"><strong>by Friday Jan. 21 11:59pm</strong></span> respond to the prompt below in at least 150 words<br></span></li><li><span style=\"font-size: 14pt;\"><span style=\"text-decoration: underline;\"><strong>by Monday Jan. 24 11:59pm</strong></span> reply to at least two (2) other students' response (no word min.) with a thoughtful response to their reply</span><ul><li><span style=\"font-size: 14pt;\">Perhaps, a classmate asks a question, and you know the answer, you can respond. </span></li><li><span style=\"font-size: 14pt;\">Perhaps you classmate makes a good or interesting point, expand on that.&nbsp;</span></li><li><span style=\"font-size: 14pt;\">Try to respond to to someone that does not have a reply yet.</span></li></ul></li></ul><p>I will also monitor these discussions, and answer questions where I see a need. There are 300 of you in this course though, so I will not be able to respond to everyone each week. If you have a specific question about a topic, feel free to email me or come to my virtual office hours! I am always happy to talk more geology :)</p><p><br>BE RESPECTFUL of everyone. I will have no tolerance for rude, discriminatory, or <span>condescension</span>. If I see this behavior at all, that student will receive a zero credit for this discussion. See full statement in the syllabus.</p><p><strong><span style=\"font-size: 18pt;\">Rubric</span></strong></p><p>To see the Rubric for grading click the radio button in the upper right and \"Show Rubric.\" This will be the same rubric from week to week, but since this is \"about you\" this week, you will earn full points as long as you say something about yourself in at least 150 words and respond to two peers.&nbsp;</p><p><img src=\"https://canvas.tamu.edu/courses/133720/files/36909942/preview?verifier=t7neDCfzXxtdhtwQSBmBmzEnR1ZqZu4athYQwXX7\" alt=\"Select rubric using radio button in upper right corner of discussion page\" width=\"1309\" height=\"361\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36909942\" data-api-returntype=\"File\"></p><p>&nbsp;</p><p><img id=\"716858\" src=\"https://canvas.tamu.edu/courses/133720/files/36534950/preview?verifier=O8bwdnTElOhtFG6p1PZXcgSB1RzZLU5Z8dG0JsAu\" alt=\"magnifying-glass.png\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534950\" data-api-returntype=\"File\"><strong><span style=\"font-size: 18pt;\">The Prompt</span></strong></p><p><span style=\"font-size: 14pt;\">I want to treat this week as a \"get to know each other\" week. This class may be asynchronous, but you still have a community that you belong to, discussions help us remember that. Since you will be working with this group of peers for the next few weeks (I might change up groups half-way through the semester if needed) you should get to know one another. So in 150 or more words, tell us about yourself in as much or as little detail as you wish to provide. Some things you could to talk about:</span></p><ul><li><span style=\"font-size: 14pt;\">your major</span></li><li><span style=\"font-size: 14pt;\">hobbies</span></li><li><span style=\"font-size: 14pt;\">pets</span></li><li><span style=\"font-size: 14pt;\">do you have a favorite rock/mineral?</span></li><li><span style=\"font-size: 14pt;\">what are you looking forward to most in this class?<br></span></li><li><span style=\"font-size: 14pt;\">is this your first asynchronous class? </span><ul><li><span style=\"font-size: 14pt;\">If not, do you have tips for staying on track?</span></li></ul></li><li><span style=\"font-size: 14pt;\">something else?</span></li><li><span style=\"font-size: 14pt;\">Please include a picture, of yourself, your pet, your favorite meme (keep it clean), something that helps us get to know YOU!</span><ul><li><span style=\"font-size: 14pt;\"><span>at the top of the text box will be a little icon of mountains and a sun that says \"images\" when you mouse over</span></span></li><li><span style=\"font-size: 14pt;\"><span>this is used to show you how to upload an image for future discussions</span></span></li><li><a class=\"inline_disabled\" href=\"https://community.canvaslms.com/t5/Student-Guide/How-do-I-embed-an-image-in-a-discussion-reply-as-a-student/ta-p/313\" target=\"_blank\"><span style=\"font-size: 14pt;\"><span>Canvas Guide on How to Embed an image in a post/reply</span></span></a></li></ul></li><li><span style=\"font-size: 14pt;\">ASK a question! What do you want to know about your peers? Do you want advice for studying? Do you want advice for a good coffee place in town?&nbsp;</span></li></ul><p>&nbsp;</p><h3><strong><img src=\"https://canvas.tamu.edu/courses/133720/files/36534892/download?verifier=i47lB0P1Vf0QQvhJTig99hRn5Ct3p1ywJNA06P8F\" alt=\"\" width=\"45\" height=\"45\" data-decorative=\"true\" data-api-endpoint=\"https://canvas.tamu.edu/api/v1/courses/133720/files/36534892\" data-api-returntype=\"File\">Technical Support</strong></h3><p>Need help using Canvas Discussions? If so, please review the following guide:</p><ul><li><a class=\"external\" title=\"\" href=\"https://community.canvaslms.com/docs/DOC-10701#jive_content_id_Discussions\" target=\"_blank\"><span>Canvas Student Guide - Discussions</span></a></li></ul>"
        # descrip = "<p><strong>Consider 1</strong> of the 7 principles to universal design from the video.&nbsp;</p><p><iframe title="YouTube video player" src="https://www.youtube.com/embed/G-tHuD7R8cs/" width="560" height="315" allowfullscreen="allowfullscreen" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></p><p><span style="text-decoration: underline;">7 Principles of Universal Design:</span></p><ol><li>Equitable use</li><li>Flexibility in use</li><li>Simple and intuitive use</li><li>Perceptible information</li><li>Tolerance for error</li><li>Low physical effort</li><li>Size and space for approach and use</li></ol><p><strong>Discuss</strong> how this principle applies to software.&nbsp; You can support your discussion with a specific example.</p>"
        # if (assignment['description'] == None):
        #     assignmentObj['notes'] = ""
        # else:
            # desc = replaceQuote(assignment['description'])
        # print("DESC: " + desc)
            # assignmentObj['notes'] = desc
        #assignment['description']
        

        #check if the assignment has a submission
        # submission = assignment['has_submitted_submissions']
        # if(submission == False):
        #     assignmentObj['complete'] = False
        # else:    
        #     assignmentObj['complete'] = True
        # dueDate = date(dueDateYear, dueDateMonth, dueDateDay)

        # assignmentObj['complete'] = False
        if (dueDate != None):
            delta = dueDate - date.today()
            # print("Delta is " + delta)
            ##checks if assignment is less than one day overdue, if not then displays
            isNotPastAssignment = delta > timedelta(days = 1)
            if(isNotPastAssignment):
                assignmentList.append(assignmentObj)
            else:
                pass
                #print("PAST ASSIGNMENT IS: " + assignmentObj['name'])
        else:
            assignmentList.append(assignmentObj)

    # create classobj for each class
        classObj = {}
        classObj['name'] = checkInvalidChar(courseName)
        classObj['color'] = 'rgb(162, 214, 161);'
        classObj['assignments'] = assignmentList
        classObj['order'] = order

    courseNameUnderScores = courseName.replace(' ','_')
    ##write classObj to JSON file
    # with open("./static/Scripts/Canvas"+courseNameUnderScores+".json", "w") as outfile:
    #     json.dump(classObj, outfile) 
    # session.pop("courseINFO", None)
    jsonStr = json.dumps(classObj)
    return jsonStr


def checkInvalidChar(assignmentName):
    regex = re.compile('[@!#$%^&+*(),<>?/\|}{~:]-')

    assignmentName = assignmentName.replace(':',' ')
    assignmentName = assignmentName.replace('-',' ')
    assignmentName = assignmentName.replace('#',' ')
    assignmentName = assignmentName.replace('&','And')
    assignmentName = assignmentName.replace('!','')
    assignmentName = assignmentName.replace('?','')
    assignmentName = assignmentName.replace('(',' ')
    assignmentName = assignmentName.replace(')',' ')
    assignmentName = assignmentName.replace(',','')
    assignmentName = assignmentName.replace('.','')
    assignmentName = assignmentName.replace('+','')
    assignmentName = assignmentName.replace('/',' ')
    # assignmentName = assignmentName.replace("\",' ')
    assignmentName = assignmentName.replace('|',' ')
    # assignmentName = assignmentName.replace('@','')

    # print("checkInvalidChar return: " + assignmentName)
    return assignmentName

def replaceQuote(description):
    description = description.replace('"','')
    description = description.replace("'",'')
  
     
    return description


def loadClassesNotif():
    userClassList = getUserClasses(current_user.id)
    #app.logger.info(json.dumps(userClassList))
    # print("USER CLASSES")
    # print()
    return userClassList

@app.route("/bgStoreNum", methods = ['GET', 'POST'])
def storePhoneNum():

    phoneNum = json.loads(request.data)
    # print("Phone taken from User")
    # print(phoneNum)
    Users.query.filter_by(id = current_user.id).first().phone = json.dumps(phoneNum['phoneNum'])
    # print("Is num in DB?")
    # print(Users.query.filter_by(id = current_user.id).first().phone)
    db.session.commit()

    # time.sleep(5)
    return str(phoneNum)

@app.route("/bgRemoveNum", methods = ['GET', 'POST'])
def removePhoneNum():
    # print("Phone will be removed from DB")
    Users.query.filter_by(id = current_user.id).first().phone = json.dumps('')
    # print("Is num in DB?")
    # print(Users.query.filter_by(id = current_user.id).first().phone)
    db.session.commit()

    return str('')

@app.route("/bgSendSMS", methods = ['GET', 'POST'])
def sendSMS():
    # constantly updates to check if time is 8am
    # now = datetime.now()
    # currentTime = now.strftime("%H:%M")
    # checkTime1 = now.replace(hour=8, minute=00).strftime("%H:%M")
    # checkTime2 = now.replace(hour=8, minute=01).strftime("%H:%M")
    # checkTime3 = now.replace(hour=8, minute=02).strftime("%H:%M")

    # if (currentTime == checkTime1):
    userID = current_user.id
    phoneNum = Users.query.filter_by(id = userID).first().phone
    print("phoneNum")
    print(phoneNum)
    assignDict = {}
    assignList = []
    userID = current_user.id
    # would check if user no longer wants notifications
    # stop running in background (once implementing)
    if (phoneNum == None or phoneNum == '' or phoneNum == ""):
        Users.query.filter_by(id = userID).first().phone = ''
        infin = False
        return False
    # Users.query.filter_by(id = userID).first().Phone = assignmentsDue['phoneNum']
    # print(assignmentsDue)
    else:
        msg = "These assignments are due in the next 3 days: \n \n"
        userClasses = loadClassesNotif()
        userNum = str(phoneNum)
        #loops through the user's current classes and assignments
        for classes in userClasses:
            msg+= "For this class, " +classes['name']+ ":\n"
            for assignments in classes['assignments']:

                # parse dates to compare correctly 
                dueDateYear = int(assignments['dueDate'][0:4])
                dueDateMonth = int(assignments['dueDate'][5:7])
                dueDateDay = int(assignments['dueDate'][8:10])
                dueDate = date(dueDateYear, dueDateMonth, dueDateDay)

                # finds how many days til assignment is due
                delta = dueDate - date.today()
                dayDue = str(delta)[0:1]
                
                # checks for overdue assignment
                if (dayDue == "-"):
                    # print("BAD")
                    continue

                dayDue = int(dayDue)

                if (dayDue <= 3):
                    assignList.append(assignments['name'])
                    msg += assignments['name'] + "\n" + "\n"
                    assignDict['assignment'] = assignList

        if (assignDict == {}):
            msg = "There are no assignments due in the next 3 days."

        print(msg)
        # client = vonage.Client(key="5044506d", secret="mBJC1FV1dl8HxgMA")
        # sms = vonage.Sms(client)

        # responseData = sms.send_message(
        #     {
        #         "from": "18889095613",
        #         "to": "18327953595",
        #         "text": msg,
        #     }
        # )
        # if responseData["messages"][0]["status"] == "0":
        #     print("Message sent successfully.")
        #     # time.sleep(70)
        # else:
        #     print(f"Message failed with error: {responseData['messages'][0]['error-text']}")
        #     # infin = False
        #     return False
    # returned this to stop type error from occuring 
    dictThing = {}
    return dictThing

# def removeEndTime(date):


@app.before_first_request
def deleteBundles():
    if os.path.exists('./static/.webassets-cache'):
        shutil.rmtree('./static/.webassets-cache')

    if os.path.exists('./static/gen'):
        shutil.rmtree('./static/gen')

if __name__ == '__main__':
    app.run(debug = True)


###Threading: This code will be uncommented for heroku deployment

# def while_function():
#     i = 1
#     while i > 0:
#         time.sleep(1)
#         # print(i)
#         # sys.stdout.flush()
#         i+=1
#     return 0

# @app.before_first_request
# def thread_start():
#     # # start a thread that will perform motion detection
#     t = threading.Thread(target=while_function)
#     t.daemon = True
#     t.start()
#     print(t.is_alive())
#     if os.path.exists('./static/.webassets-cache'):
#         shutil.rmtree('./static/.webassets-cache')

#     if os.path.exists('./static/gen'):
#         shutil.rmtree('./static/gen')
    


# if __name__ == '__main__':
#     app.run(debug=False, threaded=True, use_reloader=False)
