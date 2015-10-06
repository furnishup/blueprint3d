## See it in Action!

This repository includes an example application built using blueprint3d.

### http://pshaw.github.io/blueprint3d/example/

## What is this?

This is a customizable application built on three.js that allows users to to design an interior space such as a home or apartment.

## Get Started

To get started, run:

    npm update
    npm run-script build

The latter command generates `build/blueprint3d.js` and also copies it to `example/js`

## TODO

This project requires a lot more work. In general, it was rushed through various prototype stages, and never refactored as much as it probably should be.

Here are some things that clearly need attention:

- Better documentation
- Test suite
- Make it easier to build an example application (cleaner API, more inclusive base)
- Better serialization format for saving/loading "designs"
- Remove the dependency on jquery from the core source!
- Clean up metadata for items to be less rigid
- Figure out if this project is using any npm conventions correctly 
- Various bug fixes

## /src Directory

The `src` directory contains the core of the project. Here is a description of the various sub-directories:

`floorplanner` - 2D view/controller for editing the floorplan

`items` - Various types of items that can go in rooms

`model` - Data model representing both the 2D floorplan and all of the items in it

`three` - 3D view/controller for viewing and modifying item placement

`utils` - some shared functions that are mostly deprecated in favor of functionality provided by various npm modules

## License

This project is open-source! See license.txt for more information.
