

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

## Features
Our project includes 2-factor Google Authentication with connection with Google Drive API 

## Technologies:
-Project is created with:
-Typescript 
-Tailwind CSS
-Python Flask 3.12.6
-React.js
-Next.js
-Google APIs (Drive)

## Conflicts_We_Faced

## Judge_Criteria_for_Opportunity_Hackathon_2024

Scope of Solution:
This solution was built to assist the Heritage Square Foundation with writing grant proposals, by helping them find files to feed into an LLM to write an initial draft. 
Our solution could realistically be implemented for any nonprofit facing similar problems.
This implements features that benefit its users beyond the minimum capabilities for functionality. We included security features, to ensure the privacy of a given drive, ensured a simple, intuitive workflow for the site’s users users
Polish:
The website is currently a Proof of Concept. It is currently able to take images from a Google Drive, and process them into high-dimensional vectors, which a request can be queried against. However, due to unfortunate circumstances, we were unable to automatically scrape the Heritage Square Foundation’s Drive due to authorization errors, and were forced to manually scrape. 
The website contains all of the necessary functionality to simplify the grant-writing process for leaders in the Heritage Square Foundation, feeding them the necessary files and images upon request, in order to craft effective GPT queries for grant proposals
Security:
For security we use Google Authentication and the program checks the Google Drive for verifying if a person is a shared member on the Google Drive this is because if a user that doesn't have shared permissions with the drive or is not a staff member part of Heritage Square Foundation they will not be able to access the query bot. 
We have 2 Step Verification for a google account that logs in for the first time into our application 
