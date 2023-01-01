# Software Renderer in JS

This is a basic software renderer written in JS using [p5.js](https://p5js.org/).

The main rendering code lives in [sketch.js](sketch.js) and the math utility functions are in [utils.js](utils.js).

Functionality:
- load OBJ files with obj_to_json.py script
- simple light source shading
- FPS camera and movement
- triangle clipping

In Progress:
- adding textures

## Interactive Demo

You can play the demo here: [benjaminnow.github.io/renderer/](benjaminnow.github.io/renderer/)

Controls:
- WASD for movement
- mouse for looking around
- Shift for going down
- Space for going up

If you click in the window, your mouse will disappear and you can get it back by pressing Escape.


## My Notes

Some concepts were pretty mathematical so I spent some time writing my own notes to understand them better.

In order:
- [How the Projection Matrix is made](notes/projection%20matrix.pdf)
- [How the Camera Transformation Matrix is made](notes/camera%20transformation.pdf)
- [How to add First-Person control to the camera](notes/fps%20camera%20control.pdf)
- [How to Clip Triangles to prevent artifacts](notes/clipping.pdf)

## Credits

I can't thank [Javidx9](https://www.youtube.com/@javidx9) on YouTube enough for explaining many of these concepts in
a simple way.