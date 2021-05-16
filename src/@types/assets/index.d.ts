interface ConfigField {
    name: string,
    description: string,
    type: string,
    value: any
}

interface ConfigItem {
    name: string,
    description: string,
    icon: string,
    fields: Array<ConfigField>
}

interface ConfigEntry {
    name: string,
    type: string,
    items: Array<ConfigItem>
}