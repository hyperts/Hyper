import { screen } from 'electron';
import { Config } from '../shared/config';

export function stringToHex(color: string){
    return Number(color.replace("#", "0x")) || 0x000000
}

export function generateBounds() {
    const configSizes = new Config("appearence.items.sizes.fields")
    const configDock = new Config("general.items.position.fields")

    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    console.log("Screen size:", width, height)

    const dockedTop = configDock.get('dock-pos.value') == "top"
    const barHeight = Number(configSizes.get("height.value"))
    const horizontalMargin = Number(configDock.get("horizontal-margin.value"))
    const verticalMargin = Number(configDock.get("vertical-margin.value"))

    console.log("Sizes", dockedTop, barHeight, horizontalMargin, verticalMargin)

    const calculated = {
        width: width - horizontalMargin * 2,
        height: barHeight,
        x: horizontalMargin,
        y: dockedTop 
            ? verticalMargin
            // I don't know why 9, ask microsoft
            : height - barHeight - 9 - verticalMargin 
    }

    console.log("Calculated bounds:", calculated)

    return calculated

}