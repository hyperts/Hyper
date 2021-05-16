import { homedir } from 'os';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
const homePath : String = homedir()

let firstRun = false

if ( existsSync(`${homePath}\\.hyperbar`) ) {
    console.log("Found hyper directoy on user home folder",  `${homePath}\\.hyperbar`)
} else {
    console.log("First run detected! Creating hyper directory on", `${homePath}\\.hyperbar`)
    mkdirSync(`${homePath}\\.hyperbar`)
    console.log("Creating widgets folder")
    mkdirSync(`${homePath}\\.hyperbar\\widgets`)
    console.log("Creating themes folder")
    mkdirSync(`${homePath}\\.hyperbar\\themes`)
    firstRun = true
}

if (firstRun || !existsSync(`${homePath}\\.hyperbar\\config.yaml`)) {
    console.log("Config file not found: Creating base config file on home directory")
    writeFileSync(`${homePath}\\.hyperbar\\config.yaml`, readFileSync('./src/defaultConfig.yaml').toString())
}