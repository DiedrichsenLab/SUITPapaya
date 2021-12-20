SuitPapaya
====
Diedrichsen Lab, Western University

SUITPapaya is a project of the Diedrichsen lab to build and html-based viewer for functional and other atlas data for the human cerebellum in SUIT or MNI space, including interactive visualization on the SUIT flatmap. 
The code is extensively based on the repository [rii-mango/Papaya](https://github.com/rii-mango/Papaya).

For information on SUIT and an online version of the viewer, please visit [here](diedrichsenlab.org/imaging/suit.htm).


SUITPapaya extension
------
### SUIT flatmap development
One of the major changes in SUITPapaya is we adaptively re-programmed the surface viewer object as a webgl object to render 
the cerebellum flatmap in order to synchronize with the SUIT volume viewer. These changes are mainly at ``src/js/viewer/screensurface.js``

![ScreenShot](docs/images/hierachical.PNG)

The hierarchical class structure callback is shown in above diagram where the new flatmap object is a viewer instance. So we can access it by

```
var flatmap = papayaContainers[0].viewer.ScreenSurface[0];
```
After a `ScreenSurface` instance (flatmap in SUITPapaya) is initialized, it loads all necessary files for rendering the underlay of the cerebellum flatmap
including:
```
data/flatmap_boader.csv           --> the boader vertices based on lobular_SUIT regions
data/flatmap_edges.csv            --> the flatmap edge information for webgl rendering buffer
data/flatmap_vertices.csv         --> the flatmap vertices information for webgl vetex buffer
data/index_3dCoord.csv            --> the mapping from flatmap indices to the 3d coordinates in th volume
data/mapping_250_rerefine.csv     --> this file is the projection of the whole cerebellum flatmap into a 250*250 grid
```

We take advantage of using the `papaya.viewer.lowerImageBot2` instance as the new flatmap placeholder by re-defining the 
relative positions to the 3d volume object on the page to make it at the right place. Detailed code located at function
```
papaya.viewer.Viewer.prototype.calculateScreenSliceTransforms = function () {}
```
#### Flatmap as a Webgl object



### Details of how volume/flatmap mapping and mouse censor synchronization works
#### 1. From flatmap to volume mapping
```
mouse censor pixel -> flatmap 250 resolution mapping -> index -> 3d coordinate of the volume space
```
The real-time mapping of the crosshair from flatmap (surface instance) to the 3d volumes is achieved using `data/mapping_250_rerefine.csv` 
which projects the whole cerebellum flatmap into a 250*250 resolution grid. The value on the grids is the indices of the flamap (0 value on a 
grid means this area is outside of the cerebellum flatmap). Then, we use this 250 by 250 flatmap to resize to any given webgl 
canvas of arbitrary width and height by the ratio. 

For example, if the webgl object window is width 500 * height 500, then the first 2*2 square pixels at the upper left corner will 
be projected to the 250 flatmap(0,0) value. And every time the mouse censor is located to these 4 pixels, it will always be mapped to
the indices on 250 grid (0,0).

After we get the index of the mouse censor pixel, we use `data/index_3dCoord.csv ` to lookup the 3d coordinates by the index.
And this coordinates value will be passed to `viewer.currentCoord.x`, `viewer.currentCoord.y`, and `viewer.currentCoord.z` to
synchronize the 3d volume instances crosshair. 

```
// Update the current 3D coordinates in the three viewers
if (idx > 0 && idx <= 28935) {
    this.viewer.currentCoord.x = Number(this.surfaces[index].index2Coords[idx - 1][1]);
    this.viewer.currentCoord.y = Number(this.surfaces[index].index2Coords[idx - 1][2]);
    this.viewer.currentCoord.z = Number(this.surfaces[index].index2Coords[idx - 1][3]);
    console.log(this.surfaces[index].index2Coords[idx - 1]);
}
```
#### 2. From 3d volume to flatmap mapping
```
mouse censor clicked on whichever three volumes (current x, y, z) -> index -> 2d coordinates at flatmap
```

The mapping from 3d volume to the flatmap is much easier. When a volume is clicked `this.viewer.selectedSlice = True`,
we just call function `papaya.volume.Volume.prototype.getVoxelAtMM()` by passing current x, y, and z in the 3d volume to get the index value stored at that coords, such as,

```
let val = papayaContainers[0].viewer.screenVolumes[1].volume.getVoxelAtMM(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z, 0, true);
``` 
the `val` is the index of vertices stored in `data/flatmap_vertices.csv` then transfer to x, y coordinates on the flatmap for rendering.

```
if (val !== 0) {
    let currentcenterX = this.surfaces[index].triangleVerticesMap[(val - 1) * 2];
    let currentcenterY = this.surfaces[index].triangleVerticesMap[(val - 1) * 2 + 1];

    // crosshair X
    x_crosshair[0] = -this.xHalf/100 + currentcenterX;
    x_crosshair[1] = currentcenterY;

    x_crosshair[2] = this.xHalf/100 + currentcenterX;
    x_crosshair[3] = currentcenterY;

    // crosshair Y
    y_crosshair[0] = currentcenterX;
    y_crosshair[1] = -this.yHalf/100 + currentcenterY;

    y_crosshair[2] = currentcenterX;
    y_crosshair[3] = this.yHalf/100 + currentcenterY;

}
```

### Loading volume .nii and flatmap .gii at the same time


### CSS part: Menu drop down design using .json file




Papaya
------
Papaya is a pure JavaScript medical research image viewer, supporting [DICOM and NIFTI formats](https://github.com/rii-mango/Papaya/wiki/Supported-Formats), compatible across a [range of web browsers](https://github.com/rii-mango/Papaya/wiki/Requirements).  This orthogonal viewer supports [overlays](https://github.com/rii-mango/Papaya/wiki/Configuration#images), [atlases](https://github.com/rii-mango/Papaya/wiki/How-To-Use-Atlases), [GIFTI & VTK surface data](https://github.com/rii-mango/Papaya/wiki/Configuration#surfaces) and [DTI data](https://github.com/rii-mango/Papaya/wiki/Configuration#dti).  The Papaya UI is [configurable](https://github.com/rii-mango/Papaya/wiki/Configuration) with many [display, menu and control options](https://github.com/rii-mango/Papaya/wiki/Configuration#display-parameters) and can be run on a [web server or as a local, shareable file](https://github.com/rii-mango/Papaya/wiki/How-To-Build-Papaya).

![ScreenShot](https://raw.github.com/rii-mango/Papaya/master/docs/images/splash1.png)&nbsp;&nbsp;&nbsp;![ScreenShot](https://raw.github.com/rii-mango/Papaya/master/docs/images/splash2.png)

### [Documentation](https://github.com/rii-mango/Papaya/wiki) & [Demo](http://rii.uthscsa.edu/mango/papaya/)
* [Requirements](https://github.com/rii-mango/Papaya/wiki/Requirements): Firefox (7+), Chrome (7+), Safari (6+), iOS (6+), IE (10+), Edge (12+)
* [Supported Formats](https://github.com/rii-mango/Papaya/wiki/Supported-Formats): NIFTI (.nii, .nii.gz), DICOM (compressed/uncompressed), GIFTI (.surf.gii), VTK

Quickstart Guide
------
### Development
Load `tests/debug_local.html` or `tests/debug_server.html` in your [favorite](http://www.jetbrains.com/webstorm/) JavaScript debugger.


### [Building](https://github.com/rii-mango/Papaya/wiki/How-To-Build-Papaya)
See [here](https://github.com/rii-mango/Papaya/tree/master/release) for the latest release or run `papaya-builder.sh` to create your own build.  See the [documentation](https://github.com/rii-mango/Papaya/wiki/How-To-Build-Papaya) for more information.

### [Usage](https://github.com/rii-mango/Papaya/wiki/Usage) & [Configuration](https://github.com/rii-mango/Papaya/wiki/Configuration)

#### Basic usage (loads a blank viewer)
```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <link rel="stylesheet" type="text/css" href="papaya.css" />
        <script type="text/javascript" src="papaya.js"></script>
        <title>Papaya Viewer</title>
    </head>

    <body>
        <div class="papaya"></div>
    </body>
</html>
```

#### To automatically load images and configure other options
```html
<head>
    ...
    <script type="text/javascript">
        var params = [];
        params["worldSpace"] = true;
        params["images"] = ["data/myBaseImage.nii.gz", "data/myOverlayImage.nii.gz"];
        params["surfaces"] = ["data/mySurface.surf.gii"];
        params["myOverlayImage.nii.gz"] = {"min": 4, "max": 10};
    </script>
</head>

...

<div class="papaya" data-params="params"></div>

```

Acknowledgments
-----
Papaya uses:
- [Daikon](https://github.com/rii-mango/Daikon) for DICOM support
- [NIFTI-Reader-JS](https://github.com/rii-mango/NIFTI-Reader-JS) for NIFTI support 
- [GIFTI-Reader-JS](https://github.com/rii-mango/GIFTI-Reader-JS) for GIFTI support 

As well as the following third-party libraries:
- [bowser](https://github.com/ded/bowser) &mdash; for browser detection
- [Closure Compiler](https://developers.google.com/closure/compiler/) &mdash; JavaScript compression
- [jquery](http://jquery.com/) &mdash; DOM manipulation
- [numerics](http://numericjs.com/) &mdash; for matrix math
- [pako](https://github.com/nodeca/pako) &mdash; for GZIP inflating
