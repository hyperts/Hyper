import { screen } from 'electron';
import log from 'electron-log'
import {homedir} from 'os'
import {join, resolve} from 'path'
import { execSync, execFile } from 'child_process'

import { Config } from './src/shared/config';
import { Logger } from './src/shared/logger';
const logger = new Logger('WINDOW MANAGER')

log.transports.file.resolvePath = () => join(homedir(), '.hyperlogs/main.log');

export function stringToHex(color: string){
    return Number(color.replace("#", "0x")) || 0x000000
}

export function generateBounds() {
    const configSizes = new Config("appearence.items.sizes.fields")
    const configDock = new Config("general.items.position.fields")

    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    logger.debug(`Detected Sreen Size: ${width}x${height}`)

    const dockedTop = configDock.get('dock-pos.value') == "top"
    const barHeight = Number(configSizes.get("height.value"))
    const horizontalMargin = Number(configDock.get("horizontal-margin.value"))
    const verticalMargin = Number(configDock.get("vertical-margin.value"))

    const calculated = {
        width: width - horizontalMargin * 2,
        height: barHeight,
        x: horizontalMargin,
        y: dockedTop
            ? barHeight < 39 
                ? barHeight - 39 + verticalMargin
                : verticalMargin
            // I don't know why 11, ask microsoft
            : height - barHeight - verticalMargin 
    }

    return calculated

}

export function removeAppBar(){
    const exeLocation = resolve(__dirname, 'bin', 'Hyper Spacer.exe')
    endAppBar()
    execFile(`${exeLocation}`, ["0"]) // Change size or set to 0
}

export function endAppBar() {
    try { execSync('taskkill /T /F /IM "Hyper Spacer.exe"') } catch {logger.info("Hyper Spacer is not running") }
}

export function makeAppBar() {
    const promise = new Promise((resolvePromise, rejectPromise) => {

        const config = new Config()
        const shouldDock = config.getValue('general', 'behavior', 'reserve-space')
        const reservedSpace = config.getValue('appearence', 'sizes', 'height') as number
        const reservedMargin = config.getValue('general', 'position', 'vertical-margin') as number
        const dockPos = config.getValue('general', 'position', 'dock-pos')
        logger.info("Initializing space reservation")
        endAppBar()
        setTimeout(()=>{
            const exeLocation = resolve(__dirname, 'bin', 'Hyper Spacer.exe')
            execFile(`${exeLocation}`, [String(reservedSpace + reservedMargin * 2),`${shouldDock ? dockPos == "top" ? 'Top' : 'Bottom' : 0}`]) // Change size or set to 0
            logger.success("Space reserved!", String(reservedSpace + reservedMargin * 2),`${shouldDock ? dockPos == "top" ? 'Top' : 'Bottom' : 0}`)
            resolvePromise(true)
        }, 100)
    })

    return promise
}