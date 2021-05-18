
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Constructor ***/
papaya.viewer.ColorTable = papaya.viewer.ColorTable || function (lutName, baseImage, colorTable) {
    var lut = null;

    if (colorTable !== undefined) {
        lut = colorTable;
    } else {
        lut = papaya.viewer.ColorTable.findLUT(lutName);
    }

    this.lutData = lut.data;
    this.maxLUT = 0;
    this.minLUT = 0;
    this.knotThresholds = [];
    this.knotRangeRatios = [];

    this.LUTarrayG = new Array(256);
    this.LUTarrayR = new Array(256);
    this.LUTarrayB = new Array(256);
    this.isBaseImage = baseImage;

    this.knotMin = this.lutData[0];
    this.knotMax = this.lutData[this.lutData.length - 1];
    this.useGradation = (typeof lut.gradation === "undefined") || lut.gradation;

    this.updateLUT(papaya.viewer.ColorTable.LUT_MIN, papaya.viewer.ColorTable.LUT_MAX);
};


/*** Static Pseudo-constants ***/

papaya.viewer.ColorTable.TABLE_GRAYSCALE = {"name": "Grayscale", "data": [[0, 0, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_SPECTRUM = {"name": "Spectrum", "data": [[0, 0, 0, 0], [0.1, 0, 0, 1], [0.33, 0, 1, 1],
    [0.5, 0, 1, 0], [0.66, 1, 1, 0], [0.9, 1, 0, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_RED2YELLOW = {"name": "Overlay (Positives)", "data": [[0, 1, 0, 0], [1, 1, 1, 0]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_BLUE2GREEN = {"name": "Overlay (Negatives)", "data": [[0, 0, 0, 1], [1, 0, 1, 0]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_HOTANDCOLD = {"name": "Hot-and-Cold", "data": [[0, 0, 0, 1], [0.15, 0, 1, 1],
    [0.3, 0, 1, 0], [0.45, 0, 0, 0], [0.5, 0, 0, 0], [0.55, 0, 0, 0], [0.7, 1, 1, 0], [0.85, 1, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_GOLD = {"name": "Gold", "data": [[0, 0, 0, 0], [0.13, 0.19, 0.03, 0],
    [0.25, 0.39, 0.12, 0], [0.38, 0.59, 0.26, 0], [0.50, 0.80, 0.46, 0.08], [0.63, 0.99, 0.71, 0.21],
    [0.75, 0.99, 0.88, 0.34], [0.88, 0.99, 0.99, 0.48], [1, 0.90, 0.95, 0.61]], "gradation": true};
papaya.viewer.ColorTable.TABLE_RED2WHITE = {"name": "Red Overlay", "data": [[0, 0.75, 0, 0], [0.5, 1, 0.5, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_GREEN2WHITE = {"name": "Green Overlay", "data": [[0, 0, 0.75, 0], [0.5, 0.5, 1, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_BLUE2WHITE = {"name": "Blue Overlay", "data": [[0, 0, 0, 1], [0.5, 0, 0.5, 1],
    [0.95, 0, 1, 1], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_DTI_SPECTRUM = {"name": "Spectrum", "data": [[0, 1, 0, 0], [0.5, 0, 1, 0], [1, 0, 0, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_FIRE = {"name": "Fire", "data": [[0, 0, 0, 0], [0.06, 0, 0, 0.36], [0.16, 0.29, 0, 0.75],
    [0.22, 0.48, 0, 0.89], [0.31, 0.68, 0, 0.6], [0.37, 0.76, 0, 0.36], [0.5, 0.94, 0.31, 0], [0.56, 1, 0.45, 0],
    [0.81, 1, 0.91, 0], [0.88, 1, 1, 0.38], [1,1,1,1]], "gradation": true};

// Color tables for label gii in the volume viewers
papaya.viewer.ColorTable.TABLE_BUCKNER_7NETWORKS = {"name": "Buckner_7Networks", "data": [[0, 0, 0, 0], [0.14, 0.470588, 0.070588, 0.52549],
    [0.29, 0.2745098, 0.5098, 0.70588], [0.43, 0, 0.462745, 0.0549], [0.57, 0.7686, 0.22745, 0.98039], [0.71, 0.8627, 0.9725, 0.6431],
    [0.86, 0.90196, 0.58039, 0.1333], [1, 0.80392, 0.2431, 0.30588]], "gradation": true};
papaya.viewer.ColorTable.TABLE_BUCKNER_17NETWORKS = {"name": "Buckner_17Networks", "data": [[0, 0.667, 0.667, 0.667],
    [0.0588, 0.4706, 0.0706, 0.5255], [0.1176, 1, 0, 0], [0.1765, 0.2745, 0.5098, 0.7059], [0.2353, 0.1647, 0.8, 0.6431], [0.2941, 0.2902, 0.6078, 0.2353],
    [0.3529, 0, 0.4627, 0.0549], [0.4118, 0.7686, 0.2275, 0.9804], [0.4706, 1, 0.5961, 0.8353], [0.5294, 0.8627, 0.9725, 0.6431], [0.5882, 0.4784, 0.5294, 0.1961],
    [0.6471, 0.4667, 0.5490, 0.6902], [0.7059, 0.9019, 0.5804, 0.1333], [0.7647, 0.5294, 0.1961, 0.2902], [0.8235, 0.0471, 0.1882, 1], [0.8824, 0, 0, 0.5098],
    [0.9412, 1, 1, 0], [1, 0.8039, 0.2431, 0.3059]], "gradation": true};
papaya.viewer.ColorTable.TABLE_JI_10NETWORKS = {"name": "Ji_10Networks", "data": [[0, 0, 0, 0], [0.1, 0.5625, 0.886719, 0.597656],
    [0.2, 0, 0.324219, 0.71875], [0.3, 0.238281, 0, 0.597656], [0.4, 0, 0.601562, 0.601562], [0.5, 0.308594, 0.613281, 0.996094],
    [0.6, 0.996094, 0.996094, 0], [0.7, 0.996094, 0.890625, 0.765625], [0.8, 0.691406, 0.347656, 0.15625],
    [0.9, 0.859375, 0.078125, 0.234375], [1, 0.996094, 0.609375, 0]], "gradation": true};
papaya.viewer.ColorTable.TABLE_MDTB_10REGIONS = {"name": "MDTB_10Regions", "data": [[0, 0, 0, 0], [0.1, 0.180392, 0.650980, 0.596078],
    [0.2, 0.333333, 0.592157, 0.125490], [0.3, 0.2, 0.4, 0.576471], [0.4, 0.058824, 0.098039, 0.494118], [0.5, 0.647059, 0.094118, 0.635294],
    [0.6, 0.686275, 0.172549, 0.278431], [0.7, 0.882353, 0.494118, 0.690196], [0.8, 0.925490, 0.631373, 0.031373],
    [0.9, 0.988235, 0.854902, 0.462745], [1, 0.466667, 0.462745, 0.964706]], "gradation": true};
papaya.viewer.ColorTable.TABLE_LOBULES_SUIT = {"name": "Lobules_SUIT", "data": [[0, 0.667, 0.667, 0.667], [0.0357, 0.8, 1, 0],
    [0.0714, 0.722, 0.902, 0], [0.1071, 0, 0.902, 0.361], [0.1429, 0, 1, 0.4], [0.1786, 0, 0.4, 1], [0.2143, 0, 0.322, 0.8],
    [0.25, 0, 0.4, 1], [0.2857, 0.8, 0, 1], [0.3214, 0.639, 0, 0.8], [0.3571, 0.8, 0, 1], [0.3929, 1, 0, 0], [0.4286, 0.8, 0, 0],
    [0.4643, 1, 0, 0], [0.5, 1, 0.6, 0], [0.5357, 0.8, 0.478, 0], [0.5714, 1, 0.6, 0], [0.6071, 0.2, 1, 0], [0.6429, 0.161, 0.8, 0],
    [0.6786, 0.2, 1, 0], [0.7143, 0, 1, 1], [0.75, 0, 0.8, 0.8], [0.7857, 0, 1, 1], [0.8214, 0.2, 0, 1], [0.8571, 0.161, 0, 0.8],
    [0.8929, 0.2, 0, 1], [0.9286, 1, 0, 0.6], [0.9643, 0.8, 0, 0.478], [1, 1, 0, 0.6]], "gradation": true};
papaya.viewer.ColorTable.TABLE_HCP_SOMATOTOPY = {"name": "HCP_somatotopy", "data": [[0,0,0,0], [0.2, 0.9000, 0.1000, 0.0000],
        [0.4, 0.9000, 0.0000, 0.1000], [0.6, 0.1000, 0.0000, 0.8000], [0.8, 0.0000, 0.1000, 0.8000], [1, 0, 0.8000, 0]], "gradation": true};
papaya.viewer.ColorTable.TABLE_VANES_RETINOTOPY = {"name": "vanEs_retinotopy", "data": [[0,0,0,0], [0.1, 0.8281, 0.5234, 0.5156],
        [0.2, 0.6836, 0.2422, 0.2734], [0.3, 0.6836, 0.2422, 0.2734], [0.4, 0.8281, 0.5234, 0.5156],
        [0.5, 0.8516, 0.6172, 0.2617], [0.6, 0.8516, 0.6172, 0.2617], [0.7, 0.1758, 0.3477, 0.5547],
        [0.8, 0.5312, 0.5820, 0.7812], [0.9, 0.1758, 0.3477, 0.5547], [1, 0.5312, 0.5820, 0.7812]], "gradation": true};

papaya.viewer.ColorTable.ARROW_ICON = "data:image/gif;base64,R0lGODlhCwARAPfGMf//////zP//mf//Zv//M///AP/M///MzP/Mmf/M" +
    "Zv/MM//MAP+Z//+ZzP+Zmf+ZZv+ZM/+ZAP9m//9mzP9mmf9mZv9mM/9mAP8z//8zzP8zmf8zZv8zM/8zAP8A//8AzP8Amf8AZv8AM/8AAMz//8z/" +
    "zMz/mcz/Zsz/M8z/AMzM/8zMzMzMmczMZszMM8zMAMyZ/8yZzMyZmcyZZsyZM8yZAMxm/8xmzMxmmcxmZsxmM8xmAMwz/8wzzMwzmcwzZswzM8wz" +
    "AMwA/8wAzMwAmcwAZswAM8wAAJn//5n/zJn/mZn/Zpn/M5n/AJnM/5nMzJnMmZnMZpnMM5nMAJmZ/5mZzJmZmZmZZpmZM5mZAJlm/5lmzJlmmZlm" +
    "ZplmM5lmAJkz/5kzzJkzmZkzZpkzM5kzAJkA/5kAzJkAmZkAZpkAM5kAAGb//2b/zGb/mWb/Zmb/M2b/AGbM/2bMzGbMmWbMZmbMM2bMAGaZ/2aZ" +
    "zGaZmWaZZmaZM2aZAGZm/2ZmzGZmmWZmZmZmM2ZmAGYz/2YzzGYzmWYzZmYzM2YzAGYA/2YAzGYAmWYAZmYAM2YAADP//zP/zDP/mTP/ZjP/MzP/" +
    "ADPM/zPMzDPMmTPMZjPMMzPMADOZ/zOZzDOZmTOZZjOZMzOZADNm/zNmzDNmmTNmZjNmMzNmADMz/zMzzDMzmTMzZjMzMzMzADMA/zMAzDMAmTMA" +
    "ZjMAMzMAAAD//wD/zAD/mQD/ZgD/MwD/AADM/wDMzADMmQDMZgDMMwDMAACZ/wCZzACZmQCZZgCZMwCZAABm/wBmzABmmQBmZgBmMwBmAAAz/wAz" +
    "zAAzmQAzZgAzMwAzAAAA/wAAzAAAmQAAZgAAM+4AAN0AALsAAKoAAIgAAHcAAFUAAEQAACIAABEAAADuAADdAAC7AACqAACIAAB3AABVAABEAAAi" +
    "AAARAAAA7gAA3QAAuwAAqgAAiAAAdwAAVQAARAAAIgAAEe7u7t3d3bu7u6qqqoiIiHd3d1VVVURERCIiIhEREQAAACH5BAEAAMYALAAAAAALABEA" +
    "AAg/AI0JFGhvoEGC+vodRKgv4UF7DSMqZBixoUKIFSv2w5jRIseOGztK/JgxpMiEJDWmHHkSZUuTIvvt60ezps2AADs=";
papaya.viewer.ColorTable.ARROW_ICON_WIDTH = 11;

papaya.viewer.ColorTable.DEFAULT_COLOR_TABLE = papaya.viewer.ColorTable.TABLE_GRAYSCALE;

papaya.viewer.ColorTable.PARAMETRIC_COLOR_TABLES = [papaya.viewer.ColorTable.TABLE_RED2YELLOW,
    papaya.viewer.ColorTable.TABLE_BLUE2GREEN];

papaya.viewer.ColorTable.OVERLAY_COLOR_TABLES = [
    papaya.viewer.ColorTable.TABLE_BUCKNER_7NETWORKS,
    papaya.viewer.ColorTable.TABLE_BUCKNER_17NETWORKS,
    papaya.viewer.ColorTable.TABLE_JI_10NETWORKS,
    papaya.viewer.ColorTable.TABLE_MDTB_10REGIONS,
    papaya.viewer.ColorTable.TABLE_LOBULES_SUIT,
    papaya.viewer.ColorTable.TABLE_HCP_SOMATOTOPY,
    papaya.viewer.ColorTable.TABLE_VANES_RETINOTOPY
];

papaya.viewer.ColorTable.TABLE_ALL = [
    papaya.viewer.ColorTable.TABLE_GRAYSCALE,
    papaya.viewer.ColorTable.TABLE_SPECTRUM,
    papaya.viewer.ColorTable.TABLE_FIRE,
    papaya.viewer.ColorTable.TABLE_HOTANDCOLD,
    papaya.viewer.ColorTable.TABLE_GOLD,
    papaya.viewer.ColorTable.TABLE_RED2YELLOW,
    papaya.viewer.ColorTable.TABLE_BLUE2GREEN,
    papaya.viewer.ColorTable.TABLE_RED2WHITE,
    papaya.viewer.ColorTable.TABLE_GREEN2WHITE,
    papaya.viewer.ColorTable.TABLE_BLUE2WHITE,
    papaya.viewer.ColorTable.TABLE_BUCKNER_7NETWORKS,
    papaya.viewer.ColorTable.TABLE_BUCKNER_17NETWORKS,
    papaya.viewer.ColorTable.TABLE_JI_10NETWORKS,
    papaya.viewer.ColorTable.TABLE_MDTB_10REGIONS,
    papaya.viewer.ColorTable.TABLE_LOBULES_SUIT,
    papaya.viewer.ColorTable.TABLE_HCP_SOMATOTOPY,
    papaya.viewer.ColorTable.TABLE_VANES_RETINOTOPY
];

papaya.viewer.ColorTable.LUT_MIN = 0;
papaya.viewer.ColorTable.LUT_MAX = 255;
papaya.viewer.ColorTable.ICON_SIZE = 18;
papaya.viewer.ColorTable.COLOR_BAR_WIDTH = 100;
papaya.viewer.ColorTable.COLOR_BAR_HEIGHT = 15;


/*** Static Methods ***/

papaya.viewer.ColorTable.findLUT = function (name) {
    var ctr;

    for (ctr = 0; ctr < papaya.viewer.ColorTable.TABLE_ALL.length; ctr += 1) {
        if (papaya.viewer.ColorTable.TABLE_ALL[ctr].name == name) {  // needs to be ==, not ===
            return papaya.viewer.ColorTable.TABLE_ALL[ctr];
        }
    }

    return papaya.viewer.ColorTable.TABLE_GRAYSCALE;
};



papaya.viewer.ColorTable.addCustomLUT = function (lut) {
    if (papaya.viewer.ColorTable.findLUT(lut.name).data === papaya.viewer.ColorTable.TABLE_GRAYSCALE.data) {
        papaya.viewer.ColorTable.TABLE_ALL.push(lut);
    }
};


/*** Prototype Methods ***/

papaya.viewer.ColorTable.prototype.updateMinLUT = function (minLUTnew) {
    this.updateLUT(minLUTnew, this.maxLUT);
};



papaya.viewer.ColorTable.prototype.updateMaxLUT = function (maxLUTnew) {
    this.updateLUT(this.minLUT, maxLUTnew);
};



papaya.viewer.ColorTable.prototype.updateLUT = function (minLUTnew, maxLUTnew) {
    var range, ctr, ctrKnot, value;

    this.maxLUT = maxLUTnew;
    this.minLUT = minLUTnew;
    range = this.maxLUT - this.minLUT;

    for (ctr = 0; ctr < this.lutData.length; ctr += 1) {
        this.knotThresholds[ctr] = (this.lutData[ctr][0] * range) + this.minLUT;
    }

    for (ctr = 0; ctr < (this.lutData.length - 1); ctr += 1) {
        this.knotRangeRatios[ctr] = papaya.viewer.ColorTable.LUT_MAX / (this.knotThresholds[ctr + 1] -
            this.knotThresholds[ctr]);
    }

    for (ctr = 0; ctr < 256; ctr += 1) {
        if (ctr <= this.minLUT) {
            this.LUTarrayR[ctr] = this.knotMin[1] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMin[2] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMin[3] * papaya.viewer.ColorTable.LUT_MAX;
        } else if (ctr > this.maxLUT) {
            this.LUTarrayR[ctr] = this.knotMax[1] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMax[2] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMax[3] * papaya.viewer.ColorTable.LUT_MAX;
        } else {
            for (ctrKnot = 0; ctrKnot < (this.lutData.length - 1); ctrKnot += 1) {
                if ((ctr > this.knotThresholds[ctrKnot]) && (ctr <= this.knotThresholds[ctrKnot + 1])) {
                    if (this.useGradation) {
                        value = (((ctr - this.knotThresholds[ctrKnot]) * this.knotRangeRatios[ctrKnot]) + 0.5) /
                            papaya.viewer.ColorTable.LUT_MAX;

                        this.LUTarrayR[ctr] = (((1 - value) * this.lutData[ctrKnot][1]) +
                            (value * this.lutData[ctrKnot + 1][1])) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (((1 - value) * this.lutData[ctrKnot][2]) +
                            (value * this.lutData[ctrKnot + 1][2])) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (((1 - value) * this.lutData[ctrKnot][3]) +
                            (value * this.lutData[ctrKnot + 1][3])) * papaya.viewer.ColorTable.LUT_MAX;
                    } else {
                        this.LUTarrayR[ctr] = (this.lutData[ctrKnot][1]) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (this.lutData[ctrKnot][2]) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (this.lutData[ctrKnot][3]) * papaya.viewer.ColorTable.LUT_MAX;
                    }
                }
            }
        }
    }
};



papaya.viewer.ColorTable.prototype.lookupRed = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayR[index] & 0xff);
    }

    return 0;
};



papaya.viewer.ColorTable.prototype.lookupGreen = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayG[index] & 0xff);
    }

    return 0;
};



papaya.viewer.ColorTable.prototype.lookupBlue = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayB[index] & 0xff);
    }

    return 0;
};
