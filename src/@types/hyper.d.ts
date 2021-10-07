
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

export type HSWWData = {
  Event: "window.openened" | "window.close" | "window.renamed"
  ProcessId: number
  Name: string
  WindowHandle: string // We cast this as string, because node -> win32 FFI is weird.
}