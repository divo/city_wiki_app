I hit an issue with prebuild, where "jimp" was failing due to OOM. Turns out the Paris images were unoptimized (the resize images script). The solution was to fix the assets in the Djano project.

This branch is a dump of all the hacks and chanegs that eventually lead me to realise what had happened.
