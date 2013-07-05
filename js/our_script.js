var paper; 
var path1; 
var count = 1;
var flow_yCoor = "200";
var flow_xCoor = "75";
var pressure_yCoor = "575";
var pressure_xCoor = "75";
var waveFormStrokeWidth = 3;
var DEBUG = false;

var VentSim = {
    
    // Name: Waveform Speed
    speed: 300,
    
    // Name: Tidal Volume "Vt"
    // Measure: mL
    // Description: total volumne
    tidalVolume: 750, 
    
    // Name: Respiratory Volume  "f"
    // Measure: n/a
    // Description: breathing cycles per minute
    respFreq: 15,
    
    // Inspiratory Flow Rate "Vt"
    // Measure: L/min
    // Description: rate at which volume enters lungs
    inspFlowRate: 30,
    
    // Cycle Time "Tc"
    // Measure: seconds
    // Description: dependent on respiratory frequency, set initially to 0 and load in settings
    cycleTime: 0,
    
    // Inspriatory Time "Ti"
    // Measure: seconds
    // Description: calculated from the delivered tidal volumenand the inspiratory flow rate, not controlled by user
    inspTime: 1.5,
    
    // Expiratory Time "Te"
    // Measure: seconds
    // Description: function of total cycle time minus the inspiratory time, not controlled by user
    expTime: 0,
    
    // Airways Resistance "Raw"
    // Measure: cm/H2O/L/sec
    // Description: physiological property of the patient
    airwaysResistance: 10, // Airways Resistance (cm H20/L/sec "Raw")
    
    // Transairway Pressure "Pta"
    // Measure: cm H2O
    // Description: function of flow rate * airways resistance
    transairwayPressure: 5, // Transairway Pressure = flow rate * Raw "Pta"
    
    // Respiratory System Compliance "Crs"
    // Measure: L/cm H2O
    // Description: change in volume for any given applied pressure
    respSysCompliance: 0.05,
    
    // Inspiratory Hold / Plateau "Pplateau" "Pa"
    // Measure: mL/cm H2O
    // Description: Alveolar pressure, recoil force of the alveoli. Tidal volumne / Crs (Respiratory System Compliance)
    pressurePlateau: 15,
    
    // PIP - Positive Inspiratory Pressure
    // Measure: cm H2O
    // Description: Pta + Pplateau
    pip: 20,
    
    // Mode
    // Measure: n/a
    // Descripiton: ???
    mode: "control"
};

$(document).ready(function(){
    
    // Load Settings
    $('#speed_value').val(VentSim.speed);
    $('#inspiratory_flow_rate_value').val(VentSim.inspFlowRate);
    $('#cycle_time_value').val(VentSim.cycleTime);
    $('#respiratory_freq_value').val(VentSim.respFreq);
    VentSim.cycleTime = 60/VentSim.respFreq;
    $('#cycle_time_value').val(VentSim.cycleTime);
    $('#inspiratory_time_value').val(VentSim.inspTime);
    VentSim.expTime = VentSim.cycleTime - VentSim.inspTime;
    $('#expiratory_time_value').val(VentSim.expTime);
    $('#tidal_volume_value').val(VentSim.tidalVolume);
    $('#transairway_pressure_value').val(VentSim.transairwayPressure);
    $('#airways_resistance_value').val(VentSim.airwaysResistance);
    $('#respiratory_system_compliance_value').val(VentSim.respSysCompliance);
    $('#pressure_plateau_value').val(VentSim.pressurePlateau);
    $('#pip_value').val(VentSim.pip);
    
    // TODO: bind these the right way with MVC
    // Speed Button Trigger Events
    $('#increase_speed').click(function() {
        VentSim.speed = VentSim.speed - 50;
        $('#speed_value').val(VentSim.speed);
    });
    
    $('#decrease_speed').click(function() {
        VentSim.speed = VentSim.speed + 50;
        $('#speed_value').val(VentSim.speed);
    });
    
    // Insiratory Flow Rate Button Trigger Events
    $('#increase_inspiratory_flow_rate').click(function() {
        VentSim.inspFlowRate = VentSim.inspFlowRate + 5;
        $('#inspiratory_flow_rate_value').val(VentSim.inspFlowRate);
        VentSim.inspTime = VentSim.tidalVolume/(VentSim.inspFlowRate*1000/60); // need to convert flow rate to mL/sec from L/min
        $('#inspiratory_time_value').val(VentSim.inspTime);
        VentSim.expTime = VentSim.cycleTime - VentSim.inspTime;
        $('#expiratory_time_value').val(VentSim.expTime);
        
        // Update Pta - convert flow rate from L/min to L/sec
        VentSim.transairwayPressure = (VentSim.inspFlowRate/60) * (VentSim.airwaysResistance);
        $('#transairway_pressure_value').val(VentSim.transairwayPressure);
        
        // Update PIP - Pta + Pplateau
        VentSim.pip = VentSim.transairwayPressure + VentSim.pressurePlateau;
        $('#pip_value').val(VentSim.pip);
        
    });
    
    $('#decrease_inspiratory_flow_rate').click(function() {
        VentSim.inspFlowRate = VentSim.inspFlowRate - 5;
        $('#inspiratory_flow_rate_value').val(VentSim.inspFlowRate);
        VentSim.inspTime = VentSim.tidalVolume/(VentSim.inspFlowRate*1000/60); // need to convert flow rate to mL/sec from L/min
        $('#inspiratory_time_value').val(VentSim.inspTime);
        VentSim.expTime = VentSim.cycleTime - VentSim.inspTime;
        $('#expiratory_time_value').val(VentSim.expTime);
        
        // Update Pta - convert flow rate from L/min to L/sec
        VentSim.transairwayPressure = (VentSim.inspFlowRate/60) * (VentSim.airwaysResistance);
        $('#transairway_pressure_value').val(VentSim.transairwayPressure);
        
        // Update PIP - Pta + Pplateau
        VentSim.pip = VentSim.transairwayPressure + VentSim.pressurePlateau;
        $('#pip_value').val(VentSim.pip);
    });
    
     // Respiration Frequency Button Trigger Events
    $('#increase_respiratory_freq').click(function() {
        VentSim.respFreq = VentSim.respFreq + 1;
        $('#respiratory_freq_value').val(VentSim.respFreq);
        VentSim.cycleTime = 60/VentSim.respFreq;
        $('#cycle_time_value').val(VentSim.cycleTime);
        VentSim.inspTime = VentSim.tidalVolume/(VentSim.inspFlowRate*1000/60); // need to convert flow rate to mL/sec from L/min
        $('#inspiratory_time_value').val(VentSim.inspTime);
        VentSim.expTime = VentSim.cycleTime - VentSim.inspTime;
        $('#expiratory_time_value').val(VentSim.expTime);
        
    });
    
    $('#decrease_respiratory_freq').click(function() {
        VentSim.respFreq = VentSim.respFreq - 1;
        $('#respiratory_freq_value').val(VentSim.respFreq);
        VentSim.cycleTime = 60/VentSim.respFreq;
        $('#cycle_time_value').val(VentSim.cycleTime);
        VentSim.inspTime = VentSim.tidalVolume/(VentSim.inspFlowRate*1000/60); // need to convert flow rate to mL/sec from L/min
        $('#inspiratory_time_value').val(VentSim.inspTime);
        VentSim.expTime = VentSim.cycleTime - VentSim.inspTime;
        $('#expiratory_time_value').val(VentSim.expTime);
    });

    // Tidal Volume Button Trigger Events
   $('#increase_tidal_volume').click(function() {
        VentSim.tidalVolume = VentSim.tidalVolume + 25;
        $('#tidal_volume_value').val(VentSim.tidalVolume);
        VentSim.inspTime = VentSim.tidalVolume/(VentSim.inspFlowRate*1000/60); // need to convert flow rate to mL/sec from L/min
        $('#inspiratory_time_value').val(VentSim.inspTime);
        VentSim.expTime = VentSim.cycleTime - VentSim.inspTime;
        $('#expiratory_time_value').val(VentSim.expTime);

        // Update Pplateau - convert Crs to mL since tidal volume in mL
        VentSim.pressurePlateau = VentSim.tidalVolume / (VentSim.respSysCompliance*1000);
        $('#pressure_plateau_value').val(VentSim.pressurePlateau);
        
        // Update PIP - Pta + Pplateau
        VentSim.pip = VentSim.transairwayPressure + VentSim.pressurePlateau;
        $('#pip_value').val(VentSim.pip);
    });
    
    $('#decrease_tidal_volume').click(function() {
        VentSim.tidalVolume = VentSim.tidalVolume - 25;
        $('#tidal_volume_value').val(VentSim.tidalVolume);
        VentSim.inspTime = VentSim.tidalVolume/(VentSim.inspFlowRate*1000/60); // need to convert flow rate to mL/sec from L/min
        $('#inspiratory_time_value').val(VentSim.inspTime);
        VentSim.expTime = VentSim.cycleTime - VentSim.inspTime;
        $('#expiratory_time_value').val(VentSim.expTime);
        
        // Update Pplateau - convert Crs to mL since tidal volume in mL
        VentSim.pressurePlateau = VentSim.tidalVolume / (VentSim.respSysCompliance*1000);
        $('#pressure_plateau_value').val(VentSim.pressurePlateau);
        
        // Update PIP - Pta + Pplateau
        VentSim.pip = VentSim.transairwayPressure + VentSim.pressurePlateau;
        $('#pip_value').val(VentSim.pip);
    });
    
});

window.onload = function() {

    // Draw the flowScreen
    paper = new Raphael(document.getElementById('canvas_container'), 1150, 1125);
    flowScreen = paper.path("M25 25 l 1070 0 l 0 315 l -1070 0 z");
    flowScreen.attr({fill: '#fff', stroke: '#ddd', 'stroke-width': 5});
    
    // Draw the pressureScreen
    pressureScreen = paper.path("M25 400 l 1070 0 l 0 315 -1070 0 z");
    pressureScreen.attr({fill: '#fff', stroke: '#ddd', 'stroke-width': 5});
    
    // Draw the volumeScreen
    pressureScreen = paper.path("M25 775 l 1070 0 l 0 315 -1070 0 z");
    pressureScreen.attr({fill: '#fff', stroke: '#ddd', 'stroke-width': 5});

   
    // Start drawing the flow waveform
    path1 = paper.path("M50 50").attr({"stroke": "#f00", "stroke-width": parseInt(waveFormStrokeWidth)});
    path1.animate({path:"M50 50"}, 0, drawFlow);
    
    drawGrid();
 
}

function drawFlow(){
    
    if(DEBUG) console.log("in drawFlow with count " + count);
    
    if(count != 11) { // check if enough room to make another waveform
        
        // TODO: "freeze" the increments here, so there's no "jumping" in the graph
        // TODO: don't make the number of breaths per drawing fixed, should do this based on current xVal + wavelength, after you do the freezing
        
        // Flow Screen Waveform
        // up - decrease y
        if(DEBUG) console.log("increasing volume");
        if(DEBUG) console.log("M" + flow_xCoor + " " + flow_yCoor + " L " + flow_xCoor + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString()); //TODO: scale is 2.5 for the insp flow rate... need to not hard code this!!
        var incVol = paper.path("M" + flow_xCoor + " " + flow_yCoor).attr({"stroke": "#f00", "stroke-width":waveFormStrokeWidth});
        incVol.animate({path:"M" + flow_xCoor + " " + flow_yCoor + " L " + flow_xCoor + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString()}, VentSim.speed, function() {
            
            // over  - increase x to insp 
            if(DEBUG) console.log("start inhilation");
            if(DEBUG) console.log("M" + flow_xCoor + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString() + " L " + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString());
            var inhTime = paper.path("M" + flow_xCoor + " " + (parseInt(flow_yCoor-(VentSim.inspFlowRate*2.5))).toString()).attr({"stroke": "#f00", "stroke-width":waveFormStrokeWidth});
            inhTime.animate({path:"M" + flow_xCoor + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString() + " L " + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString()}, VentSim.speed, function() {
            
                // down - increase y
                if(DEBUG) console.log("decreasing volume");
                if(DEBUG) console.log("M" + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString() + " L " + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor)+50).toString());              
                var decVol = paper.path("M" + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString()).attr({"stroke": "#f00", "stroke-width":waveFormStrokeWidth});
                decVol.animate({path:"M" + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor - (VentSim.inspFlowRate*2.5))).toString() + " L " + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor)+50).toString()}, VentSim.speed, function() {
                
                    // back up - increase x, decrease y
                    if(DEBUG) console.log("start exhilation, flow_xCoor is " + flow_xCoor);
                    if(DEBUG) console.log("M" + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor)+50).toString() + " L " + ((parseInt(flow_xCoor))+(VentSim.cycleTime*25)).toString() + " " + flow_yCoor);
                    var expTime = paper.path("M" + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor)+50).toString()).attr({"stroke": "#f00", "stroke-width":waveFormStrokeWidth});
                    expTime.animate({path:"M" + ((parseInt(flow_xCoor))+ (VentSim.inspTime*25)).toString() + " " + (parseInt(flow_yCoor)+50).toString() + " L " + ((parseInt(flow_xCoor))+(VentSim.cycleTime*25)).toString() + " " + flow_yCoor}, VentSim.speed, drawFlow);
                    flow_xCoor = parseInt(flow_xCoor) + (VentSim.cycleTime*25);
                    count++;
                    
                });
            
            });   
            
        });
        
        // Pressure Screen Waveform
        // up - decrease y and increase x for insp time
        if(DEBUG) console.log("M" + pressure_xCoor + " " + pressure_yCoor +
            " L " + (pressure_xCoor + VentSim.inspTime*2.5) + " " + (parseInt(pressure_yCoor - (VentSim.pip*2.5))).toString()); //TODO: scale is 2.5 for the insp flow rate... need to not hard code this!!
        var incVol = paper.path("M" + pressure_xCoor + " " + pressure_yCoor).attr({"stroke": "#f00", "stroke-width":waveFormStrokeWidth});
        incVol.animate({path:"M" + pressure_xCoor + " " + pressure_yCoor +
                " L " + (((parseInt(pressure_xCoor)) + (VentSim.inspTime*25))).toString() + " " + (parseInt(pressure_yCoor - (VentSim.pip*2.5))).toString()}, VentSim.speed, function() {
        
            // quarter of a second pip drop - value is Praw for the drop
            /*
            DEBUG = true;
            if(DEBUG) console.log("M" + (((parseInt(pressure_xCoor)) + (VentSim.inspTime*25))).toString() + " " + (parseInt(pressure_yCoor - (VentSim.pip*2.5))).toString() +
                " L " + pressure_xCoor + " " + ((parseInt(pressure_yCoor - (VentSim.pip*2.5)))+(parseInt(5*2.5))).toString()); DEBUG = false;
            var inhTime = paper.path("M" + ((parseInt(pressure_xCoor)) + (VentSim.inspTime*25)).toString() + " " + (parseInt(pressure_yCoor - (VentSim.pip*2.5))).toString()).attr({"stroke": "#f00", "stroke-width":waveFormStrokeWidth});
            inhTime.animate({path:"M" + ((parseInt(pressure_xCoor)) + (VentSim.inspTime*25)).toString() + " " + (parseInt(pressure_yCoor - (VentSim.pip*2.5))).toString() +
                " L " + pressure_xCoor + " " + ((parseInt(pressure_yCoor - (VentSim.pip*2.5)))+(parseInt(5*2.5))).toString()}, VentSim.speed, function() {
                
            });
            */
			
           var inhTime = paper.path("M75 575").attr({"stroke": "#f00", "stroke-width": waveFormStrokeWidth});
           inhTime.animate({path:"M" +  + " 575 L 85 590"}, VentSim.speed, function(){});
           
        });

        pressure_xCoor = parseInt(pressure_xCoor) + (VentSim.cycleTime*25);

    }
    else {
        
        // Clear the flowScreen and re-draw
        paper.remove();
        paper = new Raphael(document.getElementById('canvas_container'), 1150, 1125);
        flowScreen = paper.path("M25 25 l 1070 0 l 0 315 l -1070 0 z");
        flowScreen.attr({fill: '#fff', stroke: '#ddd', 'stroke-width': 5});
        
        // Draw the pressureScreen
        pressureScreen = paper.path("M25 400 l 1070 0 l 0 315 -1070 0 z");
        pressureScreen.attr({fill: '#fff', stroke: '#ddd', 'stroke-width': 5});
        
        // Draw the volumeScreen
        pressureScreen = paper.path("M25 775 l 1070 0 l 0 315 -1070 0 z");
        pressureScreen.attr({fill: '#fff', stroke: '#ddd', 'stroke-width': 5});
        
        // Reset to start drawing
        count = 1;
        flow_yCoor = "200";
        flow_xCoor = "75";
        
        pressure_xCoor = "75";
        pressure_yCoor = "575";
        
        // Start drawing the flow waveform... again
        path1 = paper.path("M50 50").attr({"stroke": "#f00", "stroke-width": parseInt(waveFormStrokeWidth)});
        path1.animate({path:"M50 50"}, 0, drawFlow);
        
        drawGrid();
        
    }
    
    
    
}

function drawGrid(){
    
    // flowScreen labels
    txt = paper.text(10, 200, "L/min");
    txt.attr({transform: "r270"});
    
    // pressureScreen labels
    txt = paper.text(10, 550, "Pressure (cm H20)");
    txt.attr({transform: "r270"});
    
    // volumeScreen labels
    txt = paper.text(10, 950, "Liters");
    txt.attr({transform: "r270"});
    
    // Draw the horizontal grid for flowScreen
    var i;
    var yAxisLabel = 60;
    for(i=50; i < 325; i+=25){
        var horizontalGridLine = paper.path("M50 " + i + " l 1025 0");
        horizontalGridLine.attr("stroke", "#00f");
        if(i==200)
            horizontalGridLine.attr("stroke-width", "3");
        else
            horizontalGridLine.attr("stroke-width", "1");

        horizontalGridLine.attr("opacity", 0.5);
        
        paper.text(40,i,yAxisLabel); // Label for L/min
        yAxisLabel = yAxisLabel - 10;
    }
    
    // Draw the horizontal grid for pressureScreen
    var yAxisLabel = 60;
    for(i=425; i < 700; i+=25){
        var horizontalGridLine = paper.path("M50 " + i + " l 1025 0");
        horizontalGridLine.attr("stroke", "#00f");
        if(i==575)
            horizontalGridLine.attr("stroke-width", "3");
        else
            horizontalGridLine.attr("stroke-width", "1");

        horizontalGridLine.attr("opacity", 0.5);
        
        paper.text(40,i,yAxisLabel); // Label for L/min
        yAxisLabel = yAxisLabel - 10;
    }

    // Draw the vertical grid for flowScreen
    paper.text(75,315,0);
    var xAxisLabel = 0;
    for(i=50; i < 1100; i+=25){
        var verticalGridLine = paper.path("M" + i + " 50 l 0 250");
        verticalGridLine.attr("stroke", "#00f");
        verticalGridLine.attr("stroke-width", "1");
        verticalGridLine.attr("opacity", 0.5);
        if(i != 50 && xAxisLabel != 41) paper.text(i+25,315,xAxisLabel);
        xAxisLabel++;
    }
    
    // Draw the vertical grid for pressureScreen
    paper.text(75,690,0);
    var xAxisLabel = 0;
    for(i=50; i < 1100; i+=25){
        var verticalGridLine = paper.path("M" + i + " 425 l 0 250");
        verticalGridLine.attr("stroke", "#00f");
        verticalGridLine.attr("stroke-width", "1");
        verticalGridLine.attr("opacity", 0.5);
        if(i != 50 && xAxisLabel != 41) paper.text(i+25,690,xAxisLabel);
        xAxisLabel++;
    }
}