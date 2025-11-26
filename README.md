# Microchip GUI

Graphical interface for displaying, testing, and exporting electrical circuits. Uses JSON-formatted nested circuit board data returned by [microchip-dsl](https://www.npmjs.com/package/microchip-dsl).

## TODO

- About page
  - About page has bad formatting
- Settings page
- Structure and style
  - Add component search bar for spawning workspaces
  - Editor should have an optional dropdown for samples
- Circuit mechanism
  - Make complexity / number of components in a chip contribute to it closed state size
  - Make it so closing and opening a chip doesn't rearrage things completely (or at least add it as a setting)
  - Make system for calculating layout positions
    - Allow programmer users to add their own custom functions to contribute to the layout
