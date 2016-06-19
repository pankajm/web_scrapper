# web_scrapper

This assignement is to crawl/scrap the website https://medium.com to find all the hyperlinks present on this website.
The assignment contains two programs - 
1. app.js => crawl the website using async module.
2. normal_scraping.js => do the same thing without using async module.


## Assumption and data structures
We will maintain 2 arrays and 1 object namely 

1. linksToVisit => to store all links to visit in future
2. externalLinksArray => to store all links from website
3. linksVisited => to store which links we have visited till now.

## Approach

1. Visit the home page of the website.
2. Push all links starting with domain https://medium.com into array linksToVisit
3. Store all the links into array externalLinksArray
4. Store current page in linksVisited object.
5. pop 5 links from linksToVisit array and repeat the step 2, 3 and 4 untill the array liksToVisit is not empty
6. while picking up every link from array liksToVisit check if we have already traversed this link. To check this simply
   check the linksVisited object. If already visited skip this link.
7. Once the linksToVisit array is empty, export the externalLinksArray to csv.

## Running the app

1. Once cloned the project on your local machine, install all the dependencies using following command -

   *npm install*

2. Run the node server 

   *node app.js*

3. The message will pop up saying 'Server listning on port 8087'

4. Hit the get api from your browser/restClient to export csv of all hyperlinks on medium.com

   *localhost:8087/crawlWeb*

5. Once you get the message as operation successfull, you will find one csv named hyperlinks.csv created at repo level on your machine.
