## What is this

A project built on three.js to design a home or apartment. For instance, helpful when moving to determine how to use a new space.

## Example

The repository includes an example application. There is a considerable amount of html, css, glue javascript etc. that needs to be in place to utilize blueprint-3d, which the example shows.

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

The source directory contains the core of the project. Here is a description of the various sub-directories:

`floorplanner` - 2D view/controller for editing the floorplan
`items` - Various types of items that can go in rooms
`model` - Data model representing both the 2D floorplan and all of the items in it
`three` - 3D view/controller for viewing and modifying item placement
`utils` - some shared functions that are mostly deprecated in favor of functionality provided by various npm modules
