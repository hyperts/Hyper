import { homedir } from 'os';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import Zip from 'adm-zip'

const homePath : String = homedir()

let firstRun = false

if ( !existsSync(`${homePath}\\.hyperbar`) ) {
    mkdirSync(`${homePath}\\.hyperbar`)
    mkdirSync(`${homePath}\\.hyperbar\\widgets`)
    mkdirSync(`${homePath}\\.hyperbar\\themes`)
    const zipFile = new Zip(`${__dirname}\\assets\\defaultmodules.zip`)
    zipFile.extractAllTo(`${homePath}\\.hyperbar`, true)
}

if (firstRun || !existsSync(`${homePath}\\.hyperbar\\config.yaml`)) {
    writeFileSync(`${homePath}\\.hyperbar\\config.yaml`, readFileSync(`${__dirname}/assets/defaultConfig.yaml`).toString())
}