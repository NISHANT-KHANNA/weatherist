const http = require("http");
const fs = require("fs");
const requests = require('requests');


const homeFile = fs.readFileSync("index.html", "utf-8");
const styleFile = fs.readFileSync("style.css", "utf-8");
const searchFile = fs.readFileSync("search.html", "utf-8");
const styleHome = fs.readFileSync("styleHome.css","utf-8");

const replaceValue = (htmlFile, apiData) => {
    let temperature = htmlFile.replace("{%cityName%}", apiData.name);
    temperature = temperature.replace("{%tempStatus%}", apiData.weather[0].main);
    temperature = temperature.replace("{%tempVal%}", Math.round(apiData.main.temp));
    temperature = temperature.replace("{%minTemp%}", Math.round(apiData.main.temp_min));
    temperature = temperature.replace("{%maxTemp%}", Math.round(apiData.main.temp_max));
    temperature = temperature.replace("{%realValue%}", Math.round(apiData.main.feels_like));
    temperature = temperature.replace("{%pressureValue%}", Math.round(apiData.main.pressure));
    temperature = temperature.replace("{%humidityValue%}", Math.round(apiData.main.humidity));
    temperature = temperature.replace("{%windValue%}", apiData.wind.speed);
    return temperature;
}

const server = http.createServer((req, res) => {
     if (req.url.startsWith("/?city=")) {
        const cityName = req.url.split("=")[1];

        requests(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=9a36af4ec3b9586f42686d01a7192ab1`)
            .on('data', (chunk) => {
                const objData = JSON.parse(chunk);
                const realData = replaceValue(homeFile, objData);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(realData);
                res.end();
            })
            .on('end', (err) => {
                if (err) {
                    console.log('connection closed due to errors', err);
                }
            });
    }
     else if (req.url == "/") {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(searchFile);
    }
     else if (req.url == "/style.css") {
        // Serve the CSS file
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(styleFile);
    }
     else if (req.url == "/styleHome.css") {
        // Serve the CSS file
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end(styleHome);
    } 
    else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('Invalid Request');
    }
});

const port = process.env.PORT || 8000;
server.listen(port, "0.0.0.0", () => {
    console.log(`Server is listening on port ${port}`);
});