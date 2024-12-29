# STRPBRD
A very basic tool to create stripboard layouts for electronic projects - simply find and place generic through hole components onto the board.

A live demo of STRPBRD can be accessed [here](https://hudsonics.github.io/strpbrd/). See the `examples/` directory for example layouts you can load into the tool.

*Please note: this tool is a work in progress and is likely to be buggy. **Save your work often**!*

## Features
* The generic components can be configured in a number of ways, e.g.
  * Resistors and capacitors have variable pitch and multiple available footprints,
  * Screw terminals can have none/some/all of their pins labelled.
* Layouts can be saved/loaded, and exported as high quality images.
* Bills of materials can be generated to detail the components included in a layout.

## Dependencies
The only dependency is [paper.js](http://paperjs.org/), which is used for rendering graphics to the webpage.

## Roadmap
* Continue to expand the component library
* Improve performance for large designs
