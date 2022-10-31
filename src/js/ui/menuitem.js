
/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItem = papaya.ui.MenuItem || function (viewer, label, action, callback, dataSource, method, modifier, hoverText) {
    this.viewer = viewer;

    this.modifier = "";
    if (!papaya.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = "-" + modifier;
    }

    this.dataSource = dataSource;
    this.method = method;

    if (this.dataSource && this.method) {
        this.label = this.dataSource[this.method]();
    } else {
        this.label = label;
    }

    this.action = action + this.modifier;
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex;
    this.callback = callback;
    this.menu = null;
    this.isContext = false;
    // tool-tip text displayed on hover
    this.hoverText = hoverText;
};


/*** Prototype Methods ***/

papaya.ui.MenuItem.prototype.buildHTML = function (parentId) {
    var html, thisHtml, label;

    if (this.dataSource && this.method) {
        label = this.dataSource[this.method]();
    } else {
        label = this.label;
    }

    html = "<li id='" + this.id + "'><span class='" + PAPAYA_MENU_UNSELECTABLE + "'>" + label + "</span>" + (this.menu ? "<span style='float:right'>&nbsp;&#x25B6;</span>" : "") + "</li>";
    $("#" + parentId).append(html);

    // we make sure to escape the selector here in case this.id contains special characters (e.g. '+')
    thisHtml = $("#" + $.escapeSelector(this.id));

    if (this.viewer.container.contextManager && papaya.utilities.PlatformUtils.smallScreen) {
        thisHtml[0].style.width = (this.viewer.viewerDim - 10) + 'px';
        thisHtml[0].style.fontSize = 18 + 'px';
    }

    thisHtml.click(papaya.utilities.ObjectUtils.bind(this,
        function (e) {
            this.doAction(this.isContext && e.shiftKey);
        }));

    thisHtml.hover(function () { $(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });

    $(`#${this.id}`).attr('title', this.hoverText);
};



papaya.ui.MenuItem.prototype.doAction = function (keepOpen) {
    if (!keepOpen && !this.menu) {
        this.viewer.showingContextMenu = false;
    }

    if(this.callback2){
        this.callback2(this.action, null, keepOpen);
    }
    this.callback(this.action, null, keepOpen);
};
