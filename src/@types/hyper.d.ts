
export type ConfigTable = {
  [key: string]: ConfigCategory
}

export type ConfigCategory = {
  name: string
  items: {
      [key: string] : ConfigItem
  }
}

export type ConfigItem = {
    name: string
    description: string,
    icon: string
    fields: {
        [key: string]: ConfigField
    }
}

export type ConfigField = {
  name: string
  description: string
  value: boolean | number | string
} & ({ 
  type: "selection"
  options: string[]
} | {
  type: "checkbox" | "number" | "color" | "text"
  options?: string[]
})
