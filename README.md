## What is this

A project built on three.js to design a home or apartment. For instance, helpful when moving to determine how to use a new space.

## Example

The repository includes an example application. There is a considerable amount of html, css, glue javascript etc. that needs to be in place to utilize blueprint-3d, which the example shows.

http://pshaw.github.io/blueprint3d/example/

## Developing and Running Locally

To get started, clone the repository and ensure you npm installed, then run:

    npm update
    npm run-script build

The latter command generates `example/js/blueprint3d.js` from `src`.

The easiest way to run locally is to run a local server from the `example` directory. There are plenty of options. One uses Python's built in webserver:

    cd example

    # Python 2.x
    python -m SimpleHTTPServer

    # Python 3.x
    python -m http.server

## Contribute!

This project requires a lot more work. In general, it was rushed through various prototype stages, and never refactored as much as it probably should be. We need your help!

Please contact us if you are interested in contributing.

## Directory Structure

### `src/` Directory

The source directory contains the core of the project. Here is a description of the various sub-directories:

`floorplanner` - 2D view/controller for editing the floorplan

`items` - Various types of items that can go in rooms

`model` - Data model representing both the 2D floorplan and all of the items in it

`three` - 3D view/controller for viewing and modifying item placement

`utils` - some shared functions that are mostly deprecated in favor of functionality provided by various npm modules

### `example/` Directory

The example directory contains an application built using the core blueprint3d javascript building blocks. It adds html, css, models, textures, and more javascript to tie everything together.

