var strokes = [ { stroke: "M50 500", time: 0},
                { stroke: "l200 60", time: 800},
                { stroke: "l300 -400", time: 600},
                { stroke: "l-150 -20",  time: 300},
                { stroke: "l-180 350", time: 200},
                { stroke: "l-160 -80", time: 800},
                { stroke: "L50 500", time: 600}];

var drawnPath = strokes[0].stroke;
var paper = Raphael(10, 10, 800, 600);
var myPath = paper.path(drawnPath);
var section = 1;
myPath.attr({
    "stroke-width": 4,
    "stroke": "#060",
    "stroke-opacity": 0.5
});

animatePath();

function animatePath() {
    if (section < strokes.length) {
        drawnPath += strokes[section].stroke;
        myPath.animate({
            path: drawnPath
        }, strokes[section].time, animatePath);
        section++;
    }
}