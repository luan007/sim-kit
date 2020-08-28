import * as ao from "../libao"
import { three, vue, loop, looperStart, threeTick } from "../libao";
import { fabric } from "fabric";
import "./style.less";
import "./fa/css/all.css";
var trender = ao.threeRenderer({ autoSize: false, antialias: true })

var scene = ao.threeScene();

// ao.threeOrbitControl({
//     camPos: new three.Vector3(0, 0, -10)
// });


var canvas;
var shared = vue.reactive({
    objects: [],
    tools: [
        // {
        //     type: "observer",
        //     name: "Observer",
        //     cl: 'fa far fa-eye'.split(' ')
        // },
        {
            type: "wall",
            name: "Wall",
            cl: 'fa far fa-square'.split(' ')
        },
        {
            type: "bg",
            name: "Back-ground",
            cl: 'fa far fa-map'.split(' ')
        },
        {
            type: "img",
            name: "Image Source",
            cl: 'fa far fa-image'.split(' ')
        },
        {
            type: "img_cloud",
            name: "Image Cloud",
            cl: 'fa far fa-magic'.split(' ')
        },
        {
            type: "aud",
            name: "Audio Source",
            cl: 'fa far fa-volume'.split(' ')
        }
    ]
});

var factory = {
    observer() {
        var camera = ao.threePerspectiveCamera(45);
        var rect = new fabric.Rect({
            width: 50,
            height: 50,
            originX: "center",
            originY: "center",
            top: 0,
            left: 0,
            fill: 'rgba(0, 0, 255, 0.5)'
        });
        var tri = new fabric.Triangle({
            width: 80,
            height: 80,
            originX: "center",
            originY: "top",
            top: 0,
            left: 0,
            fill: 'rgba(0, 0, 255, 0.5)'
        });
        var grp = new fabric.Group([rect, tri]);
        grp.tgrp = new three.Group();
        grp.tgrp.add(camera);
        scene.add(grp.tgrp);
        shared.objects.push(grp);
        canvas.add(grp);
    },
    wall() {
        var rect = new fabric.Rect({
            width: 100,
            height: 100,
            originX: "center",
            originY: "center",
            top: 0,
            left: 0,
            fill: 'rgba(255,0,0,0.5)'
        });
        var grp = new fabric.Group([rect]);
        grp.tgrp = new three.Group();
        var boxMat = new three.MeshBasicMaterial({
            color: 0xffffff
        });
        var boxGeo = new three.BoxGeometry(1, 1, 1);
        grp.tgrp.add(new three.Mesh(boxGeo, boxMat))
        scene.add(grp.tgrp);

        shared.objects.push(grp);
        canvas.add(grp);
    }
};


window.shared = shared;
var a = vue.createApp({
    data: () => {
        return shared
    },
    mounted: () => {
        init();
    },
    methods: {
        create(tool) {
            factory[tool.type] && factory[tool.type]();
        }
    }
});
a.mount(document.getElementById("app"))

function update_all() {
    shared.objects.forEach((v) => {
        var pt = v.getCenterPoint();
        v.tgrp.position.z = -pt.y / 100;
        v.tgrp.position.x = pt.x / 100;
        v.tgrp.scale.x = v.scaleX;
        v.tgrp.scale.z = v.scaleY;
        v.tgrp.rotation.y = v.angle / 360 * Math.PI * 2;
    });
}

function init() {

    var tcontainer = document.querySelector("#threeView");
    tcontainer.append(trender.canvas);

    canvas = new fabric.Canvas('editor', {});
    var container = document.querySelector(".editor-container");
    function resize() {
        canvas.setWidth(container.clientWidth);
        canvas.setHeight(container.clientHeight);
        canvas.absolutePan({
            x: -container.clientWidth / 2,
            y: -container.clientHeight / 2,
        });
        trender.renderer.setSize(
            tcontainer.clientWidth,
            tcontainer.clientHeight
        )
        trender.renderer.emit('resize',
            tcontainer.clientWidth,
            tcontainer.clientHeight)
    }
    window.addEventListener("resize", resize);
    resize();
    fabric.Object.prototype.transparentCorners = false;
    factory.observer();

    // var angleControl = $('angle-control');
    // angleControl.oninput = function () {
    //     rect.set('angle', parseInt(this.value, 10)).setCoords();
    //     canvas.requestRenderAll();
    // };

    // var scaleControl = $('scale-control');
    // scaleControl.oninput = function () {
    //     rect.scale(parseFloat(this.value)).setCoords();
    //     canvas.requestRenderAll();
    // };

    // var topControl = $('top-control');
    // topControl.oninput = function () {
    //     rect.set('top', parseInt(this.value, 10)).setCoords();
    //     canvas.requestRenderAll();
    // };

    // var leftControl = $('left-control');
    // leftControl.oninput = function () {
    //     rect.set('left', parseInt(this.value, 10)).setCoords();
    //     canvas.requestRenderAll();
    // };

    // var skewXControl = $('skewX-control');
    // skewXControl.oninput = function () {
    //     rect.set('skewX', parseInt(this.value, 10)).setCoords();
    //     canvas.requestRenderAll();
    // };

    // var skewYControl = $('skewY-control');
    // skewYControl.oninput = function () {
    //     rect.set('skewY', parseInt(this.value, 10)).setCoords();
    //     canvas.requestRenderAll();
    // };

    function updateControls() {
        // scaleControl.value = rect.scaleX;
        // angleControl.value = rect.angle;
        // leftControl.value = rect.left;
        // topControl.value = rect.top;
        // skewXControl.value = rect.skewX;
        // skewYControl.value = rect.skewY;
    }
    canvas.on({
        'object:moving': updateControls,
        'object:scaling': updateControls,
        'object:resizing': updateControls,
        'object:rotating': updateControls,
        'object:skewing': updateControls
    });

    loop(() => {
        canvas.requestRenderAll();
        update_all();
        threeTick();
    });


    looperStart();
}

