SampleNodeApp [![Build Status](http://teamcity/app/rest/builds/buildType:\(id:bt9001\)/statusIcon)](http://teamcity/viewType.html?buildTypeId=bt9001)
=======================

## Running your app

If you're running in dev mode (`NODE_ENV=dev node index.js`), you will have to navigate to your apps https address and accept the cautionary ssl certificate. If you do not do this, your app will not run in the ETMC. Otherwise, Stackato should take care of everything for you.

## Creating a Release

Creating a release of the app is pretty simple.

1. Verify that your upstream is pointing at the correct repository. `git remote -v` should have a listing for upstream that says `git@github.exacttarget.com:MarketingCloudDev/derelicte-campaign.git`
2. Verify that all your changes are pushed to the master repo.
  * We won't let you release with uncommitted changes, but if you have local commits that aren't on the server, they'll make it into your release.
3. Run the grunt release command. You can specify major, minor, or patch.
  * `grunt release:{{{releaseType}}}`
  * This will update the stackato.yml, package.json, bower.json, commit/tag the changes, and push everything up to master.
4. Celebrate. :beer:

## Building a Package

1. Run the grunt release command
  * `grunt compress`
  * This will zip up your release ignoring the same files ignored within your stackato.yml file.

## Deploying to Stackato

Deploying the app is also pretty simple.

**An application is technically released when it is deployed AND mapped to a stack's url**

1. Download the zipped release package from [here](../../releases).
2. Unpack the zipped release to a directory on your local pc.
3. Target the correct Stackato environment.
4. Run `stackato push` from the root of the project directory, and answer the following prompts.
  1. Would you like to deploy from the current directory? `enter` or `Y`
  2. What environment are you deploying to? {{{development, qa, or production}}}
5. Map the new stackato app to whichever stack you are deploying to.
  1. `stackato map {{{appName}}} {{{url}}}`
6. Unmap and stop the old version of the application if needed.
  1.  ` stackato unmap {{{appName}}} {{{url}}}`
  2.  `stackato delete {{{appName}}}`
7. After testing the new version, delete the old one.
8. Celebrate. :beer:
