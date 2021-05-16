import { homedir } from 'os';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import logger from 'electron-timber';

const homePath : String = homedir()

let firstRun = false

if ( existsSync(`${homePath}\\.hyperbar`) ) {
    logger.log("Found hyper directoy on user home folder",  `${homePath}\\.hyperbar`)
} else {
    logger.log("First run detected! Creating hyper directory on", `${homePath}\\.hyperbar`)
    mkdirSync(`${homePath}\\.hyperbar`)
    logger.log("Creating widgets folder")
    mkdirSync(`${homePath}\\.hyperbar\\widgets`)
    logger.log("Creating themes folder")
    mkdirSync(`${homePath}\\.hyperbar\\themes`)
    firstRun = true
}

if (firstRun || !existsSync(`${homePath}\\.hyperbar\\config.yaml`)) {
    logger.log("Config file not found: Creating base config file on home directory")
    writeFileSync(`${homePath}\\.hyperbar\\config.yaml`, readFileSync('./src/defaultConfig.yaml').toString())
}