## Inspiration
It can be daunting to browse a restaurant menu for unfamiliar cuisine, you may not be able to tell how a dish looks and the menu may not come with a description. With dishcovery, we aim to tear down cultural barriers that come with trying out unfamiliar dishes by enhancing the menu browsing experience with images and descriptions of all the dishes.

## What it does
dishcovery takes in an image of a food menu, either through your device's camera or by uploading an image, and parses all the menu items in the image for their names. These items are then matched with images and descriptions of the food which are then presented to the user in the app.

## How we built it
The application is built in plain HTML, CSS, and JavaScript, materializeCSS and jQuery are the frameworks we used to help with styling and boiler-plate. We use Azure Cognitive Services' Computer Vision API to parse the food menu images for the names of food items. To get the associated images and descriptions of food items we use the Azure Bing Image and Web Search APIs.

## Challenges we ran into
The frequency at which we were querying some of the Azure APIs would hit the rate limits for the free service. We also found that the Computer Vision API was extremely accurate for perfect images of menus, but not nearly as reliable when we try to use images captured using a phone camera or webcam. Small errors can result in the wrong images and descriptions being generated for menu items.

## Accomplishments that we're proud of
Our team is proud of being able to accurately match exotic food items found in menus with the correct image and description with the help of Azure APIs. Each of us learned a lot building dishcovery (You could say we dishcovered new skills) and refined our skills in developing apps.

## What we learned
We learned that the Azure Cognitive Services APIs are very flexible and can be applied to niche use-cases either in isolation or when combined with other Azure APIs like in our case.

## What's next for dishcovery
Some features we could build out to improve dishcovery include:
- Adding Azure Bing Spell Check to improve the accuracy of parsing camera-captured images, many of the imperfections in the OCR for captured images are minor and can be corrected.
- Integration with Yelp to grab user-submitted images of dishes at the restaurant that the user is dining at.
