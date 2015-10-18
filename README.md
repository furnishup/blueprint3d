## See it

This repository includes an example application built using blueprint3d:

### http://furnishup.github.io/blueprint3d/example/

## What is this?

This is a customizable application built on three.js that allows users to design an interior space such as a home or apartment. Below are screenshots from our Example App (link above). 

1) Create 2D floorplan:

![floorplan](https://s3.amazonaws.com/furnishup/floorplan.png)

2) Add items:

![add_items](https://s3.amazonaws.com/furnishup/add_items.png)

3) Design in 3D:

![3d_design](https://s3.amazonaws.com/furnishup/design.png)

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

Then, visit `http://localhost:8000` in your browser.

## Contribute!

This project requires a lot more work. In general, it was rushed through various prototype stages, and never refactored as much as it probably should be. We need your help!

Please contact us if you are interested in contributing.

## Directory Structure

### `src/` Directory

The `src` directory contains the core of the project. Here is a description of the various sub-directories:

`floorplanner` - 2D view/controller for editing the floorplan

`items` - Various types of items that can go in rooms

`model` - Data model representing both the 2D floorplan and all of the items in it

`three` - 3D view/controller for viewing and modifying item placement

`utils` - some shared functions that are mostly deprecated in favor of functionality provided by various npm modules


### `example/` Directory

The example directory contains an application built using the core blueprint3d javascript building blocks. It adds html, css, models, textures, and more javascript to tie everything together.

## License

This project is open-source! See LICENSE.txt for more information.
