document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    document.getElementById("generate").addEventListener("click", function () {
        generateMandelbrotSet();
    });

    document.getElementById("download").addEventListener("click", function () {
        var link = document.createElement("a");
        link.download = `Mandelbrot Set (res${CurrentResolution}, iter${maxIteration}).png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});

let maxIteration = 500;

function mandRec(z, c, iteration) {
    try {
        var ret = [z[0] ** 2 - z[1] ** 2 + c[0], 2 * z[0] * z[1] + c[1]];
        if (!Number.isFinite(ret[0]) || !Number.isFinite(ret[1])) {
            throw new Error("Resulting values are not finite");
        }
        if (iteration > maxIteration) {
            return iteration;
        }
        return mandRec(ret, c, iteration + 1);
    } catch (error) {
        return iteration;
    }
}

function mandFor(c) {  //Using for loops instead of recursion
    var ret = [0, 0];
    for (let i = 0; i <= maxIteration; i++) {
        ret = [ret[0] ** 2 - ret[1] ** 2 + c[0], 2 * ret[0] * ret[1] + c[1]];
        if (!Number.isFinite(ret[0]) || !Number.isFinite(ret[1])) {
            return i;
        }
    }
    return maxIteration;
}


let RunningIntervalID = null;
let CurrentResolution = null;




function generateMandelbrotSet() {
    const resolution = parseInt(document.getElementById("resolution").value);
    maxIteration = parseInt(document.getElementById("iterations").value);
    const factorR = parseFloat(document.getElementById("r-factor").value);
    const factorG = parseFloat(document.getElementById("g-factor").value);
    const factorB = parseFloat(document.getElementById("b-factor").value);

    let counter = 0;

    let x, y;
    var outSize = [6, 6];
    var outPos = [0.75, 0];
    var res = [resolution, resolution];
    var maxTimes = res[0] * res[1];
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    //var butchSize = Math.round(20000/maxIteration);
    var butchSize = 40;

    canvas.width = resolution;
    canvas.height = resolution;
    CurrentResolution = resolution;

    let btnText = document.getElementById("generate").textContent;
    if (btnText == "Stop") {
        clearInterval(RunningIntervalID);
        deleteProgress();
        document.getElementById("generate").textContent = "Generate";
        return;
    }
    document.getElementById("generate").textContent = "Stop";

    const intervalId = setInterval(() => {
        let tempcol;
        for (let i = 0; i < butchSize; i++) {

            ix = Math.floor(counter / res[1]);
            iy = counter % res[1];
            tempcol = drawPixel(ix, iy);
            if (!(res[1] % 2 == 1 && iy == Math.round(res[1] / 2))) {
                setPixel(ix, res[1] - iy - 1, tempcol);
            }
            if (iy == Math.round(res[1] / 2) - 1) {
                counter += Math.round((res[1] - 1) / 2);
            } else {
                counter += 1;
            }
            if (counter >= maxTimes) {
                clearInterval(intervalId);
                deleteProgress();
                document.getElementById("generate").textContent = "Generate";
                return;
            }
        }
        updateProgress(ix, iy);
    }, 0);
    RunningIntervalID = intervalId;


    function setPixel(x, y, c) {
        var imageData = ctx.createImageData(1, 1);
        var data = imageData.data;
        data[0] = c[0];
        data[1] = c[1];
        data[2] = c[2];
        data[3] = 255;
        ctx.putImageData(imageData, x, y);
    }

    function drawPixel(ix, iy) {
        x = ((ix + 0.5 - res[0] / 2) * outSize[0]) / (res[0] * 2) - outPos[0];
        y = ((iy + 0.5 - res[1] / 2) * outSize[1]) / (res[1] * 2) - outPos[1];
        s = mandFor([x, y]);
        var col = calculateColour(s);
        setPixel(ix, iy, col);
        return col;
    }

    function calculateColour(z) {
        var r = Math.round(255 * Math.pow(z / maxIteration, factorR));
        var g = Math.round(255 * Math.pow(z / maxIteration, factorG));
        var b = Math.round(255 * Math.pow(z / maxIteration, factorB));
        return [r, g, b];
    }

    function deleteProgress() {
        var btn = document.getElementById("download");
        btn.textContent = "Download";
        btn.disabled = false;
    }

    function updateProgress(ix, iy) {
        var x = ix / res[0];
        var y = 2 * iy / res[1];
        var prog = x + y / res[0];
        var btn = document.getElementById("download");
        btn.textContent = `${Math.round(1000000 * prog) / 10000}%`;
        btn.disabled = true;
    }
}
