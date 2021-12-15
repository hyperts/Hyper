import { homedir } from 'os';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import log from 'electron-log'
import Zip from 'adm-zip'

const homePath : String = homedir()
const logger = log.scope('DIRECTORY')

let firstRun = false

if ( existsSync(`${homePath}\\.hyperbar`) ) {
    logger.info('Hyper directory alredy exists - Skipping first steps')
} else {
    logger.debug(`First run detected! Creating hyper directories on: ${homePath}\\.hyperbar`)
    mkdirSync(`${homePath}\\.hyperbar`)
    mkdirSync(`${homePath}\\.hyperbar\\widgets`)
    mkdirSync(`${homePath}\\.hyperbar\\themes`)
    const zipFile = new Zip(`${__dirname}\\assets\\defaultmodules.zip`)
    zipFile.extractAllTo(`${homePath}\\.hyperbar`, true)
}

if (firstRun || !existsSync(`${homePath}\\.hyperbar\\config.yaml`)) {
    logger.debug("Config file not found: Creating base config file on home directory")
    writeFileSync(`${homePath}\\.hyperbar\\config.yaml`, readFileSync(`${__dirname}/assets/defaultConfig.yaml`).toString())
}