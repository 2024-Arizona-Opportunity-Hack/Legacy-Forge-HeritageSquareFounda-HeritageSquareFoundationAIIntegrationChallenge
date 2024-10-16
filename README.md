

## Table of Contents
[Overview](#Overview) <br/>
[Installation](#Installation) <br/>
[Features](#Features) <br/>
[Technologies](#Technologies) <br/>
[Conflicts We Faced](#Conflicts_We_Faced) <br/>
[Judge Criteria for Opportunity Hackathon 2024](#Judge_Criteria_for_Opportunity_Hackathon_2024) <br/>

## Overview
LegacyForge is a technology designed to simplify file retrieval for the Google Drive belonging to the Heritage Square Foundation. This is done through the implementation of easy query of such files in response to keywords inputted by the user. The main usecase of the easy query is to find files that can be used to input into an LLM such as ChatGPT, to help the foundation’s leaders to write grant proposals at a steady pace.

## Installation
For hosting on your local server clone the github repository into the folder of your choice <br/>
Next, execute the command: `cd ./Legacy-Forge-HeritageSquareFounda-HeritageSquareFoundationAIIntegrationChallenge/client` <br/>
Make sure you have Node installed on your machine. <br/>
Inside your terminal, execute the command `npm install` <br/>
This will ensure that all of the necessary dependencies for LegacyForge are installed on your machine. <br/>
Finally run the command `npm run dev` in your terminal, and it will pull up a link to your localhost. <br/>
The server does not need to be booted up locally because it exists on an EC2 instance

## Features
Given files, as well as photos, LegacyForge can return the appropriate files and photos to a user in response to a query <br/>
Our project includes 2-factor Google Authentication with connection with Google Drive API 

## Technologies:
Project is created with: <br/>
* Typescript <br/>
* Tailwind CSS<br/>
* Python Flask 3.12.6<br/>
* React.js<br/>
* Next.js<br/>
* Google APIs (Drive)<br/>

## Judge_Criteria_for_Opportunity_Hackathon_2024

Scope of Solution:
This solution was built to assist the Heritage Square Foundation with writing grant proposals, by helping them find files to feed into an LLM to write an initial draft. 
Our solution could realistically be implemented for any nonprofit facing similar problems.
This implements features that benefit its users beyond the minimum capabilities for functionality. We included security features, to ensure the privacy of a given drive, and ensured a simple, intuitive workflow for the site’s users. <br/><br/>
Polish:
The website is currently a Proof of Concept. It is currently able to take images from a Google Drive, and process them into high-dimensional vectors, which a request can be queried against. However, due to unfortunate circumstances, we were unable to automatically scrape the Heritage Square Foundation’s Drive due to authorization errors, and were forced to manually scrape. 
The website contains all of the necessary functionality to simplify the grant-writing process for leaders in the Heritage Square Foundation, feeding them the necessary files and images upon request, in order to craft effective GPT queries for grant proposals. <br/><br/>
Security:
For security we use Google Authentication and the program checks the Google Drive for verifying if a person is a shared member on the Google Drive this is because if a user that doesn't have shared permissions with the drive or is not a staff member part of Heritage Square Foundation they will not be able to access the query bot. 
We have 2 Step Verification for a google account that logs in for the first time into our application. <br/><br/>
