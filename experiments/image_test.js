import * as utils from "../utils.js"

/*
This takes an image as the texture and loads it into an array where each pixel
is represented by the RGBA values. The array will be img_width * image_height * 4
large.

This is done by creating an image object, adding it to the DOM, letting that 
image load, creating an in-memory canvas, drawing the image to the canvas, then
saving all the pixels of the canvas into our desired texture data array. Finally,
we remove the image from the DOM because we just want the p5 canvas showing.

function load_texture(path) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.id = "texture"
    img.src = path;
    document.body.appendChild(img);
    img.addEventListener("load", () => {
        img = document.getElementById("texture");
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        texture_data = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
        console.log(texture_data);
        img.remove();
    });
}
*/

let texture;
window.preload = function() {
    texture = loadJSON('json_files/minnow_texture.json');
}

function get_texture_color(x, y) {
    let offset = 4 * (y * texture.width + x)
    return [texture.data[offset], texture.data[offset+1], texture.data[offset+2], texture.data[offset+3]];
}

let pd;
window.setup = function() {
    texture.data = new Uint8ClampedArray(texture.data);
    createCanvas(1000, 700);
    //loadPixels();
    //console.log(pixels);
    pd = pixelDensity();
}

// let c = 0;
// let r = 0;

window.draw = function() {
    background(0);
    loadPixels();
    for (let r = 0; r < texture.height; r++) {
        for (let c = 0; c < texture.width; c++) {
            let text_color = get_texture_color(c, r);
            for (let i = 0; i < pd; i++) {
                for (let j = 0; j < pd; j++) {
                    let index = 4 * (((r + mouseY) * pd + j) * width * pd + ((c + mouseX) * pd + i));
                    pixels[index] = text_color[0];
                    pixels[index+1] = text_color[1];
                    pixels[index+2] = text_color[2];
                    pixels[index+3] = text_color[3];
                }
            }
        }
    }
    updatePixels();
}